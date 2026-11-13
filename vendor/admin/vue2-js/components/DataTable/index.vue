<template>
  <div class="ai-code-table">
    <div
      v-if="$scopedSlots['multiple-operation']"
      class="ai-code-table__toolbar"
    >
      <span v-if="selection || hasSelectionColumn"
        >已选 {{ selected.length }} 个条目</span
      >
      <slot name="multiple-operation" :selection-data="selected" />
    </div>
    <el-table
      ref="table"
      v-loading="loading"
      v-bind="tableAttrs"
      :data="rows"
      :height="height"
      :row-key="rowKey"
      :border="border"
      :empty-text="emptyLabel"
      :shift-selection="shiftSelection"
      @selection-change="onSelection"
      @sort-change="onSort"
      @row-click="onRowClick"
      @expand-change="onExpand"
      @header-dragend="onColumnResize"
    >
      <el-table-column
        v-if="selection && !hasSelectionColumn"
        type="selection"
        :reserve-selection="reserveSelection"
        width="55"
      />
      <el-table-column
        v-if="showIndexColumn && !hasIndexColumn"
        type="index"
        label="序号"
        width="60"
        v-bind="indexColumnAttrs"
      />
      <el-table-column v-if="$scopedSlots.expand" type="expand">
        <template slot-scope="scope">
          <slot name="expand" :row="scope.row" :index="scope.$index" />
        </template>
      </el-table-column>
      <table-column
        v-for="(column, index) in shownColumns"
        :key="vnodeKey(column, index)"
        :column="column"
        :col-index="index"
        :leading="index === firstDataIndex"
      />
      <template v-if="$scopedSlots.empty" slot="empty">
        <slot name="empty" />
      </template>
    </el-table>
    <div v-if="pageView" class="ai-code-table__pagination">
      <el-pagination
        background
        :current-page="pageView.current"
        :page-size="pageView.size"
        :page-sizes="pageView.sizes"
        :total="pageView.total"
        :layout="layout"
        @current-change="onPage"
        @size-change="onSize"
      />
    </div>
  </div>
</template>
<script>
import { Table, TableColumn, Pagination, Loading } from "element-ui";
import TableColumnView from "./TableColumn.vue";
import { resolveColumnKey } from "./columnKey";

const TABLE_METHODS = [
  "clearSelection",
  "toggleRowSelection",
  "toggleAllSelection",
  "toggleRowExpansion",
  "setCurrentRow",
  "clearSort",
  "clearFilter",
  "doLayout",
  "sort",
];

export default {
  name: "DataTable",
  components: {
    ElTable: Table,
    ElTableColumn: TableColumn,
    ElPagination: Pagination,
    TableColumn: TableColumnView,
  },
  directives: { loading: Loading.directive },
  inheritAttrs: false,
  provide() {
    return { dataTableHost: this };
  },
  props: {
    tableData: { type: Array, default: () => [] },
    data: { type: Array, default: () => [] },
    tableColumns: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    pageParams: Object,
    pageQuery: { type: Object, default: () => ({}) },
    hasPag: Boolean,
    onPagination: Function,
    pageSizes: { type: Array, default: () => [20, 50, 100, 150] },
    layout: { type: String, default: "total, sizes, prev, pager, next, jumper" },
    loading: Boolean,
    selection: Boolean,
    reserveSelection: Boolean,
    shiftSelection: Boolean,
    showSerialNumber: Boolean,
    showIndex: Boolean,
    indexMethod: Function,
    height: { type: [String, Number], default: undefined },
    rowKey: { type: [String, Function], default: "id" },
    border: { type: Boolean, default: true },
    align: { type: String, default: "center" },
    resizable: { type: Boolean, default: true },
    noDataShow: { type: String, default: "暂无查询结果" },
    emptyText: { type: String, default: "" },
  },
  data() {
    return {
      selected: [],
      scrollTop: 0,
      filling: false,
      resizedColumnId: "",
      layoutWidth: 0,
      layoutHeight: 0,
    };
  },
  computed: {
    rows() {
      if (this.data.length) return this.data;
      return this.tableData;
    },
    columnList() {
      if (this.columns.length) return this.columns;
      return this.tableColumns;
    },
    shownColumns() {
      return this.columnList.filter((column) => column && column.visible !== false && column.showColumn !== false);
    },
    hasSelectionColumn() {
      return this.columnList.some((column) => column && column.type === "selection");
    },
    hasIndexColumn() {
      return this.columnList.some((column) => column && column.type === "index");
    },
    firstDataIndex() {
      const structural = ["index", "selection", "expand"];
      return this.shownColumns.findIndex((column) => column && structural.indexOf(column.type) === -1);
    },
    showIndexColumn() {
      return this.showSerialNumber || this.showIndex;
    },
    indexColumnAttrs() {
      return typeof this.indexMethod === "function" ? { index: this.indexMethod } : {};
    },
    emptyLabel() {
      return this.emptyText || this.noDataShow;
    },
    pageView() {
      if (this.pageParams) {
        return {
          current: this.pageParams.currentPage || 1,
          size: this.pageParams.pageSize || 20,
          sizes: this.pageParams.pageSizes || [10, 20, 50, 100],
          total: this.pageParams.total || 0,
          query: false,
        };
      }
      if (this.hasPag || (this.pageQuery && this.pageQuery.page != null)) {
        return {
          current: this.pageQuery.page || 1,
          size: this.pageQuery.page_size || 20,
          sizes: this.pageSizes,
          total: this.pageQuery.total || 0,
          query: true,
        };
      }
      return null;
    },
    tableAttrs() {
      return this.$attrs;
    },
  },
  watch: {
    height() {
      this.refreshLayout();
    },
  },
  mounted() {
    this.bindScroll();
    this.observeSize();
    this.refreshLayout();
  },
  beforeDestroy() {
    this.unbindScroll();
    clearTimeout(this.resizeTimer);
    if (this.observer) this.observer.disconnect();
  },
  methods: {
    vnodeKey(column, index) {
      return `${index}_${resolveColumnKey(column, index)}`;
    },
    onSelection(rows) {
      this.selected = rows;
      this.$emit("selection-change", rows);
      this.$emit("handleSelectionChange", rows);
    },
    onSort(payload) {
      this.$emit("sort-change", payload);
      this.$emit("handleSortChange", payload);
    },
    onRowClick(row, column, event) {
      this.$emit("row-click", row, column, event);
      this.$emit("rowClick", row, column, event);
    },
    onExpand(row, expanded) {
      this.$emit("expand-change", row, expanded);
    },
    onColumnResize(newWidth, oldWidth, column) {
      this.resizedColumnId = column && column.id;
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        const table = this.$refs.table;
        if (table && table.doLayout) table.doLayout();
        this.fillSpareWidth();
      }, 80);
    },
    onPage(page) {
      if (this.pageView && this.pageView.query && this.pageQuery) this.$set(this.pageQuery, "page", page);
      this.$emit("handleCurrentChange", { pageNum: page });
      this.$emit("pagination", { page, page_size: this.pageView ? this.pageView.size : undefined });
      this.notifyPagination(page, this.pageView ? this.pageView.size : undefined);
    },
    onSize(pageSize) {
      let page = this.pageView ? this.pageView.current : 1;
      const total = this.pageView ? this.pageView.total : 0;
      if (page * pageSize > total) page = 1;
      if (this.pageView && this.pageView.query && this.pageQuery) {
        this.$set(this.pageQuery, "page", page);
        this.$set(this.pageQuery, "page_size", pageSize);
      }
      this.$emit("handleSizeChange", { pageSize });
      this.$emit("pagination", { page, page_size: pageSize });
      this.notifyPagination(page, pageSize);
    },
    notifyPagination(page, pageSize) {
      if (typeof this.onPagination !== "function") return;
      this.onPagination({ ...(this.pageQuery || {}), page, page_size: pageSize });
    },
    refreshLayout() {
      this.$nextTick(() => {
        const table = this.$refs.table;
        if (!table || !table.doLayout) return;
        const width = table.$el.clientWidth;
        const height = table.$el.clientHeight;
        if (width === this.layoutWidth && height === this.layoutHeight) return;
        this.layoutWidth = width;
        this.layoutHeight = height;
        table.doLayout();
        this.fillSpareWidth();
      });
    },
    fillSpareWidth() {
      const table = this.$refs.table;
      if (!table || !table.store || this.filling) return;
      const columns = table.store.states.columns || [];
      if (!columns.length) return;
      const fixed = new Set([].concat(table.store.states.fixedColumns || [], table.store.states.rightFixedColumns || []));
      if (columns.some((column) => !fixed.has(column) && typeof column.width !== "number")) return;
      const structural = ["selection", "index", "expand"];
      const usable = columns.filter((column) => !fixed.has(column) && structural.indexOf(column.type) === -1);
      const preferred = usable.filter((column) => column.id !== this.resizedColumnId);
      const filler = (preferred.length ? preferred : usable).slice(-1)[0];
      if (!filler) return;
      this.filling = true;
      if (typeof filler.width === "number") filler.minWidth = filler.width;
      filler.width = undefined;
      table.doLayout();
      this.filling = false;
    },
    callTable(name, args) {
      const table = this.$refs.table;
      if (!table || typeof table[name] !== "function") return undefined;
      return table[name].apply(table, args);
    },
    clearSortFn() {
      return this.callTable("clearSort", []);
    },
    bindScroll() {
      const table = this.$refs.table;
      const body = table && table.bodyWrapper;
      if (!body) return;
      this.onTableScroll = (event) => {
        this.scrollTop = event.target.scrollTop;
        this.$emit("scroll", event);
      };
      body.addEventListener("scroll", this.onTableScroll);
    },
    unbindScroll() {
      const table = this.$refs.table;
      const body = table && table.bodyWrapper;
      if (body && this.onTableScroll) body.removeEventListener("scroll", this.onTableScroll);
    },
    resetTableScroll() {
      this.refreshLayout();
      this.$nextTick(() => {
        const table = this.$refs.table;
        const body = table && table.bodyWrapper;
        if (!body) return;
        body.scrollTop = this.scrollTop;
      });
    },
    observeSize() {
      if (typeof ResizeObserver !== "function" || !this.$refs.table) return;
      this.observer = new ResizeObserver(() => this.refreshLayout());
      this.observer.observe(this.$refs.table.$el);
    },
  },
  created() {
    TABLE_METHODS.forEach((name) => {
      if (name === "clearSort") {
        this.clearSort = () => this.callTable(name, []);
        return;
      }
      this[name] = (...args) => this.callTable(name, args);
    });
  },
};
</script>
<style lang="scss" src="./style.scss"></style>
