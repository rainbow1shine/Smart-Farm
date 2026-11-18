import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
    meta: { auth: true, admin: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: ':page', name: 'admin-page', component: () => import('@/views/admin/AdminPage.vue'), meta: { auth: true, admin: true } }
    ]
  },
  { path: '/screen', name: 'screen', component: () => import('@/views/Screen.vue'), meta: { title: '可视化大屏' } },
  { path: '/mobile', name: 'mobile', component: () => import('@/views/Mobile.vue'), meta: { title: '移动端' } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFound.vue'), meta: { title: '页面不存在' } }
]

const router = createRouter({
  history: createWebHashHistory('/Smart-Farm/'),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    return { top: 0 }
  }
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.ready) await auth.init()
  document.title = to.meta.title ? `${to.meta.title} · 智慧农业综合管理平台` : '智慧农业综合管理平台'
  if (to.meta.auth && !auth.isLogged) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.admin && auth.role === 'consumer') {
    return { name: 'mall-home' }
  }
  if (to.name === 'login' && auth.isLogged) {
    return auth.role === 'consumer' ? { name: 'mall-home' } : { name: 'admin-page', params: { page: 'dashboard' } }
  }
  return true
})

export default router
