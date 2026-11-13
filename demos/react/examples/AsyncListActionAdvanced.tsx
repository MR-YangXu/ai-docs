import { useState } from "react";
import { useAsyncListAction, isAbortError } from "@/hooks/useAsyncListAction";
import { wait } from "../../shared/mock";
export default function Example() {
  const [fail, setFail] = useState(false),
    [calls, setCalls] = useState(0),
    [refreshes, setRefreshes] = useState(0),
    [message, setMessage] = useState("");
  const { exec, pendingKeys } = useAsyncListAction(() => {
    setRefreshes((n) => n + 1);
  });
  async function run() {
    setMessage("");
    try {
      await exec(
        async (signal) => {
          setCalls((n) => n + 1);
          await wait(650, signal);
          if (fail) throw new Error("模拟操作失败");
        },
        "处理成功",
        "row-1"
      );
      setMessage("已完成");
    } catch (error) {
      if (!isAbortError(error)) setMessage(String(error));
    }
  }
  return (
    <>
      <div className="demo-actions">
        <button onClick={() => run()}>执行操作</button>
        <button
          onClick={() => {
            void run();
            void run();
          }}
        >
          同键连续执行两次
        </button>
        <label>
          <input
            type="checkbox"
            checked={fail}
            onChange={(e) => setFail(e.target.checked)}
          />
          模拟失败
        </label>
      </div>
      <p className="demo-note">
        在 Ant Design App 上下文中使用。同键操作共用请求，成功后调用刷新。
      </p>
      <pre className="demo-output" aria-label="操作状态">
        {JSON.stringify({ calls, refreshes, pendingKeys, message }, null, 2)}
      </pre>
    </>
  );
}
