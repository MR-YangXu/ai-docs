---
title: tableRender 列配置 · Vue 2
description: Vue 2 tableRender 的交互示例、接入方法和接口说明。
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# tableRender 列配置 · Vue 2

<p class="lead">组合枚举、嵌套字段与复制能力。</p>

<div class="component-meta"><span>Vue 2 · JavaScript</span><span>Element UI</span><span>源码快照 fc9cc41</span></div>

## 何时使用

适合重复出现的枚举显示、嵌套字段与复制操作。业务操作列和特殊内容使用组件插槽或自定义 render。

## 接入

先按[当前技术栈快速开始](/components/vue2/)准备依赖、样式和源码路径。能力安装标识为 `tableRender`：

```sh
npx @agent-xy/ai-code add admin --only tableRender --dry-run
npx @agent-xy/ai-code add admin --only tableRender
```

## 交互示例

<div class="demo-grid">
<DemoCard stack="vue2" id="TableRenderBasic" title="基础用法" description="最小可运行的 tableRender 用法。展开代码查看完整调用。" :height="240" :wide="true" />
<DemoCard stack="vue2" id="TableRenderAdvanced" title="配置与交互" description="点击复制并观察反馈；自定义 render 优先。" :height="240" :wide="true" />
</div>

## API

| 入口 | 说明 | 默认 / 返回 |
| --- | --- | --- |
| `buildColumns(columns, feedback?)` | 返回列配置副本；已有 render 优先 | 数组 |
| `createRender(column, feedback?)` | 构建单元格渲染函数 | `(h, { row }) => VNode` |
| `type` | default、enum、nested、clip；未指定时仍生成文本 render | 每列生成 render |
| `enumList` | 按 value 严格匹配，显示 label | 不改变 0/false 的类型 |
| `path / prop` | `nested` 类型优先按 `path` 读取，未提供时使用 `prop`；支持点分隔路径 | 只读访问 |
| `onCopied / onCopyError` | 复制成功或失败反馈 | 需安全上下文剪贴板能力 |

## 常见问题

当前 Vue 2 工具会为每列生成 render；自定义显示使用 render，formatter 不应与工具生成的 render 同时使用。剪贴板失败通过 onCopyError 提示，避免把复制失败当成成功。

示例代码中的 `@/` 指向已复制源码的根目录；相对引用的模拟数据文件也列在源码面板中。业务接入时替换请求函数，并保留组件约定的输入输出。
