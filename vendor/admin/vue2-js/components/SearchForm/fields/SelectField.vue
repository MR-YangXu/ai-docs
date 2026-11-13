<template>
  <el-popover
    v-if="fieldPropsValid && remote"
    v-model="open"
    placement="bottom-start"
    width="220"
    trigger="click"
    popper-class="ai-code-search-items__remote-panel"
  >
    <div class="ai-code-search-items__remote-search">
      <el-input
        ref="search"
        v-model="keyword"
        size="small"
        placeholder="搜索"
        suffix-icon="el-icon-search"
        @input="onKeyword"
      />
    </div>
    <ul class="ai-code-search-items__remote-list">
      <li
        v-for="option in options"
        :key="String(option[valueKey])"
        :class="{ 'is-selected': picked(option) }"
        @click="pick(option)"
      >
        {{ option[labelKey] }}
      </li>
      <li v-if="!options.length" class="is-empty">无匹配数据</li>
    </ul>
    <div
      slot="reference"
      class="ai-code-search-items__remote"
      :class="{ 'is-empty': !hasValue, 'has-value': hasValue }"
      :style="controlStyle"
    >
      <span v-if="!multiple" class="ai-code-search-items__remote-text">
        {{ hasValue ? singleText : placeholder }}
      </span>
      <span v-else-if="hasValue" class="ai-code-search-items__remote-tags">
        <el-tag size="mini" closable type="info" @close="removeFirst">
          {{ labelOf(selectedIds[0]) }}
        </el-tag>
        <el-tag v-if="selectedIds.length > 1" size="mini" type="info">
          + {{ selectedIds.length - 1 }}
        </el-tag>
      </span>
      <span v-else class="ai-code-search-items__remote-text">{{ placeholder }}</span>
      <i
        v-if="clearable && hasValue"
        class="el-icon-circle-close ai-code-search-items__remote-clear"
        @click.stop="clearValue"
      />
      <i
        class="el-icon-arrow-up ai-code-search-items__remote-arrow"
        :class="{ 'is-open': open }"
      />
    </div>
  </el-popover>
  <el-select
    v-else-if="fieldPropsValid"
    :value="value"
    :multiple="multiple"
    :placeholder="placeholder"
    :filterable="filterable"
    :allow-create="allowCreate"
    :clearable="item.clearable !== false"
    collapse-tags
    :style="controlStyle"
    ref="popup"
    @visible-change="onPopupVisible"
    @input="$emit('input', $event)"
  >
    <el-option
      v-for="option in options"
      :key="String(option[valueKey])"
      :label="option[labelKey]"
      :value="option[valueKey]"
    />
  </el-select>
</template>
<script>
import { FIELD, normalizeFieldType } from "../fieldTypes";
import { searchPopupMixin } from "../popupHub";
import { itemExtra, optionKeys } from "./itemExtra";
import {
  checkSelectField,
  createFieldProps,
  explainSelectValue,
  withFieldGuard,
} from "./fieldProps";

/** type 2 单选、type 3 多选。远程下拉在面板里搜索，和原来的 xl-select 一致。 */
export default withFieldGuard(
  {
    name: "SearchSelectField",
    mixins: [searchPopupMixin],
    inheritAttrs: false,
    props: createFieldProps(explainSelectValue),
    data() {
      return { open: false, keyword: "", labels: {} };
    },
    computed: {
      extra() {
        return itemExtra(this.item);
      },
      multiple() {
        if (typeof this.extra.isMultiple === "boolean") return this.extra.isMultiple;
        if (this.extra.multiple === true) return true;
        return normalizeFieldType(this.item.type) === FIELD.multiSelect;
      },
      labelKey() {
        return optionKeys(this.item).labelKey;
      },
      valueKey() {
        return optionKeys(this.item).valueKey;
      },
      remote() {
        return !!(this.item.remote || this.extra.remote);
      },
      filterable() {
        if (typeof this.item.filterable === "boolean") return this.item.filterable;
        if (typeof this.extra.filterable === "boolean") return this.extra.filterable;
        return false;
      },
      allowCreate() {
        return !!(this.item.allowCreate || this.extra.allowCreate);
      },
      clearable() {
        return this.item.clearable !== false;
      },
      placeholder() {
        return this.extra.placeholder || this.item.placeholder || this.item.name;
      },
      selectedIds() {
        if (!this.multiple) return [];
        return Array.isArray(this.value) ? this.value : [];
      },
      hasValue() {
        if (this.multiple) return this.selectedIds.length > 0;
        return this.value != null && this.value !== "";
      },
      singleText() {
        return this.labelOf(this.value) || String(this.value);
      },
      controlStyle() {
        const width = this.item.width || this.extra.width || (this.remote ? 160 : 210);
        return { width: typeof width === "number" ? `${width}px` : width };
      },
    },
    watch: {
      options: {
        deep: true,
        handler() {
          this.rememberLabels();
        },
      },
      open(val) {
        if (!val) return;
        this.claimSearchPopup();
        this.$nextTick(() => {
          const input = this.$refs.search;
          if (input && typeof input.focus === "function") input.focus();
        });
      },
    },
    beforeDestroy() {
      clearTimeout(this.searchTimer);
    },
    methods: {
      rememberLabels() {
        (this.options || []).forEach((option) => {
          if (!option) return;
          const id = option[this.valueKey];
          const text = option[this.labelKey];
          if (id == null || id === "" || text == null || text === "") return;
          this.$set(this.labels, String(id), text);
        });
      },
      labelOf(id) {
        if (id == null || id === "") return "";
        return this.labels[String(id)] || "";
      },
      picked(option) {
        const id = option[this.valueKey];
        if (this.multiple) return this.selectedIds.some((item) => item == id);
        return this.value == id;
      },
      onKeyword() {
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => {
          this.$emit("remote", this.keyword);
        }, 300);
      },
      pick(option) {
        const id = option[this.valueKey];
        this.rememberLabels();
        if (!this.multiple) {
          this.open = false;
          this.$emit("input", id);
          return;
        }
        const next = this.selectedIds.slice();
        const index = next.findIndex((item) => item == id);
        if (index >= 0) next.splice(index, 1);
        else next.push(id);
        this.$emit("input", next);
      },
      removeFirst(event) {
        if (event && event.stopPropagation) event.stopPropagation();
        const next = this.selectedIds.slice();
        next.shift();
        this.$emit("input", next);
      },
      clearValue() {
        this.open = false;
        this.$emit("input", this.multiple ? [] : "");
      },
      closeSearchPopup() {
        if (this.remote) this.open = false;
        else this.closeElementPopup("popup");
      },
    },
  },
  checkSelectField,
);
</script>
