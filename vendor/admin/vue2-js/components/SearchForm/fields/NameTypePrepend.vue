<template>
  <div class="ai-code-search-items__name-type">
    <el-select
      v-if="hasSelect"
      ref="popup"
      :value="value"
      size="mini"
      :style="{ width: selectWidth + 'px' }"
      @visible-change="onPopupVisible"
      @change="$emit('change', $event)"
    >
      <el-option
        v-for="option in options"
        :key="option.value"
        :label="option.label"
        :value="option.value"
      />
    </el-select>
    <span v-if="showName && name">{{ name }}</span>
  </div>
</template>
<script>
import { searchPopupMixin } from "../popupHub";

/** 对应四个项目里 type 1 / 4 / 7 / 9 / 14 的前置：字段名，或 name_type 下拉加字段名。 */
export default {
  name: "SearchNameTypePrepend",
  mixins: [searchPopupMixin],
  inheritAttrs: false,
  props: {
    value: { default: undefined },
    options: { type: Array, default: () => [] },
    name: { type: String, default: "" },
    showName: { type: Boolean, default: true },
    hasSelect: { type: Boolean, default: true },
    selectWidth: { type: Number, default: 96 },
  },
  methods: {
    closeSearchPopup() {
      this.closeElementPopup("popup");
    },
  },
};
</script>
