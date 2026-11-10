<template>
  <div>
    <div class="toolbar">
      <el-button type="primary" @click="openDialog()"><el-icon><Plus /></el-icon>登记采收</el-button>
      <el-tag type="info">采收批次：{{ store.harvests.length }}</el-tag>
    </div>

    <div class="card">
      <h3>🌾 采收批次表</h3>
      <table class="tbl">
        <thead><tr><th>批次号</th><th>作物</th><th>地块</th><th>数量</th><th>等级</th><th>采收日期</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="h in store.harvests" :key="h.id">
            <td>{{ h.id }}</td>
            <td>{{ h.crop }}</td>
            <td>{{ h.field }}</td>
            <td>{{ h.qty }} {{ h.unit }}</td>
            <td><span :class="['tag', h.grade==='A级'?'ok':h.grade==='B级'?'warn':'bad']">{{ h.grade }}</span></td>
            <td>{{ h.date }}</td>
            <td><span :class="['tag', h.status==='已入库'?'ok':'gray']">{{ h.status }}</span></td>
            <td class="actions">
              <el-button size="small" @click="openDialog(h)">编辑</el-button>
              <el-button size="small" type="danger" @click="del(h)">删除</el-button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑采收' : '登记采收'" width="500px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="批次号"><el-input v-model="form.id" /></el-form-item>
        <el-form-item label="作物"><el-input v-model="form.crop" /></el-form-item>
        <el-form-item label="地块">
          <el-select v-model="form.field" filterable style="width:100%">
            <el-option v-for="f in store.fields" :key="f.id" :label="f.name" :value="f.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量"><el-input-number v-model="form.qty" :min="1" style="width:100%" /></el-form-item>
        <el-form-item label="单位">
          <el-select v-model="form.unit" style="width:100%">
            <el-option label="kg" value="kg" /><el-option label="斤" value="斤" /><el-option label="箱" value="箱" />
          </el-select>
        </el-form-item>
        <el-form-item label="等级">
          <el-select v-model="form.grade" style="width:100%">
            <el-option label="A级" value="A级" /><el-option label="B级" value="B级" /><el-option label="C级" value="C级" />
          </el-select>
        </el-form-item>
        <el-form-item label="采收日期"><el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
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
const form = reactive({ id:'', crop:'', field:'', qty:100, unit:'kg', grade:'A级', date:'', status:'已入库' })

function openDialog(row) {
  if (row) { editing.v = row.id; Object.assign(form, row) }
  else { editing.v = null; Object.assign(form, { id:'H-' + String(Date.now()).slice(-8), crop:'', field: store.fields[0]?.name || '', qty:100, unit:'kg', grade:'A级', date: new Date().toISOString().slice(0,10), status:'已入库' }) }
  dialogVisible.v = true
}
function save() {
  if (!form.id || !form.crop) { ElMessage.warning('请填写完整'); return }
  if (editing.v) updateRow('harvests', editing.v, { ...form })
  else addRow('harvests', { ...form })
  ElMessage.success('保存成功'); dialogVisible.v = false
}
function del(row) {
  ElMessageBox.confirm(`确定删除批次「${row.id}」？`, '提示', { type:'warning' })
    .then(() => { removeRow('harvests', row.id); ElMessage.success('已删除') }).catch(()=>{})
}
</script>
