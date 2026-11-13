import type { TableColumnsType } from "antd";
import type {
  ResizableColumn,
  TableColumnResizeResult,
  UseTableColumnResizeOptions,
} from "./types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ResizableHeaderCell } from "./ResizableHeaderCell";
import {
  DEFAULT_MAX_WIDTH,
  DEFAULT_MIN_WIDTH,
  getColumnKey,
  getNumberWidth,
  getResizableScroll,
  joinClassName,
  reconcileColumnWidths,
} from "./widths";
import "./style.scss";

export type {
  ColumnResizeOptions,
  TableColumnResizeResult,
  UseTableColumnResizeOptions,
} from "./types";

const EMPTY_COLUMNS: TableColumnsType<object> = [];

/** 为原生 Table 组合列宽拖拽；不管理数据、分页和偏好存储。 */
export function useTableColumnResize<Row extends object>({
  enabled = true,
  columns: rawColumns,
  components,
  className,
  scroll,
  tableLayout,
  rowSelection,
  minColumnWidth = DEFAULT_MIN_WIDTH,
  maxColumnWidth = DEFAULT_MAX_WIDTH,
  resizeDisabled,
  onColumnResizeEnd,
  onColumnWidthsReset,
}: UseTableColumnResizeOptions<Row>): TableColumnResizeResult<Row> {
  const columns = rawColumns ?? (EMPTY_COLUMNS as TableColumnsType<Row>);
  const [widths, setWidths] = useState<Record<string, number>>({});

  const resetColumnWidths = useCallback(() => {
    if (!enabled) return;
    setWidths(reconcileColumnWidths(columns));
    onColumnWidthsReset?.();
  }, [columns, enabled, onColumnWidthsReset]);

  useEffect(() => {
    setWidths((previous) => {
      const next = enabled ? reconcileColumnWidths(columns, previous) : {};
      const keys = Object.keys(next);
      return Object.keys(previous).length === keys.length &&
        keys.every((key) => previous[key] === next[key])
        ? previous
        : next;
    });
  }, [columns, enabled]);

  const resizableColumns = useMemo(() => {
    if (!enabled) return rawColumns;

    function mapColumns(source: TableColumnsType<Row>): TableColumnsType<Row> {
      return source.map((column, index) => {
        const typedColumn = column as ResizableColumn<Row>;
        if (typedColumn.children?.length) {
          return { ...typedColumn, children: mapColumns(typedColumn.children) };
        }

        const columnKey = getColumnKey(typedColumn, index);
        const declaredMinWidth = getNumberWidth(typedColumn.minWidth);
        const resizeMinWidth = Math.min(
          maxColumnWidth,
          Math.max(minColumnWidth, declaredMinWidth ?? minColumnWidth),
        );
        const width =
          widths[columnKey] ??
          getNumberWidth(typedColumn.width) ??
          declaredMinWidth;
        const originalOnHeaderCell = typedColumn.onHeaderCell;
        const isDisabled = resizeDisabled?.(typedColumn, index) ?? false;

        return {
          ...typedColumn,
          width: width ?? typedColumn.width,
          onHeaderCell: (
            ...args: Parameters<
              NonNullable<ResizableColumn<Row>["onHeaderCell"]>
            >
          ) => ({
            ...originalOnHeaderCell?.(...args),
            maxWidth: maxColumnWidth,
            minWidth: resizeMinWidth,
            onColumnResize: (nextWidth: number) => {
              setWidths((previous) => ({
                ...previous,
                [columnKey]: nextWidth,
              }));
            },
            onColumnResizeEnd: (nextWidth: number) => {
              onColumnResizeEnd?.({
                column: typedColumn,
                columnKey,
                width: nextWidth,
              });
            },
            resizable: !isDisabled,
            width,
          }),
        };
      });
    }

    return mapColumns(columns);
  }, [
    enabled,
    rawColumns,
    columns,
    maxColumnWidth,
    minColumnWidth,
    onColumnResizeEnd,
    resizeDisabled,
    widths,
  ]);

  const mergedComponents = useMemo(
    () =>
      enabled
        ? {
            ...components,
            header: { ...components?.header, cell: ResizableHeaderCell },
          }
        : components,
    [components, enabled],
  );

  const mergedScroll = useMemo(
    () =>
      enabled
        ? getResizableScroll(
            scroll,
            resizableColumns ?? [],
            minColumnWidth,
            rowSelection,
          )
        : scroll,
    [enabled, minColumnWidth, resizableColumns, rowSelection, scroll],
  );

  return {
    tableProps: {
      columns: resizableColumns,
      components: mergedComponents,
      scroll: mergedScroll,
      tableLayout: enabled ? (tableLayout ?? "fixed") : tableLayout,
      className: enabled
        ? joinClassName("resizable-antd-table", className)
        : className,
    },
    resetColumnWidths,
  };
}
