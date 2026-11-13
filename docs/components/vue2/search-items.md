---
title: createSearchItems 动态筛选项 · Vue 2
description: Vue 2 createSearchItems 的交互示例、接入方法和接口说明。
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# createSearchItems 动态筛选项 · Vue 2

<p class="lead">加载、增删和保存服务端筛选配置。</p>

<div class="component-meta"><span>Vue 2 · JavaScript</span><span>Element UI</span><span>源码快照 fc9cc41</span></div>

## 何时使用

适合由后端下发筛选项配置的 Vue 2 页面。请求和保存函数由调用者提供，SearchForm 只负责显示字段。

## 接入

先按[当前技术栈快速开始](/components/vue2/)准备依赖、样式和源码路径。能力安装标识为 `useSearchItems`：

```sh
npx @agent-xy/ai-code add admin --only useSearchItems --dry-run
npx @agent-xy/ai-code add admin --only useSearchItems
```

命令标识是 `useSearchItems`，实际源码导出是 `createSearchItems`。逻辑对象在组件实例内创建，`beforeDestroy` 中调用 `dispose()`。

## 交互示例

<div class="demo-grid">
<DemoCard stack="vue2" id="SearchItemsBasic" title="基础用法" description="最小可运行的 createSearchItems 用法。展开代码查看完整调用。" :height="240" :wide="true" />
<DemoCard stack="vue2" id="SearchItemsAdvanced" title="配置与交互" description="增加、移除筛选项并保存，观察服务端配置状态。" :height="240" :wide="true" />
</div>

## API

| 入口 | 说明 | 默认 / 返回 |
| --- | --- | --- |
| `createSearchItems(pageItemId, options)` | 管理某个页面的动态筛选项 | 按实例创建 |
| `fetchItems(pageItemId)` | 返回 page_items、user_page_items；也接受 data 包裹 | 必填 |
| `saveItems(ids, pageItemId)` | 保存用户选择的 page_search_items_id 数组 | 可选 Promise |
| `initialValues / hiddenKeys` | 初始查询值和隐藏字段 | {} / [] |
| `load()` | 加载并更新配置；忽略旧响应 | 失败写入 state.error |
| `state` | items、userItems、visibleItems、values、hiddenKeys、loading、error | 响应式对象 |
| `patchValues(patch)` | 更新字段；逗号分隔日期键拆成起止键，并保留原键 | void |
| `resetValues(next?) / setHidden(keys)` | 恢复值 / 更新隐藏字段 | void |
| `add(item) / remove(item)` | 保存配置后重新加载；保存失败会拒绝 | Promise |
| `dispose()` | 使未完成请求失效 | beforeDestroy 调用 |

## 常见问题

配置中的 page_search_items_id 用于保存；key 用于字段值。它们是不同职责。add/remove 的保存失败需要调用方捕获。

示例代码中的 `@/` 指向已复制源码的根目录；相对引用的模拟数据文件也列在源码面板中。业务接入时替换请求函数，并保留组件约定的输入输出。
