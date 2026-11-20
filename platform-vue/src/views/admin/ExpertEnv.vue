<template>
  <div class="page-wrap">
    <PageHeader title="环境与长势查看" sub="跨地块环境数据与作物长势对比">
      <template #actions>
        <el-select v-model="plotId" class="plot-select">
          <el-option v-for="p in plots" :key="p.id" :label="p.name" :value="p.id" />
        </el-select>
        <el-button :icon="Refresh" @click="refresh">刷新</el-button>
      </template>
    </PageHeader>

    <div class="env-hero card">
      <div class="eh-main">
        <div class="eh-kicker">{{ plot.park }} · {{ plot.type }}</div>
        <h2>{{ plot.name }}</h2>
        <p>{{ plot.crop }} · {{ plot.stage }} · 定植 {{ plot.plant }} · 面积 {{ plot.area }} 亩</p>
        <div class="eh-tags">
          <span class="soft-tag">{{ plot.devices }} 台设备接入</span>
          <span class="soft-tag">环境数据连续 30 天</span>
          <span class="soft-tag">长势评分 {{ growth?.score || '—' }}</span>
        </div>
      </div>
      <div class="eh-weather">
        <span class="ew-icon">⛅</span>
        <div><b>23.6℃</b><span>多云 · 湿度 68% · 东南风 2.4m/s</span></div>
      </div>
    </div>

    <div class="env-grid">
      <div v-for="cat in categories" :key="cat.key" class="card env-card">
        <div class="card-head">
          <h3>{{ cat.label }}</h3>
          <span class="sub">{{ cat.items.length }} 项指标</span>
          <div class="acts"><el-tag size="small" round type="success" effect="light">正常</el-tag></div>
        </div>
        <div class="metric-grid">
          <div v-for="m in cat.items.slice(0, 6)" :key="m.k" class="metric" :class="m.st">
            <span class="mk">{{ m.k }}</span>
            <div class="mv">{{ m.v }}<small>{{ m.u }}</small></div>
            <div class="mbar"><i :style="{ width: Math.min(100, m.n) + '%' }"></i></div>
            <span class="mr">适宜 {{ m.mn }}–{{ m.mx }}{{ m.u }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="chart-grid">
      <ChartBox class="span-2" title="24 小时环境趋势" sub="温度 / 湿度 / 光照" :option="trendOption" :height="280" />
      <ChartBox title="各地块长势对比" sub="AI 综合评分" :option="growthOption" :height="280" />
      <ChartBox title="环境适宜度" sub="四类环境综合" :option="radarOption" :height="280" />
      <ChartBox class="span-2" title="7 日土壤湿度" sub="土壤墒情变化" :option="soilOption" :height="260" />
      <div class="card growth-card">
        <div class="card-head"><h3>长势诊断建议</h3><span class="sub">AI 辅助分析</span></div>
        <div class="growth-list">
          <div v-for="g in growths" :key="g.plot" class="growth-item">
            <span class="gi-level" :class="g.level">{{ g.level }}</span>
            <div class="gi-main">
              <b>{{ g.plot }} · {{ g.crop }}</b>
              <p>{{ g.note }}</p>
            </div>
            <span class="gi-score">{{ g.score }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import ChartBox from '@/components/ChartBox.vue'
import DB from '@/data/db'

const plots = DB.plots
const plotId = ref(DB.plots[0].id)
const plot = computed(() => DB.plots.find(p => p.id === plotId.value) || DB.plots[0])
const growths = DB.aiGrowth
const growth = computed(() =>
  DB.aiGrowth.find(g => g.plot === plot.value.name)
  || DB.aiGrowth.find(g => plot.value.crop.includes(g.crop))
  || null
)

const categories = [
  { key: 'air', label: '空气环境', items: DB.envLive.air },
  { key: 'soil', label: '土壤环境', items: DB.envLive.soil },
  { key: 'water', label: '水体环境', items: DB.envLive.water },
  { key: 'weather', label: '气象环境', items: DB.envLive.weather }
]

const trendOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['温度(℃)', '湿度(%)', '光照(klx)'], right: 10, top: 4, textStyle: { fontSize: 11 } },
  grid: { left: 42, right: 24, top: 40, bottom: 28 },
  xAxis: { type: 'category', boundaryGap: false, data: DB.trend24.hours.map(h => h + ':00'), axisLabel: { color: '#8b998f', fontSize: 10 }, axisLine: { lineStyle: { color: '#dfe6d9' } } },
  yAxis: { type: 'value', splitLine: { lineStyle: { color: '#eef2e8' } }, axisLabel: { color: '#8b998f', fontSize: 10 } },
  series: [
    { name: '温度(℃)', type: 'line', smooth: true, symbol: 'none', data: DB.trend24.temp, lineStyle: { width: 2.5, color: '#c28632' }, areaStyle: { color: 'rgba(194,134,50,.08)' } },
    { name: '湿度(%)', type: 'line', smooth: true, symbol: 'none', data: DB.trend24.humidity, lineStyle: { width: 2.5, color: '#4b7f9e' } },
    { name: '光照(klx)', type: 'line', smooth: true, symbol: 'none', data: DB.trend24.light.map(v => v / 1000), lineStyle: { width: 2, color: '#5b8c62', type: 'dashed' } }
  ]
}
const growthOption = {
  tooltip: { trigger: 'axis' },
  grid: { left: 96, right: 30, top: 18, bottom: 20 },
  xAxis: { type: 'value', max: 100, axisLabel: { color: '#8b998f', fontSize: 10 }, splitLine: { lineStyle: { color: '#eef2e8' } } },
  yAxis: { type: 'category', data: DB.aiGrowth.map(g => g.crop), axisLabel: { color: '#66756c', fontSize: 10 } },
  series: [{ type: 'bar', barWidth: 14, data: DB.aiGrowth.map(g => g.score), itemStyle: { color: (p) => ['#5b8c62', '#8fb87a', '#c28632', '#d9b26a'][p.dataIndex], borderRadius: 7 }, label: { show: true, position: 'right', fontSize: 10, color: '#66756c' } }]
}
const radarOption = {
  tooltip: {},
  radar: { indicator: [{ name: '空气', max: 100 }, { name: '土壤', max: 100 }, { name: '水体', max: 100 }, { name: '气象', max: 100 }, { name: '长势', max: 100 }], radius: '62%', axisName: { fontSize: 10, color: '#66756c' }, splitLine: { lineStyle: { color: '#e9eee3' } }, splitArea: { areaStyle: { color: ['#fbfcf8', '#f5f8f0'] } } },
  series: [{ type: 'radar', data: [{ value: [92, 78, 85, 88, 86], name: '综合适宜度', areaStyle: { color: 'rgba(91,140,98,.18)' }, lineStyle: { color: '#5b8c62' }, itemStyle: { color: '#5b8c62' } }] }]
}
const soilOption = {
  tooltip: { trigger: 'axis' },
  grid: { left: 42, right: 22, top: 26, bottom: 26 },
  xAxis: { type: 'category', data: DB.trend7.days, axisLabel: { color: '#8b998f', fontSize: 10 }, axisLine: { lineStyle: { color: '#dfe6d9' } } },
  yAxis: { type: 'value', axisLabel: { formatter: '{value}%', color: '#8b998f', fontSize: 10 }, splitLine: { lineStyle: { color: '#eef2e8' } } },
  series: [{ type: 'line', smooth: true, data: DB.trend7.soil, symbolSize: 6, lineStyle: { width: 2.5, color: '#4b7f9e' }, itemStyle: { color: '#4b7f9e' }, areaStyle: { color: 'rgba(75,127,158,.1)' }, markLine: { silent: true, data: [{ yAxis: 35, label: { formatter: '灌溉阈值 35%', fontSize: 10 }, lineStyle: { color: '#c28632', type: 'dashed' } }] } }]
}
function refresh() { ElMessage.success('环境数据已刷新') }
</script>

<style scoped>
.plot-select { width: 220px; }
.env-hero { display: flex; align-items: center; gap: 20px; padding: 20px 24px; margin-bottom: 16px; background: linear-gradient(120deg, #3d7a49, #559257 60%, #7bab74); color: #edf7e8; border: none; }
.eh-main { flex: 1; }
.eh-kicker { font-size: 11px; color: #cfe7c8; }
.env-hero h2 { font-size: 22px; color: #fff; margin: 4px 0; }
.env-hero p { font-size: 12.5px; color: #e1f0da; }
.eh-tags { display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap; }
.eh-tags .soft-tag { background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.18); color: #dcefd8; }
.eh-weather { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.15); border-radius: 14px; padding: 13px 16px; }
.ew-icon { font-size: 34px; }
.eh-weather b { display: block; font-size: 21px; color: #fff; }
.eh-weather span { font-size: 10.5px; color: #b4d2b3; }
.env-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 16px; }
.metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 14px 16px 18px; }
.metric { border: 1px solid var(--line); border-radius: 10px; padding: 10px 11px; background: var(--bg-soft); }
.metric.warn { border-color: #eed9b2; background: #fdf9ef; }
.mk { font-size: 10.5px; color: var(--ink-400); }
.mv { font-size: 19px; font-weight: 600; color: var(--ink-900); margin: 3px 0 7px; }
.mv small { font-size: 10px; color: var(--ink-400); font-weight: 400; margin-left: 2px; }
.mbar { height: 4px; border-radius: 3px; background: #e8ede2; overflow: hidden; }
.mbar i { display: block; height: 100%; border-radius: 3px; background: var(--brand-400); }
.metric.warn .mbar i { background: #c98a2e; }
.mr { display: block; font-size: 9.5px; color: var(--ink-300); margin-top: 5px; }
.chart-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.chart-grid .span-2 { grid-column: span 2; }
.growth-list { padding: 8px 16px 14px; }
.growth-item { display: flex; align-items: flex-start; gap: 9px; padding: 9px 0; border-bottom: 1px solid #f2f4ee; }
.growth-item:last-child { border-bottom: none; }
.gi-level { font-size: 10px; width: 24px; height: 24px; border-radius: 7px; display: grid; place-items: center; background: #eef5ea; color: #4f7f56; flex: 0 0 24px; }
.gi-level.良 { background: #fbf1df; color: #a86c18; }
.gi-level.中 { background: #fbece9; color: #b84d40; }
.gi-main { flex: 1; min-width: 0; }
.gi-main b { display: block; font-size: 11.5px; }
.gi-main p { font-size: 10.5px; color: var(--ink-400); line-height: 1.55; }
.gi-score { font-size: 16px; font-weight: 700; color: var(--brand-600); }
@media (max-width: 1180px) { .env-grid { grid-template-columns: 1fr; } .chart-grid { grid-template-columns: repeat(2, 1fr); } .chart-grid .span-2 { grid-column: span 2; } }
@media (max-width: 760px) { .env-hero { flex-direction: column; align-items: flex-start; } .eh-weather { width: 100%; } .metric-grid { grid-template-columns: 1fr 1fr; } .chart-grid { grid-template-columns: 1fr; } .chart-grid .span-2 { grid-column: span 1; } .plot-select { width: 150px; } }
</style>
