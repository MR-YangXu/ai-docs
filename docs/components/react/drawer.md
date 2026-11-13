---
title: Drawer 抽屉 · React
description: React Drawer 的交互示例、接入方法和接口说明。
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# Drawer 抽屉 · React

<p class="lead">在侧边查看详情或完成操作。</p>

<div class="component-meta"><span>React · TypeScript</span><span>Ant Design</span><span>源码快照 fc9cc41</span></div>

## 何时使用

适合查看详情或在保留列表上下文的情况下编辑内容。用稳定的实体标识控制内容切换，避免将上一个实体的草稿带入。

## 接入

先按[当前技术栈快速开始](/components/react/)准备依赖、样式和源码路径。能力安装标识为 `Drawer`：

```sh
npx @agent-xy/ai-code add admin --only Drawer --dry-run
npx @agent-xy/ai-code add admin --only Drawer
```

## 交互示例

<div class="demo-grid">
<DemoCard stack="react" id="DrawerBasic" title="基础用法" description="最小可运行的 Drawer 用法。展开代码查看完整调用。" :height="480" :wide="true" />
<DemoCard stack="react" id="DrawerAdvanced" title="配置与交互" description="异步提交与失败状态；关闭失败开关后重试。" :height="480" :wide="true" />
</div>

## API

| 入口 | 说明 | 默认 / 返回 |
| --- | --- | --- |
| `open / onOpenChange` | 受控可见性及状态更新回调 | 两项必填 |
| `title` | 标题，支持 ReactNode（可渲染节点） | `undefined` |
| `width` | 宽度，字符串或数字 | `480` |
| `onConfirm()` | 返回 void 或 Promise；成功按 `closeOnConfirm` 决定是否关闭，失败保留输入 | 可选 |
| `showConfirm / showCancel` | 显示默认确认 / 取消按钮 | false / false |
| `confirmText / cancelText` | 操作按钮文字 | 确定 / 取消 |
| `showClose / closeOnClickModal` | 关闭按钮 / 点击遮罩关闭 | true / false |
| `destroyOnClose` | 关闭后销毁内容 | true |
| `onCancel / onClose` | 取消 / 关闭回调 | 可选 |
| `onError` | 提交失败反馈 | Error |
| `footer` | 替换操作区 | 默认按钮组 |
| `closeOnConfirm / confirmDisabled` | 控制成功后关闭 / 禁止确认 | true / false |
| `onClosed` | 关闭动画完成后通知 | 可选 |

## 常见问题

当前公开能力是组件式抽屉。关闭期间的异步完成不会再次提交旧状态，业务详情请求仍需按实体清理。

示例代码中的 `@/` 指向已复制源码的根目录；相对引用的模拟数据文件也列在源码面板中。业务接入时替换请求函数，并保留组件约定的输入输出。
