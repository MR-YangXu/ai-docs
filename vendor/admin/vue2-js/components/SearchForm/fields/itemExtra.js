import { FIELD, normalizeFieldType } from "../fieldTypes";

const CHECK_TYPES = [
  FIELD.cascader,
  FIELD.user,
  FIELD.cascaderNew,
  FIELD.cascaderMulti,
  FIELD.department,
  FIELD.departmentAll,
  FIELD.customTree,
];

/** 项目 searchItem 把额外配置放在 selectOptionProps / treeProps[key]。 */

export function itemExtra(item) {
  const extra = item && item.selectOptionProps;
  return extra && typeof extra === "object" ? extra : {};
}

/** 提交前按字段 format 改数据。字符串 format 是日期展示格式，不在这里处理。回显仍用原值。 */
export function formatItemValue(item, value) {
  if (!item || typeof item.format !== "function") return value;
  return item.format(value, item);
}

/** 字段是否带了可使用的默认值。函数不是默认值。 */
export function hasDefaultValue(item) {
  if (!item || !Object.prototype.hasOwnProperty.call(item, "defaultValue")) return false;
  return typeof item.defaultValue !== "function" && item.defaultValue !== undefined;
}

/** 拷一份再写入控件，避免改到页面上的原数组或原对象。 */
export function copyDefaultValue(value) {
  if (Array.isArray(value)) return value.slice();
  if (Object.prototype.toString.call(value) === "[object Object]") return { ...value };
  return value;
}

/** 默认值对应的提交数据。树和级联的 format 只处理勾选节点，这里保持原值。 */
export function defaultSubmitted(item, display) {
  const type = normalizeFieldType(item && item.type);
  if (CHECK_TYPES.indexOf(type) !== -1) return display;
  return formatItemValue(item, display);
}

export function optionKeys(item) {
  const extra = itemExtra(item);
  return {
    labelKey: (item && item.labelKey) || extra.label || "label",
    valueKey: (item && item.valueKey) || extra.value || "value",
  };
}
