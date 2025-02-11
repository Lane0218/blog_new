import { defineNoteConfig } from 'vuepress-theme-plume'

export default defineNoteConfig({
    dir: 'KB',
    link: '/KB/',
    sidebar: [
        'README.md',
        {
            text: '数据结构与算法',
            prefix: '1.algorithms',
            items: "auto",
            collapsed: true
        },
        {
            text: '数字逻辑与计算机体系结构',
            prefix: '2.DDCA',
            items: "auto",
            collapsed: true
        },
        {
            text: '计算机系统',
            prefix: '3.CSAPP',
            items: "auto",
            collapsed: true
        },
        {
            text: '计算机网络',
            prefix: '4.network',
            items: "auto",
            collapsed: true
        },
        {
            text: '算法设计与分析',
            prefix: '5.algorithms_2',
            items: "auto",
            collapsed: true
        },
    ]
})