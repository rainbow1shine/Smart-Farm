<template>
  <div class="page-wrap">
    <PageHeader :title="isFarmer ? '设备报修' : '报修工单'" :sub="isFarmer ? '发现设备故障时上报运维，跟踪维修进度' : '接单、到场、维修、闭环'">
      <template #actions>
        <el-button v-if="isFarmer" type="primary" :icon="Plus" @click="reportOpen = true">提交报修</el-button>
        <el-button :icon="Refresh" @click="ElMessage.success('工单已刷新')">刷新</el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="报修工单" :value="admin.repairs.length" unit="单" foot="本月累计" icon="Tools" />
      <StatCard label="待接单" :value="admin.repairs.filter(r => r.status === '待接单').length" unit="单" foot="需尽快响应" icon="Warning" tone="danger" />
      <StatCard label="维修中" :value="admin.repairs.filter(r => r.status === '维修中').length" unit="单" foot="运维处理中" icon="Refresh" tone="warn" />
      <StatCard label="已完成" :value="admin.repairs.filter(r => r.status === '已完成').length" unit="单" foot="闭环率 100%" icon="CircleCheck" />
    </div>

    <DataTable
      :columns="columns"
      :rows="admin.repairs"
      :filters="filters"
      :row-actions="rowActions"
      search-placeholder="搜索设备、报修人、故障描述…"
      export-name="报修工单"
      @row-action="onAction"
    />

    <el-drawer v-model="detailOpen" title="报修详情" size="500px">
      <div v-if="current" class="repair-detail">
        <div class="rd-head">
          <span class="rd-level" :class="current.level">{{ current.level }}</span>
          <div><h3>{{ current.dev }}</h3><span>{{ current.id }} · {{ current.plot }}</span></div>
          <StatusTag :status="current.status" />
        </div>
        <div class="rd-desc">{{ current.desc }}</div>
        <div class="rd-info">
          <div><span>报修人</span><b>{{ current.reporter }}</b></div>
          <div><span>报修时间</span><b>{{ current.time }}</b></div>
          <div><span>维修人</span><b>{{ current.assignee }}</b></div>
          <div><span>所属地块</span><b>{{ current.plot }}</b></div>
        </div>
        <el-timeline>
          <el-timeline-item :timestamp="current.time" color="#c65b4e">提交报修 · {{ current.reporter }}</el-timeline-item>
          <el-timeline-item v-if="current.status !== '待接单'" timestamp="2026-11-09 09:20" color="#c28632">运维接单 · {{ current.assignee }}</el-timeline-item>
          <el-timeline-item v-if="current.status === '已完成'" timestamp="2026-11-09 11:40" color="#4f7f56">维修完成 · 设备恢复在线</el-timeline-item>
        </el-timeline>
        <div class="rd-actions">
          <el-button v-if="current.status === '待接单'" type="primary" @click="assign(current)">接单派工</el-button>
          <el-button v-if="current.status === '维修中'" type="primary" @click="finish(current)">完成维修</el-button>
          <el-button @click="detailOpen = false">关闭</el-button>
        </div>
      </div>
    </el-drawer>

    <el-dialog v-model="reportOpen" title="提交设备报修" width="540px">
      <el-form label-width="90px" label-position="left">
        <el-form-item label="报修设备">
          <el-select v-model="form.dev" class="w-full" filterable>
            <el-option v-for="d in admin.devices" :key="d.id" :label="d.name" :value="d.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属地块"><el-input v-model="form.plot" /></el-form-item>
        <el-form-item label="紧急程度">
          <el-radio-group v-model="form.level"><el-radio-button value="一般">一般</el-radio-button><el-radio-button value="重要">重要</el-radio-button><el-radio-button value="紧急">紧急</el-radio-button></el-radio-group>
        </el-form-item>
        <el-form-item label="故障描述"><el-input v-model="form.desc" type="textarea" :rows="4" placeholder="请描述故障现象、发生时间与已尝试的处理" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="reportOpen = false">取消</el-button><el-button type="primary" @click="submit">提交报修</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import DataTable from '@/components/DataTable.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useAdminStore } from '@/stores/admin'
import { useAuthStore } from '@/stores/auth'

const admin = useAdminStore()
const auth = useAuthStore()
const isFarmer = computed(() => auth.role === 'farmer' || auth.role === 'admin')
const detailOpen = ref(false)
const reportOpen = ref(false)
const current = ref(null)
const form = reactive({ dev: 'A01 LED补光灯', plot: 'A区1号连栋大棚', level: '重要', desc: '' })
const columns = [
  { prop: 'id', label: '工单号', width: 100 },
  { prop: 'dev', label: '设备', minWidth: 170 },
  { prop: 'plot', label: '地块', width: 150 },
  { prop: 'reporter', label: '报修人', width: 90 },
  { prop: 'level', label: '等级', width: 80, type: 'tag' },
  { prop: 'desc', label: '故障描述', minWidth: 240 },
  { prop: 'time', label: '报修时间', width: 150 },
  { prop: 'assignee', label: '维修人', width: 90 },
  { prop: 'status', label: '状态', width: 90, type: 'tag' }
]
const filters = [
  { key: 'status', label: '状态', options: ['待接单', '维修中', '已完成'].map(v => ({ label: v, value: v })) },
  { key: 'level', label: '等级', options: ['紧急', '重要', '一般'].map(v => ({ label: v, value: v })) }
]
const rowActions = computed(() => isFarmer.value
  ? [{ key: 'view', label: '详情' }, { key: 'assign', label: '派工', show: r => r.status === '待接单' }, { key: 'finish', label: '完成', show: r => r.status === '维修中' }]
  : [{ key: 'view', label: '详情' }]
)
function onAction({ action, row }) {
  if (action === 'view') { current.value = row; detailOpen.value = true }
  if (action === 'assign') { admin.assignRepair(row.id); ElMessage.success('已接单并派给王运维') }
  if (action === 'finish') { admin.finishRepair(row.id); ElMessage.success('维修已完成，工单闭环') }
}
function assign(row) { admin.assignRepair(row.id); current.value = { ...row, status: '维修中', assignee: '王运维' }; ElMessage.success('已派工') }
function finish(row) { admin.finishRepair(row.id); current.value = { ...row, status: '已完成' }; ElMessage.success('维修完成') }
function submit() {
  if (!form.desc.trim()) return ElMessage.warning('请填写故障描述')
  admin.addRepair({ ...form, reporter: auth.user?.name || '农户' })
  reportOpen.value = false
  form.desc = ''
  ElMessage.success('报修已提交，运维会尽快联系你')
}
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.rd-head { display: flex; gap: 10px; align-items: center; padding-bottom: 14px; border-bottom: 1px dashed var(--line); }
.rd-head h3 { font-size: 15px; }
.rd-head span { font-size: 11px; color: var(--ink-400); }
.rd-head .status-tag { margin-left: auto; }
.rd-level { font-size: 10px; padding: 3px 8px; border-radius: 4px; background: #fbf1df; color: #a86c18; }
.rd-level.紧急 { background: #fbe9e6; color: #b84d40; }
.rd-desc { margin: 16px 0; padding: 12px 14px; background: #f8faf4; border-radius: 10px; font-size: 12.5px; line-height: 1.7; color: var(--ink-700); }
.rd-info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
.rd-info > div { background: #fbfcf8; border: 1px solid var(--line); border-radius: 9px; padding: 9px 11px; }
.rd-info span { display: block; font-size: 10.5px; color: var(--ink-400); }
.rd-info b { display: block; font-size: 12.5px; margin-top: 2px; }
.rd-actions { display: flex; gap: 8px; margin-top: 18px; }
@media (max-width: 1180px) { .stat-grid { grid-template-columns: 1fr 1fr; } }
</style>
