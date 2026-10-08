import { defineConfig } from 'vitepress'

// 从仓库根目录运行 vitepress；Markdown 内容位于 docs/。
// 子路径部署时设置 DOCS_BASE=/ai-doc/，值应以前后斜杠包围。
const base = process.env.DOCS_BASE || '/'
const repository = process.env.DOCS_REPOSITORY_URL?.replace(/\/$/, '')
const aiCodeRepository = 'https://github.com/MR-YangXu/AI-Coding'
const references = [
  { text: 'AI Developer Guide', link: 'https://github.com/dwmkerr/ai-developer-guide' },
  { text: 'Awesome Cursor Rules', link: 'https://github.com/tugkanboz/awesome-cursorrules' },
  { text: 'AI Code Guide', link: 'https://github.com/automata/aicodeguide' },
  { text: '教程写法与参考样例', link: '/guide/workflow#references' },
]

export default defineConfig({
  lang: 'zh-CN',
  title: 'AI 编程范式',
  titleTemplate: ':title · AI 编程范式',
  description: '在现有项目中使用 Node.js 18 及以上，六步接入 AI Code，再按项目规则从截图生成页面。',
  base,
  srcDir: 'docs',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: false,
  appearance: true,
  head: [
    ['meta', { name: 'theme-color', content: '#1677ff' }],
  ],
  markdown: {
    lineNumbers: true,
    theme: { light: 'github-light', dark: 'github-dark' },
    container: {
      tipLabel: '提示',
      warningLabel: '注意',
      dangerLabel: '重要',
      infoLabel: '说明',
      detailsLabel: '展开详情',
    },
  },
  themeConfig: {
    siteTitle: 'AI 编程范式',
    nav: [
      { text: '动手教程', link: '/getting-started', activeMatch: '^/(getting-started|tutorial/|examples/)' },
      { text: '流程指南', link: '/guide/workflow', activeMatch: '^/guide/' },
      { text: '规则与配置', link: '/rules/agents-template', activeMatch: '^/rules/' },
      { text: '项目操作手册', link: '/handbook', activeMatch: '^/handbook' },
      { text: '参考资源', items: references },
    ],
    // 动手教程按步骤推进；流程、规则和场景实践作为随时可查的参考。
    sidebar: [
      {
        text: '开始使用',
        collapsed: false,
        items: [
          { text: '教程概览', link: '/getting-started#what-you-build' },
          { text: '核心理念', link: '/guide/workflow#concepts' },
        ],
      },
      {
        text: '动手教程 · 六步接入与实践',
        collapsed: false,
        items: [
          { text: '01 · 进入项目，检查 Node.js', link: '/getting-started' },
          { text: '02 · 安装 AI Code', link: '/tutorial/install-ai-code' },
          { text: '03 · 运行初始化', link: '/tutorial/initialize' },
          { text: '04 · 查看状态', link: '/tutorial/check-status' },
          { text: '05 · 完善项目档案', link: '/tutorial/project-rules' },
          { text: '06 · 根据图片生成页面', link: '/tutorial/first-page' },
        ],
      },
      {
        text: '继续练习 · 订单页面',
        collapsed: true,
        items: [
          { text: '复制订单号', link: '/examples/query-first-step' },
          { text: '一键查看失败订单', link: '/tutorial/query-summary' },
          { text: '把问题说清楚，让 AI 修复', link: '/tutorial/test-and-fix' },
          { text: '检查页面，整理交付说明', link: '/tutorial/review-and-deliver' },
        ],
      },
      {
        text: '范式与流程',
        collapsed: true,
        items: [
          { text: '需求拆解 · Plan', link: '/guide/workflow#plan' },
          { text: '代码生成 · Implement', link: '/guide/workflow#implement' },
          { text: '代码审查 · Review', link: '/guide/workflow#review' },
        ],
      },
      {
        text: '规则与配置',
        collapsed: true,
        items: [
          { text: 'AGENTS.md 模板', link: '/rules/agents-template#agents-md' },
          { text: '.cursorrules 兼容模板', link: '/rules/agents-template#cursorrules' },
          { text: 'Cursor MDC 规则', link: '/rules/agents-template#mdc' },
          { text: 'MCP 工具接入', link: '/rules/agents-template#mcp' },
        ],
      },
      {
        text: '最佳实践',
        collapsed: true,
        items: [
          { text: '前端场景', link: '/guide/workflow#frontend' },
          { text: '后端场景', link: '/guide/workflow#backend' },
          { text: '测试场景', link: '/guide/workflow#testing' },
        ],
      },
      {
        text: '团队接入',
        collapsed: true,
        items: [{ text: 'AI Code 项目操作手册', link: '/handbook' }],
      },
    ],
    outline: { level: [2, 3], label: '本页目录' },
    search: {
      provider: 'local',
      options: {
        // 使用同一分词函数建立索引和查询，支持中文正文中的词语。
        miniSearch: {
          options: {
            tokenize: (text) => {
              if (typeof Intl.Segmenter === 'undefined') {
                return text.split(/[\s\p{P}]+/u).filter(Boolean)
              }
              return Array.from(
                new Intl.Segmenter('zh-CN', { granularity: 'word' }).segment(text),
              )
                .filter((part) => part.isWordLike)
                .map((part) => part.segment)
            },
          },
        },
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
              modal: {
                displayDetails: '显示详细结果',
                resetButtonTitle: '清空搜索',
                backButtonTitle: '关闭搜索',
                noResultsText: '未找到相关结果',
                footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
              },
            },
          },
        },
      },
    },
    socialLinks: [
      {
        icon: 'github',
        link: repository || aiCodeRepository,
        ariaLabel: repository ? '文档 GitHub 仓库' : 'AI Code 源码仓库',
      },
    ],
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: {
      text: '最后更新',
      formatOptions: { dateStyle: 'medium', timeStyle: 'short' },
    },
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换为浅色模式',
    darkModeSwitchTitle: '切换为深色模式',
    sidebarMenuLabel: '文档导航',
    returnToTopLabel: '返回顶部',
    skipToContentLabel: '跳转到正文',
    footer: {
      message: '以明确的需求开始，以可验证的交付结束。',
      copyright: 'AI Programming Paradigm · AI 编程范式',
    },
  },
})
