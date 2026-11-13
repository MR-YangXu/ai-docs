import {
  readFile,
  writeFile,
  mkdir,
  readdir,
  lstat,
  rm,
} from "node:fs/promises";
import { resolve, relative, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

const root = fileURLToPath(new URL("..", import.meta.url));
const position = process.argv.indexOf("--source");
if (position < 0 || !process.argv[position + 1])
  throw new Error("请指定 --source ../ai-frontend");
const source = resolve(process.argv[position + 1]);
const destination = join(root, "vendor/admin");
const scopes = ["components", "hooks", "logic", "utils", "types"];
const files = new Map();
files.set("LICENSE", await readFile(join(source, "LICENSE")));
async function collect(directory, prefix) {
  for (const item of (await readdir(directory)).sort()) {
    const path = join(directory, item),
      name = `${prefix}/${item}`;
    const stat = await lstat(path);
    if (stat.isSymbolicLink())
      throw new Error(`源码快照不接受符号链接：${name}`);
    if (stat.isDirectory()) await collect(path, name);
    else if (stat.isFile()) files.set(name, await readFile(path));
  }
}
for (const stack of ["vue2-js", "vue3-ts", "react-ts"]) {
  const base = join(source, "content/templates/admin", stack);
  for (const scope of scopes) {
    try {
      await collect(join(base, scope), `${stack}/${scope}`);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  for (const name of ["manifest.json", "README.md"])
    files.set(`${stack}/${name}`, await readFile(join(base, name)));
  const manifest = JSON.parse(files.get(`${stack}/manifest.json`));
  for (const item of Object.values(manifest.items))
    for (const name of item.files)
      if (!files.has(`${stack}/${name}`))
        throw new Error(`清单文件缺失：${stack}/${name}`);
}
const hash = (data) => createHash("sha256").update(data).digest("hex");
const git = (...args) =>
  execFileSync("git", ["-C", source, ...args], { encoding: "utf8" }).trim();
const pkg = JSON.parse(await readFile(join(source, "package.json"), "utf8"));
const sourcePackages = {};
for (const stack of ["vue2-js", "vue3-ts", "react-ts"]) {
  sourcePackages[stack] = JSON.parse(
    await readFile(
      join(source, "content/templates/admin", stack, "package.json"),
      "utf8"
    )
  );
}
const metadata = {
  repository: pkg.repository?.url,
  commit: git("rev-parse", "HEAD"),
  package: pkg.name,
  version: pkg.version,
  dirty: Boolean(git("status", "--porcelain")),
  sourcePackages,
  files: Object.fromEntries([...files].map(([p, b]) => [p, hash(b)])),
};
let previous;
try {
  previous = JSON.parse(
    await readFile(join(destination, "snapshot.json"), "utf8")
  );
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
// 快照应只通过同步更新；本地修改先由维护者确认，避免静默覆盖。
for (const [name, digest] of Object.entries(previous?.files ?? {})) {
  if (
    name.includes("..") ||
    relative(destination, resolve(destination, name)).startsWith("..")
  )
    throw new Error("无效快照路径");
  try {
    if (hash(await readFile(join(destination, name))) !== digest)
      throw new Error(`快照已手动修改：${name}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
for (const [name, body] of files) {
  const target = join(destination, name);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, body);
}
for (const name of Object.keys(previous?.files ?? {}))
  if (!files.has(name)) await rm(join(destination, name), { force: true });
await writeFile(
  join(destination, "snapshot.json"),
  JSON.stringify(metadata, null, 2) + "\n"
);
console.log(
  `已同步 ${files.size} 个文件 · ${metadata.commit.slice(0, 7)} · 包 ${
    metadata.version
  }${metadata.dirty ? "（含未提交改动）" : ""}`
);
