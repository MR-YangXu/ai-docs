<template>
  <div v-loading="loading" class="ai-code-search-items">
    <div v-if="listPropsValid" class="ai-code-search-items__list">
      <search-config-field
        v-for="(item, index) in shownItems"
        :key="(item && (item.page_search_items_id || item.key)) || index"
        :item="item"
        :value="valueOf(item)"
        :options="optionsOf(item)"
        :closable="fieldClosable(item)"
        :class-prefix="classPrefix"
        @input="onInput(item, $event)"
        @typing="onTyping(item, $event)"
        @remote="onRemote(item, $event)"
        @name-type-change="$emit('name-type-change', { item, value: $event })"
        @check="onCheck(item, $event)"
        @batch="onBatch(item, $event)"
        @dblclick="$emit('dblclick', item)"
        @focus-date="$emit('focus-date', item)"
        @blur="$emit('blur', item)"
        @remove="$emit('remove', item)"
      >
        <template v-if="!builtin(item)" slot="fallback" slot-scope="scope">
          <slot
            v-if="$scopedSlots['field-' + item.key]"
            :name="'field-' + item.key"
            v-bind="scope"
          />
          <slot v-else name="field" v-bind="scope" />
        </template>
      </search-config-field>
      <slot name="line" />
      <slot name="add" />
      <slot />
    </div>
  </div>
</template>
<script>
import SearchConfigField from "./SearchField.vue";
import { FIELD, isBuiltinType, normalizeFieldType } from "./fieldTypes";
import {
  copyDefaultValue,
  defaultSubmitted,
  formatItemValue,
  hasDefaultValue,
} from "./fields/itemExtra";
import { createPopupHub } from "./popupHub";
import {
  checkSearchItems,
  explainItem,
  isPlainObject,
  raiseFieldError,
} from "./fields/fieldProps";

export default {
  name: "SearchForm",
  components: { SearchConfigField },
  inject: {
    searchPopupHub: { default: null },
  },
  provide() {
    const hub = this.searchPopupHub || createPopupHub();
    return { searchPopupHub: hub };
  },
  props: {
    items: { type: Array, default: () => [] },
    values: {
      type: Object,
      default: () => ({}),
      validator(values) {
        return isPlainObject(values);
      },
    },
    /** 提交数据。配合 :query.sync。有 format 时这里是格式化后的值。 */
    query: {
      type: Object,
      default: () => ({}),
      validator(query) {
        return isPlainObject(query);
      },
    },
    hiddenKeys: {
      type: Array,
      default: () => [],
      validator(keys) {
        return keys.every(
          (key) => typeof key === "string" || typeof key === "number",
        );
      },
    },
    loading: { type: Boolean, default: false },
    closable: { type: Boolean, default: false },
    /** 字段类名前缀。单独使用默认 search-item，外壳传 searchItem 以命中旧样式。 */
    classPrefix: { type: String, default: "search-item" },
    /** (key, keyword) => Promise<Array>，远程下拉由页面注入，组件不写 URL。 */
    remoteQuery: Function,
  },
  data() {
    return {
      remoteOptions: {},
      echo: {},
      listPropsValid: true,
      listPropsError: "",
      rejectedItems: {},
    };
  },
  computed: {
    shownItems() {
      if (!this.listPropsValid || !Array.isArray(this.items)) return [];
      const hidden = this.hiddenKeys;
      return this.items.filter((item) => {
        if (!isPlainObject(item)) return false;
        if (explainItem(item)) return true;
        return (
          !hidden.includes(item.key) &&
          !hidden.includes(item.id) &&
          !hidden.includes(item.name)
        );
      });
    },
  },
  watch: {
    items: {
      immediate: true,
      handler() {
        this.runListCheck();
        this.seedDefaults();
      },
    },
    values: {
      deep: true,
      handler() {
        this.runListCheck();
      },
    },
    hiddenKeys() {
      this.runListCheck();
    },
    remoteQuery() {
      this.runListCheck();
    },
    loading() {
      this.runListCheck();
    },
    closable() {
      this.runListCheck();
    },
    classPrefix() {
      this.runListCheck();
    },
  },
  methods: {
    runListCheck() {
      const message = checkSearchItems(this) || "";
      if (message !== this.listPropsError) {
        this.listPropsError = message;
        this.listPropsValid = !message;
        if (message) raiseFieldError(new TypeError(`SearchForm ${message}`));
      }
      if (!Array.isArray(this.items)) return;
      this.items.forEach((item, index) => {
        const entry = `items[${index}] 必须是对象`;
        if (isPlainObject(item)) {
          if (this.rejectedItems[entry]) this.$set(this.rejectedItems, entry, false);
          return;
        }
        if (this.rejectedItems[entry]) return;
        this.$set(this.rejectedItems, entry, true);
        raiseFieldError(new TypeError(`SearchForm ${entry}`));
      });
    },
    builtin(item) {
      return isBuiltinType(item && item.type);
    },
    fieldClosable(item) {
      if (item && typeof item.closable === "boolean") return item.closable;
      return this.closable;
    },
    valueOf(item) {
      const key = item && item.key;
      if (!key) return undefined;
      if (Object.prototype.hasOwnProperty.call(this.values, key)) return this.values[key];
      const saved = this.echo[key];
      const queryHas = this.query && Object.prototype.hasOwnProperty.call(this.query, key);
      if (saved && (!queryHas || this.sameBound(saved.submitted, this.query[key]))) return saved.display;
      if (queryHas) return this.query[key];
      if (hasDefaultValue(item)) return copyDefaultValue(item.defaultValue);
      return undefined;
    },
    seedDefaults() {
      (this.items || []).forEach((item) => {
        const key = item && item.key;
        if (!key || !hasDefaultValue(item)) return;
        if (Object.prototype.hasOwnProperty.call(this.values, key)) return;
        if (this.query && Object.prototype.hasOwnProperty.call(this.query, key)) return;
        if (this.echo[key]) return;
        const display = copyDefaultValue(item.defaultValue);
        const submitted = defaultSubmitted(item, display);
        this.remember(key, display, submitted);
        this.patchQuery(key, submitted);
      });
    },
    sameBound(left, right) {
      if (left === right) return true;
      if (left == null || right == null) return false;
      if (typeof left !== "object" && typeof right !== "object") return String(left) === String(right);
      try {
        return JSON.stringify(left) === JSON.stringify(right);
      } catch (error) {
        return false;
      }
    },
    remember(key, display, submitted) {
      this.$set(this.echo, key, { display, submitted });
    },
    patchQuery(key, value) {
      const base = isPlainObject(this.query) ? this.query : {};
      if (Object.prototype.hasOwnProperty.call(base, key) && this.sameBound(base[key], value)) return;
      this.$emit("update:query", { ...base, [key]: value });
    },
    emitsCheck(item) {
      const type = normalizeFieldType(item && item.type);
      return [
        FIELD.cascader,
        FIELD.user,
        FIELD.cascaderNew,
        FIELD.cascaderMulti,
        FIELD.department,
        FIELD.departmentAll,
        FIELD.customTree,
      ].indexOf(type) !== -1;
    },
    optionsOf(item) {
      if (!item || typeof item.key !== "string") return [];
      const source = this.remoteOptions[item.key] || item.data || [];
      return Array.isArray(source) ? source : [];
    },
    onInput(item, value) {
      // 树和级联紧接着会触发 check。format 在 check 里接收 { ids, nodes }，这里不能拿控件原值去跑。
      const formatted = this.emitsCheck(item) ? value : formatItemValue(item, value);
      this.remember(item.key, value, formatted);
      if (!this.emitsCheck(item) || typeof item.format !== "function") this.patchQuery(item.key, formatted);
      this.$emit("change", {
        key: item.key,
        value: formatted,
        display: value,
        item,
      });
    },
    onTyping(item, value) {
      this.remember(item.key, value, value);
      this.patchQuery(item.key, value);
      this.$emit("typing", { key: item.key, value, item });
    },
    /** 批量弹窗确认。展示值是逗号串；有单选项时 queryValue 是 { 选项: 数组 }。 */
    onBatch(item, payload) {
      const list = (payload && payload.list) || [];
      const display = list.join(",");
      const radioKey = payload && payload.radioKey;
      const queryValue = formatItemValue(item, radioKey ? { [radioKey]: list } : display);
      this.remember(item.key, display, queryValue);
      this.patchQuery(item.key, queryValue);
      this.$emit("change", {
        key: item.key,
        value: display,
        display,
        queryValue,
        item,
        type: "dblclick",
      });
    },
    /** 树勾选。ids 是提交用的编号，nodes 是勾选节点。 */
    onCheck(item, payload) {
      const current = payload || {};
      const ids = current.ids || [];
      const nodes = current.nodes || [];
      const next = { key: item.key, ids, nodes, item };
      if (item && typeof item.format === "function") {
        next.value = item.format({ ids, nodes }, item);
        next.formatted = true;
        const display = this.echo[item.key] ? this.echo[item.key].display : ids;
        this.remember(item.key, display, next.value);
        this.patchQuery(item.key, next.value);
      }
      this.$emit("check", next);
    },
    async onRemote(item, keyword) {
      if (typeof item.remoteMethod === "function") {
        this.$set(
          this.remoteOptions,
          item.key,
          (await item.remoteMethod(keyword)) || [],
        );
        return;
      }
      if (typeof this.remoteQuery === "function") {
        this.$set(
          this.remoteOptions,
          item.key,
          (await this.remoteQuery(item.key, keyword)) || [],
        );
      }
    },
  },
};
</script>
<style lang="scss" src="./style.scss"></style>
