import { FIELD, normalizeFieldType } from "../fieldTypes";

/** 树节点字段、回显编号和勾选结果。组件不请求接口。 */

/** type 8 可用 treeType / tree_type 切到部门或自定义树。 */
export function resolveTreeKind(item) {
  const type = normalizeFieldType(item && item.type);
  if (type === FIELD.department) return "department";
  if (type === FIELD.departmentAll) return "departmentAll";
  if (type === FIELD.customTree) return "custom";
  const raw =
    (item && item.treeType) ||
    (item && item.tree_type) ||
    (item && item.selectOptionProps && item.selectOptionProps.tree_type) ||
    (item && item.options && item.options.tree_type);
  if (raw === "department") return "department";
  if (raw === "custom") return "custom";
  return "user";
}

export function readTreeData(item, options) {
  if (item && Array.isArray(item.data) && item.data.length) return item.data;
  const extra = item && item.selectOptionProps;
  if (extra && Array.isArray(extra.treeData) && extra.treeData.length) {
    return extra.treeData;
  }
  if (Array.isArray(options) && options.length) return options;
  if (item && Array.isArray(item.data)) return item.data;
  return [];
}

export function readLegacyOptions(item) {
  const origin = item && item.originOptions;
  const nested = item && item.selectOptionProps && item.selectOptionProps.options;
  return {
    ...(origin && typeof origin === "object" ? origin : {}),
    ...(nested && typeof nested === "object" ? nested : {}),
  };
}

/** nodeKey 给 el-tree，valueKey 是提交编号。 */
export function resolveTreeKeys(item, defaults) {
  const source = item || {};
  const legacy = {
    ...(source.defaultProps || {}),
    ...(source.treeProps || {}),
    ...((source.selectOptionProps && source.selectOptionProps.defaultProps) || {}),
  };
  const origin = readLegacyOptions(source);
  const nodeKey =
    source.nodeKey || legacy.id || origin.key || defaults.nodeKey;
  return {
    nodeKey,
    valueKey: source.valueKey || defaults.valueKey || nodeKey,
    labelKey:
      source.labelKey || legacy.label || origin.label || defaults.labelKey,
    childrenKey:
      source.childrenKey ||
      legacy.children ||
      legacy.childern ||
      defaults.childrenKey ||
      "children",
    linkKey: defaults.linkKey || source.valueKey || defaults.valueKey || nodeKey,
  };
}

export function treePlaceholder(item) {
  return (item && (item.placeholder || item.name)) || "请选择";
}

export function readMultiple(item, defaultValue) {
  if (!item) return defaultValue;
  if (typeof item.multiple === "boolean") return item.multiple;
  if (typeof item.isMultiple === "boolean") return item.isMultiple;
  const extra = item.selectOptionProps || {};
  if (typeof extra.multiple === "boolean") return extra.multiple;
  if (typeof extra.isMultiple === "boolean") return extra.isMultiple;
  return defaultValue;
}

export function walk(nodes, childrenKey, visit) {
  if (!Array.isArray(nodes)) return;
  nodes.forEach((node) => {
    if (!node || typeof node !== "object") return;
    visit(node);
    const children = node[childrenKey];
    if (Array.isArray(children)) walk(children, childrenKey, visit);
  });
}

export function hasKey(nodes, key, childrenKey) {
  let found = false;
  walk(nodes, childrenKey, (node) => {
    if (node[key] != null && node[key] !== "") found = true;
  });
  return found;
}

export function uniqueIds(ids) {
  const seen = new Set();
  const result = [];
  ids.forEach((id) => {
    if (id == null || id === "") return;
    const mark = String(id);
    if (seen.has(mark)) return;
    seen.add(mark);
    result.push(id);
  });
  return result;
}

/** 编号数组，或旧的节点对象数组。 */
export function idsFromValue(value, valueKey) {
  if (value == null || value === "" || !Array.isArray(value)) return [];
  return uniqueIds(
    value.map((item) => {
      if (item != null && typeof item === "object") {
        if (item[valueKey] != null && item[valueKey] !== "") return item[valueKey];
        if (item.user_id != null && item.user_id !== "") return item.user_id;
        if (item.tree_id != null && item.tree_id !== "") return item.tree_id;
        if (item.union_id != null && item.union_id !== "") return item.union_id;
        if (item.id != null && item.id !== "") return item.id;
        return undefined;
      }
      return item;
    }),
  );
}

export function dedupe(nodes, key) {
  const seen = new Set();
  const result = [];
  (nodes || []).forEach((node) => {
    if (!node || typeof node !== "object") return;
    const id = node[key];
    if (id == null || id === "") return;
    const mark = String(id);
    if (seen.has(mark)) return;
    seen.add(mark);
    result.push(node);
  });
  return result;
}

export function nodeText(node, labelKey) {
  if (!node) return "";
  const text = node[labelKey];
  if (text != null && text !== "") return text;
  return node.name || node.title || node.label || node.depart_name || "";
}

export function isMember(node) {
  return (
    !!node &&
    (node.is_member === true || node.is_member === 1 || node.is_member === "1")
  );
}

/** gc / pod / dev 用 is_member，deep-convo 人员节点 type 为 user。 */
export function isUserNode(node) {
  return isMember(node) || (!!node && node.type === "user");
}

/**
 * deep-convo 的复合编号 "12-3" 取前半段并转成数字。
 * 纯数字字符串也转成数字。其余编号保持原样，避免改掉 gc 的业务编号。
 */
export function submitId(id) {
  if (typeof id === "number") return id;
  if (typeof id !== "string") return id;
  if (/^\d+$/.test(id)) return Number(id);
  const compound = /^(\d+)-\d+/.exec(id);
  if (compound) return Number(compound[1]);
  return id;
}

export function isLeaf(node, childrenKey) {
  const children = node && node[childrenKey];
  return !Array.isArray(children) || children.length === 0;
}

/**
 * 被点中的节点及其子树里，需要一起取消的 linkKey。
 * 部门节点不是人员，由 accept 排除，避免把 user_id 0 当成一个人。
 */
export function linkKeysUnder(node, keys, accept) {
  const linkKey = keys.linkKey || keys.valueKey;
  const result = [];
  const visit = (item) => {
    if (!item || typeof item !== "object") return;
    if (accept && !accept(item)) return;
    const link = item[linkKey];
    if (link == null || link === "") return;
    result.push(String(link));
  };
  visit(node);
  const children = node && node[keys.childrenKey];
  if (Array.isArray(children)) walk(children, keys.childrenKey, visit);
  return result;
}

/** 同一 linkKey 的节点一起勾选，例如人员在多个部门下的 union_id。 */
export function collectLinked(data, nodes, keys, accept) {
  const linkKey = keys.linkKey || keys.valueKey;
  const ids = new Set(
    (nodes || [])
      .filter((node) => node && node[linkKey] != null && node[linkKey] !== "")
      .map((node) => String(node[linkKey])),
  );
  const linked = [];
  walk(data, keys.childrenKey, (node) => {
    if (accept && !accept(node)) return;
    if (node[linkKey] != null && ids.has(String(node[linkKey]))) linked.push(node);
  });
  return linked;
}

function sameId(left, right) {
  if (left == null || left === "" || right == null || right === "") return false;
  return String(left) === String(right) || String(submitId(left)) === String(submitId(right));
}

export function checkedKeysForValue(data, value, keys, accept) {
  const ids = idsFromValue(value, keys.valueKey);
  const result = [];
  walk(data, keys.childrenKey, (node) => {
    if (accept && !accept(node)) return;
    const submit = node[keys.valueKey];
    const nodeId = node[keys.nodeKey];
    // 只按业务值匹配。人员树的节点 key 是 union_id，选中值是 user_id，
    // 两者都是数字且会撞号（甘时雨 user_id=233，罗星华 union_id=233）。
    const hit = ids.some((id) => sameId(id, submit));
    if (hit && nodeId != null && nodeId !== "") result.push(nodeId);
  });
  return result;
}

export function summaryText(data, value, keys, placeholder) {
  const ids = idsFromValue(value, keys.valueKey);
  if (!ids.length) return placeholder;
  const first = ids[0];
  let label = "";
  walk(data, keys.childrenKey, (node) => {
    if (label) return;
    const submit = node[keys.valueKey];
    if (sameId(submit, first)) {
      label = nodeText(node, keys.labelKey);
    }
  });
  if (!label && Array.isArray(value)) {
    const raw = value.find((item) => {
      if (!item || typeof item !== "object") return false;
      const id = item[keys.valueKey] != null ? item[keys.valueKey] : item.user_id || item.id;
      return String(id) === String(first);
    });
    if (raw) label = nodeText(raw, keys.labelKey);
  }
  const text = label || String(first);
  if (ids.length === 1) return text;
  return `${text} +${ids.length - 1}`;
}

export function matchNode(node, keyword, fields) {
  const text = keyword == null ? "" : String(keyword).trim().toLowerCase();
  if (!text) return true;
  return (fields || []).some((field) => {
    const value = node[field];
    return value != null && String(value).toLowerCase().indexOf(text) !== -1;
  });
}
