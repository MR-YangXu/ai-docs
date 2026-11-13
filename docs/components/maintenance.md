---
title: 组件中心维护与同步
---

# 维护与同步

## 独立运行

使用 Node.js 20（`.nvmrc`）。无需下载来源仓库：

```sh
nvm use
npm ci
npm run docs:dev
```

开发命令统一启动 VitePress 和三个独立示例服务，通过同源代理加载。Vue 2、Vue 3、React 的运行时、组件样式与上下文由各自工作区管理。示例使用 UI 库默认浅色，文档正文和源码面板支持深浅色。

## 显式更新快照

```sh
npm run components:sync -- --source ../ai-frontend
npm run components:check
npm test
npm run docs:build
```

同步仅写入文档仓库的 `vendor/admin`，不修改来源仓库。`snapshot.json` 记录来源提交、工作区状态、包声明版本、依赖和每个文件的 SHA-256 摘要。快照已被手动修改时同步会拒绝覆盖；先保存修改并恢复上次快照再同步。已登记但在来源删除的文件由同步命令清理。

快照同时保留来源 MIT 许可证，复制源码时一并保留。

源码快照的提交版本与 npm 发布版本不同。各能力页的安装名称来自对应 manifest；先运行 dry-run 确认当前发布包实际包含该能力。Vue 2 安装名称 usePageList 等对应源码 createPageList 等。React useTableColumnResize 随 DataTable 目录提供，useDialog / DialogProvider 随 Dialog 提供。

## 新增文档和示例

1. 在 `catalog/components.mjs` 登记技术栈、能力名称、安装标识、路由和示例。每项至少提供基础和典型状态两个示例。
2. 在 `demos/<技术栈>/examples` 编写真实示例，直接导入 `@/` 下的快照；跨文件依赖用相对路径引用。模拟请求放在 `demos/shared`，支持取消并使用确定性数据。
3. 在 `docs/components/<技术栈>` 新增页面，使用 StackSwitcher 和 DemoCard，补充用途、接入、API、事件/插槽/方法、返回值及常见问题。正文与折叠说明只写当前技术栈的真实契约，不混入其他栈的参数、默认值或生命周期；跨栈对比放在组件中心总览或维护页。`components:check` 会检查各栈目录中的文档（含快速开始），发现其他框架或 UI 库标识时报告文件和行号。
4. 运行检查和构建，再验证加载、失败重试、重置、卸载以及实际键盘操作。新公共入口需显式登记，不能只依赖组件目录推断。

运行代码与源码面板使用同一文件。构建时 `generate-snippets.mjs` 遍历相对引用并用 Shiki 高亮，生成的 `.generated` 无需提交。`@/` 内部依赖由完整源码快照提供；面板同时展示示例依赖的模拟请求文件。源码只读，复制后按业务项目调整路径。

## 构建与部署

```sh
npm run docs:build
npm run docs:preview
# 子路径部署
DOCS_BASE=/ai-doc/ npm run docs:build
DOCS_BASE=/ai-doc/ npm run docs:preview
```

构建顺序为快照和能力清单检查、源码面板生成、Vue 3/React 类型检查、三栈示例构建、VitePress 构建。完整静态产物位于 `.vitepress/dist`，示例位于其中的 `demos`，整体部署即可。`docs/public/demos` 是构建产物，不提交。

开发、构建和预览使用相同 DOCS_BASE。托管平台需支持无扩展名文档 URL 到同名 HTML 文件的映射；示例使用 index.html 和查询参数，刷新不会依赖单页路由回退。

## 验证记录

实际运行结果见[验证记录](/components/verification)。可以在构建后运行 `node scripts/prepare-browser-check.mjs`，再通过预览服务访问 `demos/check.html`，点击“开始检查”依次检查全部示例的加载与初次渲染。此页面仅在构建产物中临时生成，下次构建会清除。

新增或同步能力后应更新记录，注明验证范围与未覆盖项。
