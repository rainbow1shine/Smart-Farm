<template>
  <div>
    <div class="toolbar">
      <el-select v-model="filterType" placeholder="日志类型" clearable style="width:140px">
        <el-option label="登录" value="登录" />
        <el-option label="业务" value="业务" />
        <el-option label="安全" value="安全" />
        <el-option label="系统" value="系统" />
      </el-select>
      <el-input v-model="keyword" placeholder="搜索用户/操作" clearable style="width:220px" />
      <el-button type="primary" @click="exportData"><el-icon><Download /></el-icon>导出</el-button>
      <el-tag type="info">共 {{ filtered.length }} 条</el-tag>
    </div>

    <div class="card">
      <h3>📒 日志审计表 <span style="font-size:12px;color:var(--ink3);font-weight:400">（所有日志只读）</span></h3>
      <table class="tbl">
        <thead><tr><th>日志ID</th><th>时间</th><th>类型</th><th>用户</th><th>操作</th><th>目标</th><th>IP地址</th></tr></thead>
        <tbody>
          <tr v-for="l in filtered" :key="l.id">
            <td>{{ l.id }}</td>
            <td>{{ l.time }}</td>
            <td><span :class="['tag', typeTag(l.type)]">{{ l.type }}</span></td>
            <td>{{ l.user }}</td>
            <td>{{ l.action }}</td>
            <td>{{ l.target }}</td>
            <td style="font-family:monospace">{{ l.ip }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { store } from '../stores/tableStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const filterType = ref('')
const keyword = ref('')

const filtered = computed(() => store.logs.filter(l => {
  const ks = (l.user + l.action + l.target).toLowerCase()
  return (!filterType.value || l.type === filterType.value) && (!keyword.value || ks.includes(keyword.value.toLowerCase()))
}))

function typeTag(t) { return t==='安全'?'bad':t==='系统'?'warn':t==='登录'?'blue':'ok' }
function exportData() { ElMessageBox.confirm('确定导出审计日志？').then(() => ElMessage.success('审计日志已导出')).catch(()=>{}) }
</script>
