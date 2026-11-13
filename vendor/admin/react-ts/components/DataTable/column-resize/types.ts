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
