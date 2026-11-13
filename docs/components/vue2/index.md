---
title: Vue 2 组件与快速开始
pageClass: component-page
outline: [2, 3]
---

<StackSwitcher />

# Vue 2 组件与逻辑

<p class="lead">JavaScript · Element UI。从独立示例了解组件，再按项目真实接口组合页面。</p>

## 快速开始

### 1. 获取源码

在业务项目中先选择对应技术栈，再按需添加能力：

```sh
npx @agent-xy/ai-code init --framework vue2
npx @agent-xy/ai-code add admin --only SearchForm,DataTable,usePageList --dry-run
npx @agent-xy/ai-code add admin --only SearchForm,DataTable,usePageList
```

本页对应提交 `fc9cc41` 的源码快照，来源包声明为 `0.7.0`。命令能否安装这些能力取决于实际使用的包内容，请先检查 dry-run 输出。源码复制到项目后由团队维护，sync 不覆盖这些业务源码。

若需要与本站完全一致的版本，可从文档仓库 `vendor/admin/vue2-js` 复制所需目录，并按照该目录 manifest.json 携带依赖项。完整复制 components、logic、utils 可保留所有内部相对引用；不要只复制单个组件入口文件。

### 2. 安装依赖

以下为本站运行版本，已有项目应结合其依赖约束处理：

```sh
npm install vue@2.7.16 element-ui@2.15.14
npm install -D sass@1.93.2
```

Vue 2 使用选项式 API；应用、Element UI 与编译插件应解析到同一份 Vue 2。

### 3. 入口与样式

在现有应用入口引入样式并设置 UI 上下文。下方 App 表示项目的根组件：

```js
import 'element-ui/lib/theme-chalk/index.css'
import Vue from 'vue'
import ElementUI from 'element-ui'
Vue.use(ElementUI)
new Vue({ render: h => h(App) }).$mount('#app')
```

所有运行示例使用 `@/components`、`@/logic` 和 `@/utils`。将项目的 `@` 配置到源码所在目录，或按实际位置调整导入。文档示例中相对引用的模拟请求文件位于源码面板的独立标签。

新 SearchForm 使用 key/name/type/data；createSelectOptions 和 formRender 当前保留旧 propName/optionsArr/itemType 协议，请按各自文档接入。Vue 2 的命令能力名 usePageList 等对应源码导出 createPageList 等。

<ComponentOverview stack="vue2" />

## 页面组合参考

源码仓库的店铺页展示搜索、公司与店铺树表、分页，使用 config 组织配置；成员页展示选择、批量操作与抽屉；组织分配页展示四层树数据和弹窗。后两页使用各自 data.js，均有页面独立样式。

这些页面位于来源仓库 content/templates/admin 下的对应技术栈 examples/pages。本站用其中的实际调用方式构建独立示例，业务请求仍由项目自身实现。
