<script setup lang="ts">
import { ref } from "vue";
import DataTable from "@/components/DataTable/index.vue";
import type { TableColumn } from "@/components/DataTable/types";
import { rows, type Row } from "../../shared/mock";
const sort = ref("尚未排序");
const columns: TableColumn<Row>[] = [
  { prop: "id", label: "编号", width: 90, hideable: false },
  { prop: "name", label: "名称", group: "基本信息", minWidth: 180 },
  { prop: "count", label: "数量", group: "基本信息", sortable: "custom" },
  { prop: "owner", label: "负责人", formatter: (row) => row.owner.name },
  { prop: "status", label: "状态" },
];
</script>
<template>
  <div>
    <p class="demo-note">
      点击列设置切换可见列，拖动表头边界改变列宽。连续 group 列合并为分组表头。
    </p>
    <DataTable
      row-key="id"
      :table-data="rows.slice(0, 6)"
      :table-columns="columns"
      table-height="320"
      :resizable="true"
      @handle-sort-change="sort = JSON.stringify($event)"
      ><template #status="{ row }"
        ><span>{{ row.status ? "启用" : "停用" }}</span></template
      ><template #toolbar><span>团队项目</span></template></DataTable
    >
    <p class="demo-status">排序事件：{{ sort }}</p>
  </div>
</template>
