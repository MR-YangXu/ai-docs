import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import { buildColumns } from "@/utils/tableRender";
import { rows, type Row } from "../../shared/mock";
export default function Example() {
  const [feedback, setFeedback] = useState("");
  const columns = buildColumns<Row>(
    [
      { dataIndex: "name", title: "名称", type: "default" },
      {
        dataIndex: "status",
        title: "状态",
        type: "enum",
        enumList: [
          { label: "启用", value: 1 },
          { label: "停用", value: 0 },
        ],
      },
      { dataIndex: ["owner", "name"], title: "负责人", type: "nested" },
      {
        dataIndex: "count",
        title: "数量",
        formatter: (value) => `数量 ${value}`,
      },
    ],
    {
      onCopied: () => setFeedback("已复制"),
      onCopyError: (error) => setFeedback(String(error)),
    }
  );
  return (
    <>
      <DataTable rowKey="id" columns={columns} dataSource={rows.slice(0, 3)} />
      <p className="demo-status" role="status">
        {feedback || "枚举映射与嵌套取值；0 按原值展示。"}
      </p>
    </>
  );
}
