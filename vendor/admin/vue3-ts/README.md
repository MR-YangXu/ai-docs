# Vue 3 后台源码与示例

组件以 Vue 3.5.25、Element Plus 2.11.5 验证，使用泛型单文件组件和显式组件导入。完整依赖版本见 package.json。

[安装、示例启动与接口接入操作指南](../README.md)

- [SearchForm 参数与使用](components/SearchForm/README.md)
- [DataTable 参数与使用](components/DataTable/README.md)
- [订单管理](examples/pages/orders/index.vue)：搜索、统计、详情和导出。
- [用户管理](examples/pages/users/index.vue)：接口选项、分页、异步操作和历史记录。

## 最小调用

```vue
<template>
  <SearchForm :form-header="fields" :form-model="initial" @submit-form="search" @reset-form="search" />
  <p>已提交条件：{{ filters.keyword }}</p>
  <DataTable row-key="id" :table-columns="columns" :table-data="[{ id: 1, name: '演示行' }]" />
</template>
<script setup lang="ts">
import { ref } from 'vue';
import SearchForm from './components/SearchForm/index.vue';
import DataTable from './components/DataTable/index.vue';
import type { FormItemConfig } from './components/SearchForm/types';
import type { TableColumn } from './components/DataTable/types';
interface Filters { keyword?: string }
const initial: Filters = {};
const fields: FormItemConfig<Filters>[] = [{ propName: 'keyword', itemType: 'text', labelName: '名称' }];
const columns: TableColumn<{ id: number; name: string }>[] = [{ prop: 'name', label: '名称' }];
const filters = ref<Partial<Filters>>({});
function search(values: Partial<Filters>) { filters.value = values; }
</script>
```

真实列表使用接口结果，完整示例展示 API 模块和请求失败处理，不在失败时回退到示例数组。

## 配套能力

BaseCard、Dialog、Drawer 仍可按需安装。组件式弹窗的 `onConfirm` 返回 Promise，失败保留输入并报告错误；不要把普通确认事件当成可等待异步回调。函数式 Dialog 继承宿主上下文，三框架 `Dialog.confirm` 返回 `Promise<boolean>`。首版不提供函数式抽屉。

`formRender` / `tableRender` 是可选配置辅助，不是必需封装。字段与列类型直接来自组件；`buildColumns` 不覆盖调用者的 render 或 formatter。默认值只用于缺失数据，保留 0、false 和空字符串。

## 示例目录与阅读顺序

订单、用户页面采用相同职责划分：

```text
pages/orders 或 pages/users/
├── index.vue          # 页面编排：公共 hooks、事件处理、弹窗身份
├── index.scss        # 页面私有样式
├── config/
│   ├── index.ts      # 聚合导出
│   ├── searchForm.ts # 初值与 buildFormItems 字段配置
│   ├── columns.ts    # buildColumns 列配置
│   └── data.ts       # 枚举引用、操作命令与选项
└── components/       # 详情、业务表单及共用历史展示
```

先读 [用户页面](examples/pages/users/index.vue)，再看 [搜索配置](examples/pages/users/config/searchForm.ts)、[列配置](examples/pages/users/config/columns.ts) 和 [操作命令](examples/pages/users/config/data.ts)。复制、枚举和嵌套取值使用列构造能力；操作区保留自定义单元格。远程选项由页面加载后传入配置工厂，配置文件不发请求。

[订单页面](examples/pages/orders/index.vue) 展示列表统计、日期和导出；[订单详情](examples/pages/orders/components/OrderDetailDrawer.vue) 使用 BaseDrawer，打开即显示加载或错误重试。两页使用 BaseCard 组织搜索和列表区域。

## 公共 hooks 如何组合

| 能力 | 页面使用方式 | 状态与失败行为 |
| --- | --- | --- |
| `usePageList<Q, Row, Result>` | 搜索调用 `onSubmit({ filters })`，重置调用 `reset()`，分页调用 `handlePageChange` / `handleSizeChange` | 保存已提交条件、列表、完整响应、分页、loading、error；`getData()` 重试当前查询 |
| `useSelectOptions(fetcher, map)` | 站点、国家、订阅类型各一个实例；返回选项传入 `searchFields` | 自动初次加载；独立 loading/error/reload，取消旧请求与卸载请求 |
| `useAsyncListAction(refresh?)` | `exec(signal => api.members.action(uuid, action, signal), '操作成功', uuid)` | 同键重复操作共用 Promise，成功后刷新；失败拒绝，由调用方展示；卸载取消 |

`usePageList` 第三个泛型默认为 `PageResult<Row>`；订单传入 `OrderResult`，从 `result.summary` 取得统计。列表、总数和完整响应原子更新，过期响应不会覆盖它们。默认新请求清空三者；`keepPrevious: true` 同时保留三者，加载和错误状态仍需显示。重置清空结果并恢复初始查询；`isRefreshData: false` 时不自动请求。

搜索组件维护草稿，页面每次提交整体替换 `filters`；翻页和导出使用已提交条件。修改草稿不会查询，重置恢复初始化值；切换初始化实体使用组件 `key` 重建。页面初次加载显式调用 `getData()`，公共 hook 不隐藏页面初始化编排。

业务操作失败在页面显示错误，在弹窗中交给 BaseDialog 显示；捕获后通过从 `hooks/useAsyncListAction` 导入的 `isAbortError(error)` 忽略取消。旧回调即使没有响应取消信号，也不会提示或刷新。`pendingKeys` 用于禁用操作入口；不接收参数的旧任务函数仍可使用。

[详情请求工具](examples/hooks/useRemoteResource.ts) 只负责独立资源的加载、重试和生命周期，供订单详情、两个用户表单共用。查询条件、分页和弹窗开关仍保留在页面。

## 独立业务表单与弹窗

- [AddExpireTime](examples/pages/users/components/AddExpireTime.vue)：增加方式、天数校验和提交。
- [RenewalDiscount](examples/pages/users/components/RenewalDiscount.vue)：折扣模式、比例、原因校验和提交。
- [MemberHistory](examples/pages/users/components/MemberHistory.vue)：共用详情和操作记录展示，只接收数据，不发请求。

两个表单各自调用 `useAsyncListAction`，成功刷新详情与页面列表，重置输入并保持弹窗打开，以便查看最新记录。失败保留输入；用户身份变化通过 `key` 销毁旧表单、取消旧请求。业务成功后的列表刷新失败由列表错误区提供重试，避免将已经成功的操作再次提交。

`BaseDialog` 新增以下契约（声明式调用不需要额外安装弹窗服务）：

| 接口 | 默认值 | 用途 |
| --- | --- | --- |
| `closeOnConfirm` | `true` | 确认成功自动关闭；两个业务表单使用 `false` 继续展示历史 |
| `confirmDisabled` | `false` | 详情未加载或刷新中禁用确认按钮和实例确认入口 |
| 实例 `confirm()` | — | 与按钮共享同一个异步确认入口；表单 submit 捕获后调用，支持回车且防重复提交 |
| `onConfirm` | — | 返回校验与业务提交的 Promise，拒绝时保留弹窗并显示错误 |

React 使用 `DialogHandle` 引用类型；Vue 使用组件实例类型。确认进行中禁止关闭与重复确认。校验失败必须拒绝，不能返回成功导致弹窗误关闭。

Vue 在 `onMounted` 加载列表，通过 `computed` 组合远程选项与字段，解构列表返回的引用供模板自动解包。[订单日期配置](examples/pages/orders/config/searchForm.ts) 明确设置 `format` 与 `valueFormat`，接口直接接收约定字符串。
