<script setup lang="ts">
import { computed, ref } from "vue";
import DataTable from "@/components/DataTable/index.vue";
import type { TableColumn } from "@/components/DataTable/types";
import { rows, type Row } from "../../shared/mock";
const page = ref(1),
  size = ref(5),
  selected = ref<Row[]>([]),
  empty = ref(false);
const data = computed(() =>
  empty.value
    ? []
    : rows.slice((page.value - 1) * size.value, page.value * size.value)
);
const columns: TableColumn<Row>[] = [
  { prop: "name", label: "名称" },
  { prop: "count", label: "数量" },
  { prop: "action", label: "操作" },
];
const last = ref("");
</script>
<template>
  <div>
    <div class="demo-actions">
      <label><input type="checkbox" v-model="empty" />显示空数据</label>
    </div>
    <DataTable
      row-key="id"
      :table-data="data"
      :table-columns="columns"
      selection
      :page-params="{
        currentPage: page,
        pageSize: size,
        pageSizes: [5, 10],
        total: empty ? 0 : rows.length,
      }"
      @handle-current-change="page = $event.pageNum"
      @handle-size-change="
        size = $event.pageSize;
        page = 1;
      "
      @handle-selection-change="selected = $event"
      ><template #action="{ row }"
        ><button class="demo-button" @click="last = row.name">
          查看
        </button></template
      ><template #multiple-operation="{ selectionData }"
        >已选 {{ selectionData.length }} 项</template
      ></DataTable
    >
    <p class="demo-status">
      已选 {{ selected.length }} 项；最近查看：{{ last || "—" }}
    </p>
  </div>
</template>
