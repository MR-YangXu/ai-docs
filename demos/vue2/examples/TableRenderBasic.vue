<template>
  <div>
    <data-table
      row-key="id"
      :table-columns="columns"
      :table-data="rows.slice(0, 3)"
    />
    <p class="demo-status" role="status">
      {{ feedback || "枚举映射与嵌套取值；0 按原值展示。" }}
    </p>
  </div>
</template>
<script>
import DataTable from "@/components/DataTable/index.vue";
import { buildColumns } from "@/utils/tableRender";
import { rows } from "../../shared/mock";
export default {
  components: { DataTable },
  data() {
    return {
      rows,
      feedback: "",
      columns: buildColumns(
        [
          { prop: "name", label: "名称", type: "default" },
          {
            prop: "status",
            label: "状态",
            type: "enum",
            enumList: [
              { label: "启用", value: 1 },
              { label: "停用", value: 0 },
            ],
          },
          {
            prop: "owner",
            label: "负责人",
            type: "nested",
            path: "owner.name",
          },
          {
            prop: "count",
            label: "数量",
            formatter: (row) => `数量 ${row.count}`,
          },
        ],
        {
          onCopied: () => {
            this.feedback = "已复制";
          },
          onCopyError: (error) => {
            this.feedback = String(error);
          },
        }
      ),
    };
  },
};
</script>
