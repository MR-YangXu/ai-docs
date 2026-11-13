import { readFile, access, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { catalog, stacks, publicSubentries } from "../catalog/components.mjs";
const root = fileURLToPath(new URL("..", import.meta.url));
// 技术栈目录中的正文、折叠说明与示例引用只能描述当前栈。
// 跨栈对比放在组件中心总览或维护页，不放在单栈接入文档中。
const foreignStackPatterns = {
  vue2: /\breact\b|\bvue[\s-]*3\b|\belement[\s-]*plus\b|\bant[\s-]*design\b|\bantd\b/i,
  vue3: /\breact\b|\bvue[\s-]*2\b|\belement[\s-]*ui\b|\bant[\s-]*design\b|\bantd\b/i,
  react: /\bvue\b|\bvue[\s-]*[23]\b|\.vue\b|\belement[\s-]*(?:ui|plus)\b/i,
};
let stackDocs = 0;
async function checkStackDocs(stack, directory) {
  for (const item of await readdir(resolve(root, directory), { withFileTypes: true })) {
    const path = `${directory}/${item.name}`;
    if (item.isDirectory()) {
      await checkStackDocs(stack, path);
    } else if (item.name.endsWith(".md")) {
      const lines = (await readFile(resolve(root, path), "utf8")).split("\n");
      for (const [index, line] of lines.entries()) {
        const match = line.match(foreignStackPatterns[stack]);
        if (match)
          throw new Error(
            `技术栈说明混入：${path}:${index + 1} 出现“${match[0]}”，本页只应说明 ${stacks[stack].name}`
          );
      }
      stackDocs++;
    }
  }
}
for (const stack of Object.keys(stacks))
  await checkStackDocs(stack, `docs/components/${stack}`);
const metadata = JSON.parse(
  await readFile(resolve(root, "vendor/admin/snapshot.json"), "utf8")
);
for (const [path, expected] of Object.entries(metadata.files)) {
  const body = await readFile(resolve(root, "vendor/admin", path));
  if (createHash("sha256").update(body).digest("hex") !== expected)
    throw new Error(`源码快照漂移：${path}，请从来源仓库同步`);
}
for (const [stack, info] of Object.entries(stacks)) {
  const manifest = JSON.parse(
    await readFile(
      resolve(root, "vendor/admin", info.source, "manifest.json"),
      "utf8"
    )
  );
  for (const name of Object.keys(manifest.items).filter(
    (name) => !name.startsWith("_")
  ))
    if (
      !catalog.some((entry) => entry.stack === stack && entry.install === name)
    )
      throw new Error(`缺少能力文档：${stack}/${name}`);
}
for (const item of publicSubentries) {
  const entry = catalog.find(
    (entry) => entry.stack === item.stack && entry.slug === item.slug
  );
  if (!entry) throw new Error(`公开子入口缺少文档：${item.name}`);
  await access(
    resolve(root, "vendor/admin", stacks[item.stack].source, item.source)
  );
  const doc = await readFile(resolve(root, `docs${entry.route}.md`), "utf8");
  if (!doc.includes(item.name))
    throw new Error(`文档未说明公开子入口：${item.name}`);
}
const ids = new Set();
for (const entry of catalog) {
  const doc = await readFile(resolve(root, `docs${entry.route}.md`), "utf8");
  for (const section of ["## 接入", "## 交互示例", "## API", "## 常见问题"])
    if (!doc.includes(section))
      throw new Error(`缺少文档章节：${entry.route} ${section}`);
  for (const demo of entry.demos) {
    const key = `${entry.stack}/${demo.id}`;
    if (ids.has(key)) throw new Error(`重复示例：${key}`);
    ids.add(key);
    if (!doc.includes(`id="${demo.id}"`))
      throw new Error(`文档未展示示例：${key}`);
    const body = await readFile(resolve(root, demo.file), "utf8");
    if (!body.includes("@/")) throw new Error(`示例未引用快照源码：${key}`);
  }
}
console.log(
  `组件检查通过：${catalog.length} 篇能力文档 / ${stackDocs} 篇技术栈文档隔离 / ${ids.size} 个示例 / ${
    Object.keys(metadata.files).length
  } 个源码文件`
);
