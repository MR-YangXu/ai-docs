import type { TableColumnsType, TableProps } from "antd";
import type { ResizableColumn } from "./types";

export function getColumnKey<Row>(
  column: TableColumnsType<Row>[number],
  index: number,
): string {
  if (column.key != null) return String(column.key);
  if ("dataIndex" in column && column.dataIndex != null)
    return Array.isArray(column.dataIndex)
      ? column.dataIndex.join(".")
      : String(column.dataIndex);
  return String(index);
}

/** 分组表头的宽度属于叶子列；列数组重新生成时保留仍存在的叶子列宽度。 */
export function reconcileColumnWidths<Row>(
  columns: TableColumnsType<Row>,
  previous: Record<string, number> = {},
): Record<string, number> {
  const next: Record<string, number> = {};
  function visit(source: TableColumnsType<Row>) {
    source.forEach((column, index) => {
      if ("children" in column && column.children?.length) {
        visit(column.children);
        return;
      }
      const key = getColumnKey(column, index);
      const width = previous[key];
      if (typeof width === "number" && Number.isFinite(width))
        next[key] = width;
    });
  }
  visit(columns);
  return next;
}

export const DEFAULT_MIN_WIDTH = 80;
export const DEFAULT_MAX_WIDTH = 800;
const DEFAULT_SELECTION_COLUMN_WIDTH = 32;

export function getNumberWidth(width: number | string | undefined) {
  return typeof width === "number" && Number.isFinite(width)
    ? width
    : undefined;
}

export function clampWidth(width: number, minWidth: number, maxWidth: number) {
  return Math.min(maxWidth, Math.max(minWidth, Math.round(width)));
}

export function joinClassName(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ") || undefined;
}

export function getColumnsWidth<T>(
  columns: TableColumnsType<T>,
  fallbackWidth: number,
): number {
  return columns.reduce((total, column) => {
    const typedColumn = column as ResizableColumn<T>;
    if (typedColumn.hidden) return total;
    if (typedColumn.children?.length)
      return total + getColumnsWidth(typedColumn.children, fallbackWidth);

    return (
      total +
      (getNumberWidth(typedColumn.width) ??
        getNumberWidth(typedColumn.minWidth) ??
        fallbackWidth)
    );
  }, 0);
}

export function getSelectionColumnWidth<T extends object>(
  rowSelection: TableProps<T>["rowSelection"],
) {
  if (!rowSelection) return 0;

  return (
    getNumberWidth(rowSelection.columnWidth) ?? DEFAULT_SELECTION_COLUMN_WIDTH
  );
}

export function getResizableScroll<T extends object>(
  scroll: TableProps<T>["scroll"],
  columns: TableColumnsType<T>,
  fallbackWidth: number,
  rowSelection: TableProps<T>["rowSelection"],
): TableProps<T>["scroll"] {
  if (!scroll) return scroll;

  const columnsWidth =
    getColumnsWidth(columns, fallbackWidth) +
    getSelectionColumnWidth(rowSelection);
  const scrollX = scroll.x;

  if (typeof scrollX === "number") {
    return {
      ...scroll,
      x: Math.max(scrollX, columnsWidth),
    };
  }

  if (scrollX == null || scrollX === true || scrollX === "max-content") {
    return {
      ...scroll,
      x: columnsWidth,
    };
  }

  return scroll;
}
