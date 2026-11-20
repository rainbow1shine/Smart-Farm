<template>
  <div class="page-wrap">
    <PageHeader title="溯源信息录入" sub="一物一码 / 批次关联 / 二维码生成">
      <template #actions>
        <el-button :icon="Refresh" @click="refresh">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="createOpen = true">新建溯源批次</el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="溯源批次" :value="traces.length" unit="批" foot="覆盖 3 个园区" icon="Ticket" />
      <StatCard label="已发布" :value="published.length" unit="批" foot="消费者可扫码查询" icon="CircleCheck" />
      <StatCard label="待生成" :value="traces.length - published.length" unit="批" foot="需补充检测报告" icon="Timer" tone="warn" />
      <StatCard label="累计扫码" :value="'1,862'" unit="次" foot="近 30 天" icon="View" tone="info" />
    </div>

    <div class="trace-banner card">
      <div class="tb-icon"><el-icon><Ticket /></el-icon></div>
      <div class="tb-main">
        <b>一物一码，从地块到餐桌全程可查</b>
        <p>溯源批次需关联地块环境、农事记录、农资使用与农残检测报告，发布后生成消费者可扫描的二维码。</p>
      </div>
      <div class="tb-steps">
        <span class="on">1 关联批次</span><i></i><span class="on">2 补充记录</span><i></i><span :class="{ on: published.length }">3 检测合格</span><i></i><span>4 发布二维码</span>
      </div>
    </div>

    <DataTable
      :columns="columns"
      :rows="traces"
      :filters="filters"
      :search-keys="['code', 'batch', 'crop', 'plot', 'test']"
      search-placeholder="搜索溯源码 / 批次 / 作物…"
      export-name="溯源批次"
      :row-actions="rowActions"
      :action-width="180"
      @row-action="onAction"
      @refresh="refresh"
    />

    <el-drawer v-model="detailOpen" title="溯源档案" size="560px">
      <TraceTimeline v-if="current" :trace="current" />
      <template #footer>
        <el-button @click="detailOpen = false">关闭</el-button>
        <el-button type="primary" @click="openQr(current)">生成二维码</el-button>
      </template>
    </el-drawer>

    <el-dialog v-model="qrOpen" title="溯源码与二维码" width="420px" destroy-on-close>
      <div v-if="current" class="qr-box">
        <div class="qr-img" v-html="qrSvg(190)"></div>
        <div class="qr-code">{{ current.code }}</div>
        <p class="tiny muted">{{ current.crop }} · 批次 {{ current.batch }}</p>
        <div class="qr-actions">
          <el-button size="small" @click="copyCode">复制溯源码</el-button>
          <el-button size="small" type="primary" plain @click="publishTrace">发布到商城</el-button>
        </div>
        <div class="qr-tip"><el-icon><InfoFilled /></el-icon> 消费者可在商城「产品溯源」页输入溯源码或扫描二维码查看完整档案。</div>
      </div>
    </el-dialog>

    <el-dialog v-model="createOpen" title="新建溯源批次" width="600px" destroy-on-close>
      <el-form label-width="92px" label-position="left">
        <el-form-item label="采收批次">
          <el-select v-model="form.batch" class="w-full" @change="onBatch">
            <el-option v-for="h in DB.harvests" :key="h.batch" :label="h.batch + '（' + h.crop + '）'" :value="h.batch" />
          </el-select>
        </el-form-item>
        <el-form-item label="作物"><el-input v-model="form.crop" /></el-form-item>
        <el-form-item label="地块"><el-input v-model="form.plot" /></el-form-item>
        <el-form-item label="环境数据"><el-input v-model="form.env" /></el-form-item>
        <el-form-item label="农事记录"><el-input v-model="form.work" /></el-form-item>
        <el-form-item label="农资使用"><el-input v-model="form.input" /></el-form-item>
        <el-form-item label="检测结论"><el-input v-model="form.test" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createOpen = false">取消</el-button>
        <el-button type="primary" @click="createTrace">创建并关联</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Plus, Ticket, CircleCheck, Timer, View, InfoFilled } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import DataTable from '@/components/DataTable.vue'
import TraceTimeline from '@/components/TraceTimeline.vue'
import { useAdminStore } from '@/stores/admin'
import DB from '@/data/db'
import { qrSvg } from '@/utils/format'

const admin = useAdminStore()
const traces = computed(() => admin.traces)
const published = computed(() => traces.value.filter(t => t.status === '已发布'))
const detailOpen = ref(false)
const qrOpen = ref(false)
const createOpen = ref(false)
const current = ref(null)
const form = reactive({ batch: DB.harvests[0].batch, crop: '', plot: '', env: '已关联 30 天环境数据', work: '6 条农事记录', input: '4 次农资使用', test: '农残检测合格' })

const columns = [
  { prop: 'code', label: '溯源码', width: 110 },
  { prop: 'batch', label: '批次号', minWidth: 200 },
  { prop: 'crop', label: '作物', width: 140 },
  { prop: 'plot', label: '地块', minWidth: 160 },
  { prop: 'work', label: '农事记录', width: 120 },
  { prop: 'input', label: '农资使用', width: 120 },
  { prop: 'test', label: '检测结论', width: 120 },
  { prop: 'status', label: '状态', width: 90, type: 'tag' }
]
const filters = [
  { key: 'status', label: '发布状态', options: ['已发布', '待生成'].map(v => ({ label: v, value: v })) }
]
const rowActions = [
  { key: 'view', label: '档案' },
  { key: 'qr', label: '二维码' },
  { key: 'publish', label: '发布', show: (r) => r.status !== '已发布' }
]

function onAction({ action, row }) {
  current.value = row
  if (action === 'view') detailOpen.value = true
  if (action === 'qr') openQr(row)
  if (action === 'publish') publishTrace()
}
function openQr(row) {
  current.value = row
  qrOpen.value = true
}
function publishTrace() {
  if (!current.value) return
  if (current.value.test !== '农残检测合格') return ElMessage.warning('检测未合格，不能发布到商城')
  admin.update('traces', current.value.id || current.value.code, { status: '已发布', qr: 1 })
  qrOpen.value = false
  ElMessage.success('溯源批次已发布，消费者可扫码查询')
}
function copyCode() {
  const code = current.value?.code || ''
  navigator.clipboard?.writeText(code).then(() => ElMessage.success('溯源码已复制')).catch(() => ElMessage.info(code))
}
function onBatch(batch) {
  const h = DB.harvests.find(x => x.batch === batch)
  const t = DB.traces.find(x => x.batch === batch)
  form.crop = t?.crop || (h ? h.crop + '（' + h.plot + '）' : '')
  form.plot = t?.plot || (h ? DB.plots.find(p => p.id === h.plot)?.name || h.plot : '')
}
function createTrace() {
  if (!form.batch) return ElMessage.warning('请选择采收批次')
  const code = 'TR-' + String(22 + traces.value.length).padStart(5, '0')
  admin.add('traces', { code, ...form, qr: 0, status: '待生成' })
  createOpen.value = false
  ElMessage.success('溯源批次已创建，请补充检测报告后发布')
}
function refresh() { ElMessage.success('溯源数据已刷新') }
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.trace-banner { display: flex; align-items: center; gap: 14px; padding: 15px 18px; margin-bottom: 14px; background: linear-gradient(120deg, #f7fbf4, #eef7ea); border-color: #dcebd7; flex-wrap: wrap; }
.tb-icon { width: 42px; height: 42px; border-radius: 12px; background: var(--brand-600); color: #fff; display: grid; place-items: center; font-size: 20px; flex: 0 0 42px; }
.tb-main { flex: 1; min-width: 240px; }
.tb-main b { font-size: 13.5px; }
.tb-main p { font-size: 11.5px; color: var(--ink-500); line-height: 1.65; margin-top: 2px; }
.tb-steps { display: flex; align-items: center; gap: 6px; font-size: 10.5px; color: var(--ink-300); flex-wrap: wrap; }
.tb-steps span { padding: 3px 8px; border-radius: 20px; background: #fff; border: 1px solid var(--line); }
.tb-steps span.on { color: var(--brand-700); border-color: var(--brand-200); background: var(--brand-50); }
.tb-steps i { width: 14px; height: 1px; background: var(--line-strong); }
.qr-box { text-align: center; }
.qr-img { display: inline-flex; padding: 8px; background: #fff; border: 1px solid var(--line); border-radius: 14px; }
.qr-code { font-size: 19px; font-weight: 700; letter-spacing: 1px; font-family: ui-monospace, Consolas, monospace; margin: 12px 0 4px; }
.qr-actions { display: flex; justify-content: center; gap: 8px; margin: 14px 0; }
.qr-tip { display: flex; gap: 7px; text-align: left; padding: 10px 12px; border-radius: 9px; background: var(--brand-50); color: var(--brand-700); font-size: 11.5px; line-height: 1.7; }
@media (max-width: 1100px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 620px) { .stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; } }
</style>
