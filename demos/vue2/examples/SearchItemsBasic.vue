<template>
  <div>
    <div class="demo-actions">
      <button @click="search.load">加载筛选项</button
      ><button @click="search.resetValues()">重置值</button>
    </div>
    <p v-if="search.state.loading" role="status">加载中…</p>
    <p v-if="search.state.error" role="alert">
      {{ String(search.state.error) }}
    </p>
    <search-form
      :items="search.state.visibleItems"
      :values="search.state.values"
      @change="search.patchValues({ [$event.key]: $event.value })"
    />
    <pre class="demo-output" aria-label="筛选项状态">{{
      JSON.stringify(
        {
          values: search.state.values,
          visible: search.state.visibleItems.map((item) => item.key),
        },
        null,
        2
      )
    }}</pre>
    <p v-if="message">{{ message }}</p>
  </div>
</template>
<script>
import { createSearchItems } from "@/logic/createSearchItems";
import SearchForm from "@/components/SearchForm/index.vue";
import { wait } from "../../shared/mock";
export default {
  components: { SearchForm },
  data() {
    const all = [
      { key: "keyword", name: "名称", type: "text", page_search_items_id: 1 },
      {
        key: "status",
        name: "状态",
        type: "select",
        data: [
          { label: "启用", value: 1 },
          { label: "停用", value: 0 },
        ],
        page_search_items_id: 2,
      },
    ];
    let saved = [1];
    const scenario = { fail: false };
    const search = createSearchItems("demo-page", {
      initialValues: { keyword: "" },
      fetchItems: async () => {
        await wait(250);
        if (scenario.fail) throw new Error("筛选项加载失败");
        return {
          page_items: all,
          user_page_items: all.filter((item) =>
            saved.includes(item.page_search_items_id)
          ),
        };
      },
      saveItems: async (ids) => {
        saved = ids;
      },
    });
    return { all, scenario, search, hidden: false, message: "" };
  },
  mounted() {
    this.search.load();
  },
  beforeDestroy() {
    this.search.dispose();
  },
  methods: {
    async add() {
      try {
        await this.search.add(this.all[1]);
      } catch (error) {
        this.message = String(error);
      }
    },
    async remove() {
      try {
        await this.search.remove(this.all[1]);
      } catch (error) {
        this.message = String(error);
      }
    },
  },
};
</script>
