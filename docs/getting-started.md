---
title: 01 · 进入项目，检查 Node.js
description: 在现有项目中使用 Node.js 22，按六步完成 AI Code 接入并根据截图生成页面。
prev: false
next:
  text: 02 · 安装 AI Code
  link: /tutorial/install-ai-code
---

<p class="page-kicker">动手教程 / 01</p>

# 进入现有项目，检查 Node.js

<p class="lead">从你正在维护的项目开始，接入 AI Code，再让 AI 按项目规则生成一个订单管理页面。</p>

## 这次动手做什么？ {#what-you-build}

按下面 6 步操作。终端命令都在**现有业务项目根目录**执行，也就是包含 `package.json` 的目录。

| 步骤 | 操作 | 完成标志 |
| --- | --- | --- |
| **01 · 进入项目** | 检查 Node.js 版本 | 当前终端使用 `v22.x.x` |
| [02 · 安装 AI Code](/tutorial/install-ai-code) | `npm i @agent-xy/ai-code` | 项目已安装依赖 |
| [03 · 运行初始化](/tutorial/initialize) | `npx @agent-xy/ai-code init` | 按项目场景生成规则，可选生成 profile |
| [04 · 查看状态](/tutorial/check-status) | `npx ai-code status` | 核对配置和规则状态 |
| [05 · 完善项目档案](/tutorial/project-rules) | 复制提示词，让 AI 补全 `profile.md` | 选择生成档案时填写，并完成人工审查 |
| [06 · 根据图片生成页面](/tutorial/first-page) | 把订单管理截图和提示词一起交给 AI | 按现有规则生成页面并验收 |

本教程使用 Cursor 和现有 Vue 3 + Vite + TypeScript 项目。AI Code 当前生成 Cursor 规则与技能；页面使用业务项目已有的技术栈和组件。

## 1. 打开项目根目录

用 Cursor 打开你的项目，在编辑器终端执行。将示例路径替换成自己的项目路径：

```bash
cd /path/to/your-project
node -v
npm -v
git status --short
```

先记下已有改动，后续接入和生成页面时保留这些内容。

## 2. 确认使用 Node.js 22

本教程统一使用 **Node.js 22**，`node -v` 应输出 `v22.x.x`。如果不是 22，先切换版本，再继续安装依赖。

已使用 nvm（Node.js 版本管理工具）的项目，可以执行：

```bash
nvm install 22
nvm use 22
node -v
```

没有使用 nvm 时，通过团队现有的版本管理工具安装并切换到 Node.js 22；重新打开终端后再次检查。若项目的 `.nvmrc`、`package.json` 或团队环境约定与 22 冲突，先确认兼容性并统一环境。

**完成标志：** 当前目录是业务项目根目录，当前终端的 Node.js 主版本为 `22`。接着[安装 AI Code](/tutorial/install-ai-code)。
