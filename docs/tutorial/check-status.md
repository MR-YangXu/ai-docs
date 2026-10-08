---
title: 04 · 查看状态
description: 使用 npx ai-code status 核对 AI Code 的配置、规则一致性和检查命令映射。
prev:
  text: 03 · 运行初始化
  link: /tutorial/initialize
next:
  text: 05 · 完善项目档案
  link: /tutorial/project-rules
---

<p class="page-kicker">动手教程 / 04</p>

# 查看 AI Code 状态

初始化完成后，在同一项目根目录执行：

```bash
npx ai-code status
```

## 重点看这几项

| 检查内容 | 你需要确认什么 |
| --- | --- |
| 项目配置与场景 | 配置能正常读取，场景与项目一致 |
| 包版本与规则版本 | 版本一致，生成规则没有缺失或冲突 |
| 检查命令映射 | 哪些检查可用，哪些尚未配置 |

`available` 表示命令可用，`missing` 表示检查能力缺失。**`status` 不会执行代码规范检查、类型检查、测试或构建，也不会判断 profile 是否填写正确。**

如果提示版本不同步，按[升级与同步](/handbook#upgrade)处理后重跑 `npx ai-code status`。如果提示受控文件被修改，先核对差异并处理冲突。缺少检查脚本时，按项目实际需要配置，不把“未配置”记为“已通过”。

## 需要 AI 帮忙排查时

把实际命令和输出一起粘贴到对话中：

```text
我在当前项目执行了 npx ai-code status，输出如下：
【粘贴完整输出】

请结合 package.json、.ai-code/config.json 和相关生成文件解释状态。
区分规则版本不一致、受控文件冲突与检查脚本缺失，给出对应的处理方式。
保留现有配置和工作区改动，不通过删除规则或关闭检查来消除报错。
不要把 available 解释为检查已经通过，也不要编造未执行的结果。
```

**完成标志：** 配置与规则状态已核对，阻断问题已处理，缺少的检查已知晓。接着[完善项目档案](/tutorial/project-rules)。
