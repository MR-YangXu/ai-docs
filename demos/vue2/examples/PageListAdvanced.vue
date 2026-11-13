<template>
  <div>
    <div class="demo-actions">
      <input
        v-model="draft"
        aria-label="查询名称"
        placeholder="例如：项目 01"
        @keyup.enter="list.onSubmit({ keyword: draft })"
      /><button @click="list.onSubmit({ keyword: draft })">查询</button
      ><button
        @click="
          draft = '';
          list.reset();
        "
      >
        重置</button
      ><label><input type="checkbox" v-model="scenario.fail" />模拟失败</label
      ><button
        @click="scenario.delay=900;list.onSubmit({keyword:&#39;项目 01&#39;})"
      >
        慢请求</button
      ><button
        @click="scenario.delay=50;list.onSubmit({keyword:&#39;项目 02&#39;})"
      >
        快请求
      </button>
    </div>
    <p v-if="list.state.loading" role="status">加载中…</p>
    <p v-if="list.state.error" role="alert">
      {{ String(list.state.error) }} <button @click="list.getData">重试</button>
    </p>
    <ul class="demo-list">
      <li v-for="row in list.state.tableData" :key="row.id">{{ row.name }}</li>
    </ul>
    <div class="demo-actions">
      <button
        :disabled="list.state.loading || list.state.pageParams.currentPage <= 1"
        @click="
          list.handlePageChange({
            pageNum: list.state.pageParams.currentPage - 1,
          })
        "
      >
        上一页</button
      ><span
        >第 {{ list.state.pageParams.currentPage }} 页 / 共
        {{ list.state.total }} 条</span
      ><button
        :disabled="
          list.state.loading ||
          list.state.pageParams.currentPage * list.state.pageParams.pageSize >=
            list.state.total
        "
        @click="
          list.handlePageChange({
            pageNum: list.state.pageParams.currentPage + 1,
          })
        "
      >
        下一页
      </button>
    </div>
  </div>
</template>
<script>
import { createPageList } from "@/logic/createPageList";
import { fetchRows } from "../../shared/mock";
export default {
  data() {
    const initial = { page: 1, page_size: 5, keyword: "" };
    const scenario = { fail: false, delay: 300 };
    return {
      draft: "",
      scenario,
      list: createPageList(initial, {
        initialQuery: initial,
        fetchList: (query, signal) => fetchRows(query, signal, scenario),
      }),
    };
  },
  mounted() {
    this.list.getData();
  },
  beforeDestroy() {
    this.list.dispose();
  },
};
</script>
