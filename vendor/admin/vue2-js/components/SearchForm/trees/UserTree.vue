<template>
  <base-tree-select
    :data="data"
    :value="value"
    :node-key="keys.nodeKey"
    :value-key="keys.valueKey"
    :label-key="keys.labelKey"
    :children-key="keys.childrenKey"
    :link-key="keys.valueKey"
    link-same
    :multiple="multiple"
    :placeholder="placeholder"
    :accept="acceptUser"
    :map-node="mapUser"
    :filter-fields="filterFields"
    @input="$emit('input', $event)"
    @check="$emit('check', $event)"
  />
</template>
<script>
import BaseTreeSelect from "./BaseTreeSelect.vue";
import {
  hasKey,
  isUserNode,
  readMultiple,
  submitId,
  treePlaceholder,
} from "./treeModel";

export default {
  name: "SearchUserTree",
  inheritAttrs: false,
  components: { BaseTreeSelect },
  props: {
    item: { type: Object, required: true },
    data: { type: Array, default: () => [] },
    value: { default: undefined },
  },
  computed: {
    keys() {
      const childrenKey = "children";
      if (hasKey(this.data, "user_id", childrenKey)) {
        return {
          nodeKey: hasKey(this.data, "union_id", childrenKey)
            ? "union_id"
            : "user_id",
          valueKey: "user_id",
          labelKey: "name",
          childrenKey,
        };
      }
      return {
        nodeKey: hasKey(this.data, "tree_id", childrenKey) ? "tree_id" : "id",
        valueKey: "id",
        labelKey: hasKey(this.data, "title", childrenKey) ? "title" : "name",
        childrenKey,
      };
    },
    multiple() {
      return readMultiple(this.item, true);
    },
    placeholder() {
      return treePlaceholder(this.item);
    },
    filterFields() {
      return [
        "name",
        "depart_name",
        "name_en",
        "depart_name_en",
        this.keys.labelKey,
      ];
    },
  },
  methods: {
    acceptUser(node) {
      return isUserNode(node);
    },
    mapUser(node) {
      if (this.keys.valueKey !== "id") return node;
      const id = submitId(node.id);
      if (id === node.id) return node;
      return { ...node, id };
    },
  },
};
</script>
