---
title: AI Code 设计流程图
description: 一张图讲清规则资产如何进入项目、AI 如何按任务读取、生成代码怎样检查并反馈。
pageClass: design-flow-page
aside: false
---

<script setup>
import { withBase } from 'vitepress'
</script>

<p class="page-kicker">范式与流程 / 设计总览</p>

# AI Code：规则怎样变成项目里的代码？

<p class="lead">把团队规则装进项目，让 AI 结合项目档案和真实源码实现需求，再用规则对照与检查结果验证交付。</p>

这张图沿用原架构图的**分层色块、能力分组和流程连线**。从左向右看“规则 → 项目 → AI”，再沿底部回到“检查 → 交付与维护”。

<div class="design-flow-links">
  <a :href="withBase('/diagrams/ai-code-design-flow.svg')" target="_blank" rel="noopener">打开可放大原图</a>
  <a :href="withBase('/diagrams/ai-code-design-flow.png')" download>下载 PNG 图片</a>
  <a :href="withBase('/diagrams/ai-code-design-flow.drawio')" download>下载可编辑 draw.io 文件</a>
</div>

<div class="design-flow-canvas" role="region" aria-label="AI Code 设计流程图，窄屏可横向滚动" tabindex="0">
  <a :href="withBase('/diagrams/ai-code-design-flow.svg')" target="_blank" rel="noopener" aria-label="打开设计流程原图">
    <img :src="withBase('/diagrams/ai-code-design-flow.svg')" width="1680" height="1310" alt="左侧 npm 包提供基础规则、技能和模板；中间项目安装规则、维护档案并提供已有能力；右侧 AI 读取上下文、规划、实现并生成代码；底部检查、对照规则、交付，问题返回实现，项目变化更新档案。" />
  </a>
</div>

<p class="design-flow-caption">窄屏可横向滚动；需要完整查看时打开原图。技能格子使用简称，例如 api 对应 ai-code-api。</p>

::: info 图的版本依据
核对于 **2026-10-10**，依据本地 `ai-code` 的 **0.5.0** 源码、提交 **a58c709**。当前支持 **Vue 3 + Vite + TypeScript**，适配工具为 **Cursor**。本页描述该提交的实现，不以未来扩展代替已有能力。

本站原六步教程按 **0.3.0** 编写，[订单生成对照](/examples/order-generation-evidence)引用实验时安装的 **0.5.0** 规则。它们是不同时间的材料，不能仅凭相同版本号认定内容一致。
:::

## 讲给别人听，按这四步说

1. **左边：我们把规则做成一个包。** 基础规则负责整体约束，Skills（技能）分别约束接口、常量、类型、页面等写法，场景规则补充后台或移动端要求。
2. **中间：项目安装通用规则，再选择场景补充。** 已有 Vue 3 项目选择后台、移动端或不加场景；规则安装到 `.cursor`，项目的组件名、参考页和复用边界写进 profile（项目档案）。这些入口要从源码核实。
3. **右边：AI 拿着需求、规则和项目事实写代码。** 后台页面读取 admin 技能，其他 Vue 页面读取 view 技能；涉及接口、常量、类型修改时再叠加相关技能。实现优先使用项目已有组件、请求层和逻辑。
4. **底部：生成后逐项核对，再修正。** 检查代码、运行适用检查、记录未验证事项。实现问题回到代码；组件入口或项目约定变化后，更新档案，供下次任务继续使用。

**一句话讲法：包负责分发规则，项目档案提供真实入口，AI 负责实现，代码对照和检查结果负责验证。**

## 图里几条容易混淆的关系

| 图中的关系 | 实际含义 |
| --- | --- |
| 包 → 项目 | `init` 安装规则、保存配置、注册检查入口，并按选择创建档案模板。业务页面由后续 AI 任务实现 |
| 项目源码 → profile | 模板需要按真实源码填写和审查；档案可选，没有时从相邻实现定位入口 |
| 已安装 Skills → AI 任务 | 九个通用技能都会安装，场景技能按选择安装；当前任务只读取适用部分，例如修改请求读 api，修改类型定义读 type |
| profile → 组件与逻辑复用 | 档案指出入口，AI 仍要核对当前参数、事件与调用约定。复用组件不等于加载了 component 技能 |
| 生成代码 → 检查 | 检查由任务或开发者触发，工具不会在每次生成后自动运行全部检查 |
| 升级包 → `sync` | 同步规则、恢复缺失文件、移除取消的受控场景技能，保留 profile；受控文件有手工改动时先报错，不直接覆盖 |

例如订单页：[API 技能对应响应取值与失败处理](/examples/order-generation-evidence#api)，[常量技能对应筛选与表格共用支付状态](/examples/order-generation-evidence#constants)，[类型技能对应订单类型的统一引用](/examples/order-generation-evidence#types)。这样总图中的每个环节都能继续落到具体代码。

## 底部的“检查”具体包括什么？

| 入口 | 核对什么 | 范围与前提 |
| --- | --- | --- |
| `ai-code status` | 安装状态、规则是否被改动、检查命令是否配置 | 只读取，不执行质量命令 |
| `ai-code quality inspect` | 对改动源码执行项目 ESLint，比较新增与历史诊断 | 需要 Git HEAD 和本地 ESLint；不自动修复 |
| `npm run ai:check` | 等同于 `ai-code check`；执行已映射的项目检查，检查规则一致性 | 范围由项目脚本决定，可能检查整个项目 |
| `check` 中的常量扫描 | 检查硬编码、定义归属、导入入口、字典等 | 显式配置 `constants` 后启用；未配置不能算通过 |
| 规则与代码对照、业务验收 | 核对具体规则、接口事实和需求行为 | 静态检查通过不能替代接口联调与业务验收 |

日常任务默认先对改动文件做 lint（静态代码检查）。该版本基础规则只在涉及类型边界且能限于新文件时默认运行类型检查；仓库级检查、构建和全量测试不属于普通页面任务的默认步骤。

显式运行 `ai:check` 时，按配置执行项目已有命令。`observe`（观察模式）允许缺少检查，但已有命令失败仍会阻断；`enforce`（阻断模式）要求 lint、typecheck（类型检查）和 build（构建）。常量扫描的确定违规在观察模式报告，在阻断模式阻断；配置或解析未完成不能算通过。

**图展示设计关系，具体任务是否遵守仍需证据。** 要确认实际读过哪些 Skill，保留当时的读取记录；要确认规则落实，保留源码位置和实际检查结果。对照方法见[如何验证 Skill](/examples/order-generation-evidence#skill-verification)。

## 这张图对应哪些实现？

<details>
<summary>展开源码依据与复核范围</summary>

下面路径均相对本地 `ai-code` 仓库，行号以提交 `a58c709` 为准。

| 图中部分 | 源码位置 | 已核实的实现 |
| --- | --- | --- |
| 支持的项目范围 | `src/project.mjs` L49–L54 | 核对 Vue 3、Vite、TypeScript 依赖 |
| 规则安装到 Cursor | `src/adapters/cursor.mjs` L12–L25 | 基础规则默认应用，写入九个通用技能、所选场景和接入说明 |
| 初始化项目 | `src/project.mjs` L100–L140 | 安装依赖、登记脚本、写入配置与受控文件、按选项创建档案 |
| 档案保护与同步 | `src/profile.mjs` L35–L41；`src/project.mjs` L143–L166 | 已有 profile 不覆盖；sync 检查受控冲突后同步 |
| AI 阅读与实现约束 | `content/core.md` L5–L36 | 按档案定位源码、按任务读技能、复用能力 |
| 日常验收范围 | `content/core.md` L40–L43 | 改动文件 lint、有限类型检查、报告实际结果与未验证项 |
| 项目检查与常量扫描 | `src/check.mjs` L6–L30；`src/constants/check.mjs` L40–L46、L325–L330 | 项目命令执行、扫描是否配置、观察与阻断状态 |
| 增量代码检查 | `src/quality.mjs` L20–L33、L92–L127 | 收集相对 HEAD 的变更及未跟踪源码，对比 ESLint 诊断 |

本次只读取包源码，并在内存中调用 `cursorFiles` 核对通用、后台、移动端及混合场景的输出。没有对业务项目执行 `init`、`sync` 或质量命令，也没有将本次图示核对写成包的完整测试通过。

</details>

需要修改版式时，用 diagrams.net（draw.io）打开可编辑文件。仓库内的 `scripts/render-design-flow.py` 可重新生成 SVG 和 draw.io；PNG 是用于分享的导出图片。

继续阅读[日常协作流程](/guide/workflow)，或回到[生成代码与 Skills 的实际对照](/examples/order-generation-evidence)。
