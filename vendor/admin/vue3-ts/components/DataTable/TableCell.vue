<template>
  <RenderContent v-if="column.render" />
  <ElTooltip
    v-else-if="column.lineClamp"
    :content="text"
    :disabled="!overflowing"
    :trigger="['hover', 'focus']"
    :trigger-keys="[]"
  >
    <component
      :is="column.click ? 'button' : 'span'"
      ref="textRef"
      class="table-cell__clamp"
      :class="{ 'table-cell__link': column.click }"
      :style="{ '-webkit-line-clamp': column.lineClamp }"
      :tabindex="overflowing ? 0 : null"
      :type="column.click ? 'button' : null"
      @click="column.click?.(row)"
      @focusin="measureOverflow"
      @mouseenter="measureOverflow"
      >{{ text }}</component
    >
  </ElTooltip>
  <button
    v-else-if="column.click"
    class="table-cell__link"
    type="button"
    @click="column.click?.(row)"
  >
    {{ text }}
  </button>
  <span v-else>{{ text }}</span>
</template>

<script setup lang="ts" generic="Row extends object">
import { computed, h, ref, watch, type FunctionalComponent } from "vue";
import { ElTooltip } from "element-plus";
import type { TableCellScope } from "./types";

const props = defineProps<TableCellScope<Row>>();
const text = computed(() => {
  const { row, column } = props;
  return String(
    (column.formatter
      ? column.formatter(row, column)
      : (row as Record<string, unknown>)[column.prop]) ?? "",
  );
});
// 在每次渲染时读取最新 props，避免替换列表后继续引用旧行。
const RenderContent: FunctionalComponent = () =>
  props.column.render?.(h, {
    row: props.row,
    column: props.column,
    index: props.index,
  });

const textRef = ref<HTMLElement>();
const overflowing = ref(false);
const measureOverflow = () => {
  const element = textRef.value;
  overflowing.value = element
    ? element.scrollHeight > element.clientHeight ||
      element.scrollWidth > element.clientWidth
    : false;
};
watch([text, () => props.column.lineClamp], measureOverflow, { flush: "post" });
watch(
  textRef,
  (element, previous, onCleanup) => {
    measureOverflow();
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(measureOverflow);
    observer.observe(element);
    onCleanup(() => observer.disconnect());
  },
  { flush: "post" },
);
</script>

<style lang="scss" scoped>
.table-cell__clamp {
  display: -webkit-box;
  width: 100%;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
  white-space: normal;
}

.table-cell__link {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--el-color-primary);
  font: inherit;
  text-align: inherit;
  cursor: pointer;
}
</style>
