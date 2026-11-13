<template>
  <div>
    <p class="demo-note">旧 formHeader 协议的默认字段配置。</p>
    <pre class="demo-output">{{ JSON.stringify(fields, null, 2) }}</pre>
  </div>
</template>
<script>
import { buildFormItems } from "@/utils/formRender";
export default {
  data() {
    return {
      fields: buildFormItems([{ propName: "status", labelName: "状态" }]),
    };
  },
};
</script>
