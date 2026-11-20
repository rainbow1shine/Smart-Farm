<template>
  <div class="page-wrap">
    <PageHeader title="远程控制" sub="手动控制 / 自动联动 / 定时任务 / 分组控制">
      <template #actions>
        <el-tag :type="auth.online ? 'success' : 'info'" effect="light" round>{{ auth.online ? '后端已连接' : '演示模式' }}</el-tag>
        <el-button :icon="Refresh" @click="refresh">刷新</el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="可控设备" :value="executors.length" unit="台" foot="执行器 / 水泵 / 风机" icon="Switch" />
      <StatCard label="运行中" :value="executors.filter(d => d.status === '运行').length" unit="台" foot="实时状态" icon="VideoPlay" tone="info" />
      <StatCard label="自动策略" :value="admin.strategies.filter(s => s.on).length" unit="条" foot="已启用联动" icon="MagicStick" />
      <StatCard label="今日操作" :value="admin.controlLogs.length" unit="次" foot="手动 + 自动" icon="Clock" tone="warn" />
    </div>

    <div class="tabs-bar card">
      <div class="tabs">
        <button v-for="t in tabs" :key="t.key" class="tab" :class="{ on: tab === t.key }" @click="tab = t.key">{{ t.label }}</button>
      </div>
      <span class="tiny muted">远程控制指令会记录操作日志，关键设备建议绑定自动策略</span>
    </div>

    <template v-if="tab === 'device'">
      <div class="device-groups">
        <div v-for="g in groups" :key="g.name" class="card group-card">
          <div class="card-head"><h3>{{ g.name }}</h3><span class="sub">{{ g.items.length }} 台设备</span></div>
          <div class="ctrl-grid">
            <div v-for="d in g.items" :key="d.id" class="ctrl-card" :class="{ running: d.status === '运行', offline: !d.online }">
              <div class="cc-head">
                <span class="cc-ico">{{ iconOf(d.sub) }}</span>
                <div>
                  <b>{{ d.name }}</b>
                  <span>{{ d.plot }} · {{ d.sub }}</span>
                </div>
                <span class="cc-dot" :class="{ off: !d.online }"></span>
              </div>
              <div class="cc-value">{{ d.value }}</div>
              <div class="cc-foot">
                <span>{{ d.online ? '在线' : '离线' }} · {{ d.last.slice(5) }}</span>
                <el-switch :model-value="d.status === '运行'" :disabled="!d.online" @change="(v) => toggle(d, v)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="tab === 'strategy'">
      <div class="card">
        <div class="card-head"><h3>自动联动策略</h3><span class="sub">条件触发后自动执行</span><div class="acts"><el-button text type="primary" :icon="Plus" @click="addStrategy">新增策略</el-button></div></div>
        <el-table :data="admin.strategies" stripe>
          <el-table-column prop="name" label="策略名称" min-width="180" />
          <el-table-column prop="plot" label="地块" width="100" />
          <el-table-column prop="cond" label="触发条件" min-width="220" />
          <el-table-column prop="act" label="执行动作" min-width="260" />
          <el-table-column prop="last" label="最近触发" width="150" />
          <el-table-column label="启用" width="90">
            <template #default="{ row }"><el-switch :model-value="!!row.on" @change="admin.toggleStrategy(row.id)" /></template>
          </el-table-column>
        </el-table>
      </div>
    </template>

    <template v-else-if="tab === 'timer'">
      <div class="timer-grid">
        <div v-for="t in admin.timers" :key="t.id" class="card timer-card" :class="{ off: !t.on }">
          <div class="tc-head"><span class="tc-cron">{{ t.cron }}</span><el-switch :model-value="!!t.on" @change="admin.toggleTimer(t.id)" /></div>
          <h3>{{ t.name }}</h3>
          <p>{{ t.act }}</p>
          <div class="tc-foot"><span>{{ t.plot }}</span><StatusTag :status="t.on ? '运行' : '停止'" /></div>
        </div>
        <button class="card add-timer" @click="addTimer"><el-icon><Plus /></el-icon><span>新建定时任务</span></button>
      </div>
    </template>

    <template v-else-if="tab === 'scene'">
      <div class="scene-grid">
        <div v-for="s in DB.scenes" :key="s.name" class="card scene-card">
          <div class="sc-head"><span class="sc-icon">🌿</span><div><h3>{{ s.name }}</h3><p>{{ s.desc }}</p></div></div>
          <div class="sc-params">
            <div><span>温度</span><b>{{ s.temp }}</b></div>
            <div><span>湿度</span><b>{{ s.hum }}</b></div>
            <div><span>光照</span><b>{{ s.light }}</b></div>
          </div>
          <el-button class="w-full" type="primary" plain @click="applyScene(s)">一键应用场景</el-button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="card">
        <div class="card-head"><h3>控制日志</h3><span class="sub">设备操作与自动执行记录</span></div>
        <el-table :data="admin.controlLogs" stripe>
          <el-table-column prop="time" label="时间" width="150" />
          <el-table-column prop="who" label="操作人" width="110" />
          <el-table-column prop="dev" label="设备" min-width="170" />
          <el-table-column prop="action" label="动作" width="90" />
          <el-table-column prop="mode" label="控制方式" width="120" />
          <el-table-column prop="result" label="结果" width="140">
            <template #default="{ row }"><StatusTag :status="row.result.includes('成功') ? '成功' : '失败'" /><span class="result-text">{{ row.result }}</span></template>
          </el-table-column>
        </el-table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Plus } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useAdminStore } from '@/stores/admin'
import { useAuthStore } from '@/stores/auth'
import DB from '@/data/db'
import { dateTime } from '@/utils/format'

const admin = useAdminStore()
const auth = useAuthStore()
const tabs = [
  { key: 'device', label: '设备控制' },
  { key: 'strategy', label: '联动策略' },
  { key: 'timer', label: '定时任务' },
  { key: 'scene', label: '场景模板' },
  { key: 'log', label: '操作日志' }
]
const tab = ref('device')
const executors = computed(() => admin.devices.filter(d => d.type === '执行器'))
const groups = computed(() => {
  const map = {}
  executors.value.forEach(d => { (map[d.sub] ||= []).push(d) })
  return Object.entries(map).map(([name, items]) => ({ name, items }))
})
const iconOf = (sub) => ({ 电磁阀: '💧', 遮阳帘: '☀️', 风机: '🌀', 补光灯: '💡', 水泵: '⛲', 增氧机: '🫧', 加温设备: '🔥', 卷帘: '🧵' }[sub] || '⚙️')

async function toggle(d, on) {
  try {
    await ElMessageBox.confirm(`确定${on ? '开启' : '关闭'}「${d.name}」？指令将立即下发。`, '远程控制', { type: 'warning' })
    admin.controlDevice(d.id, on ? 'on' : 'off')
    ElMessage.success(`${d.name} 已${on ? '开启' : '关闭'}`)
  } catch {}
}
async function addStrategy() {
  try {
    const { value } = await ElMessageBox.prompt('输入策略名称，例如「高温自动通风」', '新增联动策略', {
      inputPlaceholder: '策略名称',
      confirmButtonText: '创建',
      cancelButtonText: '取消',
      inputValidator: (v) => (String(v || '').trim() ? true : '请输入策略名称')
    })
    const name = String(value).trim()
    admin.strategies.unshift({
      id: 'ST-' + Date.now(),
      name,
      plot: 'DK-A01',
      cond: '温度 > 30℃',
      act: '开启环流风机，10 分钟后复查',
      last: '—',
      on: true
    })
    admin.save()
    ElMessage.success(`策略「${name}」已创建并启用`)
  } catch {}
}
async function addTimer() {
  try {
    const { value } = await ElMessageBox.prompt('输入定时任务名称，例如「傍晚补光」', '新建定时任务', {
      inputPlaceholder: '任务名称',
      confirmButtonText: '创建',
      cancelButtonText: '取消',
      inputValidator: (v) => (String(v || '').trim() ? true : '请输入任务名称')
    })
    const name = String(value).trim()
    admin.timers.unshift({
      id: 'TM-' + Date.now(),
      cron: '每日 18:00',
      name,
      act: '开启 LED 补光灯 90 分钟后自动关闭',
      plot: 'DK-A01',
      on: true
    })
    admin.save()
    ElMessage.success(`定时任务「${name}」已创建`)
  } catch {}
}
function applyScene(s) {
  ElMessage.success(`已应用「${s.name}」：温度 ${s.temp}、湿度 ${s.hum}`)
  admin.logs.unshift({ time: dateTime(), user: '当前用户', role: '农户', ip: '10.20.3.41', action: `应用场景模板「${s.name}」`, type: '操作日志', result: '成功' })
  admin.save()
}
function refresh() { ElMessage.success('设备状态已刷新') }
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.tabs-bar { display: flex; align-items: center; gap: 12px; padding: 10px 14px; margin-bottom: 14px; flex-wrap: wrap; }
.tabs { display: flex; gap: 4px; flex-wrap: wrap; }
.tab { border: none; background: transparent; padding: 7px 13px; border-radius: 8px; font-size: 12.5px; color: var(--ink-500); cursor: pointer; }
.tab:hover { background: var(--brand-50); color: var(--brand-700); }
.tab.on { background: var(--brand-600); color: #fff; font-weight: 600; }
.tabs-bar .muted { margin-left: auto; }
.device-groups { display: flex; flex-direction: column; gap: 14px; }
.ctrl-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 14px 16px 18px; }
.ctrl-card { border: 1px solid var(--line); border-radius: 12px; padding: 12px 13px; background: var(--bg-soft); transition: border-color .15s; }
.ctrl-card.running { border-color: var(--brand-200); background: #f7fbf3; }
.ctrl-card.offline { opacity: .62; }
.cc-head { display: flex; align-items: flex-start; gap: 8px; }
.cc-ico { font-size: 20px; width: 30px; height: 30px; border-radius: 8px; background: #fff; display: grid; place-items: center; flex: 0 0 30px; }
.cc-head b { display: block; font-size: 12px; line-height: 1.4; }
.cc-head span { font-size: 9.5px; color: var(--ink-400); }
.cc-dot { margin-left: auto; width: 7px; height: 7px; border-radius: 50%; background: #4f9a5b; flex: 0 0 7px; margin-top: 3px; }
.cc-dot.off { background: var(--ink-300); }
.cc-value { font-size: 11px; color: var(--brand-700); background: #fff; border-radius: 6px; padding: 5px 7px; margin: 9px 0; }
.cc-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 9.5px; color: var(--ink-400); }
.timer-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.timer-card { padding: 15px 16px; }
.timer-card.off { opacity: .68; }
.tc-head { display: flex; align-items: center; justify-content: space-between; }
.tc-cron { font-size: 10px; color: var(--brand-700); background: var(--brand-50); border: 1px solid var(--brand-100); border-radius: 20px; padding: 2px 8px; }
.timer-card h3 { font-size: 14px; margin: 11px 0 4px; }
.timer-card p { font-size: 11.5px; color: var(--ink-500); line-height: 1.6; min-height: 36px; }
.tc-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; font-size: 10.5px; color: var(--ink-400); }
.add-timer { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; min-height: 160px; border: 1px dashed var(--line-strong); background: transparent; color: var(--ink-400); font-size: 12px; cursor: pointer; }
.add-timer .el-icon { font-size: 23px; }
.add-timer:hover { border-color: var(--brand-300); color: var(--brand-600); }
.scene-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.scene-card { padding: 16px 18px; }
.sc-head { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 14px; }
.sc-icon { width: 38px; height: 38px; border-radius: 10px; background: var(--brand-50); display: grid; place-items: center; font-size: 19px; flex: 0 0 38px; }
.sc-head h3 { font-size: 14.5px; }
.sc-head p { font-size: 11px; color: var(--ink-400); line-height: 1.6; margin-top: 2px; }
.sc-params { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 14px; }
.sc-params > div { background: var(--bg-soft); border-radius: 8px; padding: 8px 9px; text-align: center; }
.sc-params span { display: block; font-size: 9.5px; color: var(--ink-400); }
.sc-params b { font-size: 12px; color: var(--ink-900); }
.result-text { margin-left: 4px; font-size: 10.5px; color: var(--ink-400); }
@media (max-width: 1180px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } .ctrl-grid { grid-template-columns: repeat(2, 1fr); } .timer-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 700px) { .stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; } .ctrl-grid { grid-template-columns: 1fr; } .timer-grid { grid-template-columns: 1fr; } .scene-grid { grid-template-columns: 1fr; } .tabs-bar .muted { margin-left: 0; } }
</style>
