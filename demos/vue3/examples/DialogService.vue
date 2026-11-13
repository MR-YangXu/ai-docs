<script setup lang="ts">
import { getCurrentInstance, onScopeDispose, ref } from "vue";
import { createDialogService } from "@/components/Dialog";
import DialogContent from "../parts/DialogContent.vue";
const service = createDialogService(getCurrentInstance()!.appContext);
onScopeDispose(service.dispose);
const result = ref("");
async function confirm() {
  result.value = String(await service.Dialog.confirm("确认处理这条记录？"));
}
function custom() {
  const panel = service.Dialog.component(DialogContent, {
    name: "演示项目",
    onDone: () => {
      result.value = "自定义内容已完成";
      panel.close();
    },
  });
}
function update() {
  const panel = service.showDialog({
    title: "初始标题",
    content: "通过实例更新内容",
  });
  panel.update({ title: "更新后的标题" });
}
</script>
<template>
  <div>
    <div class="demo-actions">
      <button @click="custom">自定义组件</button
      ><button @click="confirm">函数式确认</button
      ><button @click="update">创建并更新</button
      ><button @click="service.Dialog.alert('这是一条提示')">提示</button>
    </div>
    <p class="demo-status">确认结果：{{ result || "—" }}</p>
  </div>
</template>
