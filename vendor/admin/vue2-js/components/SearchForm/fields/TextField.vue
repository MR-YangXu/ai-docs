<template>
  <el-input
    v-if="fieldPropsValid"
    :value="text"
    :placeholder="item.placeholder || item.name"
    :clearable="item.clearable !== false"
    :style="controlStyle"
    @input="$emit('typing', $event)"
    @change="$emit('input', $event)"
  />
</template>
<script>
import {
  checkTextField,
  createFieldProps,
  explainTextValue,
  withFieldGuard,
} from "./fieldProps";

export default withFieldGuard(
  {
    name: "SearchTextField",
    inheritAttrs: false,
    props: createFieldProps(explainTextValue),
    computed: {
      text() {
        return this.value == null ? "" : this.value;
      },
      controlStyle() {
        const width = this.item.width;
        if (width == null || width === "") return null;
        return { width: typeof width === "number" ? `${width}px` : width };
      },
    },
  },
  checkTextField,
);
</script>
