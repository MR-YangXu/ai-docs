import { useState } from "react";
import BaseDialog from "@/components/Dialog/BaseDialog";
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
        <button onClick={() => setOpen(true)}>打开详情弹窗</button>
      </div>
      <p className="demo-status">{saved ? "已保存：" + saved : "尚未提交"}</p>
      <BaseDialog
        open={open}
        onOpenChange={setOpen}
        title="项目详情"
        width="min(420px, 92vw)"
      >
        <div className="demo-form">
          <p>这里放置详情内容。关闭后可以再次打开。</p>
        </div>
      </BaseDialog>
    </>
  );
}
