import { defineNavbarConfig } from 'vuepress-theme-plume'

export const navbar = defineNavbarConfig([
  { text: '首页', link: '/' },
  { text: '博客', link: '/blog/' },
  { text: '知识库', link: '/notes/KB/README.md' },
  { text: '友链', link: '/friends/' },
])
