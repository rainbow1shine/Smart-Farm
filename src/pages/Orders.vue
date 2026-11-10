<template>
  <div>
    <div class="toolbar">
      <el-select v-model="filterStatus" placeholder="订单状态" clearable style="width:140px">
        <el-option label="全部" value="" />
        <el-option label="待发货" value="待发货" />
        <el-option label="已发货" value="已发货" />
        <el-option label="已完成" value="已完成" />
        <el-option label="已取消" value="已取消" />
      </el-select>
      <el-input v-model="keyword" placeholder="搜索客户/订单号" clearable style="width:200px" />
      <el-button @click="exportData"><el-icon><Download /></el-icon>导出</el-button>
      <el-tag type="info">共 {{ filtered.length }} 条</el-tag>
    </div>

    <div class="card">
      <h3>🛒 订单管理</h3>
      <table class="tbl">
        <thead><tr><th>订单号</th><th>客户</th><th>商品明细</th><th>金额</th><th>下单时间</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="o in filtered" :key="o.id">
            <td>{{ o.id }}</td>
            <td>{{ o.customer }}</td>
            <td>{{ o.items }}</td>
            <td style="color:#c23b31; font-weight:600">¥{{ o.amount.toLocaleString() }}</td>
            <td>{{ o.date }}</td>
            <td><span :class="['tag', statusTag(o.status)]">{{ o.status }}</span></td>
            <td class="actions">
              <el-button size="small" v-if="o.status==='待发货'" @click="ship(o)">发货</el-button>
              <el-button size="small" type="success" v-if="o.status==='已发货'" @click="confirm(o)">确认收货</el-button>
              <el-button size="small" type="danger" v-if="o.status!=='已取消' && o.status!=='已完成'" @click="cancel(o)">取消</el-button>
            </td>
          </tr>
          <tr v-if="filtered.length===0"><td colspan="7" style="text-align:center; color:var(--ink3)">没有匹配的订单</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { store, updateRow } from '../stores/tableStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const filterStatus = ref('')
const keyword = ref('')

const filtered = computed(() => store.orders.filter(o => {
  const ks = (o.id + o.customer).toLowerCase()
  return (!filterStatus.value || o.status === filterStatus.value) && (!keyword.value || ks.includes(keyword.value.toLowerCase()))
}))

function statusTag(s) {
  return s === '已完成' ? 'ok' : s === '已发货' ? 'blue' : s === '待发货' ? 'warn' : 'bad'
}

function ship(o) { ElMessageBox.confirm(`确认订单「${o.id}」发货？`, '发货确认').then(() => { updateRow('orders', o.id, { status: '已发货' }); ElMessage.success('已标记发货') }).catch(()=>{}) }
function confirm(o) { ElMessageBox.confirm(`确认「${o.id}」客户已收货？`, '收货确认').then(() => { updateRow('orders', o.id, { status: '已完成' }); ElMessage.success('已确认收货') }).catch(()=>{}) }
function cancel(o) { ElMessageBox.confirm(`确定取消订单「${o.id}」？`, '取消确认', { type: 'warning' }).then(() => { updateRow('orders', o.id, { status: '已取消' }); ElMessage.success('已取消') }).catch(()=>{}) }
function exportData() { ElMessageBox.confirm('确定导出订单数据？').then(() => ElMessage.success('订单数据已导出')).catch(()=>{}) }
</script>
