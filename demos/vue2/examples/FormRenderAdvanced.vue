<template>
  <div>
    <p class="demo-note">
      此工具生成旧 formHeader 协议，不直接用于新的 SearchForm。
    </p>
    <div class="demo-actions">
      <button @click="fields[0].labelName = '副本标题'">修改副本配置</button
      ><button @click="reset">恢复</button>
    </div>
    <pre class="demo-output" aria-label="配置结果">{{
      JSON.stringify({ original, fields }, null, 2)
    }}</pre>
  </div>
</template>
<script>
import { buildFormItems } from "@/utils/formRender";
export default {
  data() {
    const original = [
      { propName: "keyword", labelName: "名称", itemType: "text" },
    ];
    return { original, fields: buildFormItems(original) };
  },
  methods: {
    reset() {
      this.fields = buildFormItems(this.original);
    },
  },
};
</script>
