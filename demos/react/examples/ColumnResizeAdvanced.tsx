import { useState } from "react";
import { Table } from "antd";
import type { TableColumnsType } from "antd";
import { useTableColumnResize } from "@/components/DataTable/column-resize";
import { rows, type Row } from "../../shared/mock";
const columns: TableColumnsType<Row> = [
  { key: "name", dataIndex: "name", title: "名称", width: 200 },
  { key: "count", dataIndex: "count", title: "数量", width: 180 },
  { key: "owner", dataIndex: ["owner", "name"], title: "负责人", width: 180 },
];
export default function Example() {
  const [enabled, setEnabled] = useState(true),
    [last, setLast] = useState("");
  const { tableProps, resetColumnWidths } = useTableColumnResize<Row>({
    enabled,
    columns,
    minColumnWidth: 80,
    maxColumnWidth: 500,
    onColumnResizeEnd: ({ columnKey, width }) =>
      setLast(`${columnKey}: ${width}px`),
  });
  return (
    <>
      <div className="demo-actions">
        <button onClick={resetColumnWidths}>重置列宽</button>
        <label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          启用拖拽
        </label>
      </div>
      <Table<Row>
        {...tableProps}
        rowKey="id"
        dataSource={rows.slice(0, 3)}
        pagination={false}
      />
      <p className="demo-status">{last || "悬停列标题，拖动右侧手柄调整宽度。"}</p>
    </>
  );
}
