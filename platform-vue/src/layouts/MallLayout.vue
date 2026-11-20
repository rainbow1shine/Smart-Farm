<template>
  <div class="mall-shell">
    <header class="mall-header" :class="{ scrolled }">
      <div class="mh-inner">
        <AppLogo title="智慧农业 · 农产品商城" subtitle="FRESH FROM THE FARM" />

        <nav class="mh-nav">
          <router-link to="/mall" exact-active-class="on">首页</router-link>
          <router-link to="/mall/products" active-class="on">全部农产品</router-link>
          <router-link to="/mall/trace" active-class="on">产品溯源</router-link>
          <router-link to="/mall/orders" active-class="on">我的订单</router-link>
        </nav>

        <div class="mh-search">
          <el-input v-model="keyword" placeholder="搜索番茄、草莓、大米…" clearable @keyup.enter="goSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>

        <div class="mh-actions">
          <el-popover placement="bottom-end" :width="340" trigger="click" popper-class="msg-pop">
            <template #reference>
              <button class="icon-btn" aria-label="消息中心">
                <el-icon><Bell /></el-icon>
                <span v-if="mall.unreadCount" class="badge">{{ mall.unreadCount }}</span>
              </button>
            </template>
            <div class="msg-pop-head">
              <b>消息中心</b>
              <span class="link" @click="mall.readAllMessages">全部已读</span>
            </div>
            <div class="msg-list">
              <div v-for="m in mall.messages.slice(0, 5)" :key="m.id" class="msg-row" :class="{ unread: !m.read }" @click="mall.readMessage(m.id)">
                <span class="msg-dot"></span>
                <div class="msg-main">
                  <div class="msg-title">{{ m.title }}</div>
                  <p>{{ m.text }}</p>
                  <small>{{ m.time }}</small>
                </div>
              </div>
              <div v-if="!mall.messages.length" class="empty-box" style="padding:24px">暂无消息</div>
            </div>
          </el-popover>

          <button class="icon-btn cart-btn" aria-label="购物车" @click="$router.push('/mall/cart')">
            <el-icon><ShoppingCart /></el-icon>
            <span v-if="cart.count" class="badge">{{ cart.count }}</span>
          </button>

          <el-dropdown v-if="auth.isLogged" trigger="click" @command="onCommand">
            <button class="user-btn">
              <span class="avatar">{{ auth.user?.name?.slice(0, 1) || '客' }}</span>
              <span class="uname">{{ auth.user?.name }}</span>
              <el-icon><ArrowDown /></el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="orders">我的订单</el-dropdown-item>
                <el-dropdown-item v-if="auth.role !== 'consumer'" command="admin">进入管理后台</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <button v-else class="login-btn" @click="toLogin">登录 / 注册</button>

          <button class="menu-btn" aria-label="打开菜单" @click="mobileOpen = true">
            <el-icon><Menu /></el-icon>
          </button>
        </div>
      </div>
    </header>

    <main class="mall-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="mall-footer">
      <div class="mf-inner">
        <div class="mf-brand">
          <AppLogo title="智慧农业 · 农产品商城" subtitle="FRESH FROM THE FARM" />
          <p>从地块到餐桌，每一口都有据可查。产地直供、当日采摘、冷链配送，让好农产品被看见。</p>
          <div class="mf-chips">
            <span>农残检测</span><span>一物一码</span><span>冷链直发</span><span>坏果包赔</span>
          </div>
        </div>
        <div class="mf-col">
          <h4>逛商城</h4>
          <router-link to="/mall/products">全部农产品</router-link>
          <router-link to="/mall/trace">产品溯源</router-link>
          <router-link to="/mall/orders">我的订单</router-link>
          <router-link to="/mall/profile">个人中心</router-link>
        </div>
        <div class="mf-col">
          <h4>平台入口</h4>
          <router-link to="/admin/dashboard">管理后台</router-link>
          <router-link to="/screen">可视化大屏</router-link>
          <router-link to="/mobile">移动端预览</router-link>
          <router-link to="/login">账号登录</router-link>
        </div>
        <div class="mf-col contact">
          <h4>服务与支持</h4>
          <p><el-icon><Phone /></el-icon> 400-880-2026</p>
          <p><el-icon><Clock /></el-icon> 每日 6:00 – 22:00</p>
          <p><el-icon><Location /></el-icon> 重庆市永川区卫星湖街道</p>
        </div>
      </div>
      <div class="mf-bottom">
        <span>© 2026 智慧农业综合管理平台 · Vue 3 版</span>
        <span>渝 ICP 备 2026000001 号 · 演示项目</span>
      </div>
    </footer>

    <nav class="mobile-tabbar">
      <router-link to="/mall" exact-active-class="on"><el-icon><HomeFilled /></el-icon><span>首页</span></router-link>
      <router-link to="/mall/products" active-class="on"><el-icon><Goods /></el-icon><span>产品</span></router-link>
      <router-link to="/mall/trace" active-class="on"><el-icon><Ticket /></el-icon><span>溯源</span></router-link>
      <router-link to="/mall/cart" active-class="on" class="tab-cart">
        <el-icon><ShoppingCart /></el-icon><span>购物车</span>
        <i v-if="cart.count">{{ cart.count }}</i>
      </router-link>
      <router-link to="/mall/profile" active-class="on"><el-icon><User /></el-icon><span>我的</span></router-link>
    </nav>

    <el-drawer v-model="mobileOpen" direction="rtl" size="82%" :with-header="false">
      <div class="mobile-menu">
        <AppLogo />
        <div class="mm-links">
          <router-link v-for="l in mobileLinks" :key="l.to" :to="l.to" @click="mobileOpen = false">{{ l.label }}</router-link>
        </div>
        <el-button v-if="!auth.isLogged" type="primary" class="w-full" @click="mobileOpen = false; toLogin()">登录 / 注册</el-button>
        <el-button v-else type="primary" class="w-full" @click="mobileOpen = false; router.push('/mall/profile')">进入个人中心 · {{ auth.user?.name }}</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AppLogo from '@/components/AppLogo.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useMallStore } from '@/stores/mall'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const mall = useMallStore()

const keyword = ref('')
const scrolled = ref(false)
const mobileOpen = ref(false)
const mobileLinks = computed(() => [
  { to: '/mall', label: '商城首页' },
  { to: '/mall/products', label: '全部农产品' },
  { to: '/mall/trace', label: '产品溯源' },
  { to: '/mall/orders', label: '我的订单' },
  { to: '/mall/cart', label: '购物车' },
  { to: '/mall/profile', label: '个人中心' },
  ...(auth.role !== 'consumer' ? [{ to: '/admin/dashboard', label: '管理后台' }] : []),
  { to: '/screen', label: '可视化大屏' }
])

function goSearch() {
  router.push({ path: '/mall/products', query: keyword.value ? { q: keyword.value } : {} })
}
function toLogin() {
  router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
}
function onCommand(cmd) {
  if (cmd === 'logout') {
    auth.logout()
    ElMessage.success('已退出登录')
    router.push('/mall')
  } else if (cmd === 'admin') router.push('/admin/dashboard')
  else router.push('/mall/' + cmd)
}
function onScroll() { scrolled.value = window.scrollY > 8 }

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.mall-shell { min-height: 100vh; background: transparent; display: flex; flex-direction: column; }
.mall-header {
  position: sticky; top: 0; z-index: 40;
  background: rgba(238, 248, 233, .92);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(31, 53, 38, .08);
  transition: border-color .2s, box-shadow .2s;
}
.mall-header.scrolled { border-color: rgba(31, 53, 38, .14); box-shadow: 0 8px 24px rgba(31, 53, 38, .06); }
.mall-header :deep(.text strong) { color: #1f3526; }
.mall-header :deep(.text small) { color: #5f7768; }
.mall-header :deep(.mark) { background: #ffffff; color: var(--brand-600); box-shadow: 0 2px 6px rgba(31, 53, 38, .1); }
.mh-inner { max-width: 1280px; margin: 0 auto; height: 70px; padding: 0 22px; display: flex; align-items: center; gap: 26px; }
.mh-nav { display: flex; align-items: center; gap: 4px; }
.mh-nav a { position: relative; padding: 8px 11px; font-size: 13.5px; color: var(--ink-500); border-radius: 8px; transition: color .15s, background .15s; }
.mh-nav a:hover { color: var(--ink-900); background: rgba(255, 255, 255, .6); }
.mh-nav a.on { color: var(--brand-700); font-weight: 600; }
.mh-nav a.on::after { content: ""; position: absolute; left: 50%; bottom: 1px; width: 16px; height: 2px; border-radius: 2px; background: var(--brand-500); transform: translateX(-50%); }
.mh-search { margin-left: auto; width: 230px; }
.mh-search :deep(.el-input__wrapper) { background: #fff; box-shadow: 0 0 0 1px var(--line) inset; border-radius: 20px; }
.mh-actions { display: flex; align-items: center; gap: 6px; }
.icon-btn { position: relative; width: 38px; height: 38px; border: 1px solid var(--line); background: #fff; border-radius: 50%; color: var(--ink-600, #4d5c53); cursor: pointer; display: grid; place-items: center; font-size: 17px; transition: all .15s; }
.icon-btn:hover { border-color: var(--brand-300); color: var(--brand-700); }
.badge { position: absolute; top: -4px; right: -4px; min-width: 17px; height: 17px; padding: 0 4px; border-radius: 9px; background: #cf5d4d; color: #fff; font-size: 10px; line-height: 17px; text-align: center; border: 2px solid var(--cream); }
.user-btn { display: flex; align-items: center; gap: 7px; height: 38px; padding: 0 10px 0 4px; border: 1px solid var(--line); background: #fff; border-radius: 20px; cursor: pointer; color: var(--ink-700); }
.avatar { width: 29px; height: 29px; border-radius: 50%; background: linear-gradient(135deg, #7ca66e, #426f4a); color: #fff; display: grid; place-items: center; font-size: 12px; }
.uname { font-size: 12.5px; max-width: 72px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.login-btn { height: 36px; padding: 0 16px; border: none; border-radius: 20px; background: var(--brand-600); color: #fff; font-size: 12.5px; cursor: pointer; }
.login-btn:hover { background: var(--brand-500); }
.menu-btn { display: none; width: 38px; height: 38px; border: 1px solid var(--line); background: #fff; border-radius: 50%; cursor: pointer; font-size: 18px; }
.mall-main { flex: 1; width: 100%; background: var(--cream); padding-bottom: 48px; }
.mall-footer { background: linear-gradient(180deg, #3f7d4b 0%, #5a9a60 100%); color: #e4f1dd; margin-top: 0; }
.mf-inner { max-width: 1240px; margin: 0 auto; padding: 46px 24px 30px; display: grid; grid-template-columns: 2fr 1fr 1fr 1.2fr; gap: 36px; }
.mf-brand p { margin: 14px 0 16px; font-size: 12.5px; line-height: 1.9; color: #cfe2ca; max-width: 330px; }
.mf-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.mf-chips span { font-size: 10.5px; border: 1px solid rgba(255,255,255,.22); border-radius: 20px; padding: 3px 9px; color: #dcecd6; }
.mf-col h4 { color: #f0f9eb; font-size: 13px; margin-bottom: 14px; }
.mf-col a, .mf-col p { display: block; font-size: 12.5px; color: #cfe2ca; margin-bottom: 9px; }
.mf-col a:hover { color: #ffffff; }
.mf-col.contact p { display: flex; align-items: center; gap: 7px; }
.mf-bottom { border-top: 1px solid rgba(255,255,255,.16); max-width: 1240px; margin: 0 auto; padding: 16px 24px; display: flex; justify-content: space-between; font-size: 11px; color: #b9d3b4; gap: 12px; flex-wrap: wrap; }
.msg-pop-head { display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid var(--line); }
.msg-pop-head .link { font-size: 11.5px; color: var(--brand-600); cursor: pointer; }
.msg-list { max-height: 360px; overflow: auto; }
.msg-row { display: flex; gap: 9px; padding: 11px 4px; border-bottom: 1px solid #f2f4ee; cursor: pointer; }
.msg-row:hover { background: #fbfcf7; }
.msg-dot { width: 6px; height: 6px; border-radius: 50%; background: transparent; margin-top: 7px; flex: 0 0 6px; }
.msg-row.unread .msg-dot { background: #c65b4e; }
.msg-main { min-width: 0; }
.msg-title { font-size: 12.5px; font-weight: 600; }
.msg-main p { font-size: 11.5px; color: var(--ink-500); margin: 2px 0; line-height: 1.55; }
.msg-main small { font-size: 10.5px; color: var(--ink-300); }
.mobile-tabbar { display: none; }
.mobile-menu { padding: 8px 4px; }
.mm-links { display: flex; flex-direction: column; margin: 22px 0; }
.mm-links a { padding: 13px 4px; border-bottom: 1px solid var(--line); font-size: 14px; color: var(--ink-700); }
@media (max-width: 1080px) {
  .mh-search { display: none; }
  .mh-inner { gap: 16px; }
}
@media (max-width: 860px) {
  .mh-nav { display: none; }
  .mh-search { display: none; }
  .menu-btn { display: grid; place-items: center; }
  .mh-inner { height: 62px; padding: 0 14px; }
  .uname { display: none; }
  .mf-inner { grid-template-columns: 1fr 1fr; gap: 26px; padding: 32px 20px 22px; }
  .mf-brand { grid-column: 1 / -1; }
  .mall-main { padding-bottom: 62px; }
  .mobile-tabbar {
    display: flex; position: fixed; left: 0; right: 0; bottom: 0; z-index: 50;
    background: rgba(255,255,255,.96); backdrop-filter: blur(12px);
    border-top: 1px solid var(--line); padding: 6px 6px max(6px, env(safe-area-inset-bottom));
  }
  .mobile-tabbar a { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 10px; color: var(--ink-400); padding: 4px 0; position: relative; }
  .mobile-tabbar a .el-icon { font-size: 19px; }
  .mobile-tabbar a.on { color: var(--brand-600); }
  .mobile-tabbar .tab-cart i { position: absolute; top: -2px; right: 24%; background: #cf5d4d; color: #fff; font-style: normal; font-size: 9px; min-width: 14px; height: 14px; line-height: 14px; border-radius: 7px; padding: 0 3px; }
}
@media (max-width: 620px) {
  .mh-actions { gap: 4px; }
  .icon-btn { width: 34px; height: 34px; font-size: 15px; }
  .login-btn { padding: 0 12px; height: 34px; }
  .mf-inner { grid-template-columns: 1fr; }
  .mf-bottom { padding: 14px 20px; }
}
</style>
