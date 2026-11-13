import Vue from "vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "../shared/style.css";
import { startBridge, showFailure } from "../shared/bridge";
Vue.use(ElementUI);
Vue.config.productionTip = false;
Vue.config.errorHandler = showFailure;
const examples = import.meta.glob("./examples/*.vue");
const id = new URLSearchParams(location.search).get("demo");
async function start() {
  const load = examples[`./examples/${id}.vue`];
  if (!load) throw new Error("未找到这个示例");
  const { default: Example } = await load();
  const app = new Vue({ render: (h) => h(Example) }).$mount("#app");
  app.$el.id = "app";
  const cleanup = startBridge();
  import.meta.hot?.dispose(() => {
    cleanup();
    app.$destroy();
  });
}
start().catch(showFailure);
