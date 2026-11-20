<template>
  <div class="dashboard page-wrap">
    <div class="dash-hero">
      <div>
        <div class="dash-kicker">{{ today }} · {{ clock }}</div>
        <h1>{{ greeting() }}，{{ auth.user?.name || '伙伴' }}</h1>
        <p>{{ auth.roleMeta.desc }}。今天有 <b>{{ admin.openAlarms.length }}</b> 条待处置告警、<b>{{ pendingWos.length }}</b> 项农事待办。</p>
        <div class="hero-actions">
          <el-button type="primary" :icon="Plus" @click="$router.push('/admin/farm-workorder')">新建工单</el-button>
          <el-button :icon="Refresh" @click="refresh">刷新数据</el-button>
          <el-button text @click="$router.push('/screen')">打开大屏 <el-icon><ArrowRight /></el-icon></el-button>
        </div>
      </div>
      <div class="hero-side">
        <div class="weather">
          <span class="w-icon">⛅</span>
          <div>
            <b>23.6℃</b>
            <span>多云 · 东南风 2.4m/s</span>
          </div>
        </div>
        <div class="hero-mini">
          <div><b>{{ admin.onlineDevices.length }}/{{ admin.devices.length }}</b><span>设备在线</span></div>
          <div><b>{{ ((admin.onlineDevices.length / admin.devices.length) * 100).toFixed(0) }}%</b><span>在线率</span></div>
        </div>
      </div>
    </div>

    <div class="stat-grid">
      <StatCard label="今日产量" :value="todayOutput" unit="kg" foot="较昨日 +6.2%" icon="Grape" />
      <StatCard label="在售商品" :value="admin.goods.length" unit="款" :foot="`${DB.catTree.length} 个大类`" icon="Goods" tone="info" />
      <StatCard label="待处置告警" :value="admin.openAlarms.length" unit="条" foot="紧急 1 · 重要 2" icon="Warning" tone="danger" />
      <StatCard label="待发货订单" :value="pendingOrders.length" unit="笔" foot="今日新增 3 笔" icon="List" tone="warn" />
    </div>

    <div class="dash-grid">
      <ChartBox class="span-2" title="24 小时环境趋势" sub="空气温度 / 土壤湿度 / 光照" :option="trendOption" :height="280" />
      <ChartBox title="作物种植结构" sub="按面积占比" :option="cropOption" :height="280" />
      <div class="card todo-card">
        <div class="card-head">
          <h3>今日农事待办</h3>
          <span class="sub">{{ pendingWos.length }} 项待执行</span>
          <div class="acts"><el-button text type="primary" @click="$router.push('/admin/farm-workorder')">全部</el-button></div>
        </div>
        <div class="todo-list">
          <div v-for="w in pendingWos.slice(0, 4)" :key="w.id" class="todo-item">
            <div class="todo-check" @click="complete(w)"><el-icon><Check /></el-icon></div>
            <div class="todo-main">
              <b>{{ w.title }}</b>
              <span>{{ plotName(w.plot) }} · {{ w.assignee }} · 计划 {{ w.plan }}</span>
            </div>
            <StatusTag :status="w.status" />
          </div>
          <div v-if="!pendingWos.length" class="empty-box" style="padding:28px">今日待办已全部完成 🎉</div>
        </div>
      </div>

      <div class="card alarm-card">
        <div class="card-head">
          <h3>实时告警</h3>
          <span class="sub">按等级排序</span>
          <div class="acts"><el-button text type="primary" @click="$router.push('/admin/alarm')">处置</el-button></div>
        </div>
        <div class="alarm-list">
          <div v-for="a in admin.openAlarms.slice(0, 4)" :key="a.id" class="alarm-item" @click="$router.push('/admin/alarm')">
            <span class="level" :class="a.level">{{ a.level }}</span>
            <div class="am">
              <b>{{ a.target }}</b>
              <span>{{ a.desc }}</span>
            </div>
            <small>{{ a.time.slice(11) }}</small>
          </div>
          <div v-if="!admin.openAlarms.length" class="empty-box" style="padding:28px">暂无待处置告警</div>
        </div>
      </div>
      <ChartBox class="span-3" title="农事完成进度" sub="按地块统计" :option="progressOption" :height="260" />
      <div class="card quick-card full">
        <div class="card-head"><h3>快捷操作</h3><span class="sub">按当前角色推荐</span></div>
        <div class="quick-grid">
          <button v-for="q in quickActions" :key="q.to" class="quick-item" @click="$router.push(q.to)">
            <span class="qi" :style="{ background: q.bg, color: q.color }"><component :is="q.icon" /></span>
            <b>{{ q.label }}</b>
            <small>{{ q.desc }}</small>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Refresh, ArrowRight, Check } from '@element-plus/icons-vue'
import StatCard from '@/components/StatCard.vue'
import ChartBox from '@/components/ChartBox.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useAuthStore } from '@/stores/auth'
import { useAdminStore } from '@/stores/admin'
import { useMallStore } from '@/stores/mall'
import { greeting } from '@/utils/format'
import DB from '@/data/db'

const auth = useAuthStore()
const admin = useAdminStore()
const mall = useMallStore()
const router = useRouter()
const clock = ref('')
let timer = null
const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

const pendingWos = computed(() => admin.workorders.filter(w => w.status !== '已完成' && w.status !== '已验收'))
const pendingOrders = computed(() => [
  ...admin.orderList.filter(o => o.status === '待发货'),
  ...mall.allOrders.filter(o => o.status === '待发货')
])
const todayOutput = computed(() => DB.harvests.filter(h => h.status === '已溯源').reduce((a, b) => a + b.qty, 0).toLocaleString())
const plotName = (id) => DB.plots.find(p => p.id === id)?.name || id

const trendOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['温度(℃)', '湿度(%)', '光照(klx)'], right: 10, top: 4, textStyle: { fontSize: 11 } },
  grid: { left: 42, right: 24, top: 42, bottom: 28 },
  xAxis: { type: 'category', boundaryGap: false, data: DB.trend24.hours.map(h => h + ':00'), axisLine: { lineStyle: { color: '#dfe6d9' } }, axisLabel: { color: '#8b998f', fontSize: 10 } },
  yAxis: { type: 'value', splitLine: { lineStyle: { color: '#eef2e8' } }, axisLabel: { color: '#8b998f', fontSize: 10 } },
  series: [
    { name: '温度(℃)', type: 'line', smooth: true, symbol: 'none', data: DB.trend24.temp, lineStyle: { width: 2.5, color: '#c28632' }, areaStyle: { color: 'rgba(194,134,50,.08)' } },
    { name: '湿度(%)', type: 'line', smooth: true, symbol: 'none', data: DB.trend24.humidity, lineStyle: { width: 2.5, color: '#4b7f9e' } },
    { name: '光照(klx)', type: 'line', smooth: true, symbol: 'none', data: DB.trend24.light.map(v => v / 1000), lineStyle: { width: 2, color: '#5b8c62', type: 'dashed' } }
  ]
}
const cropOption = {
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 11 } },
  series: [{
    type: 'pie', radius: ['46%', '68%'], center: ['50%', '44%'], avoidLabelOverlap: true,
    itemStyle: { borderColor: '#fff', borderWidth: 2 },
    label: { show: false },
    data: DB.screen.cropDist.map((c, i) => ({ name: c.name, value: c.v, itemStyle: { color: ['#5b8c62', '#8fb87a', '#c28632', '#d9b26a', '#6f9f9b', '#a8b98a'][i] } }))
  }]
}
const progressOption = {
  tooltip: { trigger: 'axis' },
  grid: { left: 110, right: 26, top: 16, bottom: 20 },
  xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%', color: '#8b998f', fontSize: 10 }, splitLine: { lineStyle: { color: '#eef2e8' } } },
  yAxis: { type: 'category', data: DB.screen.workProgress.map(w => w.plot.replace('大棚', '').replace('温室', '')), axisLabel: { color: '#66756c', fontSize: 10 } },
  series: [{ type: 'bar', data: DB.screen.workProgress.map(w => Math.round(w.done / w.total * 100)), barWidth: 12, itemStyle: { color: '#6f9f6b', borderRadius: 6 }, label: { show: true, position: 'right', formatter: '{c}%', fontSize: 10, color: '#66756c' } }]
}

const quickActions = computed(() => {
  const base = {
    admin: [
      { label: '用户管理', desc: '账号与权限', to: '/admin/user', icon: 'User', bg: '#eef5ea', color: '#4f7f56' },
      { label: '告警总览', desc: '处置闭环', to: '/admin/alarm', icon: 'Bell', bg: '#fbece9', color: '#b84d40' },
      { label: '数据核查', desc: '溯源与检测', to: '/admin/data-check', icon: 'View', bg: '#eaf2f7', color: '#3b78a8' },
      { label: '系统日志', desc: '审计追踪', to: '/admin/log', icon: 'Document', bg: '#fbf1df', color: '#b47821' }
    ],
    ops: [
      { label: '设备管理', desc: '在线状态', to: '/admin/device', icon: 'Cpu', bg: '#eaf2f7', color: '#3b78a8' },
      { label: '报修工单', desc: '接单维修', to: '/admin/repair', icon: 'Tools', bg: '#fbf1df', color: '#b47821' },
      { label: '告警处置', desc: '闭环记录', to: '/admin/alarm', icon: 'Bell', bg: '#fbece9', color: '#b84d40' },
      { label: '备份恢复', desc: '数据安全', to: '/admin/ops', icon: 'Refresh', bg: '#eef5ea', color: '#4f7f56' }
    ],
    farmer: [
      { label: '环境监测', desc: '实时数据', to: '/admin/env-monitor', icon: 'Odometer', bg: '#eaf2f7', color: '#3b78a8' },
      { label: '远程控制', desc: '设备启停', to: '/admin/control', icon: 'Switch', bg: '#eef5ea', color: '#4f7f56' },
      { label: '农事工单', desc: '创建打卡', to: '/admin/farm-workorder', icon: 'Calendar', bg: '#fbf1df', color: '#b47821' },
      { label: '订单管理', desc: '发货售后', to: '/admin/market-order', icon: 'List', bg: '#fbece9', color: '#b84d40' }
    ],
    agri: [
      { label: '病虫害诊断', desc: 'AI 辅助', to: '/admin/expert-pest', icon: 'MagicStick', bg: '#eef5ea', color: '#4f7f56' },
      { label: '技术方案', desc: '制定下发', to: '/admin/expert-plan', icon: 'Document', bg: '#eaf2f7', color: '#3b78a8' },
      { label: '质量评估', desc: '采收分级', to: '/admin/expert-quality', icon: 'Star', bg: '#fbf1df', color: '#b47821' },
      { label: '咨询应答', desc: '农户问题', to: '/admin/agri-consult', icon: 'ChatLineSquare', bg: '#fbece9', color: '#b84d40' }
    ]
  }
  return base[auth.role] || base.farmer
})

function complete(w) {
  admin.completeWorkorder(w.id)
  ElMessage.success('已标记完成')
}
function refresh() { ElMessage.success('数据已刷新') }
function tick() {
  const d = new Date()
  clock.value = d.toLocaleTimeString('zh-CN', { hour12: false })
}
onMounted(() => { tick(); timer = setInterval(tick, 1000) })
onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.dash-hero { display: flex; gap: 26px; padding: 26px 28px; border-radius: 20px; background: linear-gradient(120deg, #b7d7a8 0%, #cde8c7 100%); color: #1f3526; border: 1px solid rgba(255, 255, 255, .6); box-shadow: 0 18px 40px rgba(32, 64, 41, .12); margin-bottom: 18px; overflow: hidden; position: relative; }
.dash-hero::after { content: ""; position: absolute; right: -80px; top: -120px; width: 360px; height: 360px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,.45), transparent 65%); }
.dash-hero > div { position: relative; z-index: 1; }
.dash-kicker { font-size: 11px; color: #3f5c46; letter-spacing: .5px; }
.dash-hero h1 { font-size: 26px; margin: 7px 0 6px; letter-spacing: .5px; color: #1f3526; }
.dash-hero p { font-size: 12.5px; color: #3f5c46; line-height: 1.7; }
.dash-hero p b { color: #2f5238; }
.hero-actions { display: flex; gap: 8px; margin-top: 18px; flex-wrap: wrap; }
.hero-actions :deep(.el-button) { --el-button-bg-color: rgba(255, 255, 255, .6); --el-button-border-color: rgba(255, 255, 255, .7); --el-button-text-color: #2f5238; }
.hero-actions :deep(.el-button--primary) { --el-button-bg-color: #4f8b5a; --el-button-border-color: #4f8b5a; --el-button-text-color: #ffffff; }
.hero-side { margin-left: auto; display: flex; flex-direction: column; gap: 12px; min-width: 230px; }
.weather { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,.55); border: 1px solid rgba(255,255,255,.7); border-radius: 14px; padding: 13px 15px; }
.w-icon { font-size: 30px; }
.weather b { display: block; font-size: 20px; color: #1f3526; line-height: 1.2; }
.weather span { font-size: 10.5px; color: #4a6353; }
.hero-mini { display: flex; gap: 10px; }
.hero-mini > div { flex: 1; background: rgba(255,255,255,.5); border-radius: 12px; padding: 10px 12px; }
.hero-mini b { display: block; font-size: 16px; color: #1f3526; }
.hero-mini span { font-size: 10px; color: #4a6353; }
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
.dash-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.dash-grid .span-2 { grid-column: span 2; }
.dash-grid .span-3 { grid-column: span 3; }
.dash-grid .full { grid-column: 1 / -1; }
.todo-card, .alarm-card, .quick-card { background: #fff; }
.todo-list, .alarm-list { padding: 8px 16px 12px; }
.todo-item { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid #f2f4ee; }
.todo-check { width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid var(--brand-300); color: transparent; display: grid; place-items: center; cursor: pointer; font-size: 12px; flex: 0 0 22px; }
.todo-check:hover { background: var(--brand-50); color: var(--brand-600); }
.todo-main { flex: 1; min-width: 0; }
.todo-main b { display: block; font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.todo-main span { font-size: 10.5px; color: var(--ink-400); }
.alarm-item { display: flex; align-items: flex-start; gap: 8px; padding: 9px 0; border-bottom: 1px solid #f4f2ee; cursor: pointer; }
.alarm-item:hover { background: #fcfbf6; }
.level { font-size: 9.5px; padding: 2px 6px; border-radius: 4px; background: #fbf1df; color: #a86c18; flex: 0 0 auto; margin-top: 2px; }
.level.紧急 { background: #fbe9e6; color: #b84d40; }
.level.重要 { background: #fbf1df; color: #a86c18; }
.am { flex: 1; min-width: 0; }
.am b { display: block; font-size: 12px; }
.am span { display: block; font-size: 10.5px; color: var(--ink-400); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.alarm-item small { font-size: 10px; color: var(--ink-300); }
.quick-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; padding: 14px 16px 18px; }
.quick-item { text-align: left; border: 1px solid var(--line); background: #fff; border-radius: 12px; padding: 11px 12px; cursor: pointer; transition: all .16s; }
.quick-item:hover { border-color: var(--brand-300); transform: translateY(-1px); box-shadow: var(--shadow-sm); }
.qi { width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center; font-size: 15px; margin-bottom: 7px; }
.quick-item b { display: block; font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.quick-item small { display: block; font-size: 10.5px; color: var(--ink-400); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.quick-card .card-head h3 { white-space: nowrap; }
.quick-card .card-head .sub { white-space: nowrap; }
@media (max-width: 1180px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } .dash-grid { grid-template-columns: repeat(2, 1fr); } .dash-grid .span-2, .dash-grid .span-3 { grid-column: span 2; } .quick-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 760px) { .dash-hero { flex-direction: column; padding: 20px; } .hero-side { margin-left: 0; min-width: 0; } .dash-grid { grid-template-columns: 1fr; } .dash-grid .span-2, .dash-grid .span-3 { grid-column: span 1; } .stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; } .dash-hero h1 { font-size: 22px; } .quick-grid { grid-template-columns: 1fr 1fr; } }
</style>
