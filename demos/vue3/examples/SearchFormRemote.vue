<script setup lang="ts">
import { computed, ref } from "vue";
import SearchForm from "@/components/SearchForm/index.vue";
import type { FormItemConfig } from "@/components/SearchForm/types";
import { useSelectOptions } from "@/hooks/useSelectOptions";
import { wait } from "../../shared/mock";
const fail = ref(false),
  submitted = ref({});
const { options, loading, error, reload } = useSelectOptions(
  async (signal) => {
    await wait(350, signal);
    if (fail.value) throw new Error("选项加载失败");
    return [
      { id: 0, name: "周宁" },
      { id: 1, name: "林夏" },
    ];
  },
  (row) => ({ label: row.name, value: row.id })
);
const fields = computed<FormItemConfig<{ owner: number }>[]>(() => [
  {
    propName: "owner",
    labelName: "负责人",
    itemType: "selectOne",
    optionsArr: options.value,
    loading: loading.value,
    filterable: true,
  },
]);
</script>
<template>
  <div>
    <div class="demo-actions">
      <label><input type="checkbox" v-model="fail" />模拟失败</label
      ><button @click="reload">重新加载</button>
    </div>
    <p v-if="error" role="alert">{{ error.message }}</p>
    <SearchForm
      :form-header="fields"
      @submit-form="submitted = $event"
      @reset-form="submitted = $event"
    />
    <pre class="demo-output" aria-label="提交结果">{{
      JSON.stringify(submitted, null, 2)
    }}</pre>
  </div>
</template>
