import type { ForwardedRef } from "react";
import type { SearchFormProps, SearchFormRef } from "./types";
import { Alert, Button, ConfigProvider, Form, Space } from "antd";
import {
  forwardRef,
  useContext,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { enSearchFormMessages, zhSearchFormMessages } from "./messages";
import { SearchFieldItem } from "./SearchField";
import {
  checkFields,
  cloneSearchValue,
  fieldNames,
  pickSearchValues,
} from "./values";
import "./style.scss";

export type { SearchFormMessages } from "./messages";
export type {
  CustomSearchFieldContext,
  SearchField,
  SearchFieldSlotContext,
  SearchFieldSlots,
  SearchFormProps,
  SearchFormRef,
} from "./types";

const EMPTY_VALUES = {};

function SearchFormInner<Values extends object>(
  {
    fields,
    fieldSlots,
    layout = "grid",
    prefix,
    messages: customMessages,
    initialValues = EMPTY_VALUES,
    onSubmit,
    onReset,
    onValuesChange,
    loading = false,
    disabled = false,
    className,
    style,
    formProps,
    showActions = true,
    actionsExtra,
    renderActions,
    collapsedCount,
    defaultCollapsed = true,
  }: Omit<SearchFormProps<Values>, "ref">,
  ref: ForwardedRef<SearchFormRef<Values>>,
) {
  const { locale } = useContext(ConfigProvider.ConfigContext);
  const messages = {
    ...(locale?.locale?.startsWith("en")
      ? enSearchFormMessages
      : zhSearchFormMessages),
    ...customMessages,
  };
  checkFields(fields, fieldSlots);
  const [form] = Form.useForm<Record<string, unknown>>();
  const id = useId();
  const [initialSnapshot] = useState(() => cloneSearchValue(initialValues));
  const baseline = useRef(new Map<string, unknown>());
  const schema = useRef(new Map<string, string>());
  const validationConfig = useRef<
    { name: string; required?: boolean; disabled?: boolean; rules: unknown }[]
  >([]);
  const activity = useRef({
    mounted: false,
    version: 0,
    submission: null as symbol | null,
  });
  const latestSubmit = useRef({ onSubmit, disabled, loading });
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const pendingFocus = useRef<string | undefined>(undefined);
  const names = fields.flatMap(fieldNames);
  const busy = loading || validating || submitting;

  useLayoutEffect(() => {
    const name = pendingFocus.current;
    if (!collapsed && name) {
      pendingFocus.current = undefined;
      form.scrollToField(name, { focus: true });
    }
  }, [collapsed, form]);

  function invalidate() {
    activity.current.version += 1;
    activity.current.submission = null;
    setValidating(false);
    setSubmitting(false);
    setSubmitError(undefined);
  }

  useLayoutEffect(() => {
    const current = activity.current;
    current.mounted = true;
    return () => {
      current.mounted = false;
      current.version += 1;
      current.submission = null;
    };
  }, []);

  useLayoutEffect(() => {
    latestSubmit.current = { onSubmit, disabled, loading };
  }, [onSubmit, disabled, loading]);

  useLayoutEffect(() => {
    const nextSchema = new Map(
      fields.flatMap((field) =>
        fieldNames(field).map((name) => [name, field.type] as const),
      ),
    );
    const nextValidation = fields.flatMap((field) =>
      fieldNames(field).map((name) => ({
        name,
        required: field.required,
        disabled: field.disabled,
        rules: field.rules,
      })),
    );
    const validationChanged =
      nextValidation.length !== validationConfig.current.length ||
      nextValidation.some((config, index) => {
        const previous = validationConfig.current[index];
        return (
          !previous ||
          config.name !== previous.name ||
          config.required !== previous.required ||
          config.disabled !== previous.disabled ||
          config.rules !== previous.rules
        );
      });
    const patches: {
      name: string[];
      value: unknown;
      errors: string[];
      warnings: string[];
      touched: boolean;
      validating: boolean;
    }[] = [];
    for (const [name, type] of nextSchema) {
      if (schema.current.get(name) !== type) {
        const value = cloneSearchValue(
          (initialValues as Record<string, unknown>)[name],
        );
        baseline.current.set(name, cloneSearchValue(value));
        patches.push({
          name: [name],
          value,
          errors: [],
          warnings: [],
          touched: false,
          validating: false,
        });
      }
    }
    for (const name of schema.current.keys()) {
      if (!nextSchema.has(name)) {
        baseline.current.delete(name);
        patches.push({
          name: [name],
          value: undefined,
          errors: [],
          warnings: [],
          touched: false,
          validating: false,
        });
      }
    }
    schema.current = nextSchema;
    validationConfig.current = nextValidation;
    if (patches.length || validationChanged) {
      invalidate();
      form.setFields([
        ...nextValidation.map(({ name }) => ({
          name: [name],
          errors: [],
          warnings: [],
          validating: false,
        })),
        ...patches,
      ]);
    }
  }, [fields, form, initialValues]);

  function getValues() {
    return pickSearchValues<Values>(form.getFieldsValue(true), names);
  }

  function setValues(
    values: Partial<Values>,
    options: { mode: "merge" | "replace" },
  ) {
    invalidate();
    const incoming = values as Record<string, unknown>;
    form.setFields(
      names
        .filter(
          (name) =>
            options.mode === "replace" ||
            Object.prototype.hasOwnProperty.call(incoming, name),
        )
        .map((name) => ({
          name: [name],
          value: cloneSearchValue(incoming[name]),
          errors: [],
          warnings: [],
          touched: false,
          validating: false,
        })),
    );
  }

  function reset() {
    invalidate();
    form.setFields(
      names.map((name) => ({
        name: [name],
        value: cloneSearchValue(baseline.current.get(name)),
        errors: [],
        warnings: [],
        touched: false,
        validating: false,
      })),
    );
    onReset?.(getValues());
  }

  async function validate() {
    await form.validateFields(names);
    return getValues();
  }

  async function submit(): Promise<boolean> {
    if (
      disabled ||
      loading ||
      activity.current.submission ||
      !activity.current.mounted
    ) {
      return false;
    }
    const submission = Symbol("search-submit");
    const version = activity.current.version;
    activity.current.submission = submission;
    setValidating(true);
    setSubmitError(undefined);
    const isCurrent = () =>
      activity.current.mounted &&
      activity.current.submission === submission &&
      activity.current.version === version;
    try {
      let values: Partial<Values>;
      try {
        values = await validate();
      } catch (error) {
        if (!isCurrent()) return false;
        if (
          typeof error === "object" &&
          error !== null &&
          "errorFields" in error
        ) {
          const first = (error as { errorFields: { name: string[] }[] })
            .errorFields[0]?.name[0];
          if (first) {
            pendingFocus.current = first;
            setCollapsed(false);
            if (!collapsed) {
              pendingFocus.current = undefined;
              form.scrollToField(first, { focus: true });
            }
          }
          return false;
        }
        throw error;
      }
      if (
        !isCurrent() ||
        latestSubmit.current.disabled ||
        latestSubmit.current.loading
      ) {
        return false;
      }
      setValidating(false);
      setSubmitting(true);
      // 允许调用方返回 Promise；它只表示调用方工作完成，组件不判断接口业务成功。
      await latestSubmit.current.onSubmit(values);
      return true;
    } catch (error) {
      if (isCurrent()) {
        setSubmitError(
          error instanceof Error ? error.message : messages.submitError,
        );
      }
      throw error;
    } finally {
      if (isCurrent()) {
        activity.current.submission = null;
        setValidating(false);
        setSubmitting(false);
      }
    }
  }

  function submitFromUI() {
    void submit().catch(() => undefined);
  }

  useImperativeHandle(ref, () => ({
    submit,
    reset,
    getValues,
    setValues,
    validate,
  }));

  const defaultActions = showActions && (
    <>
      <Button htmlType="button" disabled={disabled} onClick={reset}>
        {messages.reset}
      </Button>
      <Button
        htmlType="submit"
        type="primary"
        loading={busy}
        disabled={disabled}
      >
        {messages.search}
      </Button>
    </>
  );
  const canCollapse =
    collapsedCount !== undefined &&
    collapsedCount > 0 &&
    fields.length > collapsedCount;

  return (
    <div
      className={[
        "ai-code-search-form",
        `ai-code-search-form--${layout}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          submitFromUI();
        }}
      >
        <Form<Record<string, unknown>>
          layout={layout === "compact" ? "horizontal" : "vertical"}
          {...formProps}
          name={formProps?.name ?? `search-${id}`}
          component="div"
          form={form}
          initialValues={initialSnapshot}
          disabled={disabled}
          preserve={false}
          onValuesChange={(changed) => {
            invalidate();
            onValuesChange?.(cloneSearchValue(changed), getValues());
          }}
        >
          <div className="ai-code-search-form__content">
            {prefix && (
              <div className="ai-code-search-form__prefix">{prefix}</div>
            )}
            <div className="ai-code-search-form__fields">
              {fields.map((field, index) => (
                <div
                  key={field.type === "numberRange" ? field.key : field.name}
                  className="ai-code-search-form__field"
                  style={
                    layout === "compact" ? { width: field.width } : undefined
                  }
                  hidden={canCollapse && collapsed && index >= collapsedCount}
                >
                  <SearchFieldItem
                    field={field}
                    fieldSlots={fieldSlots}
                    getValues={getValues}
                    setValues={setValues}
                    messages={messages}
                    disabled={disabled || Boolean(field.disabled)}
                  />
                </div>
              ))}
            </div>
            <div className="ai-code-search-form__actions">
              <Space wrap>
                {canCollapse && (
                  <Button
                    type="link"
                    htmlType="button"
                    onClick={() => setCollapsed((value) => !value)}
                  >
                    {collapsed ? messages.expand : messages.collapse}
                  </Button>
                )}
                {renderActions
                  ? renderActions({ defaultActions, submit, reset, busy })
                  : defaultActions}
                {actionsExtra}
              </Space>
            </div>
          </div>
          {submitError && (
            <Alert
              className="ai-code-search-form__error"
              type="error"
              showIcon
              message={submitError}
            />
          )}
        </Form>
      </form>
    </div>
  );
}

// forwardRef 的库类型会擦除泛型；这里恢复内部实现已有的字段/值关联签名。
export const SearchForm = forwardRef(SearchFormInner) as unknown as <
  Values extends object,
>(
  props: SearchFormProps<Values>,
) => React.ReactElement;
export default SearchForm;
