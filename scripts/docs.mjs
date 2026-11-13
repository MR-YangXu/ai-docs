import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const root = fileURLToPath(new URL("..", import.meta.url));
if (Number(process.versions.node.split(".")[0]) < 20)
  throw new Error("文档中心需要 Node.js 20+。请执行 nvm use 后重试。");
const { build, createServer } = await import("vite");
const { demoConfig } = await import("../demos/config.mjs");
const { generateSnippets } = await import("./generate-snippets.mjs");
const mode = process.argv[2];
const base = process.env.DOCS_BASE || "/";
if (!/^\/(?:[^?#]*\/)?$/.test(base))
  throw new Error("DOCS_BASE 必须以前后斜杠包围，例如 /ai-doc/");
function run(file, args = [], env = process.env) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [resolve(root, file), ...args], {
      cwd: root,
      stdio: "inherit",
      env,
    });
    const stop = () => child.kill("SIGTERM");
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      process.off("SIGINT", stop);
      process.off("SIGTERM", stop);
      code === 0 || signal
        ? resolvePromise()
        : reject(new Error(`${file} 退出码 ${code}`));
    });
  });
}
if (mode === "preview")
  await run("node_modules/vitepress/bin/vitepress.js", [
    "preview",
    "--host",
    "127.0.0.1",
    ...process.argv.slice(3),
  ]);
else {
  await run("scripts/check-components.mjs");
  await generateSnippets();
  if (mode === "build") {
    for (const stack of ["vue3", "react"])
      await run(
        `node_modules/${
          stack === "vue3" ? "vue-tsc/bin/vue-tsc.js" : "typescript/bin/tsc"
        }`,
        ["--noEmit", "-p", `demos/${stack}/tsconfig.json`]
      );
    for (const stack of ["vue2", "vue3", "react"])
      await build(await demoConfig(stack, base));
    await run("node_modules/vitepress/bin/vitepress.js", ["build"]);
    await run("scripts/check-site.mjs");
  } else if (mode === "dev") {
    const servers = [];
    const close = () => Promise.all(servers.map((server) => server.close()));
    process.once("SIGINT", close);
    process.once("SIGTERM", close);
    try {
      const env = { ...process.env };
      for (const stack of ["vue2", "vue3", "react"]) {
        const server = await createServer(await demoConfig(stack, base));
        await server.listen();
        servers.push(server);
        env[`DOCS_DEMO_${stack.toUpperCase()}_URL`] = `http://127.0.0.1:${
          server.httpServer.address().port
        }`;
        server.watcher.on("change", (path) => {
          if (path.includes("/demos/")) generateSnippets().catch(console.error);
        });
      }
      await run(
        "node_modules/vitepress/bin/vitepress.js",
        ["dev", "--host", "127.0.0.1", ...process.argv.slice(3)],
        env
      );
    } finally {
      await close();
    }
  } else throw new Error("支持 dev / build / preview");
}
