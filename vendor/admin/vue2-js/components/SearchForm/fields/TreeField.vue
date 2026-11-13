<template>
  <component
    :is="view"
    v-if="fieldPropsValid && view"
    :item="item"
    :data="treeData"
    :value="value"
    @input="$emit('input', $event)"
    @check="$emit('check', $event)"
  />
</template>
<script>
import {
  checkTreeField,
  createFieldProps,
  explainTreeValue,
  withFieldGuard,
} from "./fieldProps";
import CustomTree from "../trees/CustomTree.vue";
import DepartmentAllTree from "../trees/DepartmentAllTree.vue";
import DepartmentTree from "../trees/DepartmentTree.vue";
import UserTree from "../trees/UserTree.vue";
import { readTreeData, resolveTreeKind } from "../trees/treeModel";

const VIEWS = {
  user: UserTree,
  department: DepartmentTree,
  departmentAll: DepartmentAllTree,
  custom: CustomTree,
};

export default withFieldGuard(
  {
    name: "SearchTreeField",
    inheritAttrs: false,
    components: { UserTree, DepartmentTree, DepartmentAllTree, CustomTree },
    props: createFieldProps(explainTreeValue),
    computed: {
      view() {
        return VIEWS[resolveTreeKind(this.item)] || null;
      },
      treeData() {
        return readTreeData(this.item, this.options);
      },
    },
  },
  checkTreeField,
);
</script>
