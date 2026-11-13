<template>
  <div v-if="fieldPropsValid" class="ai-code-search-items__control">
    <el-date-picker
      :value="value"
      :type="dateType"
      :value-format="dateValueFormat"
      :format="dateFormat"
      :picker-options="pickerOptions"
      :default-time="defaultTime"
      :placeholder="item.name"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      range-separator="至"
      :clearable="clearable"
      :popper-class="popperClass"
      :style="controlStyle"
      ref="popup"
      @input="$emit('input', $event)"
      @focus="onFocus"
      @blur="$emit('blur')"
    />
  </div>
</template>
<script>
import { FIELD, normalizeFieldType } from "../fieldTypes";
import { searchPopupMixin } from "../popupHub";
import { itemExtra } from "./itemExtra";
import {
  checkRangeField,
  createFieldProps,
  explainRangeValue,
  withFieldGuard,
} from "./fieldProps";

/** type 4 日期时间、type 9 日期、type 16 月份。type 4 默认结束时间 23:59:59，和项目日期控件一致。 */
export default withFieldGuard(
  {
    name: "SearchDateRangeField",
    mixins: [searchPopupMixin],
    inheritAttrs: false,
    props: createFieldProps(explainRangeValue),
    computed: {
      extra() {
        return itemExtra(this.item);
      },
      typeNumber() {
        return normalizeFieldType(this.item.type);
      },
      dateType() {
        if (this.extra.type) return this.extra.type;
        if (this.item.dateType) return this.item.dateType;
        if (this.typeNumber === FIELD.dateTimeRange) return "datetimerange";
        if (this.typeNumber === FIELD.monthRange) return "monthrange";
        return "daterange";
      },
      dateValueFormat() {
        if (this.item.valueFormat) return this.item.valueFormat;
        if (this.extra.valueFormat) return this.extra.valueFormat;
        if (this.typeNumber === FIELD.monthRange) return "yyyy-MM";
        if (this.typeNumber === FIELD.dateTimeRange) return "yyyy-MM-dd HH:mm:ss";
        return "yyyy-MM-dd";
      },
      dateFormat() {
        if (typeof this.item.format === "string" && this.item.format) return this.item.format;
        if (typeof this.extra.format === "string" && this.extra.format) return this.extra.format;
        return this.dateValueFormat;
      },
      defaultTime() {
        if (this.dateType !== "datetimerange") return undefined;
        return (
          this.item.defaultTime ||
          this.extra.defaultTime || ["00:00:00", "23:59:59"]
        );
      },
      pickerOptions() {
        const options = this.item.pickerOptions || this.extra.pickerOption || this.extra.pickerOptions || {};
        const disabled = options.disabledDate || this.item.disabledDate || this.extra.disabledDate;
        const shortcuts = options.shortcuts || this.extra.shortcuts;
        const next = Object.assign({}, options);
        if (shortcuts) next.shortcuts = shortcuts;
        if (typeof disabled !== "function") return next;
        return Object.assign({}, next, {
          disabledDate(time) {
            if (!time) return false;
            const day = new Date(time.getFullYear(), time.getMonth(), time.getDate());
            return disabled(day);
          },
        });
      },
      popperClass() {
        return this.extra["popper-class"] || this.extra.popperClass || "";
      },
      clearable() {
        if (typeof this.item.clearable === "boolean") return this.item.clearable;
        if (typeof this.extra.clearable === "boolean") return this.extra.clearable;
        return true;
      },
      controlStyle() {
        const width = this.item.width || this.extra.width;
        if (width == null || width === "") return null;
        return { width: typeof width === "number" ? `${width}px` : width };
      },
    },
    methods: {
      onFocus() {
        this.claimSearchPopup();
        this.$emit("focus-date");
      },
      closeSearchPopup() {
        this.closeElementPopup("popup");
      },
    },
  },
  checkRangeField,
);
</script>
