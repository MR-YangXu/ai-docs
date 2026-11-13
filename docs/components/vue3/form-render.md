---
title: formRender 表单配置 · Vue 3
description: Vue 3 formRender 的交互示例、接入方法和接口说明。
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# formRender 表单配置 · Vue 3

<p class="lead">构建并复制字段配置。</p>

<div class="component-meta"><span>Vue 3 · TypeScript</span><span>Element Plus</span><span>源码快照 fc9cc41</span></div>

## 何时使用

适合需要隔离配置对象的页面。它是可选辅助工具，页面也可以直接声明符合组件类型的配置。

## 接入

先按[当前技术栈快速开始](/components/vue3/)准备依赖、样式和源码路径。能力安装标识为 `formRender`：

```sh
npx @agent-xy/ai-code add admin --only formRender --dry-run
npx @agent-xy/ai-code add admin --only formRender
```

## 交互示例

<div class="demo-grid">
<DemoCard stack="vue3" id="FormRenderBasic" title="基础用法" description="最小可运行的 formRender 用法。展开代码查看完整调用。" :height="240"  />
<DemoCard stack="vue3" id="FormRenderAdvanced" title="配置与交互" description="修改副本后原配置保持独立。" :height="240"  />
</div>

## API

| 入口 | 说明 | 默认 / 返回 |
| --- | --- | --- |
| `buildFormItems<Values>(items)` | 接收 `FormItemConfig<Values>[]`，复制配置并保留回调与日期类型 | `FormItemConfig<Values>[]` |
| 字段类型 | 与当前 SearchForm 的字段配置一致；不补充默认字段类型 | 保持输入契约 |

## 常见问题

配置辅助不发请求。远程选项先由页面加载，再交给配置工厂。字段使用 `propName/itemType`，选项等参数见 SearchForm 的字段配置。

示例代码中的 `@/` 指向已复制源码的根目录；相对引用的模拟数据文件也列在源码面板中。业务接入时替换请求函数，并保留组件约定的输入输出。
