<template>
  <el-table-column v-if="shown" :key="columnKey" v-bind="columnAttrs">
    <table-column
      v-for="(child, index) in children"
      :key="childKey(child, index)"
      :column="child"
      :col-index="index"
      :parent-key="columnKey"
      :leading="leading && index === 0"
    />
    <template v-if="!structural" slot="header" slot-scope="scope">
      <table-cell header :row="scope.row || {}" :column="column" :index="scope.$index" :table="host" />
    </template>
    <template v-if="showCell" slot-scope="scope">
      <table-cell :row="scope.row || {}" :column="column" :index="scope.$index" :table="host" />
    </template>
  </el-table-column>
</template>
<script>
import { TableColumn as ElTableColumn } from "element-ui";
import TableCell from "./TableCell";
import { resolveColumnKey } from "./columnKey";
import TableColumn from "./TableColumn.vue";

const STRUCTURAL = ["index", "selection", "expand"];

export default {
  name: "DataTableColumn",
  components: { ElTableColumn, TableCell },
  inject: { host: { from: "dataTableHost", default: null } },
  beforeCreate() {
    this.$options.components.TableColumn = TableColumn;
  },
  props: {
    column: { type: Object, default: () => ({}) },
    colIndex: { type: Number, default: 0 },
    parentKey: { type: String, default: "" },
    leading: Boolean,
  },
  computed: {
    shown() {
      const column = this.column || {};
      return column.visible !== false && column.showColumn !== false;
    },
    columnKey() {
      return resolveColumnKey(this.column, this.colIndex, this.parentKey);
    },
    children() {
      const list = this.column && this.column.children;
      return Array.isArray(list) ? list : [];
    },
    structural() {
      const type = this.column && this.column.type;
      return STRUCTURAL.indexOf(type) !== -1;
    },
    showCell() {
      return !this.children.length && !this.structural;
    },
    columnAlign() {
      const column = this.column || {};
      if (column.align) return column.align;
      if (this.leading && this.showCell) return "left";
      const host = this.host || {};
      return host.align || "center";
    },
    columnAttrs() {
      const column = this.column || {};
      const host = this.host || {};
      const attrs = {
        prop: column.prop,
        label: column.label,
        width: column.width,
        minWidth: column.minWidth,
        fixed: column.fixed,
        align: this.columnAlign,
        headerAlign: column.headerAlign || this.columnAlign,
        sortable: column.sortable,
        sortMethod: column.sortMethod,
        sortBy: column.sortBy,
        sortOrders: column.sortOrders,
        resizable: column.resizable != null ? column.resizable : host.resizable !== false,
        showOverflowTooltip: column.showTip || column.tooltip,
        className: column.className,
        labelClassName: column.labelClassName,
        columnKey: column.columnKey,
        filters: column.filters,
        filterPlacement: column.filterPlacement,
        filterMultiple: column.filterMultiple,
        filterMethod: column.filterMethod,
        filteredValue: column.filteredValue,
      };
      if (STRUCTURAL.indexOf(column.type) !== -1) attrs.type = column.type;
      if (typeof column.index === "function") attrs.index = column.index;
      if (typeof column.selectable === "function") attrs.selectable = column.selectable;
      if (column.type === "selection") {
        attrs.reserveSelection = column.reserveSelection != null ? column.reserveSelection : !!host.reserveSelection;
      }
      return attrs;
    },
  },
  methods: {
    childKey(column, index) {
      return `${index}_${resolveColumnKey(column, index, this.columnKey)}`;
    },
  },
};
</script>
