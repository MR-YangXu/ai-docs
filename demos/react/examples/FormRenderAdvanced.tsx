import { useState } from "react";
import { buildFormItems } from "@/utils/formRender";
import type { SearchField } from "@/components/SearchForm";
interface Filters {
  keyword: string;
}
const original: SearchField<Filters>[] = [
  { name: "keyword", label: "名称", type: "text" },
];
export default function Example() {
  const [fields, setFields] = useState(() => buildFormItems(original));
  return (
    <>
      <div className="demo-actions">
        <button
          onClick={() =>
            setFields(buildFormItems([{ ...original[0], label: "副本标题" }]))
          }
        >
          修改副本配置
        </button>
        <button onClick={() => setFields(buildFormItems(original))}>
          恢复
        </button>
      </div>
      <pre className="demo-output" aria-label="配置结果">
        {JSON.stringify({ original, fields }, null, 2)}
      </pre>
    </>
  );
}
