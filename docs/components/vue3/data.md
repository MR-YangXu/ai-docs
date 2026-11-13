---
title: data 选项转换 · Vue 3
description: Vue 3 data 的交互示例、接入方法和接口说明。
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# data 选项转换 · Vue 3

<p class="lead">保留选项值类型并映射显示文案。</p>

<div class="component-meta"><span>Vue 3 · TypeScript</span><span>Element Plus</span><span>源码快照 fc9cc41</span></div>

## 何时使用

适合将接口字段转换为 UI 选项。映射保留 value 原始类型，避免数字 0 和布尔 false 被当成缺失值。

## 接入

先按[当前技术栈快速开始](/components/vue3/)准备依赖、样式和源码路径。能力安装标识为 `data`：

```sh
npx @agent-xy/ai-code add admin --only data --dry-run
npx @agent-xy/ai-code add admin --only data
```

## 交互示例

<div class="demo-grid">
<DemoCard stack="vue3" id="DataBasic" title="基础用法" description="最小可运行的 data 用法。展开代码查看完整调用。" :height="240"  />
<DemoCard stack="vue3" id="DataAdvanced" title="配置与交互" description="传入缺少映射字段的数据，查看可见错误。" :height="240"  />
</div>

## API

| 入口 | 说明 | 默认 / 返回 |
| --- | --- | --- |
| `getFiltedOptions(raw, map)` | 将业务数组转换为 {label,value}[]；函数名沿用源码拼写 | 数组 |
| `map.key` | 显示文案的源字段名，转为字符串 | 必填 |
| `map.value` | 选项值的源字段名；保留字符串、数字和布尔值 | 必填 |
| 无效输入 | 字段缺失、非对象或不支持的值类型会抛错 | 调用处处理错误 |

## 常见问题

字段值 0、false 与空字符串会保留；null、对象等不支持的 value 会报错。字段映射应按接口真实结构填写。

示例代码中的 `@/` 指向已复制源码的根目录；相对引用的模拟数据文件也列在源码面板中。业务接入时替换请求函数，并保留组件约定的输入输出。
