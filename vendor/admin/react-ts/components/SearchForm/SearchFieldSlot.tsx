import type { AriaAttributes, ReactNode } from "react";
import type { SearchFieldSlotContext, SearchFormRef } from "./types";
import { Form } from "antd";
import { cloneSearchValue } from "./values";

interface Props<Values extends object> extends AriaAttributes {
  slot: (context: SearchFieldSlotContext<Values>) => ReactNode;
  getValues: SearchFormRef<Values>["getValues"];
  setValues: SearchFormRef<Values>["setValues"];
  value?: unknown;
  onChange?: (value: unknown) => void;
  disabled: boolean;
  id?: string;
  onBlur?: (...args: unknown[]) => void;
}

/** 继续作为外层 Form.Item 的受控控件，仅订阅同一 Form 仓库中的关联字段。 */
export function SearchFieldSlot<Values extends object>({
  slot,
  getValues,
  setValues,
  value,
  onChange,
  disabled,
  id,
  onBlur,
  ...ariaProps
}: Props<Values>) {
  const { status } = Form.Item.useStatus();
  return (
    <Form.Item noStyle shouldUpdate>
      {() =>
        slot({
          value: cloneSearchValue(value),
          onChange: (next) => onChange?.(cloneSearchValue(next)),
          values: getValues(),
          setValues,
          disabled,
          id,
          status,
          ariaProps,
          onBlur,
        })
      }
    </Form.Item>
  );
}
