<template>
  <div class="page-wrap">
    <PageHeader title="系统参数配置" sub="字典数据 / 告警阈值 / 采集频率 / 会员规则">
      <template #actions><el-button type="primary" :icon="Check" @click="saveAll">保存全部</el-button></template>
    </PageHeader>

    <div class="param-grid">
      <div class="card param-side">
        <button v-for="t in tabs" :key="t.key" class="ps-item" :class="{ on: tab === t.key }" @click="tab = t.key">
          <span class="ps-ico"><component :is="t.icon" /></span>
          <div><b>{{ t.label }}</b><small>{{ t.desc }}</small></div>
          <el-icon v-if="tab === t.key"><ArrowRight /></el-icon>
        </button>
        <div class="ps-note">
          <el-icon><InfoFilled /></el-icon>
          <span>参数修改后立即生效，并记录到操作日志。</span>
        </div>
      </div>

      <div class="card param-main">
        <template v-if="tab === 'dict'">
          <div class="card-head"><h3>字典数据</h3><span class="sub">{{ admin.dicts.length }} 组</span><div class="acts"><el-button text type="primary" @click="addDict">新增字典</el-button></div></div>
          <el-table :data="admin.dicts" stripe>
            <el-table-column prop="code" label="字典编码" width="160" />
            <el-table-column prop="name" label="名称" width="140" />
            <el-table-column prop="val" label="字典值" min-width="300" />
            <el-table-column prop="param" label="参数说明" width="160" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }"><el-button link type="primary" size="small" @click="editDict(row)">编辑</el-button></template>
            </el-table-column>
          </el-table>
        </template>

        <template v-else-if="tab === 'threshold'">
          <div class="card-head"><h3>告警阈值</h3><span class="sub">按地块默认值，可单独覆盖</span></div>
          <div class="param-form">
            <el-form label-width="140px" label-position="left">
              <el-form-item label="温度上限"><el-input-number v-model="admin.threshold.temp" :min="0" :max="60" /> <span class="unit">℃</span></el-form-item>
              <el-form-item label="土壤湿度下限"><el-input-number v-model="admin.threshold.humidity" :min="0" :max="100" /> <span class="unit">%</span></el-form-item>
              <el-form-item label="溶氧下限"><el-input-number v-model="admin.threshold.oxygen" :min="0" :max="20" :step="0.1" /> <span class="unit">mg/L</span></el-form-item>
              <el-form-item label="连续触发次数"><el-input-number v-model="admin.threshold.repeat" :min="1" :max="10" /> <span class="unit">次</span></el-form-item>
              <el-form-item label="短信通知"><el-switch v-model="admin.threshold.sms" active-text="紧急告警同时发送短信" /></el-form-item>
            </el-form>
            <div class="notice-item"><el-icon><InfoFilled /></el-icon><span>当前阈值：温度 &gt; {{ admin.threshold.temp }}℃、湿度 &lt; {{ admin.threshold.humidity }}%、溶氧 &lt; {{ admin.threshold.oxygen }}mg/L 时触发告警。</span></div>
          </div>
        </template>

        <template v-else-if="tab === 'freq'">
          <div class="card-head"><h3>采集频率</h3><span class="sub">传感器上报周期</span></div>
          <div class="freq-list">
            <div v-for="f in freqs" :key="f.label" class="freq-row">
              <div><b>{{ f.label }}</b><span>{{ f.desc }}</span></div>
              <el-radio-group v-model="freq"><el-radio-button v-for="v in ['30秒', '60秒', '120秒', '300秒']" :key="v" :value="v">{{ v }}</el-radio-button></el-radio-group>
            </div>
          </div>
          <div class="notice-item" style="margin:16px 20px"><el-icon><InfoFilled /></el-icon><span>提高采集频率会增加设备功耗与流量消耗，建议环境传感器使用 60 秒，水质传感器使用 120 秒。</span></div>
        </template>

        <template v-else>
          <div class="card-head"><h3>会员等级规则</h3><span class="sub">按累计消费自动升级</span></div>
          <div class="level-list">
            <div v-for="l in levels" :key="l.name" class="level-row">
              <span class="level-dot" :style="{ background: l.color }"></span>
              <div><b>{{ l.name }}</b><span>累计消费满 ¥{{ l.need }}</span></div>
              <el-tag effect="plain">{{ l.discount }} 折优惠</el-tag>
            </div>
          </div>
        </template>
      </div>
    </div>

    <el-dialog v-model="dictOpen" :title="dictForm.code ? '编辑字典' : '新增字典'" width="520px">
      <el-form label-width="80px" label-position="left">
        <el-form-item label="编码"><el-input v-model="dictForm.code" /></el-form-item>
        <el-form-item label="名称"><el-input v-model="dictForm.name" /></el-form-item>
        <el-form-item label="字典值"><el-input v-model="dictForm.val" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="说明"><el-input v-model="dictForm.param" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dictOpen = false">取消</el-button>
        <el-button type="primary" @click="saveDict">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, ArrowRight } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()
const tab = ref('dict')
const tabs = [
  { key: 'dict', label: '字典数据', desc: '作物、设备、告警类型', icon: 'Menu' },
  { key: 'threshold', label: '告警阈值', desc: '温度、湿度、溶氧', icon: 'Warning' },
  { key: 'freq', label: '采集频率', desc: '传感器上报周期', icon: 'Odometer' },
  { key: 'level', label: '会员等级', desc: '消费升级与折扣', icon: 'Medal' }
]
const freqs = [
  { label: '环境传感器', desc: '空气温湿度、光照、CO₂' },
  { label: '土壤传感器', desc: '土壤温湿度、pH、EC' },
  { label: '水质传感器', desc: '溶氧、pH、氨氮' },
  { label: '气象站', desc: '风速风向、降雨量' }
]
const freq = ref('60秒')
const levels = [
  { name: '新芽会员', need: 0, discount: '无', color: '#a8b98a' },
  { name: '青梅会员', need: 200, discount: '9.5', color: '#7ba37f' },
  { name: '金穗会员', need: 800, discount: '9', color: '#c28632' },
  { name: '庄园会员', need: 2000, discount: '8.5', color: '#8a6a35' }
]
const dictOpen = ref(false)
const dictForm = reactive({ code: '', name: '', val: '', param: '' })

function addDict() { Object.assign(dictForm, { code: '', name: '', val: '', param: '' }); dictOpen.value = true }
function editDict(row) { Object.assign(dictForm, row); dictOpen.value = true }
function saveDict() {
  if (!dictForm.code.trim()) return ElMessage.warning('请填写字典编码')
  const idx = admin.dicts.findIndex(d => d.code === dictForm.code)
  if (idx > -1) admin.update('dicts', dictForm.code, { name: dictForm.name, val: dictForm.val, param: dictForm.param })
  else admin.add('dicts', { ...dictForm })
  dictOpen.value = false
  ElMessage.success('字典已保存')
}
function saveAll() {
  admin.save()
  ElMessage.success('全部参数已保存')
}
</script>

<style scoped>
.param-grid { display: grid; grid-template-columns: 240px 1fr; gap: 16px; }
.param-side { padding: 10px; height: fit-content; }
.ps-item { width: 100%; display: flex; align-items: center; gap: 10px; padding: 11px 10px; border: none; background: transparent; border-radius: 10px; cursor: pointer; text-align: left; color: var(--ink-600, #4d5c53); }
.ps-item:hover { background: #f8faf4; }
.ps-item.on { background: var(--brand-50); color: var(--brand-800); }
.ps-ico { width: 30px; height: 30px; border-radius: 8px; background: #fff; border: 1px solid var(--line); display: grid; place-items: center; font-size: 14px; color: var(--brand-600); flex: 0 0 30px; }
.ps-item b { display: block; font-size: 12.5px; }
.ps-item small { display: block; font-size: 10px; color: var(--ink-400); }
.ps-item .el-icon { margin-left: auto; font-size: 12px; color: var(--brand-500); }
.ps-note { display: flex; gap: 6px; margin: 12px 8px 4px; font-size: 10.5px; color: var(--ink-400); line-height: 1.6; padding-top: 10px; border-top: 1px dashed var(--line); }
.param-main { overflow: hidden; min-height: 420px; }
.param-form { padding: 20px 22px; }
.param-form .unit { margin-left: 8px; font-size: 12px; color: var(--ink-400); }
.notice-item { display: flex; gap: 8px; align-items: flex-start; background: #eef5fa; border: 1px solid #dbe8f1; color: #4a718c; padding: 11px 14px; border-radius: 10px; font-size: 12px; line-height: 1.65; }
.freq-list, .level-list { padding: 8px 20px 14px; }
.freq-row, .level-row { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid #f2f4ee; }
.freq-row > div, .level-row > div { flex: 1; }
.freq-row b, .level-row b { display: block; font-size: 13px; }
.freq-row span, .level-row span { display: block; font-size: 11px; color: var(--ink-400); }
.level-dot { width: 10px; height: 10px; border-radius: 50%; }
@media (max-width: 900px) { .param-grid { grid-template-columns: 1fr; } .param-side { display: grid; grid-template-columns: 1fr 1fr; } .ps-note { grid-column: 1 / -1; } }
</style>
