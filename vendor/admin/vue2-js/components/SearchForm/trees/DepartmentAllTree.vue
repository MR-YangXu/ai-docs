<template>
  <base-tree-select
    :data="data"
    :value="value"
    :node-key="keys.nodeKey"
    :value-key="keys.valueKey"
    :label-key="keys.labelKey"
    :children-key="keys.childrenKey"
    :leaf-only="leafOnly"
    :multiple="multiple"
    :placeholder="placeholder"
    :filter-fields="filterFields"
    @input="$emit('input', $event)"
    @check="$emit('check', $event)"
  />
</template>
<script>
import BaseTreeSelect from "./BaseTreeSelect.vue";
import {
  readLegacyOptions,
  readMultiple,
  resolveTreeKeys,
  treePlaceholder,
} from "./treeModel";

/** 部门全选。默认只提交叶子；isAllNode 为 true 时连父节点一起提交。 */
export default {
  name: "SearchDepartmentAllTree",
  inheritAttrs: false,
  components: { BaseTreeSelect },
  props: {
    item: { type: Object, required: true },
    data: { type: Array, default: () => [] },
    value: { default: undefined },
  },
  computed: {
    keys() {
      return resolveTreeKeys(this.item, {
        nodeKey: "id",
        valueKey: "id",
        labelKey: "label",
        childrenKey: "children",
      });
    },
    leafOnly() {
      if (typeof this.item.leafOnly === "boolean") return this.item.leafOnly;
      const extra = this.item.selectOptionProps || {};
      if (this.item.isAllNode === true || extra.isAllNode === true)
        return false;
      return readLegacyOptions(this.item).isAllNode !== true;
    },
    multiple() {
      return readMultiple(this.item, true);
    },
    placeholder() {
      return treePlaceholder(this.item);
    },
    filterFields() {
      return [this.keys.labelKey, "name", "title", "depart_name"];
    },
  },
};
</script>
