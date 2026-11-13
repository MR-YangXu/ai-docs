<template>
  <div v-if="fieldPropsValid" class="ai-code-search-items__control">
    <el-cascader
      ref="cascader"
      :value="current"
      :options="treeOptions"
      :props="cascaderProps"
      :placeholder="item.name"
      :filterable="filterable"
      clearable
      collapse-tags
      :style="controlStyle"
      @visible-change="onPopupVisible"
      @input="onInput"
    />
  </div>
</template>
<script>
import { FIELD, normalizeFieldType } from "../fieldTypes";
import { searchPopupMixin } from "../popupHub";
import { itemExtra } from "./itemExtra";
import {
  checkCascaderField,
  createFieldProps,
  explainCascaderValue,
  withFieldGuard,
} from "./fieldProps";

/**
 * type 7、10、11。
 * change 的值保持级联自己的路径或编号，方便回显。
 * 勾选节点走 check。type 11 原来把 getCheckedNodes() 交给页面，节点在 check.nodes 上，含 data.name。
 * valueWay=product / single 时，change 的值改成项目原来筛过的编号。
 */
export default withFieldGuard(
  {
    name: "SearchCascaderField",
    mixins: [searchPopupMixin],
    inheritAttrs: false,
    props: createFieldProps(explainCascaderValue),
    data() {
      return {
        current: undefined,
        emitted: undefined,
      };
    },
    computed: {
      extra() {
        return itemExtra(this.item);
      },
      typeNumber() {
        return normalizeFieldType(this.item.type);
      },
      treeOptions() {
        if (this.options && this.options.length) return this.options;
        return this.item.data || [];
      },
      cascaderProps() {
        const given = this.item.cascaderProps || {};
        const extra = this.extra;
        const emitPath = Object.prototype.hasOwnProperty.call(given, "emitPath")
          ? given.emitPath
          : extra.emitPath;
        return {
          label: given.label || extra.label || "label",
          value: given.value || extra.value || "value",
          children: given.children || extra.children || "children",
          multiple:
            typeof given.multiple === "boolean" ? given.multiple : !!extra.multiple,
          emitPath: typeof emitPath === "boolean" ? emitPath : true,
          checkStrictly:
            given.checkStrictly != null ? given.checkStrictly : extra.checkStrictly,
        };
      },
      filterable() {
        if (typeof this.extra.filterable === "boolean") return this.extra.filterable;
        return this.typeNumber === FIELD.cascaderNew;
      },
      controlStyle() {
        const width = this.item.width || this.extra.width || 160;
        return { width: typeof width === "number" ? `${width}px` : width };
      },
    },
    watch: {
      value: {
        immediate: true,
        handler(next) {
          if (this.same(next, this.emitted)) return;
          this.current = next;
        },
      },
    },
    methods: {
      closeSearchPopup() {
        this.closeElementPopup("cascader");
      },
      same(left, right) {
        return JSON.stringify(left) === JSON.stringify(right);
      },
      onInput(value) {
        this.current = value;
        this.$nextTick(() => {
          const cascader = this.$refs.cascader;
          const nodes =
            cascader && typeof cascader.getCheckedNodes === "function"
              ? cascader.getCheckedNodes() || []
              : [];
          const way = this.extra.valueWay;
          let payload = value;
          if (way === "product") {
            payload = nodes.filter((node) => node.parent).map((node) => node.value);
          } else if (way === "single") {
            payload = nodes
              .filter((node) => !(node.parent && node.parent.checked))
              .map((node) => node.value);
          }
          this.emitted = payload;
          this.$emit("input", payload);
          this.$emit("check", {
            ids: nodes.map((node) => node.value),
            nodes,
          });
        });
      },
    },
  },
  checkCascaderField,
);
</script>
