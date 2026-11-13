<template>
  <div>
    <p class="demo-note">显示文案转为字符串，值 0、false 保持原类型。</p>
    <pre class="demo-output" aria-label="转换结果">{{
      JSON.stringify(output, null, 2)
    }}</pre>
  </div>
</template>
<script>
import { getFiltedOptions } from "@/utils/data";
export default {
  data() {
    return { invalid: false };
  },
  computed: {
    output() {
      try {
        return getFiltedOptions(
          this.invalid
            ? [{ name: "缺少 id" }]
            : [
                { name: "停用", id: 0 },
                { name: "启用", id: 1 },
                { name: "否", id: false },
              ],
          { key: "name", value: "id" }
        );
      } catch (error) {
        return String(error);
      }
    },
  },
};
</script>
