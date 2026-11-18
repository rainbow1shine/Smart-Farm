<template>
  <div class="orders-page">
    <div class="orders-head">
      <div>
        <span class="kicker">MY ORDERS</span>
        <h1>我的订单</h1>
        <p>共 {{ mall.orders.length }} 笔订单，待收货 {{ countTab('待收货') }} 笔，待评价 {{ mall.orderCounts['待评价'] || 0 }} 笔。</p>
      </div>
      <div class="head-search">
        <el-input v-model="keyword" placeholder="搜索订单号或商品" clearable>
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>
    </div>

    <div class="order-stats">
      <button v-for="s in stats" :key="s.key" class="stat-item" :class="{ on: tab === s.key }" @click="tab = s.key">
        <span class="si-ico">{{ s.icon }}</span>
        <div><b>{{ countTab(s.key) }}</b><span>{{ s.label }}</span></div>
      </button>
    </div>

    <div class="order-tabs">
      <button v-for="t in tabs" :key="t.key" :class="{ on: tab === t.key }" @click="tab = t.key">
        {{ t.label }}<em v-if="countTab(t.key)">{{ countTab(t.key) }}</em>
      </button>
    </div>

    <div v-if="filtered.length" class="order-list">
      <article v-for="o in filtered" :key="o.no" class="order-card card">
        <header class="oc-head">
          <div class="oc-meta">
            <span class="oc-no">订单号 <b>{{ o.no }}</b></span>
            <span class="oc-time">{{ o.time }}</span>
          </div>
          <StatusTag :status="o.status" size="default" />
        </header>

        <div class="oc-body">
          <div class="oc-goods">
            <div v-for="(g, i) in orderGoods(o)" :key="i" class="oc-good">
              <router-link :to="`/mall/product/${g.id}`" class="og-media">{{ g.icon }}</router-link>
              <div class="og-main">
                <router-link :to="`/mall/product/${g.id}`" class="og-name">{{ g.name }}</router-link>
                <span class="og-spec">{{ g.spec }}</span>
                <div class="og-tags">
                  <span v-if="g.trace && g.trace !== '—'">可溯源</span>
                  <span>冷链直发</span>
                </div>
              </div>
              <div class="og-price">¥{{ Number(g.price).toFixed(2) }} <small>× {{ g.qty }}</small></div>
            </div>
          </div>

          <div class="oc-side">
            <div class="oc-amount">
              <span>实付金额</span>
              <b>¥{{ Number(o.amount).toFixed(2) }}</b>
            </div>
            <div class="oc-addr">
              <el-icon><Location /></el-icon>
              <span>{{ o.receiver || '王双红' }} · {{ o.addr }}</span>
            </div>
            <div class="oc-actions">
              <el-button v-if="o.status === '待付款'" type="primary" size="small" @click="openPay(o)">立即支付</el-button>
              <el-button v-if="o.status === '待付款'" size="small" @click="cancelOrder(o)">取消订单</el-button>
              <el-button v-if="o.status === '待发货'" type="primary" plain size="small" @click="remind(o)">提醒发货</el-button>
              <el-button v-if="['运输中', '待收货'].includes(o.status)" type="primary" plain size="small" @click="openLogistics(o)">查看物流</el-button>
              <el-button v-if="['运输中', '待收货'].includes(o.status)" type="primary" size="small" @click="confirmReceipt(o)">确认收货</el-button>
              <el-button v-if="o.status === '待评价'" type="primary" size="small" @click="openReview(o)">去评价</el-button>
              <el-button v-if="['待评价', '已完成'].includes(o.status)" size="small" text @click="$router.push(`/mall/orders/${o.no}`)">申请售后</el-button>
              <el-button v-if="['已完成', '已取消'].includes(o.status)" size="small" @click="buyAgain(o)">再次购买</el-button>
              <el-button size="small" text @click="$router.push(`/mall/orders/${o.no}`)">订单详情</el-button>
            </div>
          </div>
        </div>

        <footer class="oc-foot">
          <span><el-icon><Van /></el-icon>{{ o.delivery || '产地直发 · 冷链配送' }}</span>
          <span><el-icon><Wallet /></el-icon>{{ o.pay || '微信支付' }}</span>
          <span v-if="o.status === '待评价'" class="foot-tip">晒单评价可得 10 积分</span>
        </footer>
      </article>
    </div>

    <div v-else class="card empty-box order-empty">
      <div class="icon">{{ keyword ? '🔎' : '📦' }}</div>
      <div>{{ keyword ? '没有找到匹配的订单' : tab === '全部' ? '还没有订单，去挑点新鲜的吧' : `暂无「${currentTabLabel}」订单` }}</div>
      <p class="muted tiny">{{ keyword ? '试试搜索订单号或商品名称' : '产地当日采摘，16:00 前下单当日发出。' }}</p>
      <div class="empty-actions">
        <el-button v-if="keyword" plain @click="keyword = ''">清除搜索</el-button>
        <el-button v-else-if="tab !== '全部'" plain @click="tab = '全部'">查看全部订单</el-button>
        <el-button type="primary" @click="$router.push('/mall/products')">去逛逛</el-button>
      </div>
    </div>

    <el-dialog v-model="payOpen" title="订单支付" width="440px" destroy-on-close>
      <div v-if="activeOrder" class="pay-dialog">
        <div class="pd-amount"><span>应付金额</span><b>¥{{ Number(activeOrder.amount).toFixed(2) }}</b></div>
        <div class="pd-qr" v-html="qrSvg(150)"></div>
        <p class="pd-tip">请使用 {{ payMethod === 'wechat' ? '微信' : '支付宝' }} 扫一扫完成支付</p>
        <div class="pd-methods">
          <button :class="{ on: payMethod === 'wechat' }" @click="payMethod = 'wechat'"><span style="background:#e8f7ec;color:#2f9e44">微</span>微信支付</button>
          <button :class="{ on: payMethod === 'alipay' }" @click="payMethod = 'alipay'"><span style="background:#e8f1fb;color:#1677ff">支</span>支付宝</button>
        </div>
        <el-button type="primary" class="pd-pay" :loading="paying" @click="confirmPay">我已完成支付</el-button>
        <span class="pd-demo">演示环境，点击按钮即模拟支付成功</span>
      </div>
    </el-dialog>

    <el-dialog v-model="logisticsOpen" title="物流详情" width="520px" destroy-on-close>
      <div v-if="activeOrder" class="logistics-dialog">
        <div class="ld-head">
          <span class="ld-ico">🚚</span>
          <div><b>顺丰冷链 · {{ trackingNo }}</b><span>预计明日 10:00 前送达</span></div>
          <StatusTag :status="activeOrder.status" />
        </div>
        <div class="ld-addr">{{ activeOrder.receiver }} {{ activeOrder.phone }} · {{ activeOrder.addr }}</div>
        <el-timeline class="ld-timeline">
          <el-timeline-item v-for="(s, i) in logisticsSteps" :key="i" :timestamp="s.time" :color="i === 0 ? '#3f6f4a' : '#c5d5c4'">
            <b>{{ s.title }}</b>
            <p>{{ s.text }}</p>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>

    <el-dialog v-model="reviewOpen" title="评价订单" width="500px" destroy-on-close>
      <div v-if="activeOrder" class="review-dialog">
        <div class="rd-goods">
          <span>{{ firstGoods(activeOrder)?.icon }}</span>
          <div><b>{{ firstGoods(activeOrder)?.name }}</b><small>{{ firstGoods(activeOrder)?.spec }}</small></div>
        </div>
        <div class="rd-rate">
          <span>整体评分</span>
          <el-rate v-model="reviewStars" show-text :texts="['很差', '较差', '一般', '满意', '非常满意']" />
        </div>
        <el-input v-model="reviewText" type="textarea" :rows="4" maxlength="200" show-word-limit placeholder="说说这次收到的农产品怎么样？新鲜度、口感、包装和物流都可以聊聊～" />
        <div class="rd-quick">
          <span>快捷标签</span>
          <button v-for="t in reviewTags" :key="t" :class="{ on: reviewText.includes(t) }" @click="toggleTag(t)">{{ t }}</button>
        </div>
        <div class="rd-foot">
          <span>评价提交后可获得 10 积分</span>
          <el-button type="primary" :disabled="!reviewStars" @click="submitReview">提交评价</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Location, Van, Wallet } from '@element-plus/icons-vue'
import StatusTag from '@/components/StatusTag.vue'
import { useCartStore } from '@/stores/cart'
import { useMallStore } from '@/stores/mall'
import { useAuthStore } from '@/stores/auth'
import DB from '@/data/db'
import { qrSvg, dateTime } from '@/utils/format'

const cart = useCartStore()
const mall = useMallStore()
const auth = useAuthStore()

const tab = ref('all')
const keyword = ref('')
const payOpen = ref(false)
const paying = ref(false)
const payMethod = ref('wechat')
const logisticsOpen = ref(false)
const reviewOpen = ref(false)
const activeOrder = ref(null)
const reviewStars = ref(5)
const reviewText = ref('')
const reviewTags = ['很新鲜', '口感很好', '包装严实', '物流很快', '分量足', '会回购']

const stats = [
  { key: '待付款', label: '待付款', icon: '💰' },
  { key: '待发货', label: '待发货', icon: '📦' },
  { key: '待收货', label: '待收货', icon: '🚚' },
  { key: '待评价', label: '待评价', icon: '💬' }
]
const tabs = [
  { key: 'all', label: '全部订单' },
  { key: '待付款', label: '待付款' },
  { key: '待发货', label: '待发货' },
  { key: '待收货', label: '待收货' },
  { key: '待评价', label: '待评价' },
  { key: '已完成', label: '已完成' },
  { key: '已取消', label: '已取消' }
]
const currentTabLabel = computed(() => tabs.find(t => t.key === tab.value)?.label || '')

function countTab(key) {
  if (key === 'all') return mall.orders.length
  if (key === '待收货') return mall.orders.filter(o => ['运输中', '待收货'].includes(o.status)).length
  return mall.orders.filter(o => o.status === key).length
}

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return mall.orders.filter(o => {
    const tabOk = tab.value === 'all'
      || (tab.value === '待收货' ? ['运输中', '待收货'].includes(o.status) : o.status === tab.value)
    if (!tabOk) return false
    if (!kw) return true
    return [o.no, o.goods, o.receiver].some(v => String(v || '').toLowerCase().includes(kw))
      || orderGoods(o).some(g => String(g.name || '').toLowerCase().includes(kw))
  })
})

const trackingNo = computed(() => (activeOrder.value ? 'SF' + activeOrder.value.no.replace(/\D/g, '').slice(-10) : 'SF0000000000'))
const logisticsSteps = computed(() => {
  const o = activeOrder.value
  if (!o) return []
  const base = [{ title: '快件已签收', text: '签收人：本人。如未收到请联系配送员。', time: '2026-11-10 09:30' }]
  if (['运输中', '待收货'].includes(o.status)) {
    return [
      { title: '快件运输中', text: '快件已到达重庆转运中心，正在发往渝北网点。', time: '2026-11-09 18:40' },
      { title: '农户已发货', text: '产地已完成预冷打包，顺丰冷链揽收。', time: '2026-11-09 07:20' },
      { title: '订单已支付', text: '支付成功，农户正在备货。', time: o.time }
    ]
  }
  if (o.status === '待评价' || o.status === '已完成') {
    return [
      ...base,
      { title: '派送中', text: '配送员正在派送，请保持电话畅通。', time: '2026-11-10 08:10' },
      { title: '快件运输中', text: '快件已到达重庆转运中心，正在发往渝北网点。', time: '2026-11-09 18:40' },
      { title: '农户已发货', text: '产地已完成预冷打包，顺丰冷链揽收。', time: '2026-11-09 07:20' },
      { title: '订单已支付', text: '支付成功，农户正在备货。', time: o.time }
    ]
  }
  return [
    { title: '农户备货中', text: '正在按订单采摘、分级和预冷打包。', time: o.time },
    { title: '订单已支付', text: '支付成功，等待农户发货。', time: o.time }
  ]
})

function orderGoods(order) {
  return (order.items || []).map(it => {
    const g = DB.goods.find(x => x.id === it.id) || {}
    return {
      id: it.id || g.id,
      qty: it.qty || 1,
      name: it.name || g.name || '农产品',
      price: it.price ?? g.price ?? 0,
      icon: it.icon || g.icon || '🌱',
      spec: it.spec || g.spec || '',
      trace: it.trace || g.trace || '—'
    }
  })
}
function firstGoods(order) { return orderGoods(order)[0] || {} }

function openPay(o) { activeOrder.value = o; payOpen.value = true }
function confirmPay() {
  paying.value = true
  setTimeout(() => {
    mall.updateStatus(activeOrder.value.no, '待发货')
    paying.value = false
    payOpen.value = false
    ElMessage.success('支付成功，农户已开始备货')
  }, 700)
}
async function cancelOrder(o) {
  try {
    await ElMessageBox.confirm('确定取消这笔订单吗？取消后可重新下单。', '取消订单', { type: 'warning', confirmButtonText: '取消订单', cancelButtonText: '再想想' })
    mall.updateStatus(o.no, '已取消')
    ElMessage.success('订单已取消')
  } catch {}
}
function remind(o) {
  mall.addMessage({ type: '订单', title: '已提醒农户发货', text: `你已提醒农户尽快发出订单 ${o.no}，农户通常会在 24 小时内处理。` })
  ElMessage.success('已提醒农户发货')
}
function openLogistics(o) { activeOrder.value = o; logisticsOpen.value = true }
async function confirmReceipt(o) {
  try {
    await ElMessageBox.confirm('请确认已经收到商品，确认后订单将进入待评价状态。', '确认收货', { type: 'info', confirmButtonText: '确认收货', cancelButtonText: '暂未收到' })
    mall.updateStatus(o.no, '待评价')
    ElMessage.success('已确认收货，去评价一下吧')
  } catch {}
}
function openReview(o) {
  activeOrder.value = o
  reviewStars.value = 5
  reviewText.value = ''
  reviewOpen.value = true
}
function toggleTag(t) {
  if (reviewText.value.includes(t)) reviewText.value = reviewText.value.replace(t + '，', '').replace(t, '')
  else reviewText.value = reviewText.value ? `${reviewText.value}，${t}` : t
}
function submitReview() {
  const g = firstGoods(activeOrder.value)
  mall.addReview({
    orderNo: activeOrder.value.no,
    goods: g.name,
    goodsId: g.id,
    stars: reviewStars.value,
    text: reviewText.value,
    user: auth.user?.name
  })
  reviewOpen.value = false
  ElMessage.success('评价已提交，感谢你的反馈')
}
function buyAgain(o) {
  const list = orderGoods(o)
  if (!list.length) return ElMessage.warning('订单商品信息缺失')
  let added = 0
  list.forEach(g => { if (cart.add(g.id, g.qty).ok) added += 1 })
  ElMessage[added ? 'success' : 'warning'](added ? `${added} 种商品已加入购物车` : '商品已下架，暂时无法再次购买')
}
</script>

<style scoped>
.orders-page { max-width: 1180px; margin: 0 auto; padding: 28px 24px 16px; }
.orders-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 18px; flex-wrap: wrap; }
.kicker { font-size: 9.5px; letter-spacing: 2px; color: var(--brand-500); }
.orders-head h1 { font-size: 30px; margin: 4px 0 4px; }
.orders-head p { font-size: 12px; color: var(--ink-400); }
.head-search { width: 260px; }
.head-search :deep(.el-input__wrapper) { border-radius: 20px; }
.order-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
.stat-item { display: flex; align-items: center; gap: 10px; background: #fff; border: 1px solid var(--line); border-radius: 13px; padding: 12px 15px; cursor: pointer; text-align: left; transition: all .16s; }
.stat-item:hover, .stat-item.on { border-color: var(--brand-300); box-shadow: 0 8px 20px rgba(50, 80, 55, .07); transform: translateY(-1px); }
.si-ico { width: 38px; height: 38px; border-radius: 11px; background: var(--brand-50); display: grid; place-items: center; font-size: 19px; flex: 0 0 38px; }
.stat-item b { display: block; font-size: 19px; line-height: 1.15; }
.stat-item span { font-size: 10.5px; color: var(--ink-400); }
.order-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--line); margin-bottom: 16px; overflow-x: auto; padding-bottom: 0; }
.order-tabs button { position: relative; border: none; background: transparent; padding: 9px 13px 11px; font-size: 12.5px; color: var(--ink-500); cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px; }
.order-tabs button:hover { color: var(--brand-600); }
.order-tabs button.on { color: var(--brand-700); font-weight: 600; }
.order-tabs button.on::after { content: ""; position: absolute; left: 12px; right: 12px; bottom: -1px; height: 2px; border-radius: 2px; background: var(--brand-600); }
.order-tabs em { font-style: normal; font-size: 9px; background: #f1f4ec; color: var(--ink-400); border-radius: 8px; padding: 0 5px; line-height: 15px; }
.order-tabs button.on em { background: var(--brand-50); color: var(--brand-600); }
.order-list { display: flex; flex-direction: column; gap: 13px; }
.order-card { overflow: hidden; }
.oc-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 17px; background: #fafbf6; border-bottom: 1px solid var(--line); }
.oc-meta { display: flex; align-items: center; gap: 16px; font-size: 10.5px; color: var(--ink-400); flex-wrap: wrap; }
.oc-no b { color: var(--ink-700); font-weight: 500; font-family: ui-monospace, Consolas, monospace; letter-spacing: .3px; }
.oc-body { display: grid; grid-template-columns: 1fr 252px; }
.oc-goods { padding: 4px 17px; }
.oc-good { display: flex; align-items: center; gap: 12px; padding: 11px 0; border-bottom: 1px dashed #eef1e8; }
.oc-good:last-child { border-bottom: none; }
.og-media { width: 66px; height: 66px; border-radius: 11px; background: linear-gradient(135deg, #f0f8ef, #dcecdc); display: grid; place-items: center; font-size: 32px; flex: 0 0 66px; }
.og-main { flex: 1; min-width: 0; }
.og-name { display: block; font-size: 13px; font-weight: 600; }
.og-name:hover { color: var(--brand-600); }
.og-spec { display: block; font-size: 10px; color: var(--ink-400); margin-top: 2px; }
.og-tags { display: flex; gap: 4px; margin-top: 5px; }
.og-tags span { font-size: 8.5px; color: var(--brand-600); background: var(--brand-50); border: 1px solid var(--brand-100); border-radius: 20px; padding: 1px 5px; }
.og-price { font-size: 12.5px; color: var(--ink-700); text-align: right; flex: 0 0 auto; }
.og-price small { font-size: 10px; color: var(--ink-400); }
.oc-side { border-left: 1px dashed var(--line); padding: 14px 17px; display: flex; flex-direction: column; gap: 9px; }
.oc-amount { display: flex; flex-direction: column; align-items: flex-end; }
.oc-amount span { font-size: 10px; color: var(--ink-400); }
.oc-amount b { font-size: 21px; color: #b5473d; letter-spacing: -.5px; }
.oc-addr { display: flex; align-items: flex-start; gap: 4px; font-size: 9.5px; color: var(--ink-400); line-height: 1.5; }
.oc-addr .el-icon { margin-top: 1px; flex: 0 0 auto; }
.oc-actions { display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; margin-top: auto; }
.oc-actions :deep(.el-button) { margin-left: 0; border-radius: 15px; }
.oc-foot { display: flex; align-items: center; gap: 18px; padding: 9px 17px; background: #fcfdf9; border-top: 1px solid #f0f3eb; font-size: 9.5px; color: var(--ink-400); flex-wrap: wrap; }
.oc-foot span { display: inline-flex; align-items: center; gap: 4px; }
.oc-foot .foot-tip { margin-left: auto; color: #a86c18; }
.order-empty { padding: 64px 20px; }
.empty-actions { display: flex; justify-content: center; gap: 8px; margin-top: 16px; }
.pay-dialog { text-align: center; }
.pd-amount { display: flex; flex-direction: column; gap: 2px; }
.pd-amount span { font-size: 11px; color: var(--ink-400); }
.pd-amount b { font-size: 29px; color: #b5473d; letter-spacing: -.8px; }
.pd-qr { display: inline-flex; padding: 9px; background: #fff; border: 1px solid var(--line); border-radius: 13px; margin: 14px 0 8px; }
.pd-tip { font-size: 11px; color: var(--ink-400); }
.pd-methods { display: flex; justify-content: center; gap: 8px; margin: 14px 0; }
.pd-methods button { display: flex; align-items: center; gap: 6px; border: 1px solid var(--line); background: #fff; border-radius: 9px; padding: 7px 12px; font-size: 11px; cursor: pointer; }
.pd-methods button.on { border-color: var(--brand-500); background: var(--brand-50); }
.pd-methods span { width: 22px; height: 22px; border-radius: 6px; display: grid; place-items: center; font-size: 10px; }
.pd-pay { width: 100%; border-radius: 20px; height: 40px; }
.pd-demo { display: block; margin-top: 8px; font-size: 9px; color: var(--ink-300); }
.ld-head { display: flex; align-items: center; gap: 10px; padding-bottom: 12px; border-bottom: 1px dashed var(--line); }
.ld-ico { width: 40px; height: 40px; border-radius: 11px; background: var(--brand-50); display: grid; place-items: center; font-size: 20px; }
.ld-head > div { flex: 1; }
.ld-head b { display: block; font-size: 12.5px; }
.ld-head span { font-size: 10px; color: var(--ink-400); }
.ld-addr { font-size: 10.5px; color: var(--ink-400); padding: 10px 0 0; }
.ld-timeline { margin-top: 14px; padding-left: 3px; }
.ld-timeline b { font-size: 12px; }
.ld-timeline p { font-size: 10.5px; color: var(--ink-400); line-height: 1.6; }
.rd-goods { display: flex; align-items: center; gap: 10px; background: #fafbf6; border: 1px solid var(--line); border-radius: 11px; padding: 10px 12px; }
.rd-goods > span { width: 44px; height: 44px; border-radius: 9px; background: linear-gradient(135deg, #f0f8ef, #dcecdc); display: grid; place-items: center; font-size: 23px; }
.rd-goods b { display: block; font-size: 12px; }
.rd-goods small { font-size: 10px; color: var(--ink-400); }
.rd-rate { display: flex; align-items: center; gap: 14px; margin: 16px 0 10px; }
.rd-rate > span { font-size: 12px; color: var(--ink-500); }
.rd-quick { display: flex; align-items: center; gap: 5px; margin-top: 9px; flex-wrap: wrap; }
.rd-quick > span { font-size: 10px; color: var(--ink-400); }
.rd-quick button { border: 1px solid var(--line); background: #fff; border-radius: 20px; padding: 3px 9px; font-size: 10px; color: var(--ink-400); cursor: pointer; }
.rd-quick button.on { border-color: var(--brand-300); background: var(--brand-50); color: var(--brand-700); }
.rd-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 16px; }
.rd-foot > span { font-size: 10px; color: #a86c18; }
@media (max-width: 900px) {
  .oc-body { grid-template-columns: 1fr; }
  .oc-side { border-left: none; border-top: 1px dashed var(--line); flex-direction: row; flex-wrap: wrap; align-items: center; }
  .oc-amount { flex-direction: row; align-items: baseline; gap: 6px; margin-right: auto; }
  .oc-amount b { font-size: 18px; }
  .oc-addr { display: none; }
  .oc-actions { margin-top: 0; }
}
@media (max-width: 700px) {
  .orders-page { padding: 20px 16px 12px; }
  .orders-head h1 { font-size: 25px; }
  .head-search { width: 100%; }
  .order-stats { grid-template-columns: 1fr 1fr; gap: 8px; }
  .stat-item { padding: 10px 12px; }
  .si-ico { width: 32px; height: 32px; font-size: 16px; flex-basis: 32px; }
  .stat-item b { font-size: 17px; }
  .oc-head { padding: 10px 13px; }
  .oc-goods { padding: 2px 13px; }
  .og-media { width: 54px; height: 54px; font-size: 26px; flex-basis: 54px; }
  .og-price { font-size: 11px; }
  .oc-side { padding: 12px 13px; }
  .oc-address { display: none; }
  .oc-actions :deep(.el-button) { font-size: 11px; }
  .oc-foot { padding: 8px 13px; gap: 10px; }
  .oc-foot .foot-tip { display: none; }
}
</style>
