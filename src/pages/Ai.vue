<template>
  <div>
    <!-- 顶部统计条 -->
    <div class="strip">
      <div class="tile"><div class="ic" style="background:#e6f7ee;color:#1f9d5c">🤖</div>
        <div><div class="lab">今日AI分析</div><div class="num">{{ store.aiStats.todayAnalyses }}</div><div class="sub">图像识别+数据模型</div></div>
      </div>
      <div class="tile"><div class="ic" style="background:#fbdcd9;color:#c23b31">🦠</div>
        <div><div class="lab">病虫害预警</div><div class="num">{{ store.aiStats.pestWarnings }}</div><div class="sub">待人工确认</div></div>
      </div>
      <div class="tile"><div class="ic" style="background:#eaf1fb;color:#2b6cb0">💡</div>
        <div><div class="lab">推荐方案</div><div class="num">{{ store.aiStats.recPlans }}</div><div class="sub">含水肥·植保·采收</div></div>
      </div>
      <div class="tile"><div class="ic" style="background:#fdf0d8;color:#b07414">☁️</div>
        <div><div class="lab">气象预警</div><div class="num">{{ store.aiStats.weatherAlerts }}</div><div class="sub">未来 72h</div></div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="rerun">🔬 重新分析</el-button>
      <el-button>📥 导入样本</el-button>
      <el-button>📤 导出报告</el-button>
      <el-select style="width:180px" v-model="model" placeholder="AI模型">
        <el-option label="v2.5 综合模型" value="v2.5" />
        <el-option label="v1.9 病虫害专模" value="v1.9" />
      </el-select>
    </div>

    <!-- 主区 -->
    <div class="g2">
      <!-- 产量预测 柱状+折线 -->
      <div class="card">
        <h3>月度产量预测（AI回归）<span class="more">查看详情</span></h3>
        <div ref="barRef" class="chart"></div>
      </div>

      <!-- 病虫害诊断结果 -->
      <div class="card">
        <h3>病虫害诊断结果<span class="more">全部</span></h3>
        <table class="tbl">
          <thead><tr><th>时间</th><th>地块</th><th>疑似类型</th><th>置信度</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="p in pestAlarms" :key="p.id">
              <td>{{ p.time.slice(5) }}</td>
              <td>{{ p.msg.match(/[\u4e00-\u9fa5]+塘|[\u4e00-\u9fa5]+园|[\u4e00-\u9fa5]+棚|[\u4e00-\u9fa5]+田/)?.[0] || '-' }}</td>
              <td><span class="tag bad">疑似{{ p.msg.match(/蚜虫|鱼病|白粉病|红蜘蛛/)?.[0] || '病虫害' }}</span></td>
              <td>{{ (0.82 + Math.random()*0.15).toFixed(2) }}</td>
              <td><el-button type="primary" link @click="genOrder(p)">生成防治工单</el-button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 推荐方案 -->
    <div class="card mt">
      <h3>AI 推荐方案</h3>
      <div class="g4">
        <div v-for="i in 4" :key="i" style="border:1px dashed #c8d6cc;border-radius:10px;padding:14px;background:#fbfdfc">
          <div style="font-weight:600;color:#1f9d5c">方案 #{{ i }} · {{ ['水肥配比','绿色植保','遮阳方案','采收时机'][i-1] }}</div>
          <div style="font-size:12.5px;color:#5a6b61;margin-top:6px">
            {{ ['根据 3号大棚 土壤养分，推荐 N:P:K = 1:0.6:1.2','检测到蚜虫风险，推荐 0.3% 苦参碱喷雾 50ml/亩','预计明日最高温 34℃，建议 11:00-15:00 遮帘 80%','结合糖度+气象模型，建议 11/12 前采收 1号果园'][i-1] }}
          </div>
          <div class="mt"><el-button size="small" type="primary" plain>采纳方案</el-button></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { store } from '../stores/tableStore'
import { ElMessage } from 'element-plus'

const barRef = ref(null)
let barChart = null
const model = ref('v2.5')

const pestAlarms = computed(() => store.alarms.filter(a => a.type.includes('病虫害')))

onMounted(async () => {
  let echarts
  try { echarts = await import('echarts') } catch { return }
  try {
    barChart = echarts.init(barRef.value)
    const months = ['6月','7月','8月','9月','10月','11月','12月']
    barChart.setOption({
      tooltip:{ trigger:'axis' },
      legend:{ data:['实际产量(t)','AI预测(t)','达成率(%)'] },
      grid:{ left:50, right:55, top:40, bottom:30 },
      xAxis:{ type:'category', data:months },
      yAxis:[
        { type:'value', name:'产量(t)', splitLine:{ lineStyle:{ color:'#eef2ef' } } },
        { type:'value', name:'达成率(%)', min:0, max:120, splitLine:{ show:false } },
      ],
      series:[
        { name:'实际产量(t)', type:'bar', data:[18,22,25,23,27,null,null], itemStyle:{ color:'#2fbf7a', borderRadius:[6,6,0,0] } },
        { name:'AI预测(t)',  type:'bar', data:[18,22,25,23,27,30,33],   itemStyle:{ color:'#5cd095', borderRadius:[6,6,0,0] } },
        { name:'达成率(%)',  type:'line', yAxisIndex:1, smooth:true, data:[90,95,100,98,105,108,112], itemStyle:{ color:'#e8a33d' } },
      ],
    })
  } catch (e) { console.warn(e) }
  window.addEventListener('resize', resize)
})
function resize(){ barChart && barChart.resize() }
onBeforeUnmount(()=>{ window.removeEventListener('resize',resize); try{ barChart && barChart.dispose() } catch{} })

function rerun(){ ElMessage.success('AI分析已启动') }
function genOrder(p){ ElMessage.success(`已为「${p.type}」生成防治工单`) }
</script>
