import type { FormInstance, FormItemRule, FormProps } from 'element-plus';
export type FormModel = Record<string, unknown>;
export type OptionValue = string | number | boolean;
export interface SearchOption<Value = OptionValue> {
  label: string;
  value: Value;
  disabled?: boolean;
}
export interface RuntimeFormItem {
  itemType:
    | 'text'
    | 'number'
    | 'selectOne'
    | 'date'
    | 'dateRange'
    | 'datetimerange'
    | 'inputBoxInterval'
    | 'custom';
  propName?: string;
  propName1?: string;
  propName2?: string;
  labelName?: string;
  width?: string | number;
  labelWidth?: string | number;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  isRequired?: boolean;
  rules?: FormItemRule | FormItemRule[];
  optionsArr?: SearchOption[];
  multiple?: boolean;
  loading?: boolean;
  filterable?: boolean;
  remote?: boolean;
  remoteMethod?: (query: string, selected: unknown) => void;
  format?: string;
  valueFormat?: string;
  min?: number;
  max?: number;
  precision?: number;
  step?: number;
  slotName?: string;
  controlProps?: Record<string, unknown>;
}
type Name<V> = Extract<keyof V, string>;
type Common = Omit<
  RuntimeFormItem,
  | 'itemType'
  | 'propName'
  | 'propName1'
  | 'propName2'
  | 'optionsArr'
  | 'multiple'
  | 'valueFormat'
>;
type Supports<V, T, Result> = unknown extends V
  ? Result
  : NonNullable<V> extends T
    ? Result
    : never;
type Field<V> =
  | Supports<V, string, { itemType: 'text' }>
  | Supports<V, number, { itemType: 'number' }>
  | Supports<
      V,
      OptionValue,
      {
        itemType: 'selectOne';
        multiple?: false;
        optionsArr?: SearchOption<Extract<NonNullable<V>, OptionValue>>[];
      }
    >
  | Supports<
      V,
      OptionValue[],
      {
        itemType: 'selectOne';
        multiple: true;
        optionsArr?: SearchOption<
          V extends (infer Item)[] ? Item : OptionValue
        >[];
      }
    >
  | Supports<V, string, { itemType: 'date'; valueFormat?: string }>
  | Supports<V, Date, { itemType: 'date'; valueFormat: '' }>
  | Supports<
      V,
      string[],
      { itemType: 'dateRange' | 'datetimerange'; valueFormat?: string }
    >
  | Supports<
      V,
      Date[],
      { itemType: 'dateRange' | 'datetimerange'; valueFormat: '' }
    >
  | { itemType: 'custom' };
type NumberName<V> = {
  [K in Name<V>]: unknown extends V[K]
    ? K
    : NonNullable<V[K]> extends number
      ? K
      : never;
}[Name<V>];
export type FormItemConfig<Values extends object = Record<string, unknown>> =
  | {
      [K in Name<Values>]: Common & { propName: K } & Field<Values[K]>;
    }[Name<Values>]
  | (Common & {
      itemType: 'inputBoxInterval';
      propName1: NumberName<Values>;
      propName2: NumberName<Values>;
    });
export interface SearchFormProps<Values extends object> {
  formHeader: FormItemConfig<Values>[];
  formModel?: Partial<Values>;
  disabled?: boolean;
  loading?: boolean;
  showButton?: boolean;
  isShowReset?: boolean;
  labelPosition?: FormProps['labelPosition'];
  labelWidth?: string | number;
}
export interface SearchFormExpose<Values extends object> {
  submitForm: () => Promise<boolean>;
  resetForm: () => void;
  getFormData: () => Partial<Values>;
  validate: FormInstance['validate'];
  validateField: FormInstance['validateField'];
  clearValidate: FormInstance['clearValidate'];
}
