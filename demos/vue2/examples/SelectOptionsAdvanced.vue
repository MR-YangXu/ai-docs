<template>
  <div>
    <p class="demo-note">
      此逻辑面向 propName / optionsArr 配置；新 SearchForm 使用 key /
      data，需要由页面显式映射。
    </p>
    <div class="demo-actions">
      <label><input type="checkbox" v-model="fail" />模拟失败</label
      ><button @click="load">重新加载</button
      ><select v-model="value" aria-label="状态">
        <option value="">请选择</option>
        <option
          v-for="option in fields[0].optionsArr"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
    <p v-if="loading" role="status">加载中…</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <pre class="demo-output" aria-label="选项状态">{{
      JSON.stringify({ value, fields }, null, 2)
    }}</pre>
  </div>
</template>
<script>
import { createSelectOptions } from "@/logic/createSelectOptions";
import { wait } from "../../shared/mock";
export default {
  data() {
    const fields = [{ propName: "status", optionsArr: [] }];
    return {
      fields,
      controller: createSelectOptions(fields),
      fail: false,
      error: "",
      loading: false,
      value: "",
    };
  },
  mounted() {
    this.load();
  },
  beforeDestroy() {
    this.controller.dispose();
  },
  methods: {
    async load() {
      this.loading = true;
      this.error = "";
      try {
        await this.controller.loadFieldOptions(
          "status",
          async () => {
            await wait(350);
            if (this.fail) throw new Error("选项加载失败");
            return [
              { id: 0, name: "停用" },
              { id: 1, name: "启用" },
            ];
          },
          { key: "name", value: "id" }
        );
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
