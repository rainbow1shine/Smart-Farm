<template>
  <div class="page-wrap">
    <PageHeader title="农事工单管理" sub="计划创建 / 派单 / 打卡 / 历史台账">
      <template #actions>
        <el-button :icon="Refresh" @click="refresh">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="createOpen = true">新建工单</el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="工单总量" :value="orders.length" unit="项" foot="本周期累计" icon="Calendar" />
      <StatCard label="执行中" :value="count('执行中')" unit="项" foot="现场作业中" icon="Loading" tone="info" />
      <StatCard label="待执行" :value="count('待执行')" unit="项" foot="今日需完成" icon="Timer" tone="warn" />
      <StatCard label="累计工时" :value="totalHours" unit="h" foot="已完成工单" icon="Odometer" />
    </div>

    <div class="toolbar card">
      <div class="chips">
        <button v-for="t in tabs" :key="t" class="chip" :class="{ on: tab === t }" @click="tab = t">{{ t }}</button>
      </div>
      <div class="progress-sum">
        <span>整体完成度</span>
        <el-progress :percentage="overall" :stroke-width="8" :show-text="false" />
        <b>{{ overall }}%</b>
      </div>
      <el-input v-model="keyword" placeholder="搜索工单号 / 标题 / 执行人" clearable class="search">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
    </div>

    <DataTable
      :columns="columns"
      :rows="rows"
      :filters="filters"
      :search-keys="['id', 'title', 'assignee', 'plot', 'type']"
      search-placeholder="搜索农事工单…"
      export-name="农事工单"
      :row-actions="rowActions"
      :action-width="170"
      @row-action="onAction"
      @refresh="refresh"
    />

    <div class="bottom-grid">
      <div class="card">
        <div class="card-head"><h3>工单类型分布</h3><span class="sub">按数量统计</span></div>
        <ChartBox title="" :option="typeOption" :height="240" />
      </div>
      <div class="card">
        <div class="card-head"><h3>今日现场打卡</h3><span class="sub">定位与工时记录</span></div>
        <div class="checkin-list">
          <div v-for="w in activeOrders.slice(0, 4)" :key="w.id" class="checkin-item">
            <span class="ci-dot"></span>
            <div class="ci-main">
              <b>{{ w.assignee }} · {{ w.title }}</b>
              <span>{{ plotName(w.plot) }} · 计划 {{ w.plan }}</span>
            </div>
            <el-button size="small" text type="primary" @click="checkIn(w)">打卡</el-button>
          </div>
          <div v-if="!activeOrders.length" class="empty-box" style="padding:26px">今日工单已全部完成</div>
        </div>
      </div>
    </div>

    <el-dialog v-model="createOpen" title="新建农事工单" width="620px" destroy-on-close>
      <el-form label-width="88px" label-position="left">
        <div class="form-grid">
          <el-form-item label="地块">
            <el-select v-model="form.plot" class="w-full">
              <el-option v-for="p in DB.plots" :key="p.id" :label="p.name + '（' + p.id + '）'" :value="p.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="form.type" class="w-full">
              <el-option v-for="t in types" :key="t" :label="t" :value="t" />
            </el-select>
          </el-form-item>
          <el-form-item label="执行人">
            <el-select v-model="form.assignee" class="w-full">
              <el-option v-for="u in farmers" :key="u.id" :label="u.name" :value="u.name" />
            </el-select>
          </el-form-item>
          <el-form-item label="计划日期">
            <el-date-picker v-model="form.plan" type="date" value-format="YYYY-MM-DD" class="w-full" />
          </el-form-item>
        </div>
        <el-form-item label="工单标题"><el-input v-model="form.title" placeholder="如：番茄结果期水肥一体化追肥" /></el-form-item>
        <el-form-item label="所需农资"><el-input v-model="form.material" placeholder="如：硫酸钾 12kg、磷酸一铵 6kg" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createOpen = false">取消</el-button>
        <el-button type="primary" @click="createWorkorder">创建并派单</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="detailOpen" title="工单详情" size="480px">
      <div v-if="current" class="wo-detail">
        <div class="wd-head">
          <div>
            <div class="wd-id">{{ current.id }}</div>
            <h3>{{ current.title }}</h3>
          </div>
          <StatusTag :status="current.status" />
        </div>
        <div class="wd-progress">
          <el-progress :percentage="current.progress" :stroke-width="10" />
          <span>已完成 {{ current.progress }}% · 累计工时 {{ current.hours }}h</span>
        </div>
        <div class="wd-list">
          <div class="wd-row"><span>地块</span><b>{{ plotName(current.plot) }}</b></div>
          <div class="wd-row"><span>类型</span><b>{{ current.type }}</b></div>
          <div class="wd-row"><span>执行人</span><b>{{ current.assignee }}</b></div>
          <div class="wd-row"><span>计划日期</span><b>{{ current.plan }}</b></div>
          <div class="wd-row"><span>所需农资</span><b>{{ current.material }}</b></div>
        </div>
        <div class="wd-block">
          <h4>执行记录</h4>
          <el-timeline>
            <el-timeline-item timestamp="2026-11-09 08:30" color="#4f7f56">创建工单并派发给 {{ current.assignee }}</el-timeline-item>
            <el-timeline-item v-if="current.progress > 0" timestamp="2026-11-09 10:15" color="#4f7f56">现场打卡，开始作业</el-timeline-item>
            <el-timeline-item v-if="current.progress >= 100" timestamp="2026-11-09 16:40" color="#c28632">作业完成，等待验收</el-timeline-item>
            <el-timeline-item v-else timestamp="待完成" color="#d3dacd">完成作业并提交验收</el-timeline-item>
          </el-timeline>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailOpen = false">关闭</el-button>
        <el-button v-if="current && current.progress < 100" type="primary" @click="checkIn(current)">现场打卡</el-button>
        <el-button v-if="current && current.progress < 100" type="success" plain @click="finish(current)">标记完成</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Plus, Search } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import DataTable from '@/components/DataTable.vue'
import ChartBox from '@/components/ChartBox.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useAdminStore } from '@/stores/admin'
import DB from '@/data/db'
import { dateOnly } from '@/utils/format'

const admin = useAdminStore()
const orders = computed(() => admin.workorders)
const tabs = ['全部', '待执行', '执行中', '已完成', '已验收']
const tab = ref('全部')
const keyword = ref('')
const types = ['施肥', '灌溉', '打药', '采收', '播种', '除草', '巡检', '投喂', '整枝']
const farmers = DB.users.filter(u => u.role === '农户')
const createOpen = ref(false)
const detailOpen = ref(false)
const current = ref(null)
const form = reactive({ plot: DB.plots[0].id, type: '施肥', assignee: '吴农户', plan: dateOnly(), title: '', material: '' })

const count = (s) => orders.value.filter(w => w.status === s).length
const totalHours = computed(() => orders.value.reduce((a, b) => a + b.hours, 0).toFixed(1))
const overall = computed(() => orders.value.length ? Math.round(orders.value.reduce((a, b) => a + b.progress, 0) / orders.value.length) : 0)
const activeOrders = computed(() => orders.value.filter(w => w.status !== '已完成' && w.status !== '已验收'))
const rows = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return orders.value.filter(w => {
    if (tab.value !== '全部' && w.status !== tab.value) return false
    if (!kw) return true
    return [w.id, w.title, w.assignee, w.plot, w.type].some(k => String(k ?? '').toLowerCase().includes(kw))
  })
})
const plotName = (id) => DB.plots.find(p => p.id === id)?.name || id

const columns = [
  { prop: 'id', label: '工单号', width: 150 },
  { prop: 'title', label: '工单标题', minWidth: 230 },
  { prop: 'type', label: '类型', width: 80 },
  { prop: 'plot', label: '地块', width: 110, formatter: (r) => plotName(r.plot) },
  { prop: 'assignee', label: '执行人', width: 90 },
  { prop: 'plan', label: '计划日期', width: 110 },
  { prop: 'progress', label: '进度', width: 140, type: 'progress' },
  { prop: 'hours', label: '工时', width: 70 },
  { prop: 'status', label: '状态', width: 90, type: 'tag' }
]
const filters = [
  { key: 'type', label: '工单类型', options: types.map(v => ({ label: v, value: v })) },
  { key: 'assignee', label: '执行人', options: farmers.map(u => ({ label: u.name, value: u.name })) }
]
const rowActions = [
  { key: 'view', label: '详情' },
  { key: 'checkin', label: '打卡', show: (r) => r.progress < 100 },
  { key: 'finish', label: '完成', show: (r) => r.progress < 100 },
  { key: 'accept', label: '验收', show: (r) => r.status === '已完成' }
]

function onAction({ action, row }) {
  current.value = row
  if (action === 'view') detailOpen.value = true
  if (action === 'checkin') checkIn(row)
  if (action === 'finish') finish(row)
  if (action === 'accept') {
    admin.update('workorders', row.id, { status: '已验收' })
    ElMessage.success('工单已验收')
  }
}
function checkIn(row) {
  admin.checkInWorkorder(row.id)
  ElMessage.success(`已打卡，当前进度 ${Math.min(100, row.progress + 20)}%`)
}
function finish(row) {
  admin.completeWorkorder(row.id)
  detailOpen.value = false
  ElMessage.success('工单已完成，等待验收')
}
function createWorkorder() {
  if (!form.title.trim()) return ElMessage.warning('请填写工单标题')
  admin.addWorkorder({ ...form, title: form.title.trim() })
  createOpen.value = false
  form.title = ''
  form.material = ''
  ElMessage.success('工单已创建并派发')
}
function refresh() { ElMessage.success('工单数据已刷新') }

const typeOption = {
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 22, top: 20, bottom: 26 },
  xAxis: { type: 'category', data: types.slice(0, 8), axisLabel: { fontSize: 10, color: '#8b998f' }, axisLine: { lineStyle: { color: '#dfe6d9' } } },
  yAxis: { type: 'value', splitLine: { lineStyle: { color: '#eef2e8' } }, axisLabel: { color: '#8b998f', fontSize: 10 } },
  series: [{ type: 'bar', barWidth: 18, data: types.slice(0, 8).map(t => orders.value.filter(w => w.type === t).length), itemStyle: { color: '#7ba37f', borderRadius: [5, 5, 0, 0] } }]
}
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.toolbar { display: flex; align-items: center; gap: 16px; padding: 11px 14px; margin-bottom: 14px; flex-wrap: wrap; }
.chips { display: flex; gap: 5px; flex-wrap: wrap; }
.progress-sum { display: flex; align-items: center; gap: 8px; font-size: 11.5px; color: var(--ink-400); min-width: 190px; }
.progress-sum .el-progress { width: 90px; }
.progress-sum b { color: var(--brand-700); }
.search { width: 240px; margin-left: auto; }
.bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
.checkin-list { padding: 8px 16px 12px; }
.checkin-item { display: flex; align-items: center; gap: 9px; padding: 9px 0; border-bottom: 1px solid #f2f4ee; }
.ci-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--brand-400); flex: 0 0 6px; }
.ci-main { flex: 1; min-width: 0; }
.ci-main b { display: block; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ci-main span { font-size: 10.5px; color: var(--ink-400); }
.wd-head { display: flex; justify-content: space-between; gap: 12px; padding-bottom: 14px; border-bottom: 1px solid var(--line); }
.wd-id { font-size: 11px; color: var(--ink-400); font-family: ui-monospace, Consolas, monospace; }
.wd-head h3 { font-size: 16px; margin-top: 3px; }
.wd-progress { padding: 14px 0; border-bottom: 1px solid #f2f4ee; }
.wd-progress span { display: block; font-size: 11px; color: var(--ink-400); margin-top: 6px; }
.wd-list { padding: 8px 0; border-bottom: 1px solid #f2f4ee; }
.wd-row { display: flex; justify-content: space-between; gap: 14px; padding: 7px 0; font-size: 12.5px; color: var(--ink-500); }
.wd-row b { color: var(--ink-900); font-weight: 500; }
.wd-block { padding-top: 14px; }
.wd-block h4 { font-size: 13px; margin-bottom: 10px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
@media (max-width: 1100px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } .bottom-grid { grid-template-columns: 1fr; } }
@media (max-width: 700px) { .stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; } .form-grid { grid-template-columns: 1fr; } .search { width: 100%; margin-left: 0; } }
</style>
