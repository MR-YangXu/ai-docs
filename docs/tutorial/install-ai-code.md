---
title: 02 · 安装 AI Code
description: 在现有业务项目中安装 @agent-xy/ai-code 依赖。
prev:
  text: 01 · 进入项目，检查 Node.js
  link: /getting-started
next:
  text: 03 · 运行初始化
  link: /tutorial/initialize
---

<p class="page-kicker">动手教程 / 02</p>

# 安装 AI Code 依赖

确认当前终端使用 Node.js 18 及以上，且满足业务项目的版本要求，在项目根目录执行：

```bash
npm i @agent-xy/ai-code
```

安装完成后，`package.json` 和 `package-lock.json` 会记录依赖，后续命令会使用项目本地安装的 AI Code。

可以核对安装结果：

```bash
npm ls @agent-xy/ai-code --depth=0
```

输出中应包含 `@agent-xy/ai-code` 及其版本。安装失败时先根据终端错误处理 Node.js 版本、网络或依赖冲突，再进入下一步。

::: tip 沿用项目的包管理器
本教程用 npm 演示。若团队明确使用 pnpm 或 Yarn，请使用对应的依赖安装命令并保留原锁文件，避免混用包管理器。
:::

**完成标志：** 依赖安装成功。接着[运行初始化](/tutorial/initialize)，让 AI Code 为项目生成规则。
