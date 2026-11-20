<template>
  <div class="admin-page page-wrap">
    <component v-if="meta.custom && customMap[meta.custom]" :is="customMap[meta.custom]" />
    <template v-else>
      <PageHeader :title="meta.title" :sub="meta.sub">
        <template #actions>
          <el-button v-if="config?.actions" v-for="a in config.actions" :key="a.key" :type="a.type || 'primary'" :icon="Plus" @click="openCreate(a)">{{ a.label }}</el-button>
          <el-button :icon="Refresh" @click="refresh">刷新</el-button>
          <el-button :icon="Monitor" @click="$router.push('/screen')">大屏</el-button>
        </template>
      </PageHeader>

      <div v-if="!config" class="card empty-box">
        <div class="icon">🌾</div>
        <div>该页面正在建设中</div>
      </div>

      <template v-else>
        <div v-if="config.stats?.length" class="stat-grid">
          <StatCard v-for="s in config.stats" :key="s.label" v-bind="s" />
        </div>

        <div v-if="config.notices?.length" class="notice-list">
          <div v-for="(n, i) in config.notices" :key="i" class="notice-item" :class="n.tone || 'info'">
            <el-icon><InfoFilled /></el-icon>
            <span>{{ n.text }}</span>
          </div>
        </div>

        <div v-if="config.charts?.length" class="chart-grid">
          <div v-for="(c, i) in config.charts" :key="i" :class="'span-' + (c.span || 2)">
            <ChartBox :title="c.title" :sub="c.sub" :option="c.option" :height="c.height || 270" />
          </div>
        </div>

        <DataTable
          :columns="config.columns"
          :rows="rows"
          :filters="config.filters || []"
          :row-actions="config.rowActions || []"
          :search-keys="config.searchKeys || []"
          :search-placeholder="`搜索${meta.title}…`"
          :export-name="meta.title"
          :action-width="actionWidth"
          @row-action="onRowAction"
          @refresh="refresh"
        />
      </template>
    </template>

    <el-drawer v-model="detailOpen" :title="detailTitle" size="480px">
      <div v-if="detailRow" class="detail-list">
        <div v-for="(v, k) in detailRow" :key="k" class="detail-row">
          <span class="dk">{{ labelOf(k) }}</span>
          <span class="dv">{{ displayValue(v) }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailOpen = false">关闭</el-button>
        <el-button type="primary" @click="startEdit(detailRow)">编辑</el-button>
      </template>
    </el-drawer>

    <el-dialog v-model="editOpen" :title="editTitle" width="620px" destroy-on-close>
      <el-form label-width="92px" label-position="left">
        <el-form-item v-for="f in editFields" :key="f.key" :label="f.label">
          <el-input v-if="f.type !== 'textarea'" v-model="editForm[f.key]" :placeholder="f.placeholder || ''" />
          <el-input v-else v-model="editForm[f.key]" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editOpen = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="actionOpen" :title="actionTitle" width="520px" destroy-on-close>
      <el-form label-width="92px" label-position="left">
        <el-form-item v-for="f in actionFields" :key="f.key" :label="f.label">
          <el-select v-if="f.type === 'select'" v-model="actionForm[f.key]" class="w-full">
            <el-option v-for="o in f.options" :key="o" :label="o" :value="o" />
          </el-select>
          <el-input v-else v-model="actionForm[f.key]" :type="f.type === 'textarea' ? 'textarea' : 'text'" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="actionOpen = false">取消</el-button>
        <el-button type="primary" @click="submitAction">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Monitor } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import ChartBox from '@/components/ChartBox.vue'
import DataTable from '@/components/DataTable.vue'
import { useAdminStore } from '@/stores/admin'
import { getPageConfig, getPageMeta } from '@/data/adminPages'

import Dashboard from './Dashboard.vue'
import UserManage from './UserManage.vue'
import RoleManage from './RoleManage.vue'
import PermManage from './PermManage.vue'
import ParamManage from './ParamManage.vue'
import DeviceManage from './DeviceManage.vue'
import CollectManage from './CollectManage.vue'
import BackupManage from './BackupManage.vue'
import RepairManage from './RepairManage.vue'
import ReviewManage from './ReviewManage.vue'
import GoodsManage from './GoodsManage.vue'
import ConsumerManage from './ConsumerManage.vue'
import ExpertEnv from './ExpertEnv.vue'
import PestDiagnosis from './PestDiagnosis.vue'
import OrderManage from './OrderManage.vue'
import SalesReport from './SalesReport.vue'
import WorkOrders from './WorkOrders.vue'
import InputManage from './InputManage.vue'
import TraceEntry from './TraceEntry.vue'
import EnvMonitor from './EnvMonitor.vue'
import VideoMonitor from './VideoMonitor.vue'
import Control from './Control.vue'
import AlarmCenter from './AlarmCenter.vue'
import GisMap from './GisMap.vue'
import AiAnalysis from './AiAnalysis.vue'
import DataReport from './DataReport.vue'
import Consult from './Consult.vue'
import MallEntry from './MallEntry.vue'

const route = useRoute()
const admin = useAdminStore()
const customMap = {
  Dashboard, UserManage, RoleManage, PermManage, ParamManage, DeviceManage, CollectManage, BackupManage,
  RepairManage, ReviewManage, GoodsManage, ConsumerManage, ExpertEnv, PestDiagnosis, OrderManage,
  SalesReport, WorkOrders, InputManage, TraceEntry, EnvMonitor, VideoMonitor, Control, AlarmCenter,
  GisMap, AiAnalysis, DataReport, Consult, MallEntry
}

const meta = computed(() => getPageMeta(route.params.page))
const config = computed(() => getPageConfig(route.params.page, admin))
const rows = computed(() => config.value?.rows?.() || [])
const actionWidth = computed(() => {
  const n = config.value?.rowActions?.length || 0
  return Math.max(100, n * 58 + 20)
})

const detailOpen = ref(false)
const detailRow = ref(null)
const detailTitle = ref('详情')
const editOpen = ref(false)
const editTitle = ref('编辑')
const editForm = reactive({})
const editFields = ref([])
const actionOpen = ref(false)
const actionTitle = ref('操作')
const actionForm = reactive({})
const actionFields = ref([])
let pendingAction = null

function refresh() { ElMessage.success('数据已刷新') }
function onRowAction({ action, row }) {
  if (action === 'view' || action === 'report' || action === 'detail') {
    detailRow.value = row
    detailTitle.value = meta.value.title + ' · 详情'
    detailOpen.value = true
    return
  }
  if (action === 'edit' || action === 'audit' || action === 'assess') {
    startEdit(row)
    return
  }
  if (action === 'delete') {
    ElMessageBox.confirm('删除后不可恢复，确定删除该记录？', '删除确认', { type: 'warning' }).then(() => {
      admin.remove(config.value.collection, row.id || row.no || row.code)
      ElMessage.success('已删除')
    }).catch(() => {})
    return
  }
  if (action === 'toggle') {
    if (row.status === '已授权') row.status = '待配置'
    else if (row.status === '待配置') row.status = '已授权'
    else row.status = row.status === '启用' ? '停用' : '启用'
    admin.save()
    ElMessage.success('状态已更新')
    return
  }
  if (action === 'reply') {
    openAction('回复', [{ key: 'reply', label: '回复内容', type: 'textarea' }], { reply: row.reply || '' }, () => {
      admin.replyReview(row.id, actionForm.reply)
      ElMessage.success('回复已发送')
    })
    return
  }
  if (action === 'ship') {
    openAction('发货', [
      { key: 'company', label: '物流公司', type: 'select', options: ['顺丰冷链', '京东冷链', '中通冷链', '自提'] },
      { key: 'tracking', label: '运单号' }
    ], { company: '顺丰冷链', tracking: '' }, () => {
      if (!actionForm.tracking) return ElMessage.warning('请填写运单号')
      admin.shipOrder(row.no, actionForm.company, actionForm.tracking)
      ElMessage.success('发货成功')
    })
    return
  }
  if (action === 'assign') { admin.assignRepair(row.id); ElMessage.success('已派单给运维'); return }
  if (action === 'finish') { admin.finishRepair(row.id); ElMessage.success('维修已完成'); return }
  if (action === 'checkin') { admin.checkInWorkorder(row.id); ElMessage.success('打卡成功，进度已更新'); return }
  if (action === 'warn') { admin.warnConsumer(row.id); ElMessage.success('已发送警告'); return }
  if (action === 'ban') { admin.banConsumer(row.id); ElMessage.success('账号已限制'); return }
}
function labelOf(k) {
  const c = config.value?.columns?.find(x => x.prop === k)
  return c?.label || k
}
function displayValue(v) {
  if (v == null || v === '') return '—'
  if (Array.isArray(v)) return v.join('、')
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}
function startEdit(row) {
  if (!row) return
  detailOpen.value = false
  editTitle.value = '编辑 · ' + meta.value.title
  const keys = Object.keys(row).filter(k => k !== 'id' && typeof row[k] !== 'object')
  editFields.value = keys.map(k => ({ key: k, label: labelOf(k), type: String(row[k]).length > 30 ? 'textarea' : 'text' }))
  Object.keys(editForm).forEach(k => delete editForm[k])
  keys.forEach(k => { editForm[k] = row[k] })
  pendingAction = { type: 'edit', row }
  editOpen.value = true
}
function saveEdit() {
  const row = pendingAction?.row
  if (!row) return
  admin.update(config.value.collection, row.id || row.no || row.code, { ...editForm })
  editOpen.value = false
  ElMessage.success('保存成功')
}
function openCreate(a) {
  actionTitle.value = a.label
  const fields = a.fields || defaultCreateFields()
  actionFields.value = fields
  Object.keys(actionForm).forEach(k => delete actionForm[k])
  fields.forEach(f => { actionForm[f.key] = f.default ?? '' })
  pendingAction = { type: 'create' }
  actionOpen.value = true
}
function defaultCreateFields() {
  return [
    { key: 'name', label: '名称' },
    { key: 'desc', label: '说明', type: 'textarea' }
  ]
}
function openAction(title, fields, initial, onSubmit) {
  actionTitle.value = title
  actionFields.value = fields
  Object.keys(actionForm).forEach(k => delete actionForm[k])
  Object.assign(actionForm, initial)
  actionOpen.value = true
  pendingAction = { type: 'action', onSubmit }
}
function submitAction() {
  if (pendingAction?.type === 'create') {
    admin.add(config.value.collection, { id: 'N' + Date.now(), ...actionForm })
    ElMessage.success('创建成功')
  } else if (pendingAction?.onSubmit) {
    pendingAction.onSubmit()
  }
  actionOpen.value = false
}
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.notice-list { display: grid; gap: 8px; margin-bottom: 16px; }
.notice-item { display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; padding: 11px 14px; border-radius: 10px; line-height: 1.65; }
.notice-item.info { background: #eef5fa; border: 1px solid #dbe8f1; color: #4a718c; }
.notice-item.success { background: #eef8ea; border: 1px solid #d7ecd0; color: #47724a; }
.notice-item.warn { background: #fdf5e7; border: 1px solid #f0e2c5; color: #8a672c; }
.chart-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.chart-grid .span-2 { grid-column: span 2; }
.chart-grid .span-4 { grid-column: span 4; }
.detail-list { display: grid; gap: 0; }
.detail-row { display: flex; gap: 14px; padding: 10px 2px; border-bottom: 1px solid #f1f4ec; font-size: 12.5px; }
.detail-row .dk { width: 100px; color: var(--ink-400); flex: 0 0 100px; }
.detail-row .dv { color: var(--ink-900); word-break: break-all; flex: 1; }
@media (max-width: 1180px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } .chart-grid { grid-template-columns: repeat(2, 1fr); } .chart-grid .span-2 { grid-column: span 2; } }
@media (max-width: 700px) { .stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; } .chart-grid { grid-template-columns: 1fr; } .chart-grid .span-2, .chart-grid .span-4 { grid-column: span 1; } }
</style>
