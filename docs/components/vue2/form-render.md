---
title: formRender 表单配置 · Vue 2
description: Vue 2 formRender 的交互示例、接入方法和接口说明。
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# formRender 表单配置 · Vue 2

<p class="lead">构建并复制字段配置。</p>

<div class="component-meta"><span>Vue 2 · JavaScript</span><span>Element UI</span><span>源码快照 fc9cc41</span></div>

## 何时使用

适合需要隔离配置对象的页面。它是可选辅助工具，页面也可以直接声明符合组件类型的配置。

## 接入

先按[当前技术栈快速开始](/components/vue2/)准备依赖、样式和源码路径。能力安装标识为 `formRender`：

```sh
npx @agent-xy/ai-code add admin --only formRender --dry-run
npx @agent-xy/ai-code add admin --only formRender
```

::: info 配置协议
当前 formRender 生成旧 formHeader 格式，不应直接传给新 SearchForm 的 items。新字段请按 key/name/type 定义。
:::

## 交互示例

<div class="demo-grid">
<DemoCard stack="vue2" id="FormRenderBasic" title="基础用法" description="最小可运行的 formRender 用法。展开代码查看完整调用。" :height="240"  />
<DemoCard stack="vue2" id="FormRenderAdvanced" title="配置与交互" description="修改副本后原配置保持独立。" :height="240"  />
</div>

## API

| 入口 | 说明 | 默认 / 返回 |
| --- | --- | --- |
| `buildFormItems(items)` | 接收旧 `formHeader` 配置，逐项复制；保留回调与日期类型 | 独立配置数组 |
| `propName / optionsArr` | 旧字段名 / 选项数组，保留输入内容 | 按调用方配置 |
| `itemType` | 未指定时补充旧字段类型 | `'selectOne'` |
| `clearable / width` | 未指定时补充可清空与宽度 | `true / '200px'` |

## 常见问题

配置辅助不发请求，显式传入的字段值优先于默认值。该工具使用旧 `formHeader` 协议，不能将结果直接作为新 SearchForm 的 `items`；新字段应按 `key/name/type/data` 声明。

示例代码中的 `@/` 指向已复制源码的根目录；相对引用的模拟数据文件也列在源码面板中。业务接入时替换请求函数，并保留组件约定的输入输出。
