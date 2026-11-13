import type { TableColumnsType } from "antd";
import type { NormalizedDataTableColumn } from "./columns";
import type { DataTableColumn } from "./types";
import { normalizeColumns } from "./columns";

/** 迁移已有扁平 Ant Design 列；权限隐藏列在进入列设置前就被移除。 */
export function adaptAntdColumns<Row extends object>(
  columns: TableColumnsType<Row>,
): NormalizedDataTableColumn<Row>[] {
  const result = columns.flatMap((column): DataTableColumn<Row>[] => {
    if (column.hidden) return [];
    if ("children" in column)
      throw new Error(
        "adaptAntdColumns 仅接受扁平列，请显式配置 DataTable 的 group",
      );
    const { hidden: _hidden, key, ...native } = column;
    return [{ ...native, key: key == null ? undefined : String(key) }];
  });
  return normalizeColumns(result);
}
