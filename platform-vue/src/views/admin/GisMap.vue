<template>
  <div class="page-wrap">
    <PageHeader title="GIS 地理信息" sub="地块、设备点位、灌溉管网与空间统计">
      <template #actions>
        <el-button :icon="Refresh" @click="refresh">刷新</el-button>
        <el-button type="primary" :icon="Monitor" @click="$router.push('/screen')">大屏查看</el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="园区数量" :value="DB.parks.length" unit="个" foot="永川 / 南川 / 璧山" icon="OfficeBuilding" />
      <StatCard label="地块总数" :value="DB.plots.length" unit="块" foot="设施 + 大田 + 养殖" icon="MapLocation" tone="info" />
      <StatCard label="设备点位" :value="DB.devices.length" unit="个" foot="在线 87.5%" icon="Cpu" />
      <StatCard label="覆盖面积" :value="DB.plots.reduce((a, b) => a + b.area, 0).toFixed(0)" unit="亩" foot="三大园区" icon="Crop" tone="warn" />
    </div>

    <div class="gis-layout">
      <div class="map-card card">
        <div class="map-toolbar">
          <div class="chips">
            <button v-for="p in DB.parks" :key="p.id" class="chip" :class="{ on: park === p.name }" @click="park = park === p.name ? '' : p.name">{{ p.name.replace('智慧农业示范园', '').replace('生态农业园', '').replace('蔬菜保供基地', '') }}</button>
          </div>
          <span class="spacer"></span>
          <el-button size="small" :icon="ZoomIn" @click="zoom = Math.min(1.4, zoom + 0.1)">放大</el-button>
          <el-button size="small" :icon="ZoomOut" @click="zoom = Math.max(0.8, zoom - 0.1)">缩小</el-button>
        </div>

        <div ref="mapWrap" class="map-wrap">
          <svg class="gis-svg" viewBox="0 0 900 520" :style="{ transform: `scale(${zoom})` }">
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e9eee3" stroke-width="1" />
              </pattern>
              <linearGradient id="ndvi" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="rgba(116,168,104,.28)" />
                <stop offset="100%" stop-color="rgba(72,130,84,.08)" />
              </linearGradient>
            </defs>
            <rect width="900" height="520" fill="#f6f9f1" />
            <rect width="900" height="520" fill="url(#grid)" />
            <path d="M0 430 C 160 400, 280 452, 430 420 S 700 372, 900 404 L900 520 L0 520Z" fill="#e7f1f3" />
            <path class="river-flow" d="M0 448 C 160 418, 280 470, 430 438 S 700 390, 900 422" fill="none" stroke="#a8cdd8" stroke-width="4" stroke-linecap="round" />
            <path d="M120 70 C 280 110, 460 40, 640 96 S 820 150, 900 120" fill="none" stroke="#dbe7d5" stroke-width="16" stroke-linecap="round" />
            <text x="748" y="470" fill="#9db3ad" font-size="11">龙溪河</text>
            <text x="330" y="66" fill="#b3bfae" font-size="10" letter-spacing="2">产 业 大 道</text>

            <g v-if="layerOn('地块图层')">
              <g v-for="p in shapes" :key="p.id" class="plot-shape" :class="{ dim: park && p.park !== park, on: selected?.id === p.id }" @click="selected = p.plot" @mousemove="onPlotMove(p, $event)" @mouseleave="hover = null">
                <rect :x="p.x" :y="p.y" :width="p.w" :height="p.h" rx="8" :transform="`rotate(${p.rotate} ${p.x + p.w / 2} ${p.y + p.h / 2})`" :fill="p.fill" stroke="#fff" stroke-width="2" />
                <text :x="p.x + p.w / 2" :y="p.y + p.h / 2 - 4" text-anchor="middle" font-size="11" fill="#2e4a35" font-weight="600">{{ p.short }}</text>
                <text :x="p.x + p.w / 2" :y="p.y + p.h / 2 + 11" text-anchor="middle" font-size="9" fill="#5c7a62">{{ p.plot.crop.split('（')[0] }}</text>
              </g>
            </g>

            <g v-if="layerOn('遥感影像图层（NDVI）')" class="deco">
              <rect x="650" y="250" width="180" height="130" rx="14" fill="url(#ndvi)" stroke="#b8d4ad" stroke-dasharray="5 4" />
              <rect class="ndvi-scan" x="652" y="252" width="176" height="12" rx="6" fill="rgba(120,190,120,.22)" />
              <text x="740" y="370" text-anchor="middle" font-size="10" fill="#6f9567">NDVI 0.72 长势良好</text>
            </g>

            <g v-if="layerOn('设备点位图层')">
              <g v-for="d in devicePoints" :key="d.id" class="dev-point" :class="{ dim: park && !d.inPark }" @click="selected = d.plot" @mousemove="onDevMove(d, $event)" @mouseleave="hover = null">
                <circle v-if="d.online" class="pulse-ring" :cx="d.x" :cy="d.y" r="7" fill="none" stroke="#4f9a5b" stroke-width="1.5" />
                <circle :cx="d.x" :cy="d.y" r="7" fill="#fff" stroke="#3f6f4a" stroke-width="2" />
                <circle :cx="d.x" :cy="d.y" r="3" :fill="d.online ? '#4f9a5b' : '#b3beb5'" />
              </g>
            </g>

            <g v-if="layerOn('气象图层')" class="deco">
              <g class="weather-float" transform="translate(420 150)">
                <circle r="15" fill="#fff" stroke="#c28632" stroke-width="2" />
                <text text-anchor="middle" y="5" font-size="13">⛅</text>
                <text x="22" y="4" font-size="10" fill="#8a672c">气象站 · 23.6℃</text>
              </g>
            </g>

            <g v-if="layerOn('大棚图层')" class="deco">
              <g v-for="s in shapes.filter(p => p.plot.type === '设施大棚')" :key="'house' + s.id">
                <path :d="`M${s.x + s.w / 2 - 14} ${s.y - 9} L${s.x + s.w / 2} ${s.y - 20} L${s.x + s.w / 2 + 14} ${s.y - 9} Z`" fill="#9cc48e" opacity=".75" />
              </g>
            </g>

            <g v-if="layerOn('作业轨迹图层')" class="deco">
              <path class="route-flow" d="M220 400 C 320 360, 390 330, 500 350 S 640 300, 720 260" fill="none" stroke="#c28632" stroke-width="2" stroke-dasharray="6 5" opacity=".7" />
            </g>
          </svg>
          <div v-if="hover" class="map-tip" :style="{ left: hover.x + 'px', top: hover.y + 'px' }">
            <template v-if="hover.kind === 'plot'">
              <b>{{ hover.plot.plot.name }}</b>
              <span>{{ hover.plot.plot.crop }} · {{ hover.plot.plot.area }} 亩</span>
              <span>{{ hover.plot.plot.stage }} · {{ hover.plot.plot.status }}</span>
              <span class="tip-meta">设备 {{ hover.plot.devices }} 台 · 点击查看详情</span>
            </template>
            <template v-else>
              <b>{{ hover.dev.name }}</b>
              <span>{{ hover.dev.value }}</span>
              <span class="tip-meta">{{ hover.dev.online ? '在线运行中' : '当前离线' }}</span>
            </template>
          </div>
          <div class="map-legend">
            <span><i class="lg normal"></i>正常地块</span>
            <span><i class="lg warn"></i>预警地块</span>
            <span><i class="lg device"></i>设备点位</span>
            <span><i class="lg ndvi"></i>NDVI 影像</span>
          </div>
        </div>

        <div class="layer-bar">
          <button v-for="l in DB.layers" :key="l.name" class="layer-chip" :class="{ on: l.on }" @click="toggleLayer(l)">
            <span class="lc-box"></span>{{ l.name }}<b>{{ l.count }}</b>
          </button>
        </div>
      </div>

      <aside class="side-col">
        <div v-if="selected" class="card plot-detail">
          <div class="pd-head">
            <span class="pd-icon">{{ selected.type === '水产养殖' ? '💧' : selected.type === '畜禽养殖' ? '🐔' : selected.type === '设施大棚' ? '🏠' : '🌾' }}</span>
            <div>
              <h3>{{ selected.name }}</h3>
              <p class="tiny muted">{{ selected.id }} · {{ selected.park }}</p>
            </div>
            <StatusTag :status="selected.status" />
          </div>
          <div class="pd-grid">
            <div><span>当前作物</span><b>{{ selected.crop }}</b></div>
            <div><span>面积</span><b>{{ selected.area }} 亩</b></div>
            <div><span>生育期</span><b>{{ selected.stage }}</b></div>
            <div><span>定植日期</span><b>{{ selected.plant }}</b></div>
          </div>
          <div class="pd-actions">
            <el-button size="small" type="primary" plain @click="$router.push('/admin/env-monitor')">环境数据</el-button>
            <el-button size="small" @click="$router.push('/admin/control')">远程控制</el-button>
          </div>
          <div class="pd-devices">
            <h4>接入设备（{{ devicesOf(selected).length }}）</h4>
            <div v-for="d in devicesOf(selected).slice(0, 5)" :key="d.id" class="pd-dev">
              <span class="dev-dot" :class="{ off: !d.online }"></span>
              <span class="pd-dev-name">{{ d.name }}</span>
              <span class="tiny muted">{{ d.value }}</span>
            </div>
            <div v-if="!devicesOf(selected).length" class="tiny muted">暂无接入设备</div>
          </div>
        </div>

        <div class="card">
          <div class="card-head"><h3>园区空间统计</h3><span class="sub">按园区汇总</span></div>
          <div class="park-list">
            <div v-for="p in DB.parks" :key="p.id" class="park-item">
              <span class="park-mark"></span>
              <div class="park-main">
                <b>{{ p.name }}</b>
                <span>{{ p.plots }} 个地块 · {{ p.area }} 亩 · {{ p.crops }}</span>
              </div>
              <span class="park-num">{{ (p.area / 2610 * 100).toFixed(0) }}%</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Monitor, ZoomIn, ZoomOut } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import StatusTag from '@/components/StatusTag.vue'
import DB from '@/data/db'

const park = ref('')
const zoom = ref(1)
const selected = ref(DB.plots[0])
const mapWrap = ref(null)
const hover = ref(null)

const layout = [
  { id: 'DK-A01', x: 140, y: 270, w: 170, h: 100, rotate: -6, short: 'A01 连栋大棚', fill: '#cfe6c4' },
  { id: 'DK-A02', x: 130, y: 130, w: 150, h: 86, rotate: -4, short: 'A02 日光温室', fill: '#cfe6c4' },
  { id: 'DK-B01', x: 370, y: 220, w: 230, h: 130, rotate: 3, short: 'B01 露天大田', fill: '#e3edb7' },
  { id: 'DK-B02', x: 420, y: 372, w: 170, h: 92, rotate: -2, short: 'B02 大田', fill: '#f2e2b8' },
  { id: 'DK-C01', x: 650, y: 150, w: 130, h: 92, rotate: 5, short: 'C01 草莓园', fill: '#cfe6c4' },
  { id: 'DK-C02', x: 640, y: 270, w: 160, h: 80, rotate: 2, short: 'C02 叶菜基地', fill: '#dcebb8' },
  { id: 'DK-D01', x: 650, y: 380, w: 150, h: 82, rotate: -3, short: 'D01 水产塘', fill: '#c5dfe8' },
  { id: 'DK-E01', x: 340, y: 90, w: 120, h: 74, rotate: 4, short: 'E01 蛋鸡舍', fill: '#e8e0c4' }
]
const shapes = computed(() => layout.map(l => {
  const plot = DB.plots.find(p => p.id === l.id)
  return { ...l, plot, park: plot?.park, fill: plot?.status === '预警' ? '#f2e2b8' : l.fill, devices: DB.devices.filter(d => d.plot === l.id).length }
}))
const devicePoints = computed(() => {
  const out = []
  layout.forEach(l => {
    const ds = DB.devices.filter(d => d.plot === l.id)
    ds.forEach((d, i) => {
      out.push({
        id: d.id, name: d.name, value: d.value, online: d.online, plot: d.plot, inPark: park.value ? DB.plots.find(p => p.id === l.id)?.park === park.value : true,
        x: l.x + 24 + (i % 4) * 30, y: l.y + 30 + Math.floor(i / 4) * 26
      })
    })
  })
  return out
})

/* 鼠标悬浮时跟随显示地块 / 设备信息 */
function tipPosition(e) {
  const rect = mapWrap.value.getBoundingClientRect()
  const x = Math.min(Math.max(e.clientX - rect.left, 90), rect.width - 90)
  const y = Math.max(e.clientY - rect.top, 0)
  return { x, y }
}
function onPlotMove(p, e) {
  hover.value = { kind: 'plot', plot: p, ...tipPosition(e) }
}
function onDevMove(d, e) {
  hover.value = { kind: 'dev', dev: d, ...tipPosition(e) }
}

function layerOn(name) { return DB.layers.find(l => l.name === name)?.on }
function toggleLayer(l) { l.on = l.on ? 0 : 1 }
function devicesOf(plot) { return DB.devices.filter(d => d.plot === plot.id) }
function refresh() { ElMessage.success('地图数据已刷新') }
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.gis-layout { display: grid; grid-template-columns: 1.9fr 1fr; gap: 16px; }
.map-card { overflow: hidden; }
.map-toolbar { display: flex; align-items: center; gap: 8px; padding: 11px 14px; border-bottom: 1px solid var(--line); flex-wrap: wrap; }
.chips { display: flex; gap: 5px; flex-wrap: wrap; }
.map-toolbar .spacer { flex: 1; }
.map-wrap { position: relative; overflow: hidden; background: #f6f9f1; }
.gis-svg { width: 100%; height: auto; display: block; transition: transform .25s; transform-origin: center; }
.plot-shape { cursor: pointer; transition: opacity .2s; }
.plot-shape.dim { opacity: .28; }
.plot-shape rect { transition: stroke .15s, fill .2s; }
.plot-shape.on rect { stroke: #c28632; stroke-width: 3; }
.plot-shape:hover rect { stroke: #8fb87a; stroke-width: 3; }
.dev-point { cursor: pointer; transition: opacity .2s; }
.deco { pointer-events: none; }
.dev-point.dim { opacity: .25; }
.dev-point:hover circle:last-child { fill: #2f7a44; }
/* 地图流动性：河道水纹、设备呼吸、NDVI 扫描、作业轨迹、气象站浮动 */
.river-flow { stroke-dasharray: 14 12; animation: river-flow 3.2s linear infinite; }
@keyframes river-flow { to { stroke-dashoffset: -52; } }
.pulse-ring { transform-box: fill-box; transform-origin: center; animation: dev-pulse 2.4s ease-out infinite; }
@keyframes dev-pulse { 0% { transform: scale(.7); opacity: .8; } 100% { transform: scale(2.3); opacity: 0; } }
.ndvi-scan { transform-box: fill-box; animation: ndvi-scan 4s ease-in-out infinite alternate; }
@keyframes ndvi-scan { from { transform: translateY(0); } to { transform: translateY(108px); } }
.route-flow { stroke-dasharray: 8 7; animation: route-flow 4s linear infinite; }
@keyframes route-flow { to { stroke-dashoffset: -60; } }
.weather-float { animation: weather-float 5s ease-in-out infinite; }
@keyframes weather-float { 50% { transform: translate(420px, 144px); } }
.map-tip { position: absolute; transform: translate(-50%, -112%); min-width: 150px; padding: 8px 11px; border-radius: 9px; background: rgba(255, 255, 255, .97); border: 1px solid var(--line); box-shadow: 0 12px 26px rgba(40, 70, 45, .16); pointer-events: none; z-index: 6; font-size: 10.5px; color: var(--ink-500); }
.map-tip b { display: block; font-size: 11.5px; color: var(--brand-900); margin-bottom: 3px; }
.map-tip span { display: block; line-height: 1.6; }
.map-tip .tip-meta { color: var(--brand-600); margin-top: 2px; }
.map-legend { position: absolute; left: 12px; bottom: 10px; display: flex; gap: 12px; background: rgba(255,255,255,.9); border: 1px solid var(--line); border-radius: 20px; padding: 5px 12px; font-size: 9.5px; color: var(--ink-500); flex-wrap: wrap; }
.map-legend span { display: inline-flex; align-items: center; gap: 4px; }
.lg { width: 8px; height: 8px; border-radius: 2px; background: #cfe6c4; }
.lg.warn { background: #f2e2b8; }
.lg.device { background: #4f9a5b; border-radius: 50%; }
.lg.ndvi { background: rgba(116,168,104,.4); }
.layer-bar { display: flex; gap: 6px; padding: 10px 14px; border-top: 1px solid var(--line); flex-wrap: wrap; }
.layer-chip { display: inline-flex; align-items: center; gap: 5px; border: 1px solid var(--line); background: #fff; border-radius: 20px; padding: 4px 9px; font-size: 10.5px; color: var(--ink-400); cursor: pointer; }
.layer-chip .lc-box { width: 12px; height: 12px; border-radius: 3px; border: 1.5px solid var(--line-strong); position: relative; }
.layer-chip.on { color: var(--brand-700); border-color: var(--brand-200); background: var(--brand-50); }
.layer-chip.on .lc-box { background: var(--brand-600); border-color: var(--brand-600); }
.layer-chip b { font-weight: 500; color: var(--ink-300); }
.side-col { display: flex; flex-direction: column; gap: 14px; }
.plot-detail { padding: 16px 18px; }
.pd-head { display: flex; align-items: flex-start; gap: 10px; padding-bottom: 12px; border-bottom: 1px solid var(--line); }
.pd-icon { width: 38px; height: 38px; border-radius: 10px; background: var(--brand-50); display: grid; place-items: center; font-size: 19px; flex: 0 0 38px; }
.pd-head h3 { font-size: 14.5px; }
.pd-head > :last-child { margin-left: auto; }
.pd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px 12px; padding: 13px 0; }
.pd-grid span { display: block; font-size: 9.5px; color: var(--ink-400); }
.pd-grid b { font-size: 12px; font-weight: 500; }
.pd-actions { display: flex; gap: 7px; }
.pd-devices { border-top: 1px solid #f2f4ee; margin-top: 13px; padding-top: 11px; }
.pd-devices h4 { font-size: 11.5px; margin-bottom: 6px; color: var(--ink-700); }
.pd-dev { display: flex; align-items: center; gap: 7px; padding: 5px 0; font-size: 10.5px; color: var(--ink-500); }
.dev-dot { width: 6px; height: 6px; border-radius: 50%; background: #4f9a5b; flex: 0 0 6px; }
.dev-dot.off { background: var(--ink-300); }
.pd-dev-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.park-list { padding: 8px 16px 14px; }
.park-item { display: flex; gap: 9px; align-items: flex-start; padding: 9px 0; border-bottom: 1px solid #f2f4ee; }
.park-item:last-child { border-bottom: none; }
.park-mark { width: 7px; height: 7px; border-radius: 50%; background: var(--brand-400); margin-top: 6px; flex: 0 0 7px; }
.park-main { flex: 1; min-width: 0; }
.park-main b { display: block; font-size: 11.5px; }
.park-main span { display: block; font-size: 10px; color: var(--ink-400); }
.park-num { font-size: 12px; font-weight: 600; color: var(--brand-600); }
@media (max-width: 1180px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } .gis-layout { grid-template-columns: 1fr; } }
@media (max-width: 620px) { .stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; } .map-legend { position: static; border: none; background: transparent; padding: 8px 12px; } .pd-grid { grid-template-columns: 1fr 1fr; } }
</style>
