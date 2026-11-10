<template>
  <div>
    <!-- 顶部统计条 -->
    <div class="strip">
      <div class="tile"><div class="ic" style="background:#e6f7ee;color:#1f9d5c">🌱</div>
        <div><div class="lab">接入园区</div><div class="num">4</div><div class="sub">果园·大棚·水产·试验田</div></div>
      </div>
      <div class="tile"><div class="ic" style="background:#eaf1fb;color:#2b6cb0">📐</div>
        <div><div class="lab">种植面积</div><div class="num">128<span style="font-size:13px;color:#8fa095"> 亩</span></div><div class="sub">含设施大棚 32 亩</div></div>
      </div>
      <div class="tile"><div class="ic" style="background:#fdf0d8;color:#b07414">📡</div>
        <div><div class="lab">在线设备</div><div class="num">{{ onlineCount }}</div><div class="sub">共 {{ store.devices.length }} 台</div></div>
      </div>
      <div class="tile"><div class="ic" style="background:#fbdcd9;color:#c23b31">🔔</div>
        <div><div class="lab">今日告警</div><div class="num">{{ store.alarms.length }}</div><div class="sub">严重 {{ badCount }} / 预警 {{ warnCount }}</div></div>
      </div>
    </div>

    <!-- 三栏主区 -->
    <div class="g3">
      <!-- 双Y轴折线：空气温度 + 土壤湿度 -->
      <div class="card">
        <h3>24h 环境因子趋势<span class="more">实时</span></h3>
        <div ref="lineRef" class="chart"></div>
      </div>

      <!-- 饼图：设备运行状态 -->
      <div class="card">
        <h3>设备运行状态</h3>
        <div ref="pieRef" class="chart"></div>
      </div>

      <!-- 最新告警列表 -->
      <div class="card">
        <h3>最新告警<span class="more">全部</span></h3>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div v-for="a in latestAlarms" :key="a.id" class="between" style="padding:10px 12px;background:#fafcfb;border-radius:10px">
            <div>
              <div style="font-weight:600">{{ a.type }}</div>
              <div style="font-size:12px;color:#8fa095;margin-top:2px">{{ a.msg }}</div>
            </div>
            <span :class="['tag', a.level==='bad' ? 'bad' : a.level==='warn' ? 'warn' : a.level==='info' ? 'blue' : 'ok']">
              {{ a.level==='bad' ? '严重' : a.level==='warn' ? '预警' : a.level==='info' ? '信息' : '正常' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="toolbar" style="margin-top:16px">
      <el-button type="primary" @click="exportReport">📊 导出日报</el-button>
      <el-button>🔄 刷新数据</el-button>
      <el-button>⚙️ 大屏设置</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { store } from '../stores/tableStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const lineRef = ref(null)
const pieRef  = ref(null)
let lineChart = null
let pieChart  = null

const onlineCount = computed(() => store.devices.filter(d => d.online).length)
const badCount    = computed(() => store.alarms.filter(a => a.level === 'bad').length)
const warnCount   = computed(() => store.alarms.filter(a => a.level === 'warn').length)
const latestAlarms = computed(() => store.alarms.slice(0, 5))

const hours = Array.from({length:24}, (_,i)=> i + ':00')
const tempData  = [18,17,16,16,17,19,21,23,25,27,28,29,30,31,30,29,28,26,24,23,22,21,20,19]
const soilData  = [50,49,48,48,49,50,51,52,53,54,55,56,57,58,58,57,56,55,54,53,52,51,50,49]

onMounted(async () => {
  let echarts
  try { echarts = await import('echarts') } catch { return }
  try {
    lineChart = echarts.init(lineRef.value)
    lineChart.setOption({
      tooltip:{ trigger:'axis' },
      legend:{ data:['空气温度(℃)','土壤湿度(%)'] },
      grid:{ left:50, right:50, top:40, bottom:30 },
      xAxis:{ type:'category', data:hours, axisLine:{ lineStyle:{ color:'#d4e0d7' } } },
      yAxis:[
        { type:'value', name:'温度',  min:10, max:35, splitLine:{ lineStyle:{ color:'#eef2ef' } } },
        { type:'value', name:'湿度',  min:30, max:80, splitLine:{ show:false } },
      ],
      series:[
        { name:'空气温度(℃)', type:'line', smooth:true, data:tempData,
          itemStyle:{ color:'#e8a33d' }, areaStyle:{ color:'rgba(232,163,61,.15)' } },
        { name:'土壤湿度(%)', type:'line', yAxisIndex:1, smooth:true, data:soilData,
          itemStyle:{ color:'#2fbf7a' }, areaStyle:{ color:'rgba(47,191,122,.18)' } },
      ],
    })
  } catch (e) { console.warn('line chart init failed', e) }

  try {
    const onCnt  = store.devices.filter(d => d.online).length
    const offCnt = store.devices.filter(d => !d.online).length
    pieChart = echarts.init(pieRef.value)
    pieChart.setOption({
      tooltip:{ trigger:'item' },
      legend:{ bottom:0 },
      series:[{
        type:'pie', radius:['48%','72%'], center:['50%','45%'],
        label:{ formatter:'{b}: {c}' },
        data:[
          { name:'在线运行', value:onCnt,  itemStyle:{ color:'#2fbf7a' } },
          { name:'离线',     value:offCnt, itemStyle:{ color:'#e0524a' } },
        ],
      }],
    })
  } catch (e) { console.warn('pie chart init failed', e) }

  window.addEventListener('resize', resize)
})

function resize() {
  lineChart && lineChart.resize()
  pieChart  && pieChart.resize()
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  try { lineChart && lineChart.dispose() } catch {}
  try { pieChart  && pieChart.dispose() } catch {}
})

function exportReport() {
  ElMessageBox.confirm('确认导出今日智慧农业运营报表？', '报表导出', {
    confirmButtonText:'立即导出', cancelButtonText:'取消', type:'info',
  }).then(() => {
    ElMessage.success('报表已导出到下载目录')
  }).catch(()=>{})
}
</script>
