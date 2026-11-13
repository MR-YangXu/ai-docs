<script setup lang="ts">
import { computed, ref } from "vue";
import { ElInput } from "element-plus";
import SearchForm from "@/components/SearchForm/index.vue";
import type { FormItemConfig } from "@/components/SearchForm/types";
interface Filters {
  keyword: string;
  count: number;
  enabled: boolean;
  tags: string[];
  date: string;
  range: string[];
  timeRange: string[];
  min: number;
  max: number;
  custom: string;
}
const options = ref([
  { label: "远程选项 A", value: "a" },
  { label: "远程选项 B", value: "b" },
]);
const fields = computed<FormItemConfig<Filters>[]>(() => [
  {
    propName: "keyword",
    labelName: "名称",
    itemType: "text",
    isRequired: true,
  },
  { propName: "count", labelName: "数量", itemType: "number", min: 0, max: 99 },
  {
    propName: "enabled",
    labelName: "启用",
    itemType: "selectOne",
    optionsArr: [
      { label: "是", value: true },
      { label: "否", value: false },
    ],
  },
  {
    propName: "tags",
    labelName: "标签",
    itemType: "selectOne",
    multiple: true,
    optionsArr: options.value,
  },
  { propName: "date", labelName: "日期", itemType: "date" },
  {
    propName: "range",
    labelName: "日期范围",
    itemType: "dateRange",
    width: 350,
  },
  {
    propName: "timeRange",
    labelName: "时间范围",
    itemType: "datetimerange",
    width: 400,
  },
  {
    propName1: "min",
    propName2: "max",
    labelName: "金额范围",
    itemType: "inputBoxInterval",
  },
  { propName: "custom", labelName: "自定义", itemType: "custom" },
]);
const model = ref<Partial<Filters>>({ enabled: false });
const submitted = ref<Partial<Filters>>({});
</script>
<template>
  <div>
    <div class="demo-actions">
      <button @click="model = { keyword: '回填内容', enabled: false }">
        替换回填
      </button>
    </div>
    <SearchForm
      :form-header="fields"
      :form-model="model"
      @submit-form="submitted = $event"
      @reset-form="submitted = $event"
      ><template #custom="{ value, updateValue }"
        ><ElInput
          :model-value="typeof value === 'string' ? value : ''"
          aria-label="自定义字段"
          @update:model-value="updateValue" /></template
      ><template #actions-extra
        ><span class="demo-note"
          >名称必填，金额需完整且从小到大。</span
        ></template
      ></SearchForm
    >
    <pre class="demo-output" aria-label="提交结果">{{
      JSON.stringify(submitted, null, 2)
    }}</pre>
  </div>
</template>
