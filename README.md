# AI 编程范式

基于 VitePress 的团队操作手册。主线为：进入现有项目并检查 Node.js 18 及以上 → 安装 AI Code → 初始化 → 查看状态 → 补全并人工审查 profile → 根据截图生成页面。命令按本地 AI Code **0.3.0** 源码核对，日期为 **2026-10-08**。

## 本地运行

文档站及三栈示例使用 Node.js 20，在本仓库根目录执行：

```bash
nvm use
npm ci
npm run docs:dev
```

```bash
npm run docs:build
npm run docs:preview
```

根配置 `.vitepress/config.ts` 通过 `srcDir: 'docs'` 加载正文，构建输出为 `.vitepress/dist/`。

## 组件中心

新增 Vue 2、Vue 3、React 三个分区，含 35 项能力文档、77 个可运行示例与源码面板。日常安装和构建只依赖本仓库，来源仓库无需存在。

- [组件中心](docs/components/index.md)
- [源码同步与新增文档](docs/components/maintenance.md)
- 快照来源：`fc9cc41`，包声明 `0.7.0`；安装命令以实际发布包内容为准。
- `npm run components:check` 检查快照和覆盖，`npm test` 检查异步契约。

## 内容入口

- [动手教程](docs/getting-started.md)：在现有项目中，六步完成接入与截图生成页面。
- [档案提示词](docs/tutorial/project-rules.md)：按源码补全 profile，并人工审查。
- [图片与页面提示词](docs/tutorial/first-page.md)：下载订单管理截图，按项目规则生成页面。
- [生成对照：看懂规则如何落地](docs/examples/order-generation-evidence.md)：用 admin、api、constant、type 四个 Skill 的真实例子，核对规则如何落实，以及哪些要求尚未做到。
- [订单实验的详细证据](docs/examples/order-generation-evidence-notes.md)：保留 AI Code 0.5.0 实验的规则原文、源码摘录和检查记录，供按需查证。
- [日常协作流程](docs/guide/workflow.md)：规划、执行、复核和场景实践。
- [AI Code 设计流程图](docs/guide/design-flow.md)：基于本地包实现，展示规则分发、项目接入、AI 开发与验证闭环；提供 SVG、PNG 和可编辑 draw.io 文件。
- [AI Code 操作手册](docs/handbook.md)：初始化、profile、版本同步和质量命令。
- [规则模板](docs/rules/agents-template.md)：AGENTS.md、MDC、旧格式兼容与 MCP。

参考图位于 `docs/public/images/order-management-reference.png`，用于页面练习；生成演示数据时使用虚构信息。[继续练习](docs/examples/query-first-step.md)沿用刚生成的订单页面，练习复制订单号、快捷筛选、修复问题和检查结果。每篇提供短提示词与可操作的验收步骤。

## 部署

部署到子路径时设置：

```bash
DOCS_BASE=/ai-doc/ npm run docs:build
```

默认启用无扩展名 URL，托管平台需将 `/getting-started` 映射到 `getting-started.html`；不支持时关闭 `cleanUrls`。

GitHub 链接默认指向 [AI Code 源码](https://github.com/MR-YangXu/AI-Coding)。可用 `DOCS_REPOSITORY_URL` 设置文档仓库地址。页面更新时间来自 Git 提交记录。
