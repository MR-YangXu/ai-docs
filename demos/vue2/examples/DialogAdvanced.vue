<template>
  <div>
    <div class="demo-actions">
      <button @click="open = true">打开编辑弹窗</button>
    </div>
    <p class="demo-status">{{ saved ? "已保存：" + saved : "尚未提交" }}</p>
    <BaseDialog
      v-model="open"
      title="编辑项目"
      width="min(420px, 92vw)"
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
      </div></BaseDialog
    >
  </div>
</template>
<script>
import BaseDialog from "@/components/Dialog/BaseDialog.vue";
import { wait } from "../../shared/mock";
export default {
  components: { BaseDialog },
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
