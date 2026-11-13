import { useState } from "react";
import BaseDrawer from "@/components/Drawer";
import { wait } from "../../shared/mock";
export default function Example() {
  const [open, setOpen] = useState(false),
    [name, setName] = useState("示例项目"),
    [fail, setFail] = useState(true),
    [saved, setSaved] = useState("");
  async function save() {
    await wait(400);
    if (fail) throw new Error("模拟保存失败，输入已保留");
    setSaved(name);
  }
  return (
    <>
      <div className="demo-actions">
        <button onClick={() => setOpen(true)}>打开编辑抽屉</button>
      </div>
      <p className="demo-status">{saved ? "已保存：" + saved : "尚未提交"}</p>
      <BaseDrawer
        open={open}
        onOpenChange={setOpen}
        title="编辑项目"
        width="min(420px, 92vw)"
        showConfirm
        showCancel
        onConfirm={save}
      >
        <div className="demo-form">
          <label>
            项目名称
            <input
              className="demo-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            <span>
              <input
                type="checkbox"
                checked={fail}
                onChange={(e) => setFail(e.target.checked)}
              />
              模拟保存失败
            </span>
          </label>
        </div>
      </BaseDrawer>
    </>
  );
}
