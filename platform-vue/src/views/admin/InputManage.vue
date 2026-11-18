<template>
  <div class="page-wrap">
    <PageHeader title="农资管理" sub="出入库 / 库存预警 / 供应商 / 农药使用台账">
      <template #actions>
        <el-button :icon="Refresh" @click="refresh">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="openFlow('入库')">农资入库</el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="农资品类" :value="inputs.length" unit="种" foot="化肥/种子/农药/地膜" icon="Box" />
      <StatCard label="库存总值" :value="totalValue.toLocaleString()" unit="元" foot="按当前单价" icon="Money" tone="info" />
      <StatCard label="库存预警" :value="lowStock.length" unit="种" foot="低于安全库存" icon="Warning" tone="danger" />
      <StatCard label="本月出库" :value="outQty" unit="次" foot="农药均登记台账" icon="Van" tone="warn" />
    </div>

    <div v-if="lowStock.length" class="low-alert card">
      <el-icon><WarningFilled /></el-icon>
      <b>库存预警：</b>
      <span>{{ lowStock.map(i => i.name + '（' + i.stock + i.unit + '）').join('、') }} 低于安全库存，建议及时补货。</span>
    </div>

    <div class="tabs-bar card">
      <div class="tabs">
        <button v-for="t in tabs" :key="t" class="tab" :class="{ on: tab === t }" @click="tab = t">{{ t }}</button>
      </div>
      <span class="tiny muted">农药出入库需登记批次与使用地块，保证溯源可查</span>
    </div>

    <template v-if="tab === '库存台账'">
      <DataTable
        :columns="columns"
        :rows="inputs"
        :filters="filters"
        :search-keys="['name', 'cat', 'supplier', 'batch']"
        search-placeholder="搜索农资名称 / 供应商 / 批次…"
        export-name="农资库存"
        :row-actions="rowActions"
        :action-width="150"
        @row-action="onAction"
        @refresh="refresh"
      />
    </template>

    <template v-else-if="tab === '出入库流水'">
      <div class="card">
        <div class="card-head"><h3>出入库流水</h3><span class="sub">共 {{ flows.length }} 条记录</span></div>
        <el-table :data="flows" stripe>
          <el-table-column prop="time" label="时间" width="150" />
          <el-table-column prop="type" label="类型" width="90">
            <template #default="{ row }"><StatusTag :status="row.type === '入库' ? '成功' : '运输中'" /><span class="type-text">{{ row.type }}</span></template>
          </el-table-column>
          <el-table-column prop="name" label="农资名称" min-width="180" />
          <el-table-column prop="qty" label="数量" width="90">
            <template #default="{ row }">{{ row.qty }} {{ row.unit }}</template>
          </el-table-column>
          <el-table-column prop="target" label="去向 / 来源" min-width="180" />
          <el-table-column prop="who" label="经办人" width="100" />
        </el-table>
      </div>
    </template>

    <template v-else>
      <div class="card">
        <div class="card-head"><h3>农药使用台账</h3><span class="sub">安全间隔期与农残检测关联</span><div class="acts"><el-button text type="primary" :icon="Plus" @click="openFlow('出库')">登记用药</el-button></div></div>
        <el-table :data="DB.pesticideLedger" stripe>
          <el-table-column prop="date" label="日期" width="110" />
          <el-table-column prop="plot" label="地块" width="100" />
          <el-table-column prop="crop" label="作物" width="90" />
          <el-table-column prop="name" label="农药名称" min-width="160" />
          <el-table-column prop="dose" label="用量" width="110" />
          <el-table-column prop="operator" label="操作人" width="90" />
          <el-table-column prop="safeDay" label="安全间隔期" width="110">
            <template #default="{ row }">{{ row.safeDay }} 天</template>
          </el-table-column>
          <el-table-column prop="residue" label="农残结果" width="110">
            <template #default="{ row }"><StatusTag :status="row.residue" /></template>
          </el-table-column>
        </el-table>
        <div class="ledger-tip"><el-icon><InfoFilled /></el-icon> 用药后需在安全间隔期满后采样送检，检测合格方可采收上市。</div>
      </div>
    </template>

    <el-dialog v-model="flowOpen" :title="flowType + '登记'" width="520px" destroy-on-close>
      <el-form label-width="88px" label-position="left">
        <el-form-item label="农资">
          <el-select v-model="flowForm.id" class="w-full">
            <el-option v-for="i in inputs" :key="i.id" :label="i.name + '（库存 ' + i.stock + i.unit + '）'" :value="i.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="flowType === '入库' ? '入库数量' : '出库数量'">
          <el-input-number v-model="flowForm.qty" :min="1" class="w-full" />
        </el-form-item>
        <el-form-item label="去向 / 来源"><el-input v-model="flowForm.target" :placeholder="flowType === '入库' ? '供应商到货' : '如 DK-A01 追肥'" /></el-form-item>
        <el-form-item label="经办人">
          <el-select v-model="flowForm.who" class="w-full">
            <el-option v-for="u in farmers" :key="u.id" :label="u.name" :value="u.name" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="flowOpen = false">取消</el-button>
        <el-button type="primary" @click="submitFlow">确认{{ flowType }}</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editOpen" title="编辑农资档案" width="580px" destroy-on-close>
      <el-form label-width="88px" label-position="left">
        <el-form-item label="农资名称"><el-input v-model="editForm.name" placeholder="请输入农资名称" /></el-form-item>
        <div class="edit-grid">
          <el-form-item label="类别">
            <el-select v-model="editForm.cat" class="w-full">
              <el-option v-for="c in ['化肥', '种子', '农药', '地膜', '基质']" :key="c" :label="c" :value="c" />
            </el-select>
          </el-form-item>
          <el-form-item label="规格"><el-input v-model="editForm.spec" placeholder="如 50kg/袋" /></el-form-item>
        </div>
        <el-form-item label="供应商"><el-input v-model="editForm.supplier" placeholder="请输入供应商" /></el-form-item>
        <div class="edit-grid">
          <el-form-item label="库存"><el-input-number v-model="editForm.stock" :min="0" class="w-full" /></el-form-item>
          <el-form-item label="安全库存"><el-input-number v-model="editForm.min" :min="0" class="w-full" /></el-form-item>
        </div>
        <div class="edit-grid">
          <el-form-item label="单价（元）"><el-input-number v-model="editForm.price" :min="0" :precision="2" class="w-full" /></el-form-item>
          <el-form-item label="计量单位"><el-input v-model="editForm.unit" placeholder="袋 / 卷 / 瓶" /></el-form-item>
        </div>
        <div class="edit-grid">
          <el-form-item label="批次号"><el-input v-model="editForm.batch" /></el-form-item>
          <el-form-item label="有效期"><el-input v-model="editForm.expire" placeholder="YYYY-MM-DD" /></el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="editOpen = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Plus, WarningFilled, InfoFilled } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import DataTable from '@/components/DataTable.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useAdminStore } from '@/stores/admin'
import DB from '@/data/db'
import { dateTime } from '@/utils/format'

const admin = useAdminStore()
const inputs = computed(() => admin.inputs)
const lowStock = computed(() => inputs.value.filter(i => i.stock <= i.min))
const totalValue = computed(() => inputs.value.reduce((a, b) => a + b.stock * b.price, 0))
const outQty = computed(() => flows.value.filter(f => f.type === '出库').length)
const flows = ref(DB.inputFlow.map(f => ({ ...f })))
const farmers = DB.users.filter(u => u.role === '农户')
const tabs = ['库存台账', '出入库流水', '农药使用台账']
const tab = ref('库存台账')
const flowOpen = ref(false)
const flowType = ref('入库')
const flowForm = reactive({ id: '', qty: 1, target: '', who: '李国强' })

const columns = [
  { prop: 'name', label: '农资名称', minWidth: 190 },
  { prop: 'cat', label: '类别', width: 80 },
  { prop: 'spec', label: '规格', width: 120 },
  { prop: 'supplier', label: '供应商', width: 150 },
  { prop: 'stock', label: '库存', width: 80 },
  { prop: 'min', label: '安全库存', width: 90 },
  { prop: 'price', label: '单价', width: 90, type: 'money' },
  { prop: 'batch', label: '批次', width: 130 },
  { prop: 'status', label: '状态', width: 90, type: 'tag' }
]
const filters = [
  { key: 'cat', label: '农资类别', options: ['化肥', '种子', '农药', '地膜', '基质'].map(v => ({ label: v, value: v })) },
  { key: 'status', label: '库存状态', options: ['正常', '低库存'].map(v => ({ label: v, value: v })) }
]
const rowActions = [
  { key: 'in', label: '入库' },
  { key: 'out', label: '出库' },
  { key: 'edit', label: '编辑' }
]
const editOpen = ref(false)
const editForm = reactive({})

function onAction({ action, row }) {
  if (action === 'in') openFlow('入库', row.id)
  if (action === 'out') openFlow('出库', row.id)
  if (action === 'edit') {
    Object.keys(editForm).forEach(k => delete editForm[k])
    Object.assign(editForm, { ...row })
    editOpen.value = true
  }
}
function openFlow(type, id = '') {
  flowType.value = type
  flowForm.id = id || inputs.value[0]?.id || ''
  flowForm.qty = 1
  flowForm.target = type === '入库' ? '供应商到货' : ''
  flowForm.who = '李国强'
  flowOpen.value = true
}
function submitFlow() {
  const item = inputs.value.find(i => i.id === flowForm.id)
  if (!item) return ElMessage.warning('请选择农资')
  if (!flowForm.target.trim()) return ElMessage.warning('请填写去向 / 来源')
  if (flowType.value === '出库' && item.stock < flowForm.qty) return ElMessage.warning('库存不足，无法出库')
  const next = flowType.value === '入库' ? item.stock + flowForm.qty : item.stock - flowForm.qty
  admin.update('inputs', item.id, { stock: next, status: next <= item.min ? '低库存' : '正常' })
  flows.value.unshift({ time: dateTime(), type: flowType.value, name: item.name, qty: flowForm.qty, unit: item.unit, target: flowForm.target.trim(), who: flowForm.who })
  flowOpen.value = false
  ElMessage.success(`${item.name} ${flowType.value} ${flowForm.qty}${item.unit} 成功`)
}
function refresh() { ElMessage.success('农资数据已刷新') }
function saveEdit() {
  if (!editForm.name || !String(editForm.name).trim()) return ElMessage.warning('请填写农资名称')
  if (!editForm.id) return ElMessage.warning('缺少农资编号')
  const patch = { ...editForm }
  delete patch.id
  patch.status = patch.stock <= patch.min ? '低库存' : '正常'
  admin.update('inputs', editForm.id, patch)
  editOpen.value = false
  ElMessage.success('农资档案已更新')
}
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.low-alert { display: flex; align-items: center; gap: 8px; padding: 11px 15px; margin-bottom: 14px; background: #fdf5e7; border-color: #f0e2c5; color: #8a672c; font-size: 12px; }
.low-alert b { flex: 0 0 auto; }
.tabs-bar { display: flex; align-items: center; gap: 12px; padding: 10px 14px; margin-bottom: 14px; flex-wrap: wrap; }
.tabs { display: flex; gap: 4px; }
.tab { border: none; background: transparent; padding: 7px 13px; border-radius: 8px; font-size: 12.5px; color: var(--ink-500); cursor: pointer; }
.tab:hover { background: var(--brand-50); color: var(--brand-700); }
.tab.on { background: var(--brand-600); color: #fff; font-weight: 600; }
.tabs-bar .muted { margin-left: auto; }
.type-text { margin-left: 4px; font-size: 11.5px; }
.ledger-tip { display: flex; gap: 7px; align-items: flex-start; padding: 11px 16px; border-top: 1px solid var(--line); color: var(--ink-400); font-size: 11.5px; line-height: 1.7; }
.edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 14px; }
.edit-grid :deep(.el-form-item) { min-width: 0; }
@media (max-width: 1100px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 620px) { .stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; } .tabs-bar .muted { margin-left: 0; } }
</style>
