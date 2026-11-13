import { useState } from "react";
import { getFiltedOptions } from "@/utils/data";
export default function Example() {
  const [invalid, setInvalid] = useState(false);
  let output;
  try {
    output = getFiltedOptions(
      invalid
        ? [{ name: "缺少 id" }]
        : [
            { name: "停用", id: 0 },
            { name: "启用", id: 1 },
            { name: "否", id: false },
          ],
      { key: "name", value: "id" }
    );
  } catch (error) {
    output = String(error);
  }
  return (
    <>
      <div className="demo-actions">
        <label>
          <input
            type="checkbox"
            checked={invalid}
            onChange={(e) => setInvalid(e.target.checked)}
          />
          模拟无效选项
        </label>
      </div>
      <p className="demo-note">显示文案转为字符串，值 0、false 保持原类型。</p>
      <pre className="demo-output" aria-label="转换结果">
        {JSON.stringify(output, null, 2)}
      </pre>
    </>
  );
}
