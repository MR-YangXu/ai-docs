---
title: BaseCard 内容卡片 · React
description: React BaseCard 的交互示例、接入方法和接口说明。
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# BaseCard 内容卡片 · React

<p class="lead">组织页面的标题与内容区域。</p>

<div class="component-meta"><span>React · TypeScript</span><span>Ant Design</span><span>源码快照 fc9cc41</span></div>

## 何时使用

适合将搜索区、统计区和列表区分开组织。它只负责内容容器，页面负责数据和交互。

## 接入

先按[当前技术栈快速开始](/components/react/)准备依赖、样式和源码路径。能力安装标识为 `BaseCard`：

```sh
npx @agent-xy/ai-code add admin --only BaseCard --dry-run
npx @agent-xy/ai-code add admin --only BaseCard
```

## 交互示例

<div class="demo-grid">
<DemoCard stack="react" id="BaseCardBasic" title="基础用法" description="最小可运行的 BaseCard 用法。展开代码查看完整调用。" :height="240"  />
<DemoCard stack="react" id="BaseCardAdvanced" title="配置与交互" description="自定义标题与交互内容。" :height="240"  />
</div>

## API

| 入口 | 说明 | 默认 / 返回 |
| --- | --- | --- |
| `title` | 可选的 `ReactNode`（可渲染节点），支持文字或 JSX | `undefined` |
| `children` | 可选的 `ReactNode`（可渲染节点），作为卡片正文 | `undefined` |

## 常见问题

卡片基于 Ant Design Card，只负责展示。复杂标题通过 `title` 传入 JSX，正文通过 `children` 传入；数据加载和交互状态由调用组件管理。

示例代码中的 `@/` 指向已复制源码的根目录；相对引用的模拟数据文件也列在源码面板中。业务接入时替换请求函数，并保留组件约定的输入输出。
