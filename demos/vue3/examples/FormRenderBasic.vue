<script setup lang="ts">
import { buildFormItems } from "@/utils/formRender";
const fields = buildFormItems<{ name: string }>([
  { propName: "name", labelName: "名称", itemType: "text" },
]);
</script>
<template>
  <div>
    <p class="demo-note">保留字段类型，返回可独立修改的配置副本。</p>
    <pre class="demo-output">{{ JSON.stringify(fields, null, 2) }}</pre>
  </div>
</template>
