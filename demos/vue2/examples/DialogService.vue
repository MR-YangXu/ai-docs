<template>
  <div>
    <div class="demo-actions">
      <button @click="custom">自定义组件</button
      ><button @click="confirm">函数式确认</button
      ><button @click="update">创建并更新</button
      ><button @click="alert">提示</button>
    </div>
    <p class="demo-status">确认结果：{{ result || "—" }}</p>
  </div>
</template>
<script>
import { createDialogService } from "@/components/Dialog";
import DialogContent from "../parts/DialogContent.vue";
export default {
  data() {
    return { result: "" };
  },
  created() {
    this.service = createDialogService(this);
  },
  methods: {
    custom() {
      const panel = this.service.Dialog.component(DialogContent, {
        name: "演示项目",
        onDone: () => {
          this.result = "自定义内容已完成";
          panel.close();
        },
      });
    },
    async confirm() {
      this.result = String(
        await this.service.Dialog.confirm("确认处理这条记录？")
      );
    },
    update() {
      const panel = this.service.showDialog({
        title: "初始标题",
        content: "通过实例更新内容",
      });
      panel.update({ title: "更新后的标题" });
    },
    alert() {
      this.service.Dialog.alert("这是一条提示");
    },
  },
};
</script>
