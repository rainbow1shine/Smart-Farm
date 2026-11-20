<template>
  <div class="page-wrap">
    <PageHeader title="数据中心与统计报表" sub="环境月报 / 水肥消耗 / 设备运行 / 多维对比">
      <template #actions>
        <el-select v-model="period" class="period-select">
          <el-option label="本月（2026-11）" value="month" />
          <el-option label="本季度（2026 Q4）" value="quarter" />
          <el-option label="本年度（2026）" value="year" />
        </el-select>
        <el-button :icon="Download" @click="exportAll">导出报表</el-button>
        <el-button type="primary" :icon="Printer" @click="print">打印</el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="累计产量" value="12,680" unit="kg" foot="较上周期 +8.4%" icon="Grape" />
      <StatCard label="环境达标率" value="96.2" unit="%" foot="四类环境综合" icon="Sunny" tone="info" />
      <StatCard label="水肥消耗" value="1,286" unit="m³" foot="节水 12.6%" icon="Pouring" />
      <StatCard label="设备运行率" value="94.8" unit="%" foot="故障 3 台" icon="Cpu" tone="warn" />
    </div>

    <div class="tabs-bar card">
      <div class="tabs">
        <button v-for="t in tabs" :key="t.key" class="tab" :class="{ on: tab === t.key }" @click="tab = t.key">{{ t.label }}</button>
      </div>
      <span class="tiny muted">数据来源：物联网采集 + 业务系统 · 每小时同步</span>
    </div>

    <template v-if="tab === 'overview'">
      <div class="chart-grid">
        <ChartBox class="span-2" title="月度产量趋势" sub="kg / 按日汇总" :option="outputOption" :height="300" />
        <ChartBox title="作物结构" sub="按种植面积" :option="cropOption" :height="300" />
        <ChartBox class="span-2" title="环境达标率" sub="空气 / 土壤 / 水体 / 气象" :option="envOption" :height="270" />
        <div class="card report-table">
          <div class="card-head"><h3>关键指标</h3><span class="sub">本期汇总</span></div>
          <div class="kpi-list">
            <div class="kpi-row"><span>采收批次</span><b>{{ DB.harvests.length }} 批</b><em>+1</em></div>
            <div class="kpi-row"><span>溯源发布</span><b>{{ DB.traces.filter(t => t.status === '已发布').length }} 批</b><em>100%</em></div>
            <div class="kpi-row"><span>农残合格率</span><b>100%</b><em>合格 4 份</em></div>
            <div class="kpi-row"><span>工单完成率</span><b>75%</b><em>6 / 8</em></div>
            <div class="kpi-row"><span>平均响应时长</span><b>12 min</b><em>-3 min</em></div>
            <div class="kpi-row"><span>客户满意度</span><b>4.8 星</b><em>+0.2</em></div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="tab === 'env'">
      <div class="chart-grid">
        <ChartBox class="span-2" title="空气温湿度月报" sub="日均温度 / 湿度" :option="monthEnvOption" :height="300" />
        <ChartBox title="土壤墒情分布" sub="近 7 日" :option="soilOption" :height="300" />
        <ChartBox title="水体环境" sub="溶氧 / pH / 水温" :option="waterOption" :height="280" />
        <ChartBox class="span-3" title="气象要素" sub="风速 / 降雨 / 日照" :option="weatherOption" :height="280" />
      </div>
    </template>

    <template v-else-if="tab === 'water'">
      <div class="chart-grid">
        <ChartBox class="span-2" title="水肥消耗趋势" sub="灌溉水量（m³）与肥料（kg）" :option="waterFertOption" :height="300" />
        <ChartBox title="水肥占比" sub="按地块" :option="waterPieOption" :height="300" />
      </div>
      <div class="card mt-16">
        <div class="card-head"><h3>水肥消耗明细</h3><span class="sub">按地块统计</span></div>
        <el-table :data="waterRows" stripe>
          <el-table-column prop="plot" label="地块" min-width="180" />
          <el-table-column prop="crop" label="作物" width="100" />
          <el-table-column prop="water" label="灌溉量(m³)" width="120" />
          <el-table-column prop="fert" label="肥料(kg)" width="110" />
          <el-table-column prop="cost" label="成本(元)" width="110" />
          <el-table-column prop="save" label="节水率" width="100" />
        </el-table>
      </div>
    </template>

    <template v-else-if="tab === 'device'">
      <div class="chart-grid">
        <ChartBox title="设备状态" sub="运行 / 停止 / 故障" :option="devicePieOption" :height="280" />
        <ChartBox class="span-2" title="设备在线率趋势" sub="近 7 日" :option="onlineOption" :height="280" />
        <ChartBox class="span-3" title="告警类型统计" sub="本月累计" :option="alarmOption" :height="270" />
      </div>
      <div class="card mt-16">
        <div class="card-head"><h3>设备运行明细</h3><span class="sub">{{ admin.devices.length }} 台设备</span></div>
        <el-table :data="admin.devices" stripe max-height="380">
          <el-table-column prop="id" label="设备编号" width="110" />
          <el-table-column prop="name" label="设备名称" min-width="190" />
          <el-table-column prop="type" label="类型" width="90" />
          <el-table-column prop="plot" label="地块" width="110" />
          <el-table-column prop="rate" label="采集频率" width="100" />
          <el-table-column prop="last" label="最后在线" width="150" />
          <el-table-column prop="status" label="状态" width="90">
            <template #default="{ row }"><StatusTag :status="row.status" /></template>
          </el-table-column>
        </el-table>
      </div>
    </template>

    <template v-else>
      <div class="chart-grid">
        <ChartBox class="span-2" title="销售额对比" sub="本月 vs 上月（元）" :option="salesCompareOption" :height="300" />
        <ChartBox title="渠道销售占比" sub="商城 / 团购 / 企业" :option="channelOption" :height="300" />
      </div>
      <div class="card mt-16">
        <div class="card-head"><h3>产品销售对比</h3><span class="sub">按累计销量</span></div>
        <el-table :data="admin.goods.slice().sort((a, b) => b.sold - a.sold)" stripe>
          <el-table-column prop="name" label="商品" min-width="190" />
          <el-table-column prop="cat" label="品类" width="90" />
          <el-table-column prop="sold" label="销量(份)" width="100" />
          <el-table-column prop="price" label="单价" width="100">
            <template #default="{ row }">{{ money(row.price) }}</template>
          </el-table-column>
          <el-table-column label="销售额" width="120">
            <template #default="{ row }"><b class="price">{{ money(row.sold * row.price) }}</b></template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="90" />
          <el-table-column label="趋势" width="100">
            <template #default="{ row }"><span :class="row.sold > 600 ? 'up' : 'down'">{{ row.sold > 600 ? '↑ 上升' : '↓ 平稳' }}</span></template>
          </el-table-column>
        </el-table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Printer } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import ChartBox from '@/components/ChartBox.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useAdminStore } from '@/stores/admin'
import DB from '@/data/db'
import { money, downloadCsv } from '@/utils/format'

const admin = useAdminStore()
const period = ref('month')
const tabs = [
  { key: 'overview', label: '生产总览' },
  { key: 'env', label: '环境月报' },
  { key: 'water', label: '水肥消耗' },
  { key: 'device', label: '设备运行' },
  { key: 'sales', label: '销售对比' }
]
const tab = ref('overview')

const outputOption = {
  tooltip: { trigger: 'axis' },
  grid: { left: 44, right: 22, top: 24, bottom: 28 },
  xAxis: { type: 'category', boundaryGap: false, data: ['11-01', '11-02', '11-03', '11-04', '11-05', '11-06', '11-07', '11-08', '11-09'], axisLabel: { color: '#8b998f', fontSize: 10 }, axisLine: { lineStyle: { color: '#dfe6d9' } } },
  yAxis: { type: 'value', splitLine: { lineStyle: { color: '#eef2e8' } }, axisLabel: { color: '#8b998f', fontSize: 10 } },
  series: [{ type: 'line', smooth: true, data: [980, 1120, 860, 1240, 1360, 1420, 1580, 1260, 1860], symbolSize: 6, lineStyle: { width: 2.5, color: '#5b8c62' }, itemStyle: { color: '#5b8c62' }, areaStyle: { color: 'rgba(91,140,98,.12)' } }]
}
const cropOption = {
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 10 } },
  series: [{ type: 'pie', radius: ['45%', '68%'], center: ['50%', '44%'], label: { show: false }, data: DB.screen.cropDist.map((c, i) => ({ name: c.name, value: c.v, itemStyle: { color: ['#5b8c62', '#8fb87a', '#c28632', '#d9b26a', '#6f9f9b', '#a8b98a'][i] } })) }]
}
const envOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['空气', '土壤', '水体', '气象'], right: 12, top: 0, textStyle: { fontSize: 10 } },
  grid: { left: 40, right: 22, top: 34, bottom: 26 },
  xAxis: { type: 'category', data: ['11-03', '11-04', '11-05', '11-06', '11-07', '11-08', '11-09'], axisLabel: { color: '#8b998f', fontSize: 9 }, axisLine: { lineStyle: { color: '#dfe6d9' } } },
  yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%', color: '#8b998f', fontSize: 9 }, splitLine: { lineStyle: { color: '#eef2e8' } } },
  series: [
    { name: '空气', type: 'line', smooth: true, data: [96, 94, 98, 95, 92, 97, 96], lineStyle: { color: '#5b8c62', width: 2 }, itemStyle: { color: '#5b8c62' }, symbol: 'none' },
    { name: '土壤', type: 'line', smooth: true, data: [92, 90, 95, 93, 88, 91, 94], lineStyle: { color: '#c28632', width: 2 }, itemStyle: { color: '#c28632' }, symbol: 'none' },
    { name: '水体', type: 'line', smooth: true, data: [98, 97, 96, 98, 97, 98, 99], lineStyle: { color: '#4b7f9e', width: 2 }, itemStyle: { color: '#4b7f9e' }, symbol: 'none' },
    { name: '气象', type: 'line', smooth: true, data: [94, 92, 90, 96, 95, 93, 97], lineStyle: { color: '#a8b98a', width: 2 }, itemStyle: { color: '#a8b98a' }, symbol: 'none' }
  ]
}
const monthEnvOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['日均温度', '日均湿度'], right: 10, top: 0, textStyle: { fontSize: 10 } },
  grid: { left: 42, right: 44, top: 34, bottom: 26 },
  xAxis: { type: 'category', data: ['11-01', '11-02', '11-03', '11-04', '11-05', '11-06', '11-07', '11-08', '11-09'], axisLabel: { color: '#8b998f', fontSize: 9 }, axisLine: { lineStyle: { color: '#dfe6d9' } } },
  yAxis: [{ type: 'value', name: '℃', nameTextStyle: { fontSize: 9, color: '#8b998f' }, splitLine: { lineStyle: { color: '#eef2e8' } }, axisLabel: { color: '#8b998f', fontSize: 9 } }, { type: 'value', name: '%', nameTextStyle: { fontSize: 9, color: '#8b998f' }, splitLine: { show: false }, axisLabel: { color: '#8b998f', fontSize: 9 } }],
  series: [
    { name: '日均温度', type: 'line', smooth: true, data: [21, 22, 20, 23, 24, 22, 21, 20, 23], lineStyle: { color: '#c28632', width: 2 }, itemStyle: { color: '#c28632' }, areaStyle: { color: 'rgba(194,134,50,.08)' } },
    { name: '日均湿度', type: 'line', yAxisIndex: 1, smooth: true, data: [68, 70, 72, 66, 64, 69, 71, 73, 68], lineStyle: { color: '#4b7f9e', width: 2 }, itemStyle: { color: '#4b7f9e' } }
  ]
}
const soilOption = {
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 18, top: 18, bottom: 26 },
  xAxis: { type: 'category', data: DB.trend7.days, axisLabel: { color: '#8b998f', fontSize: 9 }, axisLine: { lineStyle: { color: '#dfe6d9' } } },
  yAxis: { type: 'value', axisLabel: { formatter: '{value}%', color: '#8b998f', fontSize: 9 }, splitLine: { lineStyle: { color: '#eef2e8' } } },
  series: [{ type: 'bar', barWidth: 16, data: DB.trend7.soil, itemStyle: { color: '#7ba37f', borderRadius: [4, 4, 0, 0] } }]
}
const waterOption = {
  tooltip: { trigger: 'axis' },
  radar: { indicator: [{ name: '溶氧', max: 10 }, { name: 'pH', max: 14 }, { name: '水温', max: 35 }, { name: '氨氮', max: 2 }, { name: '浊度', max: 60 }], radius: '62%', axisName: { fontSize: 9, color: '#66756c' } },
  series: [{ type: 'radar', data: [{ value: [5.8, 7.2, 19.2, 0.28, 12], areaStyle: { color: 'rgba(75,127,158,.18)' }, lineStyle: { color: '#4b7f9e' }, itemStyle: { color: '#4b7f9e' } }] }]
}
const weatherOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['风速(m/s)', '降雨(mm)', '日照(h)'], top: 0, textStyle: { fontSize: 10 } },
  grid: { left: 40, right: 22, top: 34, bottom: 26 },
  xAxis: { type: 'category', data: DB.trend7.days, axisLabel: { color: '#8b998f', fontSize: 9 }, axisLine: { lineStyle: { color: '#dfe6d9' } } },
  yAxis: { type: 'value', splitLine: { lineStyle: { color: '#eef2e8' } }, axisLabel: { color: '#8b998f', fontSize: 9 } },
  series: [
    { name: '风速(m/s)', type: 'bar', barWidth: 10, data: [2.1, 2.8, 1.9, 3.2, 2.4, 1.6, 2.9], itemStyle: { color: '#8fb87a', borderRadius: [3, 3, 0, 0] } },
    { name: '降雨(mm)', type: 'bar', barWidth: 10, data: [0, 0, 1.2, 0, 0, 4.5, 0], itemStyle: { color: '#4b7f9e', borderRadius: [3, 3, 0, 0] } },
    { name: '日照(h)', type: 'line', smooth: true, data: [5.2, 6.1, 4.2, 7.0, 6.4, 3.8, 5.6], lineStyle: { color: '#c28632', width: 2 }, itemStyle: { color: '#c28632' } }
  ]
}
const waterFertOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['灌溉水量', '肥料用量'], right: 10, top: 0, textStyle: { fontSize: 10 } },
  grid: { left: 44, right: 42, top: 34, bottom: 26 },
  xAxis: { type: 'category', data: ['第1周', '第2周', '第3周', '第4周'], axisLabel: { color: '#8b998f', fontSize: 10 }, axisLine: { lineStyle: { color: '#dfe6d9' } } },
  yAxis: [{ type: 'value', name: 'm³', nameTextStyle: { fontSize: 9, color: '#8b998f' }, splitLine: { lineStyle: { color: '#eef2e8' } }, axisLabel: { color: '#8b998f', fontSize: 9 } }, { type: 'value', name: 'kg', nameTextStyle: { fontSize: 9, color: '#8b998f' }, splitLine: { show: false }, axisLabel: { color: '#8b998f', fontSize: 9 } }],
  series: [
    { name: '灌溉水量', type: 'bar', barWidth: 20, data: [286, 342, 318, 340], itemStyle: { color: '#4b7f9e', borderRadius: [5, 5, 0, 0] } },
    { name: '肥料用量', type: 'line', yAxisIndex: 1, smooth: true, data: [42, 56, 48, 52], lineStyle: { color: '#c28632', width: 2.5 }, itemStyle: { color: '#c28632' } }
  ]
}
const waterPieOption = {
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 10 } },
  series: [{ type: 'pie', radius: ['46%', '68%'], center: ['50%', '44%'], label: { show: false }, data: [{ name: 'A区', value: 46, itemStyle: { color: '#5b8c62' } }, { name: 'B区', value: 28, itemStyle: { color: '#8fb87a' } }, { name: 'C区', value: 18, itemStyle: { color: '#c28632' } }, { name: 'D区', value: 8, itemStyle: { color: '#4b7f9e' } }] }]
}
const devicePieOption = {
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 10 } },
  series: [{ type: 'pie', radius: '62%', center: ['50%', '44%'], label: { formatter: '{b}\n{c} 台', fontSize: 10 }, data: [{ name: '运行', value: admin.devices.filter(d => d.status === '运行').length, itemStyle: { color: '#5b8c62' } }, { name: '停止', value: admin.devices.filter(d => d.status === '停止').length, itemStyle: { color: '#c28632' } }, { name: '故障', value: admin.devices.filter(d => d.status === '故障').length, itemStyle: { color: '#c65b4e' } }, { name: '离线', value: admin.devices.filter(d => d.status === '离线').length, itemStyle: { color: '#b3beb5' } }] }]
}
const onlineOption = {
  tooltip: { trigger: 'axis' },
  grid: { left: 44, right: 22, top: 20, bottom: 26 },
  xAxis: { type: 'category', data: DB.trend7.days, axisLabel: { color: '#8b998f', fontSize: 9 }, axisLine: { lineStyle: { color: '#dfe6d9' } } },
  yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%', color: '#8b998f', fontSize: 9 }, splitLine: { lineStyle: { color: '#eef2e8' } } },
  series: [{ type: 'line', smooth: true, data: [92, 94, 90, 96, 93, 88, 95], symbolSize: 6, lineStyle: { width: 2.5, color: '#4b7f9e' }, itemStyle: { color: '#4b7f9e' }, areaStyle: { color: 'rgba(75,127,158,.1)' } }]
}
const alarmOption = {
  tooltip: { trigger: 'axis' },
  grid: { left: 96, right: 30, top: 16, bottom: 20 },
  xAxis: { type: 'value', splitLine: { lineStyle: { color: '#eef2e8' } }, axisLabel: { color: '#8b998f', fontSize: 9 } },
  yAxis: { type: 'category', data: ['灾害预警', '库存不足', '离线掉线', '环境超限', '设备故障', '传感器异常'], axisLabel: { color: '#66756c', fontSize: 9 } },
  series: [{ type: 'bar', barWidth: 12, data: [1, 1, 1, 1, 2, 1], itemStyle: { color: '#c28632', borderRadius: 5 }, label: { show: true, position: 'right', fontSize: 9, color: '#66756c' } }]
}
const salesCompareOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['本月', '上月'], right: 10, top: 0, textStyle: { fontSize: 10 } },
  grid: { left: 50, right: 22, top: 34, bottom: 26 },
  xAxis: { type: 'category', data: ['番茄', '黄瓜', '草莓', '大米', '叶菜', '水产'], axisLabel: { color: '#8b998f', fontSize: 10 }, axisLine: { lineStyle: { color: '#dfe6d9' } } },
  yAxis: { type: 'value', splitLine: { lineStyle: { color: '#eef2e8' } }, axisLabel: { color: '#8b998f', fontSize: 9 } },
  series: [
    { name: '本月', type: 'bar', barWidth: 14, data: [16384, 9216, 20480, 21760, 4576, 3780], itemStyle: { color: '#5b8c62', borderRadius: [4, 4, 0, 0] } },
    { name: '上月', type: 'bar', barWidth: 14, data: [14200, 8400, 19600, 20400, 3900, 3300], itemStyle: { color: '#cedfc8', borderRadius: [4, 4, 0, 0] } }
  ]
}
const channelOption = {
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 10 } },
  series: [{ type: 'pie', radius: ['45%', '68%'], center: ['50%', '44%'], label: { formatter: '{b}\n{d}%', fontSize: 10 }, data: [{ name: '商城直购', value: 58, itemStyle: { color: '#5b8c62' } }, { name: '社区团购', value: 24, itemStyle: { color: '#c28632' } }, { name: '企业采购', value: 12, itemStyle: { color: '#4b7f9e' } }, { name: '线下自提', value: 6, itemStyle: { color: '#a8b98a' } }] }]
}
const waterRows = [
  { plot: 'A区1号连栋大棚', crop: '番茄', water: 386, fert: 68, cost: 1260, save: '12.4%' },
  { plot: 'A区2号日光温室', crop: '黄瓜', water: 312, fert: 52, cost: 980, save: '9.8%' },
  { plot: 'B区露天大田', crop: '水稻', water: 420, fert: 46, cost: 760, save: '15.2%' },
  { plot: 'C区草莓园', crop: '草莓', water: 108, fert: 24, cost: 620, save: '8.6%' },
  { plot: 'C区叶菜基地', crop: '小白菜', water: 60, fert: 12, cost: 180, save: '10.5%' }
]

function exportAll() {
  downloadCsv('综合统计报表.csv', [
    { label: '地块', prop: 'plot' }, { label: '作物', prop: 'crop' }, { label: '灌溉量(m³)', prop: 'water' },
    { label: '肥料(kg)', prop: 'fert' }, { label: '成本(元)', prop: 'cost' }, { label: '节水率', prop: 'save' }
  ], waterRows)
  ElMessage.success('综合报表已导出')
}
function print() { window.print() }
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.period-select { width: 190px; }
.tabs-bar { display: flex; align-items: center; gap: 12px; padding: 10px 14px; margin-bottom: 14px; flex-wrap: wrap; }
.tabs { display: flex; gap: 4px; flex-wrap: wrap; }
.tab { border: none; background: transparent; padding: 7px 13px; border-radius: 8px; font-size: 12.5px; color: var(--ink-500); cursor: pointer; }
.tab:hover { background: var(--brand-50); color: var(--brand-700); }
.tab.on { background: var(--brand-600); color: #fff; font-weight: 600; }
.tabs-bar .muted { margin-left: auto; }
.chart-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.chart-grid .span-2 { grid-column: span 2; }
.chart-grid .span-3 { grid-column: span 3; }
.kpi-list { padding: 6px 16px 12px; }
.kpi-row { display: flex; align-items: baseline; gap: 8px; padding: 7px 0; border-bottom: 1px solid #f2f4ee; font-size: 11.5px; color: var(--ink-500); }
.kpi-row:last-child { border-bottom: none; }
.kpi-row b { color: var(--ink-900); font-size: 13px; }
.kpi-row em { margin-left: auto; font-style: normal; font-size: 10px; color: var(--brand-600); }
.price { color: #b5473d; }
.up { color: #4f8b5a; font-size: 11px; }
.down { color: var(--ink-400); font-size: 11px; }
@media (max-width: 1180px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } .chart-grid { grid-template-columns: repeat(2, 1fr); } .chart-grid .span-2, .chart-grid .span-3 { grid-column: span 2; } }
@media (max-width: 700px) { .stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; } .chart-grid { grid-template-columns: 1fr; } .chart-grid .span-2, .chart-grid .span-3 { grid-column: span 1; } .period-select { width: 100%; } }
</style>
