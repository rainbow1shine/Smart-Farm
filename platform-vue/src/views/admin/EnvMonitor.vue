<template>
  <div class="page-wrap">
    <PageHeader title="环境监测" sub="空气 / 土壤 / 水体 / 气象四类环境数据">
      <template #actions>
        <el-select v-model="plotId" class="plot-select">
          <el-option v-for="p in plots" :key="p.id" :label="p.name" :value="p.id" />
        </el-select>
        <el-button :icon="Refresh" @click="refresh">刷新</el-button>
        <el-button :icon="Download" @click="exportData">导出</el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="空气温度" value="23.6" unit="℃" foot="适宜 18–30℃" icon="Sunny" />
      <StatCard label="空气湿度" value="68" unit="%" foot="适宜 50–85%" icon="Odometer" tone="info" />
      <StatCard label="土壤湿度" value="32" unit="%" foot="低于灌溉阈值 35%" icon="Warning" tone="warn" />
      <StatCard label="设备在线" :value="onlineCount" unit="/ 16" foot="数据采集正常" icon="Cpu" />
    </div>

    <div class="env-tabs card">
      <div class="tabs">
        <button v-for="c in cats" :key="c.key" class="tab" :class="{ on: cat === c.key }" @click="cat = c.key">
          <span>{{ c.icon }}</span>{{ c.label }}
        </button>
      </div>
      <span class="update-time"><i></i> 数据更新于 {{ now }} · 采集频率 60 秒</span>
    </div>

    <div class="live-grid">
      <div v-for="m in activeItems" :key="m.k" class="metric-card card" :class="m.st">
        <div class="mc-head">
          <span class="mc-k">{{ m.k }}</span>
          <el-tag v-if="m.st === 'warn'" size="small" type="warning" round effect="light">超阈值</el-tag>
          <el-tag v-else size="small" type="success" round effect="light">正常</el-tag>
        </div>
        <div class="mc-value">{{ m.v }}<small>{{ m.u }}</small></div>
        <div class="mc-bar"><i :style="{ width: Math.min(100, Number(m.n)) + '%' }"></i></div>
        <div class="mc-foot">适宜范围 {{ m.mn }} – {{ m.mx }}{{ m.u }}</div>
      </div>
    </div>

    <div class="chart-grid">
      <ChartBox class="span-2" title="24 小时环境趋势" sub="空气温度 / 空气湿度 / 光照" :option="trendOption" :height="300" />
      <ChartBox title="7 日温度区间" sub="最高 / 最低温度" :option="tempOption" :height="300" />
      <ChartBox class="span-2" title="土壤墒情变化" sub="近 7 日土壤湿度" :option="soilOption" :height="270" />
      <div class="card threshold-card">
        <div class="card-head"><h3>告警阈值</h3><span class="sub">超限自动推送</span></div>
        <div class="threshold-list">
          <div class="th-row"><span>空气温度上限</span><el-input-number v-model="threshold.temp" :min="0" size="small" /><em>℃</em></div>
          <div class="th-row"><span>土壤湿度下限</span><el-input-number v-model="threshold.humidity" :min="0" size="small" /><em>%</em></div>
          <div class="th-row"><span>溶氧量下限</span><el-input-number v-model="threshold.oxygen" :min="0" :step="0.1" size="small" /><em>mg/L</em></div>
          <div class="th-row"><span>连续超限次数</span><el-input-number v-model="threshold.repeat" :min="1" size="small" /><em>次</em></div>
          <div class="th-row"><span>短信通知</span><el-switch v-model="threshold.sms" /></div>
        </div>
        <el-button type="primary" class="w-full" @click="saveThreshold">保存阈值配置</el-button>
      </div>
    </div>

    <div class="card mt-16">
      <div class="card-head"><h3>采集设备状态</h3><span class="sub">当前地块接入设备</span></div>
      <div class="dev-grid">
        <div v-for="d in plotDevices" :key="d.id" class="dev-item">
          <span class="dev-dot" :class="{ off: !d.online }"></span>
          <div class="dev-main">
            <b>{{ d.name }}</b>
            <span>{{ d.sub }} · {{ d.rate }} · {{ d.value }}</span>
          </div>
          <StatusTag :status="d.status" />
        </div>
        <div v-if="!plotDevices.length" class="empty-box" style="grid-column:1/-1;padding:24px">该地块暂无接入设备</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download, Sunny, Warning } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import ChartBox from '@/components/ChartBox.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useAdminStore } from '@/stores/admin'
import DB from '@/data/db'
import { downloadCsv } from '@/utils/format'

const admin = useAdminStore()
const plots = DB.plots
const plotId = ref(DB.plots[0].id)
const cats = [
  { key: 'air', label: '空气环境', icon: '🌤️' },
  { key: 'soil', label: '土壤环境', icon: '🌱' },
  { key: 'water', label: '水体环境', icon: '💧' },
  { key: 'weather', label: '气象环境', icon: '🌦️' }
]
const cat = ref('air')
const activeItems = computed(() => DB.envLive[cat.value] || [])
const onlineCount = computed(() => admin.devices.filter(d => d.online).length)
const plotDevices = computed(() => admin.devices.filter(d => d.plot === plotId.value))
const now = new Date().toLocaleTimeString('zh-CN', { hour12: false })
const threshold = admin.threshold

const trendOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['温度(℃)', '湿度(%)', '光照(klx)'], right: 12, top: 4, textStyle: { fontSize: 11 } },
  grid: { left: 44, right: 24, top: 42, bottom: 28 },
  xAxis: { type: 'category', boundaryGap: false, data: DB.trend24.hours.map(h => h + ':00'), axisLabel: { color: '#8b998f', fontSize: 10 }, axisLine: { lineStyle: { color: '#dfe6d9' } } },
  yAxis: { type: 'value', splitLine: { lineStyle: { color: '#eef2e8' } }, axisLabel: { color: '#8b998f', fontSize: 10 } },
  series: [
    { name: '温度(℃)', type: 'line', smooth: true, symbol: 'none', data: DB.trend24.temp, lineStyle: { width: 2.5, color: '#c28632' }, areaStyle: { color: 'rgba(194,134,50,.08)' } },
    { name: '湿度(%)', type: 'line', smooth: true, symbol: 'none', data: DB.trend24.humidity, lineStyle: { width: 2.5, color: '#4b7f9e' } },
    { name: '光照(klx)', type: 'line', smooth: true, symbol: 'none', data: DB.trend24.light.map(v => v / 1000), lineStyle: { width: 2, color: '#5b8c62', type: 'dashed' } }
  ]
}
const tempOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['最高温', '最低温'], right: 8, top: 0, textStyle: { fontSize: 10 } },
  grid: { left: 38, right: 18, top: 34, bottom: 26 },
  xAxis: { type: 'category', data: DB.trend7.days, axisLabel: { color: '#8b998f', fontSize: 9 }, axisLine: { lineStyle: { color: '#dfe6d9' } } },
  yAxis: { type: 'value', splitLine: { lineStyle: { color: '#eef2e8' } }, axisLabel: { color: '#8b998f', fontSize: 9 } },
  series: [
    { name: '最高温', type: 'line', smooth: true, data: DB.trend7.maxTemp, lineStyle: { color: '#c28632', width: 2 }, itemStyle: { color: '#c28632' }, symbolSize: 5 },
    { name: '最低温', type: 'line', smooth: true, data: DB.trend7.minTemp, lineStyle: { color: '#4b7f9e', width: 2 }, itemStyle: { color: '#4b7f9e' }, symbolSize: 5 }
  ]
}
const soilOption = {
  tooltip: { trigger: 'axis' },
  grid: { left: 42, right: 22, top: 24, bottom: 26 },
  xAxis: { type: 'category', data: DB.trend7.days, axisLabel: { color: '#8b998f', fontSize: 10 }, axisLine: { lineStyle: { color: '#dfe6d9' } } },
  yAxis: { type: 'value', axisLabel: { formatter: '{value}%', color: '#8b998f', fontSize: 10 }, splitLine: { lineStyle: { color: '#eef2e8' } } },
  series: [{ type: 'line', smooth: true, data: DB.trend7.soil, symbolSize: 6, lineStyle: { width: 2.5, color: '#4b7f9e' }, itemStyle: { color: '#4b7f9e' }, areaStyle: { color: 'rgba(75,127,158,.1)' }, markLine: { silent: true, data: [{ yAxis: 35, label: { formatter: '灌溉阈值 35%', fontSize: 9 }, lineStyle: { color: '#c28632', type: 'dashed' } }] } }]
}
function saveThreshold() { admin.updateThreshold({ ...threshold }); ElMessage.success('阈值配置已保存') }
function refresh() { ElMessage.success('环境数据已刷新') }
function exportData() {
  downloadCsv('环境监测数据.csv', [
    { label: '指标', prop: 'k' }, { label: '数值', prop: 'v' }, { label: '单位', prop: 'u' }, { label: '适宜下限', prop: 'mn' }, { label: '适宜上限', prop: 'mx' }
  ], activeItems.value)
  ElMessage.success('数据已导出')
}
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.plot-select { width: 210px; }
.env-tabs { display: flex; align-items: center; gap: 12px; padding: 10px 14px; margin-bottom: 14px; flex-wrap: wrap; }
.tabs { display: flex; gap: 4px; flex-wrap: wrap; }
.tab { border: none; background: transparent; padding: 7px 12px; border-radius: 8px; font-size: 12.5px; color: var(--ink-500); cursor: pointer; display: inline-flex; align-items: center; gap: 5px; }
.tab:hover { background: var(--brand-50); color: var(--brand-700); }
.tab.on { background: var(--brand-600); color: #fff; font-weight: 600; }
.update-time { margin-left: auto; display: flex; align-items: center; gap: 6px; font-size: 10.5px; color: var(--ink-400); }
.update-time i { width: 6px; height: 6px; border-radius: 50%; background: #4f9a5b; box-shadow: 0 0 0 3px rgba(79,154,91,.14); }
.live-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.metric-card { padding: 14px 16px; }
.metric-card.warn { border-color: #eed9b2; background: #fdfaf2; }
.mc-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.mc-k { font-size: 12px; color: var(--ink-500); }
.mc-value { font-size: 27px; font-weight: 650; letter-spacing: -.5px; margin: 6px 0 8px; color: var(--ink-900); }
.metric-card.warn .mc-value { color: #a86c18; }
.mc-value small { font-size: 11.5px; color: var(--ink-400); font-weight: 400; margin-left: 3px; }
.mc-bar { height: 5px; border-radius: 3px; background: #eef2e8; overflow: hidden; }
.mc-bar i { display: block; height: 100%; border-radius: 3px; background: linear-gradient(90deg, #a8c4a9, #56855d); }
.metric-card.warn .mc-bar i { background: linear-gradient(90deg, #e2c07d, #c28632); }
.mc-foot { font-size: 10px; color: var(--ink-300); margin-top: 6px; }
.chart-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.chart-grid .span-2 { grid-column: span 2; }
.threshold-list { padding: 12px 16px 14px; display: flex; flex-direction: column; gap: 9px; }
.th-row { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--ink-500); }
.th-row > span { flex: 1; }
.th-row em { font-style: normal; font-size: 10.5px; color: var(--ink-300); width: 34px; }
.threshold-card .el-button { width: calc(100% - 32px); margin: 0 16px 16px; }
.dev-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0 24px; padding: 8px 18px 14px; }
.dev-item { display: flex; align-items: center; gap: 9px; padding: 9px 0; border-bottom: 1px solid #f2f4ee; }
.dev-dot { width: 6px; height: 6px; border-radius: 50%; background: #4f9a5b; flex: 0 0 6px; }
.dev-dot.off { background: var(--ink-300); }
.dev-main { flex: 1; min-width: 0; }
.dev-main b { display: block; font-size: 12px; }
.dev-main span { font-size: 10.5px; color: var(--ink-400); }
@media (max-width: 1180px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } .live-grid { grid-template-columns: repeat(2, 1fr); } .chart-grid { grid-template-columns: repeat(2, 1fr); } .chart-grid .span-2 { grid-column: span 2; } }
@media (max-width: 700px) { .stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; } .live-grid { grid-template-columns: 1fr 1fr; } .chart-grid { grid-template-columns: 1fr; } .chart-grid .span-2 { grid-column: span 1; } .dev-grid { grid-template-columns: 1fr; } .plot-select { width: 140px; } }
</style>
