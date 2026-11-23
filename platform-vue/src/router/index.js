import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 路由表：5 大模块（登录 / 商城 / 管理后台 / 大屏 / 移动端）
const routes = [
  { path: '/', redirect: '/mall' },
  { path: '/login', name: 'login', component: () => import('@/views/Login.vue'), meta: { title: '登录' } },
  {
    path: '/mall',
    component: () => import('@/layouts/MallLayout.vue'),
    children: [
      { path: '', name: 'mall-home', component: () => import('@/views/mall/Home.vue'), meta: { title: '商城首页' } },
      { path: 'products', name: 'mall-products', component: () => import('@/views/mall/Products.vue'), meta: { title: '全部农产品' } },
      { path: 'product/:id', name: 'mall-product', component: () => import('@/views/mall/ProductDetail.vue'), meta: { title: '商品详情' } },
      { path: 'trace', name: 'mall-trace', component: () => import('@/views/mall/Trace.vue'), meta: { title: '产品溯源' } },
      { path: 'cart', name: 'mall-cart', component: () => import('@/views/mall/Cart.vue'), meta: { title: '购物车' } },
      { path: 'checkout', name: 'mall-checkout', component: () => import('@/views/mall/Checkout.vue'), meta: { title: '确认订单', auth: true } },
      { path: 'orders', name: 'mall-orders', component: () => import('@/views/mall/Orders.vue'), meta: { title: '我的订单', auth: true } },
      { path: 'orders/:no', name: 'mall-order-detail', component: () => import('@/views/mall/OrderDetail.vue'), meta: { title: '订单详情', auth: true } },
      { path: 'profile', name: 'mall-profile', component: () => import('@/views/mall/Profile.vue'), meta: { title: '个人中心', auth: true } }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { auth: true, admin: true },              // 双重守卫：登录 + 管理员角色
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: ':page', name: 'admin-page', component: () => import('@/views/admin/AdminPage.vue'), meta: { auth: true, admin: true } }
      // :page 动态参数 + AdminPage 通用容器 = 配置驱动渲染
    ]
  },
  { path: '/screen', name: 'screen', component: () => import('@/views/Screen.vue'), meta: { title: '可视化大屏' } },
  { path: '/mobile', name: 'mobile', component: () => import('@/views/Mobile.vue'), meta: { title: '移动端' } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFound.vue'), meta: { title: '页面不存在' } }
]

// createWebHashHistory —— Hash 模式，适配 GitHub Pages 子路径部署
const router = createRouter({
  history: createWebHashHistory('/Smart-Farm/'),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved   // 按返回键时恢复原滚动位置
    return { top: 0 }
  }
})

// ⭐ 全局前置守卫 —— 管理员权限大门（按顺序执行 5 件事）
router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // ① 初始化 auth store（从 localStorage 恢复登录态）
  if (!auth.ready) await auth.init()

  // ② 设置浏览器标签页标题
  document.title = to.meta.title ? `${to.meta.title} · 智慧农业综合管理平台` : '智慧农业综合管理平台'

  // ③ 登录拦截：需要登录但没登 → 带 redirect 参数跳登录页
  if (to.meta.auth && !auth.isLogged) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // ④ 角色拦截：meta.admin=true，消费者角色直接踢回商城
  if (to.meta.admin && auth.role === 'consumer') {
    return { name: 'mall-home' }
  }

  // ⑤ 智能跳转：已登录还访问 /login → 按角色自动分流
  if (to.name === 'login' && auth.isLogged) {
    return auth.role === 'consumer' ? { name: 'mall-home' } : { name: 'admin-page', params: { page: 'dashboard' } }
  }

  return true
})

export default router
