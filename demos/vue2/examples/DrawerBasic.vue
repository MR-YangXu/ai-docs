<template>
  <div>
    <div class="demo-actions">
      <button @click="open = true">打开详情抽屉</button>
    </div>
    <p class="demo-status">{{ saved ? "已保存：" + saved : "尚未提交" }}</p>
    <BaseDrawer v-model="open" title="项目详情" width="min(420px, 92vw)"
      ><div class="demo-form">
        <p>这里放置详情内容。关闭后可以再次打开。</p>
      </div></BaseDrawer
    >
  </div>
</template>
<script>
import BaseDrawer from "@/components/Drawer/BaseDrawer.vue";
import { wait } from "../../shared/mock";
export default {
  components: { BaseDrawer },
  data() {
    return { open: false, name: "示例项目", fail: true, saved: "" };
  },
  methods: {
    async save() {
      await wait(400);
      if (this.fail) throw new Error("模拟保存失败，输入已保留");
      this.saved = this.name;
    },
  },
};
</script>
