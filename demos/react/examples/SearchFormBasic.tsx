import { useState } from "react";
import { SearchForm } from "@/components/SearchForm";
import type { SearchField } from "@/components/SearchForm";
interface Filters {
  keyword: string;
  status: number;
}
const fields: SearchField<Filters>[] = [
  { name: "keyword", label: "名称", type: "text" },
  {
    name: "status",
    label: "状态",
    type: "select",
    options: [
      { label: "启用", value: 1 },
      { label: "停用", value: 0 },
    ],
  },
];
export default function Example() {
  const [submitted, setSubmitted] = useState<Partial<Filters>>({});
  return (
    <>
      <SearchForm
        fields={fields}
        initialValues={{ keyword: "", status: 0 }}
        onSubmit={setSubmitted}
        onReset={setSubmitted}
      />
      <p className="demo-note">
        输入保存为草稿；搜索或回车才提交。数字 0 会保留。
      </p>
      <pre className="demo-output" aria-label="提交结果">
        {JSON.stringify(submitted, null, 2)}
      </pre>
    </>
  );
}
