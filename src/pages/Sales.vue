<template>
  <div>
    <div class="strip">
      <div class="tile">
        <div class="ic" style="background:#dcf3e5; color:#157a41">💰</div>
        <div><div class="lab">本月销售额</div><div class="num">¥{{ monthlyAmount.toLocaleString() }}</div><div class="sub">已完成订单</div></div>
      </div>
      <div class="tile">
        <div class="ic" style="background:#dceaf7; color:#2b6cb0">📦</div>
        <div><div class="lab">订单总数</div><div class="num">{{ store.orders.length }}</div><div class="sub">待发货 {{ pendingCount }}</div></div>
      </div>
      <div class="tile">
        <div class="ic" style="background:#fdf0d8; color:#b07414">🏆</div>
        <div><div class="lab">畅销品类</div><div class="num">{{ topCategory || '-' }}</div><div class="sub">近30天销量冠军</div></div>
      </div>
      <div class="tile">
        <div class="ic" style="background:#fbdcd9; color:#c23b31">↩️</div>
        <div><div class="lab">退款/取消率</div><div class="num">{{ refundRate }}%</div><div class="sub">基于订单总量</div></div>
      </div>
    </div>

    <div class="toolbar">
      <el-button type="primary" @click="exportReport"><el-icon><Download /></el-icon>导出报表</el-button>
    </div>

    <div class="g2">
      <div class="card">
        <h3>📈 近30天销售趋势</h3>
        <div ref="refTrend" class="chart"></div>
      </div>
      <div class="card">
        <h3>🥧 品类销售占比</h3>
        <div ref="refPie" class="chart"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import * as echarts from 'echarts'
import { store } from '../stores/tableStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const refTrend = ref(null), refPie = ref(null)
let trendChart, pieChart

const monthlyAmount = computed(() => store.orders.filter(o => o.status === '已完成').reduce((s, o) => s + o.amount, 0))
const pendingCount = computed(() => store.orders.filter(o => o.status === '待发货').length)
const refundRate = computed(() => {
  const cancel = store.orders.filter(o => o.status === '已取消').length
  return store.orders.length ? ((cancel / store.orders.length) * 100).toFixed(1) : 0
})

// 从产品分类中模拟 topCategory
const topCategory = computed(() => {
  const c = store.products.filter(p => p.onSale).map(p => p.category).flat()
  if (!c.length) return ''
  const map = {}
  c.forEach(k => map[k] = (map[k] || 0) + 1)
  return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
})

// 30天 mock 数据
const days = Array.from({ length: 30 }, (_, i) => `${10 - i}天前`).reverse()
const amounts = [1200, 1800, 1450, 2100, 2600, 1900, 3100, 2800, 2200, 3400, 3800, 2900, 4100, 3600, 3200, 4500, 3900, 4200, 4800, 3500, 5100, 4600, 5300, 4900, 5600, 5200, 5800, 6100, 5700, 6500]

onMounted(() => {
  trendChart = echarts.init(refTrend.value)
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: days, axisLabel: { show: false } },
    yAxis: { type: 'value', axisLabel: { formatter: '¥{value}' } },
    series: [{
      name: '销售额', type: 'line', smooth: true, data: amounts,
      areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{ offset:0, color:'rgba(47,191,122,.45)' },{ offset:1, color:'rgba(47,191,122,0)' }]) },
      lineStyle: { color: '#2fbf7a', width: 3 },
      itemStyle: { color: '#2fbf7a' },
    }],
  })

  pieChart = echarts.init(refPie.value)
  pieChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [{
      name: '品类', type: 'pie', radius: ['42%', '68%'], center: ['50%', '45%'],
      label: { formatter: '{b}: {d}%' },
      data: [
        { value: 45, name: '蔬菜', itemStyle: { color: '#2fbf7a' } },
        { value: 30, name: '水果', itemStyle: { color: '#e8a33d' } },
        { value: 12, name: '水产', itemStyle: { color: '#3b82c4' } },
        { value: 8,  name: '粮油', itemStyle: { color: '#6c5ce7' } },
        { value: 5,  name: '其他', itemStyle: { color: '#8fa095' } },
      ],
    }],
  })
  window.addEventListener('resize', resizeCharts)
})

function resizeCharts() { trendChart?.resize(); pieChart?.resize() }

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  trendChart?.dispose(); pieChart?.dispose()
})

function exportReport() { ElMessageBox.confirm('确定导出销售报表？').then(() => ElMessage.success('销售报表已导出')).catch(()=>{}) }
</script>
