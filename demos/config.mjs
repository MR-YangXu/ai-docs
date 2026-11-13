import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import vue3 from "@vitejs/plugin-vue";
import { stacks } from "../catalog/components.mjs";
export const root = fileURLToPath(new URL("..", import.meta.url));
export async function demoConfig(stack, base = "/") {
  const directory = resolve(root, "demos", stack);
  const require = createRequire(resolve(directory, "package.json"));
  const vue2 =
    stack === "vue2"
      ? (await import(require.resolve("@vitejs/plugin-vue2"))).default
      : null;
  const alias = [
    {
      find: "@",
      replacement: resolve(root, "vendor/admin", stacks[stack].source),
    },
  ];
  if (stack === "vue2")
    alias.push({
      find: /^element-ui$/,
      replacement: require.resolve("element-ui"),
    });
  for (const dependency of stack === "react"
    ? ["react", "react-dom"]
    : ["vue"]) {
    alias.push({
      find: new RegExp(`^${dependency}$`),
      replacement: require.resolve(
        dependency === "vue" && stack === "vue2"
          ? "vue/dist/vue.esm.js"
          : dependency
      ),
    });
  }
  return {
    root: directory,
    configFile: false,
    base: `${base}demos/${stack}/`,
    plugins: stack === "react" ? [] : [stack === "vue2" ? vue2() : vue3()],
    resolve: {
      alias,
      dedupe: stack === "react" ? ["react", "react-dom"] : ["vue"],
    },
    esbuild: { jsx: "automatic" },
    server: { host: "127.0.0.1", port: 0, fs: { allow: [root] } },
    build: {
      outDir: resolve(root, "docs/public/demos", stack),
      emptyOutDir: true,
      chunkSizeWarningLimit: 1500,
    },
  };
}
