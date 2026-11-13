import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import type { DataTableColumn } from "@/components/DataTable";
import { rows, type Row } from "../../shared/mock";
const columns: DataTableColumn<Row>[] = [
  { dataIndex: "name", title: "名称" },
  { dataIndex: "count", title: "数量" },
  { key: "action", title: "操作" },
];
export default function Example() {
  const [page, setPage] = useState(1),
    [size, setSize] = useState(5),
    [empty, setEmpty] = useState(false),
    [selected, setSelected] = useState<Row[]>([]),
    [last, setLast] = useState("");
  return (
    <>
      <div className="demo-actions">
        <label>
          <input
            type="checkbox"
            checked={empty}
            onChange={(e) => setEmpty(e.target.checked)}
          />
          显示空数据
        </label>
      </div>
      <DataTable<Row>
        rowKey="id"
        columns={columns}
        dataSource={empty ? [] : rows.slice((page - 1) * size, page * size)}
        pagination={{
          current: page,
          pageSize: size,
          total: empty ? 0 : rows.length,
          pageSizeOptions: [5, 10],
          showSizeChanger: true,
        }}
        onChange={(p) => {
          setPage(p.current || 1);
          setSize(p.pageSize || 5);
        }}
        rowSelection={{ onChange: (_, next) => setSelected(next) }}
        cellSlots={{
          action: ({ row }) => (
            <button className="demo-button" onClick={() => setLast(row.name)}>
              查看
            </button>
          ),
        }}
      />
      <p className="demo-status">
        已选 {selected.length} 项；最近查看：{last || "—"}
      </p>
    </>
  );
}
