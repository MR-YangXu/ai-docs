# DataTable

基于 Element Plus 的泛型表格。完整调用见 [订单管理](../../examples/pages/orders/index.vue) 和 [用户管理](../../examples/pages/users/index.vue)。

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
