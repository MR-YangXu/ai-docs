<script setup lang="ts">
import { ref } from "vue";
import { ElSelect, ElOption } from "element-plus";
import { useSelectOptions } from "@/hooks/useSelectOptions";
import { wait } from "../../shared/mock";
const fail = ref(false),
  value = ref<number>();
const { options, loading, error, reload } = useSelectOptions(
  async (signal) => {
    await wait(350, signal);
    if (fail.value) throw new Error("选项加载失败");
    return [
      { id: 0, name: "停用" },
      { id: 1, name: "启用" },
    ];
  },
  (row) => ({ label: row.name, value: row.id })
);
</script>
<template>
  <div>
    <div class="demo-actions">
      <label><input type="checkbox" v-model="fail" />模拟失败</label
      ><button @click="reload">重新加载</button>
    </div>
    <ElSelect
      v-model="value"
      :loading="loading"
      placeholder="选择状态"
      aria-label="状态"
      style="width: 220px"
      ><ElOption
        v-for="option in options"
        :key="option.value"
        :label="option.label"
        :value="option.value"
    /></ElSelect>
    <p v-if="error" role="alert">
      {{ error.message }} <button @click="reload">重试</button>
    </p>
    <pre class="demo-output" aria-label="选项状态">{{
      JSON.stringify({ value, options, loading }, null, 2)
    }}</pre>
  </div>
</template>
