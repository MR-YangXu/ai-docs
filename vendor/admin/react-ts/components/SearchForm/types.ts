import type {
  FormItemProps,
  FormProps,
  InputNumberProps,
  InputProps,
  SelectProps,
} from "antd";
import type { DatePickerProps, RangePickerProps } from "antd/es/date-picker";
import type { ValidateStatus } from "antd/es/form/FormItem";
import type { Dayjs } from "dayjs";
import type { AriaAttributes, CSSProperties, ReactNode, Ref } from "react";
import type { SearchFormMessages } from "./messages";

export type SearchFieldName<Values> = Extract<keyof Values, string>;
type ControlProps<Props> = Omit<
  Props,
  "value" | "defaultValue" | "onChange" | "disabled" | "id"
>;
interface Option<Value> {
  label: ReactNode;
  value: Value;
  disabled?: boolean;
}

interface FieldLayout {
  label?: ReactNode;
  /** 紧凑布局下整个字段（含标签）的宽度。 */
  width?: CSSProperties["width"];
  disabled?: boolean;
  required?: boolean;
  rules?: FormItemProps["rules"];
  tooltip?: FormItemProps["tooltip"];
}

export interface CustomSearchFieldContext<Value> {
  value: Value | undefined;
  onChange: (value: Value | undefined) => void;
  disabled: boolean;
  id?: string;
  status: ValidateStatus | undefined;
  ariaProps: AriaAttributes;
  onBlur?: (...args: unknown[]) => void;
}

export interface SearchFieldSlotContext<Values extends object, Value = unknown>
  extends CustomSearchFieldContext<Value> {
  /** 当前配置字段的实时草稿快照，更新后自动重新渲染插槽。 */
  values: Partial<Values>;
  /** 与引用方法一致；只更新当前配置字段，不自动搜索或触发 onValuesChange。 */
  setValues: SearchFormRef<Values>["setValues"];
}

export type SearchFieldSlots<Values extends object> = {
  [Name in SearchFieldName<Values>]?: (
    context: SearchFieldSlotContext<Values, Values[Name]>,
  ) => ReactNode;
};

type ControlSpec =
  | { type: "text"; controlProps?: ControlProps<InputProps> }
  | {
      type: "number";
      controlProps?: Omit<ControlProps<InputNumberProps<number>>, "stringMode">;
    }
  | {
      type: "select";
      options: Option<string | number | boolean>[];
      controlProps?: Omit<
        ControlProps<SelectProps>,
        "options" | "mode" | "labelInValue" | "children" | "fieldNames"
      >;
    }
  | {
      type: "multiSelect";
      options: Option<string | number | boolean>[];
      controlProps?: Omit<
        ControlProps<SelectProps>,
        "options" | "mode" | "labelInValue" | "children" | "fieldNames"
      >;
    }
  | { type: "date"; controlProps?: ControlProps<DatePickerProps> }
  | {
      type: "dateRange" | "dateTimeRange";
      controlProps?: Omit<
        ControlProps<RangePickerProps>,
        "showTime" | "picker" | "allowEmpty"
      >;
    }
  | {
      type: "custom";
      render?: (context: CustomSearchFieldContext<unknown>) => ReactNode;
    };

type TypedSelect<Type extends "select" | "multiSelect", Value> = Omit<
  Extract<ControlSpec, { type: Type }>,
  "options"
> & { options: Option<Value>[] };

type ValueControl<Value> =
  | (NonNullable<Value> extends string
      ? Extract<ControlSpec, { type: "text" }>
      : never)
  | (NonNullable<Value> extends number
      ? Extract<ControlSpec, { type: "number" }>
      : never)
  | (NonNullable<Value> extends string | number | boolean
      ? TypedSelect<"select", NonNullable<Value>>
      : never)
  | (NonNullable<Value> extends (string | number | boolean)[]
      ? TypedSelect<"multiSelect", NonNullable<Value>[number]>
      : never)
  | (NonNullable<Value> extends Dayjs
      ? Extract<ControlSpec, { type: "date" }>
      : never)
  | (NonNullable<Value> extends (Dayjs | null)[]
      ? Extract<ControlSpec, { type: "dateRange" | "dateTimeRange" }>
      : never)
  | {
      type: "custom";
      render?: (context: CustomSearchFieldContext<Value>) => ReactNode;
    };

type NamedField<Values, Name extends SearchFieldName<Values>> = FieldLayout & {
  name: Name;
} & ValueControl<Values[Name]>;

type NumberName<Values> = {
  [Name in SearchFieldName<Values>]: NonNullable<Values[Name]> extends number
    ? Name
    : never;
}[SearchFieldName<Values>];

interface NumberRangeField<Name extends string> extends FieldLayout {
  type: "numberRange";
  key: string;
  names: [Name, Name];
  controlProps?: Omit<ControlProps<InputNumberProps<number>>, "stringMode">;
}

export type SearchField<Values extends object> =
  | {
      [Name in SearchFieldName<Values>]: NamedField<Values, Name>;
    }[SearchFieldName<Values>]
  | NumberRangeField<NumberName<Values>>;

/** 仅用于动态 Form 仓库到渲染层的适配，公开入口仍由 SearchField 约束字段和值。 */
export type RuntimeSearchField =
  | (FieldLayout & { name: string } & ControlSpec)
  | NumberRangeField<string>;

export interface SearchFormRef<Values extends object> {
  submit: () => Promise<boolean>;
  reset: () => void;
  getValues: () => Partial<Values>;
  setValues: (
    values: Partial<Values>,
    options: { mode: "merge" | "replace" },
  ) => void;
  validate: () => Promise<Partial<Values>>;
}

export interface SearchFormProps<Values extends object> {
  fields: SearchField<Values>[];
  /** 按真实字段名匹配，优先于内置控件或 custom.render；数字区间按端点名匹配。 */
  fieldSlots?: SearchFieldSlots<Values>;
  /** grid 保持默认网格；compact 将标签、控件和操作排在同一行并自动换行。 */
  layout?: "grid" | "compact";
  /** 导航、平台切换等不参与表单值的内容。 */
  prefix?: ReactNode;
  /** 默认跟随 ConfigProvider 的中英文语言；可以逐项覆盖。 */
  messages?: Partial<SearchFormMessages>;
  initialValues?: Partial<Values>;
  onSubmit: (values: Partial<Values>) => void | Promise<void>;
  onReset?: (values: Partial<Values>) => void;
  onValuesChange?: (
    changedValues: Partial<Values>,
    values: Partial<Values>,
  ) => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  formProps?: Omit<
    FormProps<Values>,
    | "form"
    | "initialValues"
    | "fields"
    | "children"
    | "component"
    | "onFinish"
    | "onFinishFailed"
    | "onValuesChange"
    | "onFieldsChange"
    | "disabled"
    | "preserve"
    | "clearOnDestroy"
    | "onReset"
    | "onSubmitCapture"
  >;
  showActions?: boolean;
  /** 追加在默认或 renderActions 按钮组之后；showActions=false 时仍显示。 */
  actionsExtra?: ReactNode;
  renderActions?: (context: {
    defaultActions: ReactNode;
    submit: () => Promise<boolean>;
    reset: () => void;
    busy: boolean;
  }) => ReactNode;
  /** 超出此数量的字段可折叠；折叠保留值和校验。 */
  collapsedCount?: number;
  defaultCollapsed?: boolean;
  ref?: Ref<SearchFormRef<Values>>;
}
