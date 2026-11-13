<template>
  <div v-if="fieldPropsValid" class="ai-code-search-items__minmax">
    <span v-if="item.name" class="ai-code-search-items__minmax-label">{{ item.name }}</span>
    <el-input
      :value="draft[0]"
      placeholder="最小"
      @input="onInput(0, $event)"
      @blur="commit"
      @keyup.enter.native="commit"
    />
    <span>{{ separator }}</span>
    <el-input
      :value="draft[1]"
      placeholder="最大"
      @input="onInput(1, $event)"
      @blur="commit"
      @keyup.enter.native="commit"
    />
    <button
      v-show="draft[0] !== '' || draft[1] !== ''"
      type="button"
      class="ai-code-search-items__minmax-clear"
      @click="clear"
    >
      ×
    </button>
  </div>
</template>
<script>
import { itemExtra } from "./itemExtra";
import {
  checkMinMaxField,
  createFieldProps,
  explainMinMaxValue,
  withFieldGuard,
} from "./fieldProps";

/** type 17。提交 [min, max]，和项目 minToMaxInput 一致。只填最大值时最小按 0。 */
export default withFieldGuard(
  {
    name: "SearchMinMaxField",
    inheritAttrs: false,
    props: createFieldProps(explainMinMaxValue),
    data() {
      return { draft: ["", ""] };
    },
    computed: {
      extra() {
        return itemExtra(this.item);
      },
      separator() {
        return this.extra.separator || this.item.separator || "~";
      },
      regMatchType() {
        return String(this.extra.regMatchType || this.item.regMatchType || "1");
      },
    },
    watch: {
      value: {
        immediate: true,
        handler(next) {
          const pair = this.pairFrom(next);
          if (pair[0] === this.draft[0] && pair[1] === this.draft[1]) return;
          this.draft = pair;
        },
      },
    },
    methods: {
      pairFrom(value) {
        if (Array.isArray(value)) {
          return [
            value[0] == null ? "" : String(value[0]),
            value[1] == null ? "" : String(value[1]),
          ];
        }
        if (value && typeof value === "object") {
          return [
            value.min == null ? "" : String(value.min),
            value.max == null ? "" : String(value.max),
          ];
        }
        return ["", ""];
      },
      sanitize(raw) {
        const text = String(raw == null ? "" : raw);
        if (this.regMatchType === "2") {
          const cleaned = text.replace(/[^\d.]/g, "");
          const parts = cleaned.split(".");
          if (parts.length === 1) return parts[0];
          return `${parts[0]}.${parts.slice(1).join("").slice(0, 2)}`;
        }
        return text.replace(/[^\d]/g, "");
      },
      onInput(index, raw) {
        const next = this.sanitize(raw);
        const pair = [this.draft[0], this.draft[1]];
        pair[index] = next;
        this.draft = pair;
        if (String(raw == null ? "" : raw) !== next && this.$message) {
          this.$message.error("只能输入数字");
        }
      },
      commit() {
        const minText = this.draft[0];
        const maxText = this.draft[1];
        if (minText === "" && maxText === "") return;
        if (minText !== "" && maxText === "") {
          if (this.$message) this.$message.error("请输入最大区间值");
          return;
        }
        const min = minText === "" ? 0 : Number(minText);
        const max = Number(maxText);
        if (Number.isNaN(min) || Number.isNaN(max)) return;
        if (min > max) {
          if (this.$message) this.$message.error("最小区间值不能大于最大区间值");
          return;
        }
        this.draft = [String(min), String(max)];
        this.$emit("input", [min, max]);
      },
      clear() {
        this.draft = ["", ""];
        this.$emit("input", ["", ""]);
      },
    },
  },
  checkMinMaxField,
);
</script>
