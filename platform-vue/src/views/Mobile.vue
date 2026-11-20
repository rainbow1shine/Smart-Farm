<template>
  <div class="mobile-page">
    <header class="mp-header">
      <AppLogo title="智慧农业 · 农产品商城" subtitle="MOBILE PREVIEW" />
      <div class="mp-actions">
        <el-button text @click="$router.push('/mall')">返回商城</el-button>
        <el-button text @click="$router.push('/screen')">可视化大屏</el-button>
        <el-button type="primary" size="small" @click="$router.push('/mall/products')">进入移动端商城</el-button>
      </div>
    </header>

    <main class="mp-main">
      <section class="mp-copy">
        <span class="kicker">MOBILE FIRST · 随时随地</span>
        <h1>把农场<br /><em>装进口袋里</em></h1>
        <p>消费者移动端支持商品浏览、购物车、下单支付、订单跟踪和溯源查询。响应式布局适配手机屏幕，也可以在桌面端预览交互效果。</p>
        <div class="mp-points">
          <div><span>🛒</span><div><b>随时下单</b><small>商品、购物车、结算一气呵成</small></div></div>
          <div><span>🔎</span><div><b>扫码溯源</b><small>环境、农事、检测随时查看</small></div></div>
          <div><span>📦</span><div><b>订单跟踪</b><small>发货、运输、签收全程可见</small></div></div>
          <div><span>💬</span><div><b>消息提醒</b><small>订单状态与活动通知及时触达</small></div></div>
        </div>
        <div class="mp-actions-row">
          <el-button type="primary" size="large" @click="$router.push('/mall')">打开完整商城</el-button>
          <el-button size="large" @click="$router.push('/login?redirect=/mobile')">消费者登录</el-button>
        </div>
        <div class="mp-note">
          <el-icon><InfoFilled /></el-icon>
          <span>提示：商城页面本身已做响应式适配，把浏览器宽度缩小到 860px 以下即可看到真实的移动端布局。</span>
        </div>
      </section>

      <section class="mp-preview">
        <div class="phone">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <div class="status-bar">
              <span>9:41</span>
              <span class="sb-right">📶 5G ▮▮▮</span>
            </div>

            <div class="app-head">
              <div class="ah-brand">
                <span class="ah-mark">{{ isStaff ? '🧭' : '🌾' }}</span>
                <div>
                  <b>{{ isStaff ? '鲜农移动办公' : '鲜农商城' }}</b>
                  <small>{{ isStaff ? '田间与管理 · 随时处理' : '产地直供 · 当日现摘' }}</small>
                </div>
              </div>
              <div class="ah-icons">
                <span @click="notify">🔔</span>
                <span v-if="!isStaff" class="cart" @click="goCart">🛒<i v-if="cart.count">{{ cart.count }}</i></span>
              </div>
            </div>

            <div class="app-body">
              <!-- 农户 / 运维：移动办公 -->
              <template v-if="isStaff">
                <template v-if="activeTab === 'home'">
                  <div class="m-work-hero">
                    <span>{{ staffRoleName }} · 移动工作台</span>
                    <b>{{ greeting }}，{{ auth.user?.name || '同事' }}</b>
                    <small>{{ isAgri ? `${pendingConsults.length} 条农户咨询待回复` : isFarmer ? `今日 ${pendingWorkorders.length} 项农事待处理` : `${offlineDevices.length} 台设备离线待排查` }}</small>
                  </div>
                  <div class="m-work-stats">
                    <template v-if="isAgri">
                      <div><b>{{ pendingConsults.length }}</b><span>待回复</span></div>
                      <div><b>{{ admin.consults.length }}</b><span>累计咨询</span></div>
                      <div><b>{{ admin.strategies.length }}</b><span>技术方案</span></div>
                    </template>
                    <template v-else>
                      <div><b>{{ pendingWorkorders.length }}</b><span>待办工单</span></div>
                      <div><b>{{ staffAlarms.length }}</b><span>待处置告警</span></div>
                      <div><b>{{ onlineRate }}%</b><span>设备在线</span></div>
                    </template>
                  </div>
                  <div class="m-work-actions">
                    <button v-for="a in staffActions" :key="a.label" @click="onStaffAction(a)">
                      <span>{{ a.icon }}</span><b>{{ a.label }}</b>
                    </button>
                  </div>
                  <div class="m-section-head">
                    <b>{{ isAgri ? '待回复咨询' : isFarmer ? '今日农事' : '设备异常' }}</b>
                    <span @click="activeTab = 'tasks'">全部 ›</span>
                  </div>
                  <div class="m-work-list">
                    <template v-if="isAgri">
                      <div v-for="c in pendingConsults.slice(0, 4)" :key="c.id" class="m-work-item">
                        <span class="mwi-dot"></span>
                        <div><b>{{ c.title }}</b><small>{{ c.from }} · {{ c.plot }}</small></div>
                        <em>{{ c.status }}</em>
                      </div>
                      <div v-if="!pendingConsults.length" class="m-empty">暂无待回复咨询</div>
                    </template>
                    <template v-else>
                      <div v-for="w in (isFarmer ? myWorkorders : offlineDevices)" :key="w.id" class="m-work-item">
                        <span class="mwi-dot"></span>
                        <div>
                          <b>{{ isFarmer ? w.title : w.name }}</b>
                          <small>{{ isFarmer ? `${plotName(w.plot)} · ${w.status}` : `${plotName(w.plot)} · 离线` }}</small>
                        </div>
                        <em v-if="isFarmer">{{ w.progress }}%</em>
                      </div>
                      <div v-if="!(isFarmer ? myWorkorders.length : offlineDevices.length)" class="m-empty">暂无待处理事项</div>
                    </template>
                  </div>
                </template>

                <template v-else-if="activeTab === 'tasks'">
                  <div class="m-sub-head"><b>{{ isAgri ? '农户咨询' : isFarmer ? '农事工单' : '设备列表' }}</b></div>
                  <div v-if="isAgri" class="m-work-list">
                    <div v-for="c in agriConsults" :key="c.id" class="m-work-item">
                      <span class="mwi-dot" :class="{ off: c.status === '已回复' }"></span>
                      <div><b>{{ c.title }}</b><small>{{ c.from }} · {{ c.plot }} · {{ c.time.slice(5) }}</small></div>
                      <em :class="{ off: c.status === '已回复' }">{{ c.status }}</em>
                    </div>
                    <div v-if="!agriConsults.length" class="m-empty">暂无农户咨询</div>
                  </div>
                  <div v-else-if="isFarmer" class="m-work-list">
                    <div v-for="w in pendingWorkorders" :key="w.id" class="m-work-item">
                      <span class="mwi-dot"></span>
                      <div><b>{{ w.title }}</b><small>{{ plotName(w.plot) }} · {{ w.type }} · {{ w.status }}</small></div>
                      <em>{{ w.progress }}%</em>
                    </div>
                    <div v-if="!pendingWorkorders.length" class="m-empty">今日工单已全部完成</div>
                  </div>
                  <div v-else class="m-work-list">
                    <div v-for="d in admin.devices" :key="d.id" class="m-work-item">
                      <span class="mwi-dot" :class="{ off: !d.online }"></span>
                      <div><b>{{ d.name }}</b><small>{{ plotName(d.plot) }} · {{ d.status }}</small></div>
                      <em :class="{ off: !d.online }">{{ d.online ? '在线' : '离线' }}</em>
                    </div>
                  </div>
                </template>

                <template v-else-if="activeTab === 'plans'">
                  <div class="m-sub-head"><b>技术方案</b></div>
                  <div class="m-work-list">
                    <div v-for="s in admin.strategies" :key="s.id" class="m-work-item">
                      <span class="mwi-dot" :class="{ off: !s.on }"></span>
                      <div><b>{{ s.name }}</b><small>{{ plotName(s.plot) }} · {{ s.cond }}</small></div>
                      <em :class="{ off: !s.on }">{{ s.on ? '启用' : '停用' }}</em>
                    </div>
                    <div v-if="!admin.strategies.length" class="m-empty">暂无技术方案</div>
                  </div>
                </template>

                <template v-else-if="activeTab === 'alarms'">
                  <div class="m-sub-head"><b>实时告警</b></div>
                  <div class="m-work-list">
                    <div v-for="a in staffAlarms" :key="a.id" class="m-work-item">
                      <span class="mwi-dot" :class="{ off: a.level === '紧急' }"></span>
                      <div><b>{{ a.target }}</b><small>{{ a.desc }}</small></div>
                      <em>{{ a.level }}</em>
                    </div>
                    <div v-if="!staffAlarms.length" class="m-empty">暂无待处置告警</div>
                  </div>
                </template>

                <template v-else>
                  <div class="m-profile-head">
                    <div class="mp-avatar">{{ auth.user?.name?.slice(0, 1) || '农' }}</div>
                    <div><b>{{ auth.user?.name || '同事' }}</b><span>{{ staffRoleName }} · 移动办公</span></div>
                  </div>
                  <div class="m-profile-stats">
                    <template v-if="isAgri">
                      <div><b>{{ pendingConsults.length }}</b><span>待回复</span></div>
                      <div><b>{{ admin.consults.length }}</b><span>咨询</span></div>
                      <div><b>{{ admin.strategies.length }}</b><span>方案</span></div>
                    </template>
                    <template v-else>
                      <div><b>{{ pendingWorkorders.length }}</b><span>待办工单</span></div>
                      <div><b>{{ staffAlarms.length }}</b><span>告警</span></div>
                      <div><b>{{ onlineRate }}%</b><span>设备在线</span></div>
                    </template>
                  </div>
                  <div class="m-menu">
                    <button @click="$router.push('/admin/dashboard')"><span>🖥️</span><b>进入网页后台</b><em>完整管理功能</em><i>›</i></button>
                    <button @click="logoutStaff"><span>🚪</span><b>退出登录</b><em>切换账号</em><i>›</i></button>
                  </div>
                  <div class="m-profile-tip">🌾 田间移动办公 · 数据与后台实时同步</div>
                </template>
              </template>

              <!-- 消费者：商城 -->
              <template v-else>
              <template v-if="activeTab === 'home'">
                <div class="m-hero">
                  <div class="mh-copy">
                    <span>FRESH TODAY</span>
                    <b>今日现摘<br />新鲜到家</b>
                    <small>满 ¥59 包邮 · 主城次日达</small>
                    <button @click="activeTab = 'products'">去选购 →</button>
                  </div>
                  <span class="mh-emoji">🍅</span>
                </div>
                <div class="m-trust">
                  <span>🛡️ 农残检测</span><span>❄️ 冷链直发</span><span>💚 坏果包赔</span>
                </div>
                <div class="m-cats">
                  <button v-for="c in cats" :key="c.name" @click="activeTab = 'products'">
                    <span>{{ c.icon }}</span><small>{{ c.name }}</small>
                  </button>
                </div>
                <div class="m-section-head"><b>今日现摘</b><span @click="activeTab = 'products'">全部 ›</span></div>
                <div class="m-goods">
                  <div v-for="g in DB.goods.slice(0, 4)" :key="g.id" class="m-good" @click="openGoods(g)">
                    <span class="mg-emoji">{{ g.icon }}</span>
                    <b>{{ g.name }}</b>
                    <small>{{ g.spec }}</small>
                    <div class="mg-foot"><span>¥{{ g.price }}</span><button @click.stop="addCart(g)">+</button></div>
                  </div>
                </div>
                <div class="m-trace-card" @click="activeTab = 'trace'">
                  <div><b>扫一扫，看看它从哪来</b><span>环境 · 农事 · 检测全程可查</span></div>
                  <span class="mtc-qr">▦</span>
                </div>
              </template>

              <template v-else-if="activeTab === 'products'">
                <div class="m-search">
                  <span>🔍</span>
                  <input v-model="keyword" placeholder="搜索番茄、草莓、大米…" />
                </div>
                <div class="m-filter">
                  <button v-for="c in catFilters" :key="c" :class="{ on: cat === c }" @click="cat = c">{{ c }}</button>
                </div>
                <div class="m-list">
                  <div v-for="g in filteredGoods" :key="g.id" class="m-list-item" @click="openGoods(g)">
                    <span class="mli-emoji">{{ g.icon }}</span>
                    <div class="mli-main">
                      <b>{{ g.name }}</b>
                      <small>{{ g.spec }}</small>
                      <div class="mli-tags"><span>{{ g.tag }}</span><span v-if="g.trace !== '—'">可溯源</span></div>
                      <div class="mli-foot"><span class="price">¥{{ g.price }}</span><button @click.stop="addCart(g)">加入</button></div>
                    </div>
                  </div>
                  <div v-if="!filteredGoods.length" class="m-empty">没有找到相关商品</div>
                </div>
              </template>

              <template v-else-if="activeTab === 'trace'">
                <div class="m-trace-head">
                  <b>产品溯源</b>
                  <span>一物一码 · 全程可查</span>
                </div>
                <div class="m-trace-search">
                  <input v-model="traceCode" placeholder="输入溯源码" />
                  <button @click="queryTrace">查询</button>
                </div>
                <div class="m-trace-codes">
                  <button v-for="t in DB.traces.filter(t => t.code !== '—').slice(0, 3)" :key="t.code" @click="traceCode = t.code; queryTrace()">{{ t.code }}</button>
                </div>
                <div class="m-trace-result">
                  <div class="mtr-top">
                    <span class="mtr-qr">▦</span>
                    <div><b>{{ traceInfo.code }}</b><span>{{ traceInfo.crop }}</span></div>
                    <em>合格</em>
                  </div>
                  <div class="mtr-pass">🛡️ 农残检测全部合格，可放心食用</div>
                  <div class="mtr-steps">
                    <div v-for="(s, i) in traceSteps" :key="i" class="mtr-step">
                      <span class="mtr-dot"></span>
                      <div><b>{{ s.title }}</b><p>{{ s.text }}</p></div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="activeTab === 'product'">
                <div class="m-sub-head"><button @click="back()">‹</button><b>商品详情</b></div>
                <template v-if="selectedGoods">
                  <div class="m-pd-cover">{{ selectedGoods.icon }}</div>
                  <div class="m-pd-card">
                    <b>{{ selectedGoods.name }}</b>
                    <small>{{ selectedGoods.spec }}</small>
                    <div class="m-pd-price">¥{{ selectedGoods.price }} <em>{{ selectedGoods.tag }}</em></div>
                    <p>产地直供，当日采摘后预冷发货，支持一物一码溯源查询。</p>
                    <button class="m-pd-buy" @click="addCart(selectedGoods)">加入购物车</button>
                  </div>
                </template>
              </template>

              <template v-else-if="activeTab === 'cart'">
                <div class="m-sub-head"><button @click="back()">‹</button><b>购物车（{{ cart.count }}）</b></div>
                <div v-if="cart.details.length" class="m-cart">
                  <div v-for="g in cart.details" :key="g.id" class="m-cart-item">
                    <span class="mci-emoji">{{ g.icon }}</span>
                    <div class="mci-main">
                      <b>{{ g.name }}</b>
                      <small>{{ g.spec }}</small>
                      <span class="mci-price">¥{{ g.price }}</span>
                    </div>
                    <div class="mci-qty">
                      <button @click="cart.setQty(g.id, g.qty - 1)">-</button>
                      <span>{{ g.qty }}</span>
                      <button @click="cart.setQty(g.id, g.qty + 1)">+</button>
                    </div>
                  </div>
                  <div class="m-cart-foot">
                    <span>合计 <b>¥{{ cart.subtotal.toFixed(2) }}</b></span>
                    <button @click="toCheckout">去结算</button>
                  </div>
                </div>
                <div v-else class="m-empty">购物车还是空的，去挑点新鲜的吧</div>
              </template>

              <template v-else-if="activeTab === 'orders'">
                <div class="m-sub-head"><button @click="back()">‹</button><b>我的订单</b></div>
                <div v-if="!auth.isLogged" class="m-empty">登录后即可查看订单</div>
                <div v-else-if="!mall.orders.length" class="m-empty">还没有订单，去逛逛吧</div>
                <div v-else class="m-orders">
                  <div v-for="o in mall.orders" :key="o.no" class="m-order">
                    <div class="mo-top"><b>{{ o.no }}</b><em>{{ o.status }}</em></div>
                    <div class="mo-goods">{{ o.goods }}</div>
                    <div class="mo-foot"><span>{{ o.time }}</span><strong>¥{{ o.amount }}</strong></div>
                  </div>
                </div>
              </template>

              <template v-else>
                <div class="m-profile-head">
                  <div class="mp-avatar">{{ auth.user?.name?.slice(0, 1) || '客' }}</div>
                  <div><b>{{ auth.user?.name || '商城用户' }}</b><span>{{ auth.isLogged ? '青梅会员 · 已登录' : '登录后享受更多权益' }}</span></div>
                  <button @click="goLogin">{{ auth.isLogged ? '个人中心' : '登录' }}</button>
                </div>
                <div class="m-profile-stats">
                  <div><b>{{ mall.orders.length }}</b><span>我的订单</span></div>
                  <div><b>{{ mall.favorites.length }}</b><span>收藏</span></div>
                  <div><b>{{ mall.unreadCount }}</b><span>消息</span></div>
                </div>
                <div class="m-menu">
                  <button v-for="m in profileMenus" :key="m.label" @click="onMenu(m)">
                    <span>{{ m.icon }}</span><b>{{ m.label }}</b><em>{{ m.hint }}</em><i>›</i>
                  </button>
                </div>
                <div class="m-profile-tip">🌾 产地直供 · 农残检测 · 坏果包赔</div>
              </template>
              </template>
            </div>

            <nav class="app-tabbar">
              <button v-for="t in tabs" :key="t.key" :class="{ on: activeTab === t.key }" @click="activeTab = t.key">
                <span>{{ t.icon }}</span><small>{{ t.label }}</small>
              </button>
            </nav>
          </div>
        </div>
        <div class="phone-shadow"></div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import AppLogo from '@/components/AppLogo.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useMallStore } from '@/stores/mall'
import { useAdminStore } from '@/stores/admin'
import DB from '@/data/db'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const mall = useMallStore()
const admin = useAdminStore()

const activeTab = ref('home')
const selectedGoods = ref(null)
const keyword = ref('')
const cat = ref('全部')
const traceCode = ref('TR-00021')
const traceInfo = ref(DB.traces.find(t => t.code === 'TR-00021') || DB.traces[0])

const consumerTabs = [
  { key: 'home', label: '首页', icon: '🏠' },
  { key: 'products', label: '产品', icon: '🧺' },
  { key: 'trace', label: '溯源', icon: '🔎' },
  { key: 'profile', label: '我的', icon: '👤' }
]
/* 农户 / 运维 / 农艺进入移动办公，不展示商城 */
const isStaff = computed(() => ['farmer', 'ops', 'agri'].includes(auth.user?.role))
const isFarmer = computed(() => auth.user?.role === 'farmer')
const isAgri = computed(() => auth.user?.role === 'agri')
const staffRoleName = computed(() => (isFarmer.value ? '农户' : isAgri.value ? '农艺技术' : '运维'))
const tabs = computed(() => {
  if (isFarmer.value) {
    return [
      { key: 'home', label: '工作台', icon: '🧭' },
      { key: 'tasks', label: '工单', icon: '📋' },
      { key: 'alarms', label: '告警', icon: '🔔' },
      { key: 'profile', label: '我的', icon: '👤' }
    ]
  }
  if (isAgri.value) {
    return [
      { key: 'home', label: '工作台', icon: '🧭' },
      { key: 'tasks', label: '咨询', icon: '💬' },
      { key: 'plans', label: '方案', icon: '📘' },
      { key: 'profile', label: '我的', icon: '👤' }
    ]
  }
  return isStaff.value
    ? [
        { key: 'home', label: '工作台', icon: '🧭' },
        { key: 'tasks', label: '设备', icon: '📟' },
        { key: 'alarms', label: '告警', icon: '🔔' },
        { key: 'profile', label: '我的', icon: '👤' }
      ]
    : consumerTabs
})

const pendingWorkorders = computed(() => admin.workorders.filter(w => w.status !== '已完成'))
const staffAlarms = computed(() => admin.openAlarms.slice(0, 6))
const offlineDevices = computed(() => admin.devices.filter(d => !d.online))
const agriConsults = computed(() => [...admin.consults].sort((a, b) => (a.status === '待回复' ? -1 : 1) - (b.status === '待回复' ? -1 : 1)))
const pendingConsults = computed(() => admin.consults.filter(c => c.status === '待回复'))
const myWorkorders = computed(() => {
  const mine = pendingWorkorders.value.filter(w => w.assignee === auth.user?.name)
  return (mine.length ? mine : pendingWorkorders.value).slice(0, 4)
})
const onlineRate = computed(() => {
  const total = admin.devices.length || 1
  return Math.round((admin.devices.filter(d => d.online).length / total) * 100)
})
const greeting = computed(() => {
  const h = new Date().getHours()
  return h < 11 ? '早上好' : h < 14 ? '中午好' : h < 18 ? '下午好' : '晚上好'
})
const staffActions = computed(() => {
  if (isFarmer.value) {
    return [
      { icon: '🌡️', label: '环境告警', action: 'alarms' },
      { icon: '📋', label: '农事工单', action: 'tasks' },
      { icon: '📦', label: '订单发货', action: 'web' },
      { icon: '🗺️', label: '地块档案', action: 'web' }
    ]
  }
  if (isAgri.value) {
    return [
      { icon: '💬', label: '农户咨询', action: 'tasks' },
      { icon: '🔬', label: '病虫害诊断', action: 'tasks' },
      { icon: '📘', label: '技术方案', action: 'plans' },
      { icon: '🧪', label: '农残报告', action: 'web' }
    ]
  }
  return [
    { icon: '🔔', label: '告警处置', action: 'alarms' },
    { icon: '🛠️', label: '设备管理', action: 'tasks' },
    { icon: '🧰', label: '报修工单', action: 'web' },
    { icon: '📡', label: '采集监控', action: 'web' }
  ]
})

function plotName(id) { return DB.plots.find(p => p.id === id)?.name || id || '—' }
function onStaffAction(a) {
  if (a.action === 'web') return ElMessage.info('该功能请在网页端后台操作')
  activeTab.value = a.action
}
function logoutStaff() {
  auth.logout()
  activeTab.value = 'home'
  ElMessage.success('已退出登录')
}
watch(() => auth.user?.role, () => { activeTab.value = 'home' })

const cats = DB.catTree.map(c => ({ name: c.name, icon: c.icon }))
const catFilters = computed(() => ['全部', ...DB.catTree.map(c => c.name)])
const filteredGoods = computed(() => DB.goods.filter(g => {
  if (cat.value !== '全部' && g.big !== cat.value) return false
  const kw = keyword.value.trim().toLowerCase()
  return !kw || [g.name, g.big, g.cat, g.spec].some(v => String(v).toLowerCase().includes(kw))
}))
const traceSteps = computed(() => [
  { title: '产地地块', text: `${traceInfo.value.plot} · ${traceInfo.value.batch}` },
  { title: '生长环境', text: traceInfo.value.env },
  { title: '农事记录', text: `${traceInfo.value.work} · ${traceInfo.value.input}` },
  { title: '农残检测', text: traceInfo.value.test }
])
const profileMenus = computed(() => [
  { icon: '📦', label: '我的订单', hint: '查看物流与评价', action: 'orders' },
  { icon: '♡', label: '我的收藏', hint: `${mall.favorites.length} 款商品`, action: 'fav' },
  { icon: '📍', label: '收货地址', hint: '管理常用地址', action: 'addr' },
  { icon: '🔎', label: '产品溯源', hint: '一物一码', action: 'trace' },
  { icon: '🎧', label: '联系客服', hint: '6:00 – 22:00', action: 'service' }
])

function onMenu(m) {
  if (m.action === 'orders') return (activeTab.value = 'orders')
  if (m.action === 'trace') return (activeTab.value = 'trace')
  if (m.action === 'fav') return ElMessage.info(`已收藏 ${mall.favorites.length} 款商品，可在完整商城查看`)
  if (m.action === 'addr') return ElMessage.info('收货地址管理请在完整商城个人中心操作')
  ElMessage.info('客服在线时间 6:00 – 22:00，可在完整商城联系')
}
function goLogin() {
  if (auth.isLogged) return ElMessage.info('当前已登录，可在完整商城查看个人中心')
  router.push('/login?redirect=/mobile')
}
function back() {
  activeTab.value = activeTab.value === 'orders' ? 'profile' : 'home'
  selectedGoods.value = null
}
function toCheckout() {
  if (!cart.count) return ElMessage.warning('购物车是空的')
  ElMessage.info('结算请在完整商城完成')
}

function addCart(g) {
  const res = cart.add(g.id, 1)
  ElMessage[res.ok ? 'success' : 'warning'](res.ok ? `${g.name} 已加入购物车` : res.message)
}
function openGoods(g) { selectedGoods.value = g; activeTab.value = 'product' }
function goCart() { activeTab.value = 'cart' }
function notify() {
  mall.addMessage({ type: '系统', title: '移动端预览', text: '这是移动端演示预览，完整功能请进入商城体验。' })
  ElMessage.info('你有一条新消息')
}
function queryTrace() {
  const code = traceCode.value.trim().toUpperCase()
  const found = DB.traces.find(t => t.code === code && t.code !== '—')
  if (!found) return ElMessage.warning('未找到该溯源码，试试 TR-00021')
  traceInfo.value = found
  ElMessage.success('已找到溯源档案')
}
</script>

<style scoped>
.mobile-page { min-height: 100vh; background: radial-gradient(120% 90% at 80% 0%, #e4f0dc, #f7f5ee 52%, #f5f3ea); }
.mp-header { max-width: 1200px; margin: 0 auto; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.mp-actions { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.mp-main { max-width: 1160px; margin: 0 auto; padding: 30px 24px 60px; display: grid; grid-template-columns: 1fr 420px; gap: 60px; align-items: center; }
.kicker { font-size: 9.5px; letter-spacing: 2.2px; color: var(--brand-500); }
.mp-copy h1 { font-size: 45px; line-height: 1.24; letter-spacing: .5px; margin: 12px 0 14px; color: var(--brand-900); }
.mp-copy h1 em { font-style: normal; color: var(--brand-600); }
.mp-copy > p { font-size: 13px; line-height: 1.95; color: var(--ink-500); max-width: 460px; }
.mp-points { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 26px 0; max-width: 470px; }
.mp-points > div { display: flex; gap: 9px; }
.mp-points > div > span { width: 34px; height: 34px; border-radius: 10px; background: #fff; border: 1px solid var(--line); display: grid; place-items: center; font-size: 16px; flex: 0 0 34px; }
.mp-points b { display: block; font-size: 12px; }
.mp-points small { font-size: 10px; color: var(--ink-400); line-height: 1.5; }
.mp-actions-row { display: flex; gap: 9px; flex-wrap: wrap; }
.mp-note { display: flex; align-items: flex-start; gap: 6px; margin-top: 22px; max-width: 470px; font-size: 10.5px; color: var(--ink-400); line-height: 1.7; }
.mp-preview { position: relative; display: flex; justify-content: center; }
.phone { position: relative; width: 342px; height: 704px; border-radius: 42px; background: #1c2920; padding: 11px; box-shadow: 0 40px 80px rgba(26, 50, 32, .26), 0 0 0 1px rgba(255,255,255,.5) inset; z-index: 2; }
.phone-notch { position: absolute; left: 50%; top: 11px; transform: translateX(-50%); width: 112px; height: 22px; background: #1c2920; border-radius: 0 0 14px 14px; z-index: 5; }
.phone-screen { width: 100%; height: 100%; border-radius: 32px; background: #f7f5ee; overflow: hidden; display: flex; flex-direction: column; position: relative; }
.status-bar { display: flex; align-items: center; justify-content: space-between; padding: 8px 18px 2px; font-size: 10px; font-weight: 600; color: #243a2b; }
.sb-right { font-size: 8.5px; letter-spacing: .5px; }
.app-head { display: flex; align-items: center; justify-content: space-between; padding: 8px 13px 9px; background: rgba(250, 249, 243, .92); }
.ah-brand { display: flex; align-items: center; gap: 7px; }
.ah-mark { width: 27px; height: 27px; border-radius: 8px; background: var(--brand-600); display: grid; place-items: center; font-size: 14px; }
.ah-brand b { display: block; font-size: 12px; color: var(--brand-900); }
.ah-brand small { display: block; font-size: 7.5px; color: var(--ink-400); }
.ah-icons { display: flex; gap: 9px; font-size: 15px; }
.ah-icons span { cursor: pointer; position: relative; }
.ah-icons .cart i { position: absolute; top: -4px; right: -6px; font-style: normal; font-size: 7px; background: #cf5d4d; color: #fff; border-radius: 6px; min-width: 11px; height: 11px; line-height: 11px; text-align: center; padding: 0 2px; }
.app-body { flex: 1; overflow-y: auto; padding: 8px 12px 12px; scrollbar-width: none; }
.app-body::-webkit-scrollbar { display: none; }
.m-hero { display: flex; align-items: center; gap: 6px; background: linear-gradient(120deg, #3d7a49, #559257 62%, #7bab74); border-radius: 16px; padding: 14px 13px; color: #edf7e8; position: relative; overflow: hidden; }
.m-hero::after { content: ""; position: absolute; right: -24px; top: -34px; width: 96px; height: 96px; border-radius: 50%; background: rgba(255,255,255,.1); }
.mh-copy { flex: 1; min-width: 0; position: relative; z-index: 1; }
.mh-copy > span { font-size: 6px; letter-spacing: 1.2px; color: #cfe8c7; }
.mh-copy > b { display: block; font-size: 18px; line-height: 1.28; color: #fff; margin: 3px 0; }
.mh-copy > small { display: block; font-size: 7.5px; color: #dcefd6; }
.mh-copy > button { margin-top: 7px; border: none; background: #e2f1cf; color: #2c4a33; border-radius: 14px; padding: 4px 10px; font-size: 8px; font-weight: 600; cursor: pointer; }
.mh-emoji { font-size: 58px; position: relative; z-index: 1; filter: drop-shadow(0 10px 12px rgba(0,0,0,.18)); }
.m-trust { display: flex; justify-content: space-between; margin: 9px 0; padding: 7px 8px; background: #fff; border: 1px solid var(--line); border-radius: 9px; font-size: 7.5px; color: var(--ink-500); }
.m-cats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin-bottom: 11px; }
.m-cats button { display: flex; flex-direction: column; align-items: center; gap: 2px; border: none; background: transparent; cursor: pointer; }
.m-cats span { width: 34px; height: 34px; border-radius: 11px; background: #fff; border: 1px solid var(--line); display: grid; place-items: center; font-size: 17px; }
.m-cats small { font-size: 7.5px; color: var(--ink-500); }
.m-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.m-section-head b { font-size: 11.5px; }
.m-section-head span { font-size: 8px; color: var(--ink-400); }
.m-goods { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
.m-good { background: #fff; border: 1px solid var(--line); border-radius: 11px; padding: 7px; cursor: pointer; }
.mg-emoji { display: block; text-align: center; font-size: 30px; background: linear-gradient(135deg, #f1f8ec, #dcecd7); border-radius: 8px; padding: 5px 0; }
.m-good > b { display: block; font-size: 9px; margin-top: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.m-good > small { display: block; font-size: 7px; color: var(--ink-400); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mg-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 3px; }
.mg-foot > span { font-size: 11px; font-weight: 700; color: #b5473d; }
.mg-foot button { width: 18px; height: 18px; border-radius: 50%; border: none; background: var(--brand-600); color: #fff; font-size: 11px; line-height: 1; cursor: pointer; }
.m-trace-card { display: flex; align-items: center; gap: 8px; margin-top: 10px; padding: 10px 12px; border-radius: 12px; background: linear-gradient(135deg, #3f7d4b, #5a9a60); color: #e2f0dc; cursor: pointer; }
.m-trace-card > div { flex: 1; }
.m-trace-card b { display: block; font-size: 9.5px; color: #eef8e9; }
.m-trace-card span { font-size: 7.5px; color: #cfe3c8; }
.mtc-qr { font-size: 26px; color: #b8d8b2; }
.m-search { display: flex; align-items: center; gap: 6px; background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 7px 11px; font-size: 11px; }
.m-search input { flex: 1; border: none; outline: none; background: transparent; font-size: 9.5px; color: var(--ink-700); }
.m-filter { display: flex; gap: 5px; margin: 8px 0; overflow-x: auto; scrollbar-width: none; }
.m-filter::-webkit-scrollbar { display: none; }
.m-filter button { border: 1px solid var(--line); background: #fff; border-radius: 14px; padding: 3px 9px; font-size: 8px; color: var(--ink-500); cursor: pointer; white-space: nowrap; }
.m-filter button.on { background: var(--brand-600); border-color: var(--brand-600); color: #fff; }
.m-list { display: flex; flex-direction: column; gap: 7px; }
.m-list-item { display: flex; gap: 8px; background: #fff; border: 1px solid var(--line); border-radius: 11px; padding: 8px; cursor: pointer; }
.mli-emoji { width: 64px; height: 64px; border-radius: 9px; background: linear-gradient(135deg, #f1f8ec, #dcecd7); display: grid; place-items: center; font-size: 30px; flex: 0 0 64px; }
.mli-main { flex: 1; min-width: 0; }
.mli-main > b { display: block; font-size: 9.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mli-main > small { display: block; font-size: 7.5px; color: var(--ink-400); }
.mli-tags { display: flex; gap: 3px; margin: 2px 0; }
.mli-tags span { font-size: 6.5px; color: var(--brand-600); background: var(--brand-50); border-radius: 6px; padding: 0 4px; }
.mli-foot { display: flex; align-items: center; justify-content: space-between; }
.mli-foot .price { font-size: 12px; font-weight: 700; color: #b5473d; }
.mli-foot button { border: none; background: var(--brand-600); color: #fff; border-radius: 12px; padding: 2px 9px; font-size: 7.5px; cursor: pointer; }
.m-empty { text-align: center; color: var(--ink-300); font-size: 9px; padding: 30px 0; }
.m-trace-head { padding: 8px 2px; }
.m-trace-head b { display: block; font-size: 14px; }
.m-trace-head span { font-size: 8px; color: var(--ink-400); }
.m-trace-search { display: flex; gap: 5px; margin-bottom: 7px; }
.m-trace-search input { flex: 1; border: 1px solid var(--line); border-radius: 15px; padding: 7px 11px; font-size: 9px; outline: none; background: #fff; }
.m-trace-search button { border: none; background: var(--brand-600); color: #fff; border-radius: 15px; padding: 0 13px; font-size: 8.5px; cursor: pointer; }
.m-trace-codes { display: flex; gap: 4px; margin-bottom: 8px; flex-wrap: wrap; }
.m-trace-codes button { border: 1px solid var(--line); background: #fff; color: var(--brand-700); border-radius: 10px; padding: 2px 7px; font-size: 7.5px; cursor: pointer; font-family: ui-monospace, Consolas, monospace; }
.m-trace-result { background: #fff; border: 1px solid var(--line); border-radius: 13px; padding: 11px; }
.mtr-top { display: flex; align-items: center; gap: 7px; padding-bottom: 8px; border-bottom: 1px dashed var(--line); }
.mtr-qr { width: 32px; height: 32px; border-radius: 8px; background: var(--brand-50); color: var(--brand-600); display: grid; place-items: center; font-size: 18px; }
.mtr-top > div { flex: 1; min-width: 0; }
.mtr-top b { display: block; font-size: 11px; font-family: ui-monospace, Consolas, monospace; }
.mtr-top span { font-size: 7.5px; color: var(--ink-400); }
.mtr-top em { font-style: normal; font-size: 7px; color: #47724a; background: #eef8ea; border-radius: 8px; padding: 2px 6px; }
.mtr-pass { margin: 8px 0; padding: 5px 7px; background: #f1f9ed; border: 1px solid #dcefd5; border-radius: 6px; font-size: 7.5px; color: #47724a; }
.mtr-steps { padding-top: 1px; }
.mtr-step { display: flex; gap: 7px; padding: 5px 0; position: relative; }
.mtr-step:not(:last-child)::before { content: ""; position: absolute; left: 3px; top: 14px; bottom: -2px; width: 1px; background: #e0e9da; }
.mtr-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--brand-500); margin-top: 3px; flex: 0 0 7px; }
.mtr-step b { display: block; font-size: 8.5px; }
.mtr-step p { font-size: 7.5px; color: var(--ink-400); line-height: 1.45; }
.m-profile-head { display: flex; align-items: center; gap: 9px; padding: 12px; border-radius: 14px; background: linear-gradient(120deg, #3d7a49, #559257 70%); color: #edf7e8; }
.mp-avatar { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,.16); border: 1px solid rgba(255,255,255,.28); display: grid; place-items: center; font-size: 16px; flex: 0 0 40px; }
.m-profile-head > div:nth-child(2) { flex: 1; min-width: 0; }
.m-profile-head b { display: block; font-size: 11px; color: #fff; }
.m-profile-head span { font-size: 7.5px; color: #dcefd6; }
.m-profile-head button { border: 1px solid rgba(255,255,255,.3); background: transparent; color: #eaf5e4; border-radius: 11px; padding: 3px 8px; font-size: 7.5px; cursor: pointer; }
.m-profile-stats { display: flex; justify-content: space-around; margin: 9px 0; padding: 9px 0; background: #fff; border: 1px solid var(--line); border-radius: 11px; }
.m-profile-stats div { text-align: center; }
.m-profile-stats b { display: block; font-size: 14px; color: var(--brand-700); }
.m-profile-stats span { font-size: 7.5px; color: var(--ink-400); }
.m-menu { background: #fff; border: 1px solid var(--line); border-radius: 11px; overflow: hidden; }
.m-menu button { display: flex; align-items: center; gap: 7px; width: 100%; border: none; background: transparent; border-bottom: 1px solid #f2f4ee; padding: 9px 10px; cursor: pointer; text-align: left; }
.m-menu button:last-child { border-bottom: none; }
.m-menu button > span { font-size: 13px; }
.m-menu b { font-size: 9px; }
.m-menu em { margin-left: auto; font-style: normal; font-size: 7.5px; color: var(--ink-300); }
.m-menu i { font-style: normal; font-size: 12px; color: var(--ink-300); }
.m-profile-tip { margin-top: 10px; text-align: center; font-size: 7.5px; color: var(--ink-300); }
.app-tabbar { display: flex; border-top: 1px solid var(--line); background: rgba(255,255,255,.96); padding: 5px 4px 10px; }
.app-tabbar button { flex: 1; border: none; background: transparent; display: flex; flex-direction: column; align-items: center; gap: 1px; cursor: pointer; color: var(--ink-400); padding: 3px 0; }
.app-tabbar span { font-size: 15px; }
.app-tabbar small { font-size: 7px; }
.app-tabbar button.on { color: var(--brand-600); }
.phone-shadow { position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%); width: 260px; height: 36px; border-radius: 50%; background: rgba(30, 60, 40, .14); filter: blur(14px); z-index: 1; }
.m-work-hero { background: linear-gradient(120deg, #3d7a49, #559257 62%, #7bab74); border-radius: 14px; padding: 13px; color: #edf7e8; }
.m-work-hero > span { font-size: 7px; letter-spacing: 1px; color: #cfe8c7; }
.m-work-hero > b { display: block; margin: 4px 0 2px; font-size: 14px; color: #fff; }
.m-work-hero > small { font-size: 8px; color: #dcefd6; }
.m-work-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin: 8px 0; }
.m-work-stats > div { background: #fff; border: 1px solid var(--line); border-radius: 10px; padding: 8px 4px; text-align: center; }
.m-work-stats b { display: block; font-size: 14px; color: var(--brand-700); }
.m-work-stats span { font-size: 7.5px; color: var(--ink-400); }
.m-work-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 11px; }
.m-work-actions button { display: flex; flex-direction: column; align-items: center; gap: 3px; border: 1px solid var(--line); background: #fff; border-radius: 10px; padding: 8px 2px; cursor: pointer; }
.m-work-actions span { font-size: 16px; }
.m-work-actions b { font-size: 7.5px; font-weight: 500; color: var(--ink-600); white-space: nowrap; }
.m-work-list { display: flex; flex-direction: column; gap: 6px; }
.m-work-item { display: flex; align-items: center; gap: 7px; background: #fff; border: 1px solid var(--line); border-radius: 10px; padding: 8px 9px; }
.mwi-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--brand-500); flex: 0 0 7px; }
.mwi-dot.off { background: #d05c4c; }
.m-work-item > div { flex: 1; min-width: 0; }
.m-work-item b { display: block; font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.m-work-item small { display: block; font-size: 7.5px; color: var(--ink-400); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.m-work-item em { font-style: normal; font-size: 8px; color: var(--brand-600); }
.m-work-item em.off { color: #c4553f; }
.m-sub-head { display: flex; align-items: center; gap: 6px; padding: 2px 2px 8px; }
.m-sub-head button { width: 22px; height: 22px; border-radius: 50%; border: 1px solid var(--line); background: #fff; cursor: pointer; font-size: 13px; line-height: 1; color: var(--ink-500); }
.m-sub-head b { font-size: 12px; }
.m-pd-cover { height: 148px; border-radius: 14px; background: linear-gradient(135deg, #f1f8ec, #dcecd7); display: grid; place-items: center; font-size: 68px; }
.m-pd-card { margin-top: 8px; background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 10px; }
.m-pd-card > b { font-size: 11px; }
.m-pd-card > small { display: block; font-size: 8px; color: var(--ink-400); }
.m-pd-price { display: flex; align-items: center; gap: 6px; margin: 6px 0; font-size: 15px; font-weight: 700; color: #b5473d; }
.m-pd-price em { font-style: normal; font-size: 7px; font-weight: 400; color: var(--brand-600); background: var(--brand-50); border-radius: 6px; padding: 1px 5px; }
.m-pd-card > p { font-size: 8px; color: var(--ink-400); line-height: 1.6; }
.m-pd-buy { margin-top: 8px; width: 100%; border: none; background: var(--brand-600); color: #fff; border-radius: 16px; padding: 8px; font-size: 9px; cursor: pointer; }
.m-cart { display: flex; flex-direction: column; gap: 7px; }
.m-cart-item { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid var(--line); border-radius: 11px; padding: 8px; }
.mci-emoji { width: 44px; height: 44px; border-radius: 9px; background: linear-gradient(135deg, #f1f8ec, #dcecd7); display: grid; place-items: center; font-size: 22px; flex: 0 0 44px; }
.mci-main { flex: 1; min-width: 0; }
.mci-main b { display: block; font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mci-main small { display: block; font-size: 7.5px; color: var(--ink-400); }
.mci-price { font-size: 11px; font-weight: 700; color: #b5473d; }
.mci-qty { display: flex; align-items: center; gap: 5px; }
.mci-qty button { width: 18px; height: 18px; border-radius: 50%; border: 1px solid var(--line); background: #fff; cursor: pointer; font-size: 10px; line-height: 1; color: var(--ink-600); }
.mci-qty span { min-width: 12px; text-align: center; font-size: 9px; }
.m-cart-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; background: #fff; border: 1px solid var(--line); border-radius: 11px; padding: 9px 11px; font-size: 8.5px; }
.m-cart-foot b { font-size: 13px; color: #b5473d; }
.m-cart-foot button { border: none; background: var(--brand-600); color: #fff; border-radius: 14px; padding: 5px 12px; font-size: 8.5px; cursor: pointer; }
.m-orders { display: flex; flex-direction: column; gap: 7px; }
.m-order { background: #fff; border: 1px solid var(--line); border-radius: 11px; padding: 9px 10px; }
.mo-top { display: flex; align-items: center; justify-content: space-between; font-size: 8px; color: var(--ink-400); }
.mo-top em { font-style: normal; color: var(--brand-600); }
.mo-goods { margin: 5px 0; font-size: 9.5px; }
.mo-foot { display: flex; align-items: center; justify-content: space-between; font-size: 8px; color: var(--ink-400); }
.mo-foot strong { font-size: 10.5px; color: #b5473d; }
@media (max-width: 1000px) {
  .mp-main { grid-template-columns: 1fr; gap: 40px; padding-top: 16px; }
  .mp-preview { order: -1; }
  .mp-copy { max-width: 620px; margin: 0 auto; text-align: center; }
  .mp-copy > p { margin: 0 auto; }
  .mp-points { text-align: left; margin-left: auto; margin-right: auto; }
  .mp-actions-row, .mp-note { justify-content: center; margin-left: auto; margin-right: auto; }
}
@media (max-width: 620px) {
  .mp-header { padding: 12px 14px; }
  .mp-actions :deep(.el-button:not(.el-button--primary)) { display: none; }
  .mp-main { padding: 12px 12px 40px; }
  .mp-copy h1 { font-size: 32px; }
  .mp-points { grid-template-columns: 1fr; }
  .phone { width: 322px; height: 668px; }
}
</style>
