<template>
  <div class="ai-code-table" :class="attrs.class" :style="attrs.style">
    <!-- 批量操作由页面提供，组件只维护当前选择。 -->
    <div
      v-if="
        showColumnSettings || $slots.toolbar || $slots['multiple-operation']
      "
      class="ai-code-table__toolbar"
    >
      <span v-if="selection"
        >已选 <strong>{{ selectionData.length }}</strong> 个条目</span
      >
      <slot name="toolbar" />
      <slot name="multiple-operation" :selection-data="selectionData" />
      <ElPopover
        v-if="showColumnSettings"
        placement="bottom-end"
        trigger="click"
        :width="220"
      >
        <p>显示列</p>
        <ElCheckboxGroup
          v-model="selectedProps"
          class="ai-code-table__column-list"
        >
          <ElCheckbox
            v-for="item in tableColumns"
            :key="item.prop"
            :value="item.prop"
            :disabled="item.hideable === false"
            >{{ item.label }}</ElCheckbox
          >
        </ElCheckboxGroup>
        <template #reference
          ><ElButton v-bind="{ size: 'default', 'aria-label': '设置显示列' }"
            >列设置</ElButton
          ></template
        >
      </ElPopover>
    </div>

    <ElTable
      ref="tableRef"
      v-loading="loading"
      v-bind="getTableAttrs()"
      :border="border"
      :data="tableData"
      :height="tableHeight"
      :max-height="maxHeight"
      :row-key="nativeRowKey"
      :row-style="rowStyle"
      :show-header="showHeader"
      :stripe="stripe"
      :style="{ minHeight }"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <template #empty>
        <slot name="empty"
          ><ElEmpty :description="noDataShow" :image-size="96"
        /></slot>
      </template>
      <ElTableColumn
        v-if="selection"
        align="center"
        :fixed="selectionFixed"
        :reserve-selection="reserveSelection && Boolean(rowKey)"
        :resizable="resizable"
        :selectable="selectFn"
        type="selection"
        :width="55"
      />
      <ElTableColumn
        v-if="showSerialNumber"
        align="center"
        :fixed="serialNumberFixed"
        :index="getSerialNumber"
        label="序号"
        :resizable="resizable"
        type="index"
        :width="60"
      />

      <ColumnGroup
        v-for="group in columnGroups"
        :key="group.key"
        :group="group"
      >
        <ElTableColumn
          v-for="column in group.columns"
          :key="column.prop"
          :align="column.align || 'center'"
          :class-name="column.className"
          :fixed="column.fixed"
          header-align="center"
          :label="column.label"
          :min-width="column.minWidth"
          :prop="column.prop"
          :resizable="resizable"
          :show-overflow-tooltip="column.tooltip && !column.lineClamp"
          :sort-orders="column.sortOrders"
          :sortable="column.sortable || false"
          :width="column.width"
        >
          <template #header="{ $index }">
            <HeaderContent :column="column" :index="$index" />
          </template>
          <template #default="{ row, $index }">
            <!-- Element Plus 收集列时会传入空行和 -1，实际单元格才执行页面渲染。 -->
            <slot
              v-if="$index >= 0"
              :column="column"
              :index="$index"
              :name="column.prop"
              :row="row"
            >
              <TableCell :column="column" :index="$index" :row="row" />
            </slot>
          </template>
        </ElTableColumn>
      </ColumnGroup>
    </ElTable>

    <div v-if="pagination.total > 0" class="ai-code-table__pagination">
      <ElPagination
        background
        :current-page="pagination.page"
        :layout="paginationLayout"
        :page-size="pagination.page_size"
        :page-sizes="pagination.page_sizes"
        :total="pagination.total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts" generic="Row extends object">
import {
  computed,
  h,
  nextTick,
  onBeforeUnmount,
  onBeforeUpdate,
  ref,
  renderSlot,
  shallowRef,
  useAttrs,
  useSlots,
  watch,
} from "vue";
import type { FunctionalComponent, HTMLAttributes } from "vue";
import {
  ElButton,
  ElCheckbox,
  ElCheckboxGroup,
  ElEmpty,
  ElLoading,
  ElPagination,
  ElPopover,
  ElTable,
  ElTableColumn,
} from "element-plus";
import type { TableInstance, TableProps } from "element-plus";
import type { SortChange, TableColumn, TablePageParams } from "./types";
import TableCell from "./TableCell.vue";

defineOptions({ inheritAttrs: false });
const vLoading = ElLoading.directive;
interface Props {
  tableData: Row[];
  tableColumns: TableColumn<Row>[];
  pageParams?: TablePageParams | null;
  loading?: boolean;
  border?: boolean;
  stripe?: boolean;
  showHeader?: boolean;
  showSerialNumber?: boolean;
  serialNumberFixed?: boolean;
  selection?: boolean;
  selectionFixed?: boolean;
  reserveSelection?: boolean;
  showColumnSettings?: boolean;
  rowKey: string | ((row: Row) => string | number);
  selectFn?: (row: Row, index: number) => boolean;
  resizable?: boolean;
  tableHeight?: string | number;
  maxHeight?: string | number;
  rowheight?: string;
  minHeight?: string;
  noDataShow?: string;
  paginationLayout?: string;
}
const props = withDefaults(defineProps<Props>(), {
  loading: false,
  border: true,
  stripe: true,
  showHeader: true,
  showSerialNumber: true,
  serialNumberFixed: true,
  showColumnSettings: true,
  resizable: true,
  tableHeight: "auto",
  noDataShow: "暂无查询结果",
  paginationLayout: "total,prev,pager,next,jumper,sizes",
});
type TableEmits = {
  (event: "handleSizeChange", value: { pageSize: number }): void;
  (event: "handleCurrentChange", value: { pageNum: number }): void;
  (event: "handleSelectionChange", rows: Row[]): void;
  (event: "handleSortChange", value: SortChange): void;
};
const emit = defineEmits<TableEmits>();
const attrs = useAttrs() as HTMLAttributes;
// class/style 保留在外层容器；每次渲染读取其他属性和监听器，透传给原生表格。
const getTableAttrs = () =>
  Object.fromEntries(
    Object.entries(attrs).filter(([key]) => key !== "class" && key !== "style"),
  );
const slots = useSlots();
// ElTableColumn 缓存表头渲染函数，通过插槽快照同步动态增删，保留列实例及排序状态。
const headerSlots = shallowRef({ ...slots });
onBeforeUpdate(() => {
  headerSlots.value = { ...slots };
});
const HeaderContent: FunctionalComponent<{
  column: TableColumn<Row>;
  index: number;
}> = ({ column, index }) =>
  renderSlot(
    headerSlots.value,
    `header-${column.prop}`,
    { column, index },
    () => [h("span", column.label)],
  );
const tableRef = ref<TableInstance>();
const nativeRowKey = computed(() =>
  typeof props.rowKey === "function"
    ? (row: Row) => String((props.rowKey as (row: Row) => string | number)(row))
    : props.rowKey,
);
const rowStyle: TableProps<Row>["rowStyle"] = (scope) => {
  const native = (attrs["row-style" as keyof HTMLAttributes] ??
    attrs["rowStyle" as keyof HTMLAttributes]) as TableProps<Row>["rowStyle"];
  return {
    ...(typeof native === "function" ? native(scope) : native),
    ...(props.rowheight ? { height: props.rowheight } : {}),
  };
};

// 列配置来自父级；用户勾选只更新组件内部的字段集合。
const selectedProps = ref<string[]>([]);
const visibleColumns = computed(() => {
  const selected = new Set(selectedProps.value);
  return props.tableColumns.filter(
    (column) => column.hideable === false || selected.has(column.prop),
  );
});

interface HeaderGroup {
  key: string;
  label: string;
  fixed: false | "left" | "right";
  columns: TableColumn<Row>[];
}
const columnGroups = computed(() => {
  const groups: HeaderGroup[] = [];
  // 先按原始顺序分组，避免隐藏首列或中间列时改变分组身份和边界。
  props.tableColumns.forEach((column) => {
    const label = column.group?.trim() ?? "";
    const fixed = column.fixed === true ? "left" : column.fixed || false;
    const previous = groups[groups.length - 1];
    if (label && previous?.label === label && previous.fixed === fixed) {
      previous.columns.push(column);
    } else {
      groups.push({ key: column.prop, label, fixed, columns: [column] });
    }
  });
  const visibleProps = new Set(
    visibleColumns.value.map((column) => column.prop),
  );
  return groups
    .map((group) => ({
      ...group,
      columns: group.columns.filter((column) => visibleProps.has(column.prop)),
    }))
    .filter((group) => group.columns.length > 0);
});
// 只给有 group 的列增加父表头，叶子列继续共用原来的模板与插槽。
const ColumnGroup: FunctionalComponent<{ group: HeaderGroup; key?: string }> = (
  { group },
  { slots },
) =>
  group.label
    ? h(
        ElTableColumn,
        { label: group.label, fixed: group.fixed, headerAlign: "center" },
        slots,
      )
    : slots.default?.();

watch(
  () =>
    props.tableColumns.map(({ prop, showColumn, hideable }) => ({
      prop,
      visible: hideable === false || showColumn !== false,
      required: hideable === false,
    })),
  (columns, previous = []) => {
    const previousVisibility = new Map(
      previous.map((column) => [column.prop, column.visible]),
    );
    const selected = new Set(selectedProps.value);
    selectedProps.value = columns
      .filter((column) => {
        return (
          column.required ||
          (previousVisibility.get(column.prop) === column.visible
            ? selected.has(column.prop)
            : column.visible)
        );
      })
      .map((column) => column.prop);
  },
  { immediate: true },
);

// 沿用既有分页事件及载荷，页面继续对接 usePageList 或自己的请求方法。
const pagination = computed(() => ({
  page: props.pageParams?.currentPage ?? props.pageParams?.page ?? 1,
  page_size: props.pageParams?.pageSize ?? props.pageParams?.page_size ?? 10,
  page_sizes: props.pageParams?.pageSizes ??
    props.pageParams?.page_sizes ?? [10, 20, 50],
  total: props.pageParams?.total ?? 0,
}));
const getSerialNumber = (index: number) =>
  (pagination.value.page - 1) * pagination.value.page_size + index + 1;
let changingPageSize = false;
let disposed = false;
const handleSizeChange = (pageSize: number) => {
  changingPageSize = true;
  emit("handleSizeChange", { pageSize });
  nextTick(() => {
    changingPageSize = false;
  });
};
const handleCurrentChange = (pageNum: number) => {
  // 修改每页数量时 Element Plus 可能同时修正页码，避免页面重复请求。
  if (changingPageSize) {
    return;
  }
  nextTick(() => {
    if (!changingPageSize && !disposed && pageNum !== pagination.value.page) {
      emit("handleCurrentChange", { pageNum });
    }
  });
};
onBeforeUnmount(() => {
  disposed = true;
});

const selectionData = shallowRef<Row[]>([]);
const handleSelectionChange = (rows: Row[]) => {
  selectionData.value = rows;
  emit("handleSelectionChange", rows);
};
const handleSortChange = ({ prop, order }: SortChange) =>
  emit("handleSortChange", { prop, order });

defineExpose({
  clearSort: () => tableRef.value?.clearSort(),
  sort: (...args: Parameters<TableInstance["sort"]>) =>
    tableRef.value?.sort(...args),
  doLayout: () => tableRef.value?.doLayout(),
  clearSelection: () => tableRef.value?.clearSelection(),
  getSelectionRows: () => tableRef.value?.getSelectionRows() ?? [],
  toggleRowSelection: (
    ...args: Parameters<TableInstance["toggleRowSelection"]>
  ) => tableRef.value?.toggleRowSelection(...args),
});
</script>

<style lang="scss" scoped src="./style.scss"></style>
