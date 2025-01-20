import { defineNoteConfig } from 'vuepress-theme-plume'

export default defineNoteConfig({
    dir: 'KB',
    link: '/KB/',
    sidebar: [
        'README.md',
        {
            text: '数据结构与算法',
            prefix: '1.algorithms',
            items: "auto"
            // items: [
            //     '1.note.md',
            //     '2.lab1.md',
            //     '3.lab2.md',
            //     '4.lab3.md'
            // ]
        },
        {
            text: '数字逻辑与计算机体系结构',
            prefix: '2.DDCA',
            items: "auto"
        },
        {
            text: '计算机系统',
            prefix: '3.CSAPP',
            items: "auto"
        },
        {
            text: '计算机网络',
            prefix: '4.network',
            items: "auto"
        },
    ]
})