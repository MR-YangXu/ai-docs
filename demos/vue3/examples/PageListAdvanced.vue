<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { usePageList } from "@/hooks/usePageList";
import { fetchRows, type Row } from "../../shared/mock";
const draft = ref(""),
  fail = ref(false),
  delay = ref(300);
const initial = { page: 1, page_size: 5, keyword: "" };
const {
  tableData,
  loading,
  error,
  pageParams,
  getData,
  onSubmit,
  reset,
  handlePageChange,
} = usePageList<typeof initial, Row>(reactive({ ...initial }), {
  initialQuery: initial,
  fetchList: (query, signal) =>
    fetchRows(query, signal, { fail: fail.value, delay: delay.value }),
});
onMounted(() => getData());
</script>
<template>
  <div>
    <div class="demo-actions">
      <input
        v-model="draft"
        aria-label="查询名称"
        placeholder="例如：项目 01"
        @keyup.enter="onSubmit({ keyword: draft })"
      /><button @click="onSubmit({ keyword: draft })">查询</button
      ><button
        @click="
          draft = '';
          reset();
        "
      >
        重置</button
      ><label><input type="checkbox" v-model="fail" />模拟失败</label
      ><button @click="delay=900;onSubmit({keyword:&#39;项目 01&#39;})">
        慢请求</button
      ><button @click="delay=50;onSubmit({keyword:&#39;项目 02&#39;})">
        快请求
      </button>
    </div>
    <p v-if="loading" role="status">加载中…</p>
    <p v-if="error" role="alert">
      {{ String(error) }} <button @click="getData">重试</button>
    </p>
    <ul class="demo-list">
      <li v-for="row in tableData" :key="row.id">{{ row.name }}</li>
    </ul>
    <div class="demo-actions">
      <button
        :disabled="loading || pageParams.currentPage <= 1"
        @click="handlePageChange({ pageNum: pageParams.currentPage - 1 })"
      >
        上一页</button
      ><span
        >第 {{ pageParams.currentPage }} 页 / 共 {{ pageParams.total }} 条</span
      ><button
        :disabled="
          loading ||
          pageParams.currentPage * pageParams.pageSize >= pageParams.total
        "
        @click="handlePageChange({ pageNum: pageParams.currentPage + 1 })"
      >
        下一页
      </button>
    </div>
  </div>
</template>
