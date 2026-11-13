<template>
  <div>
    <search-form :items="items" :query.sync="query" @change="last = $event" />
    <div class="demo-actions">
      <button @click="query = { keyword: '', status: 0 }">重置条件</button
      ><button @click="query = { keyword: '回填内容', status: 1 }">
        回填条件
      </button>
    </div>
    <p class="demo-note">输入会更新 query；文本失焦或回车触发 change。</p>
    <pre class="demo-output" aria-label="查询条件">{{
      JSON.stringify(query, null, 2)
    }}</pre>
    <pre class="demo-output" aria-label="最后事件">{{
      JSON.stringify(last, null, 2)
    }}</pre>
  </div>
</template>
<script>
import SearchForm from "@/components/SearchForm/index.vue";
export default {
  components: { SearchForm },
  data() {
    return {
      query: { keyword: "", status: 0 },
      last: null,
      items: [
        { key: "keyword", name: "名称", type: "text" },
        {
          key: "status",
          name: "状态",
          type: "select",
          data: [
            { label: "启用", value: 1 },
            { label: "停用", value: 0 },
          ],
        },
        {
          key: "tags",
          name: "标签",
          type: "multiSelect",
          data: [
            { label: "重点", value: "key" },
            { label: "普通", value: "normal" },
          ],
        },
      ],
    };
  },
};
</script>
