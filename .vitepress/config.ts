import { defineConfig } from 'vitepress'

// 从仓库根目录运行 vitepress；Markdown 内容位于 docs/。
// 子路径部署时设置 DOCS_BASE=/ai-doc/，值应以前后斜杠包围。
const base = process.env.DOCS_BASE || '/'
const repository = process.env.DOCS_REPOSITORY_URL?.replace(/\/$/, '')
const references = [
  { text: 'AI Developer Guide', link: 'https://github.com/dwmkerr/ai-developer-guide' },
  { text: 'Awesome Cursor Rules', link: 'https://github.com/tugkanboz/awesome-cursorrules' },
  { text: 'AI Code Guide', link: 'https://github.com/automata/aicodeguide' },
]

export default defineConfig({
  lang: 'zh-CN',
  title: 'AI 编程范式',
  titleTemplate: ':title · AI 编程范式',
  description: '让 AI 编程从盲目生成走向可验证交付：规划、执行、复核，以及可复用的团队规则。',
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
      { text: '开始使用', link: '/getting-started', activeMatch: '^/getting-started' },
      { text: '规则与配置', link: '/rules/agents-template', activeMatch: '^/rules/' },
      { text: '项目操作手册', link: '/handbook', activeMatch: '^/handbook' },
      { text: '参考资源', items: references },
    ],
    // 核心内容先集中在两篇文档，使用显式锚点提供分组导航。
    // 拆成独立页面时，只需将对应 link 替换为新路由。
    sidebar: [
      {
        text: '开始使用',
        collapsed: false,
        items: [
          { text: '快速上手', link: '/getting-started' },
          { text: '核心理念', link: '/getting-started#concepts' },
        ],
      },
      {
        text: '范式与流程',
        collapsed: false,
        items: [
          { text: '需求拆解 · Plan', link: '/getting-started#plan' },
          { text: '代码生成 · Implement', link: '/getting-started#implement' },
          { text: '代码审查 · Review', link: '/getting-started#review' },
        ],
      },
      {
        text: '规则与配置',
        collapsed: false,
        items: [
          { text: 'AGENTS.md 模板', link: '/rules/agents-template#agents-md' },
          { text: '.cursorrules 兼容模板', link: '/rules/agents-template#cursorrules' },
          { text: 'Cursor MDC 规则', link: '/rules/agents-template#mdc' },
          { text: 'MCP 工具接入', link: '/rules/agents-template#mcp' },
        ],
      },
      {
        text: '最佳实践',
        collapsed: false,
        items: [
          { text: '前端场景', link: '/getting-started#frontend' },
          { text: '后端场景', link: '/getting-started#backend' },
          { text: '测试场景', link: '/getting-started#testing' },
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
        // 未提供本项目仓库地址时，明确链接到已核实的参考项目。
        link: repository || references[0].link,
        ariaLabel: repository ? '本项目 GitHub 仓库' : '参考项目：AI Developer Guide',
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
