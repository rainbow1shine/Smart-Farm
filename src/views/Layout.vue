<template>
  <div class="layout">
    <!-- 左侧栏 -->
    <aside class="side">
      <div class="brand">
        <div class="brand-logo">禾</div>
        <div class="brand-text">
          <div class="brand-title">智慧农业平台</div>
          <div class="brand-sub">Smart Agri Cloud</div>
        </div>
      </div>

      <nav class="nav">
        <div v-for="grp in navGroups" :key="grp.group" class="nav-group">
          <div class="g">{{ grp.group }}</div>
          <router-link
            v-for="it in grp.items"
            :key="it.path"
            :to="it.path"
            class="nav-item"
            :class="{ active: route.path === it.path }"
          >
            <component :is="it.icon" class="ni-ic" />
            <span>{{ it.title }}</span>
          </router-link>
        </div>
      </nav>

      <div class="side-foot">
        <div class="sf-title">当前角色</div>
        <el-tag effect="dark" type="success" round>{{ roleLabel[user.role] }}</el-tag>
      </div>
    </aside>

    <!-- 主内容 -->
    <div class="main">
      <!-- 顶部栏 -->
      <header class="topbar">
        <div class="crumb">
          <span class="crumb-home">Home</span>
          <span class="crumb-sep">/</span>
          <span class="crumb-now">{{ currentCrumb }}</span>
        </div>

        <div class="top-right">
          <!-- 角色切换 Pills -->
          <div class="role-switch">
            <div
              v-for="r in rolePills"
              :key="r.value"
              class="pill"
              :class="{ active: user.role === r.value }"
              @click="switchRole(r.value)"
              :title="'切换为' + r.label"
            >
              {{ r.label }}
            </div>
          </div>

          <!-- 协同入口 -->
          <template v-if="user.role === 'farmer' || user.role === 'agri'">
            <router-link to="/chat" class="ghost-btn" title="聊天">
              <ChatDotRound />
            </router-link>
            <router-link to="/videocall" class="ghost-btn" title="视频通话">
              <VideoCameraFilled />
            </router-link>
          </template>

          <!-- 通知 -->
          <el-badge :value="3" class="bell" :max="99">
            <button class="ghost-btn" @click="openAlarm" title="告警">
              <Bell />
            </button>
          </el-badge>

          <!-- 用户下拉 -->
          <el-dropdown trigger="click" @command="onUserCmd" class="user-drop">
            <div class="user-chip">
              <div class="avatar">{{ user.realName?.[0] || 'U' }}</div>
              <div class="u-text">
                <div class="u-name">{{ user.realName }}</div>
                <div class="u-role">{{ roleLabel[user.role] }}</div>
              </div>
              <el-icon class="u-arrow"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <div class="dd-user">
                  <div class="dd-avatar">{{ user.realName?.[0] || 'U' }}</div>
                  <div>
                    <div class="dd-name">{{ user.realName }}</div>
                    <div class="dd-sub">{{ user.parkName || '—' }}</div>
                    <el-tag size="small" type="success" effect="light" round>{{ roleLabel[user.role] }}</el-tag>
                  </div>
                </div>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 页面内容区 -->
      <main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown, SwitchButton, ChatDotRound, VideoCameraFilled, Bell } from '@element-plus/icons-vue'
import { ALL_MENUS, ROLE_GROUP_MAP, CHAT_GROUP, pathCrumbs } from '../router/menus'
import { roleMap, roleLabel } from '../mock/users'

const route = useRoute()
const router = useRouter()

// 用户状态（优先读取 localStorage）
const saved = JSON.parse(localStorage.getItem('smartUser') || 'null')
const user = reactive(saved || { username:'admin', realName:'平台管理员', role:'admin', phone:'13800000001', parkName:'智慧农业示范园区' })

// 持久化
watch(user, val => {
  try { localStorage.setItem('smartUser', JSON.stringify(val)) } catch {}
}, { deep: true })

// 可用角色 pill
const rolePills = [
  { value:'admin',    label:'管理员' },
  { value:'ops',      label:'运维' },
  { value:'farmer',   label:'农户' },
  { value:'agri',     label:'农技专家' },
  { value:'consumer', label:'消费者' },
]

// 当前角色过滤后的导航
const navGroups = computed(() => {
  const allowed = ROLE_GROUP_MAP[user.role] || []
  const groups = ALL_MENUS.filter(g => allowed.includes(g.group)).map(g => ({ ...g }))
  // 通讯协同仅 farmer / agri
  if (user.role === 'farmer' || user.role === 'agri') {
    groups.push({ ...CHAT_GROUP })
  }
  return groups
})

const currentCrumb = computed(() => pathCrumbs[route.path] || '控制台')

// 切换角色
function switchRole(role) {
  if (role === user.role) return
  Object.assign(user, roleMap[role])
  ElMessage.success(`已切换为「${roleMap[role].realName}」`)

  // 校验当前路径是否在新角色的可用菜单中
  const allowedGroups = ROLE_GROUP_MAP[role] || []
  let availableItems = ALL_MENUS.filter(g => allowedGroups.includes(g.group)).flatMap(g => g.items)
  if (role === 'farmer' || role === 'agri') availableItems = [...availableItems, ...CHAT_GROUP.items]

  const stillHere = availableItems.some(it => it.path === route.path)
  if (!stillHere && availableItems.length > 0) {
    router.replace(availableItems[0].path)
  }
}

function openAlarm() {
  router.push('/alarm')
}

function onUserCmd(cmd) {
  if (cmd === 'logout') {
    localStorage.removeItem('smartUser')
    router.replace('/login')
  }
}

onMounted(() => {
  if (!user.role) router.replace('/login')
})
</script>

<style scoped>
.layout { display:flex; height:100vh; overflow:hidden; }

/* ===== 左侧栏 ===== */
.side {
  width: 232px; flex:none; height:100vh;
  background: linear-gradient(180deg, #e6f5ec 0%, #d5efe1 60%, #c9ebd8 100%);
  border-right: 1px solid rgba(47,191,122,.12);
  display: flex; flex-direction: column;
}
.brand { display:flex; align-items:center; gap:12px; padding: 22px 20px 18px; border-bottom: 1px dashed rgba(47,191,122,.18); }
.brand-logo {
  width:44px; height:44px; border-radius: 12px;
  background: linear-gradient(135deg,#4cd98f,#2fbf7a);
  color:#fff; display:flex; align-items:center; justify-content:center;
  font-size: 24px; font-weight:800; letter-spacing: -1px;
  box-shadow: 0 4px 14px rgba(47,191,122,.35);
}
.brand-text .brand-title { font-size: 15px; font-weight: 700; color:#1c2b23; line-height:1.25; }
.brand-text .brand-sub { font-size: 11px; color:#6b8a79; margin-top:2px; letter-spacing: .5px; }

.nav { flex: 1; overflow-y:auto; padding: 14px 10px; }
.nav-group .g { font-size: 11.5px; color:#6b8a79; padding: 14px 12px 6px; letter-spacing: 1px; font-weight:600; text-transform: uppercase; }
.nav-item {
  display:flex; align-items:center; gap: 10px;
  padding: 10px 12px; margin-bottom: 4px;
  border-radius: 10px;
  color: #3e5a4b; font-size: 13.5px; text-decoration: none;
  transition: .18s all;
}
.nav-item:hover { background: rgba(47,191,122,.12); color:#1f9d5c; }
.nav-item.active {
  background: linear-gradient(135deg,#2fbf7a,#1f9d5c);
  color: #fff;
  box-shadow: 0 6px 16px rgba(31,157,92,.32);
}
.ni-ic { font-size: 17px; flex:none; width:18px; text-align:center; }

.side-foot { padding: 12px 18px 18px; border-top: 1px dashed rgba(47,191,122,.18); }
.sf-title { font-size: 11px; color:#6b8a79; margin-bottom: 8px; }

/* ===== 主区域 ===== */
.main { flex: 1; display:flex; flex-direction: column; min-width: 0; }
.topbar {
  height: 60px; flex:none;
  display:flex; align-items:center; justify-content: space-between;
  padding: 0 22px;
  background: #fff;
  border-bottom: 1px solid #e4ece7;
  box-shadow: 0 1px 4px rgba(31,120,75,.04);
}
.crumb { font-size: 13px; color: #8fa095; display:flex; align-items:center; gap: 6px; }
.crumb-home { color: #2fbf7a; font-weight: 600; }
.crumb-sep { color: #c8d5cd; }
.crumb-now { color: #1c2b23; font-weight: 600; }

.top-right { display:flex; align-items:center; gap: 14px; }

/* 角色切换 pills */
.role-switch {
  display:flex; background: #f1f7f3; border-radius: 999px; padding: 4px;
  border: 1px solid #e4ece7;
}
.role-switch .pill {
  padding: 5px 14px; border-radius: 999px; font-size: 12.5px; color:#5a6b61; cursor:pointer;
  transition: .2s; font-weight: 500; white-space: nowrap;
}
.role-switch .pill:hover { color:#1f9d5c; }
.role-switch .pill.active {
  background: linear-gradient(135deg,#4cd98f,#2fbf7a);
  color:#fff; font-weight:600; box-shadow: 0 2px 10px rgba(47,191,122,.35);
}

.ghost-btn {
  width: 36px; height: 36px; border-radius: 50%;
  border: 1px solid #e4ece7; background:#fff; color:#5a6b61;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; text-decoration:none; transition: .2s; font-size: 18px;
}
.ghost-btn:hover { color:#2fbf7a; border-color:#2fbf7a; background: #eefaf3; }

.bell { display:flex; }

/* 用户下拉 */
.user-drop { cursor:pointer; }
.user-chip {
  display:flex; align-items:center; gap: 10px;
  padding: 4px 12px 4px 4px;
  border-radius: 999px; border: 1px solid #e4ece7; background:#fff;
  transition: .2s;
}
.user-chip:hover { border-color:#2fbf7a; }
.avatar {
  width: 34px; height: 34px; border-radius: 50%; flex:none;
  background: linear-gradient(135deg,#4cd98f,#2fbf7a);
  color: #fff; display:flex; align-items:center; justify-content:center;
  font-weight: 700; font-size: 14px;
}
.u-text { line-height: 1.25; }
.u-name { font-size: 13px; color:#1c2b23; font-weight: 600; }
.u-role { font-size: 11px; color:#8fa095; }
.u-arrow { font-size: 13px; color:#8fa095; }

.dd-user {
  display:flex; gap:12px; padding: 10px 16px 14px;
  align-items:flex-start;
}
.dd-avatar {
  width: 44px; height: 44px; border-radius: 50%; flex:none;
  background: linear-gradient(135deg,#4cd98f,#2fbf7a);
  color:#fff; display:flex; align-items:center; justify-content:center;
  font-weight: 700; font-size: 17px;
}
.dd-name { font-size: 14px; font-weight: 700; color:#1c2b23; }
.dd-sub { font-size: 12px; color:#8fa095; margin: 2px 0 6px; }

/* ===== 内容区 ===== */
.content {
  flex: 1; overflow-y: auto; padding: 18px;
  background: linear-gradient(180deg,#f1f8f3 0%,#e8f3ec 220px,#f1f6f2 100%);
}

.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
