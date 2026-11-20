<template>
  <div class="screen-page">
    <header class="screen-header">
      <div class="sh-left">
        <span class="sh-mark">🌾</span>
        <div>
          <b>智慧农业产业互联网平台</b>
          <span>SMART AGRICULTURE · DATA CENTER</span>
        </div>
      </div>
      <div class="sh-title">
        <i class="line"></i>
        <h1>农业全产业链数据可视化大屏</h1>
        <i class="line"></i>
      </div>
      <div class="sh-right">
        <div class="sh-clock">
          <b>{{ clock }}</b>
          <span>{{ date }}</span>
        </div>
        <button @click="toggleFull"><el-icon><FullScreen /></el-icon></button>
        <button @click="$router.push('/admin/dashboard')"><el-icon><Monitor /></el-icon></button>
        <button @click="$router.push('/mall')"><el-icon><HomeFilled /></el-icon></button>
      </div>
    </header>

    <main class="screen-body">
      <div class="stat-row">
        <div v-for="s in stats" :key="s.label" class="stat-item">
          <span class="si-ico">{{ s.icon }}</span>
          <div>
            <span class="si-label">{{ s.label }}</span>
            <b class="si-value">{{ s.value }}<small>{{ s.unit }}</small></b>
          </div>
          <span class="si-trend" :class="s.tone">{{ s.trend }}</span>
        </div>
      </div>

      <div class="screen-grid">
        <div class="col col-left">
          <section class="panel parks">
            <div class="panel-head"><h3>园区 GIS 分布</h3><span>{{ parks.length }} 个示范园区</span></div>
            <div ref="mapWrap" class="park-map" @mouseleave="mapHover = null">
              <svg viewBox="0 0 420 236">
                <defs>
                  <pattern id="screenGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(95,227,161,.08)" stroke-width="1" />
                  </pattern>
                  <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="rgba(90,169,230,.1)" />
                    <stop offset="50%" stop-color="rgba(90,169,230,.42)" />
                    <stop offset="100%" stop-color="rgba(90,169,230,.1)" />
                  </linearGradient>
                </defs>
                <rect width="420" height="236" fill="rgba(7,28,17,.35)" />
                <rect width="420" height="236" fill="url(#screenGrid)" />
                <path d="M0 206 C 80 190, 150 214, 220 200 S 340 176, 420 194 L420 236 L0 236Z" fill="rgba(60,130,160,.16)" />
                <path class="mp-river" d="M0 208 C 80 192, 150 216, 220 202 S 340 178, 420 196" fill="none" stroke="url(#riverGrad)" stroke-width="3" stroke-linecap="round" />
                <g v-for="p in mapPlots" :key="p.id" class="mp-plot" :class="{ warn: p.status === '预警' }" @mousemove="showTip(p, $event)">
                  <rect :x="p.x" :y="p.y" :width="p.w" :height="p.h" rx="6" :fill="p.status === '预警' ? 'rgba(240,198,116,.28)' : 'rgba(95,227,161,.16)'" :stroke="p.status === '预警' ? '#f0c674' : '#5fe3a1'" stroke-width="1.2" />
                  <text :x="p.x + p.w / 2" :y="p.y + p.h / 2 + 3" text-anchor="middle" font-size="9" fill="#d9f7e6">{{ p.short }}</text>
                </g>
                <g v-for="d in mapDevices" :key="d.id">
                  <circle class="mp-pulse" :cx="d.x" :cy="d.y" r="3" fill="none" stroke="#7ce3a8" stroke-width="1" />
                  <circle :cx="d.x" :cy="d.y" r="2" fill="#7ce3a8" />
                </g>
                <rect class="mp-scan" x="0" y="0" width="420" height="1.4" fill="rgba(95,227,161,.42)" />
              </svg>
              <div v-if="mapHover" class="mp-tip" :style="{ left: mapHover.x + 'px', top: mapHover.y + 'px' }">
                <b>{{ mapHover.p.name }}</b>
                <span>{{ mapHover.p.crop }} · {{ mapHover.p.status }}</span>
                <span>{{ mapHover.p.area }} 亩 · 设备 {{ mapHover.p.devices }} 台</span>
              </div>
              <div class="mp-legend">
                <span><i class="dot-ok"></i>正常</span>
                <span><i class="dot-warn"></i>预警</span>
                <span><i class="dot-dev"></i>在线设备</span>
              </div>
            </div>
            <div class="park-total">
              <div><b>{{ DB.screen.area.toLocaleString() }}</b><span>种植面积 / 亩</span></div>
              <div><b>{{ DB.plots.length }}</b><span>监测地块</span></div>
              <div><b>{{ admin.devices.length }}</b><span>物联设备</span></div>
            </div>
          </section>

          <section class="panel alarms">
            <div class="panel-head"><h3>实时告警</h3><span class="live"><i></i>{{ admin.openAlarms.length }} 条待处置</span></div>
            <div class="alarm-list">
              <div v-for="a in admin.openAlarms.slice(0, 5)" :key="a.id" class="alarm-row">
                <span class="al-level" :class="a.level">{{ a.level }}</span>
                <div class="al-main">
                  <b>{{ a.target }}</b>
                  <span>{{ a.desc }}</span>
                </div>
                <small>{{ a.time.slice(11) }}</small>
              </div>
              <div v-if="!admin.openAlarms.length" class="empty-line">暂无待处置告警</div>
            </div>
            <div class="alarm-foot">
              <span><i class="dot danger"></i>紧急 1</span>
              <span><i class="dot warn"></i>重要 2</span>
              <span><i class="dot info"></i>一般 4</span>
              <em>数据更新于 {{ shortTime }}</em>
            </div>
          </section>
        </div>

        <div class="col col-center">
          <ChartBox dark title="环境监测趋势" sub="空气温度 / 土壤湿度 / 光照强度" :option="envOption" :height="292" />
          <div class="center-bottom">
            <ChartBox dark title="近 7 日销售额" sub="单位：万元" :option="salesOption" :height="208" />
            <ChartBox dark title="设备在线率" sub="实时统计" :option="gaugeOption" :height="208" />
          </div>
          <!-- <section class="panel flow">
            <div class="panel-head"><h3>今日产销链路</h3><span>从采收 to 配送</span></div>
            <div class="flow-steps">
              <div v-for="(f, i) in flow" :key="i" class="flow-step">
                <span class="fs-ico">{{ f.icon }}</span>
                <b>{{ f.value }}<small>{{ f.unit }}</small></b>
                <span class="fs-label">{{ f.label }}</span>
                <i v-if="i < flow.length - 1" class="fs-line"></i>
              </div>
            </div>
          </section> -->
        </div>

        <div class="col col-right">
          <ChartBox dark title="品类销售占比" sub="按销售额统计" :option="catOption" :height="216" />
          <ChartBox dark title="地块长势评分" sub="AI 长势模型" :option="growthOption" :height="192" />
          <section class="panel today">
            <div class="panel-head"><h3>今日农事待办</h3><span>{{ pendingWos.length }} 项</span></div>
            <div class="todo-list">
              <div v-for="w in pendingWos.slice(0, 4)" :key="w.id" class="todo-row">
                <span class="td-check"></span>
                <div><b>{{ w.title }}</b><span>{{ w.assignee }} · {{ w.plan }}</span></div>
                <StatusTag :status="w.status" size="small" />
              </div>
              <div v-if="!pendingWos.length" class="empty-line">今日待办已完成</div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <footer class="screen-foot">
      <span class="pulse"><i></i>数据实时同步中</span>
      <div class="ticker">
        <span>🌱 永川园区番茄长势良好，预计本周采收 860kg</span>
        <span>📦 今日新订单 12 笔，待发货 2 笔</span>
        <span>🛡️ 最新批次农残检测全部合格</span>
        <span>🌧️ 气象预警：未来 24h 有小雨，已启动排水预案</span>
      </div>
      <span>智慧农业 · 数据中台 V3.0</span>
    </footer>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { FullScreen, Monitor, HomeFilled } from '@element-plus/icons-vue'
import ChartBox from '@/components/ChartBox.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useAdminStore } from '@/stores/admin'
import DB from '@/data/db'

const admin = useAdminStore()

const now = ref(new Date())
const clock = ref('')
const date = ref('')
let timer = null

function tick() {
  now.value = new Date()
  const p = x => String(x).padStart(2, '0')
  clock.value = `${p(now.value.getHours())}:${p(now.value.getMinutes())}:${p(now.value.getSeconds())}`
  date.value = `${now.value.getFullYear()}-${p(now.value.getMonth() + 1)}-${p(now.value.getDate())} 星期${'日一二三四五六'[now.value.getDay()]}`
}
const shortTime = computed(() => clock.value)

const onlineRate = computed(() => admin.devices.length ? Math.round((admin.onlineDevices.length / admin.devices.length) * 100) : 0)
const pendingWos = computed(() => (admin.workorders || []).filter(w => w.status === '待执行' || w.status === '执行中'))
const todayOrders = computed(() => (admin.orderList || []).length)
const todaySales = computed(() => (admin.orderList || []).reduce((a, b) => a + Number(b.amount || 0), 0))

const stats = computed(() => [
  { icon: '🏡', label: '示范园区', value: 3, unit: '个', trend: '稳定运行', tone: 'ok' },
  { icon: '🌱', label: '种植地块', value: 48, unit: '块', trend: '+2 本月', tone: 'ok' },
  { icon: '📡', label: '设备在线率', value: onlineRate.value, unit: '%', trend: `${admin.onlineDevices.length}/${admin.devices.length}`, tone: 'ok' },
  { icon: '📦', label: '今日订单', value: todayOrders.value, unit: '笔', trend: '+12.5%', tone: 'up' },
  { icon: '💰', label: '累计销售额', value: todaySales.value.toFixed(0), unit: '元', trend: '+8.6%', tone: 'up' },
  { icon: '⚠️', label: '待处置告警', value: admin.openAlarms.length, unit: '条', trend: '需关注', tone: 'warn' }
])

const parks = [
  { name: '永川智慧农业示范园', area: '1,260 亩', plots: 18, devices: 86, online: 83, crop: '番茄 / 黄瓜 / 叶菜', rate: 96 },
  { name: '璧山生态农业园', area: '860 亩', plots: 16, devices: 62, online: 59, crop: '草莓 / 小白菜', rate: 95 },
  { name: '南川大观生态农业园', area: '490 亩', plots: 14, devices: 54, online: 50, crop: '水稻 / 粮油', rate: 93 }
]

/* 大屏园区地图：鼠标悬浮显示地块信息，河道 / 扫描线 / 设备点位持续动效 */
const mapWrap = ref(null)
const mapHover = ref(null)
const mapLayout = [
  { id: 'DK-A01', x: 24, y: 118, w: 86, h: 54, short: 'A01 大棚' },
  { id: 'DK-A02', x: 20, y: 52, w: 78, h: 48, short: 'A02 温室' },
  { id: 'DK-B01', x: 140, y: 118, w: 120, h: 64, short: 'B01 大田' },
  { id: 'DK-C01', x: 300, y: 58, w: 80, h: 52, short: 'C01 草莓' },
  { id: 'DK-D01', x: 296, y: 158, w: 86, h: 48, short: 'D01 水产' },
  { id: 'DK-E01', x: 150, y: 40, w: 74, h: 46, short: 'E01 蛋鸡' }
]
const mapPlots = mapLayout.map(l => {
  const p = DB.plots.find(x => x.id === l.id) || {}
  return { ...l, name: p.name || l.short, crop: p.crop || '—', area: p.area || 0, status: p.status || '正常', devices: DB.devices.filter(d => d.plot === l.id).length }
})
const mapDevices = mapLayout.flatMap(l => Array.from(
  { length: Math.min(3, DB.devices.filter(d => d.plot === l.id).length) },
  (_, i) => ({ id: l.id + '-' + i, x: l.x + 18 + i * 26, y: l.y + l.h / 2 + (i % 2 ? 13 : -13) })
))
function showTip(p, e) {
  const rect = mapWrap.value.getBoundingClientRect()
  mapHover.value = {
    p,
    x: Math.min(Math.max(e.clientX - rect.left, 76), rect.width - 76),
    y: Math.max(e.clientY - rect.top, 0)
  }
}

const flow = computed(() => [
  { icon: '🧺', value: 2680, unit: 'kg', label: '今日采收' },
  { icon: '📦', value: todayOrders.value, unit: '笔', label: '今日订单' },
  { icon: '🚚', value: 18, unit: '单', label: '冷链发运' },
  { icon: '✅', value: 99.2, unit: '%', label: '准时送达' }
])

const axisLabel = { color: 'rgba(180, 220, 195, .55)', fontSize: 10 }
const splitLine = { lineStyle: { color: 'rgba(120, 180, 145, .12)' } }

const hours = ['00', '03', '06', '09', '12', '15', '18', '21', '24']
const envOption = {
  backgroundColor: 'transparent',
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(8, 30, 18, .92)', borderColor: 'rgba(120, 200, 150, .25)', textStyle: { color: '#d8f0e2', fontSize: 11 } },
  legend: { data: ['空气温度', '土壤湿度', '光照'], textStyle: { color: 'rgba(190, 225, 205, .7)', fontSize: 10 }, top: 4, right: 8, itemWidth: 10, itemHeight: 6 },
  grid: { left: 38, right: 34, top: 38, bottom: 24 },
  xAxis: { type: 'category', boundaryGap: false, data: hours, axisLabel, axisLine: { lineStyle: { color: 'rgba(120, 180, 145, .2)' } }, axisTick: { show: false } },
  yAxis: [
    { type: 'value', name: '℃', nameTextStyle: { color: 'rgba(180,220,195,.45)', fontSize: 9 }, axisLabel, splitLine, axisLine: { show: false } },
    { type: 'value', name: '%', nameTextStyle: { color: 'rgba(180,220,195,.45)', fontSize: 9 }, axisLabel, splitLine: { show: false }, axisLine: { show: false } }
  ],
  series: [
    { name: '空气温度', type: 'line', smooth: true, symbol: 'none', data: [20.2, 19.6, 19.1, 21.8, 25.6, 26.4, 24.2, 22.1, 21.2], lineStyle: { width: 2, color: '#5fe3a1' }, itemStyle: { color: '#5fe3a1' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(95,227,161,.24)' }, { offset: 1, color: 'rgba(95,227,161,0)' }] } } },
    { name: '土壤湿度', type: 'line', yAxisIndex: 1, smooth: true, symbol: 'none', data: [58, 57, 56, 60, 65, 63, 62, 60, 59], lineStyle: { width: 2, color: '#5aa9e6' }, itemStyle: { color: '#5aa9e6' } },
    { name: '光照', type: 'line', yAxisIndex: 1, smooth: true, symbol: 'none', data: [4, 6, 18, 42, 66, 58, 32, 12, 5], lineStyle: { width: 2, color: '#f0c674', type: 'dashed' }, itemStyle: { color: '#f0c674' } }
  ]
}

const salesOption = {
  backgroundColor: 'transparent',
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(8, 30, 18, .92)', borderColor: 'rgba(120, 200, 150, .25)', textStyle: { color: '#d8f0e2', fontSize: 11 } },
  grid: { left: 34, right: 12, top: 20, bottom: 24 },
  xAxis: { type: 'category', data: ['11-03', '11-04', '11-05', '11-06', '11-07', '11-08', '11-09'], axisLabel, axisLine: { lineStyle: { color: 'rgba(120,180,145,.2)' } }, axisTick: { show: false } },
  yAxis: { type: 'value', axisLabel, splitLine, axisLine: { show: false } },
  series: [{
    type: 'bar', data: [8.6, 9.2, 10.4, 9.8, 12.6, 14.2, 16.8], barWidth: 14,
    itemStyle: { borderRadius: [4, 4, 0, 0], color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#7ce3a8' }, { offset: 1, color: 'rgba(63, 150, 105, .2)' }] } }
  }]
}

const gaugeOption = {
  backgroundColor: 'transparent',
  series: [{
    type: 'gauge', startAngle: 210, endAngle: -30, min: 0, max: 100,
    progress: { show: true, width: 11, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#4f9a5b' }, { offset: 1, color: '#7ce3a8' }] } } },
    axisLine: { lineStyle: { width: 11, color: [[1, 'rgba(120, 200, 150, .14)']] } },
    pointer: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false }, anchor: { show: false },
    detail: { valueAnimation: true, offsetCenter: [0, '8%'], fontSize: 27, fontWeight: 700, color: '#d9f7e6', formatter: '{value}%' },
    data: [{ value: onlineRate.value }]
  }]
}

const catOption = computed(() => {
  const map = {}
  admin.goods.forEach(g => { const k = g.big || g.cat; map[k] = (map[k] || 0) + g.sold * g.price })
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: 'rgba(8, 30, 18, .92)', borderColor: 'rgba(120, 200, 150, .25)', textStyle: { color: '#d8f0e2', fontSize: 11 }, formatter: p => `${p.name}<br/>¥${(p.value / 10000).toFixed(1)} 万 · ${p.percent}%` },
    legend: { orient: 'vertical', right: 8, top: 'center', textStyle: { color: 'rgba(190, 225, 205, .7)', fontSize: 10 }, itemWidth: 8, itemHeight: 8 },
    series: [{
      type: 'pie', radius: ['42%', '68%'], center: ['37%', '52%'], avoidLabelOverlap: true,
      itemStyle: { borderColor: '#0a2316', borderWidth: 2 },
      label: { show: false }, labelLine: { show: false },
      data: Object.entries(map).map(([name, value], i) => ({ name, value, itemStyle: { color: ['#5fe3a1', '#5aa9e6', '#f0c674', '#c88fe0', '#7fd3c4', '#e08f8f'][i % 6] } }))
    }]
  }
})

const growthOption = {
  backgroundColor: 'transparent',
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(8, 30, 18, .92)', borderColor: 'rgba(120, 200, 150, .25)', textStyle: { color: '#d8f0e2', fontSize: 11 } },
  grid: { left: 64, right: 20, top: 14, bottom: 16 },
  xAxis: { type: 'value', max: 100, axisLabel, splitLine, axisLine: { show: false } },
  yAxis: { type: 'category', data: ['B区大田', 'C区草莓园', 'A区2号棚', 'A区1号棚', 'D区水产塘'], axisLabel: { color: 'rgba(190,225,205,.65)', fontSize: 10 }, axisLine: { show: false }, axisTick: { show: false } },
  series: [{
    type: 'bar', data: [82, 86, 91, 94, 78], barWidth: 10,
    itemStyle: { borderRadius: [0, 5, 5, 0], color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: 'rgba(95,227,161,.25)' }, { offset: 1, color: '#5fe3a1' }] } },
    label: { show: true, position: 'right', color: 'rgba(190,225,205,.7)', fontSize: 9, formatter: '{c}' }
  }]
}

function toggleFull() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.()
  else document.exitFullscreen?.()
}

onMounted(() => { tick(); timer = setInterval(tick, 1000) })
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.screen-page { min-height: 100vh; background: #061a10; color: #cfe8d8; padding: 12px 16px 44px; position: relative; overflow-x: hidden; }
.screen-page::before { content: ""; position: fixed; inset: 0; background-image: linear-gradient(rgba(94, 200, 140, .04) 1px, transparent 1px), linear-gradient(90deg, rgba(94, 200, 140, .04) 1px, transparent 1px); background-size: 42px 42px; pointer-events: none; }
.screen-page::after { content: ""; position: fixed; left: 50%; top: -30%; width: 800px; height: 600px; transform: translateX(-50%); background: radial-gradient(ellipse, rgba(62, 160, 105, .16), transparent 68%); pointer-events: none; }
.screen-header { display: flex; align-items: center; gap: 18px; padding: 4px 6px 12px; position: relative; z-index: 1; border-bottom: 1px solid rgba(94, 200, 140, .14); }
.sh-left { display: flex; align-items: center; gap: 10px; flex: 0 0 auto; }
.sh-mark { width: 38px; height: 38px; border-radius: 10px; background: rgba(95, 227, 161, .12); border: 1px solid rgba(95, 227, 161, .24); display: grid; place-items: center; font-size: 18px; line-height: 1; color: #e8f8ee; letter-spacing: 0; }
.sh-left > div b { display: block; font-size: 12px; color: #e0f2e6; letter-spacing: .4px; }
.sh-left > div span { display: block; font-size: 8px; letter-spacing: 1.3px; color: rgba(140, 190, 160, .55); }
.sh-title { flex: 1; display: flex; align-items: center; justify-content: center; gap: 16px; min-width: 0; }
.sh-title h1 { font-size: 23px; letter-spacing: 3px; font-weight: 600; color: #e8f8ee; white-space: nowrap; text-shadow: 0 0 24px rgba(95, 227, 161, .28); }
.sh-title .line { flex: 1; max-width: 180px; height: 1px; background: linear-gradient(90deg, transparent, rgba(95, 227, 161, .42), transparent); }
.sh-right { display: flex; align-items: center; gap: 7px; flex: 0 0 auto; }
.sh-clock { text-align: right; margin-right: 4px; }
.sh-clock b { display: block; font-size: 17px; font-variant-numeric: tabular-nums; color: #d9f7e6; letter-spacing: 1px; }
.sh-clock span { font-size: 8.5px; color: rgba(140, 190, 160, .6); }
.sh-right button { width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(95, 227, 161, .18); background: rgba(95, 227, 161, .06); color: #8fd8ad; cursor: pointer; display: grid; place-items: center; font-size: 14px; }
.sh-right button:hover { background: rgba(95, 227, 161, .16); }
.screen-body { position: relative; z-index: 1; padding-top: 13px; }
.stat-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 11px; }
.stat-item { display: flex; align-items: center; gap: 9px; padding: 10px 12px; border-radius: 10px; background: linear-gradient(120deg, rgba(20, 54, 35, .72), rgba(10, 34, 21, .62)); border: 1px solid rgba(95, 227, 161, .13); position: relative; overflow: hidden; }
.stat-item::after { content: ""; position: absolute; right: -20px; bottom: -24px; width: 64px; height: 64px; border-radius: 50%; background: rgba(95, 227, 161, .05); }
.si-ico { width: 32px; height: 32px; border-radius: 9px; background: rgba(95, 227, 161, .1); display: grid; place-items: center; font-size: 16px; flex: 0 0 32px; }
.si-label { display: block; font-size: 9.5px; color: rgba(150, 195, 168, .7); }
.si-value { display: block; font-size: 20px; line-height: 1.15; color: #e6f8ed; letter-spacing: -.3px; font-variant-numeric: tabular-nums; }
.si-value small { font-size: 9px; color: rgba(150, 195, 168, .7); font-weight: 400; margin-left: 2px; }
.si-trend { margin-left: auto; font-size: 8.5px; padding: 2px 6px; border-radius: 20px; position: relative; z-index: 1; }
.si-trend.ok { color: #7ce3a8; background: rgba(95, 227, 161, .1); }
.si-trend.up { color: #f0c674; background: rgba(240, 198, 116, .1); }
.si-trend.warn { color: #e08f8f; background: rgba(224, 143, 143, .1); }
.screen-grid { display: grid; grid-template-columns: 1fr 1.55fr 1fr; gap: 11px; align-items: start; }
.col { display: flex; flex-direction: column; gap: 11px; min-width: 0; }
.panel { background: linear-gradient(150deg, rgba(16, 47, 30, .76), rgba(7, 28, 17, .68)); border: 1px solid rgba(95, 227, 161, .13); border-radius: 10px; padding: 12px 14px; position: relative; overflow: hidden; }
.panel::before { content: ""; position: absolute; left: 0; top: 0; width: 38px; height: 2px; background: linear-gradient(90deg, #5fe3a1, transparent); }
.panel-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
.panel-head h3 { font-size: 12px; color: #d9f0e2; letter-spacing: .5px; }
.panel-head > span { font-size: 8.5px; color: rgba(140, 190, 160, .55); }
.panel-head .live { display: inline-flex; align-items: center; gap: 4px; color: #e08f8f; }
.panel-head .live i { width: 5px; height: 5px; border-radius: 50%; background: #e08f8f; box-shadow: 0 0 0 3px rgba(224, 143, 143, .14); animation: blink 1.6s infinite; }
@keyframes blink { 50% { opacity: .3; } }
.park-list { display: flex; flex-direction: column; gap: 11px; }
.park-row { padding-bottom: 9px; border-bottom: 1px dashed rgba(95, 227, 161, .1); }
.park-row:last-child { border-bottom: none; padding-bottom: 0; }
.pr-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.pr-top b { font-size: 10.5px; color: #d4ebdc; }
.pr-top span { font-size: 8.5px; color: rgba(140, 190, 160, .55); }
.pr-meta { display: flex; gap: 10px; margin: 4px 0 5px; font-size: 8.5px; color: rgba(140, 190, 160, .65); }
.pr-meta b { color: #a9dfc0; font-weight: 500; }
.pr-meta b.ok { color: #7ce3a8; }
.pr-crop { margin-left: auto; color: rgba(140, 190, 160, .45); }
.pr-bar { position: relative; height: 4px; border-radius: 2px; background: rgba(95, 227, 161, .1); }
.pr-bar i { display: block; height: 100%; border-radius: 2px; background: linear-gradient(90deg, #3f9a63, #7ce3a8); }
.pr-bar em { position: absolute; right: 0; top: -13px; font-style: normal; font-size: 8px; color: #7ce3a8; }
.park-total { display: flex; justify-content: space-between; margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(95, 227, 161, .1); }
.park-map { position: relative; border-radius: 8px; overflow: hidden; background: rgba(6, 24, 14, .5); border: 1px solid rgba(95, 227, 161, .12); }
.park-map svg { display: block; width: 100%; height: auto; }
.mp-plot { cursor: crosshair; }
.mp-plot rect { transition: fill .2s, stroke .2s; }
.mp-plot:hover rect { fill: rgba(95, 227, 161, .34); stroke: #d9f7e6; }
.mp-river { stroke-dasharray: 10 8; animation: mp-flow 3s linear infinite; }
@keyframes mp-flow { to { stroke-dashoffset: -36; } }
.mp-pulse { transform-box: fill-box; transform-origin: center; animation: mp-pulse 2.6s ease-out infinite; }
@keyframes mp-pulse { 0% { transform: scale(.6); opacity: .9; } 100% { transform: scale(3.4); opacity: 0; } }
.mp-scan { transform-box: fill-box; animation: mp-scan 4.5s linear infinite; }
@keyframes mp-scan { from { transform: translateY(0); } to { transform: translateY(236px); } }
.mp-tip { position: absolute; transform: translate(-50%, -112%); min-width: 132px; padding: 7px 10px; border-radius: 8px; background: rgba(8, 30, 18, .96); border: 1px solid rgba(120, 200, 150, .3); box-shadow: 0 10px 24px rgba(0, 0, 0, .35); pointer-events: none; z-index: 4; font-size: 9.5px; color: rgba(170, 210, 185, .85); }
.mp-tip b { display: block; font-size: 10.5px; color: #e6f8ed; margin-bottom: 2px; }
.mp-tip span { display: block; line-height: 1.6; }
.mp-legend { position: absolute; left: 8px; bottom: 6px; display: flex; gap: 9px; font-size: 8px; color: rgba(150, 195, 168, .7); background: rgba(6, 24, 14, .6); border-radius: 20px; padding: 3px 9px; }
.mp-legend span { display: inline-flex; align-items: center; gap: 3px; }
.mp-legend i { width: 5px; height: 5px; border-radius: 50%; }
.dot-ok { background: #5fe3a1; }
.dot-warn { background: #f0c674; }
.dot-dev { background: #7ce3a8; box-shadow: 0 0 0 2px rgba(124, 227, 168, .2); }
.stat-item { animation: rise-in .55s ease both; }
.stat-item:nth-child(2) { animation-delay: .05s; }
.stat-item:nth-child(3) { animation-delay: .1s; }
.stat-item:nth-child(4) { animation-delay: .15s; }
.stat-item:nth-child(5) { animation-delay: .2s; }
.stat-item:nth-child(6) { animation-delay: .25s; }
@keyframes rise-in { from { opacity: 0; transform: translateY(9px); } }
.panel { animation: fade-in .7s ease both; }
@keyframes fade-in { from { opacity: 0; } }
.park-total b { display: block; font-size: 15px; color: #d9f7e6; }
.park-total span { font-size: 8px; color: rgba(140, 190, 160, .55); }
.alarm-list { display: flex; flex-direction: column; }
.alarm-row { display: flex; align-items: flex-start; gap: 7px; padding: 7px 0; border-bottom: 1px dashed rgba(95, 227, 161, .08); }
.alarm-row:last-child { border-bottom: none; }
.al-level { font-size: 8px; padding: 1px 5px; border-radius: 3px; flex: 0 0 auto; margin-top: 1px; }
.al-level.紧急 { color: #ffb4ab; background: rgba(224, 112, 98, .16); }
.al-level.重要 { color: #f0c674; background: rgba(240, 198, 116, .13); }
.al-level.一般 { color: #8fc9e8; background: rgba(90, 169, 230, .13); }
.al-main { flex: 1; min-width: 0; }
.al-main b { display: block; font-size: 9.5px; color: #cfe6d7; }
.al-main span { display: block; font-size: 8.5px; color: rgba(140, 190, 160, .55); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.alarm-row small { font-size: 8px; color: rgba(140, 190, 160, .4); flex: 0 0 auto; }
.alarm-foot { display: flex; align-items: center; gap: 10px; margin-top: 9px; padding-top: 8px; border-top: 1px solid rgba(95, 227, 161, .1); font-size: 8.5px; color: rgba(140, 190, 160, .6); }
.alarm-foot span { display: inline-flex; align-items: center; gap: 3px; }
.dot { width: 5px; height: 5px; border-radius: 50%; }
.dot.danger { background: #e07062; }
.dot.warn { background: #f0c674; }
.dot.info { background: #5aa9e6; }
.alarm-foot em { margin-left: auto; font-style: normal; font-size: 7.5px; color: rgba(140, 190, 160, .4); }
.empty-line { padding: 18px 0; text-align: center; font-size: 9px; color: rgba(140, 190, 160, .45); }
.center-bottom { display: grid; grid-template-columns: 1.35fr .65fr; gap: 11px; }
.center-bottom :deep(.chart-box) { min-width: 0; }
.flow .flow-steps { display: flex; align-items: center; justify-content: space-between; gap: 4px; padding: 2px 4px 4px; }
.flow-step { position: relative; display: flex; flex-direction: column; align-items: center; gap: 1px; flex: 1; }
.fs-ico { font-size: 17px; }
.flow-step b { font-size: 15px; color: #d9f7e6; }
.flow-step b small { font-size: 8px; color: rgba(140, 190, 160, .55); font-weight: 400; margin-left: 1px; }
.fs-label { font-size: 8.5px; color: rgba(140, 190, 160, .6); }
.fs-line { position: absolute; right: -8%; top: 18px; width: 16%; height: 1px; background: linear-gradient(90deg, rgba(95, 227, 161, .4), transparent); }
.todo-list { display: flex; flex-direction: column; }
.todo-row { display: flex; align-items: center; gap: 7px; padding: 6px 0; border-bottom: 1px dashed rgba(95, 227, 161, .08); }
.todo-row:last-child { border-bottom: none; }
.td-check { width: 12px; height: 12px; border-radius: 3px; border: 1px solid rgba(95, 227, 161, .3); flex: 0 0 12px; }
.todo-row > div { flex: 1; min-width: 0; }
.todo-row b { display: block; font-size: 9.5px; color: #cfe6d7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.todo-row span { font-size: 8px; color: rgba(140, 190, 160, .5); }
.screen-foot { position: fixed; left: 0; right: 0; bottom: 0; display: flex; align-items: center; gap: 16px; padding: 8px 20px; background: rgba(5, 24, 14, .92); border-top: 1px solid rgba(95, 227, 161, .13); backdrop-filter: blur(8px); font-size: 8.5px; color: rgba(140, 190, 160, .55); z-index: 5; }
.pulse { display: inline-flex; align-items: center; gap: 5px; color: #7ce3a8; flex: 0 0 auto; }
.pulse i { width: 5px; height: 5px; border-radius: 50%; background: #5fe3a1; box-shadow: 0 0 0 3px rgba(95, 227, 161, .15); }
.ticker { flex: 1; display: flex; gap: 26px; overflow: hidden; white-space: nowrap; }
.ticker span { animation: ticker 26s linear infinite; }
@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-160%); } }
.screen-foot > span:last-child { flex: 0 0 auto; }
:deep(.chart-box.dark) { border-radius: 10px; }
:deep(.chart-head) { padding: 11px 13px 0; }
:deep(.chart-head h3) { font-size: 12px; letter-spacing: .4px; }
:deep(.chart-head .sub) { font-size: 8px; }
@media (max-width: 1280px) {
  .stat-row { grid-template-columns: repeat(3, 1fr); }
  .screen-grid { grid-template-columns: 1fr 1.4fr; }
  .col-right { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr 1fr; }
  .col-right .today { grid-column: auto; }
}
@media (max-width: 900px) {
  .screen-page { padding: 8px 10px 46px; }
  .screen-header { flex-wrap: wrap; gap: 8px; }
  .sh-title { order: 3; flex-basis: 100%; }
  .sh-title h1 { font-size: 16px; letter-spacing: 1px; white-space: normal; text-align: center; }
  .sh-clock { display: none; }
  .screen-grid { grid-template-columns: 1fr; }
  .col-center { order: -1; }
  .col-right { grid-template-columns: 1fr; }
  .center-bottom { grid-template-columns: 1fr; }
  .stat-row { grid-template-columns: 1fr 1fr; }
  .ticker { display: none; }
}
</style>
