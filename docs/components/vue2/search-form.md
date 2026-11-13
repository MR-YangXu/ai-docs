---
title: SearchForm 搜索表单 · Vue 2
description: Vue 2 SearchForm 的交互示例、接入方法和接口说明。
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# SearchForm 搜索表单 · Vue 2

<p class="lead">配置搜索字段，管理输入与提交。</p>

<div class="component-meta"><span>Vue 2 · JavaScript</span><span>Element UI</span><span>源码快照 fc9cc41</span></div>

## 何时使用

适合配置式筛选。字段配置、请求和接口映射由页面维护，组件负责输入交互。通过 `items` 声明字段，`values` 回显，`query.sync` 接收格式化查询值。

## 接入

先按[当前技术栈快速开始](/components/vue2/)准备依赖、样式和源码路径。能力安装标识为 `SearchForm`：

```sh
npx @agent-xy/ai-code add admin --only SearchForm --dry-run
npx @agent-xy/ai-code add admin --only SearchForm
```

::: warning 当前源码边界
提交 fc9cc41 的 `type: 20 / selectDate` 已有字段组件，但 SearchForm 容器的 CHECKS 表缺少对应校验函数，直接放入 items 会报错。日期示例单独挂载快照中的 SelectDateField 展示其值协议；完整表单中使用该类型前需先修复来源仓库并重新同步。本站未改写快照或跳过校验。
:::

## 交互示例

<div class="demo-grid">
<DemoCard stack="vue2" id="SearchFormBasic" title="基础用法" description="最小可运行的 SearchForm 用法。展开代码查看完整调用。" :height="360" :wide="true" />
<DemoCard stack="vue2" id="SearchFormAdvanced" title="配置与交互" description="配置字段类型与自定义控件，观察值和事件。" :height="360" :wide="true" />
<DemoCard stack="vue2" id="SearchFormRemote" title="异步选项" description="页面注入远程选项，展示异步加载与字段组合。" :height="360" :wide="true" />
<DemoCard stack="vue2" id="SearchFormDates" title="日期与级联" description="日期、时间、月份与不同级联控件的值结构。" :height="360" :wide="true" />
</div>

## API

| 入口 | 说明 | 默认 / 返回 |
| --- | --- | --- |
| `items / values / query` | 字段配置 / 回显值 / query.sync 提交数据 | [] / {} / {} |
| 字段 `key/name/type/data` | 模型键 / 文案 / 类型 / 选项或树数据 | 按需配置 |
| `hiddenKeys / loading / closable` | 隐藏字段、加载、关闭按钮 | [] / false / false |
| `remoteQuery(key,keyword)` | 远程选项入口；字段 remoteMethod 优先 | Promise&lt;Array&gt; |
| `change / typing / check` | 确认值 / 输入过程 / 树和级联勾选 | 对应事件载荷 |
| `field-key / field / line / add / default` | 自定义字段与扩展区域 | 插槽 |

::: details 完整参数、事件和接入约定

以下内容摘自来源仓库 README，其中的运行目录和验证脚本均指来源仓库。本站启动与示例接入以本页“接入”和技术栈快速开始为准。

适合按 `type` 下发的筛选配置。字段控件在 `fields/` 和 `trees/`。组件不请求接口，也不改传入的 `values`。页面直接传 `items` 和 `:query.sync`。

当前组件的字段按 `key/name/type` 定义，选项通过 `data` 提供。不要将旧 `formHeader`（`propName/itemType`）直接作为 `items`。

#### 基础用法

```vue
<search-form
  :items="items"
  :values="values"
  :hidden-keys="hiddenKeys"
  @change="onChange"
  @check="onCheck"
/>

<!-- 也可以用 query.sync。query 里是提交值，控件回显仍是原值 -->
<search-form :items="items" :query.sync="query" />
```

```js
items: [
  // type 三种写法等价：数字 2、数字字符串 "2"、类型名 "select"
  { key: "status", name: "状态", type: 2, data: [{ label: "待处理", value: 1 }] },
  { key: "tag_name", name: "标签", type: "cascaderMulti", data: [], selectOptionProps: { multiple: true, emitPath: false } },
]
```

`classPrefix` 单独使用时默认 `search-item`。外壳接入旧页面时传 `searchItem`，类名是 `searchItem` 和 `searchItem-字段key`。

#### SearchForm API

#### Attributes

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 字段配置。每一项见下方 Item Attributes | array | `[]` |
| values | 回显值，键是字段 `key`。组件只读。传了某个 key 时，该字段回显以这里为准 | object | `{}` |
| query | 提交数据，配合 `:query.sync`。有函数 `format` 时是格式化后的值。输入过程也会写入当前文本。同时传了 `values` 的 key 时，回显仍看 `values` | object | `{}` |
| hidden-keys / hiddenKeys | 不渲染的字段，匹配 `key`、`id` 或 `name` | array | `[]` |
| loading | 列表加载态 | boolean | `false` |
| closable | 是否显示字段关闭按钮。字段自己的 `closable` 优先 | boolean | `false` |
| class-prefix / classPrefix | 字段根类名前缀 | string | `search-item` |
| remote-query / remoteQuery | `(key, keyword) => Promise<Array>`。远程下拉由页面注入 | function | — |

#### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| change | 值确定。文本和批量输入在失焦或回车时触发 | `{ key, value, display, item }`。`display` 是控件原值，用来回显。`value` 在配置了函数 `format` 时是格式化后的提交数据；树和级联的 `value` 仍是控件原值，格式化结果在 `check.value` 和 `query`。批量确认另有 `type: "dblclick"`、`queryValue` |
| typing | 文本、批量输入按键过程。不表示已提交，也不走 `format` | `{ key, value, item }` |
| check | 树或级联勾选 | `{ key, ids, nodes, item }`。函数 `format` 存在时另有 `value`，入参是 `{ ids, nodes }` |
| name-type-change | 左侧名称类型切换 | `{ item, value }` |
| remove | 点击字段关闭按钮 | 字段 `item` |
| dblclick | 批量输入双击，弹窗打开前 | 字段 `item` |
| focus-date | 日期控件聚焦 | 字段 `item` |

#### Slots

| 名称 | 说明 |
| --- | --- |
| field-字段key | 该字段的自定义控件，优先于 `#field` |
| field | 未内置 type，或没有对应 `field-key` 时使用。参数 `{ item, value }` |
| line | 字段列表末尾、加号之前 |
| add | 加号位置。页面可在这里放自己的添加按钮 |
| default | 紧跟在 `add` 后面，例如重置按钮 |

type 18、19、22 以及未识别的 type 走插槽：

| type | 项目里的控件 |
| --- | --- |
| 18 | deep-convo 会话标签；dev 的日期切换 |
| 19 / 22 | dev 的原因、页签单选 |

#### Item Attributes

`items` 的每一项。项目里原来的 `selectOptionProps`、`treeProps[key]` 可以原样放在 `selectOptionProps` 上。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| key | 字段键，对应 `values` 和事件里的 `key` | string | — |
| name | 左侧蓝字名称，也作为占位文案 | string | — |
| type | 字段类型。`number` 写协议数字，如 `2`。`string` 写数字字符串或类型名，如 `"2"`、`"select"`。三种写法等价，都会收成协议数字。不在类型表里的值原样保留，走插槽 | number / string | — |
| data | 选项或树数据。组件不拉取部门、人员接口 | array | `[]` |
| id / page_search_items_id | 搜索项编号，只参与列表 key | number / string | — |
| closable | 是否可关闭。未传时用组件的 `closable` | boolean | — |
| width | 控件宽度。数字按像素 | number / string | 各类型自己的默认宽度 |
| clearable | 是否可清空 | boolean | `true` |
| labelKey / valueKey | 选项文案和值的字段名 | string | `label` / `value` |
| selectOptionProps | 项目旧配置：`label`、`value`、`multiple`、`emitPath`、`disabledDate`、`pickerOption`、`radioOptions`、`maxLen`、`treeData`、`tree_type` 等 | object | `{}` |
| cascaderProps | 级联的 `props`，优先于 `selectOptionProps` 里的同名项 | object | — |
| nameTypeOptions | 左侧名称类型下拉 | array | — |
| nameTypeValue | 当前名称类型 | string / number | — |
| name_type_key | 名称类型写回的键。外壳重置时使用 | string | — |
| placeholder | 占位文案 | string | `name` |
| remote | 远程下拉。打开后面板里搜索，用法见下方远程搜索 | boolean | `false` |
| remoteMethod | `(keyword) => Promise<Array>`，优先于组件的 `remoteQuery` | function | — |
| filterable | 是否可搜索 | boolean | 远程下拉以及 type 10 默认 `true` |
| allowCreate | 下拉是否允许创建新项 | boolean | `false` |
| disabledDate | 日期禁用函数。日期时间会先收成当天 0 点再判断，因此当天可选 | function | — |
| pickerOptions / pickerOption | 传给日期面板，含 `shortcuts`。其中的 `disabledDate` 同样按天判断 | object | — |
| defaultTime | type 4 的默认时分秒 | array | `['00:00:00', '23:59:59']` |
| defaultValue | 字段还没有值时的初始值。直接写值，可以来自 `computed`。组件拷一份再显示，不改页面上的原数据。有函数 `format` 时，`query` 里是格式化结果，回显仍是这份原值。树和级联保持原值。`values` 或 `query` 里已经有这个键、或用户改过之后，不再覆盖 | any | — |
| defaultValue | 字段还没有值时的初始值。直接写值，可以来自 `computed`。组件拷一份再显示，不改页面上的原数据。有函数 `format` 时，`query` 里是格式化结果，回显仍是这份原值。树和级联保持原值。`values` 或 `query` 里已经有这个键、或用户改过之后，不再覆盖 | any | — |
| format | 自定义提交数据。函数签名是 `(value, item) => any`，返回值作为 `change.value`。树和级联勾选的入参是 `{ ids, nodes }`，返回值在 `check.value`。控件回显仍用原值。字符串只给日期面板做展示格式，不改变提交数据 | function / string | — |
| dateType / valueFormat | 覆盖日期面板类型和提交格式 | string | 随 type |
| treeType / tree_type | type 8 的树种类：`user`、`department`、`custom`。deep 没有该值时外壳不渲染 | string | — |
| nodeKey / labelKey / childrenKey | 树节点编号、文案、子节点字段 | string | 随树类型 |
| leafOnly | 是否只提交叶子 | boolean | type 12 默认 `true` |
| isAllNode | type 13 是否连父节点一起提交 | boolean | `false` |
| needCheckSameNode | 相同值一起勾选 | boolean | 部门树沿用原行为 |
| multiple | 树是否多选。显式 `false` 才是单选 | boolean | `true` |

外壳接入时，函数 `format` 可以写在字段上，也可以写在 `treeProps[key].format`。`defaultValue` 同样可以写在 `treeProps[key].defaultValue`。`changeValue` 收到的是格式化后的值，输入框仍按原值回显。

字段还没有 `values` 和 `query` 时，`defaultValue` 会写入回显，并同步到 `query`。用户改过之后就以用户的值为准。`reset(obj)` 只更新 `obj` 里出现的键，空字符串表示清空，`undefined` 忽略。`resetDefault()` 清空后，参数里没有指定的字段回到 `defaultValue`。不会因此触发 `changeValue`。

type 20 的 `selectOptionProps.defaultValue` 仍只给定「时间种类加日期」的控件初值，不写入 `query`。

```js
computed: {
  items() {
    return [
      { key: "status", name: "状态", type: 2, data: this.statusOptions, defaultValue: this.status },
    ];
  },
},
```

```js
{
  key: "platform_type",
  name: "所属平台",
  type: 3,
  data: [],
  format(value) {
    return Array.isArray(value) ? value.join(",") : value;
  },
}
{
  key: "owner_id",
  name: "使用人",
  type: 8,
  format({ nodes }) {
    return (nodes || []).map((node) => String(node.id).split("-")[1]).join(",");
  },
}
```

#### 远程搜索

用于 type 2、type 3。触发器里不能输入，点开后在下拉里搜索。输入停 300 毫秒后才请求。打开下拉本身不请求。没有匹配项时显示「无匹配数据」。触发器宽度默认 160。有值时悬停出现清空按钮。多选只显示一个标签，其余用 `+ N`。

选项文案会记下来，下次打开即使列表换了，已选值仍能回显。

#### 直接使用 SearchForm

字段设 `remote: true`。请求写在字段的 `remoteMethod`，或组件的 `remote-query`。`remoteMethod` 优先。返回的数组就是选项，每项要有文案字段和值字段，默认 `label`、`value`。

```vue
<search-form
  :items="items"
  :values="values"
  :remote-query="remoteQuery"
  @change="onChange"
/>
```

```js
items: [
  {
    key: "shop_id",
    name: "店铺",
    type: 2,
    remote: true,
    labelKey: "handle",
    valueKey: "id",
    remoteMethod(keyword) {
      return request({
        url: "shop/shop-list",
        method: "get",
        params: { handle: keyword },
      }).then((res) => res.data || []);
    },
  },
]

// 多个远程字段可以共用这一个方法，用 key 区分
remoteQuery(key, keyword) {
  if (key === "owner_id") {
    return request({
      url: "user/get-user-info",
      method: "get",
      params: { name: keyword },
    }).then((res) => res.data || []);
  }
  return [];
}
```

#### 旧页面

本目录不再提供 SearchHost。项目里的 `searchItem` 继续用原来的 `remoteQueryConfig`。SearchForm 用上面的 `remoteMethod` 或 `remote-query`。`isInit: false` 时要等用户在下拉里输入才请求。

```vue
<searchItem
  pageItemId="order.financial_ledger.list"
  :remoteQueryConfig="remoteQueryConfig"
  @changeValue="handleQuery"
/>
```

```js
remoteQueryConfig: {
  owner_id: {
    url: "user/get-user-info",
    method: "get",
    seachFieldName: "name",
    resultFieldName: "data",
    isInit: false,
    value: "user_id",
    label: "user_name",
  },
  shop_id: {
    url: "shop/shop-list",
    method: "get",
    seachFieldName: "handle",
    resultFieldName: "data",
    isInit: false,
    value: "id",
    labelMap: ["handle", "platform_name"],
    labelJoinType: "kuohao",
  },
}
```

`shop_id` 的展示文案会拼成 `handle(platform_name)`。

#### remoteQueryConfig

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| url | 请求地址 | string | — |
| method | 请求方法。`get` 走 query，其余走 body | string | `post` |
| seachFieldName | 关键字参数名。沿用项目里的拼写 | string | `name` |
| otherQueryData | 跟关键字一起带上的固定参数 | object | — |
| resultFieldName | 列表在响应里的字段。`data` 或空表示 `res.data`，其他值表示 `res.data[字段]` | string | `data` |
| isInit | 为 `true` 时，搜索项加载完就用空关键字请求一次 | boolean | `false` |
| value | 选项值字段，写到字段的 `valueKey` | string | `value` |
| label | 选项文案字段。和 `labelMap` 同时存在时，文案用拼出来的 `label` | string | `label` |
| labelMap | 用这些字段拼文案 | array | — |
| labelJoinType | `kuohao` 且正好两项时拼成 `a(b)`，否则用 ` / ` 连接 | string | — |
| formatLabel | `(row) => string`。有则覆盖上面的拼接结果 | function | — |

#### 类型

`type` 的类型是 `number | string`。同一字段可以写成协议数字、数字字符串或下表中的名称，例如单选下拉：`2`、`"2"`、`"select"`。接口下发的搜索项用数字。

| type | 名称 | 控件 | 提交值 |
| --- | --- | --- | --- |
| 1 | text | 输入框 | 字符串。按键走 `typing`，失焦或回车走 `change` |
| 2 | select | 单选下拉 | 选项值 |
| 3 | multiSelect | 多选下拉，折叠标签 | 值数组 |
| 4 | dateTimeRange | 日期时间范围 | `['yyyy-MM-dd HH:mm:ss', ...]`，默认时间 `00:00:00` 到 `23:59:59` |
| 5 | time | 时间 | 时间字符串 |
| 6 | timeRange | 时间范围 | 时间数组 |
| 7 | cascader | 级联 | 路径或编号，见 Cascader |
| 8 | user | 人员、部门或自定义树，由 `tree_type` 决定 | 编号数组，节点在 `check.nodes` |
| 9 | dateRange | 日期范围 | `yyyy-MM-dd` |
| 10 | cascaderNew | 可搜索级联 | 同级联 |
| 11 | cascaderMulti | 多选级联 | `change` 仍是路径或编号，勾选节点在 `check.nodes` |
| 12 | department | 部门树 | 默认叶子编号 |
| 13 | departmentAll | 部门全节点树 | 默认叶子；`isAllNode: true` 含父节点 |
| 14 | batch | 批量输入 | 展示为逗号串。确认后 `change.type` 为 `dblclick`；有 `radioOptions` 时 `queryValue` 是 `{ 选项值: 数组 }` |
| 15 | radio | 单选按钮 | 选项值。无蓝框 |
| 16 | monthRange | 月份范围 | `yyyy-MM` |
| 17 | minMax | 最小最大 | `[min, max]`。只填最大值时最小按 `0`。无额外蓝框 |
| 20 | selectDate | 时间种类加日期 | `[种类, 时间]`。种类来自 `data`，日期配置放在 `selectOptionProps`。这里的 `defaultValue` 只给控件初值，不写入 `query` |
| 21 | customTree | 自定义树 | 编号数组 |

#### Cascader API

对应 type 7、10、11，内部是 Element UI 2 的 `el-cascader`。`change` 保持级联自己的路径或编号，方便回显。勾选节点走 `check`，节点含 `data`、`children`。type 11 原来交给页面的 `getCheckedNodes()` 放在 `check.nodes`。

#### Cascader Attributes

写在字段的 `cascaderProps` 或 `selectOptionProps` 上。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| options / data | 选项数据。优先用组件传入的 `options`，否则用 `item.data` | array | `[]` |
| props.label | 选项文案字段 | string | `label` |
| props.value | 选项值字段 | string | `value` |
| props.children | 子节点字段 | string | `children` |
| props.multiple | 是否多选。type 11 在项目配置里打开 | boolean | `false` |
| props.emitPath | 是否返回完整路径。`false` 时返回节点值 | boolean | `true` |
| props.checkStrictly | 父子是否不关联 | boolean | — |
| filterable | 是否可搜索。type 10 默认开启 | boolean | type 10 为 `true`，其余 `false` |
| clearable | 是否可清空 | boolean | `true` |
| collapse-tags | 多选折叠成标签。组件固定开启 | boolean | `true` |
| placeholder | 占位文案 | string | 字段 `name` |
| width | 控件宽度。样式上最小 220px | number / string | `160` |
| valueWay | `product` 取有父节点的值；`single` 取父级未全选的值。展示用的 `current` 仍是级联原值 | string | — |

`valueWay` 为 `product` 或 `single` 时，`change` 的值改成筛过的编号。控件内部仍用路径回显，避免选择被清空。

#### 标签

多选级联使用 Element UI 的 `collapse-tags`：输入框里收成一个标签，并显示剩余数量。

当前组件基于 Element UI 2，级联组件不提供自定义标签插槽；标签折叠按 `collapse-tags` 配置。

树的多选是另一套展示，见下方树标签。

#### 树

`trees/BaseTreeSelect.vue` 负责弹层、过滤和勾选。业务树只决定提交哪些节点、用哪个编号。数据放在 `item.data`。type 21 和 deep 的自定义树也认 `selectOptionProps.treeData`。

| 组件 | type | 提交 |
| --- | --- | --- |
| UserTree | 8，`treeType` 为空或 `user` | gc、pod、dev 只提交 `is_member`，编号是 `user_id`，节点优先 `union_id`，同一人按 `user_id` 合并。deep 提交 `type === "user"`，节点用 `tree_id`，文案用 `title`。编号 `12-3` 取 `12` |
| DepartmentTree | 12，或 type 8 且 `tree_type` 为 `department` | type 12 默认只提交叶子。type 8 的部门树默认可提交父节点。`leafOnly` 可改写 |
| DepartmentAllTree | 13 | 默认只提交叶子。`isAllNode: true` 时连父节点一起提交。编号默认 `id` |
| CustomTree | 21，或 type 8 且 `tree_type` 为 `custom` | 编号默认 `id`，文案默认 `title`。`defaultProps.lastLevel` 为 true 时只提交叶子。`isSomeValidFn` 返回 false 的节点不提交。纯数字和 `12-3` 会转成数字 |

选中值是编号数组。传入旧的节点对象数组时，按编号回显。`check` 的载荷是 `{ key, ids, nodes, item }`。配置了函数 `format` 时，`check.value` 是 `format({ ids, nodes }, item)` 的返回值，勾选展示仍按编号。`change` 的 `value` 默认是编号数组。

`needCheckSameNode` 沿用部门树里「相同 value 一起勾选」的行为，提交编号仍然是节点 id。

#### 树标签

多选时输入框只显示第一个标签，关闭按钮只去掉这一项；同一人的关联节点会一起去掉。其余数量用 `+N` 表示。没有选中时显示蓝色占位文案。下拉里的搜索框用于过滤节点。

#### BaseTreeSelect Attributes

业务树已经包好这些参数，页面通常只配 `item`。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| data | 树数据 | array | `[]` |
| value | 已选编号或节点 | array / object | — |
| node-key / nodeKey | 节点唯一键 | string | — |
| value-key / valueKey | 提交用的编号字段 | string | — |
| label-key / labelKey | 展示文案字段 | string | — |
| children-key / childrenKey | 子节点字段。也认旧写法 `childern` | string | `children` |
| multiple | 是否多选 | boolean | `true` |
| leaf-only / leafOnly | 是否只保留叶子 | boolean | `false` |
| placeholder | 未选择时的文案 | string | `请选择` |
| link-same / linkSame | 相同关联键是否一起勾选、一起删除 | boolean | `false` |
:::

## 常见问题

字段使用 `key/name/type/data`。`values` 用于外部回显，输入变化、`change/check` 事件与格式化后的 `query.sync` 各有独立职责，按下方完整说明接入；接口转换放在提交边界。

示例代码中的 `@/` 指向已复制源码的根目录；相对引用的模拟数据文件也列在源码面板中。业务接入时替换请求函数，并保留组件约定的输入输出。
