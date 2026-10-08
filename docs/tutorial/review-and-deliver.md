---
title: 用户列表 · 审查与交付
description: 审查本次局部差异，说明复用来源和验证边界，把做过的一次需求变成可复用流程。
prev:
  text: 用户列表 · 验证并修复
  link: /tutorial/test-and-fix
next:
  text: 日常协作流程
  link: /guide/workflow
---

<p class="page-kicker">扩展练习 / 用户列表</p>

# 把改动交给下一位同事

你已经完成：读取档案、定位数据流、增加回显、接通重置、验证关键边界。最后只检查本次差异并写清结果。

## 1. 检查范围

```bash
git status --short
git diff -- src/views/users/index/index.vue src/views/users/index/index.scss
git diff --cached -- src/views/users/index/index.vue src/views/users/index/index.scss
```

开始时项目已有未提交改动。这些命令展示工作区和暂存区差异，**不能自动区分是谁改的**；与开始时记录的状态对照，只审查本轮新增部分。

| 位置 | 本次应有的改动 |
| --- | --- |
| `index.vue` 导入 | 增加 `computed`、`ref` 与已有 `subscriptionStatusOptions` |
| `index.vue` 逻辑 | `querySummary` 从已提交条件派生；`resetQuery` 调用 `reset()` 并递增搜索组件的 key |
| `index.vue` 模板 | 显示条件；两个重置入口绑定一致 |
| `index.scss` | 新增可换行、使用主题变量的回显样式 |

## 2. 让 AI 做一次定向审查

```text
请只审查本轮用户列表回显与重置的增量，不修改代码。
检查：未订阅的 0、未提交输入、全部字段重置、页码回 1、字典复用、长搜索词布局。
不要把本轮开始前已有的用户改动归入本次。
有问题时给出文件位置、触发条件、影响及最小修改建议；没有证据不要虚构问题。
最后列出未验证的接口或检查项。
```

## 3. 写交付说明

复制下面的结构，将方括号替换为真实结果：

```text
完成：用户列表增加已提交搜索词和订阅状态回显，支持重置全部筛选。
复用：NewSearchForm、usePageList、config/data.ts 中的 subscriptionStatusOptions。
范围：src/views/users/index/index.vue 与 index.scss。
检查：ESLint [实际退出码、诊断摘要]。
行为：[实际核对的场景与方式]。
待验证：[未跑的类型检查、未配置的自动化测试、未联调接口]。
```

提交时按团队既有流程选择本次文件与改动块；这个练习不需要运行项目中包含自动推送的 `npm run commit`。

## 下一个需求怎么做？

继续沿用 **profile 定位 → 明确验收 → 小步实现 → 局部检查 → 交付结果**。新增功能时替换任务目标与相关入口，不需要重建 profile、复制整套提示词或强制跑所有检查。

- 日常任务提示见[协作流程](/guide/workflow)。
- 初始化、版本同步和检查配置见[AI Code 操作手册](/handbook)。
- 团队需要长期规则时参考[规则模板](/rules/agents-template)。
