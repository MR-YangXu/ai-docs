<template>
  <div>
    <search-form
      :items="items"
      :query.sync="query"
      @change="last = $event"
      @check="last = $event"
      ><template #field-custom
        ><input
          class="demo-input"
          aria-label="自定义条件"
          :value="query.custom"
          @input="$set(query, 'custom', $event.target.value)" /></template
    ></search-form>
    <p class="demo-note">
      树节点和级联勾选通过 check 事件提供 ids、nodes；业务自行转换提交结构。
    </p>
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
    const tree = [
      {
        id: "root",
        label: "产品中心",
        children: [
          { id: "design", label: "设计组" },
          { id: "dev", label: "研发组" },
        ],
      },
    ];
    return {
      query: {},
      last: null,
      items: [
        {
          key: "region",
          name: "区域",
          type: "cascader",
          data: [
            {
              value: "cn",
              label: "中国",
              children: [{ value: "sh", label: "上海" }],
            },
          ],
        },
        { key: "department", name: "部门", type: "department", data: tree },
        { key: "all", name: "部门全选", type: "departmentAll", data: tree },
        {
          key: "people",
          name: "人员",
          type: "user",
          treeType: "user",
          data: [
            { id: 1, name: "周宁", type: "user" },
            { id: 2, name: "林夏", type: "user" },
          ],
        },
        { key: "customTree", name: "自定义树", type: "customTree", data: tree },
        {
          key: "radio",
          name: "渠道",
          type: "radio",
          data: [
            { label: "线上", value: 1 },
            { label: "线下", value: 0 },
          ],
        },
        { key: "batch", name: "批量编号", type: "batch" },
        { key: "amount", name: "金额", type: "minMax" },
        { key: "custom", name: "自定义", type: "custom" },
      ],
    };
  },
};
</script>
