<template>
  <div class="page-wrap">
    <PageHeader title="AI 智能分析" sub="长势分析 / 病虫害预警 / 水肥推荐 / 气象灾害预警">
      <template #actions>
        <el-button :icon="Refresh" @click="refresh">重新分析</el-button>
        <el-button type="primary" :icon="MagicStick" @click="runAll">生成分析报告</el-button>
      </template>
    </PageHeader>

    <div class="ai-hero card">
      <div class="ah-icon">🤖</div>
      <div class="ah-main">
        <div class="ah-kicker">AI 农事大脑 · 基于环境、长势、历史农事数据</div>
        <h2>今日共生成 <b>{{ insight.total }}</b> 条分析建议，其中 <b>{{ insight.risk }}</b> 条需优先处理</h2>
        <p>{{ insight.summary }}</p>
      </div>
      <div class="ah-stats">
        <div><b>{{ insight.accuracy }}</b><span>模型准确率</span></div>
        <div><b>{{ insight.plots }}</b><span>分析地块</span></div>
      </div>
    </div>

    <div class="stat-grid">
      <StatCard label="长势分析" :value="DB.aiGrowth.length" unit="地块" foot="平均评分 79" icon="TrendCharts" />
      <StatCard label="病虫害预警" :value="DB.aiPest.length" unit="条" foot="中风险 2 条" icon="Warning" tone="warn" />
      <StatCard label="水肥推荐" :value="DB.aiFertilize.length" unit="份" foot="按作物生育期" icon="Grape" tone="info" />
      <StatCard label="气象预警" :value="DB.aiWeather.filter(w => w.warn).length" unit="条" foot="未来 4 天" icon="Cloudy" tone="danger" />
    </div>

    <div class="tabs-bar card">
      <div class="tabs">
        <button v-for="t in tabs" :key="t.key" class="tab" :class="{ on: tab === t.key }" @click="tab = t.key">{{ t.icon }} {{ t.label }}</button>
      </div>
      <span class="tiny muted">分析结果每日 06:00 自动更新，也可手动触发</span>
    </div>

    <template v-if="tab === 'growth'">
      <div class="chart-grid">
        <ChartBox class="span-2" title="地块长势评分" sub="综合叶绿素、株型、坐果等指标" :option="growthOption" :height="290" />
        <ChartBox title="长势等级分布" sub="优 / 良 / 中" :option="levelOption" :height="290" />
      </div>
      <div class="card mt-16">
        <div class="card-head"><h3>长势分析明细</h3><span class="sub">AI 识别结果</span></div>
        <div class="growth-list">
          <div v-for="g in DB.aiGrowth" :key="g.plot" class="growth-item">
            <span class="gi-level" :class="g.level">{{ g.level }}</span>
            <div class="gi-main">
              <div class="gi-title"><b>{{ g.plot }} · {{ g.crop }}</b><span>预计采收 {{ g.predict }}</span></div>
              <p>{{ g.note }}</p>
              <el-progress :percentage="g.score" :stroke-width="7" :color="g.score >= 85 ? '#5b8c62' : g.score >= 70 ? '#c28632' : '#c65b4e'" />
            </div>
            <span class="gi-score">{{ g.score }}</span>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="tab === 'pest'">
      <div class="pest-grid">
        <div v-for="p in DB.aiPest" :key="p.plot" class="card pest-card">
          <div class="pc-head">
            <span class="pest-icon">🐛</span>
            <div><h3>{{ p.pest }}</h3><p>{{ p.plot }} · {{ p.crop }}</p></div>
            <span class="risk" :class="p.level">{{ p.level }}</span>
          </div>
          <div class="conf">
            <span>AI 置信度</span><b>{{ p.conf }}%</b>
            <el-progress :percentage="p.conf" :stroke-width="7" :show-text="false" :color="p.conf >= 80 ? '#c65b4e' : p.conf >= 60 ? '#c28632' : '#7ba37f'" />
          </div>
          <div class="advise"><el-icon><MagicStick /></el-icon><p>{{ p.advise }}</p></div>
          <div class="pc-foot"><span>{{ p.time }}</span><el-button size="small" type="primary" plain @click="goPlan(p)">下发防治方案</el-button></div>
        </div>
      </div>
    </template>

    <template v-else-if="tab === 'fert'">
      <div class="fert-grid">
        <div v-for="f in DB.aiFertilize" :key="f.plot" class="card fert-card">
          <div class="fc-head">
            <div><h3>{{ f.plot }}</h3><p>{{ f.crop }} · {{ f.stage }}</p></div>
            <span class="fc-tag">水肥推荐</span>
          </div>
          <div class="npk">
            <div class="npk-item n"><span>N 氮</span><b>{{ f.n }}</b><em>kg/亩</em></div>
            <div class="npk-item p"><span>P 磷</span><b>{{ f.p }}</b><em>kg/亩</em></div>
            <div class="npk-item k"><span>K 钾</span><b>{{ f.k }}</b><em>kg/亩</em></div>
          </div>
          <div class="fert-advise"><h4>推荐方案</h4><p>{{ f.advise }}</p></div>
          <div class="fert-water"><el-icon><Pouring /></el-icon>灌溉建议：{{ f.water }}</div>
          <el-button class="w-full" type="primary" plain @click="goPlan(f)">生成施肥工单</el-button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="weather-grid">
        <div v-for="w in DB.aiWeather" :key="w.date" class="card weather-card" :class="{ warn: w.warn }">
          <div class="wc-date">{{ w.date }}</div>
          <div class="wc-icon">{{ w.rain > 10 ? '🌧️' : w.rain > 0 ? '🌦️' : w.type === '阴' ? '☁️' : '⛅' }}</div>
          <div class="wc-type">{{ w.type }}</div>
          <div class="wc-temp">{{ w.high }}°<small>/ {{ w.low }}°</small></div>
          <div class="wc-rain">降雨 {{ w.rain }}mm</div>
          <div v-if="w.warn" class="wc-warn"><el-icon><Warning /></el-icon>{{ w.warn }}</div>
          <div v-else class="wc-ok">气象条件适宜</div>
        </div>
      </div>
      <div class="card mt-16">
        <div class="card-head"><h3>灾害应对建议</h3><span class="sub">基于未来 4 天气象预报</span></div>
        <div class="disaster-list">
          <div class="disaster-item"><span class="di-icon">🌧️</span><div><b>11-11 中雨 · 暴雨蓝色预警</b><p>建议提前关闭大棚通风口与卷帘，检查排水沟渠；水产塘提前降低水位 10cm，开启增氧机。</p></div><StatusTag status="紧急" /></div>
          <div class="disaster-item"><span class="di-icon">💨</span><div><b>11-10 小雨 · 棚内湿度上升</b><p>注意降湿防病，可在中午短时通风，避免草莓白粉病与番茄早疫病扩散。</p></div><StatusTag status="重要" /></div>
          <div class="disaster-item"><span class="di-icon">🌡️</span><div><b>昼夜温差 7–9℃ · 注意保温</b><p>夜间温度降至 13–15℃，草莓开花期建议加盖二道膜，保持夜温不低于 12℃。</p></div><StatusTag status="一般" /></div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, MagicStick, Pouring, Warning } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import ChartBox from '@/components/ChartBox.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useAdminStore } from '@/stores/admin'
import DB from '@/data/db'

const admin = useAdminStore()
const tabs = [
  { key: 'growth', label: '长势分析', icon: '🌱' },
  { key: 'pest', label: '病虫害预警', icon: '🐛' },
  { key: 'fert', label: '水肥推荐', icon: '💧' },
  { key: 'weather', label: '气象灾害', icon: '🌦️' }
]
const tab = ref('growth')
const insight = {
  total: DB.aiGrowth.length + DB.aiPest.length + DB.aiFertilize.length + DB.aiWeather.filter(w => w.warn).length,
  risk: DB.aiPest.filter(p => p.level !== '低风险').length + DB.aiWeather.filter(w => w.warn).length,
  accuracy: '94.2%',
  plots: new Set(DB.aiGrowth.map(g => g.plot)).size,
  summary: '草莓白粉病风险升高，建议在 11-09 前完成预防性喷施；番茄结果期钾肥略不足，可按推荐方案追施硫酸钾。'
}

const growthOption = {
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 24, top: 24, bottom: 28 },
  xAxis: { type: 'category', data: DB.aiGrowth.map(g => g.crop), axisLabel: { color: '#8b998f', fontSize: 10 }, axisLine: { lineStyle: { color: '#dfe6d9' } } },
  yAxis: { type: 'value', max: 100, splitLine: { lineStyle: { color: '#eef2e8' } }, axisLabel: { color: '#8b998f', fontSize: 10 } },
  series: [{
    type: 'bar', barWidth: 34, data: DB.aiGrowth.map(g => ({ value: g.score, itemStyle: { color: g.score >= 85 ? '#5b8c62' : g.score >= 70 ? '#c28632' : '#c65b4e', borderRadius: [6, 6, 0, 0] } })),
    label: { show: true, position: 'top', formatter: '{c} 分', fontSize: 10, color: '#66756c' }
  }]
}
const levelOption = {
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 11 } },
  series: [{
    type: 'pie', radius: ['45%', '68%'], center: ['50%', '44%'], label: { show: false },
    data: [
      { name: '优', value: DB.aiGrowth.filter(g => g.level === '优').length, itemStyle: { color: '#5b8c62' } },
      { name: '良', value: DB.aiGrowth.filter(g => g.level === '良').length, itemStyle: { color: '#c28632' } },
      { name: '中', value: DB.aiGrowth.filter(g => g.level === '中').length, itemStyle: { color: '#c65b4e' } }
    ]
  }]
}

function goPlan(item) {
  admin.addTechPlan({ plot: item.plot, crop: item.crop, stage: item.stage || '生长期', type: item.pest ? '病虫害防治' : '施肥方案', content: item.advise || '按 AI 推荐方案执行', author: 'AI 助手' })
  ElMessage.success('已生成技术方案草稿')
}
function runAll() { ElMessage.success('AI 分析报告已生成，可在统计报表中查看') }
function refresh() { ElMessage.success('分析结果已更新') }
</script>

<style scoped>
.ai-hero { display: flex; align-items: center; gap: 18px; padding: 20px 24px; margin-bottom: 16px; background: linear-gradient(120deg, #3d7a49, #559257 58%, #7bab74); color: #edf7e8; border: none; flex-wrap: wrap; }
.ah-icon { width: 54px; height: 54px; border-radius: 15px; background: rgba(255,255,255,.16); display: grid; place-items: center; font-size: 27px; flex: 0 0 54px; }
.ah-main { flex: 1; min-width: 260px; }
.ah-kicker { font-size: 10px; color: #d3ecc9; letter-spacing: .4px; }
.ai-hero h2 { font-size: 17px; color: #fff; margin: 5px 0; font-weight: 500; }
.ai-hero h2 b { color: #eef8c8; }
.ai-hero p { font-size: 11.5px; color: #e1f0da; line-height: 1.7; }
.ah-stats { display: flex; gap: 22px; }
.ah-stats > div { text-align: center; }
.ah-stats b { display: block; font-size: 20px; color: #fff; }
.ah-stats span { font-size: 10px; color: #d3ecc9; }
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.tabs-bar { display: flex; align-items: center; gap: 12px; padding: 10px 14px; margin-bottom: 14px; flex-wrap: wrap; }
.tabs { display: flex; gap: 4px; flex-wrap: wrap; }
.tab { border: none; background: transparent; padding: 7px 13px; border-radius: 8px; font-size: 12.5px; color: var(--ink-500); cursor: pointer; }
.tab:hover { background: var(--brand-50); color: var(--brand-700); }
.tab.on { background: var(--brand-600); color: #fff; font-weight: 600; }
.tabs-bar .muted { margin-left: auto; }
.chart-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.chart-grid .span-2 { grid-column: span 2; }
.growth-list { padding: 8px 20px 14px; }
.growth-item { display: flex; align-items: flex-start; gap: 12px; padding: 13px 0; border-bottom: 1px solid #f2f4ee; }
.growth-item:last-child { border-bottom: none; }
.gi-level { width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center; background: #eef5ea; color: #4f7f56; font-size: 12px; font-weight: 600; flex: 0 0 30px; }
.gi-level.良 { background: #fbf1df; color: #a86c18; }
.gi-level.中 { background: #fbece9; color: #b84d40; }
.gi-main { flex: 1; min-width: 0; }
.gi-title { display: flex; justify-content: space-between; gap: 10px; align-items: baseline; }
.gi-title b { font-size: 13px; }
.gi-title span { font-size: 10.5px; color: var(--ink-400); }
.gi-main p { font-size: 11.5px; color: var(--ink-500); margin: 3px 0 7px; }
.gi-score { font-size: 22px; font-weight: 700; color: var(--brand-600); min-width: 40px; text-align: right; }
.pest-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.pest-card { padding: 16px 18px; }
.pc-head { display: flex; align-items: flex-start; gap: 9px; }
.pest-icon { width: 36px; height: 36px; border-radius: 10px; background: #fbf1df; display: grid; place-items: center; font-size: 18px; flex: 0 0 36px; }
.pc-head h3 { font-size: 14.5px; }
.pc-head p { font-size: 10.5px; color: var(--ink-400); }
.risk { margin-left: auto; font-size: 10px; padding: 3px 7px; border-radius: 5px; background: #eef5ea; color: #4f7f56; }
.risk.中风险 { background: #fbf1df; color: #a86c18; }
.risk.低风险 { background: #eef5ea; color: #4f7f56; }
.conf { margin: 13px 0; }
.conf > span { font-size: 10.5px; color: var(--ink-400); }
.conf > b { float: right; font-size: 13px; color: var(--brand-700); }
.advise { display: flex; gap: 7px; align-items: flex-start; background: var(--brand-50); border-radius: 9px; padding: 10px 11px; color: var(--brand-800); font-size: 11.5px; line-height: 1.7; min-height: 76px; }
.advise p { flex: 1; }
.pc-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; font-size: 10px; color: var(--ink-300); }
.fert-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
.fert-card { padding: 17px 19px; }
.fc-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.fc-head h3 { font-size: 15px; }
.fc-head p { font-size: 11px; color: var(--ink-400); }
.fc-tag { font-size: 10px; color: var(--brand-700); background: var(--brand-50); border: 1px solid var(--brand-100); border-radius: 20px; padding: 2px 8px; }
.npk { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 14px 0; }
.npk-item { border-radius: 10px; padding: 10px 12px; background: var(--bg-soft); border: 1px solid var(--line); }
.npk-item span { display: block; font-size: 10px; color: var(--ink-400); }
.npk-item b { font-size: 21px; color: var(--ink-900); }
.npk-item em { font-style: normal; font-size: 9.5px; color: var(--ink-300); margin-left: 3px; }
.npk-item.n { border-left: 3px solid #5b8c62; }
.npk-item.p { border-left: 3px solid #4b7f9e; }
.npk-item.k { border-left: 3px solid #c28632; }
.fert-advise h4 { font-size: 12px; margin-bottom: 5px; }
.fert-advise p { font-size: 11.5px; color: var(--ink-500); line-height: 1.75; }
.fert-water { display: flex; align-items: center; gap: 6px; margin: 12px 0; padding: 8px 10px; border-radius: 8px; background: #eef6fa; color: #3b7190; font-size: 11px; }
.weather-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.weather-card { padding: 18px 16px; text-align: center; }
.weather-card.warn { border-color: #eed9b2; background: #fffdf7; }
.wc-date { font-size: 11.5px; color: var(--ink-400); }
.wc-icon { font-size: 36px; margin: 8px 0 4px; }
.wc-type { font-size: 12px; color: var(--ink-500); }
.wc-temp { font-size: 25px; font-weight: 650; margin: 7px 0 3px; }
.wc-temp small { font-size: 13px; color: var(--ink-400); font-weight: 400; }
.wc-rain { font-size: 10.5px; color: var(--ink-400); }
.wc-warn { display: flex; align-items: center; justify-content: center; gap: 4px; margin-top: 10px; padding: 6px; border-radius: 7px; background: #fdf5e7; color: #8a672c; font-size: 10.5px; }
.wc-ok { margin-top: 10px; font-size: 10.5px; color: var(--brand-600); }
.disaster-list { padding: 8px 18px 14px; }
.disaster-item { display: flex; align-items: flex-start; gap: 11px; padding: 12px 0; border-bottom: 1px solid #f2f4ee; }
.disaster-item:last-child { border-bottom: none; }
.di-icon { font-size: 22px; width: 34px; height: 34px; border-radius: 9px; background: var(--bg-soft); display: grid; place-items: center; flex: 0 0 34px; }
.disaster-item > div { flex: 1; }
.disaster-item b { font-size: 12.5px; }
.disaster-item p { font-size: 11.5px; color: var(--ink-500); line-height: 1.7; margin-top: 3px; }
@media (max-width: 1180px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } .pest-grid { grid-template-columns: repeat(2, 1fr); } .chart-grid { grid-template-columns: repeat(2, 1fr); } .chart-grid .span-2 { grid-column: span 2; } }
@media (max-width: 760px) { .stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; } .pest-grid, .fert-grid { grid-template-columns: 1fr; } .chart-grid { grid-template-columns: 1fr; } .chart-grid .span-2 { grid-column: span 1; } .weather-grid { grid-template-columns: 1fr 1fr; } .ah-stats { width: 100%; justify-content: flex-start; } }
</style>
