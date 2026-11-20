<template>
  <div class="page-wrap">
    <PageHeader title="消费者管理" sub="警告、拉黑异常账号，保障交易秩序">
      <template #actions>
        <el-button :icon="Refresh" @click="refresh">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="addOpen = true">添加消费者</el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="消费者总数" :value="consumers.length" unit="人" foot="平台注册用户" icon="UserFilled" />
      <StatCard label="会员消费额" :value="totalSpend.toLocaleString()" unit="元" foot="累计成交" icon="Money" tone="info" />
      <StatCard label="已警告" :value="warned.length" unit="人" foot="存在异常行为" icon="Warning" tone="warn" />
      <StatCard label="已限制" :value="limited.length" unit="人" foot="禁止下单" icon="CircleClose" tone="danger" />
    </div>

    <div class="card notice">
      <el-icon><InfoFilled /></el-icon>
      <span>收到 3 次有效警告的账号将被自动限制下单；限制后可在详情中人工解除。处理记录会写入日志审计。</span>
    </div>

    <DataTable
      :columns="columns"
      :rows="consumers"
      :filters="filters"
      :search-keys="['name', 'phone', 'level']"
      search-placeholder="搜索姓名 / 手机号 / 会员等级…"
      export-name="消费者列表"
      :row-actions="rowActions"
      :action-width="150"
      @row-action="onAction"
      @refresh="refresh"
    />

    <el-drawer v-model="detailOpen" title="消费者详情" size="460px">
      <div v-if="current" class="cd">
        <div class="cd-head">
          <span class="cd-avatar">{{ current.name.slice(0, 1) }}</span>
          <div>
            <h3>{{ current.name }}</h3>
            <p class="tiny muted">{{ current.phone }} · 注册于 {{ current.reg }}</p>
          </div>
          <StatusTag :status="current.status" />
        </div>
        <div class="cd-stats">
          <div><b>{{ current.orders }}</b><span>累计订单</span></div>
          <div><b>{{ money(current.spend) }}</b><span>累计消费</span></div>
          <div><b>{{ current.warn || 0 }}</b><span>警告次数</span></div>
        </div>
        <div class="cd-list">
          <div class="cd-row"><span>会员等级</span><b>{{ current.level }}</b></div>
          <div class="cd-row"><span>账号状态</span><b>{{ current.status }}</b></div>
          <div class="cd-row"><span>注册时间</span><b>{{ current.reg }}</b></div>
          <div class="cd-row"><span>最近下单</span><b>2026-11-09 09:02</b></div>
        </div>
        <div class="cd-log">
          <h4>最近行为</h4>
          <div class="log-item"><span class="dot"></span>提交订单 M20261109001，金额 ¥25.60<small>11-09 09:02</small></div>
          <div class="log-item"><span class="dot"></span>完成评价「永川粉贝贝番茄」5 星<small>11-09 19:20</small></div>
          <div v-if="current.warn" class="log-item warn"><span class="dot"></span>因异常退款被警告 {{ current.warn }} 次<small>11-08 14:10</small></div>
        </div>
      </div>
      <template #footer>
        <el-button type="warning" plain @click="warn(current)">发送警告</el-button>
        <el-button type="danger" plain @click="ban(current)">限制账号</el-button>
      </template>
    </el-drawer>

    <el-dialog v-model="addOpen" title="添加消费者" width="480px" destroy-on-close>
      <el-form label-width="88px" label-position="left">
        <el-form-item label="姓名"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="form.phone" placeholder="11 位手机号" /></el-form-item>
        <el-form-item label="会员等级">
          <el-select v-model="form.level" class="w-full">
            <el-option label="新芽会员" value="新芽会员" />
            <el-option label="青梅会员" value="青梅会员" />
            <el-option label="金穗会员" value="金穗会员" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addOpen = false">取消</el-button>
        <el-button type="primary" @click="addConsumer">确定添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Plus, InfoFilled } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import DataTable from '@/components/DataTable.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useAdminStore } from '@/stores/admin'
import { money, maskPhone } from '@/utils/format'

const admin = useAdminStore()
const consumers = computed(() => admin.consumers)
const warned = computed(() => consumers.value.filter(c => c.status === '已警告'))
const limited = computed(() => consumers.value.filter(c => c.status === '已限制'))
const totalSpend = computed(() => consumers.value.reduce((a, b) => a + b.spend, 0))

const columns = [
  { prop: 'name', label: '姓名', width: 110 },
  { prop: 'phone', label: '手机号', width: 130 },
  { prop: 'level', label: '会员等级', width: 120 },
  { prop: 'orders', label: '订单数', width: 80 },
  { prop: 'spend', label: '累计消费', width: 110, type: 'money' },
  { prop: 'reg', label: '注册时间', width: 120 },
  { prop: 'warn', label: '警告', width: 70 },
  { prop: 'status', label: '状态', width: 100, type: 'tag' }
]
const filters = [
  { key: 'status', label: '账号状态', options: ['正常', '已警告', '已限制'].map(v => ({ label: v, value: v })) },
  { key: 'level', label: '会员等级', options: ['新芽会员', '青梅会员', '金穗会员'].map(v => ({ label: v, value: v })) }
]
const rowActions = [
  { key: 'view', label: '详情' },
  { key: 'warn', label: '警告', show: (r) => r.status !== '已限制' },
  { key: 'ban', label: '限制', type: 'danger', show: (r) => r.status !== '已限制' },
  { key: 'unban', label: '解除', show: (r) => r.status === '已限制' }
]

const detailOpen = ref(false)
const addOpen = ref(false)
const current = ref(null)
const form = reactive({ name: '', phone: '', level: '新芽会员' })

function onAction({ action, row }) {
  current.value = row
  if (action === 'view') detailOpen.value = true
  if (action === 'warn') warn(row)
  if (action === 'ban') ban(row)
  if (action === 'unban') {
    admin.update('consumers', row.id, { status: '正常', warn: 0 })
    ElMessage.success('已解除账号限制')
  }
}
function warn(row) {
  admin.warnConsumer(row.id)
  detailOpen.value = false
  ElMessage.success(`已向 ${row.name} 发送警告（累计 ${(row.warn || 0) + 1} 次）`)
}
function ban(row) {
  admin.banConsumer(row.id)
  detailOpen.value = false
  ElMessage.success('账号已限制下单')
}
function addConsumer() {
  if (!form.name.trim()) return ElMessage.warning('请填写姓名')
  if (!/^1[3-9]\d{9}$/.test(form.phone)) return ElMessage.warning('请填写正确的手机号')
  admin.add('consumers', { id: 'CU-' + Date.now(), name: form.name.trim(), phone: maskPhone(form.phone), level: form.level, orders: 0, spend: 0, status: '正常', reg: new Date().toISOString().slice(0, 10), warn: 0 })
  addOpen.value = false
  form.name = ''
  form.phone = ''
  ElMessage.success('消费者已添加')
}
function refresh() { ElMessage.success('消费者数据已刷新') }
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.notice { display: flex; gap: 8px; align-items: flex-start; padding: 12px 15px; margin-bottom: 14px; background: #f2f7fb; border-color: #dbe9f3; color: #4a718c; font-size: 12px; line-height: 1.7; }
.cd-head { display: flex; align-items: center; gap: 12px; padding-bottom: 16px; border-bottom: 1px solid var(--line); }
.cd-avatar { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #7ca66e, #426f4a); color: #fff; display: grid; place-items: center; font-size: 20px; flex: 0 0 52px; }
.cd-head h3 { font-size: 17px; }
.cd-head > :last-child { margin-left: auto; }
.cd-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 16px 0; }
.cd-stats > div { background: var(--bg-soft); border: 1px solid var(--line); border-radius: 10px; padding: 11px 12px; text-align: center; }
.cd-stats b { display: block; font-size: 17px; color: var(--brand-700); }
.cd-stats span { font-size: 10.5px; color: var(--ink-400); }
.cd-list { border-top: 1px solid var(--line); padding-top: 8px; }
.cd-row { display: flex; justify-content: space-between; gap: 14px; padding: 7px 0; font-size: 12.5px; color: var(--ink-500); }
.cd-row b { color: var(--ink-900); font-weight: 500; }
.cd-log { margin-top: 16px; }
.cd-log h4 { font-size: 13px; margin-bottom: 8px; }
.log-item { position: relative; padding: 8px 0 8px 16px; border-bottom: 1px solid #f3f5ef; font-size: 12px; color: var(--ink-700); }
.log-item .dot { position: absolute; left: 2px; top: 14px; width: 6px; height: 6px; border-radius: 50%; background: var(--brand-400); }
.log-item.warn .dot { background: #c65b4e; }
.log-item small { display: block; color: var(--ink-300); font-size: 10.5px; margin-top: 2px; }
@media (max-width: 1000px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 620px) { .stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; } .cd-stats { grid-template-columns: 1fr; } }
</style>
