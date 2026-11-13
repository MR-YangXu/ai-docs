<template>
  <base-tree-select
    :data="data"
    :value="value"
    :node-key="keys.nodeKey"
    :value-key="keys.valueKey"
    :label-key="keys.labelKey"
    :children-key="keys.childrenKey"
    :link-key="linkKey"
    :link-same="linkSame"
    :leaf-only="leafOnly"
    :multiple="multiple"
    :placeholder="placeholder"
    :filter-fields="filterFields"
    @input="$emit('input', $event)"
    @check="$emit('check', $event)"
  />
</template>
<script>
import { FIELD, normalizeFieldType } from "../fieldTypes";
import BaseTreeSelect from "./BaseTreeSelect.vue";
import {
  readLegacyOptions,
  readMultiple,
  resolveTreeKeys,
  treePlaceholder,
} from "./treeModel";

/** 部门树。type 12 默认只提交叶子；type 8 的 tree_type=department 默认可提交父节点。 */
export default {
  name: "SearchDepartmentTree",
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
      return normalizeFieldType(this.item.type) === FIELD.department;
    },
    linkSame() {
      if (typeof this.item.needCheckSameNode === "boolean") {
        return this.item.needCheckSameNode;
      }
      return !!readLegacyOptions(this.item).needCheckSameNode;
    },
    linkKey() {
      return readLegacyOptions(this.item).value || "value";
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
