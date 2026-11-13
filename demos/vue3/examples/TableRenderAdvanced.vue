<script setup lang="ts">
import { ref } from "vue";
import DataTable from "@/components/DataTable/index.vue";
import { buildColumns } from "@/utils/tableRender";
import { rows, type Row } from "../../shared/mock";
const feedback = ref("");
const columns = buildColumns<Row>(
  [
    { prop: "name", label: "名称", type: "clip" },
    {
      prop: "status",
      label: "状态",
      type: "enum",
      enumList: [
        { label: "启用", value: 1 },
        { label: "停用", value: 0 },
      ],
    },
    { prop: "owner", label: "负责人", type: "nested", path: "owner.name" },
    { prop: "count", label: "数量", formatter: (row) => `数量 ${row.count}` },
  ],
  {
    onCopied: () => (feedback.value = "已复制"),
    onCopyError: (error) => (feedback.value = String(error)),
  }
);
</script>
<template>
  <div>
    <DataTable
      row-key="id"
      :table-columns="columns"
      :table-data="rows.slice(0, 3)"
    />
    <p class="demo-status" role="status">
      {{ feedback || "点击名称复制；自定义 formatter 保持有效。" }}
    </p>
  </div>
</template>
