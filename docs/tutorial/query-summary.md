---
title: 用户列表 · 状态与重置
description: 复用已有订阅字典，正确显示数值 0，并让两个重置入口恢复同一份初始查询。
prev:
  text: 用户列表 · 基础回显
  link: /examples/query-first-step
next:
  text: 用户列表 · 验证并修复
  link: /tutorial/test-and-fix
---

<p class="page-kicker">扩展练习 / 用户列表</p>

# 接通订阅状态和重置

沿用[基础回显示例](/examples/query-first-step)的两个文件。完成后，搜索词和订阅状态都从 `queryForm` 回显；原有“重置”和新增“清空全部筛选”使用同一处理函数。

## 发给 AI 的第二个增量

```text
继续完善用户列表的已提交条件：
1. 从 config/data.ts 导入 subscriptionStatusOptions，按数值匹配订阅标签。
2. “未订阅”的值是 0，必须正常显示；空字符串才表示未选择。
3. 新增“清空全部筛选”，与 NewSearchForm 的 reset-form 共用 resetQuery。
4. resetQuery 无参数调用 usePageList 返回的 reset()，恢复全部初值并回到第一页；递增搜索组件的 key，清除未提交输入。
5. 保留现有查询、分页和接口适配；不另写请求，不改业务码值。
6. 沿用上一步样式。完成后检查 index.vue，并核对本次相关交互。
```

## 1. 用现有选项派生回显

在 `src/views/users/index/index.vue` 增加导入：

```ts
import { subscriptionStatusOptions } from './config/data';
```

将上一步的 `querySummary` **整体替换**为：

```ts
const querySummary = computed(() => {
  const items: Array<{ key: string; label: string }> = [];
  if (queryForm.search) {
    items.push({ key: 'search', label: `邮箱 / UUID：${queryForm.search}` });
  }
  const status = subscriptionStatusOptions.find((option) => option.value === queryForm.subscription_status);
  if (status) {
    items.push({ key: 'subscription_status', label: `订阅状态：${status.label}` });
  }
  return items;
});
```

这里查找的是已有选项对象，数值 `0` 也能匹配到。禁止改成 `if (queryForm.subscription_status)`，那会把“未订阅”当作没有条件。

## 2. 共用一个重置入口

先在 Vue 导入中补充 `ref`：

```ts
import { computed, reactive, onMounted, ref } from 'vue';
```

在现有 `usePageList(...)` 调用结束之后增加重置标识与处理函数：

```ts
const searchFormKey = ref(0);

function resetQuery() {
  reset();
  searchFormKey.value += 1;
}
```

将搜索组件的 `@reset-form="reset"` 改为 `@reset-form="resetQuery"`。完整标签如下，替换原标签即可：

```vue
<new-search-form
  :key="searchFormKey"
  :form-header="formHeader"
  :form-model="queryForm"
  @reset-form="resetQuery"
  @submit-form="onSubmit"
></new-search-form>
```

::: tip 为什么包一层函数？
`NewSearchForm` 的重置事件会携带内部表单，按钮点击也会携带事件对象。这里明确调用 `reset()`，让 Hook 从 `initialQuery` 的独立快照恢复全部字段，随后回到第一页并请求。

只改输入、尚未查询时，`queryForm` 可能仍是初始值，重复赋值不会触发组件监听。递增 `key` 会重新创建搜索组件，从恢复后的查询初始化内部输入；动态选项仍由父页面持有。这不会额外发起列表请求。
:::

## 3. 替换回显区域

将上一步的 `.query-summary` 区域整体替换为：

```vue
<div aria-live="polite" class="query-summary">
  <span class="query-summary__label">已提交条件</span>
  <el-tag v-for="item in querySummary" :key="item.key" class="query-summary__tag" type="info">
    {{ item.label }}
  </el-tag>
  <span v-if="!querySummary.length" class="query-summary__empty">尚未提交搜索词或订阅状态</span>
  <el-button :disabled="loading" size="small" @click="resetQuery">清空全部筛选</el-button>
</div>
```

保留基础回显示例的 SCSS，无需重复添加。按钮始终显示，因此只修改了其他筛选条件、或只输入尚未提交的内容时，也能重置。

## 这一轮验收

| 操作 | 预期结果 |
| --- | --- |
| 选择“未订阅”并查询 | 出现“订阅状态：未订阅” |
| 同时提交搜索词和订阅状态 | 出现两个标签 |
| 从第 2 页重新查询 | 请求页码为 1，回显使用新条件 |
| 修改输入但不提交，然后清空全部筛选 | 输入和标签一起恢复，其他筛选字段也回到初值 |
| 点击原有搜索表单的重置 | 与新增按钮得到同样的结果 |

已有 `usePageList` 负责 loading（加载状态）和过期响应处理。此次增加的是展示和入口，继续共用原请求链路。

**完成标志：** 两个条件正确回显，两个重置入口行为一致。下一步集中验证这些边界。
