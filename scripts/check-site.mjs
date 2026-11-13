import { readFile, access } from "node:fs/promises";
import { resolve } from "node:path";
import { catalog } from "../catalog/components.mjs";

const base = process.env.DOCS_BASE || "/";
const root = resolve(".vitepress/dist");
const paths = [
  "/components/",
  "/components/maintenance",
  "/components/verification",
  ...["vue2", "vue3", "react"].map((stack) => `/components/${stack}/`),
  ...catalog.map((entry) => entry.route),
];
const cache = new Map();
async function html(path) {
  const file = path.endsWith("/")
    ? `${path}index.html`
    : path.endsWith(".html")
    ? path
    : `${path}.html`;
  if (!cache.has(file))
    cache.set(file, await readFile(resolve(root, `.${file}`), "utf8"));
  return cache.get(file);
}
let links = 0;
for (const path of paths) {
  const body = await html(path);
  for (const match of body.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = match[1].replaceAll("&amp;", "&");
    if (!value.startsWith("/") && !value.startsWith("#")) continue;
    const url = new URL(value, `https://local.invalid${base}${path.slice(1)}`);
    if (url.origin !== "https://local.invalid") continue;
    if (!url.pathname.startsWith(base))
      throw new Error(`链接未应用 DOCS_BASE：${path} → ${value}`);
    const pathname = url.pathname.slice(base.length - 1);
    if (pathname.startsWith("/components/") || pathname === "/") {
      const target = await html(pathname);
      const id = decodeURIComponent(url.hash.slice(1));
      if (id && !target.includes(`id="${id}"`))
        throw new Error(`无效锚点：${path} → ${value}`);
    } else if (/\.[a-z\d]+$/i.test(pathname))
      await access(resolve(root, `.${decodeURIComponent(pathname)}`));
    links++;
  }
}
console.log(
  `静态站点检查通过：${paths.length} 页 / ${links} 个内部链接与资源引用 · base=${base}`
);
