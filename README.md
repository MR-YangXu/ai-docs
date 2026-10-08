# AI 编程范式

基于 VitePress 的团队操作手册。主线为：进入现有项目并检查 Node.js 18 及以上 → 安装 AI Code → 初始化 → 查看状态 → 补全并人工审查 profile → 根据截图生成页面。命令按本地 AI Code **0.3.0** 源码核对，日期为 **2026-10-08**。

## 本地运行

使用 Node.js 18 及以上，在本仓库根目录执行：

```bash
npm ci
npm run docs:dev
```

```bash
npm run docs:build
npm run docs:preview
```

根配置 `.vitepress/config.ts` 通过 `srcDir: 'docs'` 加载正文，构建输出为 `.vitepress/dist/`。

## 内容入口

- [动手教程](docs/getting-started.md)：在现有项目中，六步完成接入与截图生成页面。
- [档案提示词](docs/tutorial/project-rules.md)：按源码补全 profile，并人工审查。
- [图片与页面提示词](docs/tutorial/first-page.md)：下载订单管理截图，按项目规则生成页面。
- [日常协作流程](docs/guide/workflow.md)：规划、执行、复核和场景实践。
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
