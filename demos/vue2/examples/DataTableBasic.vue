<template>
  <div>
    <div class="demo-actions">
      <label><input type="checkbox" v-model="empty" />显示空数据</label>
    </div>
    <data-table
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
      @handleCurrentChange="page = $event.pageNum"
      @handleSizeChange="
        size = $event.pageSize;
        page = 1;
      "
      @handleSelectionChange="selected = $event"
      ><template #action="{ row }"
        ><button class="demo-button" @click="last = row.name">
          查看
        </button></template
      ><template #multiple-operation="{ selectionData }"
        >已选 {{ selectionData.length }} 项</template
      ></data-table
    >
    <p class="demo-status">
      已选 {{ selected.length }} 项；最近查看：{{ last || "—" }}
    </p>
  </div>
</template>
<script>
import DataTable from "@/components/DataTable/index.vue";
import { rows } from "../../shared/mock";
export default {
  components: { DataTable },
  data() {
    return {
      rows,
      page: 1,
      size: 5,
      selected: [],
      empty: false,
      last: "",
      columns: [
        { prop: "name", label: "名称" },
        { prop: "count", label: "数量" },
        { prop: "action", label: "操作" },
      ],
    };
  },
  computed: {
    data() {
      return this.empty
        ? []
        : this.rows.slice((this.page - 1) * this.size, this.page * this.size);
    },
  },
};
</script>
