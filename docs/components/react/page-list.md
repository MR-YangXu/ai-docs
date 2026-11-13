---
title: usePageList 分页列表 · React
description: React usePageList 的交互示例、接入方法和接口说明。
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# usePageList 分页列表 · React

<p class="lead">管理查询条件、分页、加载与请求竞态。</p>

<div class="component-meta"><span>React · TypeScript</span><span>Ant Design</span><span>源码快照 fc9cc41</span></div>

## 何时使用

适合分页查询与刷新。搜索草稿由输入组件管理，列表保存已提交条件；翻页不会隐式提交草稿。fetchList 必须返回 { list, total }，其他响应字段可以通过 result 读取。

## 接入

先按[当前技术栈快速开始](/components/react/)准备依赖、样式和源码路径。能力安装标识为 `usePageList`：

```sh
npx @agent-xy/ai-code add admin --only usePageList --dry-run
npx @agent-xy/ai-code add admin --only usePageList
```

## 交互示例

<div class="demo-grid">
<DemoCard stack="react" id="PageListBasic" title="基础用法" description="最小可运行的 usePageList 用法。展开代码查看完整调用。" :height="240" :wide="true" />
<DemoCard stack="react" id="PageListAdvanced" title="配置与交互" description="尝试失败重试，以及先慢后快的请求，观察最新结果。" :height="240" :wide="true" />
</div>

## API

| 入口 | 说明 | 默认 / 返回 |
| --- | --- | --- |
| `usePageList(initialQuery, options)` | 创建列表逻辑；`options.initialQuery` 是重置基线 | 在函数组件顶层调用 |
| `fetchList(query, signal)` | 调用项目请求层，显式映射业务响应 | Promise&lt;{ list, total }&gt; |
| `keepPrevious` | 新请求期间同时保留上次列表、总数与完整响应 | false |
| `onSubmit(partial)` | 合并提交条件并回到第一页；filters 对象按提交整体替换 | Promise&lt;Result 或 undefined&gt; |
| `handlePageChange({pageNum})` | 切换页码，继续使用已提交条件 | Promise |
| `handleSizeChange({pageSize})` | 修改每页数量并回到第一页 | Promise |
| `getData()` | 刷新当前查询；最新失败经 error/onError 暴露 | 失败返回 undefined |
| `reset()` | 恢复初始查询并清除结果；通常重新请求 | isRefreshData=false 时不请求 |
| `restorePagination()` / `persistKey` | 显式恢复可选分页记忆，只保存页码和数量 | 默认不启用 |
| `result / tableData / total / loading / error` | 完整响应、列表、数量与请求状态 | 每次有效响应同步更新 |

在函数组件顶层调用。`query/result/tableData/total/loading/error/pageParams` 均为当前渲染可直接读取的状态值；Hook（逻辑钩子）订阅控制器状态并触发渲染，卸载时自动取消未完成请求。

## 常见问题

查询失败不会返回演示数据。显示 error 并提供 getData 重试；旧成功、旧失败和卸载后的响应不会覆盖最新状态。接口字段不同应在 fetchList 边界映射。

示例代码中的 `@/` 指向已复制源码的根目录；相对引用的模拟数据文件也列在源码面板中。业务接入时替换请求函数，并保留组件约定的输入输出。
