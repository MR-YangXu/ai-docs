import { FIELD, isBuiltinType, normalizeFieldType } from "../fieldTypes";
import { optionKeys } from "./itemExtra";

const EMPTY = (value) => value == null || value === "";

export function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

/** 是否是标量值。 */
function isScalar(value) {
  return typeof value === "string" || typeof value === "number";
}

/** 生产环境异步抛出字段错误。 */
export function raiseFieldError(error) {
  const failure = error instanceof Error ? error : new TypeError(String(error));
  if (process.env.NODE_ENV !== "production") throw failure;
  console.error(failure);
  setTimeout(() => {
    throw failure;
  });
}

/** 解释字段配置。 */
export function explainItem(item) {
  if (!isPlainObject(item)) return "item 必须是对象";
  if (typeof item.key !== "string" || item.key.trim() === "")
    return "item.key 必须是非空字符串";
  if (!isFieldType(item.type))
    return "item.type 必须是整数、数字字符串或类型名";
  if (item.name != null && typeof item.name !== "string")
    return "item.name 必须是字符串";
  if (item.placeholder != null && typeof item.placeholder !== "string")
    return "item.placeholder 必须是字符串";
  if (item.valueFormat != null && typeof item.valueFormat !== "string")
    return "item.valueFormat 必须是字符串";
  if (
    item.format != null &&
    typeof item.format !== "function" &&
    typeof item.format !== "string"
  )
    return "item.format 必须是函数或字符串";
  if (typeof item.defaultValue === "function")
    return "item.defaultValue 必须是值";
  if (item.labelKey != null && typeof item.labelKey !== "string")
    return "item.labelKey 必须是字符串";
  if (item.valueKey != null && typeof item.valueKey !== "string")
    return "item.valueKey 必须是字符串";
  if (item.nodeKey != null && typeof item.nodeKey !== "string")
    return "item.nodeKey 必须是字符串";
  if (item.childrenKey != null && typeof item.childrenKey !== "string")
    return "item.childrenKey 必须是字符串";
  if (
    item.treeType != null &&
    item.treeType !== "user" &&
    item.treeType !== "department" &&
    item.treeType !== "custom"
  )
    return "item.treeType 必须是 user、department 或 custom";
  if (item.treeProps != null && !isPlainObject(item.treeProps))
    return "item.treeProps 必须是对象";
  if (item.multiple != null && typeof item.multiple !== "boolean")
    return "item.multiple 必须是布尔值";
  if (item.leafOnly != null && typeof item.leafOnly !== "boolean")
    return "item.leafOnly 必须是布尔值";
  if (item.data != null && !Array.isArray(item.data))
    return "item.data 必须是数组";
  if (item.cascaderProps != null && !isPlainObject(item.cascaderProps))
    return "item.cascaderProps 必须是对象";
  if (item.remote != null && typeof item.remote !== "boolean")
    return "item.remote 必须是布尔值";
  if (item.remoteMethod != null && typeof item.remoteMethod !== "function")
    return "item.remoteMethod 必须是函数";
  if (item.allowCreate != null && typeof item.allowCreate !== "boolean")
    return "item.allowCreate 必须是布尔值";
  if (item.filterable != null && typeof item.filterable !== "boolean")
    return "item.filterable 必须是布尔值";
  if (item.clearable != null && typeof item.clearable !== "boolean")
    return "item.clearable 必须是布尔值";
  if (item.id != null && !isScalar(item.id))
    return "item.id 必须是字符串或数字";
  if (item.page_search_items_id != null && !isScalar(item.page_search_items_id))
    return "item.page_search_items_id 必须是字符串或数字";
  if (item.nameTypeValue != null && !isScalar(item.nameTypeValue))
    return "item.nameTypeValue 必须是字符串或数字";
  if (item.nameTypeOptions != null) {
    const optionsMessage = explainChoiceOptions(
      item.nameTypeOptions,
      null,
      "item.nameTypeOptions",
    );
    if (optionsMessage) return optionsMessage;
  }
  return "";
}

/** 是否是字段类型。 */
function isFieldType(type) {
  if (typeof type === "number") return Number.isInteger(type);
  return typeof type === "string" && type.trim() !== "";
}

/** 解释文本值。 */
export function explainTextValue(value) {
  if (EMPTY(value) || isScalar(value)) return "";
  return "value 必须是字符串、数字或空值";
}

/** 解释列表值。 */
export function explainListValue(value) {
  if (EMPTY(value)) return "";
  if (!Array.isArray(value) || value.some((item) => !isScalar(item)))
    return "value 必须是字符串或数字组成的数组";
  return "";
}

/** 级联值可以是编号，也可以是路径。 */
export function explainCascaderValue(value) {
  if (EMPTY(value)) return "";
  if (!Array.isArray(value)) return "value 必须是数组";
  const invalid = value.some((item) => {
    if (isScalar(item)) return false;
    if (!Array.isArray(item)) return true;
    return item.some((part) => part != null && part !== "" && !isScalar(part));
  });
  if (invalid) return "value 必须是编号或路径数组";
  return "";
}

/** 解释范围值。 */
export function explainRangeValue(value) {
  if (EMPTY(value)) return "";
  if (!Array.isArray(value) || (value.length !== 0 && value.length !== 2))
    return "value 必须是起止两项";
  if (value.some((item) => item != null && item !== "" && !isScalar(item)))
    return "value 的起止必须是字符串或数字";
  return "";
}

/** 解释单选值。 */
export function explainRadioValue(value) {
  if (EMPTY(value) || isScalar(value) || typeof value === "boolean") return "";
  return "value 必须是字符串、数字、布尔值或空值";
}

/** 解释最小最大值。 */
export function explainMinMaxValue(value) {
  if (EMPTY(value)) return "";
  if (Array.isArray(value)) {
    if (value.length > 2) return "value 必须是起止两项";
    if (
      value.some(
        (item) =>
          item != null &&
          item !== "" &&
          typeof item !== "number" &&
          typeof item !== "string",
      )
    )
      return "value 的起止必须是数字";
    return "";
  }
  if (!isPlainObject(value)) return "value 必须是 [min, max] 或 { min, max }";
  const extra = Object.keys(value).filter(
    (key) => key !== "min" && key !== "max",
  );
  if (extra.length) return "value 只能包含 min 和 max";
  if (!EMPTY(value.min) && typeof value.min !== "number")
    return "value.min 必须是数字";
  if (!EMPTY(value.max) && typeof value.max !== "number")
    return "value.max 必须是数字";
  return "";
}

/** 解释选择值。 */
export function explainSelectValue(value) {
  if (EMPTY(value) || isScalar(value)) return "";
  return explainListValue(value);
}

/** 解释选项。 */
export function explainOptions(options) {
  if (!Array.isArray(options)) return "options 必须是数组";
  if (options.some((option) => !isPlainObject(option)))
    return "options 的每一项必须是对象";
  return "";
}

/** 解释选择选项。 */
export function explainChoiceOptions(options, item, label = "options") {
  if (!Array.isArray(options)) return `${label} 必须是数组`;
  if (options.some((option) => !isPlainObject(option)))
    return `${label} 的每一项必须是对象`;
  const keys = optionKeys(item);
  const labelKey = keys.labelKey;
  const valueKey = keys.valueKey;
  const invalid = options.some(
    (option) => !isScalar(option[labelKey]) || !isScalar(option[valueKey]),
  );
  if (invalid) return `${label} 的 ${labelKey}、${valueKey} 必须是字符串或数字`;
  return "";
}

/** 解释树形选项。 */
export function explainTree(nodes) {
  if (!Array.isArray(nodes)) return "item.data 必须是数组";
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (!isPlainObject(node)) return "级联选项必须是对象";
    if (node.children != null) {
      const childError = explainTree(node.children);
      if (childError) return childError;
    }
  }
  return "";
}

/** 解释松散值。 */
function explainLooseValue(value) {
  if (EMPTY(value) || isScalar(value) || typeof value === "boolean") return "";
  if (Array.isArray(value)) {
    const invalid = value.some((item) => explainLooseValue(item));
    return invalid ? "value 含有无法作为筛选值的类型" : "";
  }
  if (isPlainObject(value)) {
    const invalid = Object.keys(value).some((key) =>
      explainLooseValue(value[key]),
    );
    return invalid ? "value 含有无法作为筛选值的类型" : "";
  }
  return "value 必须是字符串、数字、布尔值、数组、对象或空值";
}

/** 检查文本字段。 */
export function checkTextField(vm) {
  return (
    explainItem(vm.item) ||
    explainTextValue(vm.value) ||
    explainOptions(vm.options)
  );
}

/** 检查选择字段。 */
export function checkSelectField(vm) {
  const itemMessage = explainItem(vm.item);
  if (itemMessage) return itemMessage;
  const optionsMessage = explainChoiceOptions(vm.options, vm.item);
  if (optionsMessage) return optionsMessage;
  const multiple = normalizeFieldType(vm.item.type) === FIELD.multiSelect;
  if (multiple) {
    if (EMPTY(vm.value)) return "";
    if (!Array.isArray(vm.value) || vm.value.some((item) => !isScalar(item)))
      return "多选 value 必须是字符串或数字数组";
    return "";
  }
  if (Array.isArray(vm.value)) return "单选 value 必须是字符串、数字或空值";
  return explainTextValue(vm.value);
}

/** 检查范围字段。 */
export function checkRangeField(vm) {
  return (
    explainItem(vm.item) ||
    explainRangeValue(vm.value) ||
    explainOptions(vm.options)
  );
}

/** 检查时间字段。 */
export function checkTimeField(vm) {
  return checkTextField(vm);
}

/** 检查级联字段。 */
export function checkCascaderField(vm) {
  return (
    explainItem(vm.item) ||
    explainTree(vm.item.data || []) ||
    explainCascaderValue(vm.value) ||
    explainOptions(vm.options)
  );
}

/** 检查批量字段。 */
export function checkBatchField(vm) {
  return checkTextField(vm);
}

/** 检查单选字段。 */
export function checkRadioField(vm) {
  const itemMessage = explainItem(vm.item);
  if (itemMessage) return itemMessage;
  const dataMessage = explainChoiceOptions(
    vm.item.data || [],
    vm.item,
    "item.data",
  );
  if (dataMessage) return dataMessage;
  return explainRadioValue(vm.value) || explainOptions(vm.options);
}

/** 解释树的选中值。编号数组，或带节点字段的对象数组。 */
export function explainTreeValue(value) {
  if (EMPTY(value)) return "";
  if (!Array.isArray(value)) return "value 必须是选中项数组";
  const invalid = value.some((item) => !isScalar(item) && !isPlainObject(item));
  if (invalid) return "value 必须是编号或节点对象组成的数组";
  return "";
}

/** 检查树字段。 */
export function checkTreeField(vm) {
  const itemMessage = explainItem(vm.item);
  if (itemMessage) return itemMessage;
  const data = vm.options && vm.options.length ? vm.options : vm.item.data || [];
  return explainTree(data) || explainTreeValue(vm.value) || explainOptions(vm.options);
}

/** 检查最小最大字段。 */
export function checkMinMaxField(vm) {
  return (
    explainItem(vm.item) ||
    explainMinMaxValue(vm.value) ||
    explainOptions(vm.options)
  );
}

/** 协议数字到检查函数。 */
const CHECKS = {
  [FIELD.text]: checkTextField,
  [FIELD.select]: checkSelectField,
  [FIELD.multiSelect]: checkSelectField,
  [FIELD.dateTimeRange]: checkRangeField,
  [FIELD.time]: checkTimeField,
  [FIELD.timeRange]: checkRangeField,
  [FIELD.cascader]: checkCascaderField,
  [FIELD.dateRange]: checkRangeField,
  [FIELD.cascaderNew]: checkCascaderField,
  [FIELD.cascaderMulti]: checkCascaderField,
  [FIELD.batch]: checkBatchField,
  [FIELD.radio]: checkRadioField,
  [FIELD.monthRange]: checkRangeField,
  [FIELD.minMax]: checkMinMaxField,
  [FIELD.user]: checkTreeField,
  [FIELD.department]: checkTreeField,
  [FIELD.departmentAll]: checkTreeField,
  [FIELD.customTree]: checkTreeField,
};

/** 检查筛选项字段。 */
export function checkSearchField(vm) {
  if (typeof vm.closable !== "boolean") return "closable 必须是布尔值";
  const itemMessage = explainItem(vm.item);
  if (itemMessage) return itemMessage;
  if (!isBuiltinType(vm.item.type))
    return explainLooseValue(vm.value) || explainOptions(vm.options);
  return CHECKS[normalizeFieldType(vm.item.type)](vm);
}

/** 检查筛选项。 */
export function checkSearchItems(vm) {
  if (!Array.isArray(vm.items)) return "items 必须是数组";
  if (!isPlainObject(vm.values)) return "values 必须是对象";
  if (vm.query != null && !isPlainObject(vm.query)) return "query 必须是对象";
  if (
    !Array.isArray(vm.hiddenKeys) ||
    vm.hiddenKeys.some((key) => !isScalar(key))
  )
    return "hiddenKeys 必须是字符串或数字数组";
  if (vm.remoteQuery != null && typeof vm.remoteQuery !== "function")
    return "remoteQuery 必须是函数";
  if (typeof vm.loading !== "boolean") return "loading 必须是布尔值";
  if (typeof vm.closable !== "boolean") return "closable 必须是布尔值";
  return "";
}

/** 创建字段属性。 */
export function createFieldProps(checkValue) {
  return {
    item: {
      type: Object,
      required: true,
      validator(item) {
        return explainItem(item) === "";
      },
    },
    value: {
      default: undefined,
      validator(value) {
        return checkValue(value) === "";
      },
    },
    options: {
      type: Array,
      default: () => [],
      validator(options) {
        return explainOptions(options) === "";
      },
    },
  };
}

function mergeWatch(base, extra) {
  const watch = { ...base };
  Object.keys(extra || {}).forEach((key) => {
    if (!watch[key]) {
      watch[key] = extra[key];
      return;
    }
    const left = watch[key];
    const right = extra[key];
    watch[key] = {
      ...left,
      ...right,
      immediate: !!(left.immediate || right.immediate),
      deep: !!(left.deep || right.deep),
      handler(...args) {
        if (typeof left.handler === "function") left.handler.apply(this, args);
        if (typeof right.handler === "function") right.handler.apply(this, args);
      },
    };
  });
  return watch;
}

/** 添加字段检查。 */
export function withFieldGuard(options, check) {
  return {
    ...options,
    data() {
      const extra =
        typeof options.data === "function" ? options.data.call(this) : {};
      return { fieldPropsValid: true, fieldError: "", ...extra };
    },
    watch: mergeWatch(
      {
        item: {
          immediate: true,
          deep: true,
          handler() {
            this.runFieldCheck();
          },
        },
        value: {
          deep: true,
          handler() {
            this.runFieldCheck();
          },
        },
        options: {
          deep: true,
          handler() {
            this.runFieldCheck();
          },
        },
      },
      options.watch,
    ),
    methods: {
      runFieldCheck() {
        const message = check(this) || "";
        if (message === this.fieldError) return;
        this.fieldError = message;
        this.fieldPropsValid = !message;
        if (message)
          raiseFieldError(
            new TypeError(
              `SearchForm 字段「${this.item && this.item.key}」${message}`,
            ),
          );
      },
      ...(options.methods || {}),
    },
  };
}
