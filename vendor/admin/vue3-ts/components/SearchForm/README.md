# SearchForm

配置式搜索表单，内部维护输入草稿。基础接入见 [技术栈 README](../../README.md)，完整页面见 `examples/pages/orders`、`examples/pages/users`。

| 属性                                   | 用途                                                         |
| -------------------------------------- | ------------------------------------------------------------ |
| `formHeader: FormItemConfig<Values>[]` | 字段与模型键、控件值类型关联                                 |
| `formModel?: Partial<Values>`          | 初始输入与外部回填；对象替换覆盖草稿，原地变化只同步变化字段 |
| `loading / disabled`                   | 提交忙状态 / 禁用表单                                        |
| `showButton / isShowReset`             | 默认操作按钮 / 重置按钮                                      |
| `labelPosition / labelWidth`           | 标签布局                                                     |

字段类型：`text`、`number`、`selectOne`（可配置 multiple）、`date`、`dateRange`、`datetimerange`、`inputBoxInterval`、`custom`。数字区间用 `propName1 / propName2`，其余用 `propName`。单选及多选支持字符串、数字、布尔值。日期默认输出字符串：单日期与日期范围为 `YYYY-MM-DD`，时间范围为 `YYYY-MM-DD HH:mm:ss`。`format` 控制展示，`valueFormat` 控制输出；字符串模型使用非空格式。若模型使用 `Date` 或 `Date[]`，必须显式设置 `valueFormat: ''`，并在接口边界转换。

`optionsArr`、远程加载与 `loading` 由页面提供，参考用户示例的 `useSelectOptions`。控件扩展放 `controlProps`；值及更新事件由组件管理，不通过 controlProps 覆盖。`rules` 使用与 Element Plus 一致的 async-validator 规则，由字段管理校验序号，旧成功和旧失败都不能改写当前校验状态；没有 rules 时使用内置必填、区间完整性与数字区间顺序检查。

事件 `submit-form / reset-form / form-change` 都返回当前配置字段的独立快照。移除字段会清理其草稿与校验，新增字段按首次注册时模型值重置。回车和搜索按钮走同一次校验；规则或值变化使未完成校验失效。

字段插槽按 `slotName ?? propName` 匹配，接收 `{ form, item, value, updateValue, change }`。通过 `updateValue(value)` 或 `change(name, value)` 更新，不直接写 form。`actions` 插槽接收 `{ submit, reset, form, busy }`；`actions-extra` 放导出等页面操作。

实例方法：`submitForm(): Promise<boolean>`、`resetForm()`、`getFormData()`、`validate()`、`validateField()`、`clearValidate()`。提交事件本身不等待页面请求，页面使用 loading 管理请求状态。切换初始化实体时更换 key。
