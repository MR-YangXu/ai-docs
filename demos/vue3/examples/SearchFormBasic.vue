<script setup lang="ts">
import { ref } from "vue";
import SearchForm from "@/components/SearchForm/index.vue";
import type { FormItemConfig } from "@/components/SearchForm/types";
interface Filters {
  keyword: string;
  status: number;
}
const fields: FormItemConfig<Filters>[] = [
  { propName: "keyword", labelName: "名称", itemType: "text" },
  {
    propName: "status",
    labelName: "状态",
    itemType: "selectOne",
    optionsArr: [
      { label: "启用", value: 1 },
      { label: "停用", value: 0 },
    ],
  },
];
const initialModel = { keyword: "", status: 0 };
const submitted = ref<Partial<Filters>>({});
</script>
<template>
  <div>
    <SearchForm
      :form-header="fields"
      :form-model="initialModel"
      @submit-form="submitted = $event"
      @reset-form="submitted = $event"
    />
    <p class="demo-note">输入保存为草稿；搜索或回车才提交。数字 0 会保留。</p>
    <pre class="demo-output" aria-label="提交结果">{{
      JSON.stringify(submitted, null, 2)
    }}</pre>
  </div>
</template>
