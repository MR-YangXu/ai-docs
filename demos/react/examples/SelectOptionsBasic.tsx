import { useState } from "react";
import { Select } from "antd";
import { useSelectOptions } from "@/hooks/useSelectOptions";
import { wait } from "../../shared/mock";
export default function Example() {
  const [fail, setFail] = useState(false),
    [value, setValue] = useState<number>();
  const { options, loading, error, reload } = useSelectOptions(
    async (signal) => {
      await wait(350, signal);
      if (fail) throw new Error("选项加载失败");
      return [
        { id: 0, name: "停用" },
        { id: 1, name: "启用" },
      ];
    },
    (row) => ({ label: row.name, value: row.id })
  );
  return (
    <>
      <div className="demo-actions">
        <button onClick={() => reload()}>重新加载</button>
      </div>
      <Select
        aria-label="状态"
        style={{ width: 220 }}
        value={value}
        onChange={setValue}
        options={options}
        loading={loading}
        placeholder="选择状态"
      />
      {error && (
        <p role="alert">
          {error.message} <button onClick={() => reload()}>重试</button>
        </p>
      )}
      <pre className="demo-output" aria-label="选项状态">
        {JSON.stringify({ value, options, loading }, null, 2)}
      </pre>
    </>
  );
}
