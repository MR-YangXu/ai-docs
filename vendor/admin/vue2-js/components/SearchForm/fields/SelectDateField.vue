<template>
  <div v-if="options.length" class="ai-code-search-items__select-date">
    <el-select
      ref="select"
      v-model="selectData"
      size="small"
      placeholder="请选择"
      :style="{ width: selectWidth }"
      @visible-change="onSelectVisible"
      @change="changeValue"
    >
      <el-option
        v-for="option in options"
        :key="option.value"
        :label="option.label"
        :value="option.value"
      />
    </el-select>
    <el-date-picker
      ref="date"
      :key="dateType"
      v-model="dateTime"
      :type="dateType"
      size="small"
      range-separator="至"
      :format="dateFormat"
      :clearable="clearable"
      :value-format="valueFormat"
      :picker-options="pickerOptions"
      :start-placeholder="startPlaceholder"
      :end-placeholder="endPlaceholder"
      :placeholder="placeholder"
      :default-time="defaultTime"
      @focus="onDateFocus"
      @blur="$emit('blur')"
      @change="changeValue"
    />
  </div>
</template>
<script>
import { searchPopupMixin } from "../popupHub";
import { itemExtra } from "./itemExtra";

/** type 20。左侧选时间种类，右侧选日期。对外值是 [种类, 时间]。 */
export default {
  name: "SearchSelectDateField",
  mixins: [searchPopupMixin],
  inheritAttrs: false,
  props: {
    item: { type: Object, required: true },
    value: { default: undefined },
    options: { type: Array, default: () => [] },
  },
  data() {
    return {
      selectData: "",
      dateTime: "",
    };
  },
  computed: {
    extra() {
      return itemExtra(this.item);
    },
    dateType() {
      return this.extra.type || "daterange";
    },
    singleMonth() {
      return this.dateType === "month";
    },
    dateFormat() {
      if (typeof this.item.format === "string" && this.item.format) return this.item.format;
      if (typeof this.extra.format === "string" && this.extra.format) return this.extra.format;
      return "yyyy-MM-dd";
    },
    valueFormat() {
      return this.extra.valueFormat || "yyyy-MM-dd";
    },
    pickerOptions() {
      return this.extra.pickerOptions || {};
    },
    clearable() {
      return this.extra.clearable !== false;
    },
    startPlaceholder() {
      return this.extra.startPlaceholder || "开始日期";
    },
    endPlaceholder() {
      return this.extra.endPlaceholder || "结束日期";
    },
    placeholder() {
      return this.extra.placeholder || "";
    },
    selectWidth() {
      const width = this.extra.width || 160;
      return typeof width === "number" ? `${width}px` : width;
    },
    defaultTime() {
      if (this.dateType === "month" || this.dateType === "monthrange") return undefined;
      return this.extra.defaultTime || ["00:00:00", "23:59:59"];
    },
  },
  watch: {
    options: {
      immediate: true,
      handler(list) {
        if (this.selectData || !list || !list[0]) return;
        this.selectData = list[0].value;
      },
    },
    "extra.defaultValue": {
      deep: true,
      immediate: true,
      handler() {
        this.applyDefault();
      },
    },
    value(next) {
      if (!Array.isArray(next)) return;
      this.selectData = next[0];
      this.dateTime = this.rangeOf(next[1]);
    },
  },
  methods: {
    rangeOf(value) {
      if (!this.singleMonth) return value;
      if (Array.isArray(value)) return value[0] || "";
      return value;
    },
    applyDefault() {
      const preset = this.extra.defaultValue;
      if (!Array.isArray(preset)) return;
      this.selectData = preset[0];
      this.dateTime = this.rangeOf(preset[1]);
    },
    changeValue() {
      let timeVal = this.dateTime;
      if (this.singleMonth) timeVal = this.dateTime ? [this.dateTime, this.dateTime] : [];
      if (this.pickerOptions.onChange) this.pickerOptions.onChange();
      this.$emit("input", [this.selectData, timeVal]);
    },
    onSelectVisible(open) {
      if (!open) return;
      this.claimSearchPopup();
      this.closeElementPopup("date");
    },
    onDateFocus() {
      this.claimSearchPopup();
      this.closeElementPopup("select");
    },
    closeSearchPopup() {
      this.closeElementPopup("select");
      this.closeElementPopup("date");
    },
  },
};
</script>
<style lang="scss" scoped>
.ai-code-search-items__select-date {
  display: flex;
  align-items: center;
}

.ai-code-search-items__select-date ::v-deep .el-select .el-input__inner {
  color: #409eff;
  border-color: #409eff;
  border-right: 0;
  border-radius: 4px 0 0 4px;
  height: 30px;
  line-height: 30px;
  font-size: 12px;
}

.ai-code-search-items__select-date ::v-deep .el-date-editor.el-range-editor {
  color: #409eff;
  border-color: #409eff;
  border-radius: 0 4px 4px 0;
  height: 30px;
}

.ai-code-search-items__select-date ::v-deep .el-date-editor.el-input .el-input__inner {
  color: #409eff;
  border-color: #409eff;
  border-radius: 0 4px 4px 0;
  height: 30px;
  line-height: 30px;
}
</style>
