import { defineNotesConfig } from 'vuepress-theme-plume';

export const notes = defineNotesConfig({
  dir: 'notes', // 笔记的根目录
  link: '/', // 笔记的访问链接前缀
  notes: [
    {
      dir: 'KB', // 笔记的主目录
      link: '/kb/', // 笔记的访问链接前缀
      sidebar: [
        '', // 自动生成根目录的侧边栏
        {
          dir: '1.algorithms',
          text: '数据结构与算法',
          icon: 'noto:books', // 图标（可选）
          collapsed: false, // 是否折叠
          items: 'auto', // 自动生成子目录的侧边栏
        },
        {
          dir: '2.DDCA',
          text: '数字逻辑与计算机体系结构',
          icon: 'carbon:cpu', // 图标（可选）
          collapsed: false,
          items: 'auto',
        },
        {
          dir: '3.CSAPP',
          text: '计算机系统',
          icon: 'carbon:server', // 图标（可选）
          collapsed: false,
          items: 'auto',
        },
        {
          dir: '4.network',
          text: '计算机网络',
          icon: 'carbon:network', // 图标（可选）
          collapsed: false,
          items: 'auto',
        },
      ],
    },
  ],
});