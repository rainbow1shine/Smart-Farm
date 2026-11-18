<template>
  <div class="page-wrap">
    <PageHeader title="销售统计" sub="销售额 / 销量 / 热销产品分析">
      <template #actions>
        <el-date-picker v-model="range" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="date-range" />
        <el-button :icon="Download" @click="exportReport">导出报表</el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="销售总额" :value="totalSales.toLocaleString()" unit="元" foot="较上周期 +12.6%" icon="Money" />
      <StatCard label="订单数" :value="admin.orderList.length" unit="笔" foot="已支付订单" icon="List" tone="info" />
      <StatCard label="客单价" :value="avgOrder" unit="元" foot="平均每笔订单" icon="TrendCharts" />
      <StatCard label="热销单品" :value="topGoods.name" unit="" :foot="`累计售出 ${topGoods.sold} 份`" icon="Goods" tone="warn" />
    </div>

    <div class="chart-grid">
      <ChartBox class="span-2" title="近 7 日销售趋势" sub="销售额（元）与订单量（笔）" :option="trendOption" :height="300" />
      <ChartBox title="品类销售占比" sub="按销量统计" :option="catOption" :height="300" />
      <ChartBox title="渠道分布" sub="订单来源" :option="channelOption" :height="300" />
    </div>

    <div class="report-grid">
      <div class="card hot-card">
        <div class="card-head"><h3>热销产品排行</h3><span class="sub">按累计销量</span><div class="acts"><el-tag size="small" round type="success" effect="light">实时</el-tag></div></div>
        <div class="hot-list">
          <div v-for="(g, i) in hotGoods.slice(0, 5)" :key="g.id" class="hot-item">
            <span class="rank" :class="'r' + (i + 1)">{{ i + 1 }}</span>
            <span class="hi-emoji">{{ g.icon }}</span>
            <div class="hi-main">
              <b>{{ g.name }}</b>
              <span>{{ g.cat }} · {{ money(g.price) }} · 库存 {{ g.stock }}</span>
              <div class="hi-bar"><i :style="{ width: (g.sold / hotGoods[0].sold * 100) + '%' }"></i></div>
            </div>
            <div class="hi-num">
              <b>{{ g.sold }}</b>
              <span>份</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card sales-order">
        <div class="card-head"><h3>最新订单</h3><span class="sub">实时推送</span><div class="acts"><el-button text type="primary" @click="$router.push('/admin/market-order')">全部</el-button></div></div>
        <div class="so-list">
          <div v-for="o in admin.orderList.slice(0, 5)" :key="o.no" class="so-item" @click="$router.push('/admin/market-order')">
            <div class="so-main">
              <b>{{ o.buyer }} · {{ o.goods }}</b>
              <span>{{ o.no }} · {{ o.time }}</span>
            </div>
            <div class="so-right">
              <b>{{ money(o.amount) }}</b>
              <StatusTag :status="o.status" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <DataTable
      class="mt-16"
      :columns="columns"
      :rows="hotGoods"
      :search-keys="['name', 'cat', 'plot']"
      search-placeholder="搜索商品…"
      export-name="销售明细"
      :row-actions="[{ key: 'view', label: '查看商品' }]"
      :action-width="100"
      @row-action="({ row }) => $router.push('/admin/market-goods')"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import ChartBox from '@/components/ChartBox.vue'
import DataTable from '@/components/DataTable.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useAdminStore } from '@/stores/admin'
import DB from '@/data/db'
import { money, downloadCsv } from '@/utils/format'

const admin = useAdminStore()
const range = ref([new Date(2026, 10, 3), new Date(2026, 10, 9)])
const hotGoods = computed(() => admin.goods.slice().sort((a, b) => b.sold - a.sold).map(g => ({ ...g, revenue: g.sold * g.price })))
const topGoods = computed(() => hotGoods.value[0] || { name: '—', sold: 0 })
const totalSales = computed(() => admin.orderList.filter(o => o.pay === '已支付').reduce((a, b) => a + b.amount, 0) + 4200)
const avgOrder = computed(() => (admin.orderList.length ? (totalSales.value / admin.orderList.length) : 0).toFixed(1))

const columns = [
  { prop: 'name', label: '商品', minWidth: 190 },
  { prop: 'cat', label: '品类', width: 110 },
  { prop: 'price', label: '单价', width: 100, type: 'money' },
  { prop: 'sold', label: '销量(份)', width: 100 },
  { prop: 'revenue', label: '销售额', width: 120, type: 'money' },
  { prop: 'stock', label: '库存', width: 90 },
  { prop: 'plot', label: '产地地块', minWidth: 160 }
]

const trendOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['销售额', '订单量'], right: 12, top: 4, textStyle: { fontSize: 11 } },
  grid: { left: 50, right: 44, top: 42, bottom: 30 },
  xAxis: { type: 'category', data: ['11-03', '11-04', '11-05', '11-06', '11-07', '11-08', '11-09'], axisLabel: { color: '#8b998f', fontSize: 10 }, axisLine: { lineStyle: { color: '#dfe6d9' } } },
  yAxis: [
    { type: 'value', name: '元', nameTextStyle: { fontSize: 10, color: '#8b998f' }, splitLine: { lineStyle: { color: '#eef2e8' } }, axisLabel: { color: '#8b998f', fontSize: 10 } },
    { type: 'value', name: '笔', nameTextStyle: { fontSize: 10, color: '#8b998f' }, splitLine: { show: false }, axisLabel: { color: '#8b998f', fontSize: 10 } }
  ],
  series: [
    { name: '销售额', type: 'bar', barWidth: 18, data: [1820, 2260, 1980, 2680, 3120, 3680, 4286], itemStyle: { color: '#5b8c62', borderRadius: [5, 5, 0, 0] } },
    { name: '订单量', type: 'line', yAxisIndex: 1, smooth: true, data: [18, 22, 19, 26, 30, 35, 38], symbolSize: 6, lineStyle: { width: 2.5, color: '#c28632' }, itemStyle: { color: '#c28632' } }
  ]
}
const catOption = {
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 11 } },
  series: [{
    type: 'pie', radius: ['46%', '68%'], center: ['50%', '44%'], itemStyle: { borderColor: '#fff', borderWidth: 2 }, label: { show: false },
    data: DB.catTree.map((c, i) => ({
      name: c.name,
      value: admin.goods.filter(g => g.big === c.name).reduce((a, b) => a + b.sold, 0) + 120,
      itemStyle: { color: ['#5b8c62', '#8fb87a', '#c28632', '#d9b26a', '#6f9f9b', '#a8b98a'][i % 6] }
    }))
  }]
}
const channelOption = {
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 11 } },
  series: [{
    type: 'pie', radius: '62%', center: ['50%', '44%'], label: { formatter: '{b}\n{d}%', fontSize: 10 },
    data: [
      { name: '商城直购', value: 58, itemStyle: { color: '#5b8c62' } },
      { name: '社区团购', value: 24, itemStyle: { color: '#c28632' } },
      { name: '企业采购', value: 12, itemStyle: { color: '#4b7f9e' } },
      { name: '线下自提', value: 6, itemStyle: { color: '#a8b98a' } }
    ]
  }]
}

function exportReport() {
  downloadCsv('销售统计报表.csv', [
    { label: '商品', prop: 'name' }, { label: '品类', prop: 'cat' }, { label: '单价', value: (r) => money(r.price) },
    { label: '销量', prop: 'sold' }, { label: '销售额', value: (r) => money(r.revenue) }, { label: '库存', prop: 'stock' }
  ], hotGoods.value)
  ElMessage.success('报表已导出')
}
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.date-range { width: 250px; }
.chart-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.chart-grid .span-2 { grid-column: span 2; }
.report-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; }
.hot-list { padding: 8px 18px 14px; }
.hot-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f2f4ee; }
.hot-item:last-child { border-bottom: none; }
.rank { width: 21px; height: 21px; border-radius: 6px; display: grid; place-items: center; font-size: 11px; font-weight: 700; background: #f0f3ea; color: var(--ink-400); flex: 0 0 21px; }
.rank.r1 { background: #fbf1df; color: #a86c18; }
.rank.r2 { background: #eef2f4; color: #5f7b8a; }
.rank.r3 { background: #f8ede5; color: #a86c4b; }
.hi-emoji { font-size: 26px; flex: 0 0 32px; text-align: center; }
.hi-main { flex: 1; min-width: 0; }
.hi-main b { font-size: 12.5px; }
.hi-main span { display: block; font-size: 10.5px; color: var(--ink-400); margin: 2px 0 5px; }
.hi-bar { height: 4px; background: #f0f3ea; border-radius: 3px; overflow: hidden; }
.hi-bar i { display: block; height: 100%; border-radius: 3px; background: linear-gradient(90deg, #8fb87a, #5b8c62); }
.hi-num { text-align: right; min-width: 48px; }
.hi-num b { display: block; font-size: 15px; color: var(--brand-700); }
.hi-num span { font-size: 10px; color: var(--ink-300); }
.so-list { padding: 6px 16px 12px; }
.so-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f2f4ee; cursor: pointer; }
.so-item:hover { background: #fcfdf9; }
.so-main { flex: 1; min-width: 0; }
.so-main b { display: block; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.so-main span { font-size: 10.5px; color: var(--ink-400); }
.so-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
.so-right b { font-size: 13px; color: #b5473d; }
@media (max-width: 1180px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } .chart-grid { grid-template-columns: repeat(2, 1fr); } .chart-grid .span-2 { grid-column: span 2; } .report-grid { grid-template-columns: 1fr; } }
@media (max-width: 760px) { .stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; } .chart-grid { grid-template-columns: 1fr; } .chart-grid .span-2 { grid-column: span 1; } .date-range { width: 100%; } }
</style>
