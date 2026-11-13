/** 与 gc / pod / deep-convo 的 searchItem.type 对齐。值是后端协议数字。 */
export const FIELD = {
  text: 1,
  select: 2,
  multiSelect: 3,
  dateTimeRange: 4,
  time: 5,
  timeRange: 6,
  cascader: 7,
  user: 8,
  dateRange: 9,
  cascaderNew: 10,
  cascaderMulti: 11,
  department: 12,
  departmentAll: 13,
  batch: 14,
  radio: 15,
  monthRange: 16,
  minMax: 17,
  selectDate: 20,
  customTree: 21,
};

const NAME_BY_NUMBER = {};
Object.keys(FIELD).forEach((name) => {
  NAME_BY_NUMBER[FIELD[name]] = name;
});

/**
 * 把字段 type 收成协议数字。
 * 接受 1、'1'、'text'。对照表之外的值原样返回，交给插槽。
 */
export function normalizeFieldType(type) {
  if (
    typeof type === "string" &&
    Object.prototype.hasOwnProperty.call(FIELD, type)
  ) {
    return FIELD[type];
  }
  if (typeof type === "number" && Number.isFinite(type)) return type;
  if (typeof type === "string" && /^-?\d+$/.test(type.trim()))
    return Number(type);
  return type;
}

export function isBuiltinType(type) {
  return Object.prototype.hasOwnProperty.call(
    NAME_BY_NUMBER,
    normalizeFieldType(type),
  );
}
