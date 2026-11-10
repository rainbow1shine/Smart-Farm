<template>
  <div>
    <div class="toolbar">
      <el-button type="primary" @click="openDialog()"><el-icon><Plus /></el-icon>新建农事计划</el-button>
      <el-tag type="info">工单总数：{{ store.farms.length }}</el-tag>
    </div>

    <div class="g-3-1">
      <!-- 工单侧 -->
      <div class="card">
        <h3>📝 农事工单</h3>
        <table class="tbl">
          <thead><tr><th>工单号</th><th>类型</th><th>地块</th><th>计划日期</th><th>执行人</th><th>进度</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="w in store.farms" :key="w.id">
              <td>{{ w.id }}</td>
              <td>{{ w.type }}</td>
              <td>{{ w.field }}</td>
              <td>{{ w.planDate }}</td>
              <td>{{ w.assignee }}</td>
              <td>
                <span :class="['tag', w.progress==='已完成'?'ok':w.progress==='进行中'?'warn':'gray']">{{ w.progress }}</span>
              </td>
              <td class="actions">
                <el-button size="small" @click="assign(w)" v-if="w.progress==='待派单'">派单</el-button>
                <el-button size="small" v-if="w.progress==='待派单'" @click="updateRow('farms', w.id, { progress:'进行中' })">执行中</el-button>
                <el-button size="small" v-if="w.progress==='进行中'" @click="complete(w)">完成</el-button>
                <el-button size="small" @click="openDialog(w)">编辑</el-button>
                <el-button size="small" type="danger" @click="del(w)">删除</el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h3>📊 工单统计</h3>
        <div class="g3">
          <div class="tile" style="flex-direction:column; text-align:center">
            <div class="num">{{ store.farms.filter(w=>w.progress==='待派单').length }}</div>
            <div class="lab">待派单</div>
          </div>
          <div class="tile" style="flex-direction:column; text-align:center">
            <div class="num">{{ store.farms.filter(w=>w.progress==='进行中').length }}</div>
            <div class="lab">进行中</div>
          </div>
          <div class="tile" style="flex-direction:column; text-align:center">
            <div class="num">{{ store.farms.filter(w=>w.progress==='已完成').length }}</div>
            <div class="lab">已完成</div>
          </div>
        </div>
        <div class="mt" style="font-size:12.5px; color:var(--ink2); line-height:1.9">
          <p>💡 <b>操作流程</b>：新建 → 派单指定人员 → 执行中 → 完成确认</p>
          <p>🔔 完成工单将自动记录到日志审计</p>
        </div>
      </div>
    </div>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="editing ? '编辑农事计划' : '新建农事计划'" width="560px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="工单号"><el-input v-model="form.id" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" style="width:100%">
            <el-option label="日常巡检" value="日常巡检" />
            <el-option label="施肥作业" value="施肥作业" />
            <el-option label="病虫害防治" value="病虫害防治" />
            <el-option label="灌溉作业" value="灌溉作业" />
            <el-option label="采收作业" value="采收作业" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联地块">
          <el-select v-model="form.field" style="width:100%" filterable>
            <el-option v-for="f in store.fields" :key="f.id" :label="f.name" :value="f.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划日期"><el-date-picker v-model="form.planDate" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        <el-form-item label="执行人"><el-input v-model="form.assignee" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.note" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { store, addRow, updateRow, removeRow } from '../stores/tableStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const dialogVisible = reactive({ v: false })
const editing = reactive({ v: null })
const form = reactive({ id: '', type: '日常巡检', field: '', planDate: '', assignee: '', note: '', progress: '待派单' })

function openDialog(row) {
  if (row) {
    editing.v = row.id
    Object.assign(form, row)
  } else {
    editing.v = null
    Object.assign(form, { id: 'WO-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + String(Math.floor(Math.random()*900+100)), type: '日常巡检', field: store.fields[0]?.name || '', planDate: '', assignee: '', note: '', progress: '待派单' })
  }
  dialogVisible.v = true
}
function save() {
  if (!form.id) { ElMessage.warning('请填写工单号'); return }
  if (editing.v) updateRow('farms', editing.v, { ...form })
  else addRow('farms', { ...form })
  ElMessage.success('保存成功')
  dialogVisible.v = false
}
function assign(w) {
  ElMessageBox.prompt('请输入执行人', '派单', { inputValue: w.assignee || '' }).then(({ value }) => {
    updateRow('farms', w.id, { assignee: value, progress: '进行中' })
    ElMessage.success('已派单给 ' + value)
  }).catch(()=>{})
}
function complete(w) {
  ElMessageBox.confirm('确定标记为已完成？', '确认', { type: 'success' }).then(() => {
    updateRow('farms', w.id, { progress: '已完成' })
    ElMessage.success('工单已完成')
  }).catch(()=>{})
}
function del(w) {
  ElMessageBox.confirm(`确定删除工单「${w.id}」？`, '提示', { type: 'warning' }).then(() => {
    removeRow('farms', w.id); ElMessage.success('已删除')
  }).catch(()=>{})
}
</script>
