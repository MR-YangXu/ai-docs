export function startBridge() {
  const send = (type, extra = {}) =>
    window.parent.postMessage(
      { channel: "ai-doc-demo", type, ...extra },
      location.origin
    );
  let frame;
  const measure = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() =>
      send("resize", {
        height:
          Math.ceil(
            document.getElementById("app").getBoundingClientRect().height
          ) + 48,
      })
    );
  };
  const observer = new ResizeObserver(measure);
  observer.observe(document.getElementById("app"));
  const onError = (event) => send("error", { message: event.message });
  const onRejection = (event) =>
    send("error", { message: String(event.reason) });
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  if (document.getElementById("app").getAttribute("role") !== "alert")
    send("ready");
  measure();
  return () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
  };
}
export function showFailure(error) {
  const app = document.getElementById("app");
  app.textContent = `示例加载失败：${
    error instanceof Error ? error.message : String(error)
  }`;
  app.setAttribute("role", "alert");
  window.parent.postMessage(
    { channel: "ai-doc-demo", type: "error", message: app.textContent },
    location.origin
  );
}
