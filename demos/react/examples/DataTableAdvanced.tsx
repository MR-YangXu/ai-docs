import { useRef } from "react";
import { DataTable } from "@/components/DataTable";
import type { DataTableColumn, DataTableRef } from "@/components/DataTable";
import { rows, type Row } from "../../shared/mock";
const columns: DataTableColumn<Row>[] = [
  { key: "id", dataIndex: "id", title: "编号", width: 90, hideable: false },
  { dataIndex: "name", title: "名称", group: "基本信息", width: 180 },
  {
    dataIndex: "count",
    title: "数量",
    group: "基本信息",
    width: 140,
    sorter: (a, b) => a.count - b.count,
  },
  { dataIndex: ["owner", "name"], title: "负责人", width: 140 },
  { dataIndex: "status", title: "状态", width: 140 },
];
export default function Example() {
  const table = useRef<DataTableRef>(null);
  return (
    <>
      <p className="demo-note">
        列设置控制显隐，拖动表头边界调整列宽；自动高度根据容器剩余空间计算。
      </p>
      <div style={{ height: 330 }}>
        <DataTable<Row>
          ref={table}
          rowKey="id"
          columns={columns}
          dataSource={rows}
          autoHeight
          resizable
          scroll={{ x: "max-content" }}
          toolbar={
            <button
              className="demo-button"
              onClick={() => table.current?.resetColumnWidths()}
            >
              重置列宽
            </button>
          }
          cellSlots={{
            status: ({ row }) => <span>{row.status ? "启用" : "停用"}</span>,
          }}
        />
      </div>
    </>
  );
}
