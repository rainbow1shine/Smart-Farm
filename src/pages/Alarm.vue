<template>
  <div>
    <!-- 统计瓦片 -->
    <div class="strip">
      <div class="tile">
        <div class="ic" style="background:#fbdcd9; color:#c23b31">⚡</div>
        <div><div class="lab">紧急告警</div><div class="num">{{ count('紧急') }}</div><div class="sub">需要立即处理</div></div>
      </div>
      <div class="tile">
        <div class="ic" style="background:#fdf0d8; color:#b07414">⚠️</div>
        <div><div class="lab">重要告警</div><div class="num">{{ count('重要') }}</div><div class="sub">24小时内处理</div></div>
      </div>
      <div class="tile">
        <div class="ic" style="background:#dceaf7; color:#2b6cb0">💬</div>
        <div><div class="lab">一般告警</div><div class="num">{{ count('一般') }}</div><div class="sub">纳入日常巡检</div></div>
      </div>
      <div class="tile">
        <div class="ic" style="background:#dcf3e5; color:#157a41">✅</div>
        <div><div class="lab">已闭环</div><div class="num">{{ countClosed() }}</div><div class="sub">累计处理完成</div></div>
      </div>
    </div>

    <div class="card">
      <div class="toolbar" style="margin-bottom:14px">
        <el-tag type="info">共 {{ store.alarms.length }} 条告警</el-tag>
        <el-button @click="exportData"><el-icon><Download /></el-icon>导出</el-button>
      </div>
      <table class="tbl">
        <thead><tr><th>告警ID</th><th>级别</th><th>类型</th><th>内容</th><th>关联</th><th>时间</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="a in store.alarms" :key="a.id">
            <td>{{ a.id }}</td>
            <td><span :class="['tag', a.level==='紧急'?'bad':a.level==='重要'?'warn':'blue']">{{ a.level }}</span></td>
            <td>{{ a.type }}</td>
            <td style="max-width:300px">{{ a.content }}</td>
            <td>{{ a.target }}</td>
            <td>{{ a.time }}</td>
            <td><span :class="['tag', a.status==='已闭环'?'ok':a.status==='处理中'?'warn':'gray']">{{ a.status }}</span></td>
            <td class="actions">
              <el-button size="small" type="primary" @click="handleDialog(a)">处理</el-button>
              <el-button size="small" @click="closeAlarm(a)">关闭</el-button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 处理 Dialog -->
    <el-dialog v-model="dialogVisible" title="告警处理" width="480px">
      <el-descriptions v-if="current" :column="1" border>
        <el-descriptions-item label="告警级别">{{ current.level }}</el-descriptions-item>
        <el-descriptions-item label="告警类型">{{ current.type }}</el-descriptions-item>
        <el-descriptions-item label="告警内容">{{ current.content }}</el-descriptions-item>
        <el-descriptions-item label="发生时间">{{ current.time }}</el-descriptions-item>
      </el-descriptions>
      <el-divider content-position="left">处置方案</el-divider>
      <el-input v-model="form.solution" type="textarea" :rows="4" placeholder="请输入处置方案..." />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmHandle">处理确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { store, updateRow } from '../stores/tableStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const current = ref(null)
const dialogVisible = reactive({ v: false })
const form = reactive({ solution: '' })

function count(level) { return store.alarms.filter(a => a.level === level && a.status !== '已闭环').length }
function countClosed() { return store.alarms.filter(a => a.status === '已闭环').length }

function handleDialog(a) { current.value = a; form.solution = ''; dialogVisible.v = true }
function confirmHandle() {
  if (!form.solution) { ElMessage.warning('请填写处置方案'); return }
  updateRow('alarms', current.value.id, { status: '已闭环' })
  ElMessage.success('已闭环，处置方案已记录')
  dialogVisible.v = false
}
function closeAlarm(a) {
  ElMessageBox.confirm(`确定关闭告警「${a.id}」？`, '提示', { type: 'warning' }).then(() => {
    updateRow('alarms', a.id, { status: '已闭环' })
    ElMessage.success('告警已关闭')
  }).catch(()=>{})
}
function exportData() {
  ElMessageBox.confirm('确定导出告警数据？', '导出确认').then(() => {
    ElMessage.success('告警数据已导出')
  }).catch(()=>{})
}
</script>
