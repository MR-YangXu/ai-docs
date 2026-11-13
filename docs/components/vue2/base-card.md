---
title: BaseCard 内容卡片 · Vue 2
description: Vue 2 BaseCard 的交互示例、接入方法和接口说明。
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# BaseCard 内容卡片 · Vue 2

<p class="lead">组织页面的标题与内容区域。</p>

<div class="component-meta"><span>Vue 2 · JavaScript</span><span>Element UI</span><span>源码快照 fc9cc41</span></div>

## 何时使用

适合将搜索区、统计区和列表区分开组织。它只负责内容容器，页面负责数据和交互。

## 接入

先按[当前技术栈快速开始](/components/vue2/)准备依赖、样式和源码路径。能力安装标识为 `BaseCard`：

```sh
npx @agent-xy/ai-code add admin --only BaseCard --dry-run
npx @agent-xy/ai-code add admin --only BaseCard
```

## 交互示例

<div class="demo-grid">
<DemoCard stack="vue2" id="BaseCardBasic" title="基础用法" description="最小可运行的 BaseCard 用法。展开代码查看完整调用。" :height="240"  />
<DemoCard stack="vue2" id="BaseCardAdvanced" title="配置与交互" description="自定义标题与交互内容。" :height="240"  />
</div>

## API

| 入口 | 说明 | 默认 / 返回 |
| --- | --- | --- |
| `title` 属性 | 字符串标题；未提供标题插槽时显示 | `''` |
| `default` 插槽 | 卡片正文内容 | 无 |
| `title` 插槽 | 自定义标题区域，优先于 `title` 属性 | 无 |

## 常见问题

卡片不会自动加载数据或管理页面状态。复杂标题使用 `title` 具名插槽；未传标题且没有标题插槽时，不渲染标题区域。

示例代码中的 `@/` 指向已复制源码的根目录；相对引用的模拟数据文件也列在源码面板中。业务接入时替换请求函数，并保留组件约定的输入输出。
