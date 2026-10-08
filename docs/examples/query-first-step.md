---
title: 用户列表 · 基础回显
description: 在真实用户列表上显示已提交的搜索词，用一个小增量练习规划、实现和复核。
prev: false
next:
  text: 用户列表 · 状态与重置
  link: /tutorial/query-summary
---

<p class="page-kicker">扩展练习 / 用户列表</p>

# 先显示一个搜索词

这个扩展练习基于 `front-aggregate` 的用户列表，适合已接入 AI Code 的项目练习局部修改。首次接入与截图生成页面请从[六步教程](/getting-started)开始。

先阅读 `.ai-code/profile.md` 中用户列表的约定，核对下面的入口，再修改 `index.vue` 和 `index.scss`。其他项目需要替换成自己的真实组件契约。

| 入口 | 本次需要知道的事实 |
| --- | --- |
| `src/routers/modules/users.ts` | 用户列表路径 `/users/index`，使用 hash 路由 |
| `src/views/users/index/index.vue` | `queryForm` 持有已提交条件，接入 `usePageList` |
| `src/components/NewSearchForm/index.vue` | 内部输入提交后才更新页面条件，事件为 `submitForm`、`resetForm` |
| `src/hooks/usePageList.ts` | `onSubmit` 回到第一页，`reset()` 恢复初始查询并请求 |
| `src/views/users/index/config/data.ts` | 复用已有 `subscriptionStatusOptions` 订阅字典 |

按项目已有方式启动并登录用户列表，先确认原查询和分页可用。接下来实现：查询后显示邮箱 / UUID，未提交的输入不影响回显。

## 给 AI 一个可以完成的需求

```text
在 src/views/users/index/index.vue 的搜索区下方增加“已提交条件”。
第一步只显示 queryForm.search；没有搜索词时显示“暂未提交搜索词”。
使用计算属性派生展示数据，保留 NewSearchForm 的提交和重置绑定。
同域 index.scss 中增加可换行样式，使用 Element Plus 主题变量。
先简述拟改位置和复用依据，然后直接实现。
对 index.vue 运行本地 ESLint，报告真实结果。
```

## 对照代码，亲手完成 {#implementation}

如果 AI 已完成，核对下面三个位置即可；不要重复粘贴。以下均为**局部修改**，其余页面代码保留。

### 1. 增加计算属性

在 `src/views/users/index/index.vue` 的 Vue 导入中加入 `computed`：

```ts
import { computed, reactive, onMounted } from 'vue';
```

在现有 `queryForm` 定义之后新增：

```ts
const querySummary = computed(() => {
  if (!queryForm.search) {
    return [];
  }
  return [{ key: 'search', label: `邮箱 / UUID：${queryForm.search}` }];
});
```

### 2. 增加展示区域

找到 `.header` 中的 `<new-search-form>`，在其后、`.header` 结束标签之前插入：

```vue
<div aria-live="polite" class="query-summary">
  <span class="query-summary__label">已提交条件</span>
  <el-tag v-for="item in querySummary" :key="item.key" class="query-summary__tag" type="info">
    {{ item.label }}
  </el-tag>
  <span v-if="!querySummary.length" class="query-summary__empty">暂未提交搜索词</span>
</div>
```

### 3. 增加同域样式

将下面的完整样式块追加到 `src/views/users/index/index.scss` **文件末尾**：

```scss
.users-container .query-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding-bottom: 16px;

  &__label,
  &__empty {
    color: var(--el-text-color-secondary);
  }

  &__tag {
    max-width: 100%;
    height: auto;
    min-height: 24px;
    white-space: normal;
    overflow-wrap: anywhere;
  }
}
```

## 看见第一个成果

输入示例搜索词 `demo@example.com`，点击查询。回显应出现；再把输入改成 `next@example.com`，先不查询，回显仍应是上一次的搜索词。示例字符串仅用于操作验证，不要求接口存在该用户。

```bash
./node_modules/.bin/eslint src/views/users/index/index.vue
```

::: tip 先验证这一小步
没有数据显示不等于回显失败：检查提交条件和请求结果各自的状态。接口不可用时保留“未联调”结论；不要把输入变化直接接成查询来绕过问题。
:::

**完成标志：** 搜索词随提交更新，编辑时保持不变。下一步在同一区域加入订阅状态与重置按钮。
