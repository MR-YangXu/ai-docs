import type { RuntimeFormItem } from './types';
export function clone<Value>(value: Value): Value {
  if (value instanceof Date) return new Date(value.getTime()) as Value;
  if (Array.isArray(value)) return value.map(clone) as Value;
  if (value && typeof value === 'object') {
    if (
      Object.getPrototypeOf(value) !== Object.prototype &&
      Object.getPrototypeOf(value) !== null
    )
      throw new TypeError('SearchForm 仅支持普通对象、数组和 Date');
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, clone(item)]),
    ) as Value;
  }
  return value;
}
export function same(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (left instanceof Date && right instanceof Date)
    return left.getTime() === right.getTime();
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object')
    return false;
  const a = left as Record<string, unknown>,
    b = right as Record<string, unknown>;
  return (
    Object.keys(a).length === Object.keys(b).length &&
    Object.keys(a).every((key) => Object.hasOwn(b, key) && same(a[key], b[key]))
  );
}
export function fieldNames(field: RuntimeFormItem): string[] {
  return field.itemType === 'inputBoxInterval'
    ? [field.propName1!, field.propName2!]
    : [field.propName!];
}
