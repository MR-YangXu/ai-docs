---
title: useTableColumnResize 列宽拖拽 · React
description: React useTableColumnResize 的交互示例、接入方法和接口说明。
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# useTableColumnResize 列宽拖拽 · React

<p class="lead">为原生 Ant Design Table 添加列宽调整。</p>

<div class="component-meta"><span>React · TypeScript</span><span>Ant Design</span><span>源码快照 fc9cc41</span></div>

## 何时使用

适合已有原生 Ant Design Table 的页面。Hook（逻辑钩子）只增强列宽拖拽，数据、分页和偏好存储继续由页面维护。

## 接入

先按[当前技术栈快速开始](/components/react/)准备依赖、样式和源码路径。能力安装标识为 `DataTable`：

```sh
npx @agent-xy/ai-code add admin --only DataTable --dry-run
npx @agent-xy/ai-code add admin --only DataTable
```

## 交互示例

<div class="demo-grid">
<DemoCard stack="react" id="ColumnResizeBasic" title="基础用法" description="最小可运行的 useTableColumnResize 用法。展开代码查看完整调用。" :height="240" :wide="true" />
<DemoCard stack="react" id="ColumnResizeAdvanced" title="配置与交互" description="开启或关闭列宽拖拽，并恢复声明宽度。" :height="240" :wide="true" />
</div>

## API

| 入口 | 说明 | 默认 / 返回 |
| --- | --- | --- |
| `useTableColumnResize(options)` | 增强原生 Ant Design Table；从 DataTable/column-resize 导入 | 需安装 DataTable 完整目录 |
| `enabled` | 关闭后保持原生表格配置 | true |
| `columns / components / scroll / tableLayout / className / rowSelection` | 输入原生表格配置 | 按需传入 |
| `minColumnWidth / maxColumnWidth` | 限制调整范围 | 80 / 800 |
| `resizeDisabled(column,index)` | 控制指定列是否可拖拽 | 可选 |
| `onColumnResizeEnd` | 取得 column、columnKey、width | 可连接业务持久化 |
| `onColumnWidthsReset` | 重置时通知调用者 | 可选 |
| `tableProps` | 整体透传给原生 Table | 包含列、表头和滚动适配 |
| `resetColumnWidths()` | 恢复当前列配置声明的宽度 | void |

::: details 完整类型定义

```ts
import type { TableColumnsType, TableProps } from "antd";
import type { ColumnType } from "antd/es/table";

export type ResizableColumn<Row> = TableColumnsType<Row>[number] & {
  children?: TableColumnsType<Row>;
  dataIndex?: ColumnType<Row>["dataIndex"];
  hidden?: boolean;
  minWidth?: ColumnType<Row>["minWidth"];
};

export interface ColumnResizeOptions<Row> {
  maxColumnWidth?: number;
  minColumnWidth?: number;
  onColumnResizeEnd?: (params: {
    column: ResizableColumn<Row>;
    columnKey: string;
    width: number;
  }) => void;
  /** 显式重置完成后通知一次；由页面按需同步偏好存储，不触发拖拽结束事件。 */
  onColumnWidthsReset?: () => void;
  resizeDisabled?: (column: ResizableColumn<Row>, index: number) => boolean;
}

export type ColumnResizeTableProps<Row> = Pick<
  TableProps<Row>,
  "columns" | "components" | "scroll" | "tableLayout" | "className"
>;

export interface UseTableColumnResizeOptions<Row>
  extends ColumnResizeOptions<Row>,
    ColumnResizeTableProps<Row> {
  /** 默认启用；关闭时原样返回原生表格参数，并清理临时列宽。 */
  enabled?: boolean;
  rowSelection?: TableProps<Row>["rowSelection"];
}

export interface TableColumnResizeResult<Row> {
  /** 整体传给 Antd Table；包含列、表头组件、滚动、布局和样式类。 */
  tableProps: ColumnResizeTableProps<Row>;
  resetColumnWidths: () => void;
}

```

:::

## 常见问题

为可拖拽叶子列设置稳定 key 和数值 width/minWidth。百分比宽度不提供拖动手柄。不要丢弃返回的 tableProps 中的 components 或 className。

示例代码中的 `@/` 指向已复制源码的根目录；相对引用的模拟数据文件也列在源码面板中。业务接入时替换请求函数，并保留组件约定的输入输出。
