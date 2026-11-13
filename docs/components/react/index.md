---
title: React 组件与快速开始
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# React 组件与逻辑

<p class="lead">TypeScript · Ant Design。从独立示例了解组件，再按项目真实接口组合页面。</p>

## 快速开始

### 1. 获取源码

在业务项目中先选择对应技术栈，再按需添加能力：

```sh
npx @agent-xy/ai-code init --framework react
npx @agent-xy/ai-code add admin --only SearchForm,DataTable,usePageList --dry-run
npx @agent-xy/ai-code add admin --only SearchForm,DataTable,usePageList
```

本页对应提交 `fc9cc41` 的源码快照，来源包声明为 `0.7.0`。命令能否安装这些能力取决于实际使用的包内容，请先检查 dry-run 输出。源码复制到项目后由团队维护，sync 不覆盖这些业务源码。

若需要与本站完全一致的版本，可从文档仓库 `vendor/admin/react-ts` 复制所需目录，并按照该目录 manifest.json 携带依赖项。完整复制 components、hooks、utils、types 可保留所有内部相对引用；不要只复制单个组件入口文件。

### 2. 安装依赖

以下为本站运行版本，已有项目应结合其依赖约束处理：

```sh
npm install react@18.3.1 react-dom@18.3.1 antd@5.27.6 @ant-design/icons@5.6.1 dayjs@1.11.13
npm install -D sass@1.93.2
```

TypeScript 项目保留严格类型检查；构建成功不能替代类型检查。

### 3. 入口与样式

在现有应用入口引入样式并设置 UI 上下文。下方 App 表示项目的根组件：

```tsx
import 'antd/dist/reset.css'
import { createRoot } from 'react-dom/client'
import { App as AntApp, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
createRoot(document.getElementById('app')!).render(
  <ConfigProvider locale={zhCN}><AntApp><App /></AntApp></ConfigProvider>
)
```

所有运行示例使用 `@/components`、`@/hooks` 和 `@/utils`。将项目的 `@` 配置到源码所在目录，或按实际位置调整导入。文档示例中相对引用的模拟请求文件位于源码面板的独立标签。

React 19 项目按原仓库说明接入 `@ant-design/v5-patch-for-react-19`；本站运行基线为 React 18。函数式 Dialog 另需 DialogProvider，具体见 [Dialog](/components/react/dialog#函数式调用)。

<ComponentOverview stack="react" />

## 页面组合参考

源码仓库的订单和用户页按页面入口、config、业务 components、index.scss 组织。页面组合分页、选项和异步操作逻辑；订单包含统计、导出与详情，用户页包含独立业务表单与历史记录。React 订单还包含页面类型与工具文件。

这些页面位于来源仓库 content/templates/admin 下的对应技术栈 examples/pages。本站用其中的实际调用方式构建独立示例，业务请求仍由项目自身实现。
