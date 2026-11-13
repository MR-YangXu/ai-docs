import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, dirname, relative, extname } from "node:path";
import { createHighlighter } from "shiki";
import { catalog } from "../catalog/components.mjs";
const root = fileURLToPath(new URL("..", import.meta.url));
export async function generateSnippets() {
  const highlighter = await createHighlighter({
    themes: ["github-light", "github-dark"],
    langs: ["vue", "tsx", "typescript", "javascript", "css"],
  });
  const target = resolve(root, ".generated/snippets");
  await mkdir(target, { recursive: true });
  for (const entry of catalog)
    for (const demo of entry.demos) {
      const files = [];
      const seen = new Set();
      async function add(path) {
        if (seen.has(path)) return;
        seen.add(path);
        const code = await readFile(path, "utf8");
        const language = {
          ".vue": "vue",
          ".tsx": "tsx",
          ".ts": "typescript",
          ".js": "javascript",
          ".css": "css",
        }[extname(path)];
        files.push({
          name: relative(resolve(root, "demos", entry.stack), path),
          code,
          html: highlighter.codeToHtml(code, {
            lang: language,
            themes: { light: "github-light", dark: "github-dark" },
          }),
        });
        // TypeScript 示例引用 JavaScript 模拟请求时，也展示相邻声明文件。
        if (extname(path) === ".js") {
          const declaration = path.slice(0, -3) + ".d.ts";
          try {
            await readFile(declaration);
            await add(declaration);
          } catch (error) {
            if (error.code !== "ENOENT") throw error;
          }
        }
        for (const match of code.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
          const imported = resolve(dirname(path), match[1]);
          if (!imported.startsWith(resolve(root, "demos") + "/"))
            throw new Error("示例依赖越界");
          let found = false;
          for (const suffix of ["", ".ts", ".js", ".vue", ".tsx"]) {
            try {
              await readFile(imported + suffix);
              await add(imported + suffix);
              found = true;
              break;
            } catch (error) {
              if (error.code !== "ENOENT" && error.code !== "EISDIR")
                throw error;
            }
          }
          if (!found) throw new Error(`示例依赖缺失：${match[1]}`);
        }
      }
      await add(resolve(root, demo.file));
      await writeFile(
        resolve(target, `${entry.stack}-${demo.id}.json`),
        JSON.stringify(files)
      );
    }
  highlighter.dispose();
}
