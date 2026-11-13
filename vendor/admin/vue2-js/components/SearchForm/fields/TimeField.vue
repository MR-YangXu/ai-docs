<template>
  <el-time-select
    v-if="fieldPropsValid"
    :value="value"
    :placeholder="item.name || '选择时间'"
    :picker-options="pickerOptions"
    :clearable="item.clearable !== false"
    ref="popup"
    @focus="claimSearchPopup"
    @input="$emit('input', $event)"
  />
</template>
<script>
import { itemExtra } from "./itemExtra";
import { searchPopupMixin } from "../popupHub";
import {
  checkTimeField,
  createFieldProps,
  explainTextValue,
  withFieldGuard,
} from "./fieldProps";

export default withFieldGuard(
  {
    name: "SearchTimeField",
    mixins: [searchPopupMixin],
    inheritAttrs: false,
    props: createFieldProps(explainTextValue),
    computed: {
      pickerOptions() {
        const extra = itemExtra(this.item);
        if (this.item.pickerOptions) return this.item.pickerOptions;
        const disabled = this.item.disabledDate || extra.disabledDate;
        if (typeof disabled === "function") return { disabledDate: disabled };
        return extra.pickerOptions || {};
      },
    },
    methods: {
      closeSearchPopup() {
        this.closeElementPopup("popup");
      },
    },
  },
  checkTimeField,
);
</script>
