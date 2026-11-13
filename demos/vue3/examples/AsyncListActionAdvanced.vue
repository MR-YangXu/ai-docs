<script setup lang="ts">
import { ref } from "vue";
import { useAsyncListAction, isAbortError } from "@/hooks/useAsyncListAction";
import { wait } from "../../shared/mock";
const fail = ref(false),
  calls = ref(0),
  refreshes = ref(0),
  message = ref("");
const { exec, pendingKeys } = useAsyncListAction(() => {
  refreshes.value++;
});
async function run() {
  message.value = "";
  try {
    await exec(
      async (signal) => {
        calls.value++;
        await wait(650, signal);
        if (fail.value) throw new Error("模拟操作失败");
      },
      "处理成功",
      "row-1"
    );
    message.value = "已完成";
  } catch (error) {
    if (!isAbortError(error)) message.value = String(error);
  }
}
</script>
<template>
  <div>
    <div class="demo-actions">
      <button @click="run">执行操作</button
      ><button
        @click="
          run();
          run();
        "
      >
        同键连续执行两次</button
      ><label><input type="checkbox" v-model="fail" />模拟失败</label>
    </div>
    <p class="demo-note">
      同一操作键 row-1 在进行中共用请求；成功后执行刷新回调。
    </p>
    <pre class="demo-output" aria-label="操作状态">{{
      JSON.stringify({ calls, refreshes, pendingKeys, message }, null, 2)
    }}</pre>
  </div>
</template>
