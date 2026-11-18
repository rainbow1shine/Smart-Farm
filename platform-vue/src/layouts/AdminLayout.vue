<template>
  <div class="admin-shell" :class="{ collapsed, mobile: isMobile }">
    <aside class="sidebar" :class="{ open: mobileOpen }">
      <div class="sb-brand">
        <AppLogo :compact="collapsed" title="智慧农业平台" subtitle="AGRI MANAGEMENT" />
      </div>
      <div v-if="!collapsed" class="sb-role">
        <span class="role-avatar" :style="{ background: auth.roleMeta.color }">{{ auth.roleMeta.short }}</span>
        <div>
          <b>{{ auth.roleMeta.name }}</b>
          <span>{{ auth.roleMeta.desc }}</span>
        </div>
      </div>
      <nav class="sb-nav">
        <div v-for="g in menus" :key="g.group" class="sb-group">
          <div v-if="!collapsed" class="sb-group-title">{{ g.group }}</div>
          <button
            v-for="item in g.items"
            :key="item.id"
            class="sb-item"
            :class="{ on: activeId === item.id }"
            :title="collapsed ? item.name : ''"
            @click="navTo(item)"
          >
            <span class="sb-icon"><component :is="item.icon" /></span>
            <span v-if="!collapsed" class="sb-name">{{ item.name }}</span>
            <span v-if="item.badge && !collapsed" class="sb-badge">{{ item.badge }}</span>
            <span v-else-if="item.badge" class="sb-dot"></span>
          </button>
        </div>
      </nav>
      <div class="sb-foot">
        <button class="sb-item" @click="$router.push('/mall')">
          <span class="sb-icon"><ShoppingBag /></span>
          <span v-if="!collapsed" class="sb-name">返回消费者商城</span>
        </button>
        <button class="sb-item" @click="$router.push('/screen')">
          <span class="sb-icon"><Monitor /></span>
          <span v-if="!collapsed" class="sb-name">可视化大屏</span>
        </button>
        <div v-if="!collapsed" class="sb-version">Vue 3.0 · Element Plus</div>
      </div>
    </aside>

    <div v-if="mobileOpen" class="sidebar-mask" @click="mobileOpen = false"></div>

    <div class="admin-main">
      <header class="topbar">
        <button class="tb-btn" aria-label="切换菜单" @click="toggleSidebar">
          <el-icon><Fold v-if="!collapsed && !isMobile" /><Expand v-else /></el-icon>
        </button>
        <div class="crumb">
          <span>{{ currentGroup }}</span>
          <el-icon><ArrowRight /></el-icon>
          <b>{{ currentTitle }}</b>
        </div>

        <button class="cmd-trigger" @click="openCommand">
          <el-icon><Search /></el-icon>
          <span>搜索页面 / 功能</span>
          <kbd>Ctrl K</kbd>
        </button>

        <div class="tb-right">
          <span class="env-badge" :class="{ on: auth.online }" title="后端连接状态" @click="refreshEnv">
            <i></i>{{ auth.online ? '后端已连接' : '本地演示' }}
          </span>
          <el-popover placement="bottom-end" :width="330" trigger="click">
            <template #reference>
              <button class="tb-btn" aria-label="告警通知">
                <el-icon><Bell /></el-icon>
                <span v-if="admin.openAlarms.length" class="tb-badge">{{ admin.openAlarms.length }}</span>
              </button>
            </template>
            <div class="notify-head">
              <b>待处置告警</b>
              <span class="link" @click="$router.push('/admin/alarm')">查看全部</span>
            </div>
            <div class="notify-list">
              <div v-for="a in admin.openAlarms.slice(0, 5)" :key="a.id" class="notify-row" @click="$router.push('/admin/alarm')">
                <span class="notify-dot" :class="a.level"></span>
                <div>
                  <b>{{ a.target }}</b>
                  <p>{{ a.desc }}</p>
                  <small>{{ a.time }}</small>
                </div>
              </div>
              <div v-if="!admin.openAlarms.length" class="empty-box" style="padding:26px">暂无待处置告警</div>
            </div>
          </el-popover>
          <el-tooltip content="全屏" placement="bottom">
            <button class="tb-btn" aria-label="全屏" @click="toggleFullscreen"><el-icon><FullScreen /></el-icon></button>
          </el-tooltip>
          <el-dropdown trigger="click" @command="onUserCommand">
            <button class="user-chip">
              <span class="avatar" :style="{ background: auth.roleMeta.color }">{{ auth.roleMeta.short }}</span>
              <span class="uinfo">
                <b>{{ auth.user?.name }}</b>
                <small>{{ auth.roleMeta.name }}</small>
              </span>
              <el-icon><ArrowDown /></el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>当前：{{ auth.user?.name }} · {{ auth.roleMeta.name }}</el-dropdown-item>
                <el-dropdown-item command="mall">返回商城</el-dropdown-item>
                <el-dropdown-item command="screen">打开大屏</el-dropdown-item>
                <el-dropdown-item divided command="reset">重置演示数据</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <main class="admin-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <el-dialog v-model="commandOpen" width="560px" :show-close="false" class="cmd-dialog" @opened="focusCmd">
      <div class="cmd-box">
        <div class="cmd-input">
          <el-icon><Search /></el-icon>
          <input ref="cmdInput" v-model="cmd" placeholder="输入页面名称，例如：订单、环境、用户…" @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)" @keydown.enter.prevent="runCmd" />
          <kbd>Esc</kbd>
        </div>
        <div class="cmd-list">
          <button v-for="(item, i) in cmdResults" :key="item.id" class="cmd-row" :class="{ on: i === cmdIndex }" @click="runCmd(item)">
            <span class="cmd-ico"><component :is="item.icon" /></span>
            <span class="cmd-name">{{ item.name }}</span>
            <span class="cmd-group">{{ item.group }}</span>
          </button>
          <div v-if="!cmdResults.length" class="empty-box" style="padding:30px">没有找到相关页面</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import AppLogo from '@/components/AppLogo.vue'
import { useAuthStore } from '@/stores/auth'
import { useAdminStore } from '@/stores/admin'
import { MENUS } from '@/data/menus'
import { getPageMeta } from '@/data/adminPages'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const admin = useAdminStore()

const collapsed = ref(false)
const mobileOpen = ref(false)
const isMobile = ref(false)
const commandOpen = ref(false)
const cmd = ref('')
const cmdInput = ref(null)
const cmdIndex = ref(0)

const menus = computed(() => MENUS[auth.role] || MENUS.farmer)
const activeId = computed(() => route.params.page || 'dashboard')
const currentTitle = computed(() => getPageMeta(activeId.value).title || '工作台')
const currentGroup = computed(() => {
  for (const g of menus.value) if (g.items.some(i => i.id === activeId.value)) return g.group
  return '平台'
})

const allMenuItems = computed(() => {
  const out = []
  for (const g of menus.value) for (const i of g.items) out.push({ ...i, group: g.group })
  return out
})
const cmdResults = computed(() => {
  const k = cmd.value.trim().toLowerCase()
  if (!k) return allMenuItems.value.slice(0, 8)
  return allMenuItems.value.filter(i => (i.name + i.group).toLowerCase().includes(k)).slice(0, 10)
})

watch(cmd, () => { cmdIndex.value = 0 })

function navTo(item) {
  if (item.jump === 'screen') return router.push('/screen')
  if (item.jump === 'mall') return router.push('/mall')
  router.push('/admin/' + item.id)
  mobileOpen.value = false
}
function toggleSidebar() {
  if (isMobile.value) mobileOpen.value = !mobileOpen.value
  else collapsed.value = !collapsed.value
}
function openCommand() {
  commandOpen.value = true
  cmd.value = ''
  cmdIndex.value = 0
}
function focusCmd() { cmdInput.value && cmdInput.value.focus() }
function move(d) {
  const len = cmdResults.value.length
  if (!len) return
  cmdIndex.value = (cmdIndex.value + d + len) % len
}
function runCmd(item) {
  const target = item && item.id ? item : cmdResults.value[cmdIndex.value]
  if (!target) return
  commandOpen.value = false
  navTo(target)
}
async function onUserCommand(cmd) {
  if (cmd === 'logout') {
    auth.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } else if (cmd === 'mall') router.push('/mall')
  else if (cmd === 'screen') router.push('/screen')
  else if (cmd === 'reset') {
    try {
      await ElMessageBox.confirm('将把用户、订单、设备、告警等演示数据恢复为初始状态，确定继续？', '重置演示数据', { type: 'warning' })
      admin.resetDemo()
      ElMessage.success('演示数据已重置')
    } catch {}
  }
}
async function refreshEnv() {
  const { checkHealth } = await import('@/api/client')
  const ok = await checkHealth(true)
  auth.online = ok
  ElMessage[ok ? 'success' : 'info'](ok ? '后端已连接' : '当前为本地演示模式')
}
function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen()
  else document.documentElement.requestFullscreen?.()
}
function onKey(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    openCommand()
  }
  if (e.key === 'Escape' && commandOpen.value) commandOpen.value = false
}
function checkMobile() {
  isMobile.value = window.innerWidth <= 980
  if (!isMobile.value) mobileOpen.value = false
}
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.admin-shell { min-height: 100vh; background: transparent; }
.sidebar {
  position: fixed; inset: 0 auto 0 0; z-index: 60; width: 244px;
  background-image: linear-gradient(180deg, #b7d7a8 0%, #cde8c7 100%);
  color: #2f5238; display: flex; flex-direction: column;
  border-right: 1px solid rgba(31, 53, 38, .12);
  transition: width .2s ease, transform .24s ease;
}
.sb-brand { height: 68px; display: flex; align-items: center; padding: 0 18px; border-bottom: 1px solid rgba(31, 53, 38, .1); }
.sb-brand :deep(.text strong) { color: #1f3526; font-size: 14.5px; }
.sb-brand :deep(.text small) { color: #3f5c46; }
.sb-brand :deep(.mark) { background: #ffffff; color: #4f8b5a; box-shadow: 0 2px 6px rgba(31, 53, 38, .12); }
.sb-role { margin: 14px 14px 6px; padding: 10px 11px; border-radius: 12px; background: rgba(255, 255, 255, .55); border: 1px solid rgba(31, 53, 38, .08); display: flex; gap: 9px; align-items: center; overflow: hidden; }
.role-avatar { width: 30px; height: 30px; border-radius: 9px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; line-height: 1; flex: 0 0 30px; overflow: hidden; }
.sb-role b { display: block; font-size: 12.5px; color: #1f3526; }
.sb-role span:not(.role-avatar) { display: block; font-size: 10px; color: #4a6353; line-height: 1.45; margin-top: 2px; }
.sb-nav { flex: 1; overflow-y: auto; padding: 8px 10px 14px; scrollbar-width: thin; }
.sb-nav::-webkit-scrollbar { width: 5px; }
.sb-nav::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, .2); border-radius: 4px; }
.sb-group { margin-top: 12px; }
.sb-group-title { font-size: 10px; letter-spacing: 1.2px; color: rgba(31, 53, 38, .55); padding: 0 10px 6px; }
.sb-item { width: 100%; display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: none; background: transparent; color: #3d5c45; border-radius: 10px; cursor: pointer; font-size: 12.5px; text-align: left; margin-bottom: 1px; transition: background .15s, color .15s; position: relative; }
.sb-item:hover { background: rgba(255, 255, 255, .45); color: #1f3526; }
.sb-item.on { background: rgba(255, 255, 255, .7); color: #1f3526; font-weight: 600; box-shadow: none; }
.sb-item.on::before { content: ""; position: absolute; left: 0; top: 8px; bottom: 8px; width: 3px; border-radius: 0 3px 3px 0; background: #4f8b5a; }
.sb-icon { width: 17px; height: 17px; display: grid; place-items: center; font-size: 15px; flex: 0 0 17px; }
.sb-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sb-badge { margin-left: auto; min-width: 17px; height: 17px; padding: 0 4px; border-radius: 9px; background: #c4624f; color: #fff; font-size: 10px; line-height: 17px; text-align: center; }
.sb-dot { position: absolute; right: 10px; width: 6px; height: 6px; border-radius: 50%; background: #d47a5f; }
.sb-foot { padding: 8px 10px 16px; border-top: 1px solid rgba(255, 255, 255, .14); }
.sb-version { font-size: 9.5px; color: rgba(233, 250, 235, .5); padding: 8px 10px 0; letter-spacing: .4px; }
.admin-main { margin-left: 244px; min-height: 100vh; transition: margin-left .2s ease; display: flex; flex-direction: column; }
.collapsed .sidebar { width: 74px; }
.collapsed .admin-main { margin-left: 74px; }
.collapsed .sb-brand { padding: 0 17px; }
.collapsed .sb-item { justify-content: center; padding: 9px 0; }
.collapsed .sb-role { display: none; }
.topbar { position: sticky; top: 0; z-index: 30; height: 64px; background: linear-gradient(180deg, #b7d7a8 0%, #cde8c7 100%); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(31, 53, 38, .1); display: flex; align-items: center; gap: 14px; padding: 0 22px; }
.tb-btn { position: relative; width: 34px; height: 34px; border: 1px solid rgba(31, 53, 38, .12); background: rgba(255, 255, 255, .7); border-radius: 9px; color: #2f5238; display: grid; place-items: center; cursor: pointer; font-size: 15px; }
.tb-btn:hover { color: #1f3526; background: #ffffff; border-color: rgba(31, 53, 38, .26); }
.tb-badge { position: absolute; top: -5px; right: -5px; min-width: 16px; height: 16px; border-radius: 8px; background: #c65b4e; color: #fff; font-size: 9.5px; line-height: 16px; text-align: center; padding: 0 3px; border: 2px solid #cde8c7; }
.crumb { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: #2f5238; white-space: nowrap; }
.crumb b { color: #1f3526; font-weight: 600; }
.cmd-trigger { margin-left: 8px; width: 240px; height: 34px; display: flex; align-items: center; gap: 7px; padding: 0 10px; border: 1px solid var(--line); border-radius: 9px; background: #fff; color: var(--ink-400); font-size: 12px; cursor: pointer; }
.cmd-trigger:hover { border-color: var(--brand-300); color: var(--ink-500); }
.cmd-trigger kbd { margin-left: auto; font-size: 9.5px; border: 1px solid var(--line); background: var(--bg-soft); border-radius: 4px; padding: 1px 5px; color: var(--ink-300); }
.tb-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.env-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 10.5px; color: var(--ink-400); border: 1px solid var(--line); background: #fff; border-radius: 20px; padding: 4px 9px; cursor: pointer; white-space: nowrap; }
.env-badge i { width: 6px; height: 6px; border-radius: 50%; background: var(--ink-300); }
.env-badge.on { color: var(--brand-700); border-color: var(--brand-200); background: var(--brand-50); }
.env-badge.on i { background: #4f9a5b; box-shadow: 0 0 0 3px rgba(79,154,91,.14); }
.user-chip { display: flex; align-items: center; gap: 8px; border: 1px solid var(--line); background: #fff; border-radius: 22px; padding: 3px 9px 3px 4px; cursor: pointer; }
.avatar { width: 27px; height: 27px; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; line-height: 1; overflow: hidden; flex: 0 0 27px; }
.uinfo { display: flex; flex-direction: column; line-height: 1.25; text-align: left; }
.uinfo b { font-size: 11.5px; color: var(--ink-900); }
.uinfo small { font-size: 9.5px; color: var(--ink-400); }
.admin-content { flex: 1; }
.sidebar-mask { position: fixed; inset: 0; background: rgba(20, 35, 26, .32); z-index: 55; }
.notify-head { display: flex; align-items: center; justify-content: space-between; padding-bottom: 9px; border-bottom: 1px solid var(--line); }
.notify-head .link { font-size: 11.5px; color: var(--brand-600); cursor: pointer; }
.notify-list { max-height: 340px; overflow: auto; }
.notify-row { display: flex; gap: 9px; padding: 10px 2px; border-bottom: 1px solid #f3f5ef; cursor: pointer; }
.notify-row b { font-size: 12px; }
.notify-row p { font-size: 11.5px; color: var(--ink-500); line-height: 1.5; margin: 2px 0; }
.notify-row small { font-size: 10px; color: var(--ink-300); }
.notify-dot { width: 6px; height: 6px; border-radius: 50%; margin-top: 6px; background: #c28632; flex: 0 0 6px; }
.notify-dot.紧急 { background: #c65b4e; }
.notify-dot.重要 { background: #c98a2e; }
.cmd-box { margin: -10px -6px; }
.cmd-input { display: flex; align-items: center; gap: 10px; padding: 6px 8px 14px; border-bottom: 1px solid var(--line); color: var(--ink-400); }
.cmd-input input { flex: 1; border: none; outline: none; background: transparent; font-size: 14px; color: var(--ink-900); }
.cmd-input kbd { font-size: 10px; border: 1px solid var(--line); border-radius: 4px; padding: 2px 6px; color: var(--ink-300); }
.cmd-list { max-height: 360px; overflow: auto; padding-top: 8px; }
.cmd-row { width: 100%; display: flex; align-items: center; gap: 10px; padding: 9px 10px; border: none; background: transparent; border-radius: 8px; cursor: pointer; text-align: left; color: var(--ink-700); }
.cmd-row.on, .cmd-row:hover { background: var(--brand-50); color: var(--brand-800); }
.cmd-ico { width: 26px; height: 26px; border-radius: 7px; background: #fff; border: 1px solid var(--line); display: grid; place-items: center; font-size: 14px; color: var(--brand-600); }
.cmd-name { font-size: 13px; font-weight: 500; }
.cmd-group { margin-left: auto; font-size: 10.5px; color: var(--ink-400); }
@media (max-width: 1100px) {
  .cmd-trigger { width: 180px; }
  .cmd-trigger span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}
@media (max-width: 980px) {
  .sidebar { transform: translateX(-100%); width: 244px; }
  .sidebar.open { transform: translateX(0); }
  .admin-main { margin-left: 0 !important; }
  .sb-brand { padding: 0 18px; }
  .sb-role { display: flex; }
  .sb-item { justify-content: flex-start; padding: 8px 10px; }
  .collapsed .sidebar { width: 244px; }
  .cmd-trigger { display: none; }
  .env-badge { display: none; }
}
@media (max-width: 620px) {
  .topbar { padding: 0 12px; gap: 8px; height: 58px; }
  .crumb span, .crumb .el-icon { display: none; }
  .uinfo { display: none; }
  .user-chip { padding: 3px; }
}
</style>
