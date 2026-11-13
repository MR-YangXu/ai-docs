import { raiseFieldError } from "./fields/fieldProps";
import { FIELD, normalizeFieldType } from "./fieldTypes";
import TextField from "./fields/TextField.vue";
import SelectField from "./fields/SelectField.vue";
import DateRangeField from "./fields/DateRangeField.vue";
import TimeField from "./fields/TimeField.vue";
import TimeRangeField from "./fields/TimeRangeField.vue";
import CascaderField from "./fields/CascaderField.vue";
import BatchField from "./fields/BatchField.vue";
import RadioField from "./fields/RadioField.vue";
import MinMaxField from "./fields/MinMaxField.vue";
import TreeField from "./fields/TreeField.vue";
import SelectDateField from "./fields/SelectDateField.vue";

/** 协议数字到控件。树类型共用 TreeField，再按业务分发。 */
export const FIELD_COMPONENTS = {
  [FIELD.text]: TextField,
  [FIELD.select]: SelectField,
  [FIELD.multiSelect]: SelectField,
  [FIELD.dateTimeRange]: DateRangeField,
  [FIELD.time]: TimeField,
  [FIELD.timeRange]: TimeRangeField,
  [FIELD.cascader]: CascaderField,
  [FIELD.user]: TreeField,
  [FIELD.dateRange]: DateRangeField,
  [FIELD.cascaderNew]: CascaderField,
  [FIELD.cascaderMulti]: CascaderField,
  [FIELD.department]: TreeField,
  [FIELD.departmentAll]: TreeField,
  [FIELD.batch]: BatchField,
  [FIELD.radio]: RadioField,
  [FIELD.monthRange]: DateRangeField,
  [FIELD.minMax]: MinMaxField,
  [FIELD.selectDate]: SelectDateField,
  [FIELD.customTree]: TreeField,
};

const missingFields = Object.keys(FIELD).filter(
  (name) => !FIELD_COMPONENTS[FIELD[name]],
);
if (missingFields.length) {
  raiseFieldError(
    new Error(`SearchForm 缺少字段组件：${missingFields.join("、")}`),
  );
}

/** 已知类型返回组件，其余返回 null，由插槽接管。 */
export function resolveField(type) {
  return FIELD_COMPONENTS[normalizeFieldType(type)] || null;
}
