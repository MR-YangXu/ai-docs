<template>
  <div>
    <search-form :items="items" :query.sync="query" />
    <p class="demo-note">
      时间种类：当前快照的 type 20 缺少容器校验映射，此处直接演示原始字段组件。
    </p>
    <SelectDateField
      :item="selectDateItem"
      :options="selectDateItem.data"
      :value="query.kindDate"
      @input="$set(query, 'kindDate', $event)"
    />
    <p class="demo-note">
      Vue 2 日期格式使用 yyyy-MM-dd。type 20 的值包含种类与日期。
    </p>
    <pre class="demo-output" aria-label="日期值">{{
      JSON.stringify(query, null, 2)
    }}</pre>
  </div>
</template>
<script>
import SearchForm from "@/components/SearchForm/index.vue";
import SelectDateField from "@/components/SearchForm/fields/SelectDateField.vue";
export default {
  components: { SearchForm, SelectDateField },
  data() {
    return {
      query: {},
      selectDateItem: {
        key: "kindDate",
        name: "时间种类",
        type: "selectDate",
        data: [
          { label: "创建时间", value: "created" },
          { label: "更新时间", value: "updated" },
        ],
      },
      items: [
        { key: "dates", name: "日期范围", type: "dateRange" },
        { key: "datetimes", name: "日期时间", type: "dateTimeRange" },
        { key: "time", name: "时间", type: "time" },
        { key: "times", name: "时间范围", type: "timeRange" },
        { key: "months", name: "月份范围", type: "monthRange" },
        {
          key: "cascaderNew",
          name: "级联单选",
          type: "cascaderNew",
          data: [
            {
              label: "华东",
              value: "east",
              children: [{ label: "上海", value: "sh" }],
            },
          ],
        },
        {
          key: "cascaderMulti",
          name: "级联多选",
          type: "cascaderMulti",
          data: [
            {
              label: "华东",
              value: "east",
              children: [
                { label: "上海", value: "sh" },
                { label: "杭州", value: "hz" },
              ],
            },
          ],
        },
      ],
    };
  },
};
</script>
