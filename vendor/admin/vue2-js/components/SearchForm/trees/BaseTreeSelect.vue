<template>
  <el-popover
    v-model="open"
    placement="bottom-start"
    width="360"
    trigger="click"
    popper-class="ai-code-search-items__tree-panel"
  >
    <div class="ai-code-search-items__tree-body">
      <div class="ai-code-search-items__tree-search">
        <el-input
          v-model="keyword"
          size="small"
          clearable
          placeholder="请输入"
          suffix-icon="el-icon-search"
          @input="onFilter"
        />
      </div>
      <el-tree
        v-if="data.length"
        ref="tree"
        :data="data"
        show-checkbox
        :node-key="nodeKey"
        :props="treeProps"
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
        @check="onCheck"
      />
      <div v-else class="ai-code-search-items__tree-empty">暂无数据</div>
    </div>
    <div
      slot="reference"
      class="ai-code-search-items__tree-trigger"
      :class="{ 'is-empty': !selectedNodes.length, 'has-value': showClear }"
    >
      <span v-if="!firstNode" class="ai-code-search-items__tree-text">{{
        placeholder
      }}</span>
      <template v-else>
        <el-tag
          size="mini"
          type="info"
          closable
          disable-transitions
          @close="removeTag(firstNode)"
          @click.native="keepPanelOpen"
        >
          <span class="ai-code-search-items__tree-tag-text">{{
            firstLabel
          }}</span>
        </el-tag>
        <el-tag
          v-if="extraCount > 0"
          size="mini"
          type="info"
          disable-transitions
        >
          +{{ extraCount }}
        </el-tag>
      </template>
      <i
        v-if="showClear"
        class="el-icon-circle-close ai-code-search-items__tree-clear"
        @click.stop="clearValue"
      />
    </div>
  </el-popover>
</template>
<script>
import {
  checkedKeysForValue,
  collectLinked,
  dedupe,
  linkKeysUnder,
  idsFromValue,
  isLeaf,
  matchNode,
  nodeText,
  submitId,
  walk,
} from "./treeModel";
import { searchPopupMixin } from "../popupHub";

export default {
  name: "SearchBaseTreeSelect",
  mixins: [searchPopupMixin],
  inheritAttrs: false,
  props: {
    data: { type: Array, default: () => [] },
    value: { default: undefined },
    nodeKey: { type: String, required: true },
    valueKey: { type: String, required: true },
    labelKey: { type: String, required: true },
    childrenKey: { type: String, default: "children" },
    linkKey: { type: String, default: "" },
    linkSame: { type: Boolean, default: false },
    leafOnly: { type: Boolean, default: false },
    multiple: { type: Boolean, default: true },
    placeholder: { type: String, default: "请选择" },
    accept: Function,
    mapNode: Function,
    filterFields: { type: Array, default: () => [] },
  },
  data() {
    return { open: false, keyword: "", syncing: false, boxChecked: false };
  },
  computed: {
    keys() {
      return {
        nodeKey: this.nodeKey,
        valueKey: this.valueKey,
        labelKey: this.labelKey,
        childrenKey: this.childrenKey,
        linkKey: this.linkKey || this.valueKey,
      };
    },
    treeProps() {
      return { label: this.labelKey, children: this.childrenKey };
    },
    searchFields() {
      const fields = [this.labelKey].concat(this.filterFields);
      return fields.filter(
        (field, index) => field && fields.indexOf(field) === index,
      );
    },
    submittedIds() {
      return idsFromValue(this.value, this.valueKey);
    },
    selectedNodes() {
      const ids = this.submittedIds;
      if (!ids.length) return [];
      const found = [];
      walk(this.data, this.childrenKey, (node) => {
        if (!this.keepNode(node)) return;
        if (ids.some((id) => this.sameSelection(id, node))) found.push(node);
      });
      return dedupe(found, this.valueKey);
    },
    firstNode() {
      return this.selectedNodes[0] || null;
    },
    firstLabel() {
      return (
        nodeText(this.firstNode, this.labelKey) ||
        String(this.firstNode[this.valueKey])
      );
    },
    extraCount() {
      return Math.max(0, this.selectedNodes.length - 1);
    },
    showClear() {
      return this.boxChecked || this.selectedNodes.length > 0;
    },
  },
  watch: {
    value: {
      deep: true,
      handler() {
        this.syncChecked();
      },
    },
    data() {
      this.syncChecked();
    },
    open(val) {
      if (val) this.claimSearchPopup();
    },
  },
  mounted() {
    this.syncChecked();
  },
  methods: {
    closeSearchPopup() {
      this.open = false;
    },
    filterNode(keyword, data) {
      return matchNode(data, keyword, this.searchFields);
    },
    onFilter(keyword) {
      if (this.$refs.tree) this.$refs.tree.filter(keyword);
    },
    syncChecked() {
      this.$nextTick(() => {
        const tree = this.$refs.tree;
        if (!tree) return;
        this.applyChecked(
          tree,
          checkedKeysForValue(this.data, this.value, this.keys, (node) =>
            this.keepNode(node),
          ),
        );
      });
    },
    applyChecked(tree, keys) {
      if (!tree) return;
      this.checkStamp = (this.checkStamp || 0) + 1;
      const stamp = this.checkStamp;
      this.writeChecked(tree, keys);
      this.$nextTick(() => {
        if (this.checkStamp !== stamp) return;
        const current = this.$refs.tree;
        if (current) this.writeChecked(current, keys);
      });
    },
    writeChecked(tree, keys) {
      this.syncing = true;
      try {
        // 空部门可以勾着，但提交值里没有人。同步人员时要把这些勾选留住，否则父节点会停在半选。
        const merged = this.mergeKeys(keys, this.checkedEmptyKeys(tree));
        tree.setCheckedKeys(merged);
        this.boxChecked = merged.length > 0;
      } finally {
        this.syncing = false;
      }
    },
    mergeKeys(primary, extra) {
      const seen = new Set();
      const out = [];
      const add = (key) => {
        if (key == null || key === "") return;
        const mark = String(key);
        if (seen.has(mark)) return;
        seen.add(mark);
        out.push(key);
      };
      (primary || []).forEach(add);
      (extra || []).forEach(add);
      return out;
    },
    checkedEmptyKeys(tree) {
      if (!tree || !tree.store || !tree.store.root) return [];
      const hasKept = new WeakMap();
      const mark = (node) => {
        const children = node.childNodes || [];
        children.forEach(mark);
        let kept = node.level > 0 && this.keepNode(node.data);
        if (!kept) kept = children.some((child) => hasKept.get(child));
        hasKept.set(node, kept);
      };
      mark(tree.store.root);
      const keys = [];
      const walk = (node) => {
        const children = node.childNodes || [];
        if (node.level > 0 && !hasKept.get(node)) {
          if (node.checked && !node.indeterminate) {
            const key = node.data && node.data[this.nodeKey];
            if (key != null && key !== "") keys.push(key);
            return;
          }
        }
        children.forEach(walk);
      };
      walk(tree.store.root);
      return keys;
    },
    sameSelection(id, node) {
      const submit = node[this.valueKey];
      return submit != null && submit !== "" && this.sameId(submit, id);
    },
    sameId(left, right) {
      return (
        String(left) === String(right) ||
        String(submitId(left)) === String(submitId(right))
      );
    },
    clearValue() {
      this.checkStamp = (this.checkStamp || 0) + 1;
      const tree = this.$refs.tree;
      this.syncing = true;
      try {
        if (tree) tree.setCheckedKeys([]);
      } finally {
        this.syncing = false;
      }
      this.boxChecked = false;
      this.keyword = "";
      if (tree) tree.filter("");
      this.emitNodes([]);
    },
    keepPanelOpen(event) {
      const target = event && event.target;
      if (
        !target ||
        !target.classList ||
        !target.classList.contains("el-tag__close")
      )
        return;
      event.stopPropagation();
    },
    removeTag(node) {
      if (!node) return;
      const dropId = node[this.valueKey];
      const dropLink =
        this.linkSame &&
        node[this.keys.linkKey] != null &&
        node[this.keys.linkKey] !== ""
          ? String(node[this.keys.linkKey])
          : "";
      const remaining = [];
      walk(this.data, this.childrenKey, (item) => {
        if (!this.keepNode(item)) return;
        if (!this.submittedIds.some((id) => this.sameSelection(id, item)))
          return;
        if (this.sameId(item[this.valueKey], dropId)) return;
        const link = item[this.keys.linkKey];
        if (dropLink && link != null && String(link) === dropLink) return;
        remaining.push(item);
      });
      if (this.$refs.tree) {
        this.applyChecked(
          this.$refs.tree,
          remaining.map((item) => item[this.nodeKey]),
        );
      }
      this.emitNodes(remaining);
    },
    emitNodes(nodes) {
      const mapped = this.mapNode
        ? nodes.map((node) => this.mapNode(node) || node)
        : nodes;
      const submitted = dedupe(mapped, this.valueKey);
      const ids = submitted.map((node) => node[this.valueKey]);
      this.$emit("input", ids);
      this.$emit("check", { ids, nodes: submitted });
    },
    keepNode(node) {
      if (this.leafOnly && !isLeaf(node, this.childrenKey)) return false;
      if (this.accept && !this.accept(node)) return false;
      return true;
    },
    onCheck(clicked, status) {
      if (this.syncing) return;
      const tree = this.$refs.tree;
      if (!tree) return;
      if (!this.multiple) {
        const ok = clicked && this.keepNode(clicked);
        const nodes = ok ? [clicked] : [];
        this.syncing = true;
        try {
          tree.setCheckedKeys(ok ? [clicked[this.nodeKey]] : []);
        } finally {
          this.syncing = false;
        }
        this.emitNodes(nodes);
        this.open = false;
        return;
      }
      let nodes = (tree.getCheckedNodes(this.leafOnly) || []).filter((node) =>
        this.keepNode(node),
      );
      // 取消父公司时，子节点已经去掉，但同一个人还在别的公司里勾着。
      // 若直接 collectLinked，这些 user_id 会把刚取消的子树再勾回来。
      if (clicked && !this.isKeyChecked(clicked, status)) {
        const dropped = new Set(
          linkKeysUnder(clicked, this.keys, (node) => this.keepNode(node)),
        );
        if (dropped.size && this.linkSame) {
          const linkKey = this.keys.linkKey;
          nodes = nodes.filter((node) => {
            const link = node[linkKey];
            return link == null || link === "" || !dropped.has(String(link));
          });
        }
      }
      if (this.linkSame) {
        nodes = collectLinked(this.data, nodes, this.keys, (node) =>
          this.keepNode(node),
        );
      }
      this.applyChecked(
        tree,
        nodes.map((node) => node[this.nodeKey]),
      );
      this.emitNodes(nodes);
    },
    isKeyChecked(node, status) {
      const key = node && node[this.nodeKey];
      if (key == null || key === "") return false;
      return (status.checkedKeys || []).some(
        (item) => String(item) === String(key),
      );
    },
  },
};
</script>
<style lang="scss">
.el-popover.ai-code-search-items__tree-panel {
  padding: 0;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.ai-code-search-items__tree-body {
  width: 100%;
  background: #fff;
}

.ai-code-search-items__tree-search {
  padding: 8px 8px 4px;

  .el-input__inner {
    height: 32px;
    line-height: 32px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    color: #606266;
    font-size: 12px;
  }

  .el-input__icon {
    line-height: 32px;
    color: #c0c4cc;
  }
}

.ai-code-search-items__tree-empty {
  padding: 12px 0;
  color: #909399;
  text-align: center;
}
</style>
