<template>
  <div>
    <!-- 顶部工具 -->
    <div class="toolbar">
      <el-button type="primary" @click="takePhoto">📸 抓拍</el-button>
      <el-button>⏺ 录像</el-button>
      <el-button>🔍 全屏</el-button>
      <el-select v-model="playingCam" placeholder="切换画面" style="min-width:160px">
        <el-option v-for="c in cameras" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <span style="margin-left:auto;font-size:12.5px;color:#8fa095">🔴 {{ playTime }}</span>
    </div>

    <!-- 6 路摄像头卡片 -->
    <div class="g3">
      <div v-for="c in cameras" :key="c.id" class="card" :style="{ background:'#1a2e20', color:'#d9efe1', border:'1px solid #2b4a3a' }">
        <h3 style="color:#d9efe1"><span>{{ c.name }}</span>
          <span style="font-size:12px;font-weight:400;display:flex;align-items:center;gap:6px">
            <span v-if="c.rec" style="width:8px;height:8px;border-radius:50%;background:#e0524a;display:inline-block;animation:blink 1s infinite"></span>
            {{ c.rec ? '录制中' : '待机' }}
          </span>
        </h3>
        <div style="height:170px;background:#0f1f18;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:52px;position:relative">
          🎥
          <div style="position:absolute;top:8px;left:10px;font-size:12px;color:#7fa892">{{ c.location }}</div>
          <div style="position:absolute;bottom:8px;right:10px;font-size:12px;color:#7fa892">1920×1080 · 25fps</div>
        </div>
        <div class="row mt" style="justify-content:space-between">
          <span style="font-size:12px;color:#7fa892">信号 {{ c.signal }}%</span>
          <div>
            <el-button size="small" @click="c.rec = !c.rec">{{ c.rec ? '⏹ 停止' : '⏺ 录制' }}</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- AI 识别记录 -->
    <div class="card mt">
      <h3>AI 识别记录<span class="more">查看全部（128）</span></h3>
      <table class="tbl">
        <thead><tr><th>时间</th><th>摄像头</th><th>识别类型</th><th>结果</th><th>置信度</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="r in aiRecords" :key="r.id">
            <td>{{ r.time }}</td>
            <td>{{ r.cam }}</td>
            <td><span class="tag blue">{{ r.type }}</span></td>
            <td>{{ r.result }}</td>
            <td>{{ (r.conf*100).toFixed(1) }}%</td>
            <td>
              <div class="actions">
                <el-button type="primary" link @click="detail(r)">查看详情</el-button>
                <el-button type="warning" link @click="dispatch(r)">派工单</el-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <style>
      @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:.2 } }
    </style>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const playingCam = ref('C1')
const playTime = ref('2026-11-10 10:30:12')
let timer = null

const cameras = ref([
  { id:'C1', name:'1号果园·东门',   location:'果园',   rec:true,  signal:96 },
  { id:'C2', name:'1号果园·西门',   location:'果园',   rec:false, signal:92 },
  { id:'C3', name:'3号大棚·中央',   location:'大棚',   rec:true,  signal:88 },
  { id:'C4', name:'2号水产塘·水面', location:'水产塘', rec:false, signal:90 },
  { id:'C5', name:'园区主干道',     location:'园区',   rec:true,  signal:98 },
  { id:'C6', name:'4号试验田',      location:'试验田', rec:false, signal:85 },
])

const aiRecords = ref([
  { id:'R001', time:'10:28', cam:'C1', type:'人员检测', result:'识别 1 名工作人员（张三）', conf:0.95 },
  { id:'R002', time:'10:22', cam:'C3', type:'果实计数', result:'第 3 行番茄挂果约 128 颗',   conf:0.88 },
  { id:'R003', time:'10:15', cam:'C4', type:'动物识别', result:'水面疑似水鸟 1 只',          conf:0.76 },
])

function takePhoto(){ ElMessage.success('照片已保存') }
function detail(r){ ElMessageBox.alert(`识别详情：${r.result}\n置信度：${(r.conf*100).toFixed(1)}%`, `${r.type} - ${r.cam}`) }
function dispatch(r){ ElMessage.success(`已为「${r.type}」派发工单`) }

onMounted(() => {
  timer = setInterval(() => {
    const d = new Date()
    playTime.value = d.toLocaleString('zh-CN', { hour12:false }).replace(/\//g,'-')
  }, 1000)
})
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>
