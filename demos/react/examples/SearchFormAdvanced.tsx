import { useState, useRef } from "react";
import { Input } from "antd";
import type { Dayjs } from "dayjs";
import { SearchForm } from "@/components/SearchForm";
import type { SearchField, SearchFormRef } from "@/components/SearchForm";
interface Filters {
  keyword: string;
  count: number;
  enabled: boolean;
  tags: string[];
  date: Dayjs;
  range: Dayjs[];
  timeRange: Dayjs[];
  min: number;
  max: number;
  custom: string;
}
const fields: SearchField<Filters>[] = [
  { name: "keyword", label: "名称", type: "text", required: true },
  {
    name: "count",
    label: "数量",
    type: "number",
    controlProps: { min: 0, max: 99 },
  },
  {
    name: "enabled",
    label: "启用",
    type: "select",
    options: [
      { label: "是", value: true },
      { label: "否", value: false },
    ],
  },
  {
    name: "tags",
    label: "标签",
    type: "multiSelect",
    options: [
      { label: "重点", value: "key" },
      { label: "普通", value: "normal" },
    ],
  },
  { name: "date", label: "日期", type: "date" },
  { name: "range", label: "日期范围", type: "dateRange" },
  { name: "timeRange", label: "时间范围", type: "dateTimeRange" },
  {
    key: "amount",
    names: ["min", "max"],
    label: "金额范围",
    type: "numberRange",
  },
  { name: "custom", label: "自定义", type: "custom" },
];
export default function Example() {
  const [submitted, setSubmitted] = useState<Partial<Filters>>({});
  const form = useRef<SearchFormRef<Filters>>(null);
  return (
    <>
      <div className="demo-actions">
        <button
          onClick={() =>
            form.current?.setValues(
              { keyword: "回填内容", enabled: false },
              { mode: "merge" }
            )
          }
        >
          合并回填
        </button>
      </div>
      <SearchForm
        ref={form}
        fields={fields}
        initialValues={{ enabled: false }}
        onSubmit={setSubmitted}
        onReset={setSubmitted}
        fieldSlots={{
          custom: ({ value, onChange, id, ariaProps }) => (
            <Input
              {...ariaProps}
              id={id}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          ),
        }}
      />
      <p className="demo-note">
        名称必填；日期是 Dayjs 对象，在请求边界转换为接口格式。
      </p>
      <pre className="demo-output" aria-label="提交结果">
        {JSON.stringify(submitted, null, 2)}
      </pre>
    </>
  );
}
