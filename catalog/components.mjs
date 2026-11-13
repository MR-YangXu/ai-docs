export const stacks = {
  vue2: {
    name: "Vue 2",
    language: "JavaScript",
    source: "vue2-js",
    ui: "Element UI",
    version: "2.7.16",
    extension: "vue",
  },
  vue3: {
    name: "Vue 3",
    language: "TypeScript",
    source: "vue3-ts",
    ui: "Element Plus",
    version: "3.5.43",
    extension: "vue",
  },
  react: {
    name: "React",
    language: "TypeScript",
    source: "react-ts",
    ui: "Ant Design",
    version: "18.3.1",
    extension: "tsx",
  },
};
const common = [
  ["base-card", "BaseCard", "组件", "内容卡片", "组织页面的标题与内容区域。"],
  [
    "search-form",
    "SearchForm",
    "组件",
    "搜索表单",
    "配置搜索字段，管理输入与提交。",
  ],
  [
    "data-table",
    "DataTable",
    "组件",
    "数据表格",
    "展示数据、分页与自定义单元格。",
  ],
  ["dialog", "Dialog", "组件", "对话框", "确认操作、编辑内容与异步提交。"],
  ["drawer", "Drawer", "组件", "抽屉", "在侧边查看详情或完成操作。"],
  [
    "page-list",
    "usePageList",
    "逻辑复用",
    "分页列表",
    "管理查询条件、分页、加载与请求竞态。",
  ],
  [
    "select-options",
    "useSelectOptions",
    "逻辑复用",
    "异步选项",
    "加载远程选项并处理请求状态。",
  ],
  [
    "async-list-action",
    "useAsyncListAction",
    "逻辑复用",
    "异步操作",
    "处理操作去重、成功刷新与资源释放。",
  ],
  ["form-render", "formRender", "配套工具", "表单配置", "构建并复制字段配置。"],
  [
    "table-render",
    "tableRender",
    "配套工具",
    "列配置",
    "组合枚举、嵌套字段与复制能力。",
  ],
  ["data", "data", "配套工具", "选项转换", "保留选项值类型并映射显示文案。"],
];
export const catalog = Object.entries(stacks).flatMap(([stack, info]) => {
  const entries = [...common];
  if (stack === "vue2")
    entries.splice(8, 0, [
      "search-items",
      "useSearchItems",
      "逻辑复用",
      "动态筛选项",
      "加载、增删和保存服务端筛选配置。",
    ]);
  if (stack === "react")
    entries.splice(8, 0, [
      "column-resize",
      "useTableColumnResize",
      "逻辑复用",
      "列宽拖拽",
      "为原生 Ant Design Table 添加列宽调整。",
    ]);
  return entries.map(([slug, install, group, label, description]) => {
    const name =
      stack === "vue2" && install.startsWith("use")
        ? install.replace(/^use/, "create")
        : install;
    const stem = slug
      .split("-")
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join("");
    return {
      stack,
      slug,
      name,
      install: slug === "column-resize" ? "DataTable" : install,
      group,
      label,
      description,
      route: `/components/${stack}/${slug}`,
      demos: [
        "Basic",
        "Advanced",
        ...(slug === "dialog" ? ["Service"] : []),
        ...(slug === "search-form"
          ? ["Remote", ...(stack === "vue2" ? ["Dates"] : [])]
          : []),
      ].map((variant, index) => ({
        id: `${stem}${variant}`,
        title: {
          Basic: "基础用法",
          Advanced: "配置与交互",
          Service: "函数式调用",
          Remote: "异步选项",
          Dates: "日期与级联",
        }[variant],
        file: `demos/${stack}/examples/${stem}${variant}.${info.extension}`,
        height: ["dialog", "drawer"].includes(slug)
          ? 480
          : slug === "search-form"
          ? 360
          : slug === "data-table"
          ? 420
          : 240,
        wide: !["base-card", "form-render", "data"].includes(slug),
      })),
    };
  });
});
export function sidebarFor(stack) {
  return [
    {
      text: `${stacks[stack].name} · ${stacks[stack].language}`,
      items: [{ text: "概览与快速开始", link: `/components/${stack}/` }],
    },
    ...["组件", "逻辑复用", "配套工具"].map((group) => ({
      text:
        group === "逻辑复用" && stack !== "vue2" ? "Hooks · 逻辑复用" : group,
      collapsed: false,
      items: catalog
        .filter((e) => e.stack === stack && e.group === group)
        .map((e) => ({ text: `${e.name} ${e.label}`, link: e.route })),
    })),
    ...(stack === "react"
      ? [
          {
            text: "上下文",
            items: [
              {
                text: "useDialog / DialogProvider",
                link: "/components/react/dialog#函数式调用",
              },
            ],
          },
        ]
      : []),
  ];
}

// manifest 之外的公开子入口也必须有文档和运行示例。
export const publicSubentries = [
  {
    stack: "react",
    name: "useTableColumnResize",
    slug: "column-resize",
    source: "components/DataTable/column-resize/index.ts",
  },
  {
    stack: "react",
    name: "useDialog",
    slug: "dialog",
    source: "components/Dialog/index.tsx",
  },
  {
    stack: "react",
    name: "DialogProvider",
    slug: "dialog",
    source: "components/Dialog/index.tsx",
  },
];
