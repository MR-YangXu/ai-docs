import { useState } from "react";
import { SearchForm } from "@/components/SearchForm";
import type { SearchField } from "@/components/SearchForm";
import { useSelectOptions } from "@/hooks/useSelectOptions";
import { wait } from "../../shared/mock";
interface Filters {
  owner: number;
}
export default function Example() {
  const [fail, setFail] = useState(false),
    [submitted, setSubmitted] = useState<Partial<Filters>>({});
  const { options, loading, error, reload } = useSelectOptions(
    async (signal) => {
      await wait(350, signal);
      if (fail) throw new Error("选项加载失败");
      return [
        { id: 0, name: "周宁" },
        { id: 1, name: "林夏" },
      ];
    },
    (row) => ({ label: row.name, value: row.id })
  );
  const fields: SearchField<Filters>[] = [
    {
      name: "owner",
      label: "负责人",
      type: "select",
      options,
      controlProps: { loading, showSearch: true, optionFilterProp: "label" },
    },
  ];
  return (
    <>
      <div className="demo-actions">
        <label>
          <input
            type="checkbox"
            checked={fail}
            onChange={(e) => setFail(e.target.checked)}
          />
          模拟失败
        </label>
        <button onClick={() => reload()}>重新加载</button>
      </div>
      {error && <p role="alert">{error.message}</p>}
      <SearchForm
        fields={fields}
        onSubmit={setSubmitted}
        onReset={setSubmitted}
      />
      <pre className="demo-output" aria-label="提交结果">
        {JSON.stringify(submitted, null, 2)}
      </pre>
    </>
  );
}
