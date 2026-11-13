<script setup lang="ts">
import { ref } from "vue";
import BaseDrawer from "@/components/Drawer/BaseDrawer.vue";
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
      <button @click="open = true">打开编辑抽屉</button>
    </div>
    <p class="demo-status">{{ saved ? "已保存：" + saved : "尚未提交" }}</p>
    <BaseDrawer
      v-model="open"
      title="编辑项目"
      size="min(420px, 92vw)"
      show-confirm
      show-cancel
      :on-confirm="save"
      ><div class="demo-form">
        <label>项目名称<input class="demo-input" v-model="name" /></label
        ><label
          ><span
            ><input type="checkbox" v-model="fail" />模拟保存失败</span
          ></label
        >
      </div></BaseDrawer
    >
  </div>
</template>
