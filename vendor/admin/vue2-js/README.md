# 后台源码工具集：vue2-js

## 添加与归属

```bash
npx @agent-xy/ai-code add admin
npx @agent-xy/ai-code add admin --only DataTable,usePageList --dry-run --json
```

先 init 选择技术栈。源码默认复制到 src/components、src/logic、src/utils。支持 --source-dir 指定源码根目录。
只添加缺少的能力，先核对项目已有实现和 profile。usePageList/useSelectOptions/useAsyncListAction 是命令里的能力标识；Vue 2 实际导出 createPageList/createSelectOptions/createAsyncListAction。

冲突可交互选择替换、不复制、重命名；非交互需 --conflict replace|skip|rename。跳过一个不兼容依赖会连带跳过消费者；内容完全一致可直接复用。重命名会更新本批源码相对导入，不改已有业务调用。文件归项目维护，sync 不更新或删除；需要升级时先对比，再明确选择替换或重命名。

## 依赖与入口

支持基线：Vue 2.6–2.7、Element UI 2.15.x、Sass 1.x。依赖声明不等于已安装或已兼容，命令只报告缺失项和安装命令，不更改项目构建、入口、package.json 或锁文件。使用本项目已有构建工具；Vue 单文件组件需要对应编译插件，React 需要 JSX 编译能力。TS 项目使用现有类型检查。

在项目样式入口导入一次：

```js
import "element-ui/lib/theme-chalk/index.css";
```

使用 Vite 等构建工具时，确保应用和 Element UI 解析到同一份 Vue 2 运行时，避免重复 Vue 导致表格列无法注册；沿用项目已有 alias/dedupe 配置。

组件自身显式导入 UI 组件；无需配置自动导入插件。复制后的工具集内部使用相对路径。调用者按真实位置导入；重命名后以命令结果为准。

## 配置驱动的搜索和列表

搜索用 [SearchForm](components/SearchForm/README.md)，表格用 [DataTable](components/DataTable/README.md)。SearchForm 接收 `items` 和 `:query.sync`，覆盖文本、下拉、日期、级联、人员、部门和自定义树。DataTable 同时接收 `tableData` / `tableColumns` / `pageParams`，以及 `data` / `columns` / `pageQuery`。`front` 仍用自己的 `formHeader`。旧页面继续用项目里的 `searchItem`。三个项目已有 `uTable`，不在这里替换。页面拉筛选项仍可用 `createSearchItems`，说明见 [gc-search-table.md](gc-search-table.md)。

## 启动示例

在仓库根目录执行：

```bash
cd content/templates/admin/vue2-js
npm ci
npm run dev
```

打开终端里的地址。入口是 `examples/main.js`，可切换店铺、成员、组织分配。`npm run build` 产物在 `dist`，`npm run preview` 预览构建结果。

## 最小列表页

[AdminList.vue](examples/AdminList.vue) 是组合示例，命令不会创建业务页面或接口。示例接收 fetchList 函数；调用项目既有请求层并返回 { list, total }，不自动兼容 res.data 或猜测后端响应。不要把演示数组用于请求失败回退。

[店铺](examples/pages/shops/index.vue) 用 SearchForm 的文本、单选、多选、日期范围、级联、部门树，并用 DataTable 的 `tree-props` 展开公司下的店铺，分页只切公司这一层。[成员](examples/pages/members/index.vue) 演示表格勾选、批量操作和抽屉。[组织分配](examples/pages/assign/index.vue) 的表格是公司、大区、国家、店铺四层，弹窗表单是中心、部门、小组、席位四层。勾选上一层会带上它下面的店铺。

Vue 2 搜索字段使用 key、name、type。type 可以是协议数字或 fieldTypes 里的名字。日期格式为 yyyy-MM-dd。其他框架的搜索字段使用 propName、labelName、itemType，日期格式为 YYYY-MM-DD。选项 value 保留数字、字符串、布尔原值。

表格列使用 prop、label、showColumn、render；buildColumns 支持默认、enum、nested、clip。0、false、空字符串不是缺失值。formatter 按文本展示，富内容用 render/插槽；不直接插入 HTML。复制操作使用 Clipboard API，需要安全上下文，失败通过 onCopyError 或提示反馈。

pageParams 为 { currentPage, pageSize, pageSizes, total }；列表查询使用 page/page_size。实际接口不同则在 fetchList 中映射；total 和 page_sizes 不发送，其他业务字段不删除。onSubmit 保存条件并回第一页；分页继续使用已提交条件。输入草稿不会在分页时丢失；reset 深拷贝恢复初始查询并移除后来新增的键。getData 刷新；结果页码超界时补请求有效页。

查询失败通过 error/onError 暴露，getData 返回 undefined；旧响应、旧失败与卸载后的响应不会更新列表。useSelectOptions/createSelectOptions 的当前请求失败会拒绝，调用处处理；useAsyncListAction/createAsyncListAction 的 exec 同样保留拒绝，支持第三个参数操作键，重复键共用进行中的请求。

## 搜索与表格的职责边界

- `SearchForm` 按字段 `type` 渲染控件。`:query.sync` 写入提交值，回显仍用控件原值。文本在输入时更新 `query`，失焦或回车触发 `change`。树和级联的格式化在 `check`。自定义控件用 `#field` 或 `#field-字段key`。
- `DataTable` 接收行、列和分页，不发请求。本地列表用 `tableData`、`tableColumns`、`pageParams`。`gc`、`dev`、`pod`、`deep-convo-front` 的 `uTable` 用 `data`、`columns`、`pageQuery`、`hasPag`，列上的 `render` 可以是插槽名或函数。`front` 的 `BaseTable` 是 Vue 3，只对应其中的 `columns` 和 `tableData`。单元格优先级是具名插槽、`render`、`formatter`、文本。`0`、`false`、空字符串会显示。说明见 [DataTable](components/DataTable/README.md)。
- 两个组件的静态样式各自位于 `style.scss`，由入口自动引入，按组件结构组织 SCSS 嵌套与局部间距变量，使用 `ai-code-search-items` / `ai-code-table` 命名空间。动态宽度由字段的 `width` 配置传入；颜色、字体及控件状态沿用项目 UI 主题。单独复制组件时保留整个组件目录，并安装 Dart Sass（`sass`）。

## 弹窗和抽屉

组件式 BaseDialog/BaseDrawer 的确认逻辑传 onConfirm，返回 Promise；成功关闭，失败保留输入并触发错误回调。关闭期间可清理资源，避免将 confirm 事件当成等待异步提交的入口。

```js
import AdminDialog, { createDialogService } from "./components/Dialog";
Vue.use(AdminDialog);
// 在选项式组件的方法里：
const confirmed = await this.$dialog.confirm("确认执行此操作？");
const { showDialog } = createDialogService(this);
const panel = showDialog({ title: "详情", content: "内容" });
panel.update({ title: "更新标题" });
panel.close();
```

组件通过 v-model 控制可见性，错误使用 @error。函数式服务必须绑定调用组件 parent，父组件销毁时自动清理。逻辑对象按组件实例创建，在 beforeDestroy 中调用 dispose；不要创建模块级共享列表状态。

三框架的 Dialog.alert 返回实例；Dialog.confirm 返回 Promise<boolean>，确认 true，取消/关闭/卸载 false；Dialog.component 接收组件及属性，返回实例；showDialog 返回 close/update。首版不提供函数式抽屉。

## 与原始 Vue 3 实现的差异

Vue 3 组件来源于 matrixflow-front 的 BaseCard、NewSearchForm、NewTable、Dialog、Drawer，保留通用调用方式，搜索与表格按字段、草稿、单元格职责重构；移除了固定账单金额编辑、业务日期清理、业务默认行键、项目图片与全局变量。通用列显隐使用 showColumnSettings，行内编辑由列插槽承接；特殊业务搜索项由 custom 插槽承接。React/Vue 2 覆盖标准列表页，不要求复制旧组件的所有参数。

复制完成后按命令给出的真实路径补充 .ai-code/profile.md 的推荐入口、用途、适用范围与参考页面。未安装项不要登记为可用。工具不会自动改 profile。
