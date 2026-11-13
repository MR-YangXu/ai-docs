---
title: SearchForm 搜索表单 · React
description: React SearchForm 的交互示例、接入方法和接口说明。
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# SearchForm 搜索表单 · React

<p class="lead">配置搜索字段，管理输入与提交。</p>

<div class="component-meta"><span>React · TypeScript</span><span>Ant Design</span><span>源码快照 fc9cc41</span></div>

## 何时使用

适合配置式筛选。字段配置、请求和接口映射由页面维护，组件负责输入交互。通过 `fields` 声明字段，`initialValues` 提供初始值。

## 接入

先按[当前技术栈快速开始](/components/react/)准备依赖、样式和源码路径。能力安装标识为 `SearchForm`：

```sh
npx @agent-xy/ai-code add admin --only SearchForm --dry-run
npx @agent-xy/ai-code add admin --only SearchForm
```

## 交互示例

<div class="demo-grid">
<DemoCard stack="react" id="SearchFormBasic" title="基础用法" description="最小可运行的 SearchForm 用法。展开代码查看完整调用。" :height="360" :wide="true" />
<DemoCard stack="react" id="SearchFormAdvanced" title="配置与交互" description="配置字段类型与自定义控件，观察值和事件。" :height="360" :wide="true" />
<DemoCard stack="react" id="SearchFormRemote" title="异步选项" description="页面注入远程选项，展示异步加载与字段组合。" :height="360" :wide="true" />
</div>

## API

| 入口 | 说明 | 默认 / 返回 |
| --- | --- | --- |
| `fields / initialValues` | 类型化字段配置 / 初始化值 | 必填 / {} |
| `onSubmit / onReset / onValuesChange` | 提交 / 重置 / 用户变化快照 | onSubmit 必填 |
| `fieldSlots` | 按字段名自定义控件；通过 onChange/setValues 更新 | 可选 |
| `layout / collapsedCount / defaultCollapsed` | 网格或紧凑布局 / 折叠配置 | grid / 见下方详细说明 |
| `loading / disabled / showActions` | 加载 / 禁用 / 默认按钮 | false / false / true |
| `actionsExtra / renderActions / prefix` | 追加操作 / 自定义按钮 / 前置内容 | React 节点或回调 |
| `messages / formProps` | 文案与允许透传的原生表单属性 | 按需传入 |
| 实例方法 | submit、reset、getValues、setValues、validate | SearchFormRef&lt;Values&gt; |

::: details 完整参数、事件和接入约定

以下内容摘自来源仓库 README，其中的运行目录和验证脚本均指来源仓库。本站启动与示例接入以本页“接入”和技术栈快速开始为准。

基于 Ant Design Form 的顶部搜索表单。输入只进入内部表单草稿，校验成功后通过 `onSubmit` 交给页面；分页和刷新使用页面保存的已提交条件。

已验证 React 18.3.1、React 19.1.0、Ant Design 5.27.6、TypeScript 5.9.3。使用 `forwardRef` 转发引用，支持 React 18 和 19。组件不依赖业务接口、路由、状态仓库或全局样式，导入入口会带入局部样式。

#### 最小使用

```tsx
import type { SearchField } from './components/SearchForm'
import { useState } from 'react'
import { SearchForm } from './components/SearchForm'

interface Values { keyword?: string, status?: 0 | 1 }

const fields: SearchField<Values>[] = [
  { name: 'keyword', label: '名称', type: 'text' },
  {
    name: 'status',
    label: '状态',
    type: 'select',
    options: [{ label: '启用', value: 1 }, { label: '停用', value: 0 }],
  },
]

export function Example() {
  const [query, setQuery] = useState<Partial<Values>>({})
  return (
    <>
      <SearchForm<Values> fields={fields} onSubmit={setQuery} onReset={setQuery} />
      <pre>{JSON.stringify(query)}</pre>
    </>
  )
}
```

完整页面见 `订单管理` 和 `用户管理`。代码片段假设调用方位于源码根目录；放在其他目录时调整相对导入。应用入口负责 UI 库语言和主题；React 19 接入说明见 `技术栈 README`。

#### 字段

`fields` 为扁平数组，字段名受 `Values` 类型约束，控件类型与字段值匹配：

| `type`          | 字段值             | 说明                                                               |
| --------------- | ------------------ | ------------------------------------------------------------------ |
| `text`          | 字符串             | 默认可清空                                                         |
| `number`        | 数字或未填写       | 支持原生上下限、精度；不启用 `stringMode`                          |
| `select`        | 字符串、数字或布尔值       | `options` 的值与对应字段类型一致                                   |
| `multiSelect`   | 字符串、数字或布尔数组   | 原生多选；不使用对象值模式                                         |
| `date`          | Dayjs 对象         | 单日期，在 API 边界转为接口字符串或时间戳 |
| `dateRange`     | Dayjs 数组         | 日期范围；原生选择器正常提交两个端点                               |
| `dateTimeRange` | Dayjs 数组         | 日期与时间范围                                                     |
| `numberRange`   | 两个独立数字字段   | `key` 为布局身份，`names: ['min_amount', 'max_amount']` 为真实字段 |
| `custom`        | 对应字段的自定义值 | 使用 `fieldSlots` 或 `render`；两者至少提供一个                    |

共有 `label`、`required`、`rules`、`disabled`、`tooltip`。`width` 指定紧凑布局下整个字段（含标签）的宽度，默认 240px；日期范围建议 320px。标签可省略，但调用方应提供可访问名称。原生属性通过对应 `controlProps` 传入；值、变化回调、禁用状态和 ID 由表单管理。

自定义控件接收最新值，调用 `onChange(nextValue)` 更新；将 `id`、`ariaProps` 和需要的 `onBlur` 转交真实输入元素。不要直接修改传入数组或对象。内置控件会保留原生失焦回调并合并表单校验监听器。

普通 `required` 允许有效 `0/false`，拦截空值、空格和空数组。范围字段检查两个端点完整性；数字区间检查大小关系。显式 `rules` 替代自动规则，`rules: []` 也会覆盖。数字区间的显式规则应用于两个端点，并在另一个端点变化时重新校验。

支持扁平字段，不提供嵌套字段路径、通用表单引擎或业务日期/金额转换。

#### 字段插槽与联动

`fieldSlots` 按字段的 `name` 匹配，优先于内置控件和 `custom.render`，不改变字段原有的标签、布局、校验和重置规则。`custom` 字段使用插槽后可省略 `render`；没有插槽的原有字段继续按原方式渲染。

```tsx
import type { SearchField } from './components/SearchForm'
import { InputNumber, Select } from 'antd'
import { SearchForm } from './components/SearchForm'

interface Values { action?: 'open' | 'copy', copies?: number }

const fields: SearchField<Values>[] = [
  { name: 'action', label: '动作', type: 'custom' },
  { name: 'copies', label: '复制数量', type: 'number' },
]

export function LinkedSearch({ onSearch }: { onSearch: (values: Partial<Values>) => void }) {
  return (
    <SearchForm<Values>
      fields={fields}
      onSubmit={onSearch}
      fieldSlots={{
        action: ({ value, onChange, setValues, disabled, id, ariaProps, onBlur }) => (
          <Select<'open' | 'copy'>
            {...ariaProps}
            id={id}
            value={value}
            disabled={disabled}
            onBlur={onBlur}
            options={[{ label: '开启', value: 'open' }, { label: '复制', value: 'copy' }]}
            onChange={(next) => {
              onChange(next)
              if (next !== 'copy')
                setValues({ copies: undefined }, { mode: 'merge' })
            }}
          />
        ),
        copies: ({ value, onChange, values, disabled, id, ariaProps, onBlur }) => (
          <InputNumber
            {...ariaProps}
            id={id}
            min={1}
            value={value}
            disabled={disabled || values.action !== 'copy'}
            onBlur={onBlur}
            onChange={next => onChange(next ?? undefined)}
          />
        ),
      }}
    />
  )
}
```

- 插槽名、`value/onChange` 和关联更新都保留业务字段类型。插槽接收 `value/onChange/disabled/id/status/ariaProps/onBlur`，另外提供实时 `values` 和 `setValues`。
- `values` 为当前配置字段的独立草稿快照。插槽通过原生 `Form.Item shouldUpdate` 订阅同一表单仓库；用户输入、回填、重置和关联字段更新都会刷新插槽，无需页面维护第二份表单值。
- `setValues(values, { mode: 'merge' | 'replace' })` 与引用方法相同。联动清空一般使用 `merge`；它不自动触发查询或 `onValuesChange`。只在事件处理或子组件的副作用中更新字段，不在插槽渲染期间调用。
- 数字区间按 `names` 中的两个端点名分别匹配插槽，保留原有双端点校验；区间布局用的 `key` 不是插槽名。
- 插槽返回 `null` 时控件留空，不回退到默认控件，也不移除外层字段、标签或校验。整个字段的移除继续通过 `fields` 配置处理；折叠仍保留字段值。
- 自定义控件应转交 `id/ariaProps`、需要的 `onBlur` 和禁用状态；校验状态 `status` 可按控件支持情况传入。原有 `custom.render` 的参数保持不变。

#### 按钮后的追加插槽

`actionsExtra` 接收 React 节点，在默认查询、重置按钮之后追加操作；默认按钮会自动保留，无需手动拼接 `defaultActions`。

```tsx
<SearchForm<Values>
  fields={fields}
  onSubmit={handleSearch}
  actionsExtra={(
    <Button htmlType="button" onClick={handleCreate}>新增</Button>
  )}
/>
```

- 多个按钮可以传节点数组，或使用 `<Space wrap>` 组合；操作区复用现有间距与换行样式。
- `showActions={false}` 只隐藏默认查询、重置按钮，追加内容仍显示。
- 同时提供 `renderActions` 时，先渲染其返回内容，再渲染 `actionsExtra`；`renderActions` 继续用于定制原按钮组。
- 追加内容不注册表单字段。权限、点击事件和业务加载状态由页面控制；原生 `<button>` 应设置 `type="button"`，Ant Design Button 可显式设置 `htmlType="button"`，避免触发表单提交。

#### 草稿、回填和重置

- `initialValues` 仅初始化；普通父级重渲染或更换其对象不会覆盖用户输入。
- `getValues`、变化、提交、重置载荷只包含当前配置字段，类型为 `Partial<Values>`。删除字段后不会把旧值带入请求。
- 只支持基本值、无循环引用的普通对象和数组、`Date`、Dayjs。数组、对象、日期快照与父级隔离；其他类实例不受支持。
- 新字段进入配置时记录其 `initialValues` 快照作为重置基线；后续回填不改变基线。删除字段后清除基线，重新加入时重新初始化。改变控件类型也视为重新初始化。
- `reset()` 恢复当前字段基线，清理错误和失效提交，只发 `onReset(values)`。是否重新查询由页面决定，不额外触发 `onSubmit`。
- 重置通过表单字段更新完成，不主动重新挂载自定义控件；控件应基于受控值更新展示。复杂控件自己的临时内部状态由控件负责。
- 合并回填只更新显式字段；完整替换会清空当前配置中缺失的字段。传 `{}` 且 `mode: 'merge'` 不代表清空。
- 回填不自动触发 `onValuesChange` 或搜索。字段删除清理草稿、校验与基线；折叠仅隐藏展示，保留值和校验。

```tsx
// searchRef 类型：useRef<SearchFormRef<Values>>(null)
searchRef.current?.setValues({ keyword: '示例' }, { mode: 'merge' })
searchRef.current?.setValues({}, { mode: 'replace' })
searchRef.current?.reset()
```

#### 属性、回调和引用

| 入口                              | 约定                                                                             |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `fieldSlots`                      | 按真实字段名匹配的控件插槽；支持读取实时 `values` 和受控 `setValues`             |
| `onSubmit(values)`                | 校验后回调，允许返回 Promise；网络请求、错误处理由页面决定                       |
| `onReset(values)`                 | 重置后快照；不会再隐式提交                                                       |
| `onValuesChange(changed, values)` | 仅用户输入触发，两份快照都包含本次更新                                           |
| `loading`                         | 页面请求中的状态；阻止提交，不禁止编辑草稿                                       |
| `layout`                          | 默认 `grid`；`compact` 将标签、控件、操作区放入同一行并自动换行，窄屏按字段换行  |
| `prefix`                          | 前置导航、平台切换等不参与查询值的内容，避免注册虚假表单字段                     |
| `messages`                        | 查询、重置、折叠和内置校验文案；默认跟随 ConfigProvider 的中英文语言，可逐项覆盖 |
| `disabled`                        | 禁用字段和默认提交、重置按钮；自定义字段也收到禁用状态                           |
| `formProps`                       | 透传原生布局、标签、校验触发等；实例、草稿、提交等核心状态由组件管理             |
| `className/style`                 | 作用于最外层容器；`formProps.className/style` 作用于内部 Form 布局               |
| `showActions`                     | 默认 `true`；为 `false` 时隐藏默认按钮，仍渲染 `renderActions` 和 `actionsExtra` |
| `actionsExtra`                    | 追加在按钮组之后的 React 节点，适合新增、导出等页面操作                          |
| `renderActions(context)`          | 接收 `defaultActions/submit/reset/busy`，用于定制原按钮组                       |
| `collapsedCount`                  | 可选折叠阈值；不传则不折叠；`defaultCollapsed` 默认 `true`                       |
| `ref`                             | `SearchFormRef<Values>`                                                          |

引用方法：

| 方法                          | 语义                                                                                         |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| `getValues()`                 | 独立的当前草稿快照                                                                           |
| `setValues(values, { mode })` | 明确合并或替换，不更新基线                                                                   |
| `reset()`                     | 恢复基线、清理校验并通知页面                                                                 |
| `validate()`                  | 返回校验后的快照；失败时以原生校验结果拒绝，不提交                                           |
| `submit()`                    | 返回 `Promise<boolean>`；无效、繁忙或校验已过期时返回 `false`，有效回调正常完成时返回 `true` |

`submit()` 的 `true` 不证明业务接口成功；如果页面返回 Promise，它会等待该 Promise，拒绝会向调用方传播。组件显示当前提交的异常信息，原生按钮入口会处理拒绝，命令式调用者仍需处理 Promise。

分页、排序、额外接口参数由页面组装。切换初始化实体时更换组件 `key`；普通回填使用 `setValues`。翻页和导出使用已提交快照，不隐式提交输入草稿。

按钮、Enter 和引用提交共用校验入口。校验中防止重复提交；输入、回填、重置、字段或规则变化、卸载使旧校验失效。旧任务不会覆盖新任务的忙碌状态或异常提示。已经发出的页面网络请求仍需页面自行取消或按请求序号防乱序。

#### 验证与示例

在 `content/templates/admin/react-ts` 执行：

```sh
npm ci
npm run typecheck
npm run build
npm run dev
```

打开终端提供的地址，切换订单与用户页面。组件目录就是示例使用和实际分发的源码；`add admin` 不安装示例页面。

参见 `完整操作指南` 与 `可运行示例`。
:::

::: details 完整类型定义

```ts
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

```

:::

## 常见问题

字段使用 `name/type`，初值通过 `initialValues` 提供，后续回填使用 `ref.setValues()`。提交值从 `onSubmit` 获取；日期、校验和重置按本页约定处理，接口转换放在提交边界。

示例代码中的 `@/` 指向已复制源码的根目录；相对引用的模拟数据文件也列在源码面板中。业务接入时替换请求函数，并保留组件约定的输入输出。
