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
    :accept="acceptNode"
    :map-node="mapCustom"
    :filter-fields="filterFields"
    @input="$emit('input', $event)"
    @check="$emit('check', $event)"
  />
</template>
<script>
import BaseTreeSelect from "./BaseTreeSelect.vue";
import { readMultiple, resolveTreeKeys, submitId, treePlaceholder } from "./treeModel";

/** 自定义树。编号默认 id，文案默认 title。 */
export default {
  name: "SearchCustomTree",
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
        labelKey: "title",
        childrenKey: "children",
      });
    },
    leafOnly() {
      if (typeof this.item.leafOnly === "boolean") return this.item.leafOnly;
      const props = {
        ...(this.item.defaultProps || {}),
        ...((this.item.selectOptionProps && this.item.selectOptionProps.defaultProps) || {}),
      };
      return props.lastLevel === true;
    },
    multiple() {
      return readMultiple(this.item, true);
    },
    placeholder() {
      return treePlaceholder(this.item);
    },
    validFn() {
      if (typeof this.item.isSomeValidFn === "function") return this.item.isSomeValidFn;
      const extra = this.item.selectOptionProps || {};
      return typeof extra.isSomeValidFn === "function" ? extra.isSomeValidFn : null;
    },
    filterFields() {
      return [this.keys.labelKey, "title", "name", "label"];
    },
  },
  methods: {
    acceptNode(node) {
      if (!this.validFn) return true;
      return !!this.validFn(node);
    },
    mapCustom(node) {
      if (this.keys.valueKey !== "id") return node;
      const id = submitId(node.id);
      if (id === node.id) return node;
      return { ...node, id };
    },
  },
};
</script>
