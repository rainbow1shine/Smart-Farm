<template>
  <div class="page-wrap">
    <PageHeader title="采集管理" sub="传感器接入注册 / 采集频率设置 / 掉线检测">
      <template #actions>
        <el-button type="primary" :icon="Setting" @click="freqOpen = true">采集策略</el-button>
        <el-button :icon="Refresh" @click="refresh">刷新</el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="采集点" :value="sensors.length" unit="个" foot="空气 / 土壤 / 水体 / 气象" icon="Odometer" />
      <StatCard label="在线率" :value="onlineRate" unit="%" foot="较昨日 +1.2%" icon="CircleCheck" />
      <StatCard label="今日数据" value="28.6" unit="万条" foot="平均延迟 1.2s" icon="DataLine" tone="info" />
      <StatCard label="异常掉线" :value="sensors.filter(s => !s.online).length" unit="个" foot="触发告警工单" icon="Warning" tone="danger" />
    </div>

    <div class="chart-row">
      <ChartBox title="24 小时采集量" sub="按小时统计" :option="collectOption" :height="220" />
      <ChartBox title="掉线次数分布" sub="近 7 天" :option="dropOption" :height="220" />
    </div>

    <DataTable
      :columns="columns"
      :rows="sensors"
      :filters="filters"
      :row-actions="rowActions"
      search-placeholder="搜索传感器名称、地块…"
      export-name="采集管理"
      @row-action="onAction"
    />

    <el-dialog v-model="cfgOpen" title="采集参数配置" width="520px">
      <el-form label-width="110px" label-position="left">
        <el-form-item label="采集频率">
          <el-select v-model="cfg.rate" class="w-full"><el-option v-for="v in ['30秒', '60秒', '120秒', '300秒']" :key="v" :label="v" :value="v" /></el-select>
        </el-form-item>
        <el-form-item label="连续掉线阈值"><el-input-number v-model="cfg.drop" :min="1" :max="10" /><span class="unit">个周期</span></el-form-item>
        <el-form-item label="数据保留"><el-select v-model="cfg.keep" class="w-full"><el-option label="30 天" value="30" /><el-option label="90 天" value="90" /><el-option label="365 天" value="365" /></el-select></el-form-item>
        <el-form-item label="自动补采"><el-switch v-model="cfg.retry" active-text="掉线恢复后自动补采" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="cfgOpen = false">取消</el-button><el-button type="primary" @click="saveCfg">保存</el-button></template>
    </el-dialog>

    <el-dialog v-model="freqOpen" title="全局采集策略" width="520px">
      <el-form label-width="110px" label-position="left">
        <el-form-item label="默认频率"><el-radio-group v-model="globalFreq"><el-radio-button v-for="v in ['30秒', '60秒', '120秒']" :key="v" :value="v">{{ v }}</el-radio-button></el-radio-group></el-form-item>
        <el-form-item label="夜间降频"><el-switch v-model="night" active-text="22:00–06:00 降为 300 秒" /></el-form-item>
        <el-form-item label="异常重试"><el-input-number v-model="retry" :min="0" :max="5" /><span class="unit">次</span></el-form-item>
      </el-form>
      <template #footer><el-button @click="freqOpen = false">取消</el-button><el-button type="primary" @click="freqOpen = false; ElMessage.success('采集策略已更新')">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting, Refresh } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import ChartBox from '@/components/ChartBox.vue'
import DataTable from '@/components/DataTable.vue'
import { useAdminStore } from '@/stores/admin'
import { dateTime } from '@/utils/format'

const admin = useAdminStore()
const sensors = computed(() => admin.devices.filter(d => d.type === '传感器' || d.type === '网关'))
const onlineRate = computed(() => ((sensors.value.filter(s => s.online).length / sensors.value.length) * 100).toFixed(0))
const cfgOpen = ref(false)
const freqOpen = ref(false)
const cfg = reactive({ rate: '60秒', drop: 3, keep: '90', retry: true })
const globalFreq = ref('60秒')
const night = ref(true)
const retry = ref(2)

const collectOption = {
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 24, bottom: 26 },
  xAxis: { type: 'category', data: ['0', '4', '8', '12', '16', '20', '24'], axisLabel: { fontSize: 10, color: '#8b998f' }, axisLine: { lineStyle: { color: '#e4e8df' } } },
  yAxis: { type: 'value', splitLine: { lineStyle: { color: '#eef2e8' } }, axisLabel: { fontSize: 10, color: '#8b998f' } },
  series: [{ type: 'bar', data: [1.2, 1.1, 3.8, 5.2, 4.6, 2.8, 0.8], barWidth: 20, itemStyle: { color: '#7ba37f', borderRadius: [5, 5, 0, 0] } }]
}
const dropOption = {
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 24, bottom: 26 },
  xAxis: { type: 'category', data: ['11-03', '11-04', '11-05', '11-06', '11-07', '11-08', '11-09'], axisLabel: { fontSize: 10, color: '#8b998f' } },
  yAxis: { type: 'value', splitLine: { lineStyle: { color: '#eef2e8' } }, axisLabel: { fontSize: 10, color: '#8b998f' } },
  series: [{ type: 'line', smooth: true, data: [2, 1, 3, 0, 2, 1, 2], lineStyle: { color: '#c28632', width: 2.5 }, areaStyle: { color: 'rgba(194,134,50,.08)' }, symbol: 'circle', symbolSize: 5 }]
}

const columns = [
  { prop: 'id', label: '编号', width: 110 },
  { prop: 'name', label: '传感器', minWidth: 190 },
  { prop: 'sub', label: '采集指标', width: 130 },
  { prop: 'plot', label: '地块', width: 110 },
  { prop: 'rate', label: '采集频率', width: 100 },
  { prop: 'value', label: '最近读数', minWidth: 140 },
  { prop: 'last', label: '最近上报', width: 150 },
  { prop: 'status', label: '状态', width: 80, type: 'tag' }
]
const filters = [
  { key: 'status', label: '状态', options: ['运行', '离线', '故障'].map(v => ({ label: v, value: v })) }
]
const rowActions = [{ key: 'config', label: '配置' }, { key: 'view', label: '数据' }]

function refresh() { ElMessage.success('采集状态已刷新') }
function onAction({ action, row }) {
  if (action === 'config') {
    cfg.rate = row.rate === '—' ? '60秒' : row.rate
    cfgOpen.value = true
  } else {
    ElMessage.success(`已加载「${row.name}」最近 24 小时数据`)
  }
}
function saveCfg() { cfgOpen.value = false; ElMessage.success('采集参数已保存') }
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.unit { margin-left: 6px; font-size: 12px; color: var(--ink-400); }
@media (max-width: 1100px) { .stat-grid { grid-template-columns: 1fr 1fr; } .chart-row { grid-template-columns: 1fr; } }
</style>
