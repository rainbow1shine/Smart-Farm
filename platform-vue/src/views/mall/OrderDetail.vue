<template>
  <div v-if="order" class="od-page">
    <div class="od-crumb">
      <router-link to="/mall">首页</router-link><span>/</span>
      <router-link to="/mall/orders">我的订单</router-link><span>/</span>
      <b>{{ order.no }}</b>
    </div>

    <section class="status-hero card" :class="statusMeta.tone">
      <div class="sh-icon">{{ statusMeta.icon }}</div>
      <div class="sh-main">
        <span class="kicker">ORDER STATUS</span>
        <h1>{{ statusMeta.title }}</h1>
        <p>{{ statusMeta.desc }}</p>
        <div class="sh-meta">
          <span>订单号 <b>{{ order.no }}</b><button class="copy" @click="copyNo">复制</button></span>
          <span>下单时间 {{ order.time }}</span>
        </div>
      </div>
      <div class="sh-actions">
        <el-button v-if="order.status === '待付款'" type="primary" size="large" @click="payOpen = true">立即支付</el-button>
        <el-button v-if="order.status === '待付款'" size="large" @click="cancelOrder">取消订单</el-button>
        <el-button v-if="order.status === '待发货'" type="primary" plain size="large" @click="remind">提醒发货</el-button>
        <el-button v-if="['运输中', '待收货'].includes(order.status)" type="primary" size="large" @click="confirmReceipt">确认收货</el-button>
        <el-button v-if="order.status === '待评价'" type="primary" size="large" @click="openReview">去评价</el-button>
        <el-button v-if="['已完成', '已取消'].includes(order.status)" type="primary" size="large" @click="buyAgain">再次购买</el-button>
        <el-button size="large" @click="$router.push('/mall/orders')">返回订单列表</el-button>
      </div>
    </section>

    <section class="progress-card card">
      <div class="pc-head">
        <h3>订单进度</h3>
        <span v-if="order.status !== '已取消'">预计 {{ estimateTime }} 送达</span>
      </div>
      <div class="steps">
        <div v-for="(s, i) in steps" :key="i" class="step" :class="{ done: i <= activeStep, current: i === activeStep, cancel: order.status === '已取消' && i === 0 }">
          <div class="step-dot">
            <el-icon v-if="i < activeStep"><Check /></el-icon>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <div class="step-body">
            <b>{{ s.title }}</b>
            <p>{{ s.text }}</p>
            <small>{{ s.time }}</small>
          </div>
          <i v-if="i < steps.length - 1" class="step-line"></i>
        </div>
      </div>
    </section>

    <div class="od-grid">
      <div class="od-main">
        <section class="card goods-card">
          <div class="card-head">
            <h3>商品清单</h3>
            <span class="sub">{{ goodsList.length }} 种商品</span>
            <div class="acts">
              <el-button v-if="['已完成', '已取消'].includes(order.status)" text type="primary" size="small" @click="buyAgain">再次购买</el-button>
            </div>
          </div>
          <div class="goods-list">
            <div v-for="(g, i) in goodsList" :key="i" class="goods-row">
              <router-link :to="`/mall/product/${g.id}`" class="gr-media">{{ g.icon }}</router-link>
              <div class="gr-main">
                <router-link :to="`/mall/product/${g.id}`" class="gr-name">{{ g.name }}</router-link>
                <span class="gr-spec">{{ g.spec }}</span>
                <div class="gr-tags">
                  <span v-if="g.trace && g.trace !== '—'">可溯源</span>
                  <span>产地直发</span>
                </div>
              </div>
              <div class="gr-price">¥{{ Number(g.price).toFixed(2) }}</div>
              <div class="gr-qty">× {{ g.qty }}</div>
              <div class="gr-sub">¥{{ (Number(g.price) * g.qty).toFixed(2) }}</div>
            </div>
          </div>
        </section>

        <section v-if="showLogistics" class="card logistics-card">
          <div class="card-head">
            <h3>物流信息</h3>
            <span class="sub">顺丰冷链 · {{ trackingNo }}</span>
            <div class="acts"><el-button text type="primary" size="small" @click="copyTracking">复制单号</el-button></div>
          </div>
          <div class="logistics-body">
            <div class="logi-top">
              <span class="logi-ico">🚚</span>
              <div>
                <b>{{ order.status === '待评价' || order.status === '已完成' ? '快件已签收' : '快件运输中' }}</b>
                <p>{{ order.status === '待评价' || order.status === '已完成' ? '签收人：本人 · 如有问题请在 24 小时内反馈' : '快件已到达重庆转运中心，正在发往渝北网点' }}</p>
              </div>
              <StatusTag :status="order.status" />
            </div>
            <el-timeline class="logi-timeline">
              <el-timeline-item v-for="(s, i) in logisticsSteps" :key="i" :timestamp="s.time" :color="i === 0 ? '#3f6f4a' : '#cddbc8'">
                <b>{{ s.title }}</b>
                <p>{{ s.text }}</p>
              </el-timeline-item>
            </el-timeline>
          </div>
        </section>

        <section class="card info-card">
          <div class="card-head"><h3>订单信息</h3></div>
          <div class="info-grid">
            <div><span>订单编号</span><b>{{ order.no }}</b></div>
            <div><span>下单时间</span><b>{{ order.time }}</b></div>
            <div><span>支付方式</span><b>{{ order.pay || '微信支付' }}</b></div>
            <div><span>配送方式</span><b>{{ order.delivery || '产地直发 · 冷链配送' }}</b></div>
            <div><span>订单状态</span><b>{{ order.status }}</b></div>
            <div><span>订单备注</span><b>{{ order.remark || '无' }}</b></div>
          </div>
        </section>
      </div>

      <aside class="od-side">
        <section class="card side-card">
          <div class="sc-head"><h3>收货信息</h3><span class="tag">已确认</span></div>
          <div class="addr-name">{{ order.receiver || '王双红' }} <span>{{ order.phone || '187****2233' }}</span></div>
          <p class="addr-text">{{ order.addr }}</p>
          <div class="addr-note"><el-icon><Location /></el-icon>收货后如有问题，请在 24 小时内联系农户</div>
        </section>

        <section class="card side-card">
          <div class="sc-head"><h3>金额明细</h3></div>
          <div class="amount-row"><span>商品金额</span><b>¥{{ subtotal.toFixed(2) }}</b></div>
          <div class="amount-row"><span>运费</span><b :class="{ free: shipping === 0 }">{{ shipping === 0 ? '免运费' : '¥' + shipping.toFixed(2) }}</b></div>
          <div v-if="discount" class="amount-row"><span>优惠券</span><b class="minus">-¥{{ discount.toFixed(2) }}</b></div>
          <div class="amount-total"><span>实付金额</span><div><small>¥</small><b>{{ Number(order.amount).toFixed(2) }}</b></div></div>
        </section>

        <section class="card side-card help-card">
          <div class="sc-head"><h3>需要帮助？</h3></div>
          <button @click="contact"><span>💬</span><div><b>联系农户</b><small>在线时间 6:00 – 22:00</small></div><el-icon><ArrowRight /></el-icon></button>
          <button v-if="afterSaleOfOrder" @click="showAfterSale" class="after-btn">
            <span>🛡️</span>
            <div><b>售后 {{ afterSaleOfOrder.status }}</b><small>{{ afterSaleOfOrder.type }} · ¥{{ Number(afterSaleOfOrder.amount).toFixed(2) }}</small></div>
            <el-icon><ArrowRight /></el-icon>
          </button>
          <button v-else @click="openAfterSale"><span>🛡️</span><div><b>申请售后</b><small>坏果包赔 · 24 小时内反馈</small></div><el-icon><ArrowRight /></el-icon></button>
          <button @click="$router.push('/mall/trace')"><span>🔎</span><div><b>查询溯源</b><small>查看本批农产品档案</small></div><el-icon><ArrowRight /></el-icon></button>
        </section>
      </aside>
    </div>

    <el-dialog v-model="payOpen" title="订单支付" width="440px" destroy-on-close>
      <div class="pay-dialog">
        <div class="pd-amount"><span>应付金额</span><b>¥{{ Number(order.amount).toFixed(2) }}</b></div>
        <div class="pd-qr" v-html="qrSvg(150)"></div>
        <p class="pd-tip">请使用微信扫一扫完成支付</p>
        <el-button type="primary" class="pd-pay" :loading="paying" @click="confirmPay">我已完成支付</el-button>
        <span class="pd-demo">演示环境，点击按钮即模拟支付成功</span>
      </div>
    </el-dialog>

    <el-dialog v-model="reviewOpen" title="评价订单" width="500px" destroy-on-close>
      <div class="review-dialog">
        <div class="rd-goods">
          <span>{{ goodsList[0]?.icon }}</span>
          <div><b>{{ goodsList[0]?.name }}</b><small>{{ goodsList[0]?.spec }}</small></div>
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
    <el-dialog v-model="asOpen" title="申请售后" width="500px" destroy-on-close>
      <div class="as-dialog">
        <div class="rd-goods">
          <span>{{ goodsList[0]?.icon }}</span>
          <div><b>{{ goodsList[0]?.name }}</b><small>订单 {{ order.no }} · 实付 ¥{{ Number(order.amount).toFixed(2) }}</small></div>
        </div>
        <el-form label-position="top" class="mt-12">
          <el-form-item label="售后类型">
            <el-radio-group v-model="asForm.type">
              <el-radio-button label="坏果赔付" />
              <el-radio-button label="仅退款" />
              <el-radio-button label="退货退款" />
            </el-radio-group>
          </el-form-item>
          <el-form-item label="退款金额">
            <el-input-number v-model="asForm.amount" :min="0" :max="Number(order.amount)" :precision="2" controls-position="right" />
          </el-form-item>
          <el-form-item label="问题描述">
            <el-input v-model="asForm.reason" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="描述坏果数量、变质情况，建议同时联系农户提供照片" />
          </el-form-item>
        </el-form>
        <div class="as-tip">收货 24 小时内提交，农户核实后按坏果数量退款或补发。</div>
      </div>
      <template #footer>
        <el-button @click="asOpen = false">取消</el-button>
        <el-button type="primary" @click="submitAfterSale">提交申请</el-button>
      </template>
    </el-dialog>
  </div>

  <div v-else class="card empty-box od-empty">
    <div class="icon">📦</div>
    <div>没有找到这笔订单</div>
    <p class="muted tiny">订单可能已被删除，或链接中的订单号有误。</p>
    <el-button type="primary" plain class="mt-12" @click="$router.push('/mall/orders')">返回订单列表</el-button>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Location, ArrowRight } from '@element-plus/icons-vue'
import StatusTag from '@/components/StatusTag.vue'
import { useCartStore } from '@/stores/cart'
import { useMallStore } from '@/stores/mall'
import DB from '@/data/db'
import { qrSvg } from '@/utils/format'

const route = useRoute()
const cart = useCartStore()
const mall = useMallStore()

const order = computed(() => mall.findOrder(String(route.params.no)))
const payOpen = ref(false)
const paying = ref(false)
const reviewOpen = ref(false)
const reviewStars = ref(5)
const reviewText = ref('')
const reviewTags = ['很新鲜', '口感很好', '包装严实', '物流很快', '分量足', '会回购']

const goodsList = computed(() => {
  const o = order.value
  if (!o) return []
  return (o.items || []).map(it => {
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
})
const subtotal = computed(() => goodsList.value.reduce((a, g) => a + Number(g.price) * g.qty, 0))
const shipping = computed(() => order.value?.shipping ?? (subtotal.value >= 59 ? 0 : 6))
const discount = computed(() => order.value?.discount || 0)

const statusMap = {
  待付款: { icon: '⏰', title: '等待支付', desc: '请在 24 小时内完成支付，超时订单将自动取消。', tone: 'warn' },
  待发货: { icon: '🧺', title: '农户备货中', desc: '农户正在按订单采摘、分级和预冷打包，发货后会通知你。', tone: '' },
  运输中: { icon: '🚚', title: '冷链运输中', desc: '快件已由产地发出，全程冷链温控，请保持电话畅通。', tone: 'info' },
  待收货: { icon: '📦', title: '即将送达', desc: '快件正在派送中，预计今日送达，请留意配送员电话。', tone: 'info' },
  待评价: { icon: '💬', title: '已签收，期待你的评价', desc: '感谢购买，晒单评价可以获得 10 积分，也能帮助其他买家。', tone: 'done' },
  已完成: { icon: '✅', title: '订单已完成', desc: '感谢你的支持，期待下一次为你送上新鲜。', tone: 'done' },
  已取消: { icon: '🚫', title: '订单已取消', desc: '这笔订单已取消，如仍需购买可以重新下单。', tone: 'cancel' }
}
const statusMeta = computed(() => statusMap[order.value?.status] || statusMap['待发货'])

const activeStep = computed(() => {
  const status = order.value?.status
  if (status === '待付款') return 0
  if (status === '待发货') return 1
  if (status === '运输中' || status === '待收货') return 3
  if (status === '待评价') return 4
  if (status === '已完成') return 5
  return 0
})

const steps = computed(() => {
  const o = order.value
  if (!o) return []
  const timeline = o.timeline || []
  return [
    { title: '提交订单', text: '订单已创建，等待支付' },
    { title: '支付成功', text: `${o.pay || '微信支付'} · 支付完成` },
    { title: '农户发货', text: '产地完成预冷打包，顺丰冷链揽收' },
    { title: '运输中', text: '快件已到达重庆转运中心' },
    { title: '已签收', text: '快件已送达，签收人：本人' },
    { title: '订单完成', text: '订单已完成，感谢你的支持' }
  ].map((s, i) => ({
    ...s,
    time: i <= activeStep.value ? (timeline[i]?.time || '已完成') : '待完成'
  }))
})

const showLogistics = computed(() => order.value && ['运输中', '待收货', '待评价', '已完成'].includes(order.value.status))
const trackingNo = computed(() => (order.value ? 'SF' + order.value.no.replace(/\D/g, '').slice(-10) : ''))
const estimateTime = computed(() => (['运输中', '待收货'].includes(order.value?.status) ? '今日 10:00 前' : '明日 10:00 前'))

const logisticsSteps = computed(() => {
  const o = order.value
  if (!o) return []
  if (['待评价', '已完成'].includes(o.status)) {
    return [
      { title: '快件已签收', text: '签收人：本人 · 重庆渝北区龙湖天街', time: '2026-11-10 09:30' },
      { title: '派送中', text: '配送员正在派送，请保持电话畅通', time: '2026-11-10 08:10' },
      { title: '运输中', text: '快件已到达重庆转运中心', time: '2026-11-09 18:40' },
      { title: '已发货', text: '顺丰冷链已揽收', time: '2026-11-09 07:20' }
    ]
  }
  return [
    { title: '运输中', text: '快件已到达重庆转运中心，正在发往渝北网点', time: '2026-11-09 18:40' },
    { title: '已发货', text: '产地完成预冷打包，顺丰冷链揽收', time: '2026-11-09 07:20' },
    { title: '已支付', text: '支付成功，农户开始备货', time: o.time }
  ]
})

function copyNo() {
  navigator.clipboard?.writeText(order.value.no).then(() => ElMessage.success('订单号已复制')).catch(() => ElMessage.info(order.value.no))
}
function copyTracking() {
  navigator.clipboard?.writeText(trackingNo.value).then(() => ElMessage.success('物流单号已复制')).catch(() => ElMessage.info(trackingNo.value))
}
function confirmPay() {
  paying.value = true
  setTimeout(() => {
    mall.updateStatus(order.value.no, '待发货')
    paying.value = false
    payOpen.value = false
    ElMessage.success('支付成功，农户已开始备货')
  }, 700)
}
async function cancelOrder() {
  try {
    await ElMessageBox.confirm('确定取消这笔订单吗？取消后可重新下单。', '取消订单', { type: 'warning', confirmButtonText: '取消订单', cancelButtonText: '再想想' })
    mall.updateStatus(order.value.no, '已取消')
    ElMessage.success('订单已取消')
  } catch {}
}
function remind() {
  mall.addMessage({ type: '订单', title: '已提醒农户发货', text: `你已提醒农户尽快发出订单 ${order.value.no}。` })
  ElMessage.success('已提醒农户发货')
}
async function confirmReceipt() {
  try {
    await ElMessageBox.confirm('请确认已经收到商品，确认后订单将进入待评价状态。', '确认收货', { type: 'info', confirmButtonText: '确认收货', cancelButtonText: '暂未收到' })
    mall.updateStatus(order.value.no, '待评价')
    ElMessage.success('已确认收货，去评价一下吧')
  } catch {}
}
function openReview() {
  reviewStars.value = 5
  reviewText.value = ''
  reviewOpen.value = true
}
function toggleTag(t) {
  if (reviewText.value.includes(t)) reviewText.value = reviewText.value.replace(t + '，', '').replace(t, '')
  else reviewText.value = reviewText.value ? `${reviewText.value}，${t}` : t
}
function submitReview() {
  const g = goodsList.value[0] || {}
  mall.addReview({ orderNo: order.value.no, goods: g.name, goodsId: g.id, stars: reviewStars.value, text: reviewText.value })
  reviewOpen.value = false
  ElMessage.success('评价已提交，感谢你的反馈')
}

/* ===== 售后 ===== */
const asOpen = ref(false)
const asForm = reactive({ type: '坏果赔付', reason: '', amount: 0 })
const afterSaleOfOrder = computed(() => (order.value ? mall.afterSales.find(a => a.orderNo === order.value.no) : null))
function openAfterSale() {
  asForm.type = '坏果赔付'
  asForm.reason = ''
  asForm.amount = Number(order.value?.amount || 0)
  asOpen.value = true
}
function submitAfterSale() {
  if (!asForm.reason.trim()) return ElMessage.warning('请填写问题描述')
  mall.applyAfterSale({ orderNo: order.value.no, types: asForm.type, reason: asForm.reason.trim(), amount: asForm.amount })
  asOpen.value = false
  ElMessage.success('售后申请已提交，农户会在 24 小时内处理')
}
function showAfterSale() {
  const a = afterSaleOfOrder.value
  ElMessage.info(`当前售后状态：${a.status}${a.handleNote ? '（' + a.handleNote + '）' : ''}`)
}
function buyAgain() {
  let added = 0
  goodsList.value.forEach(g => { if (cart.add(g.id, g.qty).ok) added += 1 })
  ElMessage[added ? 'success' : 'warning'](added ? `${added} 种商品已加入购物车` : '商品已下架，暂时无法再次购买')
}
function contact() { ElMessage.info('农户服务热线：400-880-2026（演示环境）') }
</script>

<style scoped>
.od-page { max-width: 1180px; margin: 0 auto; padding: 20px 24px 16px; }
.od-crumb { display: flex; align-items: center; gap: 7px; font-size: 11.5px; color: var(--ink-400); padding: 2px 0 14px; flex-wrap: wrap; }
.od-crumb a:hover { color: var(--brand-600); }
.od-crumb b { color: var(--ink-700); font-weight: 500; font-family: ui-monospace, Consolas, monospace; }
.status-hero { position: relative; display: flex; align-items: center; gap: 18px; padding: 24px 26px; overflow: hidden; background: linear-gradient(115deg, #f2f8ec, #fbfdf7 62%, #f7f5ee); }
.status-hero::after { content: ""; position: absolute; right: -60px; top: -110px; width: 260px; height: 260px; border-radius: 50%; background: radial-gradient(circle, rgba(125,171,112,.18), transparent 70%); }
.sh-icon { width: 64px; height: 64px; border-radius: 18px; background: #fff; display: grid; place-items: center; font-size: 30px; flex: 0 0 64px; box-shadow: 0 10px 24px rgba(50, 80, 55, .1); }
.sh-main { flex: 1; min-width: 0; position: relative; z-index: 1; }
.kicker { font-size: 9px; letter-spacing: 2px; color: var(--brand-500); }
.sh-main h1 { font-size: 24px; margin: 3px 0 3px; }
.sh-main > p { font-size: 11.5px; color: var(--ink-500); }
.sh-meta { display: flex; gap: 18px; margin-top: 8px; font-size: 10.5px; color: var(--ink-400); flex-wrap: wrap; }
.sh-meta b { color: var(--ink-700); font-family: ui-monospace, Consolas, monospace; font-weight: 500; }
.copy { border: none; background: transparent; color: var(--brand-600); font-size: 10px; cursor: pointer; margin-left: 4px; }
.sh-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; position: relative; z-index: 1; }
.sh-actions :deep(.el-button) { border-radius: 21px; }
.status-hero.cancel { background: linear-gradient(115deg, #f7f5f3, #fbfbf9); }
.status-hero.cancel .sh-icon { filter: grayscale(.5); }
.progress-card { margin-top: 14px; padding: 17px 20px 12px; }
.pc-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 18px; }
.pc-head h3 { font-size: 14px; }
.pc-head span { font-size: 10.5px; color: var(--brand-600); }
.steps { display: flex; align-items: flex-start; }
.step { position: relative; flex: 1; display: flex; align-items: flex-start; gap: 9px; padding-right: 12px; min-width: 0; }
.step-dot { width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--line-strong); background: #fff; color: var(--ink-300); display: grid; place-items: center; font-size: 10px; flex: 0 0 24px; position: relative; z-index: 2; }
.step.done .step-dot { background: var(--brand-600); border-color: var(--brand-600); color: #fff; }
.step.current .step-dot { box-shadow: 0 0 0 4px rgba(86, 133, 93, .16); }
.step.cancel .step-dot { background: var(--danger); border-color: var(--danger); color: #fff; }
.step-body { min-width: 0; flex: 0 1 auto; }
.step-body b { display: block; font-size: 11px; color: var(--ink-400); }
.step.done .step-body b { color: var(--ink-700); }
.step-body p { font-size: 9.5px; color: var(--ink-300); line-height: 1.4; margin-top: 1px; display: none; }
.step-body small { display: block; font-size: 9px; color: var(--ink-300); margin-top: 2px; }
.step-line { flex: 1 1 16px; height: 1px; margin: 11px 10px 0; background: var(--line-strong); }
.step.done .step-line { background: var(--brand-400); }
.od-grid { display: grid; grid-template-columns: 1fr 300px; gap: 16px; margin-top: 14px; align-items: start; }
.od-main { display: flex; flex-direction: column; gap: 14px; }
.goods-list { padding: 2px 20px 8px; }
.goods-row { display: flex; align-items: center; gap: 12px; padding: 13px 0; border-bottom: 1px dashed #eef1e8; }
.goods-row:last-child { border-bottom: none; }
.gr-media { width: 70px; height: 70px; border-radius: 11px; background: linear-gradient(135deg, #f0f8ef, #dcecdc); display: grid; place-items: center; font-size: 34px; flex: 0 0 70px; }
.gr-main { flex: 1; min-width: 0; }
.gr-name { display: block; font-size: 13px; font-weight: 600; }
.gr-name:hover { color: var(--brand-600); }
.gr-spec { font-size: 10px; color: var(--ink-400); }
.gr-tags { display: flex; gap: 4px; margin-top: 5px; }
.gr-tags span { font-size: 8.5px; color: var(--brand-600); background: var(--brand-50); border: 1px solid var(--brand-100); border-radius: 20px; padding: 1px 5px; }
.gr-price { font-size: 11.5px; color: var(--ink-500); width: 70px; text-align: right; }
.gr-qty { font-size: 11px; color: var(--ink-400); width: 40px; text-align: center; }
.gr-sub { font-size: 14px; font-weight: 600; color: #b5473d; width: 80px; text-align: right; }
.logistics-body { padding: 4px 20px 6px; }
.logi-top { display: flex; align-items: center; gap: 10px; padding: 10px 0 12px; border-bottom: 1px dashed var(--line); }
.logi-ico { width: 38px; height: 38px; border-radius: 11px; background: var(--brand-50); display: grid; place-items: center; font-size: 19px; flex: 0 0 38px; }
.logi-top > div { flex: 1; min-width: 0; }
.logi-top b { font-size: 12px; }
.logi-top p { font-size: 10px; color: var(--ink-400); margin-top: 1px; }
.logi-timeline { margin-top: 14px; padding-left: 3px; }
.logi-timeline b { font-size: 11.5px; }
.logi-timeline p { font-size: 10px; color: var(--ink-400); line-height: 1.6; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px; padding: 8px 20px 16px; }
.info-grid div { display: grid; grid-template-columns: 56px minmax(0, 1fr); align-items: baseline; gap: 12px; padding: 7px 0; border-bottom: 1px dashed #eef1e8; font-size: 10.5px; }
.info-grid span { color: var(--ink-400); white-space: nowrap; }
.info-grid b { font-weight: 500; text-align: left; }
.od-side { display: flex; flex-direction: column; gap: 12px; position: sticky; top: 88px; }
.side-card { padding: 16px 18px; }
.sc-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
.sc-head h3 { font-size: 13.5px; }
.sc-head .tag { font-size: 9px; color: var(--brand-600); background: var(--brand-50); border-radius: 20px; padding: 2px 8px; }
.addr-name { font-size: 13px; font-weight: 600; }
.addr-name span { font-size: 10.5px; color: var(--ink-400); font-weight: 400; margin-left: 5px; }
.addr-text { font-size: 11px; color: var(--ink-500); line-height: 1.7; margin-top: 4px; }
.addr-note { display: flex; align-items: flex-start; gap: 4px; margin-top: 9px; padding-top: 9px; border-top: 1px dashed var(--line); font-size: 9.5px; color: var(--ink-400); line-height: 1.5; }
.amount-row { display: flex; justify-content: space-between; font-size: 11.5px; padding: 4px 0; }
.amount-row span { color: var(--ink-400); }
.amount-row b { font-weight: 500; }
.amount-row b.free { color: var(--success); }
.amount-row b.minus { color: #b5473d; }
.amount-total { display: flex; align-items: flex-end; justify-content: space-between; padding-top: 10px; margin-top: 6px; border-top: 1px solid var(--line); }
.amount-total > span { font-size: 11.5px; color: var(--ink-500); }
.amount-total small { font-size: 12px; color: #b5473d; }
.amount-total b { font-size: 24px; color: #b5473d; letter-spacing: -.6px; }
.help-card button { display: flex; align-items: center; gap: 9px; width: 100%; border: none; background: transparent; padding: 9px 0; border-bottom: 1px dashed #eef1e8; cursor: pointer; text-align: left; }
.help-card button:last-child { border-bottom: none; }
.help-card button > span { font-size: 18px; }
.help-card button > div { flex: 1; }
.help-card b { display: block; font-size: 11.5px; color: var(--ink-700); }
.help-card small { font-size: 9.5px; color: var(--ink-400); }
.help-card button .el-icon { color: var(--ink-300); font-size: 12px; }
.help-card button:hover b { color: var(--brand-600); }
.od-empty { max-width: 600px; margin: 50px auto; }
.pay-dialog { text-align: center; }
.pd-amount { display: flex; flex-direction: column; gap: 2px; }
.pd-amount span { font-size: 11px; color: var(--ink-400); }
.pd-amount b { font-size: 29px; color: #b5473d; }
.pd-qr { display: inline-flex; padding: 9px; background: #fff; border: 1px solid var(--line); border-radius: 13px; margin: 14px 0 8px; }
.pd-tip { font-size: 11px; color: var(--ink-400); }
.pd-pay { width: 100%; border-radius: 20px; height: 40px; margin-top: 14px; }
.pd-demo { display: block; margin-top: 8px; font-size: 9px; color: var(--ink-300); }
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
.as-tip { margin-top: 4px; padding: 9px 11px; border-radius: 8px; background: #f7faf2; border: 1px dashed var(--line-strong); font-size: 10.5px; color: var(--ink-400); line-height: 1.7; }
@media (max-width: 940px) {
  .od-grid { grid-template-columns: 1fr; }
  .od-side { position: static; display: grid; grid-template-columns: 1fr 1fr; }
  .help-card { grid-column: 1 / -1; }
  .steps { flex-wrap: wrap; gap: 14px 0; }
  .step { flex: 1 1 33%; }
  .step-line { display: none; }
}
@media (max-width: 700px) {
  .od-page { padding: 14px 16px 12px; }
  .status-hero { padding: 18px; flex-wrap: wrap; }
  .sh-icon { width: 48px; height: 48px; font-size: 23px; flex-basis: 48px; }
  .sh-main h1 { font-size: 20px; }
  .sh-actions { width: 100%; justify-content: flex-start; }
  .sh-actions :deep(.el-button) { height: 34px; padding: 0 14px; font-size: 12px; }
  .od-side { grid-template-columns: 1fr; }
  .step { flex: 1 1 50%; }
  .step-body b { font-size: 10.5px; }
  .goods-list, .info-grid, .logistics-body { padding-left: 14px; padding-right: 14px; }
  .gr-media { width: 54px; height: 54px; font-size: 26px; flex-basis: 54px; }
  .gr-price { display: none; }
  .gr-sub { width: 64px; font-size: 12.5px; }
  .info-grid { grid-template-columns: 1fr; }
}
</style>
