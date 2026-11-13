import type { ReactNode } from "react";
import type {
  SearchField,
  SearchFieldSlotContext,
  SearchFieldSlots,
} from "./types";
import dayjs from "dayjs";
import { zhSearchFormMessages } from "./messages";

/** 表单只接收普通数据、Date 和 Dayjs；不悄悄破坏自定义类实例。 */
export function cloneSearchValue<Value>(value: Value): Value {
  if (value == null || typeof value !== "object") return value;
  if (dayjs.isDayjs(value)) return value.clone() as Value;
  if (value instanceof Date) return new Date(value.getTime()) as Value;
  if (Array.isArray(value))
    return value.map((item) => cloneSearchValue(item)) as Value;
  if (
    Object.getPrototypeOf(value) !== Object.prototype &&
    Object.getPrototypeOf(value) !== null
  )
    throw new TypeError("SearchForm 的值只支持普通对象、数组、Date 和 Dayjs");
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, cloneSearchValue(item)]),
  ) as Value;
}

export function fieldNames<Values extends object>(
  field: SearchField<Values>,
): string[] {
  return field.type === "numberRange" ? field.names : [field.name];
}

/** 动态字段名到强类型插槽的运行时适配；不匹配对象原型上的方法。 */
export function getFieldSlot<Values extends object>(
  slots: SearchFieldSlots<Values> | undefined,
  name: string,
) {
  return slots && Object.prototype.hasOwnProperty.call(slots, name)
    ? (slots[name as keyof SearchFieldSlots<Values>] as
        | ((context: SearchFieldSlotContext<Values>) => ReactNode)
        | undefined)
    : undefined;
}

export function checkFields<Values extends object>(
  fields: SearchField<Values>[],
  slots?: SearchFieldSlots<Values>,
) {
  const names = new Set<string>();
  const keys = new Set<string>();
  for (const field of fields) {
    const key = field.type === "numberRange" ? field.key : field.name;
    if (!key || keys.has(key))
      throw new Error(`SearchForm 字段标识必须非空且唯一：${key}`);
    keys.add(key);
    for (const name of fieldNames(field)) {
      if (!name || names.has(name))
        throw new Error(`SearchForm 字段名必须非空且不能重复注册：${name}`);
      names.add(name);
    }
    if (
      field.type === "custom" &&
      !field.render &&
      !getFieldSlot(slots, field.name)
    )
      throw new Error(
        `SearchForm 自定义字段 ${field.name} 必须提供 fieldSlots 或 render`,
      );
  }
}

export function pickSearchValues<Values extends object>(
  source: object,
  names: string[],
): Partial<Values> {
  const record = source as Record<string, unknown>;
  return Object.fromEntries(
    names.map((name) => [name, cloneSearchValue(record[name])]),
  ) as Partial<Values>;
}

export function isEmptySearchValue(value: unknown): boolean {
  if (value == null || value === "") return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value))
    return value.length === 0 || value.some(isEmptySearchValue);
  return false;
}

export function getRangeError(
  start: unknown,
  end: unknown,
  required: boolean,
  messages = zhSearchFormMessages,
): string | undefined {
  const startEmpty = isEmptySearchValue(start);
  const endEmpty = isEmptySearchValue(end);
  if (startEmpty && endEmpty)
    return required ? messages.requiredRange : undefined;
  if (startEmpty || endEmpty) return messages.incompleteRange;
  if (
    typeof start !== "number" ||
    typeof end !== "number" ||
    !Number.isFinite(start) ||
    !Number.isFinite(end)
  )
    return messages.invalidNumber;
  return start > end ? messages.invalidRange : undefined;
}

// 所有基础值都带类型前缀，避免布尔编码与业务字符串碰撞。
export function encodeOption(value: unknown): string | undefined {
  return value == null ? undefined : `${typeof value}:${String(value)}`;
}
export function decodeOption(
  value: string | undefined,
): string | number | boolean | undefined {
  if (value === undefined) return undefined;
  const colon = value.indexOf(":");
  const type = value.slice(0, colon),
    raw = value.slice(colon + 1);
  return type === "boolean"
    ? raw === "true"
    : type === "number"
      ? Number(raw)
      : raw;
}
