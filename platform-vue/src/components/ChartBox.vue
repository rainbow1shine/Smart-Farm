<template>
  <div class="chart-box" :class="{ dark }">
    <div v-if="title || $slots.extra" class="chart-head">
      <div>
        <h3>{{ title }}</h3>
        <span v-if="sub" class="sub">{{ sub }}</span>
      </div>
      <div class="extra"><slot name="extra" /></div>
    </div>
    <div ref="el" class="chart-canvas" :style="{ height: height + 'px' }"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  option: { type: Object, required: true },
  title: String,
  sub: String,
  height: { type: Number, default: 260 },
  dark: Boolean
})
const el = ref(null)
let chart = null
let ro = null
let hiTimer = null

/* 统一开启入场动画，折线描绘 / 柱状生长 / 饼图扩散 */
const ANIMATION = {
  animation: true,
  animationThreshold: 4000,
  animationDuration: 1100,
  animationEasing: 'cubicOut',
  animationDelay: (i) => i * 45,
  animationDurationUpdate: 650,
  animationEasingUpdate: 'cubicOut'
}

function render() {
  if (!el.value) return
  if (!chart) chart = echarts.init(el.value, props.dark ? 'dark' : undefined, { renderer: 'canvas' })
  chart.setOption({ ...ANIMATION, ...props.option }, { notMerge: true })
  startHighlight()
}

/* 饼图 / 环形图自动轮播高亮，形成持续的“动图”效果 */
function startHighlight() {
  clearInterval(hiTimer)
  const series = props.option?.series || []
  const index = series.findIndex(s => s.type === 'pie')
  if (index < 0) return
  let n = 0
  hiTimer = setInterval(() => {
    if (!chart) return
    const data = series[index]?.data || []
    if (!data.length) return
    chart.dispatchAction({ type: 'downplay', seriesIndex: index })
    chart.dispatchAction({ type: 'highlight', seriesIndex: index, dataIndex: n % data.length })
    n += 1
  }, 2200)
}

onMounted(async () => {
  await nextTick()
  render()
  ro = new ResizeObserver(() => chart && chart.resize())
  ro.observe(el.value)
})
watch(() => props.option, render, { deep: true })
onBeforeUnmount(() => {
  clearInterval(hiTimer)
  ro && ro.disconnect()
  chart && chart.dispose()
  chart = null
})
</script>

<style scoped>
.chart-box { background: #fff; border: 1px solid var(--line); border-radius: var(--radius); box-shadow: var(--shadow-sm); overflow: hidden; }
.chart-box.dark { background: rgba(9, 38, 24, .72); border-color: rgba(120, 200, 150, .16); box-shadow: none; }
.chart-head { display: flex; align-items: center; gap: 10px; padding: 15px 18px 0; }
.chart-head h3 { font-size: 14.5px; font-weight: 600; }
.chart-head .sub { font-size: 11.5px; color: var(--ink-400); margin-left: 6px; }
.chart-head .extra { margin-left: auto; }
.dark .chart-head h3 { color: #d9f0e2; }
.dark .chart-head .sub { color: #7ca890; }
.chart-canvas { width: 100%; }
</style>
