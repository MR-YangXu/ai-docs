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
