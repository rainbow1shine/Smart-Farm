<template>
  <div class="page-wrap">
    <PageHeader title="设备管理" sub="网关、传感器、执行器增删改与通信状态监测">
      <template #actions>
        <el-button type="primary" :icon="Plus" @click="openAdd">接入设备</el-button>
        <el-button :icon="Refresh" @click="refresh">刷新状态</el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="设备总数" :value="admin.devices.length" unit="台" foot="覆盖 8 个地块" icon="Cpu" />
      <StatCard label="在线设备" :value="admin.onlineDevices.length" unit="台" :foot="`在线率 ${onlineRate}%`" icon="CircleCheck" />
      <StatCard label="故障/离线" :value="admin.devices.filter(d => !d.online || d.status === '故障').length" unit="台" foot="需现场处理" icon="Warning" tone="danger" />
      <StatCard label="今日采集" value="28.6" unit="万条" foot="平均延迟 1.2s" icon="Odometer" tone="info" />
    </div>

    <div class="card tabs-card">
      <el-tabs v-model="tab" @tab-change="onTab">
        <el-tab-pane label="全部设备" name="all" />
        <el-tab-pane label="传感器" name="传感器" />
        <el-tab-pane label="执行器" name="执行器" />
        <el-tab-pane label="网关" name="网关" />
      </el-tabs>
      <DataTable
        :columns="columns"
        :rows="rows"
        :filters="filters"
        :row-actions="rowActions"
        search-placeholder="搜索设备编号、名称、地块…"
        export-name="设备管理"
        @row-action="onAction"
      />
    </div>

    <el-drawer v-model="detailOpen" title="设备详情" size="460px">
      <div v-if="current" class="dev-detail">
        <div class="dd-head">
          <span class="dd-ico"><el-icon><Cpu /></el-icon></span>
          <div><h3>{{ current.name }}</h3><span>{{ current.id }} · {{ current.type }}</span></div>
          <StatusTag :status="current.status" />
        </div>
        <div class="dd-grid">
          <div><span>所属地块</span><b>{{ plotName(current.plot) }}</b></div>
          <div><span>通信地址</span><b>{{ current.ip }}</b></div>
          <div><span>采集频率</span><b>{{ current.rate }}</b></div>
          <div><span>最后在线</span><b>{{ current.last }}</b></div>
          <div class="full"><span>当前读数</span><b>{{ current.value }}</b></div>
        </div>
        <div class="dd-control">
          <div><b>远程控制</b><span>指令下发后 3 秒内生效</span></div>
          <el-switch :model-value="current.status === '运行'" :disabled="!current.online" @change="v => control(current, v)" />
        </div>
        <el-alert v-if="!current.online" title="设备当前离线，无法下发控制指令" type="warning" :closable="false" show-icon />
        <div class="dd-log">
          <h4>最近控制记录</h4>
          <div v-for="l in admin.logs.filter(x => x.action.includes(current.name)).slice(0, 4)" :key="l.time" class="log-row">
            <span>{{ l.time.slice(5) }}</span><b>{{ l.action }}</b><StatusTag :status="l.result" />
          </div>
          <div v-if="!admin.logs.some(x => x.action.includes(current.name))" class="empty-box" style="padding:20px">暂无控制记录</div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import DataTable from '@/components/DataTable.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useAdminStore } from '@/stores/admin'
import DB from '@/data/db'

const admin = useAdminStore()
const tab = ref('all')
const detailOpen = ref(false)
const current = ref(null)
const onlineRate = computed(() => ((admin.onlineDevices.length / admin.devices.length) * 100).toFixed(0))
const rows = computed(() => tab.value === 'all' ? admin.devices : admin.devices.filter(d => d.type === tab.value))
const plotName = (id) => DB.plots.find(p => p.id === id)?.name || (id === '全园区' ? '全园区' : id)

const columns = [
  { prop: 'id', label: '设备编号', width: 110 },
  { prop: 'name', label: '设备名称', minWidth: 180 },
  { prop: 'type', label: '类型', width: 80 },
  { prop: 'sub', label: '子类型', width: 120 },
  { prop: 'plot', label: '地块', width: 110, formatter: r => plotName(r.plot) },
  { prop: 'value', label: '当前读数', minWidth: 140 },
  { prop: 'last', label: '最后在线', width: 150 },
  { prop: 'status', label: '状态', width: 80, type: 'tag' }
]
const filters = [
  { key: 'status', label: '运行状态', options: ['运行', '停止', '离线', '故障'].map(v => ({ label: v, value: v })) },
  { key: 'online', label: '在线状态', options: [{ label: '在线', value: 1 }, { label: '离线', value: 0 }] }
]
const rowActions = [
  { key: 'view', label: '详情' },
  { key: 'control', label: '控制', show: r => r.type === '执行器' && r.online }
]
const form = reactive({ name: '', type: '传感器', sub: '', plot: 'DK-A01', ip: '', rate: '60秒' })

function onTab() {}
function onAction({ action, row }) {
  if (action === 'view' || action === 'control') {
    current.value = row
    detailOpen.value = true
  }
}
function control(dev, on) {
  admin.controlDevice(dev.id, on ? 'on' : 'off')
  dev.online = 1
  current.value = { ...dev }
  ElMessage.success(`已${on ? '开启' : '关闭'}「${dev.name}」`)
}
function refresh() { ElMessage.success('设备状态已刷新') }
async function openAdd() {
  try {
    const { value } = await ElMessageBox.prompt('请输入设备名称', '接入新设备', { inputPlaceholder: '如：A01 土壤温度传感器' })
    if (!value) return
    admin.add('devices', { id: 'DEV-' + Date.now().toString().slice(-4), name: value, type: '传感器', sub: '新增设备', plot: 'DK-A01', online: 1, status: '运行', ip: '10.20.1.99', rate: '60秒', last: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'), value: '待采集' })
    ElMessage.success('设备已接入')
  } catch {}
}
import { ElMessageBox } from 'element-plus'
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.tabs-card { padding: 0 16px 16px; }
.tabs-card :deep(.el-tabs__header) { margin-bottom: 6px; }
.tabs-card :deep(.dt-toolbar) { padding-left: 0; padding-right: 0; }
.dev-detail { padding: 0 4px; }
.dd-head { display: flex; align-items: center; gap: 10px; padding-bottom: 14px; border-bottom: 1px dashed var(--line); }
.dd-ico { width: 42px; height: 42px; border-radius: 11px; background: var(--brand-50); color: var(--brand-600); display: grid; place-items: center; font-size: 19px; }
.dd-head h3 { font-size: 15px; }
.dd-head span { font-size: 11px; color: var(--ink-400); }
.dd-head .status-tag { margin-left: auto; }
.dd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 16px 0; }
.dd-grid > div { background: #f9fbf5; border-radius: 9px; padding: 9px 11px; }
.dd-grid .full { grid-column: 1 / -1; }
.dd-grid span { display: block; font-size: 10.5px; color: var(--ink-400); }
.dd-grid b { display: block; font-size: 12.5px; margin-top: 2px; }
.dd-control { display: flex; align-items: center; gap: 12px; padding: 13px 14px; background: var(--brand-50); border-radius: 10px; margin-bottom: 12px; }
.dd-control > div { flex: 1; }
.dd-control b { display: block; font-size: 12.5px; }
.dd-control span { font-size: 10.5px; color: var(--ink-400); }
.dd-log { margin-top: 18px; }
.dd-log h4 { font-size: 12.5px; margin-bottom: 8px; }
.log-row { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f2f4ee; font-size: 11.5px; }
.log-row span { color: var(--ink-400); width: 70px; }
.log-row b { flex: 1; font-weight: 500; }
@media (max-width: 1180px) { .stat-grid { grid-template-columns: 1fr 1fr; } }
</style>
