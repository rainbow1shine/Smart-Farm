<template>
  <div>
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-select v-model="filter.plot" placeholder="大棚/地块" clearable style="min-width:160px">
        <el-option v-for="p in plots" :key="p" :label="p" :value="p" />
      </el-select>
      <el-select v-model="filter.time" placeholder="时间范围" style="min-width:140px">
        <el-option label="今日" value="today" />
        <el-option label="近7日" value="week" />
        <el-option label="近30日" value="month" />
      </el-select>
      <el-select v-model="filter.type" placeholder="指标类型" clearable style="min-width:140px">
        <el-option label="空气温度" value="空气温度" />
        <el-option label="土壤湿度" value="土壤湿度" />
        <el-option label="光照强度" value="光照强度" />
        <el-option label="CO₂" value="CO₂" />
      </el-select>
      <el-input v-model="filter.kw" placeholder="关键词搜索" clearable style="min-width:180px" />
      <el-button type="primary">🔍 查询</el-button>
      <el-button>📊 导出</el-button>
    </div>

    <!-- 顶部 tiles（8 个） -->
    <div class="g4" style="margin-bottom:16px">
      <div v-for="env in store.envList.slice(0,8)" :key="env.id" class="tile">
        <div class="ic" :style="{ background:iconBg(env.type), color:iconColor(env.type) }">
          {{ icon(env.type) }}
        </div>
        <div>
          <div class="lab">{{ env.plot }} · {{ env.type }}</div>
          <div class="num">{{ valOf(env) }}</div>
          <div class="sub">{{ env.time }} 采样</div>
        </div>
      </div>
    </div>

    <!-- 图表主区 -->
    <div class="g2">
      <div class="card">
        <h3>多因子 24h 趋势<span class="more">6 条曲线</span></h3>
        <div ref="ce1Ref" class="chart"></div>
      </div>
      <div class="card">
        <h3>4 地块环境对比（雷达）</h3>
        <div ref="ce2Ref" class="chart"></div>
      </div>
    </div>

    <!-- 最新采样表 -->
    <div class="card mt">
      <h3>最新采样数据表<span class="more">阈值配置</span></h3>
      <table class="tbl">
        <thead>
          <tr><th>ID</th><th>地块</th><th>时间</th><th>空气温度</th><th>土壤湿度</th><th>光照</th><th>CO₂</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in store.envList" :key="r.id">
            <td>{{ r.id }}</td>
            <td>{{ r.plot }}</td>
            <td>{{ r.time }}</td>
            <td>{{ r.temp }}℃</td>
            <td>{{ r.soil ?? '-' }}{{ r.soil != null ? '%' : '' }}</td>
            <td>{{ r.light ?? '-' }}</td>
            <td>{{ r.co2 }}ppm</td>
            <td>
              <el-button type="primary" link @click="editRow(r)">编辑阈值</el-button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, reactive } from 'vue'
import { store } from '../stores/tableStore'
import { ElMessage } from 'element-plus'

const ce1Ref = ref(null)
const ce2Ref = ref(null)
let ce1 = null, ce2 = null

const filter = reactive({ plot:'', time:'today', type:'', kw:'' })

const plots = computed(() => [...new Set(store.envList.map(e => e.plot))])

function icon(t){
  if (t.includes('温度')) return '🌡️'
  if (t.includes('湿度')) return '💧'
  if (t.includes('光照')) return '☀️'
  if (t.includes('CO₂')) return '🫧'
  return '📊'
}
function iconBg(t){ return t.includes('温度')?'#fdf0d8':t.includes('湿度')?'#dceaf7':t.includes('光照')?'#fff4d6':'#e6f7ee' }
function iconColor(t){ return t.includes('温度')?'#b07414':t.includes('湿度')?'#2b6cb0':t.includes('光照')?'#b07414':'#1f9d5c' }
function valOf(e){
  if (e.type.includes('温度')) return e.temp + '℃'
  if (e.type.includes('湿度')) return e.soil + '%'
  if (e.type.includes('光照')) return e.light + 'lux'
  if (e.type.includes('CO₂')) return e.co2 + 'ppm'
  return '-'
}

onMounted(async () => {
  let echarts
  try { echarts = await import('echarts') } catch { return }

  // 6 行 24h mock
  const hours = Array.from({length:24}, (_,i)=> i + ':00')
  const plots = ['1号果园','3号大棚','2号水产塘','4号试验田','A5连栋','B6示范']
  const series = plots.map((name, idx) => {
    const base = 18 + idx*2
    return { name, type:'line', smooth:true, data: hours.map((_,h)=> +(base + Math.sin(h/3+idx)*3 + Math.random()*2).toFixed(1)) }
  })

  try {
    ce1 = echarts.init(ce1Ref.value)
    ce1.setOption({
      tooltip:{ trigger:'axis' },
      legend:{ data:plots.slice(0,4) },
      grid:{ left:50, right:20, top:40, bottom:30 },
      xAxis:{ type:'category', data:hours },
      yAxis:{ type:'value', name:'℃', splitLine:{ lineStyle:{ color:'#eef2ef' } } },
      series,
    })
  } catch(e){ console.warn(e) }

  // 雷达
  try {
    ce2 = echarts.init(ce2Ref.value)
    ce2.setOption({
      tooltip:{},
      legend:{ data:['1号果园','3号大棚','2号水产塘','4号试验田'], bottom:0 },
      radar:{
        indicator:[
          { name:'温度', max:40 }, { name:'湿度', max:100 },
          { name:'光照', max:1000 }, { name:'CO₂', max:600 },
          { name:'土壤墒情', max:100 },
        ],
        splitArea:{ areaStyle:{ color:['#fbfdfc','#f4faf6'] } },
      },
      series:[{
        type:'radar',
        data:[
          { name:'1号果园', value:[25,58,780,410,62], itemStyle:{ color:'#2fbf7a' } },
          { name:'3号大棚', value:[28,72,920,430,70], itemStyle:{ color:'#e8a33d' } },
          { name:'2号水产塘', value:[22,65,300,390,80], itemStyle:{ color:'#3b82c4' } },
          { name:'4号试验田', value:[26,60,850,415,55], itemStyle:{ color:'#c23b31' } },
        ],
      }],
    })
  } catch(e){ console.warn(e) }

  window.addEventListener('resize', resize)
})
function resize(){ ce1 && ce1.resize(); ce2 && ce2.resize() }
onBeforeUnmount(()=>{ window.removeEventListener('resize',resize); try{ ce1 && ce1.dispose(); ce2 && ce2.dispose() } catch{} })

function editRow(r){ ElMessage.info(`阈值配置已打开：${r.id}`) }
</script>
