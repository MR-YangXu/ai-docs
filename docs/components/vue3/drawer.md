---
title: Drawer 抽屉 · Vue 3
description: Vue 3 Drawer 的交互示例、接入方法和接口说明。
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# Drawer 抽屉 · Vue 3

<p class="lead">在侧边查看详情或完成操作。</p>

<div class="component-meta"><span>Vue 3 · TypeScript</span><span>Element Plus</span><span>源码快照 fc9cc41</span></div>

## 何时使用

适合查看详情或在保留列表上下文的情况下编辑内容。用稳定的实体标识控制内容切换，避免将上一个实体的草稿带入。

## 接入

先按[当前技术栈快速开始](/components/vue3/)准备依赖、样式和源码路径。能力安装标识为 `Drawer`：

```sh
npx @agent-xy/ai-code add admin --only Drawer --dry-run
npx @agent-xy/ai-code add admin --only Drawer
```

## 交互示例

<div class="demo-grid">
<DemoCard stack="vue3" id="DrawerBasic" title="基础用法" description="最小可运行的 Drawer 用法。展开代码查看完整调用。" :height="480" :wide="true" />
<DemoCard stack="vue3" id="DrawerAdvanced" title="配置与交互" description="异步提交与失败状态；关闭失败开关后重试。" :height="480" :wide="true" />
</div>

## API

| 入口 | 说明 | 默认 / 返回 |
| --- | --- | --- |
| `modelValue / update:modelValue` | 受控可见性；通过 `v-model` 绑定 | false |
| `title` | 字符串标题 | `''` |
| `size` | 抽屉尺寸，字符串或数字 | `'480px'` |
| `onConfirm()` | 返回 void 或 Promise；成功关闭，失败保留输入 | 可选 |
| `showConfirm / showCancel` | 显示默认确认 / 取消按钮 | false / false |
| `confirmText / cancelText` | 操作按钮文字 | 确定 / 取消 |
| `showClose / closeOnClickModal` | 关闭按钮 / 点击遮罩关闭 | true / false |
| `destroyOnClose` | 关闭后销毁内容 | true |
| `onCancel / onClose` | 取消 / 关闭回调 | 可选 |
| `error` 事件 | 提交失败反馈 | Error |
| `footer` 插槽 | 替换操作区 | 默认按钮组 |
| `closed` / `error` | 关闭动画完成 / 提交失败事件 | 通知 / 错误对象 |
| `direction` / `header` 插槽 | 抽屉方向 / 自定义标题 | rtl / 标题文字 |

## 常见问题

当前公开能力是组件式抽屉。关闭期间的异步完成不会再次提交旧状态，业务详情请求仍需按实体清理。

示例代码中的 `@/` 指向已复制源码的根目录；相对引用的模拟数据文件也列在源码面板中。业务接入时替换请求函数，并保留组件约定的输入输出。
