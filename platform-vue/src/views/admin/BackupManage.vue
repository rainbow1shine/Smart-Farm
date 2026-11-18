<template>
  <div class="page-wrap">
    <PageHeader title="备份与恢复" sub="系统备份、文件管理、恢复策略">
      <template #actions>
        <el-button type="primary" :icon="Plus" @click="createBackup">立即备份</el-button>
        <el-button :icon="Setting" @click="policyOpen = true">备份策略</el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="备份文件" :value="admin.backups.length" unit="个" foot="最近 7 天" icon="FolderOpened" />
      <StatCard label="占用空间" value="342.8" unit="MB" foot="配额 10 GB" icon="Coin" tone="info" />
      <StatCard label="最近备份" :value="admin.backups[0]?.time?.slice(5, 16) || '—'" foot="自动备份 · 成功" icon="Timer" />
      <StatCard label="恢复演练" value="1" unit="次" foot="上次 11-01 · 通过" icon="RefreshRight" tone="warn" />
    </div>

    <div class="backup-grid">
      <div class="card backup-list">
        <div class="card-head"><h3>备份文件</h3><span class="sub">数据库 + 上传文件</span></div>
        <DataTable
          :columns="columns"
          :rows="admin.backups"
          :row-actions="rowActions"
          :show-export="false"
          search-placeholder="搜索备份名称…"
          @row-action="onAction"
        />
      </div>
      <div class="card policy-card">
        <div class="card-head"><h3>存储与策略</h3></div>
        <div class="policy-body">
          <div class="storage">
            <div class="st-head"><span>存储空间</span><b>342.8 MB / 10 GB</b></div>
            <el-progress :percentage="3.4" :stroke-width="8" :show-text="false" />
            <span class="st-foot">剩余 9.66 GB · 按当前增速可用约 8 年</span>
          </div>
          <div class="policy-item"><span>自动备份</span><b>每日 02:00</b></div>
          <div class="policy-item"><span>保留周期</span><b>最近 30 天</b></div>
          <div class="policy-item"><span>存储位置</span><b>本地磁盘 + 对象存储</b></div>
          <div class="policy-item"><span>加密方式</span><b>AES-256</b></div>
          <div class="policy-item"><span>下次备份</span><b>明日 02:00</b></div>
          <el-alert title="演示环境仅记录备份记录，不执行真实文件打包。" type="info" :closable="false" show-icon />
        </div>
      </div>
    </div>

    <el-dialog v-model="policyOpen" title="备份策略" width="520px">
      <el-form label-width="100px" label-position="left">
        <el-form-item label="备份频率"><el-select v-model="policy.freq" class="w-full"><el-option label="每日一次" value="daily" /><el-option label="每 12 小时" value="12h" /><el-option label="每周一次" value="weekly" /></el-select></el-form-item>
        <el-form-item label="执行时间"><el-time-picker v-model="policy.time" format="HH:mm" value-format="HH:mm" /></el-form-item>
        <el-form-item label="保留天数"><el-input-number v-model="policy.keep" :min="7" :max="365" /></el-form-item>
        <el-form-item label="异地存储"><el-switch v-model="policy.remote" active-text="同步到对象存储" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="policyOpen = false">取消</el-button><el-button type="primary" @click="policyOpen = false; ElMessage.success('备份策略已保存')">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Setting } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import DataTable from '@/components/DataTable.vue'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()
const policyOpen = ref(false)
const policy = reactive({ freq: 'daily', time: '02:00', keep: 30, remote: true })
const columns = [
  { prop: 'id', label: '编号', width: 130 },
  { prop: 'name', label: '备份名称', minWidth: 130 },
  { prop: 'type', label: '类型', width: 80 },
  { prop: 'size', label: '大小', width: 90 },
  { prop: 'time', label: '备份时间', width: 150 },
  { prop: 'status', label: '状态', width: 80, type: 'tag' }
]
const rowActions = [
  { key: 'restore', label: '恢复' },
  { key: 'download', label: '下载' },
  { key: 'delete', label: '删除', type: 'danger' }
]
function createBackup() {
  const b = admin.addBackup()
  ElMessage.success(`备份已完成：${b.id}`)
}
function onAction({ action, row }) {
  if (action === 'download') return ElMessage.success(`已开始下载 ${row.id}.zip（演示）`)
  if (action === 'delete') {
    ElMessageBox.confirm(`确定删除备份「${row.id}」？`, '删除确认', { type: 'warning' }).then(() => {
      admin.remove('backups', row.id)
      ElMessage.success('已删除')
    }).catch(() => {})
  }
  if (action === 'restore') {
    ElMessageBox.confirm(`恢复将覆盖当前数据，确定使用「${row.id}」恢复？`, '恢复确认', { type: 'warning' }).then(() => {
      ElMessage.success('恢复任务已提交，预计 2 分钟完成（演示）')
    }).catch(() => {})
  }
}
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.backup-grid { display: grid; grid-template-columns: 1fr 340px; gap: 16px; }
.backup-list { overflow: hidden; }
.policy-body { padding: 16px 18px 20px; display: grid; gap: 12px; }
.storage { background: #f8faf4; border-radius: 10px; padding: 13px; }
.st-head { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px; }
.st-head b { color: var(--brand-700); }
.st-foot { display: block; font-size: 10.5px; color: var(--ink-400); margin-top: 7px; }
.policy-item { display: flex; justify-content: space-between; font-size: 12px; padding: 7px 0; border-bottom: 1px dashed #f0f3ea; }
.policy-item span { color: var(--ink-400); }
.policy-item b { font-weight: 500; }
@media (max-width: 1100px) { .stat-grid { grid-template-columns: 1fr 1fr; } .backup-grid { grid-template-columns: 1fr; } }
</style>
