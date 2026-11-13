# DataTable

Vue 2 列表表格。不发请求。Element UI 的 `el-table` 由本组件局部注册。

`gc`、`dev`、`pod`、`deep-convo-front` 的封装是 `src/components/uTable`。`dev` 另有一个写死操作列的 `commonTable`，不在这套协议里。`front` 的 `CommonTable/BaseTable` 是 Vue 3 + Element Plus，只有列和行，操作列走插槽 `actions`。

本组件不替换各项目里的 `uTable`。新页面可以直接用这里的协议。

## 两种入参

本地列表：

```vue
<data-table
  :table-data="rows"
  :table-columns="columns"
  :page-params="pageParams"
  @handleSelectionChange="onSelect"
  @handleCurrentChange="onPage"
  @handleSizeChange="onSize"
/>
```

`pageParams` 是 `{ currentPage, pageSize, pageSizes, total }`。组件不改这份对象。

和 `uTable` 相同的列表：

```vue
<data-table
  :data="rows"
  :columns="columns"
  :loading="loading"
  :has-pag="true"
  :page-query="pageQuery"
  :on-pagination="load"
/>
```

`pageQuery` 是 `{ page, page_size, total }`。翻页时组件会写入 `page` 和 `page_size`，再调用 `onPagination`，参数是当前这份查询。同时抛出 `pagination`、`handleCurrentChange`、`handleSizeChange`。每页条数超过总数时回到第 1 页。

两份分页不要同时传。`columns` 有内容时优先于 `tableColumns`，`data` 有内容时优先于 `tableData`。

## 列

| 字段 | 说明 |
| --- | --- |
| prop / label / width / minWidth / fixed / align / headerAlign | 传给 `el-table-column`。`align`、`headerAlign` 可以是 `left`、`center`、`right`。未写时第一列左对齐，其余列用表格的 `align`，默认居中 |
| type | `selection`、`index`、`expand`。这三类不渲染单元格 |
| children | 多级表头 |
| visible / showColumn | 为 `false` 时不显示 |
| showTip / tooltip | 超出省略并提示 |
| sortable | 原样交给表格。服务端排序听 `sort-change` |
| render | 单元格。字符串是插槽名；函数参数见下方 |
| renderCellHeader | 表头，同样可以是插槽名或函数 |
| formatter | `(row, column, value, index) => 文本` |
| selectable / reserveSelection | 勾选列 |

单元格优先级：`render` 插槽名、与 `prop` 同名的插槽、`render` 函数、`formatter`、字段文本。`0`、`false`、空字符串会显示。`null` 和 `undefined` 显示 `--`。

`buildColumns` 生成的 `render` 是 `(h, { row, column, index })`。`uTable` 的函数是：

```js
render({ value, row, column, $column, $index, $$index, h })
```

`$$index` 是加上当前页偏移后的序号，从 1 开始。组件按函数形参个数区分这两种写法。

```vue
<data-table :data="rows" :columns="columns">
  <template #action="{ row }">
    <el-button type="text" @click="edit(row)">编辑</el-button>
  </template>
</data-table>
```

```js
columns: [
  { render: "name", label: "名称", minWidth: 160, showTip: true },
  { prop: "amount", label: "金额", formatter: (row) => row.amount },
  {
    label: "分组",
    children: [
      { prop: "city", label: "城市" },
      { prop: "shop", label: "店铺" },
    ],
  },
  { render: "action", label: "操作", width: 120, fixed: "right" },
]
```

`front` 那种固定操作列，写成 `render: 'actions'`，插槽名用 `actions`。

## 表格属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| loading | 加载态 | `false` |
| height | 表格高度 | — |
| rowKey | 行主键 | `id` |
| border | 边框 | `true` |
| align | 除第一列外的默认对齐，`left` / `center` / `right`。第一列未写 `align` 时左对齐，单列写了 `align` 以单列为准 | `center` |
| resizable | 列宽是否可拖 | `true` |
| selection / reserveSelection | 额外勾选列，以及翻页保留。列里已有 `type: 'selection'` 时不再追加 | `false` |
| showSerialNumber / showIndex | 额外序号列。列里已有 `type: 'index'` 时不再追加 | `false` |
| indexMethod | 序号算法 | — |
| shiftSelection | 按住 Shift 连续勾选，交给 `el-table` | `false` |
| noDataShow / emptyText | 空数据文案 | `暂无查询结果` |
| pageSizes / layout | `pageQuery` 分页的条数和布局 | `[20, 50, 100, 150]`、`total, sizes, prev, pager, next, jumper` |

其余 `el-table` 属性从组件属性透传，例如 `stripe`、`span-method`。

`#empty` 替换空状态。`#expand` 增加展开行。`#multiple-operation` 是表头批量操作，参数 `{ selectionData }`。

## 事件和方法

| 事件 | 时机 |
| --- | --- |
| selection-change / handleSelectionChange | 勾选变化，参数是行数组 |
| sort-change / handleSortChange | 排序 |
| row-click / rowClick | 点击行，参数是行、列、事件 |
| expand-change | 展开行 |
| scroll | 表体滚动 |

实例方法与 `el-table` 相同：`clearSelection`、`toggleRowSelection`、`toggleAllSelection`、`toggleRowExpansion`、`setCurrentRow`、`clearSort`、`clearFilter`、`doLayout`、`sort`。`clearSortFn` 等同 `clearSort`。`resetTableScroll` 在重新布局后恢复表体滚动位置。
