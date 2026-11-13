<template>
  <div v-if="fieldPropsValid">
    <el-input
      class="ai-code-search-items__batch"
      :value="text"
      placeholder="双击可批量搜索"
      :clearable="item.clearable !== false"
      :style="controlStyle"
      @input="onType"
      @change="onCommit"
    />
    <el-dialog
      title="批量查询"
      :visible.sync="visible"
      append-to-body
      width="50%"
      top="10vh"
    >
      <el-radio-group
        v-if="radioList.length"
        v-model="radioValue"
        class="ai-code-search-items__batch-radio"
      >
        <el-radio v-for="option in radioList" :key="option.value" :label="option.value">
          {{ option.label }}
        </el-radio>
      </el-radio-group>
      <el-input
        v-model="draft"
        type="textarea"
        :rows="16"
        :placeholder="dialogPlaceholder"
      />
      <span slot="footer">
        <el-button size="small" @click="visible = false">取消</el-button>
        <el-button size="small" type="primary" @click="submit">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { itemExtra } from "./itemExtra";
import { searchPopupMixin } from "../popupHub";
import {
  checkBatchField,
  createFieldProps,
  explainTextValue,
  withFieldGuard,
} from "./fieldProps";

/** type 14。双击打开换行弹窗。确认后展示值是逗号串，带 radioOptions 时查询值按项目交给 batch 事件。 */
export default withFieldGuard(
  {
    name: "SearchBatchField",
    mixins: [searchPopupMixin],
    inheritAttrs: false,
    props: createFieldProps(explainTextValue),
    data() {
      return {
        visible: false,
        draft: "",
        radioValue: "",
        typed: "",
      };
    },
    computed: {
      extra() {
        return itemExtra(this.item);
      },
      text() {
        if (typeof this.value === "string" || typeof this.value === "number") {
          return String(this.value);
        }
        return this.typed;
      },
      radioOptions() {
        const radio = this.extra.radioOptions;
        return radio && typeof radio === "object" ? radio : null;
      },
      radioList() {
        const options = this.radioOptions && this.radioOptions.options;
        return Array.isArray(options) ? options : [];
      },
      maxLen() {
        return this.extra.maxLen || 100;
      },
      dialogPlaceholder() {
        return (
          this.extra.dbPlaceholder ||
          `换行填写，单次最多支持${this.maxLen}个`
        );
      },
      controlStyle() {
        const width = this.item.width || this.extra.width;
        if (width == null || width === "") return null;
        return { width: typeof width === "number" ? `${width}px` : width };
      },
    },
    watch: {
      visible(open) {
        if (open) this.claimSearchPopup();
      },
    },
    mounted() {
      this.$el.addEventListener("dblclick", this.open);
    },
    beforeDestroy() {
      this.$el.removeEventListener("dblclick", this.open);
    },
    methods: {
      onType(value) {
        this.typed = value;
        this.$emit("typing", value);
      },
      onCommit(value) {
        this.typed = value;
        this.$emit("input", value);
      },
      linesOf(value) {
        const items = [];
        const push = (token) => {
          const text = String(token == null ? "" : token).trim();
          if (!text) return;
          if (text.indexOf("\n") !== -1) {
            text.split("\n").forEach(push);
            return;
          }
          if (text.indexOf(",") !== -1) {
            text.split(",").forEach(push);
            return;
          }
          items.push(text);
        };
        if (Array.isArray(value)) value.forEach(push);
        else push(value);
        return items;
      },
      closeSearchPopup() {
        this.visible = false;
      },
      open() {
        const radio = this.radioOptions;
        this.radioValue = radio && radio.checkValue != null ? radio.checkValue : "";
        const lines = this.linesOf(this.text);
        this.draft = lines.length ? lines.join("\n") : "";
        this.visible = true;
      },
      submit() {
        const list = this.linesOf(this.draft);
        if (list.length > this.maxLen) {
          if (this.$message) this.$message.warning("已超出最大查询限制");
          return;
        }
        this.visible = false;
        if (!list.length) return;
        this.typed = list.join(",");
        this.$emit("batch", {
          list,
          radioKey: this.radioList.length ? this.radioValue : "",
        });
      },
    },
  },
  checkBatchField,
);
</script>
