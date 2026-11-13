<template>
  <div class="ai-code-search-items__field" :class="fieldClass">
    <div :class="{ 'ai-code-search-items__box': useShell }">
      <div v-if="showPrepend" class="ai-code-search-items__prepend">
        <name-type-prepend
          v-if="nameTypes.length"
          :value="item.nameTypeValue"
          :options="nameTypes"
          :name="item.name"
          :has-select="true"
          :show-name="!!item.name"
          @change="$emit('name-type-change', $event)"
        />
        <span v-else>{{ item.name }}</span>
      </div>
      <div :class="{ 'ai-code-search-items__body': useShell }">
        <slot
          v-if="fieldPropsValid && $scopedSlots.default"
          :item="item"
          :value="value"
        />
        <component
          :is="fieldView"
          v-else-if="fieldPropsValid && fieldView"
          :item="item"
          :value="value"
          :options="options"
          @input="$emit('input', $event)"
          @typing="$emit('typing', $event)"
          @remote="$emit('remote', $event)"
          @name-type-change="$emit('name-type-change', $event)"
          @check="$emit('check', $event)"
          @batch="$emit('batch', $event)"
          @dblclick="$emit('dblclick')"
          @focus-date="$emit('focus-date')"
          @blur="$emit('blur')"
        />
        <slot
          v-else-if="fieldPropsValid"
          name="fallback"
          :item="item"
          :value="value"
        />
      </div>
    </div>
    <i
      v-if="closable"
      class="el-icon-error closeBtn"
      @click="$emit('remove')"
    />
  </div>
</template>
<script>
import { resolveField } from "./fieldRegistry";
import { normalizeFieldType } from "./fieldTypes";
import NameTypePrepend from "./fields/NameTypePrepend.vue";
import {
  checkSearchField,
  explainItem,
  explainOptions,
  withFieldGuard,
} from "./fields/fieldProps";

/** 下拉、日期、级联、批量搜索左侧带蓝色字段名。文本只有 name_type 时才带。 */
const LABEL_TYPES = [2, 3, 4, 5, 6, 7, 9, 10, 11, 14, 16];
/** 单选按钮和最小最大自己排版，不再套一层蓝框。 */
const BARE_TYPES = [15, 17, 20];

export default withFieldGuard(
  {
    name: "SearchConfigField",
    components: { NameTypePrepend },
    props: {
      item: {
        type: Object,
        required: true,
        validator(item) {
          return explainItem(item) === "";
        },
      },
      value: { default: undefined },
      options: {
        type: Array,
        default: () => [],
        validator(options) {
          return explainOptions(options) === "";
        },
      },
      closable: { type: Boolean, default: false },
      classPrefix: { type: String, default: "search-item" },
    },
    computed: {
      fieldClass() {
        const prefix = this.classPrefix || "search-item";
        const key = this.item && this.item.key;
        return [prefix, key ? `${prefix}-${key}` : ""];
      },
      typeNumber() {
        return normalizeFieldType(this.item && this.item.type);
      },
      nameTypes() {
        const options = this.item && this.item.nameTypeOptions;
        return Array.isArray(options) ? options : [];
      },
      useShell() {
        return BARE_TYPES.indexOf(this.typeNumber) === -1;
      },
      showPrepend() {
        if (!this.useShell) return false;
        if (this.nameTypes.length) return true;
        return LABEL_TYPES.indexOf(this.typeNumber) !== -1 && !!this.item.name;
      },
      fieldView() {
        if (!this.fieldPropsValid) return null;
        return resolveField(this.item && this.item.type);
      },
    },
  },
  checkSearchField,
);
</script>
