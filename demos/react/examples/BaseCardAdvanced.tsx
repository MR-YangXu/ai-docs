import { useState } from "react";
import BaseCard from "@/components/BaseCard";
export default function Example() {
  const [count, setCount] = useState(0);
  return (
    <BaseCard
      title={
        <div className="demo-actions">
          <span>今日处理</span>
          <button onClick={() => setCount(count + 1)}>增加一项</button>
        </div>
      }
    >
      <div className="demo-metrics">
        <div>
          <strong>{count}</strong>
          <span>已处理</span>
        </div>
        <div>
          <strong>32</strong>
          <span>待处理</span>
        </div>
      </div>
    </BaseCard>
  );
}
