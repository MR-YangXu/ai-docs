---
title: 生成对照：看懂规则如何落地
description: 对照 admin、api、constant、type 四个 Skill 的规则原文与真实订单代码，说明已落实的要求、发现的缺口及后续验证方法。
pageClass: evidence-page evidence-story-page
outline: 2
prev:
  text: 06 · 根据图片生成页面
  link: /tutorial/first-page
next:
  text: 复制订单号
  link: /examples/query-first-step
---

<p class="page-kicker">动手教程 / 生成之后怎么看</p>

# 生成的代码，怎么体现我们的规则？

<p class="lead">我们写的 Skills，在生成的订单页里体现在哪里？从组件、接口、常量、类型四处看：规则写了什么，代码怎么对应，哪些要求还没做到。</p>

下面用 front-aggregate 的实际代码，对照 **4 个 Skill（技能规则）**。先选一个你关心的例子：

| 你写的 Skill | 这次直接看什么代码 | 本次核对结果 |
| --- | --- | --- |
| [ai-code-admin · 后台页面](#components) | 搜索组件的导入与使用 | 复用要求有对应 |
| [ai-code-api · 接口请求](#api) | 业务失败判断、响应取值 | 片段符合规则，接口待联调 |
| [ai-code-constant · 常量字典](#constants) | 支付状态的定义与两处引用 | 引用有对应，筛选空值仍未命名 |
| [ai-code-type · 类型定义](#types) | 订单类型的定义与导入 | 共用同一类型，类型检查未执行 |

阅读时，先分清这三个角色：

<ol class="evidence-story">
  <li><span>Skill · 技能规则</span><strong>告诉 AI 应该怎么写</strong><p>例如：搜索区优先复用项目已有组件。</p></li>
  <li><span>profile · 项目档案</span><strong>告诉 AI 本项目用什么</strong><p>例如：搜索组件用 NewSearchForm。</p></li>
  <li><span>生成代码</span><strong>检查最终写成了什么</strong><p>例如：订单页确实使用了 NewSearchForm。</p></li>
</ol>

**Skill 提要求，profile 指定项目用法，最后到代码里核对。**

想先看全貌，可以打开 [AI Code 设计流程图](/guide/design-flow)，再用下面四个例子核对其中的“规则 → 代码”关系。

## 例子一：ai-code-admin · 搜索框用了哪个组件？ {#components}

### 先看规则要求

后台 Skill（`ai-code-admin`）的原文：

`.cursor/skills/ai-code-admin/SKILL.md` · L12 · Skill 原文 · 2026-10-10 复核。

<!-- evidence-source: {"label": "Skill 原文", "path": ".cursor/skills/ai-code-admin/SKILL.md", "start": 12, "end": 12, "source": "working-tree", "sha256": "4c952d9ac64eb4c95f197d30eecd28fb79c954049b1ad7644cb54776886db9f4", "checked": "2026-10-10"} -->

> 搜索、表格、上传、抽屉使用档案或相邻后台页里已有的组件，通过配置接入。卡片网格可以复用查询能力，不必改成表格。

它解决的是“开发时遵守什么写法”，还没有告诉我们这个项目的搜索组件叫什么。

### 再看项目档案

填写后的 profile 指定：**搜索使用 `NewSearchForm`，参考用户列表的接入方式。**

这就把通用要求变成了当前项目里能找到的组件。

### 最后看生成代码

订单页先导入这个组件：

<!-- evidence-source: {"label": "讲解页摘录", "path": "src/views/orders/index/index.vue", "start": 53, "end": 53, "source": "working-tree", "sha256": "220f4e89f3c5f1b05e8e452d08e001cf4536cf59c4ae20d9dd6f8c9de73719e3", "checked": "2026-10-09"} -->

```ts:line-numbers=53
  import NewSearchForm from '@/components/NewSearchForm/index.vue';
```

然后在页面里实际使用它。重点看组件名，以及高亮的筛选配置、搜索和重置事件：

<!-- evidence-source: {"label": "讲解页摘录", "path": "src/views/orders/index/index.vue", "start": 7, "end": 16, "source": "working-tree", "sha256": "220f4e89f3c5f1b05e8e452d08e001cf4536cf59c4ae20d9dd6f8c9de73719e3", "checked": "2026-10-09"} -->

```vue{3,4,8,9}:line-numbers=7
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

`form-header` 是筛选项配置，`form-model` 是查询数据；`submit-form` 和 `reset-form` 分别接搜索与重置。代码片段来自订单页，行号保留原始位置。

::: tip 这个例子可以这样讲
“我们的规则要求复用搜索组件，项目档案写明用 NewSearchForm。你看，生成的订单页导入并使用了它，所以‘复用现有搜索组件’这条要求，在代码里有对应。”
:::

[查看这条要求的 Skill、profile 原文和完整接入片段](/examples/order-generation-evidence-notes#components)。表格也是同样的关系：profile 推荐 `NewTable`，订单页实际使用 `NewTable`。

## 例子二：ai-code-api · 接口失败时怎么处理？ {#api}

**这条规则约束请求怎么写、响应怎么取，以及失败时怎么处理。** 订单页里可以直接找到对应分支。

**你写的规则原文：**

`.cursor/skills/ai-code-api/SKILL.md` · L21 · Skill 原文 · 2026-10-10 复核。

<!-- evidence-source: {"label": "Skill 原文", "path": ".cursor/skills/ai-code-api/SKILL.md", "start": 21, "end": 21, "source": "working-tree", "sha256": "2e18a9d4e32460923880f292e747018dc601a8f75cb66bd557a1c4056ab9c5c6", "checked": "2026-10-10"} -->

> 先确认拦截器如何判定业务成功与解包，再消费载荷；不要用 `res?.list ?? res?.data ?? []` 猜测响应结构或把失败伪装成空列表。

**实际代码：** 先判断业务成功，再取列表数据；返回结构不符合预期时，明确报错。

`src/views/orders/index/index.vue` · L134–L142 · 新增订单代码 · 2026-10-10 复核。

<!-- evidence-source: {"label": "新增订单代码", "path": "src/views/orders/index/index.vue", "start": 134, "end": 142, "source": "working-tree", "sha256": "220f4e89f3c5f1b05e8e452d08e001cf4536cf59c4ae20d9dd6f8c9de73719e3", "checked": "2026-10-10"} -->

```ts{1,5,6}:line-numbers=134
      if (res.data.code !== 0) {
        ElMessage.error(res.data.msg || '订单列表加载失败');
        throw new Error(res.data.msg || '订单列表加载失败');
      }
      const payload = res.data.data;
      if (!payload || !Array.isArray(payload.list) || typeof payload.total !== 'number') {
        ElMessage.error('订单列表返回结构待确认');
        throw new Error('订单列表返回结构待确认');
      }
```

**怎么对上：** 第 134 行判断业务是否成功，第 138 行按 `res.data.data` 取数据，第 139 行检查列表和总数。这两个异常分支都抛出错误，没有把失败显示成“没有订单”。

<details class="evidence-card">
<summary>展开请求来源：沿用项目请求封装，并补充请求与响应类型</summary>

API Skill 还规定请求只能放在既有 API 模块中：

`.cursor/skills/ai-code-api/SKILL.md` · L12–L13 · Skill 原文 · 2026-10-10 复核。

<!-- evidence-source: {"label": "Skill 原文", "path": ".cursor/skills/ai-code-api/SKILL.md", "start": 12, "end": 13, "source": "working-tree", "sha256": "2e18a9d4e32460923880f292e747018dc601a8f75cb66bd557a1c4056ab9c5c6", "checked": "2026-10-10"} -->

> 只在项目既有 API 模块声明请求；页面、组件和 Hook 不直接创建 HTTP 客户端。
> 复用既有拦截器、鉴权、超时、取消、解包和错误处理；不复制其他项目的请求封装。

`src/api/orders.ts` · L1–L2 · 修改的 API 模块 · 2026-10-10 复核。

<!-- evidence-source: {"label": "修改的 API 模块", "path": "src/api/orders.ts", "start": 1, "end": 2, "source": "working-tree", "sha256": "ae9c38eddf8acb1463c885ea6c8c1694a044464c06e5dda39773d6beb338d3ed", "checked": "2026-10-10"} -->

```ts:line-numbers=1
import type { AxiosResponse } from 'axios';
import request from './request';
```

`src/api/orders.ts` · L80–L86 · 既有请求函数补充类型 · 2026-10-10 复核。

<!-- evidence-source: {"label": "既有请求函数补充类型", "path": "src/api/orders.ts", "start": 80, "end": 86, "source": "working-tree", "sha256": "ae9c38eddf8acb1463c885ea6c8c1694a044464c06e5dda39773d6beb338d3ed", "checked": "2026-10-10"} -->

```ts{2}:line-numbers=80
export function orderList(data: OrderListParams): Promise<AxiosResponse<OrderEnvelope<OrderListData>>> {
  return request({
    url: '/order/get-list',
    method: 'post',
    data,
  });
}
```

这里的 `request` 和 `orderList` 请求函数原本就存在；本次沿用请求入口并补充类型。profile 说明拦截器返回完整 Axios 响应，与页面的取值层级对应。[查看档案和拦截器原文](/examples/order-generation-evidence-notes#api-types)。

</details>

**本次结论：这些片段符合请求复用、明确解包和失败处理的要求。** 真实接口尚未联调，部分字段契约仍待核实，不能据此判定接口整体可用。

## 例子三：ai-code-constant · 支付状态有没有重复定义？ {#constants}

**这条规则要求同一个业务状态只维护一份定义。** 这里检查“失败 / 成功”的筛选选项和表格展示，是否引用同一个来源。

**你写的规则原文：**

`.cursor/skills/ai-code-constant/SKILL.md` · L19 · Skill 原文 · 2026-10-10 复核。

<!-- evidence-source: {"label": "Skill 原文", "path": ".cursor/skills/ai-code-constant/SKILL.md", "start": 19, "end": 19, "source": "working-tree", "sha256": "49be9269052f34b0d0f062907fe7a2b2f27bf5cf52745ff20548dcc8dc013e41", "checked": "2026-10-10"} -->

> **同一业务语义只能有一份权威常量和一份字典映射。** 页面、组件、组合式函数、API 和页面配置均从所属定义模块导入，不能各自声明，换名复制同样违规。

**实际代码：** 在 `data.ts` 定义状态、文案，再由它们生成选项。

`src/views/orders/index/config/data.ts` · L4–L19 · 新增订单代码 · 2026-10-10 复核。

<!-- evidence-source: {"label": "新增订单代码", "path": "src/views/orders/index/config/data.ts", "start": 4, "end": 19, "source": "working-tree", "sha256": "435a24444a86f9373aa0aaeee8c18d90f37a9bea557206626aa5d0c3f24a98c0", "checked": "2026-10-10"} -->

```ts{1,6,14,15}:line-numbers=4
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

搜索配置直接使用这份选项：

`src/views/orders/index/config/searchForm.ts` · L80 · 新增订单代码 · 2026-10-10 复核。

<!-- evidence-source: {"label": "新增订单代码", "path": "src/views/orders/index/config/searchForm.ts", "start": 80, "end": 80, "source": "working-tree", "sha256": "f37a5f54ef7f1f0156b5ef349e84166d464f13560bc0e342e2a873fb5841dab9", "checked": "2026-10-10"} -->

```ts:line-numbers=80
    optionsArr: tradeStatusOptions,
```

表格在没有可用的 `pay_status` 文本时，也用同一份状态和文案：

`src/views/orders/index/config/columns.ts` · L37–L39 · 新增订单代码 · 2026-10-10 复核。

<!-- evidence-source: {"label": "新增订单代码", "path": "src/views/orders/index/config/columns.ts", "start": 37, "end": 39, "source": "working-tree", "sha256": "b839128757a0aa58cd94d212ae12628a300a422bb0716ed291d82517cf3abb6f", "checked": "2026-10-10"} -->

```ts{2}:line-numbers=37
  if (row.trade_status === TRADE_STATUS.FAILED || row.trade_status === TRADE_STATUS.SUCCESS) {
    return TRADE_STATUS_LABEL[row.trade_status];
  }
```

**怎么对上：** `data.ts` 定义 → `tradeStatusOptions` 供筛选使用 → `TRADE_STATUS_LABEL` 供表格显示。筛选配置和表格没有各自再写一套“0 是失败、1 是成功”的映射。

<details class="evidence-card">
<summary>展开导入关系和完整展示函数</summary>

搜索配置从 `./data` 导入选项：

`src/views/orders/index/config/searchForm.ts` · L1 · 新增订单代码 · 2026-10-10 复核。

<!-- evidence-source: {"label": "新增订单代码", "path": "src/views/orders/index/config/searchForm.ts", "start": 1, "end": 1, "source": "working-tree", "sha256": "f37a5f54ef7f1f0156b5ef349e84166d464f13560bc0e342e2a873fb5841dab9", "checked": "2026-10-10"} -->

```ts:line-numbers=1
import { tradeStatusOptions, type TradeStatus } from './data';
```

表格从同一模块导入状态和字典；优先显示接口提供的状态文本，未知码值保留原值：

`src/views/orders/index/config/columns.ts` · L3 · 新增订单代码 · 2026-10-10 复核。

<!-- evidence-source: {"label": "新增订单代码", "path": "src/views/orders/index/config/columns.ts", "start": 3, "end": 3, "source": "working-tree", "sha256": "b839128757a0aa58cd94d212ae12628a300a422bb0716ed291d82517cf3abb6f", "checked": "2026-10-10"} -->

```ts:line-numbers=3
import { TRADE_STATUS, TRADE_STATUS_LABEL } from './data';
```

`src/views/orders/index/config/columns.ts` · L33–L44 · 新增订单代码 · 2026-10-10 复核。

<!-- evidence-source: {"label": "新增订单代码", "path": "src/views/orders/index/config/columns.ts", "start": 33, "end": 44, "source": "working-tree", "sha256": "b839128757a0aa58cd94d212ae12628a300a422bb0716ed291d82517cf3abb6f", "checked": "2026-10-10"} -->

```ts:line-numbers=33
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

</details>

**本次结论：支付状态的“定义一处、两处引用”已对应。** 但该 Skill 还要求筛选哨兵值（例如表示“不筛选”的空值）必须命名：

`.cursor/skills/ai-code-constant/SKILL.md` · L27 · Skill 原文 · 2026-10-10 复核。

<!-- evidence-source: {"label": "Skill 原文", "path": ".cursor/skills/ai-code-constant/SKILL.md", "start": 27, "end": 27, "source": "working-tree", "sha256": "49be9269052f34b0d0f062907fe7a2b2f27bf5cf52745ff20548dcc8dc013e41", "checked": "2026-10-10"} -->

> 业务状态、类型、渠道、固定字典标识和筛选哨兵值必须命名，即便只有一个调用方。码值仅在定义处维护，比较、赋值、默认值、请求参数、switch 分支、选项 value 和模板绑定均引用常量。

初始查询里仍直接写了空字符串：

`src/views/orders/index/config/searchForm.ts` · L26 · 新增订单代码 · 2026-10-10 复核。

<!-- evidence-source: {"label": "新增订单代码", "path": "src/views/orders/index/config/searchForm.ts", "start": 26, "end": 26, "source": "working-tree", "sha256": "f37a5f54ef7f1f0156b5ef349e84166d464f13560bc0e342e2a873fb5841dab9", "checked": "2026-10-10"} -->

```ts:line-numbers=26
  trade_status: '',
```

这就是**同一份 Skill 中尚未落实的一条要求**。常量归属也待团队确认，自动检查尚未配置，不能把这一例写成“常量 Skill 全部通过”。[查看常量的完整核对记录](/examples/order-generation-evidence-notes#constants)。

## 例子四：ai-code-type · 订单类型有没有各写一份？ {#types}

**这条规则要求同一份订单数据共用同一份类型定义。** API 和表格都要知道订单有哪些字段，应通过导入保持一致。

**你写的规则原文：**

`.cursor/skills/ai-code-type/SKILL.md` · L26 · Skill 原文 · 2026-10-10 复核。

<!-- evidence-source: {"label": "Skill 原文", "path": ".cursor/skills/ai-code-type/SKILL.md", "start": 26, "end": 26, "source": "working-tree", "sha256": "d1b26fbd5e2613b72f9dedb098ec952eb1c07dc49e33bc363d92bde0c3c6e2b3", "checked": "2026-10-10"} -->

> **同一业务语义、同一契约只能有一份权威类型定义。** 页面、组件、组合式函数、API 和 Store 从所属模块导入；不得在全局与局部各维护一份，换名复制字段结构同样违规。

**实际代码：** 订单实体 `OrderListItem` 在订单 API 模块中定义并导出。

`src/api/orders.ts` · L38–L53 · API 模块中新增的类型 · 2026-10-10 复核。

<!-- evidence-source: {"label": "API 模块中新增的类型", "path": "src/api/orders.ts", "start": 38, "end": 53, "source": "working-tree", "sha256": "ae9c38eddf8acb1463c885ea6c8c1694a044464c06e5dda39773d6beb338d3ed", "checked": "2026-10-10"} -->

```ts{1}:line-numbers=38
export interface OrderListItem {
  order_no: string;
  order_email: string;
  created_at: string;
  order_type: string;
  order_amount: string;
  video_title: string;
  title: string | null;
  trade_status: number | null;
  pay_status?: string;
  trade_order_info: string;
  order_country: string;
  site_name: string;
  uuid: number;
  user_url: string;
}
```

表格配置直接导入它，并把它用作每行数据的类型：

`src/views/orders/index/config/columns.ts` · L1–L5 · 新增订单代码 · 2026-10-10 复核。

<!-- evidence-source: {"label": "新增订单代码", "path": "src/views/orders/index/config/columns.ts", "start": 1, "end": 5, "source": "working-tree", "sha256": "b839128757a0aa58cd94d212ae12628a300a422bb0716ed291d82517cf3abb6f", "checked": "2026-10-10"} -->

```ts{2,5}:line-numbers=1
import { ElLink } from 'element-plus';
import type { OrderListItem } from '@/api/orders';
import { TRADE_STATUS, TRADE_STATUS_LABEL } from './data';

type ColumnRender = (h, scope: { row: OrderListItem }) => unknown;
```

**怎么对上：** 第 2 行的 `import type`（仅导入类型）指向订单 API；第 5 行的 `row: OrderListItem` 表示表格行沿用同一份定义。表格配置没有再复制一份订单字段。

<details class="evidence-card">
<summary>再看一条类型规则：状态类型由常量派生</summary>

`.cursor/skills/ai-code-type/SKILL.md` · L35 · Skill 原文 · 2026-10-10 复核。

<!-- evidence-source: {"label": "Skill 原文", "path": ".cursor/skills/ai-code-type/SKILL.md", "start": 35, "end": 35, "source": "working-tree", "sha256": "d1b26fbd5e2613b72f9dedb098ec952eb1c07dc49e33bc363d92bde0c3c6e2b3", "checked": "2026-10-10"} -->

> 业务码值从已有常量派生类型，例如 `typeof STATUS[keyof typeof STATUS]`，不手写另一份联合值。实体状态与包含“全部”的筛选值分开建模，提交请求时按契约转换，不能把筛选值扩进实体状态。

`TradeStatus` 的允许值直接取自 `TRADE_STATUS`，不用再手写一份 `0 | 1`：

`src/views/orders/index/config/data.ts` · L14 · 新增订单代码 · 2026-10-10 复核。

<!-- evidence-source: {"label": "新增订单代码", "path": "src/views/orders/index/config/data.ts", "start": 14, "end": 14, "source": "working-tree", "sha256": "435a24444a86f9373aa0aaeee8c18d90f37a9bea557206626aa5d0c3f24a98c0", "checked": "2026-10-10"} -->

```ts:line-numbers=14
export type TradeStatus = (typeof TRADE_STATUS)[keyof typeof TRADE_STATUS];
```

搜索配置导入并使用这个类型，另外保留查询用的空值。这个派生关系符合类型规则；空值尚未命名的问题见上一例。

`src/views/orders/index/config/searchForm.ts` · L1–L10 · 新增订单代码 · 2026-10-10 复核。

<!-- evidence-source: {"label": "新增订单代码", "path": "src/views/orders/index/config/searchForm.ts", "start": 1, "end": 10, "source": "working-tree", "sha256": "f37a5f54ef7f1f0156b5ef349e84166d464f13560bc0e342e2a873fb5841dab9", "checked": "2026-10-10"} -->

```ts{1,8}:line-numbers=1
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

</details>

**本次结论：类型的定义、导入和派生关系有明确对应。** 这不等于字段已经与后端核实：API 注释说明订单字段参考了另一个端点；本次也没有执行 `vue-tsc`（Vue 的 TypeScript 类型检查）。[查看接口契约缺口](/examples/order-generation-evidence-notes#contract-gap)。

## profile 补充了什么项目约定？ {#profile-comparison}

**填写 profile，是把“按项目习惯写”变成明确的组件名、目录和参考入口。** 这次实验里，可以看到这些对应：

| 项目档案里的内容 | 填写后明确了什么 | 订单页的实际结果 |
| --- | --- | --- |
| 搜索组件待填写 | 使用 `NewSearchForm` | 导入并使用这个组件 |
| 页面目录是通用模板 | 按用户列表组织成 5 个文件 | 生成目录与填写后的结构一致 |
| 查询能力待填写 | 优先复用 `usePageList` | 页面调用它处理查询和分页 |

以目录为例，两边放在一起就容易理解。下面只列文件名，便于对照：

<div class="evidence-compare" id="directory">
<div>

<p class="evidence-caption">profile 里约定的结构</p>

```text:no-line-numbers
pageName/
├── index.vue
├── index.scss
└── config/
    ├── searchForm.ts
    ├── columns.ts
    └── data.ts
```

</div>
<div>

<p class="evidence-caption">订单页实际生成的结构</p>

```text:no-line-numbers
orders/index/
├── index.vue
├── index.scss
└── config/
    ├── searchForm.ts
    ├── columns.ts
    └── data.ts
```

</div>
</div>

这里检查的是：**我们在档案中明确了怎么拆文件，生成结果采用了同样的结构。** 目录中的页面、样式、搜索配置、表格列和数据字典各有位置。

[展开填写前后的 profile 原文](/examples/order-generation-evidence-notes#profile-comparison)，或[核对实际文件清单](/examples/order-generation-evidence-notes#directory)。

### 查询与分页：接入已有能力 {#query}

**admin Skill 要求优先复用已有查询能力 → profile 推荐 `usePageList` → 订单页实际导入并调用它。** 这里核对的是后台规则与项目复用约定；接入现有 Hook，不代表生成时读取过 `ai-code-hook`。

`usePageList` 是项目已有的 Hook（组合式函数），负责列表、加载状态、页码等逻辑。订单页导入了它：

<!-- evidence-source: {"label": "讲解页摘录", "path": "src/views/orders/index/index.vue", "start": 66, "end": 66, "source": "working-tree", "sha256": "220f4e89f3c5f1b05e8e452d08e001cf4536cf59c4ae20d9dd6f8c9de73719e3", "checked": "2026-10-09"} -->

```ts:line-numbers=66
  import { usePageList } from '@/hooks/usePageList';
```

<details class="evidence-card">
<summary>展开订单页的实际调用片段</summary>

下面的接入片段把初始查询和列表请求交给 `usePageList`。完整函数见[详细证据](/examples/order-generation-evidence-notes#query)。

<!-- evidence-source: {"label": "讲解页摘录", "path": "src/views/orders/index/index.vue", "start": 122, "end": 130, "source": "working-tree", "sha256": "220f4e89f3c5f1b05e8e452d08e001cf4536cf59c4ae20d9dd6f8c9de73719e3", "checked": "2026-10-09"} -->

```ts:line-numbers=122
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

</details>

例如，“搜索后回到第 1 页”已经写在这个已有 Hook 中：

<!-- evidence-source: {"label": "讲解页摘录", "path": "src/hooks/usePageList.ts", "start": 113, "end": 117, "source": "working-tree", "sha256": "c1fb109cddde42ca5cee9755dcdddf3102239f7347b6deb722da65c573048d03", "checked": "2026-10-09"} -->

```ts{3}:line-numbers=113
  function onSubmit(form: Partial<TQuery>) {
    Object.assign(queryForm, form);
    pageParams.currentPage = 1;
    getData();
  }
```

高亮的一行把页码设为 1，下一行重新查询。**这段是项目已有能力；这次订单页的生成代码接入了它。**

讲这个例子时，可以说：“我们不只规定界面用哪个组件，也把查询能力写进档案。生成页接入同一个分页函数，搜索回首页等行为就有现成实现可复用。”

实际点击搜索、重置和翻页后是否符合需求，还要按[页面验收步骤](/tutorial/first-page#_3-打开页面-人工验收)检查。

## 讲给别人听，可以直接用这段话

> 我们把通用的编码要求写在 Skills 里，把当前项目的组件、目录和参考入口写在 profile 里。
>
> 这次订单页能找到四类对应：后台规则对应搜索组件复用；API 规则对应响应取值和失败处理；常量规则对应筛选与表格共用支付状态；类型规则对应表格引用 API 的订单类型。
>
> 每条都有规则原文和代码位置。我们也找到了没做完整的地方，例如筛选空值还没按常量规则命名。这样就知道哪些要求落到了代码里、哪些还要补，而不是只看页面能不能显示。

## 怎么验证自己写的 Skill 是否有效？ {#skill-verification}

**先把每条规则变成能核对的检查点。** 例如，常量 Skill 可以检查“筛选与表格是否引用同一定义”“筛选空值是否命名”。这次前一项有对应，后一项发现了缺口，比笼统地说“用了 Skill”更具体。

| 要回答的问题 | 需要保留什么 | 这次有什么 |
| --- | --- | --- |
| 规则有没有落实？ | 规则原文、对应代码、逐项结论 | 上面四个例子，包含已对应与未落实项 |
| 生成时有没有读取这份 Skill？ | 当时的对话或文件读取记录 | 未提供，不能从代码反推 |
| 修正后有没有改善？ | 同一检查点的修改前后代码、检查结果 | 尚未做后续修正与复验 |

下次生成时保留读取记录，生成后按同一组检查点核对；发现缺口后修正代码或澄清规则，再检查原来的问题是否消失。**这就把“写了规则”接到了“执行、检查、修正”的闭环上。** 若要证明使用 Skill 比不使用更有效，还需要在相同需求和项目档案下做对照实验；本页没有做这项实验。

## 看完代码，怎么完成最后的验收？ {#gaps}

**对上规则之后，还要验证页面行为，并更新已经过时的档案。** 这次实验还有这些事要处理：

| 要做的事 | 这次发现的具体情况 |
| --- | --- |
| 更新项目档案 | profile 还写着“订单页不存在”，生成页面后需要更新 |
| 明确导出范围 | 当前只导出这一页数据，需要确认业务要当前页还是全部筛选结果 |
| 核实接口与主题 | 部分响应字段待确认，部分颜色仍是固定值，需要联调和检查 |
| 确认团队选择 | 分页记忆、常量放在哪里等，档案中仍有待确认项 |

<p id="verification">已完成的检查：2026-10-09 为整理对照材料，对订单页、API 和三个配置文件执行 ESLint（静态代码检查），结果通过。这次取证未执行类型检查、真实接口联调和页面点击验收。</p>

因此，这页说明的是**生成代码与哪些规则对应**。若要证明生成时实际读取过哪份 Skill，还需要当时的对话或工具记录。

[查看完整源码、规则原文与检查记录](/examples/order-generation-evidence-notes)。详细记录保留 7 组对照、原始行号和版本信息，讲解时可以按需打开。

<p class="evidence-footnote">案例材料核对于 2026-10-09，来自 front-aggregate 的 AI Code 0.5.0 实验。2026-10-10 补充并复核四个 Skill 的讲解示例，所引文件内容与原取证一致。代码摘录保持原样；目录图和说明文字为讲解整理。来源路径均相对该实验仓库。</p>

接着可以[给订单号增加复制按钮](/examples/query-first-step)，再用同样的方法检查这个小改动。
