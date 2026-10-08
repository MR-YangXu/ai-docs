---
title: AI Code 操作手册
description: AI Code 0.3.0 的初始化、项目档案、版本同步与质量检查速查。
---

# AI Code 操作手册

以本地 `ai-code` **0.3.0** 源码为准，核对日期 **2026-10-08**。[源码仓库](https://github.com/MR-YangXu/AI-Coding)提供 Vue 3 + Vite + TypeScript 项目的规则、场景技能和质量命令；当前生成 Cursor 配置。

已接入项目从[状态检查](#status)开始。首次动手请按[六步教程](/getting-started)完成接入，再根据截图生成订单管理页面。

## 首次接入 {#init}

在**现有业务项目根目录**运行，本教程统一使用 **Node.js 22**。下面以 npm 为例，先安装依赖，再初始化并查看状态：

```bash
node -v
npm i @agent-xy/ai-code
npx @agent-xy/ai-code init
npx ai-code status
```

`node -v` 应输出 `v22.x.x`，否则先切换版本。项目有其他包管理器约定时沿用原工具和锁文件。

交互式初始化按提示选择场景与是否生成档案。首次接入需要显式指定参数时，可使用：

::: code-group

```bash [管理后台]
npx @agent-xy/ai-code init --scenarios admin --profile admin
```

```bash [移动端 H5]
npx @agent-xy/ai-code init --scenarios mobile-h5 --profile mobile-h5
```

```bash [通用 Vue]
npx @agent-xy/ai-code init --scenarios none --profile vue
```

:::

首次交互式 `init` 会询问场景；选择场景且没有已有档案时，再询问是否创建对应档案。非交互环境未指定参数时，只装通用规则，不创建档案。`--scenarios admin,mobile-h5` 同时安装两个场景；`--profile none` 不创建档案。

初始化会安装包、生成受控文件、添加 `ai:check`，识别已有检查脚本。已有配置不重建；冲突文件不覆盖。`--no-install` 只跳过依赖安装，仍会写接入配置，适用于依赖由外部流程管理的场景。

| 文件 | 用途与维护方式 |
| --- | --- |
| `.cursor/rules/ai-code.mdc` | 生成的基础规则，由 `sync` 更新 |
| `.cursor/skills/ai-code-*/SKILL.md` | 八个通用技能及所选场景技能，按任务读取 |
| `.ai-code/config.json` | 场景、版本、检查映射和受控文件记录 |
| `.ai-code/profile.md` | 团队维护的推荐入口，不受 `sync` 覆盖 |
| `.ai-code/README.md` | 生成的项目接入说明 |

## 项目档案 {#profile}

选择生成 profile 后，使用[档案补全提示词](/tutorial/project-rules)让 AI 根据项目源码填写，**填写完成后人工 review（审查）**。已有且已核实的档案直接使用；未选择生成时可跳过。

它只记录适用范围、推荐组件或 Hook（组合式函数）、源码入口、一个参考实现和复用边界；删除空章节及不适用示例。检查命令放在 `package.json` 和配置映射中，任务结果留在任务或审查记录中。

0.3.0 的首次 `init --profile admin` 可创建后台模板。**已接入后再次 init 不会补建档案**；缺少时可在项目根目录复制：

```bash
mkdir -p .ai-code
cp -n node_modules/@agent-xy/ai-code/content/templates/profile.admin.md .ai-code/profile.md
```

复制后按源码填写；通用和 H5 模板分别是 `profile.vue.md`、`profile.mobile-h5.md`。已有文件按需合并，不覆盖。

## 状态与检查 {#status}

```bash
npx ai-code status
npx ai-code check
```

| 命令 | 实际执行内容 | 使用时机 |
| --- | --- | --- |
| `status` | 读取配置、规则版本及文件一致性，检查映射是否可用 | 接入、升级或排查配置 |
| `check` / `npm run ai:check` | 执行已映射的项目检查，并按配置扫描常量 | 项目基线、团队门禁或 CI（持续集成） |
| 本地 `eslint <文件>` | 检查指定改动文件 | 普通页面任务默认验证 |
| `quality inspect` | 比较 HEAD 与工作区的 ESLint 诊断 | 需要区分新增与历史诊断时 |

`available` 表示命令可用，不是已执行通过；`missing` 表示能力缺失。

| 模式 | 缺少检查脚本 | 已有检查失败、规则漂移或无效配置 |
| --- | --- | --- |
| `observe`（观察，默认） | 展示 missing，不单独阻断 | 阻断 |
| `enforce`（阻断） | lint、typecheck、build 缺失即阻断；test 不统一强制 | 阻断 |

### 用户列表扩展练习的历史状态

2026-10-08 核对 `front-aggregate` 时：安装包 `0.3.0`，生成规则 `0.1.0`，版本不一致使 `status` 返回退出码 `1`。lint、build 已映射；独立 typecheck、test 未配置；constants 未配置。这只用于说明如何理解输出，当前项目状态以你实际运行的结果为准，不代表已经执行或通过业务检查。

### 增加检查脚本后

先在 `package.json` 定义适合本项目的非交互、非修改型命令，再手动更新 `.ai-code/config.json` 的 `scripts` 对应字段，保留其余配置。`sync` 不重新发现脚本，重复 `init` 也不重建映射。

初始化的自动识别顺序：

| 类型 | 依次识别的脚本名 |
| --- | --- |
| lint | `lint`、`lint:check`、`eslint` |
| typecheck | `typecheck`、`type-check`、`check-types`、`check:types` |
| test | `test:run`、`test:unit`、`test` |
| build | `build` |

带 `--fix`、`--write` 或监听模式的测试命令不适合作为自动检查。`build:ts` 不是自动识别的独立类型检查。Vite 构建通过也不等于类型检查通过。

## 升级与同步 {#upgrade}

已经安装目标版本时，从 `sync` 开始；需要升级包时先按项目包管理器安装团队选定版本。下面以 npm 为例：

```bash
npm install -D @agent-xy/ai-code@0.3.0
npx ai-code sync
npx ai-code status
```

`sync` 更新受控规则和说明，保留 profile 及检查映射。修改 `ai-code` 源码不会自动更新业务项目生成文件；不要只手改配置中的 `packageVersion` 来消除错误。

受控文件有手改内容时，`sync` 会拒绝覆盖。先查看差异并备份，把长期业务约定整理到 profile；确认旧版本受控内容后再恢复、同步。不要删除配置或关闭检查来绕过冲突。

切换场景时，参数**替换完整选择**，省略则沿用现有值：

```bash
npx ai-code sync --scenarios admin,mobile-h5
npx ai-code status
```

## 按需启用的能力 {#advanced}

### 常量检查

配置示例在安装包 `content/templates/constants/config.json`。按项目实际定义和引用范围合并 `constants` 字段，保留现有配置；`init` 与 `sync` 不会自动开启业务扫描。

`front-aggregate` 的用户枚举在 `src/views/users/index/config/data.ts`，不要照示例新建重复的 `src/constants`。

- 未配置：`not_configured`；不算通过。
- 配置有效时 `status` 仅报告可用，`check` 才扫描。
- 观察模式下违规为 warning；阻断模式下确定违规为 failed，疑似重复仍为 warning。
- 配置无效、解析失败或扫描无法完成为 incomplete，两种模式都失败。

### 增量诊断

```bash
npx ai-code quality inspect
```

比较 Git `HEAD` 与**整个当前工作区**，包含暂存、未暂存和未跟踪的 Vue / JS / TS 文件。只读，最多展示五条新增诊断；它不能把别人的改动与本次任务自动分开，也不替代项目检查。新增诊断或检查不完整返回失败。

### 机器可读报告

```bash
npx ai-code status --json
npx ai-code check --json
```

需要纯 JSON 时直接调用 CLI，避免 `npm run` 横幅混入输出。所有命令支持 `--project <目录>`、`--json`；完整参数运行 `npx ai-code --help` 查看。
