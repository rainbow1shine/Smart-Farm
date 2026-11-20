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
          <el-button size="large" @click="$router.push('/login')">消费者登录</el-button>
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
                <span class="ah-mark">🌾</span>
                <div><b>鲜农商城</b><small>产地直供 · 当日现摘</small></div>
              </div>
              <div class="ah-icons">
                <span @click="notify">🔔</span>
                <span class="cart" @click="goCart">🛒<i v-if="cart.count">{{ cart.count }}</i></span>
              </div>
            </div>

            <div class="app-body">
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

              <template v-else>
                <div class="m-profile-head">
                  <div class="mp-avatar">{{ auth.user?.name?.slice(0, 1) || '客' }}</div>
                  <div><b>{{ auth.user?.name || '商城用户' }}</b><span>{{ auth.isLogged ? '青梅会员 · 已登录' : '登录后享受更多权益' }}</span></div>
                  <button @click="$router.push(auth.isLogged ? '/mall/profile' : '/login')">{{ auth.isLogged ? '个人中心' : '登录' }}</button>
                </div>
                <div class="m-profile-stats">
                  <div><b>{{ mall.orders.length }}</b><span>我的订单</span></div>
                  <div><b>{{ mall.favorites.length }}</b><span>收藏</span></div>
                  <div><b>{{ mall.unreadCount }}</b><span>消息</span></div>
                </div>
                <div class="m-menu">
                  <button v-for="m in profileMenus" :key="m.label" @click="$router.push(m.to)">
                    <span>{{ m.icon }}</span><b>{{ m.label }}</b><em>{{ m.hint }}</em><i>›</i>
                  </button>
                </div>
                <div class="m-profile-tip">🌾 产地直供 · 农残检测 · 坏果包赔</div>
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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import AppLogo from '@/components/AppLogo.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useMallStore } from '@/stores/mall'
import DB from '@/data/db'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const mall = useMallStore()

const activeTab = ref('home')
const keyword = ref('')
const cat = ref('全部')
const traceCode = ref('TR-00021')
const traceInfo = ref(DB.traces.find(t => t.code === 'TR-00021') || DB.traces[0])

const tabs = [
  { key: 'home', label: '首页', icon: '🏠' },
  { key: 'products', label: '产品', icon: '🧺' },
  { key: 'trace', label: '溯源', icon: '🔎' },
  { key: 'profile', label: '我的', icon: '👤' }
]
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
  { icon: '📦', label: '我的订单', hint: '查看物流与评价', to: '/mall/orders' },
  { icon: '♡', label: '我的收藏', hint: `${mall.favorites.length} 款商品`, to: '/mall/profile' },
  { icon: '📍', label: '收货地址', hint: '管理常用地址', to: '/mall/profile' },
  { icon: '🔎', label: '产品溯源', hint: '一物一码', to: '/mall/trace' },
  { icon: '🎧', label: '联系客服', hint: '6:00 – 22:00', to: '/mall' }
])

function addCart(g) {
  const res = cart.add(g.id, 1)
  ElMessage[res.ok ? 'success' : 'warning'](res.ok ? `${g.name} 已加入购物车` : res.message)
}
function openGoods(g) { router.push(`/mall/product/${g.id}`) }
function goCart() { router.push('/mall/cart') }
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
.m-hero { display: flex; align-items: center; gap: 6px; background: linear-gradient(120deg, #2f5639, #4d7d51 62%, #7ba36f); border-radius: 16px; padding: 14px 13px; color: #eaf5e4; position: relative; overflow: hidden; }
.m-hero::after { content: ""; position: absolute; right: -24px; top: -34px; width: 96px; height: 96px; border-radius: 50%; background: rgba(255,255,255,.1); }
.mh-copy { flex: 1; min-width: 0; position: relative; z-index: 1; }
.mh-copy > span { font-size: 6px; letter-spacing: 1.2px; color: #b7d7a9; }
.mh-copy > b { display: block; font-size: 18px; line-height: 1.28; color: #fff; margin: 3px 0; }
.mh-copy > small { display: block; font-size: 7.5px; color: #c3dcc0; }
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
.m-trace-card { display: flex; align-items: center; gap: 8px; margin-top: 10px; padding: 10px 12px; border-radius: 12px; background: #20352a; color: #dcefd8; cursor: pointer; }
.m-trace-card > div { flex: 1; }
.m-trace-card b { display: block; font-size: 9.5px; color: #eef8e9; }
.m-trace-card span { font-size: 7.5px; color: #96b49b; }
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
.m-profile-head { display: flex; align-items: center; gap: 9px; padding: 12px; border-radius: 14px; background: linear-gradient(120deg, #2f5639, #4d7d51 70%); color: #eaf5e4; }
.mp-avatar { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,.16); border: 1px solid rgba(255,255,255,.28); display: grid; place-items: center; font-size: 16px; flex: 0 0 40px; }
.m-profile-head > div:nth-child(2) { flex: 1; min-width: 0; }
.m-profile-head b { display: block; font-size: 11px; color: #fff; }
.m-profile-head span { font-size: 7.5px; color: #bdd6bd; }
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
