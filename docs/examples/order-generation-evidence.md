---
title: 生成对照：看懂规则如何落地
description: 用订单搜索、页面目录和查询分页三个例子，讲清 Skill 提要求、profile 指定项目用法、生成代码如何对应。
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

<p class="lead">订单页生成以后，除了看它像不像参考图，还要看：它有没有复用我们的组件、沿用我们的目录和查询逻辑？</p>

下面用 front-aggregate 的实际订单页，讲三个例子。先记住这三个分工：

<ol class="evidence-story">
  <li><span>Skill · 技能规则</span><strong>告诉 AI 应该怎么写</strong><p>例如：搜索区优先复用项目已有组件。</p></li>
  <li><span>profile · 项目档案</span><strong>告诉 AI 本项目用什么</strong><p>例如：搜索组件用 NewSearchForm。</p></li>
  <li><span>生成代码</span><strong>检查最终写成了什么</strong><p>例如：订单页确实使用了 NewSearchForm。</p></li>
</ol>

**Skill 提要求，profile 指定项目用法，最后到代码里核对。**

## 例子一：搜索框用了哪个组件？ {#components}

### 先看规则要求

后台 Skill（`ai-code-admin`）要求搜索区优先复用项目已有组件。

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

## 例子二：为什么要先填写 profile？ {#profile-comparison}

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

## 例子三：查询和分页有没有复用现成逻辑？ {#query}

同样按三步看：**Skill 要求优先复用已有查询能力 → profile 推荐 `usePageList` → 订单页实际导入并调用它。**

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
> 比如，Skill 要求复用搜索组件，profile 写明用 NewSearchForm。生成后打开代码，确实看到了这个组件的导入和使用。目录组织、查询分页也可以这样逐项对照。
>
> 这样我们既看页面效果，也能检查代码有没有落实项目约定。发现没落实的地方，再改代码或补充档案，然后重新验证。

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

<p class="evidence-footnote">案例材料核对于 2026-10-09，来自 front-aggregate 的 AI Code 0.5.0 实验。本页根据该次材料整理，代码摘录保持原样；目录图和说明文字为讲解整理。</p>

接着可以[给订单号增加复制按钮](/examples/query-first-step)，再用同样的方法检查这个小改动。
