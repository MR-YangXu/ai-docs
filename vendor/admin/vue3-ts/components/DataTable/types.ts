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
