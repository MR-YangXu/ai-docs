---
title: 订单实验：完整源码与检查记录
description: 保存 2026-10-09 订单实验的规则原文、源码摘录、原始行号和检查记录，供逐条查证。
pageClass: evidence-page
outline: 2
prev:
  text: 生成对照 · 看懂规则如何落地
  link: /examples/order-generation-evidence
next: false
---

<p class="page-kicker">参考资料 / 订单实验记录</p>

# 订单实验：完整源码与检查记录

先看[生成对照：看懂规则如何落地](/examples/order-generation-evidence)，先看 admin、api、constant、type 四个 Skill 的规则与代码示例。本页保留 **2026-10-09** 的详细材料，需要核对某条结论时再展开查阅。

[Profile 填写前后](#profile-comparison) · [规则与源码](#code-evidence) · [待闭合项](#gaps) · [检查记录](#verification)

::: info 本次证据的范围
案例来自 **front-aggregate**，核对日期为 **2026-10-09**，安装的 AI Code 为 **0.5.0**（`.ai-code/config.json` 第 3 行）。现有六步接入教程按 **0.3.0** 编写，本页引用的是这次实验实际安装的规则。

本页能说明**当前代码落实了哪些规则**。没有生成对话和工具调用记录，不能据此证明生成时实际读取过哪份 Skill，也不能把静态对应写成业务验收通过。
:::

## 先看这条证据链 {#evidence-chain}

**基础规则选择适用 Skill → profile 提供项目入口和复用约定 → Skill 约束实现方式 → 生成源码 → 检查结果与待补事项。**

例如，`ai-code-admin` 要求复用项目搜索组件，profile 点名 `NewSearchForm`，订单页实际导入并绑定这个组件。三者能对上，才是一条可复核的代码证据。

| 层次 | 本次扮演的角色 | 能核对什么 |
| --- | --- | --- |
| 基础规则 `.cursor/rules/ai-code.mdc` | 按改动类别选择适用技能；要求优先读取项目档案 | 哪些规则适用于这次后台页面、API、常量和类型改动 |
| 项目档案 `.ai-code/profile.md` | 记录当前仓库的入口、参考页和边界 | 应复用哪个组件、Hook（组合式函数），采用什么目录 |
| `ai-code-admin` | 后台页面的组合方式与交互约束 | 目录、组件复用、查询和分页 |
| `ai-code-api`、`ai-code-type` | 请求和类型的边界 | 请求是否经过现有封装，业务类型是否从领域 API 引用 |
| `ai-code-constant` | 常量与字典的唯一来源 | 状态码、选项和展示是否由同一定义派生 |

这里列的是**适用规则**，不是“实际加载技能清单”。基础规则第 19–25 行按改动类型选择技能：复用现有组件或 Hook，不等于修改了它们，也不能推断生成时必然加载了 component、hook 技能；订单路由已存在，本次没有路由改动，不能据此认定使用了 route 技能。

### 材料来自哪个版本？

| 材料 | 实际来源 | 本页如何使用 |
| --- | --- | --- |
| 基准提交 | `1111ff552dc0a339cbd16e6031eb12e9e98044de`（简称 `1111ff5`） | 标识核对时的 HEAD；该提交不包含本次全部实验结果 |
| 填写前 profile | Git 暂存区中的模板，`git show :.ai-code/profile.md` | 与当前文件对照；不是已经提交的历史版本 |
| 填写后 profile | 当前工作区文件；状态为 `AM`（新增已暂存，随后又修改） | 展示实际填写内容和仍未确认的选择 |
| 订单页及配置 | `src/views/orders/index/` 下 5 个未跟踪的新文件 | 按用户实验说明作为生成结果；Git 状态本身不证明作者或生成过程 |
| 订单 API | `src/api/orders.ts`，工作区已有修改 | 区分新增类型与原有请求函数；不把整份 API 当作本次新建 |
| 搜索、表格、分页与选项能力 | 已有组件和 Hook，本次无差异 | 作为被复用能力，追踪行为来源 |

以下路径均相对 **front-aggregate** 根目录；**所有原文摘录核对于 2026-10-09**。代码块使用原文件行号，Markdown 原文的行号标在来源说明中。片段按连续行原样摘录，目录清单与解释由本文整理。文档保存独立摘录，构建不读取外部业务仓库。

## Profile 填写前后，生成结果如何对应？ {#profile-comparison}

| 模板中的内容 | 当前填写结果 | 生成代码中的对应 |
| --- | --- | --- |
| 搜索、表格和查询能力待填写 | 点名 `NewSearchForm`、`NewTable`、`usePageList`、`useSelectOptions`，并给出用户列表作为参考 | [组件复用](#components)和[查询复用](#query)中存在实际调用 |
| 通用文件树包含 `types.ts`、配置出口和私有组件目录 | 收敛为用户列表采用的 5 个文件；明确不存在的文件不补 | [实际目录](#directory)与填写后的文件树一致 |
| 常量默认放在 `src/constants` 或业务 `constants.ts` | 明确这些入口不存在，记录现有 `config/data.ts` 做法 | [支付状态](#constants)放在页面配置，归属选择仍待人工确认 |
| 团队选择尚未填写 | 分页持久化、常量归属、检查登记等保留待确认 | 不把有对应代码等同于团队已经批准全部约定 |

填写后的 profile 是可供生成使用的项目依据，但本次没有人工审查记录。下面的差异也不构成“没有 profile 时一定会生成另一套代码”的对照实验。

<details class="evidence-card">
<summary>展开 Profile 原文：推荐能力、目录与常量入口</summary>

**推荐能力：从占位项到可定位的源码。**

- **填写前 · 能力**：`.ai-code/profile.md` · L19–L25 · 暂存区模板。
- **填写后 · 能力**：`.ai-code/profile.md` · L33–L36 · 当前项目档案。

<!-- evidence-source: {"label": "填写前 · 能力", "path": ".ai-code/profile.md", "start": 19, "end": 25, "source": "index", "sha256": "8c18a15a680d3262f2e47905ccb5b625afb465c980a120170a263969eca41c85", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "填写后 · 能力", "path": ".ai-code/profile.md", "start": 33, "end": 36, "source": "working-tree", "sha256": "f5e37de8d873e8ed943034ab652de05619b1df7374366714808b68c15e9ca713", "checked": "2026-10-09"} -->

::: code-group

```md:no-line-numbers [填写前 · 能力]
| 页面布局 | 待填写 | 待填写 | 待填写：外层布局、间距和主题接入。 |
| 搜索与筛选 | 待填写 | 待填写 | 待填写：字段配置、提交与重置的接入方式。 |
| 表格 | 待填写 | 待填写 | 待填写：列、分页和插槽；卡片网格无需改成表格。 |
| 上传 | 待填写 | 待填写 | 待填写：适用交互；文件限制与接口继续核对契约。 |
| 抽屉或弹窗 | 待填写 | 待填写 | 待填写：共享外壳与私有业务展示的边界。 |
| 查询或操作组合式函数 | 待填写 | 待填写 | 待填写：查询、刷新或操作反馈中实际可复用的能力。 |
| 主题与样式 | 待填写 | 待填写 | 待填写：变量入口和支持的主题范围。 |
```

```md:no-line-numbers [填写后 · 能力]
| 搜索与筛选 | `src/components/NewSearchForm/index.vue` | `src/views/users/index/index.vue`；另有 `src/views/dataCenter/watchRecords/index.vue`、`src/views/dataCenter/series/index.vue` | 复用 `formHeader`、`formModel`，以及 `submitForm`、`resetForm`。用户列表把字段放在 `config/searchForm.ts`，并用 `deepClone` 生成当前页实例。各页字段和接口留在各页。组件里的导出和新增按钮，用户列表没有使用。 |
| 表格 | `src/components/NewTable/index.vue` | `src/views/users/index/index.vue`；另有 `src/views/dataCenter/watchRecords/index.vue` | 复用 `tableColumns`、`tableData`、`pageParams`、`loading`、`tableHeight`。翻页载荷是 `{ pageNum }`，改每页条数载荷是 `{ pageSize }`。自定义单元格写在列的 `render` 上。批量操作插槽名是 `multiple-operation`，上述两个页面都没有使用。剧集看板保持图表。 |
| 抽屉或弹窗 | 没有共享业务弹窗或抽屉。页面内直接使用 Element Plus 的 `el-dialog`。 | `src/views/dramaRecommend/index.vue` 的策略变化详情；`src/views/home/index.vue` 的选择剧集弹窗。 | 复用页面内的开关和本页展示。主题抽屉在 `src/components/Theme/index.vue`，由 `src/layout/components/Header/components/Setting.vue` 打开，只做主题配置。 |
| 查询或操作组合式函数 | `src/hooks/usePageList.ts`、`src/hooks/useSelectOptions.ts` | 仅 `src/views/users/index/index.vue` | `usePageList` 负责 loading、列表、分页、提交后回到第一页、重置到初始查询快照，以及丢弃过期响应。页面自己把响应解成 `{ list, total }`，失败时抛出。`useSelectOptions` 只改当前页的搜索项实例。图表查询在 `src/views/dataCenter/series/hooks/echartHooks.ts`，只服务该页。 |
```

:::

**目录：从通用模板到当前项目组织。**

- **填写前 · 目录**：`.ai-code/profile.md` · L41–L50 · 暂存区模板。
- **填写后 · 目录**：`.ai-code/profile.md` · L45–L51 · 当前项目档案。

<!-- evidence-source: {"label": "填写前 · 目录", "path": ".ai-code/profile.md", "start": 41, "end": 50, "source": "index", "sha256": "8c18a15a680d3262f2e47905ccb5b625afb465c980a120170a263969eca41c85", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "填写后 · 目录", "path": ".ai-code/profile.md", "start": 45, "end": 51, "source": "working-tree", "sha256": "f5e37de8d873e8ed943034ab652de05619b1df7374366714808b68c15e9ca713", "checked": "2026-10-09"} -->

::: code-group

```text:line-numbers=41 [填写前 · 目录]
pageName/
├── index.vue            已提交查询、分页和操作状态；组装筛选、可选中间层与列表
├── index.scss           页面布局
├── types.ts             多文件共用的页面展示类型
├── config/
│   ├── index.ts         配置出口
│   ├── searchForm.ts    搜索项与初始查询
│   ├── columns.ts       列配置
│   └── data.ts          选项、标签色、规则说明等页面展示配置
└── components/          卡片、详情、业务弹窗
```

```text:line-numbers=45 [填写后 · 目录]
pageName/
├── index.vue            已提交查询、分页和操作状态；组装筛选与列表
├── index.scss           页面间距、标题和内容区
└── config/
    ├── searchForm.ts    搜索项、初始查询和查询类型
    ├── columns.ts       列配置；自定义单元格用列上的 render
    └── data.ts          本页码值，以及由码值派生的选项、标签色和说明
```

:::

**常量：纠正默认路径，同时保留未决选择。**

- **填写前 · 常量**：`.ai-code/profile.md` · L60–L64 · 暂存区模板。
- **填写后 · 常量**：`.ai-code/profile.md` · L61–L67 · 当前项目档案。

<!-- evidence-source: {"label": "填写前 · 常量", "path": ".ai-code/profile.md", "start": 60, "end": 64, "source": "index", "sha256": "8c18a15a680d3262f2e47905ccb5b625afb465c980a120170a263969eca41c85", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "填写后 · 常量", "path": ".ai-code/profile.md", "start": 61, "end": 67, "source": "working-tree", "sha256": "f5e37de8d873e8ed943034ab652de05619b1df7374366714808b68c15e9ca713", "checked": "2026-10-09"} -->

::: code-group

```md:no-line-numbers [填写前 · 常量]
- 新增枚举和字典按下面的入口。这里改过之后，以改后的为准。已有常量文件保持原样，不按这里迁移。
- 公共入口：`src/constants/index.ts` 导出 `src/constants/common.ts`。
- 业务枚举与字典：放在所属业务模块的 `constants.ts`，不放进页面目录，也不复制进公共目录。页面从这里导入码值。
- 动态字典来源：待填写已有 API、组合式函数或服务；没有则删除。
- 机器检查的路径、定义归属与字段绑定维护在 `.ai-code/config.json` 的 `constants` 中，本文件不再复制登记表或码值。
```

```md:no-line-numbers [填写后 · 常量]
- 当前没有 `src/constants/index.ts`，也没有 `src/constants/common.ts`，业务模块下也没有 `constants.ts`。这两处模板路径不能当成本项目入口。
- 已核实的码值在 `src/views/users/index/config/data.ts`：`SUBSCRIPTION_STATUS`、`AD_SHOW_STATUS` 以及对应中文文案。`config/searchForm.ts` 和 `config/columns.ts` 从这里导入派生选项。
- 动态选项来源是 `src/hooks/useSelectOptions.ts`。用户列表用它调用 `src/api/users.ts` 的 `getSite`、`getCountry`、`getSubscribe`，结果写入当前搜索项实例，不修改导入的配置对象。
- `.ai-code/config.json` 目前没有 `constants` 字段。是否补机器检查登记，待人工确认。本文件不复制码值表。
- 检索时先看是否已有同义码值。当前只找到用户列表这一处。同一业务语义只保留一份，使用处导入。
- 待人工确认：之后新增的码值继续放在所属页面的 `config/data.ts`，还是改放到业务模块级常量文件。确认前不要新建 `src/constants`。
- 本项目不是国际化项目。字典中保存中文文案。
```

:::

</details>


## 规则与源码逐条对照 {#code-evidence}

**“源码已对应”只针对该条所展示的约定。** 请求契约、业务操作和检查结果另行标注。每组先说明结论，再列出 Skill、profile 与源码来源；切换标签可逐项核对，代码块右上角可复制。

### 01 · 搜索与表格复用 {#components}

<span class="evidence-status">源码已对应 · 组件接入</span>

Skill 要求使用已有组件，通过配置接入；profile 给出了两个明确入口。订单页实际导入 `NewSearchForm`、`NewTable`，并传入筛选、数据和分页配置。

<details class="evidence-card">
<summary>查看证据：搜索和表格确实使用了推荐组件</summary>

- **Skill 原文**：`.cursor/skills/ai-code-admin/SKILL.md` · L12–L14 · 已安装 Skill。
- **Profile 原文**：`.ai-code/profile.md` · L33–L34 · 当前项目档案。
- **生成源码 · 导入**：`src/views/orders/index/index.vue` · L52–L53 · 新增订单代码。
- **生成源码 · 搜索**：`src/views/orders/index/index.vue` · L7–L16 · 新增订单代码。
- **生成源码 · 表格**：`src/views/orders/index/index.vue` · L25–L35 · 新增订单代码。

<!-- evidence-source: {"label": "Skill 原文", "path": ".cursor/skills/ai-code-admin/SKILL.md", "start": 12, "end": 14, "source": "working-tree", "sha256": "4c952d9ac64eb4c95f197d30eecd28fb79c954049b1ad7644cb54776886db9f4", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "Profile 原文", "path": ".ai-code/profile.md", "start": 33, "end": 34, "source": "working-tree", "sha256": "f5e37de8d873e8ed943034ab652de05619b1df7374366714808b68c15e9ca713", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "生成源码 · 导入", "path": "src/views/orders/index/index.vue", "start": 52, "end": 53, "source": "working-tree", "sha256": "220f4e89f3c5f1b05e8e452d08e001cf4536cf59c4ae20d9dd6f8c9de73719e3", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "生成源码 · 搜索", "path": "src/views/orders/index/index.vue", "start": 7, "end": 16, "source": "working-tree", "sha256": "220f4e89f3c5f1b05e8e452d08e001cf4536cf59c4ae20d9dd6f8c9de73719e3", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "生成源码 · 表格", "path": "src/views/orders/index/index.vue", "start": 25, "end": 35, "source": "working-tree", "sha256": "220f4e89f3c5f1b05e8e452d08e001cf4536cf59c4ae20d9dd6f8c9de73719e3", "checked": "2026-10-09"} -->

::: code-group

```md:no-line-numbers [Skill 原文]
- 搜索、表格、上传、抽屉使用档案或相邻后台页里已有的组件，通过配置接入。卡片网格可以复用查询能力，不必改成表格。
- 搜索核对字段类型、选项、默认值、提交和重置。放弃复用要指出事件或布局上的具体缺口。
- 查询、刷新和操作反馈优先用契约匹配的既有组合式函数。`usePageList` 等名称只是候选，不能从其他仓库复制导入。
```

```md:no-line-numbers [Profile 原文]
| 搜索与筛选 | `src/components/NewSearchForm/index.vue` | `src/views/users/index/index.vue`；另有 `src/views/dataCenter/watchRecords/index.vue`、`src/views/dataCenter/series/index.vue` | 复用 `formHeader`、`formModel`，以及 `submitForm`、`resetForm`。用户列表把字段放在 `config/searchForm.ts`，并用 `deepClone` 生成当前页实例。各页字段和接口留在各页。组件里的导出和新增按钮，用户列表没有使用。 |
| 表格 | `src/components/NewTable/index.vue` | `src/views/users/index/index.vue`；另有 `src/views/dataCenter/watchRecords/index.vue` | 复用 `tableColumns`、`tableData`、`pageParams`、`loading`、`tableHeight`。翻页载荷是 `{ pageNum }`，改每页条数载荷是 `{ pageSize }`。自定义单元格写在列的 `render` 上。批量操作插槽名是 `multiple-operation`，上述两个页面都没有使用。剧集看板保持图表。 |
```

```ts:line-numbers=52 [生成源码 · 导入]
  import NewTable from '@/components/NewTable/index.vue';
  import NewSearchForm from '@/components/NewSearchForm/index.vue';
```

```vue:line-numbers=7 [生成源码 · 搜索]
      <new-search-form
        :disabled-export="exporting"
        :form-header="formHeader"
        :form-model="queryForm"
        :show-one-btn-export="true"
        @changeDate="changeDate"
        @export="onExport"
        @reset-form="resetForm"
        @submit-form="submitForm"
      ></new-search-form>
```

```vue:line-numbers=25 [生成源码 · 表格]
    <new-table
      class="new-table"
      :loading="loading"
      :page-params="pageParams"
      :table-columns="tableColumnConfig"
      :table-data="tableData"
      :table-height="tableHeight"
      @handle-current-change="onPageChange"
      @handle-size-change="onSizeChange"
    >
    </new-table>
```

:::

**为什么对应：** 档案中的组件路径与导入路径一致，模板确实消费了这些导入；不仅是出现同名字符串。搜索使用 `formHeader`、`formModel` 和提交、重置事件，表格使用 `pageParams`、列配置和分页事件。

**验证边界：** 这是接入关系的证据，不代表搜索、重置与分页都已人工操作通过。组件本身是项目已有能力，不是本次生成的组件。

</details>


### 02 · 页面目录遵循填写后的 Profile {#directory}

<span class="evidence-status">源码已对应 · 文件组织</span>

`ai-code-admin` 把新建页目录交给项目档案。订单页实际包含 5 个文件，与填写后的文件树一致，没有照搬通用模板中的 `types.ts`、`config/index.ts` 和 `components/`。

<details class="evidence-card">
<summary>查看证据：档案目录与实际文件清单</summary>

- **Skill 原文**：`.cursor/skills/ai-code-admin/SKILL.md` · L19–L19 · 已安装 Skill。
- **Profile 文件树**：`.ai-code/profile.md` · L45–L51 · 当前项目档案。
- **生成源码 · 配置导入**：`src/views/orders/index/index.vue` · L68–L70 · 新增订单代码。

<!-- evidence-source: {"label": "Skill 原文", "path": ".cursor/skills/ai-code-admin/SKILL.md", "start": 19, "end": 19, "source": "working-tree", "sha256": "4c952d9ac64eb4c95f197d30eecd28fb79c954049b1ad7644cb54776886db9f4", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "Profile 文件树", "path": ".ai-code/profile.md", "start": 45, "end": 51, "source": "working-tree", "sha256": "f5e37de8d873e8ed943034ab652de05619b1df7374366714808b68c15e9ca713", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "生成源码 · 配置导入", "path": "src/views/orders/index/index.vue", "start": 68, "end": 70, "source": "working-tree", "sha256": "220f4e89f3c5f1b05e8e452d08e001cf4536cf59c4ae20d9dd6f8c9de73719e3", "checked": "2026-10-09"} -->

::: code-group

```md:no-line-numbers [Skill 原文]
新建页的目录以项目档案里写明的文件树为准。档案没有写目录时，才沿用相邻后台页。不要把已有页面改成档案里的目录。简单页面不必拆文件。参考页面只学习组合方式，不照搬字段、角色和已知缺陷。
```

```text:line-numbers=45 [Profile 文件树]
pageName/
├── index.vue            已提交查询、分页和操作状态；组装筛选与列表
├── index.scss           页面间距、标题和内容区
└── config/
    ├── searchForm.ts    搜索项、初始查询和查询类型
    ├── columns.ts       列配置；自定义单元格用列上的 render
    └── data.ts          本页码值，以及由码值派生的选项、标签色和说明
```

```ts:line-numbers=68 [生成源码 · 配置导入]
  import { formHeaderConfig, queryFormConfig, type OrderQueryForm } from './config/searchForm';
  import { createOrderColumns, formatOrderTradeStatus, formatOrderVideoTitle } from './config/columns';
  import { orderStatItems } from './config/data';
```

:::

**实际文件清单**（目录枚举，2026-10-09；不是源码片段）：

```text:no-line-numbers
src/views/orders/index/config/columns.ts
src/views/orders/index/config/data.ts
src/views/orders/index/config/searchForm.ts
src/views/orders/index/index.scss
src/views/orders/index/index.vue
```

**为什么对应：** 实际文件和页面的配置导入能相互印证，说明文件拆分已落实。

**验证边界：** 文件数量一致不代表每个文件中的全部业务逻辑都正确；profile 仍含订单页缺失的旧描述，见[待闭合项](#gaps)。

</details>


### 03 · 查询、分页与过期响应复用 {#query}

<span class="evidence-status">源码已对应 · 调用与列表写回</span>

Skill 要求查询和分页复用匹配的既有能力；profile 推荐 `usePageList`。订单页向它传入初始查询和请求函数，提交、重置和分页再调用它返回的方法。

<details class="evidence-card">
<summary>查看证据：页面调用与已有 Hook 的行为来源</summary>

- **Skill 原文**：`.cursor/skills/ai-code-admin/SKILL.md` · L27–L27 · 已安装 Skill。
- **Profile 原文**：`.ai-code/profile.md` · L56–L57 · 当前项目档案。
- **生成源码 · 接入**：`src/views/orders/index/index.vue` · L122–L130 · 新增订单代码。
- **生成源码 · 事件**：`src/views/orders/index/index.vue` · L364–L387 · 新增订单代码。
- **既有 Hook · 查询分页**：`src/hooks/usePageList.ts` · L113–L134 · 既有复用能力。
- **既有 Hook · 请求序号**：`src/hooks/usePageList.ts` · L87–L110 · 既有复用能力。

<!-- evidence-source: {"label": "Skill 原文", "path": ".cursor/skills/ai-code-admin/SKILL.md", "start": 27, "end": 27, "source": "working-tree", "sha256": "4c952d9ac64eb4c95f197d30eecd28fb79c954049b1ad7644cb54776886db9f4", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "Profile 原文", "path": ".ai-code/profile.md", "start": 56, "end": 57, "source": "working-tree", "sha256": "f5e37de8d873e8ed943034ab652de05619b1df7374366714808b68c15e9ca713", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "生成源码 · 接入", "path": "src/views/orders/index/index.vue", "start": 122, "end": 130, "source": "working-tree", "sha256": "220f4e89f3c5f1b05e8e452d08e001cf4536cf59c4ae20d9dd6f8c9de73719e3", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "生成源码 · 事件", "path": "src/views/orders/index/index.vue", "start": 364, "end": 387, "source": "working-tree", "sha256": "220f4e89f3c5f1b05e8e452d08e001cf4536cf59c4ae20d9dd6f8c9de73719e3", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "既有 Hook · 查询分页", "path": "src/hooks/usePageList.ts", "start": 113, "end": 134, "source": "working-tree", "sha256": "c1fb109cddde42ca5cee9755dcdddf3102239f7347b6deb722da65c573048d03", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "既有 Hook · 请求序号", "path": "src/hooks/usePageList.ts", "start": 87, "end": 110, "source": "working-tree", "sha256": "c1fb109cddde42ca5cee9755dcdddf3102239f7347b6deb722da65c573048d03", "checked": "2026-10-09"} -->

::: code-group

```md:no-line-numbers [Skill 原文]
- 筛选、排序、分页共用同一份已提交条件；筛选变化时回到第一页。正在编辑的输入和已提交条件分开；重置把输入、条件和标签一起恢复，且不污染初始配置。
```

```md:no-line-numbers [Profile 原文]
- 提交回第一页、重置恢复初始查询、翻页载荷和过期响应处理，已经写在 `src/hooks/usePageList.ts`，这里不重复组件参数和接口字段。
- 待人工确认：新建列表是否默认像用户列表一样传入 `persistKey`，把 `page` 和 `page_size` 写入 `localStorage`。目前只有用户列表使用，键名为 `USERSPAGE`。
```

```ts:line-numbers=122 [生成源码 · 接入]
  const { loading, tableData, pageParams, getData, onSubmit, reset, handlePageChange, handleSizeChange } = usePageList<
    OrderQueryForm,
    OrderListItem
  >(queryForm, {
    initialQuery: queryFormConfig,
    pageSize: 20,
    fetchList: async (query, page) => {
      const seq = listSeq;
      const res = await orderList(buildParams(query, page.page, page.page_size, ORDER_LIST_EXPORT.QUERY));
```

```ts:line-numbers=364 [生成源码 · 事件]
  function submitForm(form: OrderQueryForm) {
    startQuery();
    onSubmit(form);
    loadTotal();
  }

  function resetForm(form?: OrderQueryForm) {
    startQuery();
    reset(form);
    loadVideoOptions(queryForm.createdRange);
    loadTotal();
  }

  function onPageChange(payload: { pageNum: number }) {
    startQuery();
    handlePageChange(payload);
    loadTotal();
  }

  function onSizeChange(payload: { pageSize: number }) {
    startQuery();
    handleSizeChange(payload);
    loadTotal();
  }
```

```ts:line-numbers=113 [既有 Hook · 查询分页]
  function onSubmit(form: Partial<TQuery>) {
    Object.assign(queryForm, form);
    pageParams.currentPage = 1;
    getData();
  }

  function reset(form?: Partial<TQuery>) {
    Object.assign(queryForm, form ?? (deepClone(initialSnapshot) as TQuery));
    pageParams.currentPage = 1;
    getData();
  }

  function handlePageChange(payload: PageChangePayload) {
    pageParams.currentPage = payload.pageNum;
    getData();
  }

  function handleSizeChange(payload: SizeChangePayload) {
    pageParams.pageSize = payload.pageSize;
    pageParams.currentPage = 1;
    getData();
  }
```

```ts:line-numbers=87 [既有 Hook · 请求序号]
  async function getData() {
    const seq = ++requestSeq;
    loading.value = true;
    try {
      const result = await options.fetchList(queryForm, {
        page: pageParams.currentPage,
        page_size: pageParams.pageSize,
      });
      if (seq !== requestSeq) {
        return;
      }
      tableData.value = result.list;
      pageParams.total = result.total;
      persistPagination();
    } catch (error) {
      if (seq !== requestSeq) {
        return;
      }
      console.log(error);
    } finally {
      if (seq === requestSeq) {
        loading.value = false;
      }
    }
```

:::

**为什么对应：** `onSubmit` 将页码设为 1；分页方法更新页码后复用查询；`getData` 比较请求序号，只允许最新请求写回列表和 loading（加载状态）。这些是既有 Hook 的实现，本次页面负责接入。

**验证边界：** `reset(form)` 传入表单时优先采用该对象，只有未传表单才使用初始快照，因此还需联同搜索组件的 `resetFields` 验证最终输入与条件。仅有 Hook 的引用，不能宣称重置已通过。这里的序号保护针对列表写回，不能扩展成所有动态选项请求都具备并发保护。

</details>


### 04 · 初始查询与动态选项按实例创建 {#instances}

<span class="evidence-status">源码已对应 · 配置隔离</span>

Skill 要求不修改导入的初始配置；profile 说明 `useSelectOptions` 只操作当前页搜索项。订单页深拷贝查询，并逐项复制搜索字段及其选项对象。

<details class="evidence-card">
<summary>查看证据：先创建实例，再交给已有选项 Hook</summary>

- **Skill 原文**：`.cursor/skills/ai-code-admin/SKILL.md` · L21–L21 · 已安装 Skill。
- **Profile 原文**：`.ai-code/profile.md` · L63–L63 · 当前项目档案。
- **生成源码**：`src/views/orders/index/index.vue` · L73–L80 · 新增订单代码。
- **既有 Hook**：`src/hooks/useSelectOptions.ts` · L20–L27 · 既有复用能力。

<!-- evidence-source: {"label": "Skill 原文", "path": ".cursor/skills/ai-code-admin/SKILL.md", "start": 21, "end": 21, "source": "working-tree", "sha256": "4c952d9ac64eb4c95f197d30eecd28fb79c954049b1ad7644cb54776886db9f4", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "Profile 原文", "path": ".ai-code/profile.md", "start": 63, "end": 63, "source": "working-tree", "sha256": "f5e37de8d873e8ed943034ab652de05619b1df7374366714808b68c15e9ca713", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "生成源码", "path": "src/views/orders/index/index.vue", "start": 73, "end": 80, "source": "working-tree", "sha256": "220f4e89f3c5f1b05e8e452d08e001cf4536cf59c4ae20d9dd6f8c9de73719e3", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "既有 Hook", "path": "src/hooks/useSelectOptions.ts", "start": 20, "end": 27, "source": "working-tree", "sha256": "3ea06944b1570f80d02e3117c70665912f23324e7d15ecce188b2a2b5a8979d0", "checked": "2026-10-09"} -->

::: code-group

```md:no-line-numbers [Skill 原文]
新建筛选加列表的页面时，先按该目录落文件，再补字段和交互。没有的文件不创建。页面编排查询、分页和操作，筛选与列表分开。选项、标签色和页面说明放在档案约定的展示配置里。业务码值沿用模块已有常量，页面里不再复制一份。接口类型引用领域 API。页面样式只负责布局，组件样式跟随组件并使用主题变量。初始查询和动态选项按实例创建，不修改导入的配置对象。模板显隐不写复杂表达式：无参数放计算属性，依赖行数据放方法。卡片不改传入对象，也不隐式刷新父页面。演示数据仅在允许时另放，并限制启用范围。
```

```md:no-line-numbers [Profile 原文]
- 动态选项来源是 `src/hooks/useSelectOptions.ts`。用户列表用它调用 `src/api/users.ts` 的 `getSite`、`getCountry`、`getSubscribe`，结果写入当前搜索项实例，不修改导入的配置对象。
```

```ts:line-numbers=73 [生成源码]
  const queryForm = reactive(deepClone(queryFormConfig)) as OrderQueryForm;
  const formHeader = reactive(
    formHeaderConfig.map((item) => ({
      ...item,
      optionsArr: item.optionsArr.map((option) => ({ ...option })),
    })),
  );
  const { loadFieldOptions, setFieldOptions } = useSelectOptions(formHeader);
```

```ts:line-numbers=20 [既有 Hook]
export function useSelectOptions(formHeader: SelectField[]) {
  function setFieldOptions(propName: string, options: SelectOption[]) {
    const field = formHeader.find((item) => item.propName === propName);
    if (!field) {
      return;
    }
    field.optionsArr = options;
  }
```

:::

**为什么对应：** Hook 改写的是传入实例的 `optionsArr`，生成页已先复制这一层配置。页面查询也由 `deepClone(queryFormConfig)` 创建。

**验证边界：** 这验证当前配置的复制与写入路径，不证明任何将来新增的深层嵌套对象都已隔离，也不是动态字典接口联调结果。

</details>


### 05 · 请求层、响应层级与类型归属 {#api-types}

<span class="evidence-status evidence-status-partial">边界已对应 · 契约待确认</span>

API Skill 要求复用请求层，类型 Skill 要求业务类型由 API 或领域模块维护；profile 说明拦截器返回完整 Axios 响应。订单模块沿用现有 `request`，页面从 API 导入类型，并使用 `res.data.code` 和 `res.data.data`。

<details class="evidence-card">
<summary>查看证据：规则、项目响应约定与实际消费路径</summary>

- **API Skill**：`.cursor/skills/ai-code-api/SKILL.md` · L20–L22 · 已安装 Skill。
- **类型 Skill**：`.cursor/skills/ai-code-type/SKILL.md` · L20–L22 · 已安装 Skill。
- **Profile 原文**：`.ai-code/profile.md` · L22–L22 · 当前项目档案。
- **API · 请求入口**：`src/api/orders.ts` · L1–L8 · 修改的 API 模块。
- **API · 请求函数**：`src/api/orders.ts` · L80–L86 · 既有请求函数补充类型。
- **生成源码 · 类型导入**：`src/views/orders/index/index.vue` · L54–L63 · 新增订单代码。
- **生成源码 · 解包**：`src/views/orders/index/index.vue` · L134–L151 · 新增订单代码。
- **既有拦截器**：`src/api/request.ts` · L76–L79 · 既有复用能力。

<!-- evidence-source: {"label": "API Skill", "path": ".cursor/skills/ai-code-api/SKILL.md", "start": 20, "end": 22, "source": "working-tree", "sha256": "2e18a9d4e32460923880f292e747018dc601a8f75cb66bd557a1c4056ab9c5c6", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "类型 Skill", "path": ".cursor/skills/ai-code-type/SKILL.md", "start": 20, "end": 22, "source": "working-tree", "sha256": "d1b26fbd5e2613b72f9dedb098ec952eb1c07dc49e33bc363d92bde0c3c6e2b3", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "Profile 原文", "path": ".ai-code/profile.md", "start": 22, "end": 22, "source": "working-tree", "sha256": "f5e37de8d873e8ed943034ab652de05619b1df7374366714808b68c15e9ca713", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "API · 请求入口", "path": "src/api/orders.ts", "start": 1, "end": 8, "source": "working-tree", "sha256": "ae9c38eddf8acb1463c885ea6c8c1694a044464c06e5dda39773d6beb338d3ed", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "API · 请求函数", "path": "src/api/orders.ts", "start": 80, "end": 86, "source": "working-tree", "sha256": "ae9c38eddf8acb1463c885ea6c8c1694a044464c06e5dda39773d6beb338d3ed", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "生成源码 · 类型导入", "path": "src/views/orders/index/index.vue", "start": 54, "end": 63, "source": "working-tree", "sha256": "220f4e89f3c5f1b05e8e452d08e001cf4536cf59c4ae20d9dd6f8c9de73719e3", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "生成源码 · 解包", "path": "src/views/orders/index/index.vue", "start": 134, "end": 151, "source": "working-tree", "sha256": "220f4e89f3c5f1b05e8e452d08e001cf4536cf59c4ae20d9dd6f8c9de73719e3", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "既有拦截器", "path": "src/api/request.ts", "start": 76, "end": 79, "source": "working-tree", "sha256": "845d9580c57553adf5e54afa71c8f592bfe05358e0e3c9e1495a106bfd9e356b", "checked": "2026-10-09"} -->

::: code-group

```md:no-line-numbers [API Skill]
- 在 API 边界声明请求与响应类型；调用方按本项目实际响应层级取值（如 `data` 或 `data.data`）。
- 先确认拦截器如何判定业务成功与解包，再消费载荷；不要用 `res?.list ?? res?.data ?? []` 猜测响应结构或把失败伪装成空列表。
- 无法确认端点、字段、权限或响应层级时保留待确认项，不编造默认值、环境变量或 mock 契约。
```

```md:no-line-numbers [类型 Skill]
- **业务局部类型**：请求参数、原始响应和领域实体由所属 API 或领域模块维护，通过该模块已有入口引用。已有生成类型作为契约来源，不手改生成文件，不把业务类型全部汇总进公共入口。
- **页面或组件局部类型**：页面查询、表单和展示类型就近定义；Props、事件载荷和组合式函数的输入输出由所属模块维护。需要独立维护或多文件共用时再抽到同域 `types.ts`，不为每个页面固定生成类型文件。
- 类型专用导入沿用项目写法，支持时使用 `import type`。公共模块不反向依赖业务，API 模块不反向依赖页面；不把业务实体集中到全局 `.d.ts` 声明文件。
```

```md:no-line-numbers [Profile 原文]
  - 请求经 `src/api/request.ts`，拦截器返回完整 Axios 响应；`401` 和 `402` 会退出登录。页面以 `res.data.code === 0` 判断业务成功。用户列表、观影记录、站点备注、剧集看板都使用这一层。
```

```ts:line-numbers=1 [API · 请求入口]
import type { AxiosResponse } from 'axios';
import request from './request';

interface OrderEnvelope<T> {
  code: number;
  msg: string;
  data: T;
}
```

```ts:line-numbers=80 [API · 请求函数]
export function orderList(data: OrderListParams): Promise<AxiosResponse<OrderEnvelope<OrderListData>>> {
  return request({
    url: '/order/get-list',
    method: 'post',
    data,
  });
}
```

```ts:line-numbers=54 [生成源码 · 类型导入]
  import {
    getAccessChannelList,
    getOrderTotal,
    getVideoList,
    ORDER_LIST_EXPORT,
    orderList,
    type OrderListItem,
    type OrderListParams,
    type OrderStatValues,
  } from '@/api/orders';
```

```ts:line-numbers=134 [生成源码 · 解包]
      if (res.data.code !== 0) {
        ElMessage.error(res.data.msg || '订单列表加载失败');
        throw new Error(res.data.msg || '订单列表加载失败');
      }
      const payload = res.data.data;
      if (!payload || !Array.isArray(payload.list) || typeof payload.total !== 'number') {
        ElMessage.error('订单列表返回结构待确认');
        throw new Error('订单列表返回结构待确认');
      }
      const headerStats = readStats(payload);
      if (seq === listSeq && headerStats) {
        stats.value = headerStats;
        statShapeMissing.value = false;
      }
      return {
        list: payload.list,
        total: payload.total,
      };
```

```ts:line-numbers=76 [既有拦截器]
    // 直接返回res，当然你也可以只返回res.data
    // 系统如果有自定义code也可以在这里处理
    return response;
  },
```

:::

**为什么对应：** HTTP 请求仍由原请求封装发出，接口类型留在领域 API，页面消费完整响应外壳。业务失败与列表结构异常会报错并抛出，不在这两个分支填入模拟列表。

**验证边界：** API 的新增类型只是声明；代码注释表明部分字段参考了另一个端点，见[接口缺口](#contract-gap)。`fetchList` 在第 131–132 行返回空列表的分支用于过期请求，结合 Hook 的请求序号才会被丢弃，不能脱离调用链把它解释为正常空结果。未进行类型检查和真实接口联调。

</details>


### 06 · 支付状态、选项与列展示统一引用 {#constants}

<span class="evidence-status evidence-status-partial">引用已对应 · 归属待确认</span>

常量 Skill 要求同一语义只维护一份码值和字典；profile 要求检索并复用同义定义。订单页在 `config/data.ts` 定义支付状态、派生类型和选项，搜索与列展示从这里导入。

<details class="evidence-card">
<summary>查看证据：一处定义，两处消费</summary>

- **Skill 原文**：`.cursor/skills/ai-code-constant/SKILL.md` · L19–L22 · 已安装 Skill。
- **Profile 原文**：`.ai-code/profile.md` · L65–L67 · 当前项目档案。
- **生成源码 · 定义**：`src/views/orders/index/config/data.ts` · L3–L19 · 新增订单代码。
- **生成源码 · 搜索导入**：`src/views/orders/index/config/searchForm.ts` · L1–L10 · 新增订单代码。
- **生成源码 · 搜索选项**：`src/views/orders/index/config/searchForm.ts` · L73–L81 · 新增订单代码。
- **生成源码 · 列导入**：`src/views/orders/index/config/columns.ts` · L1–L3 · 新增订单代码。
- **生成源码 · 列展示**：`src/views/orders/index/config/columns.ts` · L33–L44 · 新增订单代码。

<!-- evidence-source: {"label": "Skill 原文", "path": ".cursor/skills/ai-code-constant/SKILL.md", "start": 19, "end": 22, "source": "working-tree", "sha256": "49be9269052f34b0d0f062907fe7a2b2f27bf5cf52745ff20548dcc8dc013e41", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "Profile 原文", "path": ".ai-code/profile.md", "start": 65, "end": 67, "source": "working-tree", "sha256": "f5e37de8d873e8ed943034ab652de05619b1df7374366714808b68c15e9ca713", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "生成源码 · 定义", "path": "src/views/orders/index/config/data.ts", "start": 3, "end": 19, "source": "working-tree", "sha256": "435a24444a86f9373aa0aaeee8c18d90f37a9bea557206626aa5d0c3f24a98c0", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "生成源码 · 搜索导入", "path": "src/views/orders/index/config/searchForm.ts", "start": 1, "end": 10, "source": "working-tree", "sha256": "f37a5f54ef7f1f0156b5ef349e84166d464f13560bc0e342e2a873fb5841dab9", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "生成源码 · 搜索选项", "path": "src/views/orders/index/config/searchForm.ts", "start": 73, "end": 81, "source": "working-tree", "sha256": "f37a5f54ef7f1f0156b5ef349e84166d464f13560bc0e342e2a873fb5841dab9", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "生成源码 · 列导入", "path": "src/views/orders/index/config/columns.ts", "start": 1, "end": 3, "source": "working-tree", "sha256": "b839128757a0aa58cd94d212ae12628a300a422bb0716ed291d82517cf3abb6f", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "生成源码 · 列展示", "path": "src/views/orders/index/config/columns.ts", "start": 33, "end": 44, "source": "working-tree", "sha256": "b839128757a0aa58cd94d212ae12628a300a422bb0716ed291d82517cf3abb6f", "checked": "2026-10-09"} -->

::: code-group

```md:no-line-numbers [Skill 原文]
- **同一业务语义只能有一份权威常量和一份字典映射。** 页面、组件、组合式函数、API 和页面配置均从所属定义模块导入，不能各自声明，换名复制同样违规。
- 公共与业务不得重复维护同一含义的定义。只在语义和接口契约一致时提取公共定义；不同业务恰好使用相同数字不代表可以共用。
- 公共定义通过公共 `index.ts` 引用；业务定义从所属模块引用，不塞进公共导出入口。公共模块不反向依赖业务；跨业务共享时先确认应归属的公共领域。
- 转导出、导入别名以及由权威定义派生的只读选项或展示配置允许存在。不能把复制、展开后独立修改的对象当作第二份常量维护。
```

```md:no-line-numbers [Profile 原文]
- 检索时先看是否已有同义码值。当前只找到用户列表这一处。同一业务语义只保留一份，使用处导入。
- 待人工确认：之后新增的码值继续放在所属页面的 `config/data.ts`，还是改放到业务模块级常量文件。确认前不要新建 `src/constants`。
- 本项目不是国际化项目。字典中保存中文文案。
```

```ts:line-numbers=3 [生成源码 · 定义]
/** 支付状态。0、1 与订单列表示例里的 trade_status、pay_status 对应。 */
export const TRADE_STATUS = {
  FAILED: 0,
  SUCCESS: 1,
} as const;

export const TRADE_STATUS_LABEL = {
  [TRADE_STATUS.FAILED]: '失败',
  [TRADE_STATUS.SUCCESS]: '成功',
} as const;

export type TradeStatus = (typeof TRADE_STATUS)[keyof typeof TRADE_STATUS];

export const tradeStatusOptions = (Object.keys(TRADE_STATUS) as Array<keyof typeof TRADE_STATUS>).map((key) => {
  const value = TRADE_STATUS[key];
  return { label: TRADE_STATUS_LABEL[value], value };
});
```

```ts:line-numbers=1 [生成源码 · 搜索导入]
import { tradeStatusOptions, type TradeStatus } from './data';

export interface OrderQueryForm {
  createdRange: [string, string];
  access_channel: string;
  order_type: string;
  video_ids: number[];
  trade_status: '' | TradeStatus;
  keywords: string;
}
```

```ts:line-numbers=73 [生成源码 · 搜索选项]
  {
    itemType: 'selectOne',
    span: 6,
    clearable: true,
    propName: 'trade_status',
    placeholder: '支付状态',
    width: '140px',
    optionsArr: tradeStatusOptions,
  },
```

```ts:line-numbers=1 [生成源码 · 列导入]
import { ElLink } from 'element-plus';
import type { OrderListItem } from '@/api/orders';
import { TRADE_STATUS, TRADE_STATUS_LABEL } from './data';
```

```ts:line-numbers=33 [生成源码 · 列展示]
export function formatOrderTradeStatus(row: OrderListItem) {
  if (typeof row.pay_status === 'string' && row.pay_status !== '') {
    return row.pay_status;
  }
  if (row.trade_status === TRADE_STATUS.FAILED || row.trade_status === TRADE_STATUS.SUCCESS) {
    return TRADE_STATUS_LABEL[row.trade_status];
  }
  if (row.trade_status === null || typeof row.trade_status === 'undefined') {
    return '--';
  }
  return String(row.trade_status);
}
```

:::

**为什么对应：** 支付状态选项由常量和值对应的文案生成；列展示引用同一对象，未知状态没有默认当成成功。搜索类型也从 `TradeStatus` 派生，没有再手写一组状态值。

**验证边界：** 结论限定为此处支付状态的定义与引用，不是全仓库常量检查通过。profile 对新增常量的归属仍待确认，`.ai-code/config.json` 也未登记 `constants`；筛选中的空字符串仍直接书写，不能据此宣称常量 Skill 的全部要求均已满足。支付码值与后端契约的一致性仍需联调依据。

</details>


### 07 · 未确认统计字段有明确提示 {#unknown-stats}

<span class="evidence-status evidence-status-partial">提示已对应 · 统计口径待确认</span>

Skill 要求统计口径未确认时明确说明。profile 只提供响应层级，并未确认订单统计契约；生成页在拿不到预期字段时保留缺口提示，空值展示为 `--`。

<details class="evidence-card">
<summary>查看证据：不以演示数字填补统计缺口</summary>

- **Skill 原文**：`.cursor/skills/ai-code-admin/SKILL.md` · L32–L32 · 已安装 Skill。
- **Profile 原文**：`.ai-code/profile.md` · L22–L22 · 当前项目档案。
- **生成源码 · 展示**：`src/views/orders/index/index.vue` · L18–L24 · 新增订单代码。
- **生成源码 · 空值**：`src/views/orders/index/index.vue` · L174–L179 · 新增订单代码。
- **生成源码 · 统计处理**：`src/views/orders/index/index.vue` · L261–L272 · 新增订单代码。
- **生成源码 · 提示条件**：`src/views/orders/index/index.vue` · L155–L155 · 新增订单代码。

<!-- evidence-source: {"label": "Skill 原文", "path": ".cursor/skills/ai-code-admin/SKILL.md", "start": 32, "end": 32, "source": "working-tree", "sha256": "4c952d9ac64eb4c95f197d30eecd28fb79c954049b1ad7644cb54776886db9f4", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "Profile 原文", "path": ".ai-code/profile.md", "start": 22, "end": 22, "source": "working-tree", "sha256": "f5e37de8d873e8ed943034ab652de05619b1df7374366714808b68c15e9ca713", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "生成源码 · 展示", "path": "src/views/orders/index/index.vue", "start": 18, "end": 24, "source": "working-tree", "sha256": "220f4e89f3c5f1b05e8e452d08e001cf4536cf59c4ae20d9dd6f8c9de73719e3", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "生成源码 · 空值", "path": "src/views/orders/index/index.vue", "start": 174, "end": 179, "source": "working-tree", "sha256": "220f4e89f3c5f1b05e8e452d08e001cf4536cf59c4ae20d9dd6f8c9de73719e3", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "生成源码 · 统计处理", "path": "src/views/orders/index/index.vue", "start": 261, "end": 272, "source": "working-tree", "sha256": "220f4e89f3c5f1b05e8e452d08e001cf4536cf59c4ae20d9dd6f8c9de73719e3", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "生成源码 · 提示条件", "path": "src/views/orders/index/index.vue", "start": 155, "end": 155, "source": "working-tree", "sha256": "220f4e89f3c5f1b05e8e452d08e001cf4536cf59c4ae20d9dd6f8c9de73719e3", "checked": "2026-10-09"} -->

::: code-group

```md:no-line-numbers [Skill 原文]
- 统计口径未确认时标为待确认，不用演示数字充当业务规则。
```

```md:no-line-numbers [Profile 原文]
  - 请求经 `src/api/request.ts`，拦截器返回完整 Axios 响应；`401` 和 `402` 会退出登录。页面以 `res.data.code === 0` 判断业务成功。用户列表、观影记录、站点备注、剧集看板都使用这一层。
```

```vue:line-numbers=18 [生成源码 · 展示]
    <div class="stat-row">
      <div v-for="item in orderStatItems" :key="item.key" class="stat-card">
        <div class="stat-label">{{ item.label }}</div>
        <div class="stat-value">{{ formatStat(stats?.[item.key] ?? null) }}</div>
      </div>
    </div>
    <div v-if="showStatGap" class="stat-gap">统计字段未在接口返回中找到，待确认</div>
```

```ts:line-numbers=174 [生成源码 · 空值]
  function formatStat(value: string | number | null) {
    if (value === null || value === '') {
      return '--';
    }
    return String(value);
  }
```

```ts:line-numbers=261 [生成源码 · 统计处理]
      const next = readStats(res.data.data);
      if (seq !== listSeq) {
        return;
      }
      if (next) {
        stats.value = next;
        statShapeMissing.value = false;
        return;
      }
      if (!stats.value) {
        statShapeMissing.value = true;
      }
```

```ts:line-numbers=155 [生成源码 · 提示条件]
  const showStatGap = computed(() => queried.value && statShapeMissing.value && !loading.value && !totalLoading.value && !stats.value);
```

:::

**为什么对应：** 没有读到统计值时保留空值和待确认状态，没有用固定订单数或金额填充界面。

**验证边界：** “字段缺失有提示”不等于金额单位、成功率计算或统计范围已确认；部分统计字段存在时也不保证其他字段完整。profile 并不是订单接口的业务契约。

</details>


## 哪些地方还没有闭合？ {#gaps}

闭环需要保留缺口，再按明确条件复核；不能把七组对应关系汇总成“全部符合”。

| 当前事实 | 证据位置 | 下一步闭合条件 |
| --- | --- | --- |
| 档案仍说订单页不存在，开头又限定只约束所列模块 | profile L3、L13、L78；实际新增的订单目录 | 更新生成后的事实，明确订单页的适用范围；是否作为参考页另行审查 |
| 新建页样板、分页记忆、常量归属和机器登记仍待确认 | profile L82–85；订单页未传 `persistKey` | 人工逐项决定并写回长期约定，不能默认已获批准 |
| 导出取自当前 `tableData`，不是全部筛选结果 | 订单页 L408–425 | 明确导出当前页还是全部筛选结果；若需要全部结果，再按接口契约实现并核对文件 |
| 主题变量与固定颜色并存 | 页面样式 L11、L20、L43–44 | 按项目主题约定处理背景和文字色，并实际检查明暗主题 |
| 类型注释引用另一端点的响应，目标接口结构未完全确认 | API L34–36、L61 | 以目标端点的确认契约或脱敏联调结果核对字段、统计口径和返回层级 |

这些条目记录的是本次实验现状。本文没有修改业务代码、profile 或 Skill 来让证据看起来一致。

<details class="evidence-card">
<summary>展开缺口原文：档案、导出与主题</summary>

- **Profile · 旧事实**：`.ai-code/profile.md` · L13–L13 · 当前项目档案。
- **Profile · 待确认**：`.ai-code/profile.md` · L82–L85 · 当前项目档案。
- **生成源码 · 导出**：`src/views/orders/index/index.vue` · L408–L425 · 新增订单代码。
- **生成样式 · 页头**：`src/views/orders/index/index.scss` · L7–L23 · 新增订单代码。
- **生成样式 · 卡片**：`src/views/orders/index/index.scss` · L39–L45 · 新增订单代码。

<!-- evidence-source: {"label": "Profile · 旧事实", "path": ".ai-code/profile.md", "start": 13, "end": 13, "source": "working-tree", "sha256": "f5e37de8d873e8ed943034ab652de05619b1df7374366714808b68c15e9ca713", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "Profile · 待确认", "path": ".ai-code/profile.md", "start": 82, "end": 85, "source": "working-tree", "sha256": "f5e37de8d873e8ed943034ab652de05619b1df7374366714808b68c15e9ca713", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "生成源码 · 导出", "path": "src/views/orders/index/index.vue", "start": 408, "end": 425, "source": "working-tree", "sha256": "220f4e89f3c5f1b05e8e452d08e001cf4536cf59c4ae20d9dd6f8c9de73719e3", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "生成样式 · 页头", "path": "src/views/orders/index/index.scss", "start": 7, "end": 23, "source": "working-tree", "sha256": "1d8f9a5aa8465f55c105c5b80b8f117c48ec9e166e8a3a8741aaa2102c967237", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "生成样式 · 卡片", "path": "src/views/orders/index/index.scss", "start": 39, "end": 45, "source": "working-tree", "sha256": "1d8f9a5aa8465f55c105c5b80b8f117c48ec9e166e8a3a8741aaa2102c967237", "checked": "2026-10-09"} -->

::: code-group

```md:no-line-numbers [Profile · 旧事实]
- `src/routers/index.ts` 的 `asyncRoutes` 还注册了 `src/routers/modules/orders.ts`，目标文件是 `src/views/orders/index/index.vue`。该页面文件不存在，订单模块不能当参考实现。
```

```md:no-line-numbers [Profile · 待确认]
- 是否把 `src/views/users/index/index.vue` 定为新建筛选加列表页的唯一认可样板。
- 新建列表是否默认使用 `usePageList` 的 `persistKey` 记住分页。
- 新增码值继续放在页面 `config/data.ts`，还是改放到业务模块级常量文件。确认前不要新建 `src/constants`。
- 是否在 `.ai-code/config.json` 增加 `constants` 机器检查登记。
```

```ts:line-numbers=408 [生成源码 · 导出]
    const column = tableColumnConfig
      .filter((item) => item.showColumn && item.prop !== 'detail')
      .map((item) => ({ label: item.label, name: item.prop }));
    const data = tableData.value.map((row) => {
      const record: Record<string, string> = {};
      column.forEach((item) => {
        record[item.name] = exportCell(row, item.name);
      });
      return record;
    });
    exporting.value = true;
    try {
      await exportExcel({
        column,
        data,
        filename: '订单管理',
        autoWidth: true,
        format: 'xlsx',
```

```scss:line-numbers=7 [生成样式 · 页头]
  .header {
    padding: 16px 16px 0;
    margin-bottom: 16px;
    border-radius: 4px;
    background: white;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.05);

    .header-title {
      display: flex;
      justify-content: space-between;

      .title {
        font-weight: 700;
        color: rgb(51, 51, 51);
        font-size: 18px;
        margin-bottom: 10px;
      }
```

```scss:line-numbers=39 [生成样式 · 卡片]
  .stat-card {
    flex: 1;
    padding: 14px 12px;
    text-align: center;
    background: #fff;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 40px;
```

:::

</details>


### 接口声明为什么仍需验证？ {#contract-gap}

API 注释说明 `/order/get-list` 自身的响应 schema（结构定义）为空，列表字段参考了 `/order/get-order-list`。本页没有获得注释所述的原始接口文档，因此只能确认代码写了这些声明，不能确认两个端点确实具有相同契约。


<details class="evidence-card">
<summary>展开接口注释与对应规则</summary>

- **Skill 原文**：`.cursor/skills/ai-code-api/SKILL.md` · L20–L22 · 已安装 Skill。
- **API · 列表注释**：`src/api/orders.ts` · L34–L38 · 修改的 API 模块。
- **API · 统计注释**：`src/api/orders.ts` · L61–L67 · 修改的 API 模块。

<!-- evidence-source: {"label": "Skill 原文", "path": ".cursor/skills/ai-code-api/SKILL.md", "start": 20, "end": 22, "source": "working-tree", "sha256": "2e18a9d4e32460923880f292e747018dc601a8f75cb66bd557a1c4056ab9c5c6", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "API · 列表注释", "path": "src/api/orders.ts", "start": 34, "end": 38, "source": "working-tree", "sha256": "ae9c38eddf8acb1463c885ea6c8c1694a044464c06e5dda39773d6beb338d3ed", "checked": "2026-10-09"} -->
<!-- evidence-source: {"label": "API · 统计注释", "path": "src/api/orders.ts", "start": 61, "end": 67, "source": "working-tree", "sha256": "ae9c38eddf8acb1463c885ea6c8c1694a044464c06e5dda39773d6beb338d3ed", "checked": "2026-10-09"} -->

::: code-group

```md:no-line-numbers [Skill 原文]
- 在 API 边界声明请求与响应类型；调用方按本项目实际响应层级取值（如 `data` 或 `data.data`）。
- 先确认拦截器如何判定业务成功与解包，再消费载荷；不要用 `res?.list ?? res?.data ?? []` 猜测响应结构或把失败伪装成空列表。
- 无法确认端点、字段、权限或响应层级时保留待确认项，不编造默认值、环境变量或 mock 契约。
```

```ts:line-numbers=34 [API · 列表注释]
/**
 * 列表行字段来自同文档「订单列表」`/order/get-order-list` 的响应。
 * `/order/get-list` 自身的响应 schema 为空，付款时间和渠道来源没有对应字段。
 */
export interface OrderListItem {
```

```ts:line-numbers=61 [API · 统计注释]
/** `/order/get-order-list` 的 table_header。`/order/get-total` 响应 schema 为空，页面只在这些键存在时展示。 */
export interface OrderStatValues {
  total_orders: string | number;
  total_success_orders: string | number;
  total_gmv: string | number;
  total_success_rate_txt: string;
}
```

:::

</details>


## 检查记录与复核方法 {#verification}

| 检查 | 本次结果 | 结果说明 |
| --- | --- | --- |
| 原文与行号 | 已逐段核对 | 暂存区模板、当前 profile、安装的 Skills 与当前源码分别取证 |
| 改动文件 ESLint（静态代码检查） | **通过**，退出码 0 | 2026-10-09 为编写本文补充执行；不代表生成当时的检查记录 |
| 类型检查 | 未执行 | 不能以 ESLint 通过代替 |
| 订单页构建及浏览器操作 | 本次未执行 | 不能把代码路径核对写成点击验收通过 |
| 真实接口联调 | 本次未执行 | 列表、统计、字典和导出范围仍按业务契约确认 |
| 常量机器检查 | 未登记 `constants`，本次未执行 | 不能标成自动检查通过 |
| 生成时的 Skill 读取记录 | 未提供 | 当前源码只能证明对应关系，不能证明历史调用过程 |

本次 ESLint 命令在 **front-aggregate 根目录**执行，不包含 `--fix`（自动修复）：

```bash:no-line-numbers
./node_modules/.bin/eslint \
  src/api/orders.ts \
  src/views/orders/index/index.vue \
  src/views/orders/index/config/searchForm.ts \
  src/views/orders/index/config/columns.ts \
  src/views/orders/index/config/data.ts
```

### 将这套核对方法用于下一次生成

1. **生成前：** 保存已审查 profile、适用 Skills 和项目版本；留下未确认项。
2. **生成后：** 按改动范围摘录规则与代码，区分新生成、修改与复用的文件；给出原始位置。
3. **核对时：** 记录符合项、缺口和实际检查结果；源码符合、工具检查通过、业务操作通过分别说明。
4. **修正后：** 更新过时档案和相关代码，再复核同一条证据，记录尚未完成的事项。

如果以后要证明“生成时确实读取过某份 Skill”，还需要保存对应对话或工具读取记录，并与当时的规则版本一起核对。不要事后补写一份读取清单，当作当时发生过的事实。

维护本页时，重新核对路径、行号、摘录和日期；文件中的 `evidence-source` 注释保存来源版本与内容摘要，便于校验，不是生成过程日志。

看完对照，可以继续[给订单号增加复制按钮](/examples/query-first-step)，交付时参照[检查页面，整理交付说明](/tutorial/review-and-deliver)。
