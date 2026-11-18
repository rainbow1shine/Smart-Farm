<template>
  <div class="page-wrap">
    <PageHeader title="告警消息中心" sub="多类型告警分级与闭环处置">
      <template #actions>
        <el-button :icon="Refresh" @click="refresh">刷新</el-button>
        <el-button type="primary" :icon="Bell" @click="handleAll">全部标记已读</el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="告警总量" :value="alarms.length" unit="条" foot="近 7 日累计" icon="Bell" />
      <StatCard label="紧急告警" :value="countLevel('紧急')" unit="条" foot="需立即处置" icon="Warning" tone="danger" />
      <StatCard label="待处置" :value="pending.length" unit="条" foot="含处置中" icon="Timer" tone="warn" />
      <StatCard label="已闭环" :value="closed.length" unit="条" foot="闭环率 57%" icon="CircleCheck" tone="info" />
    </div>

    <div class="alarm-grid">
      <div class="card">
        <div class="card-head"><h3>告警类型分布</h3><span class="sub">按类型统计</span></div>
        <ChartBox title="" :option="typeOption" :height="235" />
      </div>
      <div class="card">
        <div class="card-head"><h3>告警等级</h3><span class="sub">紧急优先处置</span></div>
        <div class="level-list">
          <div v-for="l in levels" :key="l.name" class="level-row">
            <span class="lv-dot" :class="l.name"></span>
            <span class="lv-name">{{ l.name }}</span>
            <div class="lv-bar"><i :class="l.name" :style="{ width: Math.round(l.count / alarms.length * 100) + '%' }"></i></div>
            <b>{{ l.count }}</b>
          </div>
        </div>
        <div class="level-tip"><el-icon><InfoFilled /></el-icon>紧急告警 10 分钟内未处置将升级短信通知值班人员。</div>
      </div>
    </div>

    <div class="tabs-bar card">
      <div class="tabs">
        <button v-for="t in tabs" :key="t" class="tab" :class="{ on: tab === t }" @click="tab = t">{{ t }}</button>
      </div>
      <el-input v-model="keyword" placeholder="搜索告警编号 / 设备 / 描述" clearable class="search">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
    </div>

    <div class="alarm-list">
      <article v-for="a in shown" :key="a.id" class="alarm-item card" :class="a.level">
        <div class="ai-level">{{ a.level }}</div>
        <div class="ai-main">
          <div class="ai-head">
            <b>{{ a.target }}</b>
            <StatusTag :status="a.status" />
            <span class="ai-id">{{ a.id }}</span>
          </div>
          <p>{{ a.desc }}</p>
          <div class="ai-meta">
            <span><el-icon><Clock /></el-icon>{{ a.time }}</span>
            <span><el-icon><Location /></el-icon>{{ a.plot }}</span>
            <span class="type-tag">{{ a.type }}</span>
            <span v-if="a.handler" class="handled">处置人：{{ a.handler }} · {{ a.handledAt }}</span>
          </div>
          <div v-if="a.note" class="ai-note">处置记录：{{ a.note }}</div>
        </div>
        <div class="ai-acts">
          <el-button size="small" @click="openDetail(a)">详情</el-button>
          <el-button v-if="a.status !== '已闭环' && a.status !== '已处置'" size="small" type="primary" @click="openHandle(a)">立即处置</el-button>
          <el-button v-else size="small" text @click="openDetail(a)">查看闭环</el-button>
        </div>
      </article>
      <div v-if="!shown.length" class="card empty-box"><div class="icon">🔔</div><div>暂无匹配告警</div></div>
    </div>

    <el-dialog v-model="handleOpen" title="告警处置" width="560px" destroy-on-close>
      <div v-if="current" class="handle-box">
        <div class="hb-head">
          <span class="hb-level" :class="current.level">{{ current.level }}</span>
          <div><b>{{ current.target }}</b><p>{{ current.desc }}</p></div>
        </div>
        <el-form label-width="88px" label-position="left" class="mt-16">
          <el-form-item label="处置方式">
            <el-radio-group v-model="handleForm.status">
              <el-radio label="已处置">现场处置</el-radio>
              <el-radio label="已闭环">确认闭环</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="处置说明">
            <el-input v-model="handleForm.note" type="textarea" :rows="4" placeholder="填写处置过程、更换配件、复测结果等…" />
          </el-form-item>
        </el-form>
        <div class="hb-tip"><el-icon><InfoFilled /></el-icon>处置完成后请复测设备状态，确保告警不再重复上报。</div>
      </div>
      <template #footer>
        <el-button @click="handleOpen = false">取消</el-button>
        <el-button type="primary" @click="submitHandle">提交处置</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="detailOpen" title="告警详情" size="460px">
      <div v-if="current" class="ad">
        <div class="ad-head">
          <span class="ad-level" :class="current.level">{{ current.level }}</span>
          <div><h3>{{ current.target }}</h3><p>{{ current.id }} · {{ current.type }}</p></div>
          <StatusTag :status="current.status" />
        </div>
        <div class="ad-block"><h4>告警描述</h4><p>{{ current.desc }}</p></div>
        <div class="ad-list">
          <div class="ad-row"><span>告警时间</span><b>{{ current.time }}</b></div>
          <div class="ad-row"><span>发生位置</span><b>{{ current.plot }}</b></div>
          <div class="ad-row"><span>告警类型</span><b>{{ current.type }}</b></div>
          <div class="ad-row"><span>处置人</span><b>{{ current.handler || '—' }}</b></div>
          <div class="ad-row"><span>处置时间</span><b>{{ current.handledAt || '—' }}</b></div>
        </div>
        <div class="ad-block"><h4>处置记录</h4><p>{{ current.note || '尚未处置，请尽快安排人员现场核查。' }}</p></div>
        <div class="ad-block">
          <h4>处置进度</h4>
          <el-timeline>
            <el-timeline-item :timestamp="current.time" color="#c65b4e">系统触发告警</el-timeline-item>
            <el-timeline-item timestamp="08:58" color="#c98a2e">推送值班人员</el-timeline-item>
            <el-timeline-item v-if="current.handledAt" :timestamp="current.handledAt" color="#4f7f56">已处置 · {{ current.handler }}</el-timeline-item>
            <el-timeline-item v-else timestamp="待处置" color="#d3dacd">现场核查与闭环</el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Bell, Search, InfoFilled, Clock, Location } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import ChartBox from '@/components/ChartBox.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()
const alarms = computed(() => admin.alarms)
const pending = computed(() => alarms.value.filter(a => a.status !== '已闭环' && a.status !== '已处置'))
const closed = computed(() => alarms.value.filter(a => a.status === '已闭环' || a.status === '已处置'))
const countLevel = (l) => alarms.value.filter(a => a.level === l).length
const levels = computed(() => ['紧急', '重要', '一般'].map(name => ({ name, count: countLevel(name) })))
const tabs = ['全部', '待处置', '处置中', '已处置', '已闭环']
const tab = ref('全部')
const keyword = ref('')
const shown = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return alarms.value.filter(a => {
    if (tab.value !== '全部' && a.status !== tab.value) return false
    if (!kw) return true
    return [a.id, a.target, a.desc, a.plot, a.type].some(k => String(k ?? '').toLowerCase().includes(kw))
  })
})
const handleOpen = ref(false)
const detailOpen = ref(false)
const current = ref(null)
const handleForm = reactive({ status: '已处置', note: '' })

const typeOption = {
  tooltip: { trigger: 'axis' },
  grid: { left: 96, right: 30, top: 14, bottom: 20 },
  xAxis: { type: 'value', axisLabel: { color: '#8b998f', fontSize: 10 }, splitLine: { lineStyle: { color: '#eef2e8' } } },
  yAxis: { type: 'category', data: ['灾害预警', '库存不足', '离线掉线', '环境超限', '设备故障', '传感器异常'], axisLabel: { color: '#66756c', fontSize: 10 } },
  series: [{ type: 'bar', barWidth: 13, data: [1, 1, 1, 1, 2, 1], itemStyle: { color: '#c28632', borderRadius: 6 }, label: { show: true, position: 'right', fontSize: 10, color: '#66756c' } }]
}

function openHandle(a) {
  current.value = a
  handleForm.status = '已处置'
  handleForm.note = ''
  handleOpen.value = true
}
function openDetail(a) { current.value = a; detailOpen.value = true }
function submitHandle() {
  if (!handleForm.note.trim()) return ElMessage.warning('请填写处置说明')
  admin.handleAlarm(current.value.id, handleForm.note.trim(), handleForm.status)
  handleOpen.value = false
  ElMessage.success('处置记录已提交，告警状态已更新')
}
function handleAll() {
  const list = pending.value
  if (!list.length) return ElMessage.info('暂无待处置告警')
  list.forEach(a => admin.handleAlarm(a.id, '批量确认处置', '已处置'))
  ElMessage.success(`已处置 ${list.length} 条告警`)
}
function refresh() { ElMessage.success('告警数据已刷新') }
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.alarm-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 14px; margin-bottom: 14px; }
.level-list { padding: 12px 20px 8px; display: flex; flex-direction: column; gap: 14px; }
.level-row { display: flex; align-items: center; gap: 9px; font-size: 12px; color: var(--ink-500); }
.lv-dot { width: 8px; height: 8px; border-radius: 50%; background: #c28632; }
.lv-dot.紧急 { background: #c65b4e; }
.lv-dot.重要 { background: #c98a2e; }
.lv-dot.一般 { background: #7ba37f; }
.lv-name { width: 40px; }
.lv-bar { flex: 1; height: 7px; border-radius: 4px; background: #f0f3ea; overflow: hidden; }
.lv-bar i { display: block; height: 100%; border-radius: 4px; background: #c28632; }
.lv-bar i.紧急 { background: #c65b4e; }
.lv-bar i.重要 { background: #c98a2e; }
.lv-bar i.一般 { background: #7ba37f; }
.level-row b { width: 20px; text-align: right; color: var(--ink-700); }
.level-tip { display: flex; gap: 7px; margin: 0 20px 18px; padding: 9px 11px; border-radius: 8px; background: #fdf5e7; color: #8a672c; font-size: 10.5px; line-height: 1.65; }
.tabs-bar { display: flex; align-items: center; gap: 12px; padding: 10px 14px; margin-bottom: 14px; flex-wrap: wrap; }
.tabs { display: flex; gap: 4px; flex-wrap: wrap; }
.tab { border: none; background: transparent; padding: 7px 12px; border-radius: 8px; font-size: 12.5px; color: var(--ink-500); cursor: pointer; }
.tab:hover { background: var(--brand-50); color: var(--brand-700); }
.tab.on { background: var(--brand-600); color: #fff; font-weight: 600; }
.search { width: 260px; margin-left: auto; }
.alarm-list { display: flex; flex-direction: column; gap: 10px; }
.alarm-item { display: flex; align-items: flex-start; gap: 14px; padding: 15px 18px; border-left: 3px solid #d9b26a; }
.alarm-item.紧急 { border-left-color: #c65b4e; }
.alarm-item.重要 { border-left-color: #c98a2e; }
.ai-level { font-size: 10px; padding: 3px 7px; border-radius: 5px; background: #fbf1df; color: #a86c18; flex: 0 0 auto; margin-top: 2px; }
.alarm-item.紧急 .ai-level { background: #fbe9e6; color: #b84d40; }
.ai-main { flex: 1; min-width: 0; }
.ai-head { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.ai-head b { font-size: 13.5px; }
.ai-id { font-size: 10.5px; color: var(--ink-300); font-family: ui-monospace, Consolas, monospace; }
.ai-main p { font-size: 12.5px; color: var(--ink-500); line-height: 1.65; margin: 5px 0 7px; }
.ai-meta { display: flex; align-items: center; gap: 14px; font-size: 10.5px; color: var(--ink-400); flex-wrap: wrap; }
.ai-meta span { display: inline-flex; align-items: center; gap: 3px; }
.type-tag { background: var(--bg-soft); border: 1px solid var(--line); border-radius: 20px; padding: 1px 7px; }
.handled { color: var(--brand-600); }
.ai-note { margin-top: 7px; font-size: 11.5px; color: var(--brand-700); background: var(--brand-50); border-radius: 7px; padding: 6px 9px; }
.ai-acts { display: flex; flex-direction: column; gap: 6px; flex: 0 0 auto; }
.ai-acts .el-button + .el-button { margin-left: 0; }
.hb-head { display: flex; gap: 10px; align-items: flex-start; padding-bottom: 12px; border-bottom: 1px solid var(--line); }
.hb-level { font-size: 10px; padding: 3px 8px; border-radius: 5px; background: #fbf1df; color: #a86c18; flex: 0 0 auto; }
.hb-level.紧急 { background: #fbe9e6; color: #b84d40; }
.hb-head b { font-size: 14px; }
.hb-head p { font-size: 12px; color: var(--ink-500); margin-top: 3px; }
.hb-tip { display: flex; gap: 7px; padding: 9px 11px; border-radius: 8px; background: var(--brand-50); color: var(--brand-700); font-size: 11px; line-height: 1.65; }
.ad-head { display: flex; align-items: flex-start; gap: 10px; padding-bottom: 14px; border-bottom: 1px solid var(--line); }
.ad-level { font-size: 10px; padding: 3px 8px; border-radius: 5px; background: #fbf1df; color: #a86c18; }
.ad-level.紧急 { background: #fbe9e6; color: #b84d40; }
.ad-head > div { flex: 1; }
.ad-head h3 { font-size: 16px; }
.ad-head p { font-size: 11px; color: var(--ink-400); margin-top: 2px; }
.ad-block { padding: 13px 0; border-bottom: 1px solid #f2f4ee; }
.ad-block h4 { font-size: 12.5px; margin-bottom: 7px; }
.ad-block p { font-size: 12.5px; color: var(--ink-500); line-height: 1.75; }
.ad-list { padding: 8px 0; border-bottom: 1px solid #f2f4ee; }
.ad-row { display: flex; justify-content: space-between; gap: 14px; padding: 6px 0; font-size: 12px; color: var(--ink-500); }
.ad-row b { color: var(--ink-900); font-weight: 500; }
@media (max-width: 1100px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } .alarm-grid { grid-template-columns: 1fr; } }
@media (max-width: 700px) { .stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; } .alarm-item { flex-direction: column; gap: 8px; } .ai-acts { flex-direction: row; } .search { width: 100%; margin-left: 0; } }
</style>
