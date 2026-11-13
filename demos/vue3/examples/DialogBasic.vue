<script setup lang="ts">
import { ref } from "vue";
import BaseDialog from "@/components/Dialog/BaseDialog.vue";
import { wait } from "../../shared/mock";
const open = ref(false),
  name = ref("示例项目"),
  fail = ref(true),
  saved = ref("");
async function save() {
  await wait(400);
  if (fail.value) throw new Error("模拟保存失败，输入已保留");
  saved.value = name.value;
}
</script>
<template>
  <div>
    <div class="demo-actions">
      <button @click="open = true">打开详情弹窗</button>
    </div>
    <p class="demo-status">{{ saved ? "已保存：" + saved : "尚未提交" }}</p>
    <BaseDialog v-model="open" title="项目详情" width="min(420px, 92vw)"
      ><div class="demo-form">
        <p>这里放置详情内容。关闭后可以再次打开。</p>
      </div></BaseDialog
    >
  </div>
</template>
