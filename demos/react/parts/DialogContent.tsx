export default function DialogContent({
  name,
  onDone,
}: {
  name: string;
  onDone: () => void;
}) {
  return (
    <div>
      <p>当前项目：{name}</p>
      <button className="demo-button" onClick={onDone}>
        完成并关闭
      </button>
    </div>
  );
}
