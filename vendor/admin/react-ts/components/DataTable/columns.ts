import type { TableColumnsType } from "antd";
import type {
  ColumnVisibility,
  DataTableCellSlots,
  DataTableColumn,
} from "./types";

export type NormalizedDataTableColumn<Row extends object> =
  DataTableColumn<Row> & { key: string };

/** 在进入显隐、分组与拖拽逻辑前统一列身份，不修改调用方的列配置。 */
export function normalizeColumns<Row extends object>(
  columns: DataTableColumn<Row>[],
): NormalizedDataTableColumn<Row>[] {
  const keys = new Set<string>();
  return columns.map((column, index) => {
    const { dataIndex } = column;
    const identity =
      column.key ??
      (Array.isArray(dataIndex)
        ? dataIndex.length
          ? `path:${JSON.stringify(dataIndex)}`
          : undefined
        : dataIndex);
    if (identity == null || identity === "")
      throw new Error(
        `DataTable 第 ${index + 1} 列标识必须非空：没有有效 dataIndex 的列必须提供稳定 key`,
      );
    const key = String(identity);
    if (keys.has(key))
      throw new Error(
        `DataTable 列标识必须唯一：${key}；请为重复字段的列指定不同的 key`,
      );
    keys.add(key);
    return { ...column, key };
  });
}

export function getVisibility<Row extends object>(
  columns: NormalizedDataTableColumn<Row>[],
  value: ColumnVisibility,
): ColumnVisibility {
  return Object.fromEntries(
    columns.map((column) => [
      column.key,
      column.hideable === false || value[column.key] !== false,
    ]),
  );
}

export function buildColumns<Row extends object>(
  columns: NormalizedDataTableColumn<Row>[],
  visibility: ColumnVisibility,
  emptyCellText: string,
  cellSlots?: DataTableCellSlots<Row>,
): TableColumnsType<Row> {
  const result: TableColumnsType<Row> = [];
  let index = 0;

  function leaf(column: NormalizedDataTableColumn<Row>) {
    const {
      group: _group,
      settingLabel: _settingLabel,
      hideable: _hideable,
      formatter,
      ...native
    } = column;
    const slot =
      cellSlots && Object.prototype.hasOwnProperty.call(cellSlots, column.key)
        ? cellSlots[column.key]
        : undefined;
    return {
      ...native,
      render: slot
        ? (value: unknown, row: Row, index: number) =>
            slot({ value, row, column, index })
        : (native.render ??
          ((value: unknown, record: Row, rowIndex: number) => {
            const text = formatter ? formatter(value, record, rowIndex) : value;
            return text == null || text === "" ? emptyCellText : String(text);
          })),
    };
  }

  // 在过滤隐藏列之前确定分组，避免隐藏中间列后串组。
  while (index < columns.length) {
    const first = columns[index];
    const group = first.group?.trim();
    const fixed = first.fixed === true ? "left" : first.fixed || undefined;
    if (!group) {
      if (visibility[first.key] !== false) result.push(leaf(first));
      index += 1;
      continue;
    }

    const segment: NormalizedDataTableColumn<Row>[] = [first];
    index += 1;
    while (index < columns.length) {
      const next = columns[index];
      const nextFixed = next.fixed === true ? "left" : next.fixed || undefined;
      if (next.group?.trim() !== group || nextFixed !== fixed) break;
      segment.push(next);
      index += 1;
    }
    const children = segment
      .filter((column) => visibility[column.key] !== false)
      .map(leaf);
    if (children.length) {
      result.push({
        key: `group:${JSON.stringify([group, first.key])}`,
        title: group,
        fixed,
        children,
      });
    }
  }
  return result;
}
