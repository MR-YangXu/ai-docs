---
title: createSelectOptions 异步选项 · Vue 2
description: Vue 2 createSelectOptions 的交互示例、接入方法和接口说明。
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# createSelectOptions 异步选项 · Vue 2

<p class="lead">加载远程选项并处理请求状态。</p>

<div class="component-meta"><span>Vue 2 · JavaScript</span><span>Element UI</span><span>源码快照 fc9cc41</span></div>

## 何时使用

适合远程下拉选项。不同选项源分别创建实例，分别展示加载和错误状态。

## 接入

先按[当前技术栈快速开始](/components/vue2/)准备依赖、样式和源码路径。能力安装标识为 `useSelectOptions`：

```sh
npx @agent-xy/ai-code add admin --only useSelectOptions --dry-run
npx @agent-xy/ai-code add admin --only useSelectOptions
```

命令标识是 `useSelectOptions`，实际源码导出是 `createSelectOptions`。逻辑对象在组件实例内创建，`beforeDestroy` 中调用 `dispose()`。

::: info 配置协议
当前 createSelectOptions 接收旧的 propName/optionsArr 字段配置。新 SearchForm 使用 key/data；下方示例独立展示旧协议，新的远程字段接入见 [SearchForm](/components/vue2/search-form#交互示例)。
:::

## 交互示例

<div class="demo-grid">
<DemoCard stack="vue2" id="SelectOptionsBasic" title="基础用法" description="最小可运行的 createSelectOptions 用法。展开代码查看完整调用。" :height="240" :wide="true" />
<DemoCard stack="vue2" id="SelectOptionsAdvanced" title="配置与交互" description="切换失败开关后重新加载，观察失败和恢复。" :height="240" :wide="true" />
</div>

## API

| 入口 | 说明 | 默认 / 返回 |
| --- | --- | --- |
| `createSelectOptions(formHeader)` | 按 propName 找字段，写入 optionsArr | 控制器 |
| `setFieldOptions(field,raw,map)` | 同步映射选项；使该字段旧请求失效 | void |
| `loadFieldOptions(field,fetcher,map)` | 异步加载；只写入该字段最新响应 | Promise&lt;void&gt; |
| `map` | {key: 显示字段名, value: 值字段名} | 必填 |
| `dispose()` | 使后续请求结果失效 | beforeDestroy 调用 |

## 常见问题

控制器不会自动发起请求，也不提供加载和错误状态。调用 `loadFieldOptions` 时由页面维护 loading，并捕获最新请求的拒绝；失败保留原有选项。通过 `formHeader` 中字段的 `propName` 定位，结果写入 `optionsArr`；销毁时调用 `dispose()`，使未完成结果失效。

示例代码中的 `@/` 指向已复制源码的根目录；相对引用的模拟数据文件也列在源码面板中。业务接入时替换请求函数，并保留组件约定的输入输出。
