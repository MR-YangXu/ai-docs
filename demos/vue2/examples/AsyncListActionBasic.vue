<template>
  <div>
    <div class="demo-actions"><button @click="run">执行操作</button></div>
    <p class="demo-note">
      同键操作共用请求，成功后调用刷新；销毁时 dispose 取消请求。
    </p>
    <pre class="demo-output" aria-label="操作状态">{{
      JSON.stringify(
        { ...stats, pendingKeys: action.state.pendingKeys, message },
        null,
        2
      )
    }}</pre>
  </div>
</template>
<script>
import { createAsyncListAction } from "@/logic/createAsyncListAction";
import { isAbortError } from "@/utils/adminCore";
import { wait } from "../../shared/mock";
export default {
  data() {
    const stats = { calls: 0, refreshes: 0 };
    return {
      stats,
      action: createAsyncListAction(() => {
        stats.refreshes++;
      }),
      fail: false,
      message: "",
    };
  },
  beforeDestroy() {
    this.action.dispose();
  },
  methods: {
    async run() {
      this.message = "";
      try {
        await this.action.exec(
          async (signal) => {
            this.stats.calls++;
            await wait(650, signal);
            if (this.fail) throw new Error("模拟操作失败");
          },
          "处理成功",
          "row-1"
        );
        this.message = "已完成";
      } catch (error) {
        if (!isAbortError(error)) this.message = String(error);
      }
    },
  },
};
</script>
