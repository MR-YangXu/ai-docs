<template>
  <div>
    <p class="demo-note">
      树表与多级表头；分页只切公司层级。pageQuery 会被表格更新，onPagination
      收到更新后的查询。
    </p>
    <data-table
      row-key="id"
      :data="data"
      :columns="columns"
      :tree-props="{ children: 'children' }"
      :page-query="query"
      :page-sizes="[5, 10]"
      :has-pag="true"
      :on-pagination="paginate"
      ><template #operation="{ row }"
        ><span>{{ row.children ? "公司" : "店铺" }}</span></template
      ></data-table
    >
    <pre class="demo-output" aria-label="分页查询">{{
      JSON.stringify(query, null, 2)
    }}</pre>
  </div>
</template>
<script>
import DataTable from "@/components/DataTable/index.vue";
export default {
  components: { DataTable },
  data() {
    return {
      query: { page: 1, page_size: 5, total: 12 },
      last: null,
      columns: [
        { prop: "name", label: "公司 / 店铺", width: 200 },
        {
          label: "经营信息",
          children: [
            { prop: "country", label: "国家" },
            { prop: "count", label: "数量" },
          ],
        },
        { render: "operation", label: "操作" },
      ],
      rows: Array.from({ length: 12 }, (_, i) => ({
        id: `company-${i}`,
        name: `公司 ${i + 1}`,
        country: "中国",
        count: 20,
        children: [
          { id: `shop-${i}`, name: "上海店铺", country: "中国", count: 10 },
        ],
      })),
    };
  },
  computed: {
    data() {
      return this.rows.slice(
        (this.query.page - 1) * this.query.page_size,
        this.query.page * this.query.page_size
      );
    },
  },
  methods: {
    paginate(query) {
      this.last = { ...query };
    },
  },
};
</script>
