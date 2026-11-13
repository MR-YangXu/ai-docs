<script setup lang="ts">
import { ref } from "vue";
import { buildFormItems } from "@/utils/formRender";
import type { FormItemConfig } from "@/components/SearchForm/types";
const original: FormItemConfig<{ keyword: string }>[] = [
  { propName: "keyword", labelName: "名称", itemType: "text" },
];
const fields = ref(buildFormItems(original));
</script>
<template>
  <div>
    <div class="demo-actions">
      <button @click="fields[0].labelName = '副本标题'">修改副本配置</button
      ><button @click="fields = buildFormItems(original)">恢复</button>
    </div>
    <pre class="demo-output" aria-label="配置结果">{{
      JSON.stringify({ original, fields }, null, 2)
    }}</pre>
  </div>
</template>
