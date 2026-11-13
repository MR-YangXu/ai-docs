---
title: Dialog 对话框 · React
description: React Dialog 的交互示例、接入方法和接口说明。
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# Dialog 对话框 · React

<p class="lead">确认操作、编辑内容与异步提交。</p>

<div class="component-meta"><span>React · TypeScript</span><span>Ant Design</span><span>源码快照 fc9cc41</span></div>

## 何时使用

适合需要用户确认或提交的独立任务。提交函数返回 Promise，失败时保持弹层与输入，页面负责业务请求。

## 接入

先按[当前技术栈快速开始](/components/react/)准备依赖、样式和源码路径。能力安装标识为 `Dialog`：

```sh
npx @agent-xy/ai-code add admin --only Dialog --dry-run
npx @agent-xy/ai-code add admin --only Dialog
```

## 交互示例

<div class="demo-grid">
<DemoCard stack="react" id="DialogBasic" title="基础用法" description="最小可运行的 Dialog 用法。展开代码查看完整调用。" :height="480" :wide="true" />
<DemoCard stack="react" id="DialogAdvanced" title="配置与交互" description="首次模拟提交失败；关闭失败开关后重试，输入仍保留。" :height="480" :wide="true" />
<DemoCard stack="react" id="DialogService" title="函数式调用" description="继承调用上下文，确认返回布尔值，实例支持更新与关闭。" :height="480" :wide="true" />
</div>

## API

| 入口 | 说明 | 默认 / 返回 |
| --- | --- | --- |
| `open / onOpenChange` | 受控可见性及状态更新回调 | 两项必填 |
| `title` | 标题，支持 ReactNode（可渲染节点） | `undefined` |
| `width` | 宽度，字符串或数字 | 未指定，沿用 Ant Design Modal |
| `onConfirm()` | 返回 void 或 Promise；成功按 `closeOnConfirm` 决定是否关闭，失败保留输入 | 可选 |
| `showConfirm / showCancel` | 显示默认确认 / 取消按钮 | true / true |
| `confirmText / cancelText` | 操作按钮文字 | 确定 / 取消 |
| `showClose / closeOnClickModal` | 关闭按钮 / 点击遮罩关闭 | true / false |
| `destroyOnClose` | 关闭后销毁内容 | true |
| `onCancel / onClose` | 取消 / 关闭回调 | 可选 |
| `onError` | 提交失败反馈 | Error |
| `footer` | 替换操作区 | 默认按钮组 |
| `closeOnConfirm / confirmDisabled` | 控制成功后关闭 / 禁止确认 | true / false |
| `onClosed` | 关闭动画完成后通知 | 可选 |
| `ref.confirm()` | 手动触发相同的异步确认流程 | `Promise<void>` |

### 函数式调用

`showDialog` 接收字符串或选项对象。对象中 `content` 是正文，其余标题、尺寸、按钮和异步回调沿用组件约定。宽度未指定时沿用 Ant Design Modal。`Dialog.component` 传入自定义组件及其 props（属性），默认不显示确认和取消按钮。

`useDialog()` 返回 `{ showDialog, Dialog }`，在 Provider 外调用会抛错。

React 使用 DialogProvider 包裹调用区域，在其后代中调用 useDialog。Provider 卸载时清理弹窗。

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
