<template>
  <div>
    <search-form
      :items="items"
      :query.sync="query"
      :remote-query="remoteQuery"
    />
    <p class="demo-note">
      打开人员下拉后输入关键词搜索；控件负责防抖与过期请求处理。项目字段有默认值和提交格式化。
    </p>
    <pre class="demo-output" aria-label="查询条件">{{
      JSON.stringify(query, null, 2)
    }}</pre>
  </div>
</template>
<script>
import SearchForm from "@/components/SearchForm/index.vue";
import { wait } from "../../shared/mock";
export default {
  components: { SearchForm },
  data() {
    return {
      query: {},
      items: [
        {
          key: "owner",
          name: "远程人员",
          type: "select",
          remote: true,
          data: [],
        },
        {
          key: "project",
          name: "项目",
          type: "text",
          defaultValue: "演示项目",
          format: (value) => String(value).trim(),
        },
      ],
    };
  },
  methods: {
    async remoteQuery(key, keyword) {
      await wait(200);
      return [
        { label: "周宁", value: 0 },
        { label: "林夏", value: 1 },
      ].filter((option) => option.label.includes(keyword));
    },
  },
};
</script>
