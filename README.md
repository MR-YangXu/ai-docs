# AI 编程范式

基于 VitePress 的中文团队手册，采用“开始使用 → 范式与流程 → 规则与配置 → 最佳实践”的渐进式导航。

## 本地启动

使用 Node.js 22 或更高版本，在项目根目录运行：

```bash
npm install
npm run docs:dev
```

构建与预览：

```bash
npm run docs:build
npm run docs:preview
```

配置在根目录 `.vitepress/config.ts`，通过 `srcDir: 'docs'` 读取 Markdown。不要改为 `vitepress dev docs`，否则会改变配置查找位置。构建产物位于 `.vitepress/dist/`。

## 内容入口

- [快速上手](docs/getting-started.md)：核心理念、环境准备、三阶段示例与场景实践。
- [规则模板](docs/rules/agents-template.md)：AGENTS.md、旧版 .cursorrules、MDC 与 MCP。
- [已有操作手册](docs/handbook.md)：`@agent-xy/ai-code` 的接入与维护。

导航使用真实页面与显式锚点；可以在内容增长后逐步拆分页面。Ant Design 风格的色彩、分组菜单和步骤样式位于 `.vitepress/theme/style.css`，无需引入组件库。

## 部署配置

默认部署到域名根路径。若部署到 `/ai-doc/`，构建时设置：

```bash
DOCS_BASE=/ai-doc/ npm run docs:build
```

部署平台需支持无扩展名 URL（例如将 `/getting-started` 映射到 `getting-started.html`）；不支持时，将配置中的 `cleanUrls` 改为 `false`。

设置 `DOCS_REPOSITORY_URL` 为本项目的真实 GitHub 地址后，顶部社交链接会指向该仓库；未设置时显示已注明来源的 AI Developer Guide 参考项目。最后更新时间来自 Git 提交记录，尚未初始化 Git 的目录不会显示该时间。

参考仓库及核实结果记录在[快速上手的参考来源](docs/getting-started.md#references)中。
