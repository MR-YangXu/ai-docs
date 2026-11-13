import type { FormItemProps } from "antd";
import type { AriaAttributes } from "react";
import type { SearchFormMessages } from "./messages";
import type {
  SearchField as Field,
  RuntimeSearchField,
  SearchFieldSlots,
  SearchFormRef,
} from "./types";
import dayjs from "dayjs";
import { DatePicker, Form, Input, InputNumber, Select } from "antd";
import { SearchFieldSlot } from "./SearchFieldSlot";
import {
  encodeOption,
  decodeOption,
  getFieldSlot,
  getRangeError,
  isEmptySearchValue,
} from "./values";

interface FieldControlProps extends AriaAttributes {
  field: Exclude<RuntimeSearchField, { type: "numberRange" }>;
  value?: unknown;
  onChange?: (value: unknown) => void;
  disabled: boolean;
  id?: string;
  onBlur?: (...args: unknown[]) => void;
}

function mergeBlur<Args extends unknown[]>(
  injected: ((...args: Args) => void) | undefined,
  native: ((...args: Args) => void) | undefined,
) {
  return (...args: Args) => {
    injected?.(...args);
    native?.(...args);
  };
}

function FieldControl({
  field,
  value,
  onChange,
  disabled,
  id,
  onBlur,
  "aria-describedby": describedBy,
  "aria-required": required,
  "aria-invalid": invalid,
}: FieldControlProps) {
  const { status } = Form.Item.useStatus();
  const ariaProps = {
    "aria-describedby": describedBy,
    "aria-required": required,
    "aria-invalid": invalid,
  };
  const common = {
    ...ariaProps,
    disabled,
    id,
    status: status === "error" || status === "warning" ? status : undefined,
  };
  switch (field.type) {
    case "text":
      return (
        <Input
          allowClear
          {...field.controlProps}
          {...common}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange?.(event.target.value)}
          onBlur={mergeBlur(onBlur, field.controlProps?.onBlur)}
        />
      );
    case "number":
      return (
        <InputNumber
          {...field.controlProps}
          {...common}
          stringMode={false}
          value={typeof value === "number" ? value : null}
          onChange={(next) => onChange?.(next ?? undefined)}
          onBlur={mergeBlur(onBlur, field.controlProps?.onBlur)}
        />
      );
    case "select":
    case "multiSelect":
      return (
        <Select
          allowClear
          {...field.controlProps}
          {...common}
          options={field.options.map((option) => ({
            ...option,
            value: encodeOption(option.value),
          }))}
          mode={field.type === "multiSelect" ? "multiple" : undefined}
          value={
            Array.isArray(value) ? value.map(encodeOption) : encodeOption(value)
          }
          onChange={(next) =>
            onChange?.(
              Array.isArray(next) ? next.map(decodeOption) : decodeOption(next),
            )
          }
          onBlur={mergeBlur(onBlur, field.controlProps?.onBlur)}
        />
      );
    case "date":
      return (
        <DatePicker
          {...field.controlProps}
          {...common}
          value={dayjs.isDayjs(value) ? value : null}
          onChange={(next) => onChange?.(next ?? undefined)}
          onBlur={mergeBlur(onBlur, field.controlProps?.onBlur)}
        />
      );
    case "dateRange":
    case "dateTimeRange":
      return (
        <DatePicker.RangePicker
          {...field.controlProps}
          {...common}
          showTime={field.type === "dateTimeRange"}
          value={
            (value as React.ComponentProps<
              typeof DatePicker.RangePicker
            >["value"]) ?? null
          }
          onChange={(next) => onChange?.(next ?? undefined)}
          onBlur={mergeBlur(onBlur, field.controlProps?.onBlur)}
        />
      );
    case "custom":
      return field.render?.({
        value,
        onChange: (next) => onChange?.(next),
        disabled,
        id,
        status,
        ariaProps,
        onBlur,
      });
    default:
      return null;
  }
}

export function SearchFieldItem<Values extends object>({
  field: typedField,
  disabled,
  messages,
  fieldSlots,
  getValues,
  setValues,
}: {
  field: Field<Values>;
  disabled: boolean;
  messages: SearchFormMessages;
  fieldSlots?: SearchFieldSlots<Values>;
  getValues: SearchFormRef<Values>["getValues"];
  setValues: SearchFormRef<Values>["setValues"];
}) {
  const field = typedField as RuntimeSearchField;
  function slotControl(name: string, ariaProps?: AriaAttributes) {
    const slot = getFieldSlot(fieldSlots, name);
    return slot ? (
      <SearchFieldSlot
        slot={slot}
        getValues={getValues}
        setValues={setValues}
        disabled={disabled}
        {...ariaProps}
      />
    ) : undefined;
  }
  if (field.type === "numberRange") {
    const [start, end] = field.names;
    const rangeRules: FormItemProps["rules"] = field.rules ?? [
      ({ getFieldValue }) => ({
        validator: async () => {
          const error = getRangeError(
            getFieldValue(start),
            getFieldValue(end),
            field.required ?? false,
            messages,
          );
          if (error) throw new Error(error);
        },
      }),
    ];
    return (
      <Form.Item
        label={field.label}
        required={field.required}
        tooltip={field.tooltip}
      >
        <div className="ai-code-search-form__range">
          <Form.Item
            name={start}
            rules={rangeRules}
            dependencies={[end]}
            noStyle
          >
            {slotControl(start, {
              "aria-label": `${typeof field.label === "string" ? field.label : messages.range} ${messages.minimum}`,
            }) ?? (
              <RangeNumber
                {...field.controlProps}
                disabled={disabled}
                aria-label={`${typeof field.label === "string" ? field.label : messages.range} ${messages.minimum}`}
              />
            )}
          </Form.Item>
          <span aria-hidden="true">{messages.separator}</span>
          <Form.Item
            name={end}
            rules={rangeRules}
            dependencies={[start]}
            noStyle
          >
            {slotControl(end, {
              "aria-label": `${typeof field.label === "string" ? field.label : messages.range} ${messages.maximum}`,
            }) ?? (
              <RangeNumber
                {...field.controlProps}
                disabled={disabled}
                aria-label={`${typeof field.label === "string" ? field.label : messages.range} ${messages.maximum}`}
              />
            )}
          </Form.Item>
        </div>
      </Form.Item>
    );
  }

  const rules: FormItemProps["rules"] = field.rules ?? [
    {
      validator: async (_rule, value: unknown) => {
        if (field.required && isEmptySearchValue(value)) {
          throw new Error(
            messages.required(
              typeof field.label === "string" ? field.label : messages.field,
            ),
          );
        }
        if (
          (field.type === "dateRange" || field.type === "dateTimeRange") &&
          value != null &&
          (!Array.isArray(value) ||
            value.length !== 2 ||
            value.some(isEmptySearchValue))
        ) {
          throw new Error(messages.incompleteDateRange);
        }
      },
    },
  ];

  return (
    <Form.Item
      name={field.name}
      label={field.label}
      required={field.required}
      tooltip={field.tooltip}
      rules={rules}
    >
      {slotControl(field.name) ?? (
        <FieldControl field={field} disabled={disabled} />
      )}
    </Form.Item>
  );
}

function RangeNumber({
  value,
  onChange,
  ...props
}: Omit<React.ComponentProps<typeof InputNumber<number>>, "onChange"> & {
  onChange?: (value: number | undefined) => void;
}) {
  return (
    <InputNumber<number>
      {...props}
      stringMode={false}
      value={value ?? null}
      onChange={(next) => onChange?.(next ?? undefined)}
    />
  );
}
