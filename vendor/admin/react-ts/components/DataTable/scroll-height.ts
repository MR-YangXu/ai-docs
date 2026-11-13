/** 订阅原生表格的布局变化；region 是工具栏下方拥有确定高度的容器。 */
export function observeTableScrollHeight(
  region: HTMLElement,
  onHeight: (height: number) => void,
) {
  let frame = 0;
  const observed = new Set<Element>();

  function measure() {
    if (!region) return;
    const wrapper = region.querySelector<HTMLElement>(".ant-table-wrapper");
    const body = wrapper?.querySelector<HTMLElement>(
      ".ant-table-body, .ant-table-tbody-virtual",
    );
    if (!wrapper || !body) return;
    const chromeHeight = wrapper.offsetHeight - body.offsetHeight;
    onHeight(Math.max(1, Math.floor(region.clientHeight - chromeHeight)));
  }

  function schedule() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(measure);
  }

  const resizeObserver = new ResizeObserver(schedule);
  function observeElements() {
    if (!region) return;
    const wrapper = region.querySelector<HTMLElement>(".ant-table-wrapper");
    const body = wrapper?.querySelector<HTMLElement>(
      ".ant-table-body, .ant-table-tbody-virtual",
    );
    const next = new Set<Element>([
      region,
      ...(wrapper ? [wrapper] : []),
      ...(body ? [body] : []),
    ]);
    for (const element of observed) {
      if (!next.has(element)) {
        resizeObserver.unobserve(element);
        observed.delete(element);
      }
    }
    for (const element of next) {
      if (!observed.has(element)) {
        resizeObserver.observe(element);
        observed.add(element);
      }
    }
    schedule();
  }

  // 分页出现/消失、空态、虚拟列表切换时重新订阅对应 DOM。
  const mutationObserver = new MutationObserver(observeElements);
  mutationObserver.observe(region, { childList: true, subtree: true });
  observeElements();
  measure();
  return () => {
    cancelAnimationFrame(frame);
    mutationObserver.disconnect();
    resizeObserver.disconnect();
  };
}
