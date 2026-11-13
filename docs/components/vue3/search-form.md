---
title: SearchForm 搜索表单 · Vue 3
description: Vue 3 SearchForm 的交互示例、接入方法和接口说明。
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# SearchForm 搜索表单 · Vue 3

<p class="lead">配置搜索字段，管理输入与提交。</p>

<div class="component-meta"><span>Vue 3 · TypeScript</span><span>Element Plus</span><span>源码快照 fc9cc41</span></div>

## 何时使用

适合配置式筛选。字段配置、请求和接口映射由页面维护，组件负责输入交互。通过 `formHeader` 声明字段，`formModel` 传入初值及外部回填。

## 接入

先按[当前技术栈快速开始](/components/vue3/)准备依赖、样式和源码路径。能力安装标识为 `SearchForm`：

```sh
npx @agent-xy/ai-code add admin --only SearchForm --dry-run
npx @agent-xy/ai-code add admin --only SearchForm
```

## 交互示例

<div class="demo-grid">
<DemoCard stack="vue3" id="SearchFormBasic" title="基础用法" description="最小可运行的 SearchForm 用法。展开代码查看完整调用。" :height="360" :wide="true" />
<DemoCard stack="vue3" id="SearchFormAdvanced" title="配置与交互" description="配置字段类型与自定义控件，观察值和事件。" :height="360" :wide="true" />
<DemoCard stack="vue3" id="SearchFormRemote" title="异步选项" description="页面注入远程选项，展示异步加载与字段组合。" :height="360" :wide="true" />
</div>

## API

| 入口 | 说明 | 默认 / 返回 |
| --- | --- | --- |
| `formHeader / formModel` | 类型化字段配置 / 初值与外部回填 | 必填 / {} |
| `loading / disabled` | 提交忙状态 / 禁用表单 | false |
| `showButton / isShowReset` | 默认操作按钮 / 重置按钮 | true |
| `labelPosition / labelWidth` | 标签布局 | left / — |
| `submit-form / reset-form / form-change` | 返回当前配置字段的独立快照 | Partial&lt;Values&gt; |
| 字段插槽 | 按 slotName 或 propName，接收 value/updateValue/change/form | 按需声明 |
| `actions / actions-extra` | 替换按钮组 / 追加操作 | 插槽 |
| 实例方法 | submitForm、resetForm、getFormData、validate、validateField、clearValidate | 见类型定义 |

::: details 完整参数、事件和接入约定

以下内容摘自来源仓库 README，其中的运行目录和验证脚本均指来源仓库。本站启动与示例接入以本页“接入”和技术栈快速开始为准。

配置式搜索表单，内部维护输入草稿。基础接入见 `技术栈 README`，完整页面见 `examples/pages/orders`、`examples/pages/users`。

| 属性                                   | 用途                                                         |
| -------------------------------------- | ------------------------------------------------------------ |
| `formHeader: FormItemConfig<Values>[]` | 字段与模型键、控件值类型关联                                 |
| `formModel?: Partial<Values>`          | 初始输入与外部回填；对象替换覆盖草稿，原地变化只同步变化字段 |
| `loading / disabled`                   | 提交忙状态 / 禁用表单                                        |
| `showButton / isShowReset`             | 默认操作按钮 / 重置按钮                                      |
| `labelPosition / labelWidth`           | 标签布局                                                     |

字段类型：`text`、`number`、`selectOne`（可配置 multiple）、`date`、`dateRange`、`datetimerange`、`inputBoxInterval`、`custom`。数字区间用 `propName1 / propName2`，其余用 `propName`。单选及多选支持字符串、数字、布尔值。日期默认输出字符串：单日期与日期范围为 `YYYY-MM-DD`，时间范围为 `YYYY-MM-DD HH:mm:ss`。`format` 控制展示，`valueFormat` 控制输出；字符串模型使用非空格式。若模型使用 `Date` 或 `Date[]`，必须显式设置 `valueFormat: ''`，并在接口边界转换。

`optionsArr`、远程加载与 `loading` 由页面提供，参考用户示例的 `useSelectOptions`。控件扩展放 `controlProps`；值及更新事件由组件管理，不通过 controlProps 覆盖。`rules` 使用与 Element Plus 一致的 async-validator 规则，由字段管理校验序号，旧成功和旧失败都不能改写当前校验状态；没有 rules 时使用内置必填、区间完整性与数字区间顺序检查。

事件 `submit-form / reset-form / form-change` 都返回当前配置字段的独立快照。移除字段会清理其草稿与校验，新增字段按首次注册时模型值重置。回车和搜索按钮走同一次校验；规则或值变化使未完成校验失效。

字段插槽按 `slotName ?? propName` 匹配，接收 `{ form, item, value, updateValue, change }`。通过 `updateValue(value)` 或 `change(name, value)` 更新，不直接写 form。`actions` 插槽接收 `{ submit, reset, form, busy }`；`actions-extra` 放导出等页面操作。

实例方法：`submitForm(): Promise<boolean>`、`resetForm()`、`getFormData()`、`validate()`、`validateField()`、`clearValidate()`。提交事件本身不等待页面请求，页面使用 loading 管理请求状态。切换初始化实体时更换 key。
:::

::: details 完整类型定义

```ts
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

```

:::

## 常见问题

字段使用 `propName/itemType`，通过 `formModel` 回填。提交、重置和变化事件返回配置字段的独立快照；校验和日期值按本页约定处理，接口转换放在提交边界。

示例代码中的 `@/` 指向已复制源码的根目录；相对引用的模拟数据文件也列在源码面板中。业务接入时替换请求函数，并保留组件约定的输入输出。
