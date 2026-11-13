---
title: DataTable 数据表格 · Vue 3
description: Vue 3 DataTable 的交互示例、接入方法和接口说明。
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# DataTable 数据表格 · Vue 3

<p class="lead">展示数据、分页与自定义单元格。</p>

<div class="component-meta"><span>Vue 3 · TypeScript</span><span>Element Plus</span><span>源码快照 fc9cc41</span></div>

## 何时使用

适合列表展示、分页和自定义单元格。数据请求由页面或列表逻辑管理，表格负责展示与事件通知。

## 接入

先按[当前技术栈快速开始](/components/vue3/)准备依赖、样式和源码路径。能力安装标识为 `DataTable`：

```sh
npx @agent-xy/ai-code add admin --only DataTable --dry-run
npx @agent-xy/ai-code add admin --only DataTable
```

## 交互示例

<div class="demo-grid">
<DemoCard stack="vue3" id="DataTableBasic" title="基础用法" description="最小可运行的 DataTable 用法。展开代码查看完整调用。" :height="420" :wide="true" />
<DemoCard stack="vue3" id="DataTableAdvanced" title="配置与交互" description="列设置、自定义内容与列宽调整。" :height="420" :wide="true" />
</div>

## API

| 入口 | 说明 | 默认 / 返回 |
| --- | --- | --- |
| `tableData / tableColumns / rowKey` | 数据、列配置与稳定主键 | rowKey 必填 |
| `pageParams` | 受控分页；支持两种分页字段结构 | 可选 |
| `selection / reserveSelection` | 行选择与跨页保留 | false |
| `showColumnSettings / showSerialNumber` | 列设置入口 / 序号 | true |
| `tableHeight / maxHeight / resizable` | 高度与列宽调整 | 透传原生表格 |
| 事件 | handle-current-change、handle-size-change、handle-selection-change、handle-sort-change | 对应对象或行数组 |
| 插槽 | prop 字段插槽、header-prop、toolbar、multiple-operation、empty | 按需配置 |
| 实例方法 | clearSort、sort、doLayout、clearSelection、getSelectionRows、toggleRowSelection | TableExpose&lt;Row&gt; |

::: details 完整参数、事件和接入约定

以下内容摘自来源仓库 README，其中的运行目录和验证脚本均指来源仓库。本站启动与示例接入以本页“接入”和技术栈快速开始为准。

基于 Element Plus 的泛型表格。完整调用见 `订单管理` 和 `用户管理`。

| 属性 | 用途 |
| --- | --- |
| `tableData: Row[] / tableColumns: TableColumn<Row>[]` | 行数据与列配置；不在表格内部请求 |
| `rowKey` | 必填稳定行标识；字段名或返回字符串/数字的函数 |
| `pageParams` | `{ currentPage, pageSize, pageSizes?, total }`；也支持列表接口的 page/page_size 结构 |
| `showColumnSettings` | 独立工具栏列设置入口，默认开启 |
| `selection / reserveSelection` | 行选择及跨页保留 |
| `tableHeight / maxHeight / resizable` | 原生高度与列宽调整 |
| `showSerialNumber` | 按当前页计算序号，默认开启 |

列用 `prop` 标识、`label` 展示，支持 width/minWidth、fixed、align、group、sortable、formatter、render、tooltip、lineClamp。连续且固定方向一致的同名 group 合成分组表头。`hideable: false` 禁止隐藏；`showColumn` 表达初始或显式变化的显示配置。修改标题或重建相同配置不重置用户勾选。

单元格插槽按 prop 命名，接收 `{ row, column, index }`；表头使用 `header-${prop}` 插槽。渲染顺序为字段插槽 → render → formatter → 原值；空值不插入 HTML。多行省略按实际溢出测量显示提示，支持键盘聚焦。

`toolbar` 放刷新等操作，`multiple-operation` 接收 `selectionData`，`empty` 自定义空态。其他属性和原生事件透传 ElTable，class/style 放外层容器。

分页事件：`handle-current-change({ pageNum })`、`handle-size-change({ pageSize })`；修改每页数量时去重页码变化。其他事件：`handle-selection-change(rows)`、`handle-sort-change({ prop, order })`。

实例方法：clearSort、sort、doLayout、clearSelection、getSelectionRows、toggleRowSelection。组件外调用需要保存泛型实例类型 `TableExpose<Row>`。
:::

::: details 完整类型定义

```ts
import type { h, VNodeChild } from "vue";

export type SortOrder = "ascending" | "descending" | null;

/** prop 同时作为字段名、列标识和字段插槽名。 */
export interface TableColumn<TRow extends object = Record<string, unknown>> {
  prop: string;
  label: string;
  /** 连续且名称、固定方向相同的列合并为一层分组表头。 */
  group?: string;
  showColumn?: boolean;
  width?: string | number;
  minWidth?: string | number;
  align?: "left" | "center" | "right";
  fixed?: boolean | "left" | "right";
  className?: string;
  tooltip?: boolean;
  lineClamp?: number;
  /** false 时此列不可隐藏，与设置入口的位置无关。 */
  hideable?: boolean;
  sortable?: boolean | "custom";
  sortOrders?: SortOrder[];
  type?: "default" | "enum" | "nested" | "clip";
  path?: string;
  enumList?: { label: string; value: string | number | boolean }[];
  formatter?: (
    row: TRow,
    column: TableColumn<TRow>,
  ) => string | number | null | undefined;
  render?: (createElement: typeof h, scope: TableCellScope<TRow>) => VNodeChild;
  click?: (row: TRow) => void;
}

export interface TableCellScope<TRow extends object = Record<string, unknown>> {
  row: TRow;
  column: TableColumn<TRow>;
  index: number;
}

/** 展示分页状态，不改写查询对象。 */
export interface TablePageParams {
  page?: number;
  page_size?: number;
  page_sizes?: number[];
  currentPage?: number;
  pageSize?: number;
  pageSizes?: number[];
  total?: number;
}

export interface SortChange {
  prop: string;
  order: SortOrder;
}

export interface TableExpose<TRow extends object = Record<string, unknown>> {
  clearSort: () => void;
  sort: (prop: string, order: Exclude<SortOrder, null>) => void;
  doLayout: () => void;
  clearSelection: () => void;
  getSelectionRows: () => TRow[];
  toggleRowSelection: (
    row: TRow,
    selected?: boolean,
    ignoreSelectable?: boolean,
  ) => void;
}

```

:::

## 常见问题

`rowKey` 使用稳定业务标识。枚举格式化和操作区由列配置与插槽实现；`pageParams` 由页面维护，通过 `handle-current-change` 和 `handle-size-change` 更新后请求数据。空数据与加载失败应分别展示。

示例代码中的 `@/` 指向已复制源码的根目录；相对引用的模拟数据文件也列在源码面板中。业务接入时替换请求函数，并保留组件约定的输入输出。
