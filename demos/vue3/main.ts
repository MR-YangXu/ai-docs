import { createApp } from "vue";
import ElementPlus from "element-plus";
import zhCN from "element-plus/es/locale/lang/zh-cn";
import "element-plus/dist/index.css";
import "../shared/style.css";
import { startBridge, showFailure } from "../shared/bridge";
const examples = import.meta.glob("./examples/*.vue");
const id = new URLSearchParams(location.search).get("demo");
async function start() {
  const load = examples[`./examples/${id}.vue`];
  if (!load) throw new Error("未找到这个示例");
  const module = (await load()) as { default: import("vue").Component };
  const app = createApp(module.default).use(ElementPlus, { locale: zhCN });
  app.config.errorHandler = showFailure;
  app.mount("#app");
  const cleanup = startBridge();
  import.meta.hot?.dispose(() => {
    cleanup();
    app.unmount();
  });
}
start().catch(showFailure);
