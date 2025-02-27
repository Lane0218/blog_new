import { defineThemeConfig } from 'vuepress-theme-plume'
import { navbar } from './navbar'
import notes from './notes/index'

/**
 * @see https://theme-plume.vuejs.press/config/basic/
 */
export default defineThemeConfig({
  logo: 'https://laneljc-1321736255.cos.ap-nanjing.myqcloud.com/pic/202501202043127.png',

  appearance: false,  // 配置 深色模式

  social: [
    { icon: 'github', link: 'https://github.com/Lane0218' },
    {
      icon: { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.15a.59.59 0 0 1-.592-.592v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H5.926a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.444h8.296Z" /></svg>', name: 'gitee' },
      link: 'https://gitee.com/Lane0218'
    },
    {
      icon: { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M4.693 13.638c-.497.568-1.363.63-1.712.63c-.648 0-1.144-.164-1.474-.488c-.313-.307-.478-.76-.489-1.346c-.025-1.358.744-2.762 2.074-2.762c.635 0 1.124.455 1.311.644a.34.34 0 0 0 .282.099a.38.38 0 0 0 .241-.159c.068-.087.135-.237.138-.401s-.057-.344-.243-.49a2.64 2.64 0 0 0-1.668-.591c-.819 0-1.627.376-2.218 1.033c-.621.691-.953 1.63-.935 2.646c.015.815.282 1.5.773 1.982c.528.518 1.3.791 2.235.791c1.097 0 1.776-.325 2.154-.597a.58.58 0 0 0 .24-.456a.7.7 0 0 0-.208-.497c-.23-.248-.448-.101-.503-.037Zm4.97-2.15a8 8 0 0 0-.698-.248q-.237-.072-.45-.131c-.922-.26-1.027-.5-1.017-.68c.022-.363.515-.853 1.352-.792c.607.045 1.015.509 1.205.781c.149.214.371.135.434.095a.6.6 0 0 0 .309-.514a.63.63 0 0 0-.209-.488a2.654 2.654 0 0 0-3.347-.273c-.456.323-.744.772-.77 1.202c-.064 1.061 1.015 1.366 1.803 1.588c.214.061.429.127.667.202c1.14.357 1.173.717 1.092 1.267c-.082.556-.696.834-1.685.761c-1.029-.076-1.464-.61-1.612-.901c-.05-.098-.205-.248-.413-.156c-.514.229-.473.731-.26.993c.339.416 1.15 1.035 2.667 1.035c1.734 0 2.255-.875 2.378-1.64c.092-.572-.022-1.028-.348-1.396c-.236-.267-.592-.495-1.101-.706Zm6.777-2.165c-.598-.431-1.393-.61-2.36-.532c-.712.058-1.274.243-1.335.263l-.006.002a.44.44 0 0 0-.297.379l-.47 5.201a.34.34 0 0 0 .247.35l.072.02l.066.018l.086.021a8 8 0 0 0 1.64.183c.972 0 1.765-.23 2.36-.684c.764-.583 1.141-1.5 1.118-2.725c-.021-1.135-.398-1.974-1.121-2.495Zm-.662 4.461c-.836.639-2.09.562-2.677.481a.13.13 0 0 1-.109-.137l.397-4.248a.11.11 0 0 1 .086-.1c.999-.241 1.777-.168 2.312.218c.189.137.348.331.471.568c.176.339.277.765.286 1.234c.017.916-.24 1.583-.765 1.984Zm8.189-3.374a1.9 1.9 0 0 0-.432-.919c-.399-.465-1.029-.689-1.848-.689c-.734 0-1.372.228-1.947.799c.007-.086.019-.159.018-.223s-.017-.116-.066-.163c-.048-.045-.077-.067-.127-.077s-.122-.008-.256-.006a.587.587 0 0 0-.589.54s-.325 3.874-.428 5.165a.3.3 0 0 0 .073.228a.36.36 0 0 0 .26.131h.387a.224.224 0 0 0 .226-.205l.273-2.929l.014-.147a2 2 0 0 1 .082-.412q.021-.068.047-.14c.245-.694.803-1.72 1.971-1.694c.84.018 1.449.455 1.385 1.114c-.101 1.034-.266 3.1-.358 4.14c-.019.209.182.273.252.273h.304a.44.44 0 0 0 .444-.404s.185-2.127.294-3.352l.048-.532a2 2 0 0 0-.026-.5Z"/></svg>', name: 'csdn' },
      link: 'https://blog.csdn.net/Lane0218'
    },
    { icon: { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M20 18h-2V9.25L12 13L6 9.25V18H4V6h1.2l6.8 4.25L18.8 6H20m0-2H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2"/></svg>', name: 'mail' }, link: 'mailto:laneljc@qq.com' },
  ],
  navbarSocialInclude: ['github', 'gitee', 'csdn'], // 允许显示在导航栏的 social 社交链接
  aside: true, // 页内侧边栏， 默认显示在右侧
  outline: [2, 3], // 页内大纲， 默认显示 h2, h3

  /**
   * 文章版权信息
   * @see https://theme-plume.vuejs.press/guide/features/copyright/
   */
  // copyright: true,

  prevPage: true,   // 是否启用上一页链接
  nextPage: true,   // 是否启用下一页链接
  createTime: true, // 是否显示文章创建时间

  /* 站点页脚 */
  footer: {
    // message: 'Power by <a target="_blank" href="https://v2.vuepress.vuejs.org/">VuePress</a> & <a target="_blank" href="https://theme-plume.vuejs.press">vuepress-theme-plume</a>',
    message: '',
    copyright: 'Copyright © 2025 Lane',
  },

  /**
   * @see https://theme-plume.vuejs.press/config/basic/#profile
   */
  profile: {
    avatar: '/images/logo.png',
    name: 'Lane',
    description: '探索未知，解码未来',
    circle: true,
    location: '',
    organization: '',
    layout: 'left', // 个人信息在左侧还是右侧，'left' | 'right'
  },

  navbar,
  notes,

  /**
   * 公告板
   * @see https://theme-plume.vuejs.press/guide/features/bulletin/
   */
  // bulletin: {
  //   layout: 'top-right',
  //   contentType: 'markdown',
  //   title: '公告板标题',
  //   content: '公告板内容',
  // },

  /* 过渡动画 @see https://theme-plume.vuejs.press/config/basic/#transition */
  transition: {
    page: true,        // 启用 页面间跳转过渡动画
    postList: true,    // 启用 博客文章列表过渡动画
    // appearance: 'fade',  // 启用 深色模式切换过渡动画, 或配置过渡动画类型
  },

})
