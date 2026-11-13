---
title: useSelectOptions 异步选项 · React
description: React useSelectOptions 的交互示例、接入方法和接口说明。
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# useSelectOptions 异步选项 · React

<p class="lead">加载远程选项并处理请求状态。</p>

<div class="component-meta"><span>React · TypeScript</span><span>Ant Design</span><span>源码快照 fc9cc41</span></div>

## 何时使用

适合远程下拉选项。不同选项源分别创建实例，分别展示加载和错误状态。

## 接入

先按[当前技术栈快速开始](/components/react/)准备依赖、样式和源码路径。能力安装标识为 `useSelectOptions`：

```sh
npx @agent-xy/ai-code add admin --only useSelectOptions --dry-run
npx @agent-xy/ai-code add admin --only useSelectOptions
```

## 交互示例

<div class="demo-grid">
<DemoCard stack="react" id="SelectOptionsBasic" title="基础用法" description="最小可运行的 useSelectOptions 用法。展开代码查看完整调用。" :height="240" :wide="true" />
<DemoCard stack="react" id="SelectOptionsAdvanced" title="配置与交互" description="切换失败开关后重新加载，观察失败和恢复。" :height="240" :wide="true" />
</div>

## API

| 入口 | 说明 | 默认 / 返回 |
| --- | --- | --- |
| `useSelectOptions(fetcher,map)` | 按实例创建；挂载后自动加载 | 选项状态 |
| `fetcher(signal)` | 请求返回数组；透传 AbortSignal | Promise&lt;Row[]&gt; |
| `map(row)` | 映射为 {label,value} | value 保留原类型 |
| `options` | 当前选项列表 | [] |
| `loading / error` | 当前请求状态；失败保留旧选项 | true / null |
| `reload()` | 取消上次请求并重新加载；错误写入 error | Promise&lt;void&gt; |

## 常见问题

在函数组件顶层调用，挂载后自动首次加载。直接读取 `options/loading/error` 作为本次渲染状态；调用 `reload()` 重试，失败写入 `error` 并保留旧选项。卸载时自动取消请求，旧响应不会覆盖新结果。

示例代码中的 `@/` 指向已复制源码的根目录；相对引用的模拟数据文件也列在源码面板中。业务接入时替换请求函数，并保留组件约定的输入输出。
