import { useLayoutEffect, useRef, useState } from "react";
import { observeTableScrollHeight } from "./scroll-height";

export function useTableScrollHeight(enabled: boolean) {
  const regionRef = useRef<HTMLDivElement>(null);
  // 首次渲染即创建原生滚动容器，再在布局阶段测量工具栏下方的可用高度。
  const [scrollHeight, setScrollHeight] = useState(1);

  useLayoutEffect(() => {
    const region = regionRef.current;
    if (enabled && region)
      return observeTableScrollHeight(region, setScrollHeight);
  }, [enabled]);

  return { regionRef, scrollHeight };
}
