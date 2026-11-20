<template>
  <div class="page-wrap">
    <PageHeader title="视频监控" sub="实时预览 / 录像回放 / 抓拍 / AI 视频识别">
      <template #actions>
        <el-select v-model="plotFilter" class="plot-select" clearable placeholder="全部地块">
          <el-option v-for="p in plots" :key="p.id" :label="p.name" :value="p.id" />
        </el-select>
        <el-button :icon="Camera" @click="snapshot">抓拍</el-button>
        <el-button :icon="Refresh" @click="refresh">刷新</el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="摄像头总数" :value="cameras.length" unit="路" foot="覆盖 5 个地块" icon="VideoCamera" />
      <StatCard label="在线" :value="cameras.filter(c => c.online).length" unit="路" foot="在线率 83%" icon="CircleCheck" />
      <StatCard label="今日抓拍" :value="snaps.length" unit="张" foot="自动 + 手动" icon="Camera" tone="info" />
      <StatCard label="AI 识别事件" :value="events.length" unit="条" foot="人员/烟火/病虫害" icon="MagicStick" tone="warn" />
    </div>

    <div class="video-layout">
      <div class="main-col">
        <div class="player card">
          <div class="player-screen" :class="{ off: !current.online, playing }">
            <div class="scene" :style="{ background: current.bg }">
              <span class="scene-emoji">{{ current.scene }}</span>
              <div class="scanline"></div>
              <div class="grid-lines"></div>
            </div>
            <div class="live-badge" :class="{ off: !current.online }"><i></i>{{ current.online ? 'LIVE' : '离线' }}</div>
            <div class="cam-meta">
              <b>{{ current.name }}</b>
              <span>{{ current.plotName }} · 1080P · 码率 2.4Mbps</span>
            </div>
            <div class="cam-time">{{ now }}</div>
            <div v-if="aiOn" class="ai-box" :style="aiBoxStyle">
              <span>{{ current.aiLabel || '人员' }} {{ current.conf || 92 }}%</span>
            </div>
            <div v-if="!current.online" class="offline-mask">
              <el-icon><VideoCamera /></el-icon>
              <b>设备离线</b>
              <span>请检查供电与网络连接</span>
            </div>
          </div>
          <div class="player-tools">
            <el-button :icon="playing ? VideoPause : VideoPlay" @click="playing = !playing">{{ playing ? '暂停' : '播放' }}</el-button>
            <el-button :icon="Camera" @click="snapshot">抓拍</el-button>
            <el-button :icon="Microphone" @click="talk">对讲</el-button>
            <el-button :icon="Clock" @click="replay">回放</el-button>
            <el-switch v-model="aiOn" active-text="AI 识别" />
            <span class="spacer"></span>
            <el-button text :icon="FullScreen" @click="fullscreen">全屏</el-button>
          </div>
        </div>

        <div class="card grid-card">
          <div class="card-head"><h3>监控画面</h3><span class="sub">{{ cameras.length }} 路摄像头</span><div class="acts"><span class="tiny muted">点击切换主画面</span></div></div>
          <div class="cam-grid">
            <button v-for="c in filteredCameras" :key="c.id" class="cam-tile" :class="{ on: current.id === c.id, off: !c.online }" @click="current = c">
              <span class="ct-scene" :style="{ background: c.bg }">{{ c.scene }}</span>
              <span class="ct-name">{{ c.name }}</span>
              <span class="ct-dot" :class="{ off: !c.online }"></span>
            </button>
          </div>
        </div>
      </div>

      <div class="side-col">
        <div class="card">
          <div class="card-head"><h3>AI 视频识别</h3><span class="sub">实时事件</span></div>
          <div class="event-list">
            <div v-for="e in events" :key="e.id" class="event-item">
              <span class="ev-icon" :class="e.level">{{ e.icon }}</span>
              <div class="ev-main">
                <b>{{ e.title }}</b>
                <span>{{ e.cam }} · {{ e.time }}</span>
              </div>
              <StatusTag :status="e.level" />
            </div>
          </div>
        </div>

        <div class="card mt-16">
          <div class="card-head"><h3>抓拍记录</h3><span class="sub">最近 6 张</span></div>
          <div class="snap-grid">
            <div v-for="s in snaps.slice(0, 6)" :key="s.id" class="snap-item">
              <span>{{ s.scene }}</span>
              <small>{{ s.time }}</small>
            </div>
          </div>
        </div>

        <div class="card mt-16">
          <div class="card-head"><h3>录像回放</h3><span class="sub">云端存储 30 天</span></div>
          <div class="replay-list">
            <div class="replay-row"><span>2026-11-09</span><b>08:00 – 12:00</b><el-button text type="primary" size="small" @click="replay">回放</el-button></div>
            <div class="replay-row"><span>2026-11-08</span><b>14:00 – 18:00</b><el-button text type="primary" size="small" @click="replay">回放</el-button></div>
            <div class="replay-row"><span>2026-11-07</span><b>06:00 – 10:00</b><el-button text type="primary" size="small" @click="replay">回放</el-button></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Camera, VideoPlay, VideoPause, Clock, FullScreen, VideoCamera, CircleCheck, MagicStick, Microphone } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import StatusTag from '@/components/StatusTag.vue'
import DB from '@/data/db'
import { dateTime } from '@/utils/format'

const plots = DB.plots
const plotFilter = ref('')
const playing = ref(true)
const aiOn = ref(true)
const now = dateTime().slice(11)

const cameras = ref([
  { id: 'CAM-01', name: 'A01 大棚全景', plot: 'DK-A01', plotName: 'A区1号连栋大棚', online: true, scene: '🍅', bg: 'linear-gradient(140deg,#3d5a3c,#1f3526 60%,#2f4a35)', aiLabel: '人员', conf: 96 },
  { id: 'CAM-02', name: 'A01 东侧通道', plot: 'DK-A01', plotName: 'A区1号连栋大棚', online: true, scene: '🌿', bg: 'linear-gradient(140deg,#2f4a35,#173024 60%,#284231)', aiLabel: '未戴安全帽', conf: 78 },
  { id: 'CAM-03', name: 'A02 黄瓜区', plot: 'DK-A02', plotName: 'A区2号日光温室', online: true, scene: '🥒', bg: 'linear-gradient(140deg,#3a5434,#1b3226 60%,#2c4530)' },
  { id: 'CAM-04', name: 'C01 草莓园', plot: 'DK-C01', plotName: 'C区草莓园', online: true, scene: '🍓', bg: 'linear-gradient(140deg,#4a4436,#2a2b22 60%,#3c3a2c)', aiLabel: '病虫害疑似', conf: 87 },
  { id: 'CAM-05', name: 'B01 大田全景', plot: 'DK-B01', plotName: 'B区露天大田', online: true, scene: '🌾', bg: 'linear-gradient(140deg,#4f5334,#292f21 60%,#3c422a)' },
  { id: 'CAM-06', name: 'D01 水产塘', plot: 'DK-D01', plotName: 'D区水产塘1号', online: false, scene: '🐟', bg: 'linear-gradient(140deg,#294558,#152c3a 60%,#203b4a)' }
])
const current = ref(cameras.value[0])
const filteredCameras = computed(() => plotFilter.value ? cameras.value.filter(c => c.plot === plotFilter.value) : cameras.value)
const aiBoxStyle = { left: '38%', top: '44%', width: '24%', height: '26%' }
const events = ref([
  { id: 1, icon: '👤', title: '检测到人员进入 A01 大棚', cam: 'A01 大棚全景', time: '09:12:40', level: '一般' },
  { id: 2, icon: '🍓', title: '草莓叶片异常区域识别', cam: 'C01 草莓园', time: '09:08:12', level: '重要' },
  { id: 3, icon: '👷', title: '未佩戴安全帽提醒', cam: 'A01 东侧通道', time: '08:56:30', level: '紧急' },
  { id: 4, icon: '🚭', title: '未检测到烟火异常', cam: 'B01 大田全景', time: '08:40:05', level: '一般' }
])
const snaps = ref([
  { id: 1, scene: '🍅', time: '09:12' }, { id: 2, scene: '🍓', time: '09:08' }, { id: 3, scene: '👷', time: '08:56' },
  { id: 4, scene: '🌿', time: '08:42' }, { id: 5, scene: '🌾', time: '08:20' }, { id: 6, scene: '🥒', time: '08:06' }
])
function snapshot() {
  snaps.value.unshift({ id: Date.now(), scene: current.value.scene, time: new Date().toLocaleTimeString('zh-CN', { hour12: false }).slice(0, 5) })
  ElMessage.success(`已抓拍「${current.value.name}」画面`)
}
function talk() { ElMessage.info('对讲功能需连接设备麦克风（演示环境）') }
function replay() { ElMessage.info('正在加载录像回放（演示环境）') }
function fullscreen() {
  const el = document.querySelector('.player-screen')
  if (el?.requestFullscreen) el.requestFullscreen()
  else ElMessage.info('当前浏览器不支持全屏')
}
function refresh() { ElMessage.success('监控状态已刷新') }
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.plot-select { width: 190px; }
.video-layout { display: grid; grid-template-columns: 1.9fr 1fr; gap: 16px; }
.player { overflow: hidden; }
.player-screen { position: relative; aspect-ratio: 16 / 8.4; background: #101c15; overflow: hidden; }
.scene { position: absolute; inset: 0; display: grid; place-items: center; }
.scene-emoji { font-size: 96px; filter: drop-shadow(0 16px 30px rgba(0,0,0,.4)); opacity: .72; }
.grid-lines { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px); background-size: 60px 60px; }
.scanline { position: absolute; left: 0; right: 0; height: 80px; background: linear-gradient(180deg, transparent, rgba(140,220,150,.1), transparent); animation: scan 5s linear infinite; }
@keyframes scan { from { top: -80px; } to { top: 100%; } }
.player-screen:not(.playing) .scanline { animation-play-state: paused; }
.live-badge { position: absolute; left: 14px; top: 13px; display: flex; align-items: center; gap: 5px; font-size: 10px; letter-spacing: .8px; color: #eaf6e7; background: rgba(20,40,28,.6); border: 1px solid rgba(255,255,255,.16); border-radius: 20px; padding: 3px 9px; }
.live-badge i { width: 6px; height: 6px; border-radius: 50%; background: #d94f45; box-shadow: 0 0 0 3px rgba(217,79,69,.2); animation: blink 1.4s infinite; }
.live-badge.off i { background: #8b998f; animation: none; box-shadow: none; }
@keyframes blink { 50% { opacity: .35; } }
.cam-meta { position: absolute; left: 14px; bottom: 13px; color: #e8f2e5; }
.cam-meta b { display: block; font-size: 14px; }
.cam-meta span { font-size: 10px; color: #a9c4ae; }
.cam-time { position: absolute; right: 14px; bottom: 13px; font-size: 11px; color: #c3d8c5; font-family: ui-monospace, Consolas, monospace; background: rgba(20,40,28,.55); padding: 3px 8px; border-radius: 6px; }
.ai-box { position: absolute; border: 2px solid #8ed49b; border-radius: 6px; box-shadow: 0 0 0 1px rgba(20,40,28,.4); }
.ai-box span { position: absolute; left: -2px; top: -22px; background: #8ed49b; color: #17331f; font-size: 10px; padding: 1px 6px; border-radius: 4px 4px 0 0; white-space: nowrap; }
.offline-mask { position: absolute; inset: 0; background: rgba(12, 22, 16, .82); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: #94a89a; }
.offline-mask .el-icon { font-size: 34px; }
.offline-mask b { font-size: 14px; color: #c4d4c6; }
.offline-mask span { font-size: 11px; }
.player-tools { display: flex; align-items: center; gap: 8px; padding: 12px 14px; flex-wrap: wrap; border-top: 1px solid var(--line); }
.player-tools .spacer { flex: 1; }
.grid-card { margin-top: 16px; }
.cam-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 14px 16px 18px; }
.cam-tile { position: relative; border: 2px solid transparent; border-radius: 10px; overflow: hidden; background: none; padding: 0; cursor: pointer; transition: border-color .15s; }
.cam-tile.on { border-color: var(--brand-500); }
.cam-tile.off { opacity: .55; }
.ct-scene { display: grid; place-items: center; height: 78px; font-size: 30px; }
.ct-name { display: block; font-size: 10.5px; color: var(--ink-600, #4d5c53); padding: 5px 7px; background: #fff; text-align: left; }
.ct-dot { position: absolute; top: 6px; right: 6px; width: 6px; height: 6px; border-radius: 50%; background: #7ed389; }
.ct-dot.off { background: #a9b3aa; }
.event-list { padding: 6px 16px 12px; }
.event-item { display: flex; align-items: center; gap: 9px; padding: 9px 0; border-bottom: 1px solid #f2f4ee; }
.ev-icon { width: 30px; height: 30px; border-radius: 9px; background: var(--brand-50); display: grid; place-items: center; font-size: 15px; flex: 0 0 30px; }
.ev-icon.重要 { background: #fbf1df; }
.ev-icon.紧急 { background: #fbece9; }
.ev-main { flex: 1; min-width: 0; }
.ev-main b { display: block; font-size: 11.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ev-main span { font-size: 10px; color: var(--ink-400); }
.snap-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 14px 16px 18px; }
.snap-item { height: 66px; border-radius: 9px; background: linear-gradient(140deg, #3d5a3c, #1f3526); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; }
.snap-item span { font-size: 23px; }
.snap-item small { font-size: 8.5px; color: #b9d0bc; }
.replay-list { padding: 8px 16px 14px; }
.replay-row { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px solid #f2f4ee; font-size: 11.5px; color: var(--ink-400); }
.replay-row b { color: var(--ink-700); font-weight: 500; flex: 1; }
@media (max-width: 1180px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } .video-layout { grid-template-columns: 1fr; } }
@media (max-width: 700px) { .stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; } .cam-grid { grid-template-columns: repeat(2, 1fr); } .scene-emoji { font-size: 62px; } }
</style>
