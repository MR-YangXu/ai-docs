---
title: Dialog 对话框 · Vue 2
description: Vue 2 Dialog 的交互示例、接入方法和接口说明。
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# Dialog 对话框 · Vue 2

<p class="lead">确认操作、编辑内容与异步提交。</p>

<div class="component-meta"><span>Vue 2 · JavaScript</span><span>Element UI</span><span>源码快照 fc9cc41</span></div>

## 何时使用

适合需要用户确认或提交的独立任务。提交函数返回 Promise，失败时保持弹层与输入，页面负责业务请求。

## 接入

先按[当前技术栈快速开始](/components/vue2/)准备依赖、样式和源码路径。能力安装标识为 `Dialog`：

```sh
npx @agent-xy/ai-code add admin --only Dialog --dry-run
npx @agent-xy/ai-code add admin --only Dialog
```

## 交互示例

<div class="demo-grid">
<DemoCard stack="vue2" id="DialogBasic" title="基础用法" description="最小可运行的 Dialog 用法。展开代码查看完整调用。" :height="480" :wide="true" />
<DemoCard stack="vue2" id="DialogAdvanced" title="配置与交互" description="首次模拟提交失败；关闭失败开关后重试，输入仍保留。" :height="480" :wide="true" />
<DemoCard stack="vue2" id="DialogService" title="函数式调用" description="继承调用上下文，确认返回布尔值，实例支持更新与关闭。" :height="480" :wide="true" />
</div>

## API

| 入口 | 说明 | 默认 / 返回 |
| --- | --- | --- |
| `value / input` | 受控可见性；通过 `v-model` 绑定 | false |
| `title` | 字符串标题 | `undefined` |
| `width` | 宽度，字符串或数字 | `'50%'` |
| `onConfirm()` | 返回 void 或 Promise；成功关闭，失败保留输入 | 可选 |
| `showConfirm / showCancel` | 显示默认确认 / 取消按钮 | true / true |
| `confirmText / cancelText` | 操作按钮文字 | 确定 / 取消 |
| `showClose / closeOnClickModal` | 关闭按钮 / 点击遮罩关闭 | true / false |
| `destroyOnClose` | 关闭后销毁内容 | true |
| `onCancel / onClose` | 取消 / 关闭回调 | 可选 |
| `error` 事件 | 提交失败反馈 | Error |
| `footer` 插槽 | 替换操作区 | 默认按钮组 |
| `confirm / cancel / close / closed` | 确认成功、取消、关闭与动画完成事件 | 通知 |
| `ref.close()` / `ref.confirm()` | 关闭 / 触发异步确认 | `void` / `Promise<void>` |

### 函数式调用

`showDialog` 接收字符串或选项对象。对象中 `content` 是正文，其余标题、尺寸、按钮和异步回调沿用组件约定。函数式服务默认标题为“提示”，宽度沿用组件的 `'50%'`。`Dialog.component` 传入自定义组件及其 props（属性），默认不显示确认和取消按钮。

`createDialogService` 返回 `{ showDialog, Dialog, dispose }`；`dispose()` 关闭当前服务创建的全部弹窗。

使用 `createDialogService(this)` 绑定当前组件实例，继承调用上下文。服务已监听该实例的 `beforeDestroy` 自动清理，也可显式调用 `dispose()`。应用入口可注册 `AdminDialog` 插件。

| 入口 | 说明 | 默认 / 返回 |
| --- | --- | --- |
| `Dialog.alert(content,title?)` | 显示提示 | DialogInstance |
| `Dialog.confirm(content,title?)` | 确认 true；取消、关闭、卸载 false | Promise&lt;boolean&gt; |
| `Dialog.component(component,props)` | 显示自定义组件 | DialogInstance |
| `showDialog(options)` | 创建弹层 | `{ close, update }` |
| `instance.update(patch) / close()` | 更新配置 / 关闭当前实例 | void |

## 常见问题

普通事件通知不能代替可等待的 onConfirm。函数式确认取消或关闭时返回 false；提交成功后返回 true。

示例代码中的 `@/` 指向已复制源码的根目录；相对引用的模拟数据文件也列在源码面板中。业务接入时替换请求函数，并保留组件约定的输入输出。
