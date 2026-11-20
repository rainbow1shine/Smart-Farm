<template>
  <div class="page-wrap">
    <PageHeader title="病虫害诊断" sub="农户问诊复核 / AI 辅助识别 / 防治方案">
      <template #actions>
        <el-button :icon="Refresh" @click="refresh">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="addOpen = true">新建问诊</el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="问诊总量" :value="cases.length" unit="例" foot="本周期累计" icon="ChatDotSquare" />
      <StatCard label="待复核" :value="pending.length" unit="例" foot="需农艺师确认" icon="Warning" tone="warn" />
      <StatCard label="已诊断" :value="cases.length - pending.length" unit="例" foot="已给出防治方案" icon="CircleCheck" />
      <StatCard label="AI 平均置信度" :value="avgConf" unit="%" foot="辅助识别结果" icon="MagicStick" tone="info" />
    </div>

    <div class="toolbar card">
      <div class="chips">
        <button v-for="t in tabs" :key="t" class="chip" :class="{ on: tab === t }" @click="tab = t">{{ t }}</button>
      </div>
      <span class="tiny muted">AI 识别结果仅作辅助，最终诊断需农艺师复核确认</span>
    </div>

    <div class="case-grid">
      <article v-for="c in shown" :key="c.id" class="case-card card" @click="openDetail(c)">
        <div class="cc-media">
          <span class="cc-emoji">{{ cropIcon(c.crop) }}</span>
          <span class="cc-status"><StatusTag :status="c.status" /></span>
          <span class="cc-imgs">{{ c.images }} 张照片</span>
        </div>
        <div class="cc-body">
          <div class="cc-head">
            <h3>{{ c.crop }} · {{ c.plot }}</h3>
            <span class="tiny muted">{{ c.id }}</span>
          </div>
          <p class="cc-q">{{ c.question }}</p>
          <div class="cc-ai"><el-icon><MagicStick /></el-icon> AI：{{ c.ai }}</div>
          <div class="cc-foot">
            <span>{{ c.reporter }} · {{ c.time.slice(5) }}</span>
            <el-button text type="primary" size="small">查看诊断</el-button>
          </div>
        </div>
      </article>
      <div v-if="!shown.length" class="card empty-box" style="grid-column:1/-1"><div class="icon">🔬</div><div>暂无相关问诊</div></div>
    </div>

    <el-drawer v-model="detailOpen" title="问诊诊断" size="520px">
      <div v-if="current" class="pd">
        <div class="pd-head">
          <div>
            <h3>{{ current.crop }} · {{ current.plot }}</h3>
            <p class="tiny muted">{{ current.id }} · {{ current.reporter }} 提交于 {{ current.time }}</p>
          </div>
          <StatusTag :status="current.status" />
        </div>
        <div class="pd-photos">
          <div v-for="i in current.images" :key="i" class="photo">
            <span>{{ cropIcon(current.crop) }}</span>
            <small>田间照片 {{ i }}</small>
          </div>
        </div>
        <div class="pd-block">
          <h4>农户描述</h4>
          <p>{{ current.question }}</p>
        </div>
        <div class="pd-block ai-block">
          <div class="ai-head"><el-icon><MagicStick /></el-icon><b>AI 辅助识别</b><span>置信度 {{ current.ai.match(/\d+/) ? current.ai.match(/\d+/)[0] : 70 }}%</span></div>
          <p>{{ current.ai }}</p>
          <el-progress :percentage="Number(current.ai.match(/\d+/)?.[0] || 70)" :stroke-width="8" :show-text="false" />
        </div>
        <div class="pd-block">
          <h4>防治建议</h4>
          <el-input v-model="advice" type="textarea" :rows="4" placeholder="填写复核结论与防治方案…" />
        </div>
        <div class="pd-tip"><el-icon><InfoFilled /></el-icon> 建议同时下发农事技术方案，并提醒农户注意农药安全间隔期。</div>
      </div>
      <template #footer>
        <el-button @click="detailOpen = false">关闭</el-button>
        <el-button type="success" plain @click="confirmDiagnosis">确认诊断</el-button>
        <el-button type="primary" @click="sendPlan">下发防治方案</el-button>
      </template>
    </el-drawer>

    <el-dialog v-model="addOpen" title="新建病虫害问诊" width="560px" destroy-on-close>
      <el-form label-width="86px" label-position="left">
        <el-form-item label="地块">
          <el-select v-model="form.plot" class="w-full">
            <el-option v-for="p in DB.plots" :key="p.id" :label="p.name" :value="p.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="作物"><el-input v-model="form.crop" /></el-form-item>
        <el-form-item label="上报人"><el-input v-model="form.reporter" /></el-form-item>
        <el-form-item label="问题描述"><el-input v-model="form.question" type="textarea" :rows="4" placeholder="描述症状、发生部位、环境条件…" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addOpen = false">取消</el-button>
        <el-button type="primary" @click="submitCase">提交并 AI 识别</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Plus, MagicStick, InfoFilled } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useAdminStore } from '@/stores/admin'
import DB from '@/data/db'

const admin = useAdminStore()
const cases = computed(() => admin.pestCases)
const pending = computed(() => cases.value.filter(c => c.status === '待复核'))
const avgConf = computed(() => Math.round(cases.value.reduce((a, b) => a + Number(b.ai?.match(/\d+/)?.[0] || 0), 0) / (cases.value.length || 1)))
const tabs = ['全部', '待复核', '已诊断']
const tab = ref('全部')
const shown = computed(() => tab.value === '全部' ? cases.value : cases.value.filter(c => c.status === tab.value))
const detailOpen = ref(false)
const addOpen = ref(false)
const current = ref(null)
const advice = ref('')
const form = reactive({ plot: DB.plots[0].name, crop: '草莓', reporter: '吴农户', question: '' })

const cropIcon = (c) => ({ 草莓: '🍓', 番茄: '🍅', 黄瓜: '🥒', 玉米: '🌽', 水稻: '🌾', 小白菜: '🥬' }[c] || '🌱')

function openDetail(c) {
  current.value = c
  advice.value = c.advice || (c.status === '已诊断' ? '建议按 AI 识别结果进行针对性防治，注意通风降湿并记录用药。' : '')
  detailOpen.value = true
}
function confirmDiagnosis() {
  if (!advice.value.trim()) return ElMessage.warning('请填写复核结论')
  admin.update('pestCases', current.value.id, { status: '已诊断', advice: advice.value.trim() })
  detailOpen.value = false
  ElMessage.success('诊断已确认')
}
function sendPlan() {
  if (!advice.value.trim()) return ElMessage.warning('请先填写防治建议')
  admin.addTechPlan({ plot: current.value.plot, crop: current.value.crop, stage: '生长期', type: '病虫害防治', content: advice.value.trim(), author: '张农艺' })
  admin.update('pestCases', current.value.id, { status: '已诊断', advice: advice.value.trim() })
  detailOpen.value = false
  ElMessage.success('防治方案已下发至农户')
}
function submitCase() {
  if (!form.question.trim()) return ElMessage.warning('请填写问题描述')
  admin.addPestCase({ plot: form.plot, crop: form.crop, reporter: form.reporter, question: form.question.trim(), images: 2, ai: `${form.crop}疑似病害（置信度 76%）` })
  addOpen.value = false
  form.question = ''
  ElMessage.success('问诊已提交，AI 识别完成')
}
function refresh() { ElMessage.success('问诊数据已刷新') }
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.toolbar { display: flex; align-items: center; gap: 12px; padding: 11px 14px; margin-bottom: 14px; flex-wrap: wrap; }
.chips { display: flex; gap: 6px; }
.case-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.case-card { overflow: hidden; cursor: pointer; transition: transform .18s, box-shadow .18s; }
.case-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
.cc-media { position: relative; height: 124px; display: grid; place-items: center; background: linear-gradient(135deg, #f0f8ef, #dcecdc); }
.cc-emoji { font-size: 52px; }
.cc-status { position: absolute; top: 10px; right: 10px; }
.cc-imgs { position: absolute; left: 10px; bottom: 10px; font-size: 10px; color: var(--brand-700); background: rgba(255,255,255,.8); border-radius: 20px; padding: 2px 8px; }
.cc-body { padding: 13px 15px 14px; }
.cc-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.cc-head h3 { font-size: 13.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cc-q { font-size: 11.5px; color: var(--ink-500); line-height: 1.6; margin-top: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 37px; }
.cc-ai { display: flex; align-items: center; gap: 5px; font-size: 10.5px; color: var(--brand-700); background: var(--brand-50); border-radius: 6px; padding: 5px 7px; margin-top: 8px; }
.cc-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; font-size: 10.5px; color: var(--ink-300); }
.pd-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding-bottom: 14px; border-bottom: 1px solid var(--line); }
.pd-head h3 { font-size: 16px; }
.pd-photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 14px 0; }
.photo { height: 94px; border-radius: 10px; background: linear-gradient(135deg, #eef6ec, #dcebd9); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; border: 1px dashed var(--brand-200); }
.photo span { font-size: 30px; }
.photo small { font-size: 9px; color: var(--ink-400); }
.pd-block { padding: 12px 0; border-bottom: 1px solid #f2f4ee; }
.pd-block h4 { font-size: 12.5px; margin-bottom: 7px; color: var(--ink-700); }
.pd-block p { font-size: 12.5px; color: var(--ink-500); line-height: 1.75; }
.ai-block { background: var(--brand-50); border: 1px solid var(--brand-100); border-radius: 10px; padding: 12px 13px; margin: 12px 0; }
.ai-head { display: flex; align-items: center; gap: 6px; margin-bottom: 5px; color: var(--brand-700); }
.ai-head b { font-size: 12.5px; }
.ai-head span { margin-left: auto; font-size: 10.5px; color: var(--brand-600); }
.ai-block p { margin-bottom: 8px; color: var(--brand-800); }
.pd-tip { display: flex; gap: 7px; padding: 10px 12px; border-radius: 9px; background: #fdf9ef; border: 1px solid #f0e2c5; color: #8a672c; font-size: 11.5px; line-height: 1.7; margin-top: 12px; }
@media (max-width: 1100px) { .case-grid { grid-template-columns: repeat(2, 1fr); } .stat-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 700px) { .case-grid { grid-template-columns: 1fr; } .stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; } }
</style>
