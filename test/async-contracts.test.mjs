import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};

// 运行真实快照控制器；TypeScript 仅转译，不替换实现或请求状态逻辑。
for (const stack of ["vue2-js", "vue3-ts", "react-ts"]) {
  const source = await readFile(
    new URL(
      `../vendor/admin/${stack}/utils/adminCore.${
        stack === "vue2-js" ? "js" : "ts"
      }`,
      import.meta.url
    ),
    "utf8"
  );
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const {
    createListController,
    createOptionsController,
    createActionController,
  } = await import(
    `data:text/javascript;base64,${Buffer.from(code).toString(
      "base64"
    )}#${stack}`
  );

  test(`${stack}：旧响应失效，卸载取消当前请求`, async () => {
    const requests = [];
    const list = createListController(
      { page: 1 },
      {
        initialQuery: { page: 1 },
        keepPrevious: true,
        fetchList: (query, signal) => {
          const pending = deferred();
          requests.push({ ...pending, signal, query });
          return pending.promise;
        },
      }
    );
    const first = list.onSubmit({ keyword: "旧条件" });
    const second = list.onSubmit({ keyword: "新条件" });
    assert.equal(requests[0].signal.aborted, true);
    requests[1].resolve({ list: ["新结果"], total: 1 });
    await second;
    requests[0].resolve({ list: ["旧结果"], total: 1 });
    await first;
    assert.deepEqual(list.getSnapshot().tableData, ["新结果"]);
    assert.equal(list.getSnapshot().loading, false);
    const third = list.getData();
    list.dispose();
    assert.equal(requests[2].signal.aborted, true);
    requests[2].resolve({ list: ["销毁后结果"], total: 1 });
    await third;
    assert.deepEqual(list.getSnapshot().tableData, ["新结果"]);
  });

  test(`${stack}：失败后可重试，过滤条件整组替换，重置恢复初值`, async () => {
    let fail = true;
    const initial = { page: 1, page_size: 10, filters: { status: "all" } };
    const list = createListController(initial, {
      initialQuery: initial,
      isRefreshData: false,
      fetchList: async () => {
        if (fail) throw new Error("模拟失败");
        return { list: [1], total: 1 };
      },
    });
    assert.equal(await list.getData(), undefined);
    assert.match(list.getSnapshot().error.message, /模拟失败/);
    fail = false;
    await list.onSubmit({ filters: { owner: 0 } });
    assert.deepEqual(list.getSnapshot().query.filters, { owner: 0 });
    assert.equal(list.getSnapshot().error, null);
    await list.reset();
    assert.deepEqual(list.getSnapshot().query, initial);
    assert.deepEqual(list.getSnapshot().tableData, []);
    list.dispose();
  });

  test(`${stack}：选项仅提交最新响应，同步回填覆盖异步，失败可恢复`, async () => {
    const writes = [];
    const options = createOptionsController((field, value) =>
      writes.push([field, value])
    );
    const map = { key: "name", value: "id" };
    const old = deferred();
    const request = options.loadFieldOptions("owner", () => old.promise, map);
    options.setFieldOptions("owner", [{ name: "回填", id: 0 }], map);
    old.resolve([{ name: "旧结果", id: 1 }]);
    await request;
    assert.deepEqual(writes, [["owner", [{ label: "回填", value: 0 }]]]);
    await assert.rejects(
      options.loadFieldOptions(
        "owner",
        async () => {
          throw new Error("失败");
        },
        map
      )
    );
    await options.loadFieldOptions(
      "owner",
      async () => [{ name: "恢复", id: false }],
      map
    );
    assert.equal(writes.at(-1)[1][0].value, false);
    const pending = deferred();
    const last = options.loadFieldOptions("owner", () => pending.promise, map);
    options.dispose();
    pending.resolve([{ name: "卸载", id: 2 }]);
    await last;
    assert.equal(writes.length, 2);
  });

  test(`${stack}：同键操作去重，失败不刷新，卸载不提示成功`, async () => {
    let calls = 0,
      refreshes = 0,
      notices = 0;
    const task = deferred();
    const action = createActionController(
      () => {
        refreshes++;
      },
      () => {
        notices++;
      }
    );
    const run = () => {
      calls++;
      return task.promise;
    };
    const first = action.exec(run, "成功", "save");
    const repeated = action.exec(run, "成功", "save");
    assert.equal(first, repeated);
    await Promise.resolve();
    assert.equal(calls, 1);
    task.resolve("完成");
    assert.equal(await first, "完成");
    assert.equal(refreshes, 1);
    await assert.rejects(
      action.exec(async () => {
        throw new Error("失败");
      })
    );
    assert.equal(refreshes, 1);
    const pending = deferred();
    const last = action.exec(() => pending.promise, "成功");
    await Promise.resolve();
    action.dispose();
    pending.resolve("已卸载");
    await assert.rejects(last, { name: "AbortError" });
    assert.equal(refreshes, 1);
    assert.equal(notices, 1);
  });
}
