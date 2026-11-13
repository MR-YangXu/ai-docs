---
title: DataTable 数据表格 · React
description: React DataTable 的交互示例、接入方法和接口说明。
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# DataTable 数据表格 · React

<p class="lead">展示数据、分页与自定义单元格。</p>

<div class="component-meta"><span>React · TypeScript</span><span>Ant Design</span><span>源码快照 fc9cc41</span></div>

## 何时使用

适合列表展示、分页和自定义单元格。数据请求由页面或列表逻辑管理，表格负责展示与事件通知。

## 接入

先按[当前技术栈快速开始](/components/react/)准备依赖、样式和源码路径。能力安装标识为 `DataTable`：

```sh
npx @agent-xy/ai-code add admin --only DataTable --dry-run
npx @agent-xy/ai-code add admin --only DataTable
```

## 交互示例

<div class="demo-grid">
<DemoCard stack="react" id="DataTableBasic" title="基础用法" description="最小可运行的 DataTable 用法。展开代码查看完整调用。" :height="420" :wide="true" />
<DemoCard stack="react" id="DataTableAdvanced" title="配置与交互" description="列设置、自定义内容与列宽调整。" :height="420" :wide="true" />
</div>

## API

| 入口 | 说明 | 默认 / 返回 |
| --- | --- | --- |
| `dataSource / columns / rowKey` | 原生数据源、扩展列配置和稳定主键 | rowKey 必填 |
| `pagination / onChange` | 受控分页；分页、排序、筛选统一从 onChange 处理 | 分页默认关闭 |
| `columnSettings / columnVisibility / defaultColumnVisibility` | 列设置入口与受控/非受控显隐 | columnSettings=true |
| `onColumnVisibilityChange` | 用户改变列显隐时通知 | 可选 |
| `autoHeight / resizable` | 按容器计算高度 / 列宽拖拽 | false / false |
| `cellSlots / toolbar / renderBatchActions` | 自定义单元格、工具栏和受控批量操作 | 可选 |
| `emptyCellText / messages` | 空值与工具栏文案 | 见完整说明 |
| `ref.resetColumnWidths()` | 恢复当前声明列宽 | void |

::: details 完整参数、事件和接入约定

以下内容摘自来源仓库 README，其中的运行目录和验证脚本均指来源仓库。本站启动与示例接入以本页“接入”和技术栈快速开始为准。

基于 Ant Design Table 的独立公共表格，提供连续分组表头、列显隐、工具栏和批量操作区。数据请求、权限、业务转换与偏好存储由页面负责。

已验证 React 18.3.1、React 19.1.0、Ant Design 5.27.6、TypeScript 5.9.3。使用 `forwardRef` 转发引用；React 19 的 Ant Design 5 兼容补丁见 `技术栈 README`。

#### 最小使用

```tsx
import type { DataTableColumn } from './components/DataTable'
import { DataTable } from './components/DataTable'

interface Row { id: number, name: string, count: number }

const columns: DataTableColumn<Row>[] = [
  { dataIndex: 'name', title: '名称' },
  { dataIndex: 'count', title: '数量', group: '统计' },
]

export function Example() {
  return (
    <DataTable<Row>
      rowKey="id"
      columns={columns}
      dataSource={[{ id: 1, name: '示例', count: 0 }]}
    />
  )
}
```

完整页面见 `订单管理` 和 `用户管理`。在技术栈目录执行 `npm ci && npm run dev`，打开终端提供的地址。代码片段假设调用方位于源码根目录，其他目录需调整相对导入。

#### 属性和规则

原生 `TableProps<Row>` 的属性直接传入；`className/style` 作用于外层容器。`columns`、`rowKey`、`pagination` 使用以下明确契约：

| 属性                       | 约定                                                                                                           |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `columns`                  | 扁平 `DataTableColumn<Row>[]`；优先使用 `key`，省略时从 `dataIndex` 生成唯一列标识                             |
| `cellSlots`                | 可选单元格插槽表，按列标识匹配，接收 `{ value, row, column, index }`                                           |
| `ref`                      | 仅暴露 `resetColumnWidths()`，恢复当前列配置声明的宽度                                                         |
| `rowKey`                   | 必填；使用稳定的业务主键或函数                                                                                 |
| `pagination`               | 默认关闭；开启时传入 `current/pageSize/total`，由页面控制                                                      |
| `onChange`                 | 原生 `(pagination, filters, sorter, extra)`；分页、排序、筛选统一从这里处理                                    |
| `columnSettings`           | 默认 `true`；显示列设置入口                                                                                    |
| `columnVisibility`         | 可选受控显隐表，键为显式或自动生成的列标识；未指定的列默认可见                                                 |
| `defaultColumnVisibility`  | 内部显隐模式的初值；挂载后改变这个对象不重置用户设置                                                           |
| `onColumnVisibilityChange` | 用户操作一次回调一次，传当前所有列的显隐表                                                                     |
| `toolbar`                  | 工具栏内容                                                                                                     |
| `autoHeight`               | 默认 `false`；开启后填满有确定高度的父容器，自动扣除工具栏、表头和分页等占用                                   |
| `resizable`                | 默认 `false`；传 `true` 开启列宽拖拽，也可配置宽度范围、禁用判断、`onColumnResizeEnd` 与 `onColumnWidthsReset` |
| `messages`                 | 列设置文案覆盖；默认跟随应用 ConfigProvider 的中英文语言，原生表格仍使用 `locale`                              |
| `renderBatchActions`       | 接收 `{ selectedRowKeys }`；使用时必须传受控 `rowSelection.selectedRowKeys`                                    |
| `emptyCellText`            | 默认 `—`，用于无自定义渲染时的 `null/undefined/空字符串`                                                       |

分页配置排除 `onChange/onShowSizeChange/defaultCurrent/defaultPageSize`，避免重复入口。页面按 `extra.action` 一次更新查询状态，搜索或每页数量变化后是否回第一页也由页面决定。`sorter: true` 只通知远程排序；原生比较函数仍代表本地排序。

选择原样使用 `rowSelection`。跨页选择建议设置 `preserveSelectedRowKeys: true`，批量操作使用主键；组件不保存跨页行记录缓存，也不保证原生 `selectedRows` 是全量最新业务数据。

#### 列配置

继承原生列配置，增加 `group`、`settingLabel`、`hideable`、`formatter`。普通数据列只需填写 `dataIndex`；本组件选择扁平分组契约，不接收 `children` 树形列和原生 `hidden`。

- 列标识优先使用显式 `key`；省略时，字符串或数字 `dataIndex` 转为字符串，非空数组路径生成 `path:${JSON.stringify(dataIndex)}`。例如 `name` 对应 `name`，`['user', 'name']` 对应 `path:["user","name"]`，与字面字段 `user.name` 区分。
- 操作列、计算列等没有有效 `dataIndex` 的列必须提供非空 `key`；同一字段展示多列时需要不同的列标识。缺失或重复标识会报错，不使用标题或数组下标兜底。显式空字符串 `key` 也会报错。
- 列显隐、分组和拖拽回调统一使用生成后的标识，原始列对象保持不变。需要方便地引用嵌套字段，或让列身份独立于取值路径时，可显式设置 `key`。
- `group` 合并原始数组中连续、组名相同且固定方向相同的列；先确定分组再处理显隐。去除组名首尾空白，`fixed: true` 视为左固定。
- 全组隐藏后移除组标题，恢复显示后保持顺序。非连续同名组不会因隐藏中间列而合并。
- `hideable: false` 强制可见并禁用对应复选框。权限不可见列应由页面移除，不依赖列设置控制。
- `settingLabel` 用于列设置名称；未传时使用非函数 `title`，否则回退到 `key`。
- 渲染优先级为 `cellSlots[key]` → 原生 `render` → 文本 `formatter` → 默认文本。插槽返回 `null/undefined/false/空字符串` 会保持留空，返回 `0` 正常展示；显式 `render` 返回 `null` 也保持留空。
- `formatter(value: unknown, record: Row, index)` 返回文本、数字或空值。默认展示将非空值转为字符串，复杂节点通过 `render` 提供。
- 更新标题、数据、渲染器不会重置用户显隐；新增列按挂载时的默认显隐表初始化，否则显示；删除列清理内部状态。
- 全列隐藏或数据为空时，设置入口仍可用。空数据保留表头并使用原生空态。

`resizable` 通过目录内的 `useTableColumnResize` Hook 直接增强 Antd Table，拖拽手柄由 `ResizableHeaderCell` 渲染。跨项目复制需携带整个 `DataTable/` 目录，样式使用 SCSS。只记录用户实际调整的宽度，未拖动列始终跟随最新声明宽度。

分组叶子列的宽度在数据刷新及列配置重建后保留；删除或隐藏列后再次加入使用传入的声明宽度。关闭拖拽清理临时列宽，重新启用时使用声明宽度。通过回调持久化的宽度应由页面回填到列定义中。开启拖拽时会接管 `components.header.cell`，其他表头组件、表体组件和 `onHeaderCell` 的原生事件仍保留；当前拖拽交互面向鼠标。

#### 单元格插槽与重置列宽

普通列直接用字段名匹配插槽；显式 `key` 优先。嵌套字段可设置易读的 `key`，或使用生成的路径标识。`row` 保留业务泛型，`value` 为未经 `formatter` 处理的原始值（类型为 `unknown`），`column.key` 已完成标准化，`index` 为 Antd 提供的渲染行下标，不包含分页偏移。插槽只控制单元格内容，排序、筛选、`onCell` 等继续使用原生配置。

```tsx
import type { DataTableColumn, DataTableRef } from './components/DataTable'
import { Button, Tag } from 'antd'
import { useRef } from 'react'
import { DataTable } from './components/DataTable'

interface Account { id: string, name: string, enabled: boolean }

const columns: DataTableColumn<Account>[] = [
  { dataIndex: 'name', title: '名称', width: 200 },
  { dataIndex: 'enabled', title: '状态', width: 120 },
  { key: 'operation', title: '操作', width: 120 },
]

export function AccountTable({ rows, onEdit }: { rows: Account[], onEdit: (row: Account) => void }) {
  const tableRef = useRef<DataTableRef>(null)
  return (
    <>
      <Button onClick={() => tableRef.current?.resetColumnWidths()}>重置列宽</Button>
      <DataTable<Account>
        ref={tableRef}
        resizable
        rowKey="id"
        columns={columns}
        dataSource={rows}
        cellSlots={{
          enabled: ({ row }) => <Tag>{row.enabled ? '启用' : '停用'}</Tag>,
          operation: ({ row }) => <Button onClick={() => onEdit(row)}>编辑</Button>,
        }}
      />
    </>
  )
}
```

开启拖拽后，“列设置”面板底部自带重置按钮，文案可通过 `messages.resetColumnWidths` 覆盖。`columnSettings={false}` 时可像上例通过引用方法提供自定义入口。关闭拖拽时调用重置不执行任何操作。

重置恢复当前 `columns` 的声明宽度，不改变列显隐、分页或选择状态。若声明宽度来自服务端偏好，它就是此次重置的基线；需要恢复业务最初的默认宽度时，应由页面先更新列配置，再调用重置。通过 `resizable` 中的 `onColumnWidthsReset: handleReset` 可接收每次显式重置的通知，并由页面按需同步偏好存储；组件不自动清除存储，也不会把重置伪装成逐列拖拽结束事件。

#### 单独使用拖拽 Hook

已有原生 Antd 表格也可直接使用 `DataTable/column-resize`，无需接入工具栏、列显隐和受控分页契约：

```tsx
import type { TableProps } from 'antd'
import { Button, Table } from 'antd'
import { useTableColumnResize } from './components/DataTable/column-resize'

export function ResizableList<Row extends object>(props: TableProps<Row>) {
  const { tableProps, resetColumnWidths } = useTableColumnResize<Row>({
    ...props,
    minColumnWidth: 80,
    maxColumnWidth: 800,
  })
  return (
    <>
      <Button onClick={resetColumnWidths}>重置列宽</Button>
      <Table<Row> {...props} {...tableProps} />
    </>
  )
}
```

Hook 接收原生 `columns/components/scroll/tableLayout/className/rowSelection` 和拖拽选项，返回要整体透传给 Table 的 `tableProps` 及重置方法。直接调用时 `enabled` 默认 `true`；传 `false` 会原样保留原生列、表头、滚动、布局与样式类。建议所有叶子列指定稳定且唯一的 `key`，并提供数值 `width` 或 `minWidth`；百分比宽度不显示拖动手柄。Hook 不返回或管理数据、选择状态、分页和持久化。

#### 项目接入与自动高度

组件不内置请求、存储和导出。页面自行维护列偏好时，可以通过 `adapt-columns.ts` 的 `adaptAntdColumns(columns)` 转换原生扁平列，并关闭内置 `columnSettings`。拖拽回调由页面持久化，组件不依赖任何业务存储。

```tsx
<div style={{ height: 600 }}>
  <DataTable<Row>
    autoHeight
    resizable={{ minColumnWidth: 80, maxColumnWidth: 800 }}
    rowKey="id"
    columns={columns}
    dataSource={rows}
    scroll={{ x: 'max-content' }}
  />
</div>
```

`autoHeight` 覆盖 `scroll.y`，通过 ResizeObserver 监听工具栏换行后的剩余空间、表头、分页和空态变化。不要再对同一个表格叠加 `useAntdTableAutoHeight`。自定义 `components.body` 如果替换了原生滚动 DOM，应关闭自动高度并自行传入 `scroll.y`。

#### 验证

在文档仓库执行 `npm run typecheck --workspace @ai-doc/demo-react` 检查本站示例类型，执行 `npm run docs:build` 构建并检查文档与示例。业务接入后使用项目自身的类型检查、构建和交互验证命令。
:::

::: details 完整类型定义

```ts
import type { TableProps } from "antd";
import type { ColumnType } from "antd/es/table";
import type { CSSProperties, Key, ReactNode, Ref } from "react";
import type { ColumnResizeOptions } from "./column-resize";

export interface DataTableColumn<Row extends object>
  extends Omit<ColumnType<Row>, "key" | "children" | "hidden"> {
  /** 稳定且唯一的列标识；省略时从 dataIndex 生成，无数据字段或重复字段的列需显式提供。 */
  key?: string;
  /** 只合并连续且固定方向一致的列。 */
  group?: string;
  /** 标题是函数或复杂节点时，可单独提供列设置名称。 */
  settingLabel?: ReactNode;
  hideable?: boolean;
  formatter?: (
    value: unknown,
    record: Row,
    index: number,
  ) => string | number | null | undefined;
}

export type ColumnVisibility = Record<string, boolean>;

export interface DataTableCellContext<Row extends object> {
  /** dataIndex 对应的原始值；复杂字段可直接从 row 读取。 */
  value: unknown;
  row: Row;
  column: DataTableColumn<Row> & { key: string };
  /** Antd 提供的当前渲染行下标，不包含分页偏移。 */
  index: number;
}

export type DataTableCellSlots<Row extends object> = Record<
  string,
  ((context: DataTableCellContext<Row>) => ReactNode) | undefined
>;

export interface DataTableRef {
  /** 恢复当前 columns 声明的列宽；关闭拖拽时不执行。 */
  resetColumnWidths: () => void;
}

export interface DataTableMessages {
  columnSettings: string;
  columnsTitle: string;
  columnsAriaLabel: string;
  resetColumnWidths: string;
}

export interface DataTablePagination
  extends Omit<
    Exclude<TableProps<object>["pagination"], boolean | undefined>,
    "onChange" | "onShowSizeChange" | "defaultCurrent" | "defaultPageSize"
  > {
  current: number;
  pageSize: number;
  total: number;
}

export interface DataTableProps<Row extends object>
  extends Omit<
    TableProps<Row>,
    "columns" | "rowKey" | "className" | "style" | "pagination"
  > {
  columns: DataTableColumn<Row>[];
  /** 按列标识匹配；优先于 render 和 formatter，返回空值时不回退。 */
  cellSlots?: DataTableCellSlots<Row>;
  ref?: Ref<DataTableRef>;
  rowKey: NonNullable<TableProps<Row>["rowKey"]>;
  /** 不传时关闭分页。分页事件统一由表格 onChange 发出。 */
  pagination?: DataTablePagination | false;
  className?: string;
  style?: CSSProperties;
  toolbar?: ReactNode;
  /** 父容器需有确定高度；工具栏在滚动区域之外，分页始终计入可用高度。 */
  autoHeight?: boolean;
  /** 内置列宽拖拽；回调可连接已有列配置存储。 */
  resizable?: boolean | ColumnResizeOptions<Row>;
  columnSettings?: boolean;
  /** 扩展工具栏文案；原生表格文案仍使用 TableProps.locale。 */
  messages?: Partial<DataTableMessages>;
  columnVisibility?: ColumnVisibility;
  defaultColumnVisibility?: ColumnVisibility;
  onColumnVisibilityChange?: (visibility: ColumnVisibility) => void;
  emptyCellText?: string;
  /** 使用时必须传入受控 selectedRowKeys；不承诺持有跨页行记录快照。 */
  renderBatchActions?: (context: { selectedRowKeys: Key[] }) => ReactNode;
}

```

:::

## 常见问题

`rowKey` 使用稳定业务标识。枚举格式化和操作区使用 `formatter/render/cellSlots`；分页通过受控 `pagination` 与 `onChange` 更新并请求数据，选择状态通过 `rowSelection` 管理。空数据与加载失败应分别展示。

示例代码中的 `@/` 指向已复制源码的根目录；相对引用的模拟数据文件也列在源码面板中。业务接入时替换请求函数，并保留组件约定的输入输出。
