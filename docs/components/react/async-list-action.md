---
title: useAsyncListAction 异步操作 · React
description: React useAsyncListAction 的交互示例、接入方法和接口说明。
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# useAsyncListAction 异步操作 · React

<p class="lead">处理操作去重、成功刷新与资源释放。</p>

<div class="component-meta"><span>React · TypeScript</span><span>Ant Design</span><span>源码快照 fc9cc41</span></div>

## 何时使用

适合启用、停用、删除等列表操作。使用稳定的业务主键作为操作键，让同一行的重复操作共用请求。

## 接入

先按[当前技术栈快速开始](/components/react/)准备依赖、样式和源码路径。能力安装标识为 `useAsyncListAction`：

```sh
npx @agent-xy/ai-code add admin --only useAsyncListAction --dry-run
npx @agent-xy/ai-code add admin --only useAsyncListAction
```

## 交互示例

<div class="demo-grid">
<DemoCard stack="react" id="AsyncListActionBasic" title="基础用法" description="最小可运行的 useAsyncListAction 用法。展开代码查看完整调用。" :height="240" :wide="true" />
<DemoCard stack="react" id="AsyncListActionAdvanced" title="配置与交互" description="连续执行同键操作，观察实际调用次数与成功刷新。" :height="240" :wide="true" />
</div>

## API

| 入口 | 说明 | 默认 / 返回 |
| --- | --- | --- |
| `refresh?` | 成功后调用，可返回 Promise | 可选 |
| `exec(task, success?, key?)` | task 接收 AbortSignal；同键共享进行中的 Promise | key=default |
| `success` | 成功提示文字，或根据返回值生成提示的函数 | 可选 |
| `pendingKeys` | 当前进行中的操作键；本次渲染的状态数组 | `string[]`，初始为 `[]` |
| 错误 | exec 保留拒绝，调用处 try/catch 处理 | 成功才刷新 |
| `isAbortError(error)` | 判断卸载或取消产生的错误 | boolean |

## 常见问题

同键请求只执行一次；不同操作键可以并行。业务错误由调用方展示，取消错误可通过 `isAbortError` 区分。在 Ant Design 的 `App` 上下文内调用，Hook（逻辑钩子）自动更新状态并在卸载时取消未完成操作。`isAbortError` 从当前 Hook 文件导入。

示例代码中的 `@/` 指向已复制源码的根目录；相对引用的模拟数据文件也列在源码面板中。业务接入时替换请求函数，并保留组件约定的输入输出。
