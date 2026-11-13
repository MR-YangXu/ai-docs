import { StrictMode, Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { App, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import "antd/dist/reset.css";
import "dayjs/locale/zh-cn";
import dayjs from "dayjs";
import "../shared/style.css";
import { startBridge, showFailure } from "../shared/bridge";
dayjs.locale("zh-cn");
class Boundary extends Component<{ children: ReactNode }, { error: string }> {
  state = { error: "" };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  componentDidCatch(error: Error) {
    showFailure(error);
  }
  render() {
    return this.state.error ? (
      <p role="alert">{this.state.error}</p>
    ) : (
      this.props.children
    );
  }
}
const examples = import.meta.glob("./examples/*.tsx");
const id = new URLSearchParams(location.search).get("demo");
async function start() {
  const load = examples[`./examples/${id}.tsx`];
  if (!load) throw new Error("未找到这个示例");
  const { default: Example } = (await load()) as {
    default: import("react").ComponentType;
  };
  const root = createRoot(document.getElementById("app")!);
  root.render(
    <StrictMode>
      <Boundary>
        <ConfigProvider locale={zhCN}>
          <App>
            <Example />
          </App>
        </ConfigProvider>
      </Boundary>
    </StrictMode>
  );
  const cleanup = startBridge();
  import.meta.hot?.dispose(() => {
    cleanup();
    root.unmount();
  });
}
start().catch(showFailure);
