---
title: 06 · 根据图片生成页面
description: 把订单管理截图和一段短提示词交给 AI，按项目规则生成页面，再亲手验证。
pageClass: prompt-page
prev:
  text: 05 · 完善项目档案
  link: /tutorial/project-rules
next:
  text: 复制订单号
  link: /examples/query-first-step
---

<script setup>
import { withBase } from 'vitepress'
</script>

<p class="page-kicker">动手教程 / 06</p>

# 给 AI 一张图，按现有规则生成页面

<p class="lead">把下面的参考图与提示词一起发送给 AI，在当前项目中做出订单管理页面。</p>

## 1. 保存并附上参考图

<a :href="withBase('/images/order-management-reference.png')" target="_blank" rel="noopener">
  <img :src="withBase('/images/order-management-reference.png')" alt="订单管理参考图：顶部筛选与搜索、重置、导出按钮，中间四个统计卡片，下方订单表格和分页" width="2706" height="1284" />
</a>

<p><a :href="withBase('/images/order-management-reference.png')" download="order-management-reference.png">下载订单管理参考图</a>，将图片拖入当前项目的 AI 对话。点击图片可查看原图。</p>

## 2. 复制这段页面生成提示词 {#implementation}

```text:no-line-numbers
请根据附件截图，在当前项目实现订单管理页面。
遵循已安装的 AI Code 规则；有 .ai-code/profile.md 时按其中已确认约定执行。
还原筛选区、统计卡片、表格和分页，实现查询、重置、详情和导出。
完成后运行相关检查，说明页面访问方式和未完成事项。
```

## 3. 打开页面，人工验收

按 AI 给出的方式启动并打开页面，对照图片查看布局，再做下面几次操作：

| 你来操作                     | 应该看到什么                                  |
| ---------------------------- | --------------------------------------------- |
| 选择支付状态，点击查询       | 列表符合所选状态，页码回到第 1 页             |
| 点击重置                     | 筛选恢复初始值，列表重新显示，页码回到第 1 页 |
| 切换页码，再点一条订单的详情 | 列表随页码变化，详情对应所选订单              |
| 按当前条件导出               | 文件可下载，内容符合已提交的筛选条件          |

确认统计卡片使用的金额单位和统计范围；使用模拟数据时，先验收演示效果，真实接口记为待联调。模拟订单和用户信息使用虚构数据。

页面可以运行后，继续[给订单号增加复制按钮](/examples/query-first-step)。如果某个操作不符合预期，参考[如何向 AI 描述问题](/tutorial/test-and-fix)。
