<template>
  <el-time-picker
    v-if="fieldPropsValid"
    is-range
    arrow-control
    :value="value"
    range-separator="至"
    start-placeholder="开始时间"
    end-placeholder="结束时间"
    :placeholder="item.name || '选择时间范围'"
    :clearable="item.clearable !== false"
    ref="popup"
    @focus="claimSearchPopup"
    @input="$emit('input', $event)"
  />
</template>
<script>
import { searchPopupMixin } from "../popupHub";
import {
  checkRangeField,
  createFieldProps,
  explainRangeValue,
  withFieldGuard,
} from "./fieldProps";

export default withFieldGuard(
  {
    name: "SearchTimeRangeField",
    mixins: [searchPopupMixin],
    inheritAttrs: false,
    props: createFieldProps(explainRangeValue),
    methods: {
      closeSearchPopup() {
        this.closeElementPopup("popup");
      },
    },
  },
  checkRangeField,
);
</script>
