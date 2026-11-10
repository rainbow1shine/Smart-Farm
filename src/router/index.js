import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path:'/', redirect:'/login' },
  { path:'/login',    name:'Login',    component:()=>import('../views/Login.vue'),    meta:{ title:'登录', public:true } },
  { path:'/register', name:'Register', component:()=>import('../views/Register.vue'), meta:{ title:'注册', public:true } },
  {
    path:'/', component:()=>import('../views/Layout.vue'), meta:{ requiresAuth:true },
    children: [
      { path:'dashboard', component:()=>import('../pages/Dash.vue') },
      { path:'ai',        component:()=>import('../pages/Ai.vue') },
      { path:'env',       component:()=>import('../pages/Env.vue') },
      { path:'video',     component:()=>import('../pages/Video.vue') },
      { path:'control',   component:()=>import('../pages/Control.vue') },
      { path:'ops',       component:()=>import('../pages/Ops.vue') },
      { path:'fields',    component:()=>import('../pages/Fields.vue') },
      { path:'farm',      component:()=>import('../pages/Farm.vue') },
      { path:'agri',      component:()=>import('../pages/Agri.vue') },
      { path:'harvest',   component:()=>import('../pages/Harvest.vue') },
      { path:'trace',     component:()=>import('../pages/Trace.vue') },
      { path:'alarm',     component:()=>import('../pages/Alarm.vue') },
      { path:'prod',      component:()=>import('../pages/Prod.vue') },
      { path:'orders',    component:()=>import('../pages/Orders.vue') },
      { path:'sales',     component:()=>import('../pages/Sales.vue') },
      { path:'users',     component:()=>import('../pages/Users.vue') },
      { path:'log',       component:()=>import('../pages/Log.vue') },
      { path:'chat',      component:()=>import('../pages/Chat.vue') },
      { path:'videocall', component:()=>import('../pages/VideoCall.vue') },
      { path:'404',       component:()=>import('../views/NotFound.vue') },
    ],
  },
  { path:'/:pathMatch(.*)*', redirect:'/404' },
]
const router = createRouter({ history:createWebHashHistory(), routes })
router.beforeEach((to,_,next)=>{
  const user = JSON.parse(localStorage.getItem('smartUser')||'null')
  if (to.meta.requiresAuth && !user) next({ path:'/login', query:{ redirect:to.fullPath } })
  else if ((to.path==='/login'||to.path==='/register') && user) next('/dashboard')
  else next()
})
router.afterEach(()=>{
  const u = localStorage.getItem('smartUser')
  const p = location.hash.replace(/^#/, '')
  if (u) { /* 登录后 title 简单覆盖 */ }
})
export default router
