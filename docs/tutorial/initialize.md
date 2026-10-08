---
title: 03 · 运行初始化
description: 运行 AI Code 初始化，选择项目场景，并按需生成 profile.md 项目档案。
prev:
  text: 02 · 安装 AI Code
  link: /tutorial/install-ai-code
next:
  text: 04 · 查看状态
  link: /tutorial/check-status
---

<p class="page-kicker">动手教程 / 03</p>

# 初始化项目规则

在业务项目根目录的交互式终端执行：

```bash
npx @agent-xy/ai-code init
```

## 按项目选择场景和档案

首次接入时，按终端提示选择项目场景。本教程要生成订单管理页面，管理后台项目选择 `admin`（管理后台）。移动端项目则按实际选择 `mobile-h5`（移动端 H5）。

选择场景后，若终端询问是否创建 `.ai-code/profile.md`：

- **选择生成**：得到对应场景的项目档案模板，第 5 步让 AI 根据源码填写，再由你人工审查。
- **选择暂不创建**：后续仍可使用生成规则，第 5 步跳过档案填写；生成页面时从现有源码寻找复用入口。

`profile.md` 是项目档案，用来记录推荐组件、源码入口和复用边界。**生成模板后还需要填写，它不会自动成为项目事实。**

## 初始化后会得到什么？

| 位置 | 用途 |
| --- | --- |
| `.cursor/rules/ai-code.mdc` | AI 编码基础规则 |
| `.cursor/skills/ai-code-*/SKILL.md` | 通用技能和所选场景技能 |
| `.ai-code/config.json` | 场景、规则版本和检查命令映射 |
| `.ai-code/README.md` | 项目接入说明 |
| `.ai-code/profile.md` | 选择生成时创建的项目档案 |
| `package.json` 中的 `ai:check` | 项目检查入口 |

初始化会识别已有检查脚本。已有档案会保留；遇到文件冲突或版本提示时，按输出处理，具体见[接入与同步手册](/handbook#init)。

::: details 没有出现选择提示？
以上交互以 AI Code 0.3.0 为准。已有 `.ai-code/config.json` 的项目不会重复进入首次接入流程；已有 profile 不会被覆盖。不选场景时不会询问场景档案。

非交互终端也不会弹出选择。首次接入时，可以显式指定管理后台场景与档案：

```bash
npx @agent-xy/ai-code init --scenarios admin --profile admin
```

若已接入但未生成档案，重复 `init` 不会补建，见[补建项目档案](/handbook#profile)。
:::

**完成标志：** 初始化完成，项目中能找到生成的规则和配置。接着[查看状态](/tutorial/check-status)。
