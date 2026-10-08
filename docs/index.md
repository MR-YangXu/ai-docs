---
layout: home
title: 首页
titleTemplate: AI 编程范式 · 从真实项目开始
description: 在现有项目中使用 Node.js 22，安装并初始化 AI Code，完善档案后按截图生成页面。
hero:
  name: AI 编程范式
  text: 在真实项目里，边做边学。
  tagline: 检查环境、安装依赖、初始化规则、查看状态、完善档案，再让 AI 按截图生成页面。
  actions:
    - theme: brand
      text: 开始动手 →
      link: /getting-started
    - theme: alt
      text: AI Code 接入手册
      link: /handbook
features:
  - title: 01 · 进入现有项目
    details: 打开业务项目根目录，检查并切换到 Node.js 22。
    link: /getting-started
    linkText: 准备项目环境
  - title: 02 · 安装 AI Code
    details: 执行 npm i @agent-xy/ai-code，将 AI Code 安装到当前项目。
    link: /tutorial/install-ai-code
    linkText: 安装项目依赖
  - title: 03 · 运行初始化
    details: 执行 npx @agent-xy/ai-code init，选择场景，按需生成项目档案。
    link: /tutorial/initialize
    linkText: 生成项目规则
  - title: 04 · 查看状态
    details: 执行 npx ai-code status，核对配置、规则版本和检查命令映射。
    link: /tutorial/check-status
    linkText: 确认接入状态
  - title: 05 · 完善项目档案
    details: 如果选择生成 profile.md，复制提示词让 AI 根据项目补全，再人工审查。
    link: /tutorial/project-rules
    linkText: 复制档案提示词
  - title: 06 · 根据图片生成页面
    details: 下载订单管理参考图，附上页面提示词，让 AI 按现有规则实现并验收。
    link: /tutorial/first-page
    linkText: 获取图片和提示词
---
