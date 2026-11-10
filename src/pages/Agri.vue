<template>
  <div>
    <div class="toolbar">
      <el-button type="primary" @click="openDialog('in')"><el-icon><Download /></el-icon>入库</el-button>
      <el-button @click="openDialog('out')"><el-icon><Upload /></el-icon>出库</el-button>
      <el-tag type="info">当前农资种类：{{ store.agriMats.length }}</el-tag>
    </div>

    <div class="card">
      <h3>📦 农资台账</h3>
      <table class="tbl">
        <thead><tr><th>编号</th><th>名称</th><th>类型</th><th>单位</th><th>库存</th><th>单价(元)</th><th>供应商</th><th>入库日期</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="m in store.agriMats" :key="m.id">
            <td>{{ m.id }}</td>
            <td>{{ m.name }}</td>
            <td><span class="tag blue">{{ m.type }}</span></td>
            <td>{{ m.unit }}</td>
            <td>
              <span :class="['tag', m.stock<=10 ? 'bad' : m.stock<=30 ? 'warn' : 'ok']">{{ m.stock }}</span>
            </td>
            <td>{{ m.price }}</td>
            <td>{{ m.supplier }}</td>
            <td>{{ m.date }}</td>
            <td class="actions">
              <el-button size="small" @click="stockDialog(m, 'out')">出库</el-button>
              <el-button size="small" @click="openDialog('in', m)">入库</el-button>
              <el-button size="small" type="danger" @click="del(m)">删除</el-button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 出入库小 Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogMode==='in' ? '农资入库' : '农资出库'" width="420px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="农资" v-if="!form.id">
          <el-select v-model="form.name" filterable allow-create default-first-option style="width:100%" placeholder="新建农资">
            <el-option v-for="m in store.agriMats" :key="m.id" :label="m.name" :value="m.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量"><el-input-number v-model="qty" :min="1" style="width:100%" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmStock">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { store, addRow, updateRow, removeRow } from '../stores/tableStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const dialogVisible = reactive({ v: false })
const dialogMode = reactive({ v: 'in' })
const form = reactive({ id: '', name: '', type: '肥料', unit: '袋', stock: 0, price: 0, supplier: '', date: '' })
const qty = reactive({ v: 1 })

function openDialog(mode, row) {
  dialogMode.v = mode
  qty.v = 1
  if (row) Object.assign(form, row)
  else Object.assign(form, { id: '', name: '', type: '肥料', unit: '袋', stock: 0, price: 0, supplier: '', date: new Date().toISOString().slice(0,10) })
  dialogVisible.v = true
}

function stockDialog(row, mode) {
  dialogMode.v = mode
  Object.assign(form, row)
  qty.v = 1
  dialogVisible.v = true
}

function confirmStock() {
  const sign = dialogMode.v === 'in' ? '+' : '-'
  const newStock = (form.stock || 0) + (dialogMode.v === 'in' ? qty.v : -qty.v)
  if (newStock < 0) { ElMessage.error('库存不足，无法出库'); return }
  ElMessageBox.confirm(`确定对「${form.name}」执行 ${sign} ${qty.v} ${form.unit} ？`, '出入库确认', { type: 'info' })
    .then(() => {
      if (form.id) {
        updateRow('agriMats', form.id, { stock: newStock })
      } else {
        const id = 'AM-' + String(store.agriMats.length + 1).padStart(3, '0')
        addRow('agriMats', { ...form, id, stock: qty.v, date: new Date().toISOString().slice(0,10) })
      }
      ElMessage.success(dialogMode.v === 'in' ? '入库成功' : '出库成功')
      dialogVisible.v = false
    }).catch(()=>{})
}

function del(m) {
  ElMessageBox.confirm(`确定删除「${m.name}」？`, '提示', { type: 'warning' }).then(() => {
    removeRow('agriMats', m.id); ElMessage.success('已删除')
  }).catch(()=>{})
}
</script>
