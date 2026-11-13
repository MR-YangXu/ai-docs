import { useState } from "react";
import { DialogProvider, useDialog } from "@/components/Dialog";
import DialogContent from "../parts/DialogContent";
function Controls() {
  const { Dialog, showDialog } = useDialog();
  const [result, setResult] = useState("");
  async function confirm() {
    setResult(String(await Dialog.confirm("确认处理这条记录？")));
  }
  return (
    <>
      <div className="demo-actions">
        <button onClick={() => confirm()}>函数式确认</button>
        <button
          onClick={() => {
            const panel = showDialog({
              title: "初始标题",
              content: "通过实例更新内容",
            });
            panel.update({ title: "更新后的标题" });
          }}
        >
          创建并更新
        </button>
        <button
          onClick={() => {
            const panel = Dialog.component(DialogContent, {
              name: "演示项目",
              onDone: () => {
                setResult("自定义内容已完成");
                panel.close();
              },
            });
          }}
        >
          自定义组件
        </button>
        <button onClick={() => Dialog.alert("这是一条提示")}>提示</button>
      </div>
      <p className="demo-status">确认结果：{result || "—"}</p>
    </>
  );
}
export default function Example() {
  return (
    <DialogProvider>
      <Controls />
    </DialogProvider>
  );
}
