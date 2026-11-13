<template>
  <el-radio-group
    v-if="fieldPropsValid"
    :value="value"
    size="small"
    @input="$emit('input', $event)"
  >
    <el-radio-button
      v-for="option in item.data || []"
      :key="option[valueKey]"
      :label="option[valueKey]"
    >
      {{ option[labelKey] }}
    </el-radio-button>
  </el-radio-group>
</template>
<script>
import { optionKeys } from "./itemExtra";
import {
  checkRadioField,
  createFieldProps,
  explainRadioValue,
  withFieldGuard,
} from "./fieldProps";

export default withFieldGuard(
  {
    name: "SearchRadioField",
    inheritAttrs: false,
    props: createFieldProps(explainRadioValue),
    computed: {
      labelKey() {
        return optionKeys(this.item).labelKey;
      },
      valueKey() {
        return optionKeys(this.item).valueKey;
      },
    },
  },
  checkRadioField,
);
</script>
