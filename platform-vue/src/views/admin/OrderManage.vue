<template>
  <div class="page-wrap">
    <PageHeader title="订单管理" sub="客户下单 / 订单状态 / 发货管理">
      <template #actions>
        <el-button :icon="Refresh" @click="refresh">刷新</el-button>
        <el-button type="primary" :icon="Download" @click="exportOrders">导出订单</el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="订单总量" :value="allRows.length" unit="笔" foot="商城订单 + 平台订单" icon="List" />
      <StatCard label="待发货" :value="count('待发货')" unit="笔" foot="请及时安排冷链" icon="Box" tone="warn" />
      <StatCard label="已发货" :value="count('已发货')" unit="笔" foot="运输中订单" icon="Van" tone="info" />
      <StatCard label="待处理售后" :value="pendingAfterSales.length" unit="条" foot="24 小时内响应" icon="Warning" tone="danger" />
    </div>

    <div class="toolbar card">
      <div class="tabs">
        <button v-for="t in tabs" :key="t" class="tab" :class="{ on: tab === t }" @click="tab = t">
          {{ t }}<span v-if="t !== '全部'">{{ count(t) }}</span>
        </button>
      </div>
      <div class="right">
        <el-input v-model="keyword" placeholder="搜索订单号 / 买家 / 商品" clearable class="search">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button :icon="Van" @click="shipFirst">批量发货</el-button>
      </div>
    </div>

    <DataTable
      :columns="columns"
      :rows="rows"
      :filters="filters"
      :search-keys="['no', 'buyer', 'phone', 'goods', 'addr']"
      search-placeholder="搜索订单…"
      export-name="订单列表"
      :row-actions="actions"
      :action-width="150"
      row-key="no"
      @row-action="onAction"
      @refresh="refresh"
    />

    <section class="card after-sales">
      <div class="card-head">
        <h3>售后申请</h3>
        <span class="sub">{{ pendingAfterSales.length }} 条待处理 · 共 {{ mall.allAfterSales.length }} 条</span>
      </div>
      <div class="as-list">
        <div v-for="a in mall.allAfterSales" :key="a.id" class="as-row">
          <span class="as-ico">🛡️</span>
          <div class="as-main">
            <b>{{ a.type }} · {{ a.goods }}</b>
            <p>{{ a.reason }}</p>
            <span class="as-meta">{{ a.user }} · 订单 {{ a.orderNo }} · {{ a.time }}</span>
          </div>
          <b class="as-amount">¥{{ Number(a.amount || 0).toFixed(2) }}</b>
          <StatusTag :status="a.status" />
          <div class="as-acts">
            <template v-if="a.status === '待处理'">
              <el-button type="primary" size="small" @click="handleAfterSale(a, '已同意')">同意退款</el-button>
              <el-button size="small" @click="handleAfterSale(a, '已拒绝')">拒绝</el-button>
            </template>
            <span v-else class="as-done">{{ a.handleTime || '已处理' }}</span>
          </div>
        </div>
        <div v-if="!mall.allAfterSales.length" class="empty-box" style="padding:26px">暂无售后申请</div>
      </div>
    </section>

    <el-drawer v-model="detailOpen" title="订单详情" size="520px">
      <div v-if="current" class="order-detail">
        <div class="od-head">
          <div>
            <div class="od-no">{{ current.no }}</div>
            <div class="tiny muted">{{ current.time }} · {{ current.buyer }} {{ current.phone }}</div>
          </div>
          <StatusTag :status="current.status" />
        </div>
        <div class="od-block">
          <h4>商品信息</h4>
          <div class="od-goods">{{ current.goods }}</div>
          <div class="od-row"><span>订单金额</span><b class="price">{{ money(current.amount) }}</b></div>
          <div class="od-row"><span>支付方式</span><span>{{ current.pay }}</span></div>
        </div>
        <div class="od-block">
          <h4>收货信息</h4>
          <p>{{ current.buyer }} · {{ current.phone }}</p>
          <p class="muted">{{ current.addr }}</p>
        </div>
        <div class="od-block">
          <h4>物流信息</h4>
          <template v-if="current.logistics">
            <div class="od-row"><span>物流公司</span><span>{{ current.logistics.company }}</span></div>
            <div class="od-row"><span>运单号</span><span class="mono">{{ current.logistics.tracking }}</span></div>
            <div class="od-row"><span>发货时间</span><span>{{ current.logistics.time }}</span></div>
          </template>
          <p v-else class="muted">尚未发货</p>
        </div>
        <div class="od-block">
          <h4>订单进度</h4>
          <el-timeline>
            <el-timeline-item v-for="(s, i) in stepsOf(current)" :key="i" :timestamp="s.time" :color="s.done ? '#4f7f56' : '#d3dacd'">
              <div :class="{ 'step-todo': !s.done }">{{ s.text }}</div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailOpen = false">关闭</el-button>
        <el-button v-if="current?.status === '待发货'" type="primary" @click="openShip(current)">立即发货</el-button>
      </template>
    </el-drawer>

    <el-dialog v-model="shipOpen" title="订单发货" width="480px" destroy-on-close>
      <el-form label-width="88px" label-position="left">
        <el-form-item label="订单号"><el-input v-model="shipForm.no" disabled /></el-form-item>
        <el-form-item label="物流公司">
          <el-select v-model="shipForm.company" class="w-full">
            <el-option v-for="c in companies" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="运单号"><el-input v-model="shipForm.tracking" placeholder="请输入运单号" /></el-form-item>
        <div class="ship-tip"><el-icon><InfoFilled /></el-icon> 冷链商品建议使用顺丰冷链或京东冷链，发货后买家会收到通知。</div>
      </el-form>
      <template #footer>
        <el-button @click="shipOpen = false">取消</el-button>
        <el-button type="primary" @click="confirmShip">确认发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Download, Search, Van, InfoFilled } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import DataTable from '@/components/DataTable.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useAdminStore } from '@/stores/admin'
import { useMallStore, orderStatusForFarmer } from '@/stores/mall'
import { money, dateTime, downloadCsv } from '@/utils/format'

const admin = useAdminStore()
const mall = useMallStore()
const tabs = ['全部', '待发货', '已发货', '已完成', '已取消']
const tab = ref('全部')
const keyword = ref('')
const detailOpen = ref(false)
const shipOpen = ref(false)
const current = ref(null)
const shipForm = reactive({ no: '', company: '顺丰冷链', tracking: '' })
const companies = ['顺丰冷链', '京东冷链', '中通冷链', '自提']

/* 商城消费者下单后，农户端能直接看到并发货 */
const consumerRows = computed(() => mall.allOrders.map(o => ({
  no: o.no,
  buyer: o.receiver || '商城用户',
  phone: o.phone || '—',
  goods: o.goods,
  amount: o.amount,
  time: o.time,
  status: orderStatusForFarmer(o),
  pay: '已支付',
  addr: o.addr,
  logistics: o.logistics,
  source: 'mall',
  raw: o
})))
const allRows = computed(() => [...consumerRows.value, ...admin.orderList.map(o => ({ ...o, source: 'platform' }))])
const pendingAfterSales = computed(() => mall.allAfterSales.filter(a => a.status === '待处理'))

const tabsFiltered = computed(() => allRows.value.filter(o => tab.value === '全部' || o.status === tab.value))
const rows = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return tabsFiltered.value
  return tabsFiltered.value.filter(o => ['no', 'buyer', 'phone', 'goods', 'addr'].some(k => String(o[k] ?? '').toLowerCase().includes(kw)))
})
const totalAmount = computed(() => allRows.value.filter(o => o.pay === '已支付').reduce((a, b) => a + Number(b.amount || 0), 0))
const count = (s) => allRows.value.filter(o => o.status === s).length

const columns = [
  { prop: 'no', label: '订单号', width: 160 },
  { prop: 'buyer', label: '买家', width: 90 },
  { prop: 'phone', label: '手机号', width: 120 },
  { prop: 'goods', label: '商品', minWidth: 240 },
  { prop: 'amount', label: '金额', width: 100, type: 'money' },
  { prop: 'time', label: '下单时间', width: 150 },
  { prop: 'status', label: '状态', width: 90, type: 'tag' },
  { prop: 'pay', label: '支付', width: 90, type: 'tag' }
]
const filters = [
  { key: 'status', label: '订单状态', options: ['待发货', '已发货', '已完成', '已取消'].map(v => ({ label: v, value: v })) },
  { key: 'pay', label: '支付状态', options: ['已支付', '待付款'].map(v => ({ label: v, value: v })) }
]
const actions = [
  { key: 'view', label: '详情' },
  { key: 'ship', label: '发货', show: (r) => r.status === '待发货' },
  { key: 'finish', label: '完成', show: (r) => r.status === '已发货' }
]

function onAction({ action, row }) {
  if (action === 'view') { current.value = row; detailOpen.value = true }
  if (action === 'ship') openShip(row)
  if (action === 'finish') {
    if (row.source === 'mall') mall.finishOrder(row.no)
    else admin.confirmDelivered(row.no)
    ElMessage.success('订单已标记完成')
  }
}
function openShip(row) {
  current.value = row
  shipForm.no = row.no
  shipForm.company = '顺丰冷链'
  shipForm.tracking = ''
  shipOpen.value = true
}
function confirmShip() {
  if (!shipForm.tracking.trim()) return ElMessage.warning('请填写运单号')
  const row = current.value
  if (row?.source === 'mall') mall.shipOrder(shipForm.no, shipForm.company, shipForm.tracking.trim())
  else admin.shipOrder(shipForm.no, shipForm.company, shipForm.tracking.trim())
  shipOpen.value = false
  detailOpen.value = false
  ElMessage.success('发货成功，已通知买家')
}
function shipFirst() {
  const first = allRows.value.find(o => o.status === '待发货')
  if (!first) return ElMessage.info('暂无待发货订单')
  openShip(first)
}
async function handleAfterSale(a, status) {
  let note = ''
  if (status === '已拒绝') {
    try {
      const res = await ElMessageBox.prompt('请填写拒绝原因，买家会收到通知', '拒绝售后', {
        confirmButtonText: '确认拒绝', cancelButtonText: '取消', inputPlaceholder: '如：未在 24 小时内提供坏果照片'
      })
      note = res.value || ''
    } catch { return }
  }
  mall.handleAfterSale(a.id, status, note)
  ElMessage.success(status === '已同意' ? '已同意售后，退款将原路返回' : '已拒绝该售后申请')
}
function refresh() { ElMessage.success('订单数据已刷新') }
function stepsOf(o) {
  const base = [
    { text: '买家提交订单', time: o.time, done: true },
    { text: '支付成功', time: o.time, done: o.pay === '已支付' },
    { text: '农户备货', time: o.time, done: o.status !== '待发货' }
  ]
  if (o.logistics) base.push({ text: `已发货 · ${o.logistics.company} ${o.logistics.tracking}`, time: o.logistics.time, done: true })
  if (o.status === '已完成') base.push({ text: '买家确认收货，订单完成', time: o.logistics?.time || o.time, done: true })
  if (o.status === '已取消') base.push({ text: '订单已取消', time: o.time, done: true })
  return base
}
function exportOrders() {
  downloadCsv(`订单列表-${new Date().toISOString().slice(0, 10)}.csv`, [
    { label: '订单号', prop: 'no' }, { label: '买家', prop: 'buyer' }, { label: '手机号', prop: 'phone' },
    { label: '商品', prop: 'goods' }, { label: '金额', value: (r) => money(r.amount) }, { label: '时间', prop: 'time' },
    { label: '状态', prop: 'status' }, { label: '地址', prop: 'addr' }
  ], allRows)
  ElMessage.success('订单已导出')
}
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.toolbar { display: flex; align-items: center; gap: 12px; padding: 12px 14px; margin-bottom: 14px; flex-wrap: wrap; }
.tabs { display: flex; gap: 4px; flex-wrap: wrap; }
.tab { border: none; background: transparent; padding: 7px 12px; border-radius: 8px; font-size: 12.5px; color: var(--ink-500); cursor: pointer; display: inline-flex; align-items: center; gap: 5px; }
.tab:hover { background: var(--brand-50); color: var(--brand-700); }
.tab.on { background: var(--brand-600); color: #fff; font-weight: 600; }
.tab span { font-size: 10px; background: rgba(0,0,0,.08); border-radius: 9px; padding: 0 5px; min-width: 16px; text-align: center; }
.tab.on span { background: rgba(255,255,255,.2); }
.right { margin-left: auto; display: flex; gap: 8px; align-items: center; }
.search { width: 260px; }
.order-detail { display: flex; flex-direction: column; gap: 0; }
.od-head { display: flex; align-items: center; justify-content: space-between; padding-bottom: 14px; border-bottom: 1px solid var(--line); }
.od-no { font-size: 16px; font-weight: 700; font-family: ui-monospace, Consolas, monospace; letter-spacing: .4px; }
.od-block { padding: 14px 0; border-bottom: 1px solid #f2f4ee; }
.od-block:last-child { border-bottom: none; }
.od-block h4 { font-size: 13px; margin-bottom: 9px; color: var(--ink-700); }
.od-block p { font-size: 12.5px; color: var(--ink-700); line-height: 1.8; }
.od-goods { font-size: 13px; padding: 9px 11px; border-radius: 9px; background: var(--bg-soft); margin-bottom: 8px; }
.od-row { display: flex; justify-content: space-between; gap: 14px; font-size: 12.5px; color: var(--ink-500); padding: 5px 0; }
.price { color: #b5473d; font-size: 16px; }
.mono { font-family: ui-monospace, Consolas, monospace; }
.step-todo { color: var(--ink-300); }
.ship-tip { display: flex; align-items: flex-start; gap: 7px; padding: 10px 12px; border-radius: 9px; background: var(--brand-50); color: var(--brand-700); font-size: 12px; line-height: 1.7; }
.after-sales { margin-top: 16px; }
.after-sales .card-head { padding: 14px 16px 10px; }
.as-list { padding: 0 16px 8px; }
.as-row { display: flex; align-items: center; gap: 11px; padding: 12px 0; border-bottom: 1px dashed #eef1e8; }
.as-row:last-child { border-bottom: none; }
.as-ico { width: 34px; height: 34px; border-radius: 10px; background: var(--brand-50); display: grid; place-items: center; font-size: 16px; flex: 0 0 34px; }
.as-main { flex: 1; min-width: 0; }
.as-main b { display: block; font-size: 12px; }
.as-main p { font-size: 10.5px; color: var(--ink-500); line-height: 1.6; margin: 2px 0; }
.as-meta { font-size: 9.5px; color: var(--ink-300); }
.as-amount { font-size: 13px; color: #b5473d; flex: 0 0 auto; }
.as-acts { display: flex; gap: 6px; flex: 0 0 auto; }
.as-done { font-size: 10px; color: var(--ink-300); }
@media (max-width: 1180px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 760px) { .stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; } .search { width: 100%; } .right { width: 100%; } }
</style>
