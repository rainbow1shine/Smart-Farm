<template>
  <div class="trace-page">
    <section class="trace-hero">
      <div class="th-inner">
        <div class="th-copy">
          <span class="kicker">ONE CODE · FULL JOURNEY</span>
          <h1>一物一码，<br /><em>看见食物的来路</em></h1>
          <p>输入包装上的溯源码，查看它生长的地块、经历的环境、做过的农事和上市前的农残检测。每一份农产品，都应该说得清自己的故事。</p>
          <div class="trace-search">
            <el-input v-model="code" size="large" clearable placeholder="请输入溯源码，如 TR-00021" @keyup.enter="query">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-button type="primary" size="large" @click="query">查询档案</el-button>
          </div>
          <div class="quick-codes">
            <span>示例批次</span>
            <button v-for="t in published" :key="t.code" @click="pick(t.code)">{{ t.code }}</button>
          </div>
        </div>
        <div class="th-visual">
          <div class="qr-card">
            <div class="qr-frame" v-html="qrSvg(150)"></div>
            <b>{{ currentTrace?.code || 'TR-00021' }}</b>
            <span>{{ currentTrace?.crop || '黄瓜（津优35）' }}</span>
            <div class="qr-pass"><i></i>农残检测合格</div>
          </div>
          <div class="float-chip c1"><span>🌡️</span><div><b>全程环境</b><small>60 秒采集一次</small></div></div>
          <div class="float-chip c2"><span>🧪</span><div><b>批批送检</b><small>合格才生成溯源码</small></div></div>
        </div>
      </div>
    </section>

    <div class="trace-body">
      <div v-if="currentTrace" class="trace-grid">
        <div class="trace-main">
          <div class="result-head">
            <div>
              <span class="kicker">TRACE RESULT</span>
              <h2>溯源档案</h2>
            </div>
            <div class="result-code">
              <el-icon><Ticket /></el-icon>
              <b>{{ currentTrace.code }}</b>
              <StatusTag :status="currentTrace.status" />
            </div>
          </div>

          <TraceTimeline :trace="currentTrace" />

          <div class="card agri-card">
            <div class="card-head">
              <h3>农事操作记录</h3>
              <span class="sub">按时间排序 · 共 {{ agriLogs.length }} 条</span>
            </div>
            <div class="agri-list">
              <div v-for="(log, i) in agriLogs" :key="i" class="agri-row">
                <span class="agri-ico">{{ log.icon }}</span>
                <div class="agri-main">
                  <b>{{ log.title }}</b>
                  <p>{{ log.text }}</p>
                </div>
                <span class="agri-date">{{ log.date }}</span>
              </div>
            </div>
          </div>
        </div>

        <aside class="trace-side">
          <div class="card side-card">
            <div class="sc-head"><h3>批次信息</h3><span class="tag">已归档</span></div>
            <div class="fact"><span>溯源码</span><b>{{ currentTrace.code }}</b></div>
            <div class="fact"><span>生产批次</span><b>{{ currentTrace.batch }}</b></div>
            <div class="fact"><span>作物品种</span><b>{{ currentTrace.crop }}</b></div>
            <div class="fact"><span>种植地块</span><b>{{ currentTrace.plot }}</b></div>
            <div class="fact"><span>采收日期</span><b>{{ harvest?.date || '—' }}</b></div>
            <div class="fact"><span>采收数量</span><b>{{ harvest ? harvest.qty + ' kg' : '—' }}</b></div>
            <div class="fact"><span>分级结果</span><b>{{ harvest?.grade || '—' }}</b></div>
          </div>

          <div class="card side-card test-card">
            <div class="sc-head"><h3>农残检测</h3><StatusTag :status="test?.result || '检测中'" /></div>
            <div class="test-no">{{ test?.no || '检测报告生成中' }}</div>
            <p class="test-org">{{ test?.org || '重庆市农科院检测中心' }}</p>
            <div class="test-items">{{ test?.items || '有机磷、氨基甲酸酯、拟除虫菊酯共 24 项' }}</div>
            <div class="test-pass"><el-icon><CircleCheckFilled /></el-icon>全部检测项目合格</div>
            <button class="test-file" @click="downloadReport"><el-icon><Document /></el-icon>{{ test?.file || '检测报告.pdf' }}</button>
          </div>

          <div class="card side-card">
            <div class="sc-head"><h3>环境摘要</h3><span class="sub">近 30 天</span></div>
            <div class="env-grid">
              <div v-for="e in envStats" :key="e.label"><span>{{ e.icon }}</span><b>{{ e.value }}</b><small>{{ e.label }}</small></div>
            </div>
            <div class="env-note"><i></i>环境数据均在适宜区间内</div>
          </div>

          <div class="side-help">
            <span>🔎</span>
            <div><b>查不到信息？</b><p>请确认溯源码是否完整，或联系包装上的农户电话。</p></div>
          </div>
        </aside>
      </div>

      <div v-else class="card empty-box no-result">
        <div class="icon">🔎</div>
        <div>未找到溯源码「{{ code }}」对应的批次</div>
        <p class="muted tiny">请检查输入是否正确，也可以直接点击示例批次体验。</p>
        <div class="empty-codes">
          <button v-for="t in published" :key="t.code" @click="pick(t.code)">{{ t.code }}</button>
        </div>
      </div>

      <section class="recent-section">
        <div class="section-head">
          <div><span class="kicker">RECENT BATCHES</span><h2>最近发布批次</h2></div>
          <button class="more" @click="$router.push('/mall/products')">去买点新鲜的 <el-icon><ArrowRight /></el-icon></button>
        </div>
        <div class="recent-grid">
          <button v-for="t in published" :key="t.code" class="recent-card" :class="{ on: currentTrace?.code === t.code }" @click="pick(t.code)">
            <div class="rc-top">
              <span class="rc-ico">{{ cropIcon(t.crop) }}</span>
              <div>
                <b>{{ t.code }}</b>
                <span>{{ t.crop }}</span>
              </div>
              <StatusTag :status="t.status" />
            </div>
            <div class="rc-meta">
              <span><el-icon><Location /></el-icon>{{ t.plot }}</span>
              <span><el-icon><Calendar /></el-icon>{{ harvestDate(t) }}</span>
            </div>
            <div class="rc-foot"><span>{{ t.test }}</span><em>查看档案 →</em></div>
          </button>
        </div>
      </section>

      <section class="trace-cta">
        <div>
          <span class="kicker">FARM TO TABLE</span>
          <h2>想让餐桌上的每一份菜，都有据可查</h2>
          <p>平台为每个采收批次生成唯一溯源码，环境、农事、检测、物流全流程上链归档。</p>
        </div>
        <div class="cta-actions">
          <el-button type="primary" size="large" @click="$router.push('/mall/products')">去商城看看</el-button>
          <el-button size="large" @click="$router.push('/login')">进入管理后台</el-button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Ticket, CircleCheckFilled, Document, ArrowRight, Location, Calendar } from '@element-plus/icons-vue'
import TraceTimeline from '@/components/TraceTimeline.vue'
import StatusTag from '@/components/StatusTag.vue'
import DB from '@/data/db'
import { qrSvg } from '@/utils/format'

const route = useRoute()
const published = DB.traces.filter(t => t.code !== '—')
const defaultCode = published[0]?.code || ''
const code = ref(String(route.query.code || defaultCode))
const currentCode = ref(code.value)

const currentTrace = computed(() => DB.traces.find(t => t.code === currentCode.value))
const harvest = computed(() => DB.harvests.find(h => h.batch === currentTrace.value?.batch))
const test = computed(() => DB.tests.find(t => t.batch === currentTrace.value?.batch))

const envStats = computed(() => {
  const seed = (currentTrace.value?.code || 'TR-00021').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return [
    { icon: '🌡️', label: '平均温度', value: (21 + (seed % 5) * 0.4).toFixed(1) + '℃' },
    { icon: '💧', label: '平均湿度', value: (66 + (seed % 8)) + '%' },
    { icon: '☀️', label: '日均光照', value: (5.6 + (seed % 3) * 0.5).toFixed(1) + 'h' },
    { icon: '🌱', label: '土壤墒情', value: (42 + (seed % 9)) + '%' }
  ]
})

const agriLogs = computed(() => {
  const t = currentTrace.value
  if (!t) return []
  return [
    { icon: '🌱', title: '定植与缓苗', text: `${t.plot}完成定植，株距 35cm，滴灌系统同步启用。`, date: '2026-09-18' },
    { icon: '💧', title: '水肥一体化', text: '按方案追施水溶肥 2 次，灌溉 6 次，土壤湿度保持在 55%–70%。', date: '2026-10-12' },
    { icon: '🐛', title: '绿色防控', text: '悬挂黄板 40 张、诱虫灯 6 盏，优先采用物理防治，减少化学用药。', date: '2026-10-25' },
    { icon: '🧪', title: '上市前检测', text: '采收前抽样送检，24 项农残指标全部合格，安全间隔期已满足。', date: harvest.value?.date || '2026-11-09' },
    { icon: '🧺', title: '采收与分级', text: `当日 6:00 采收 ${harvest.value?.qty || 1260}kg，按果径与色泽完成分级。`, date: harvest.value?.date || '2026-11-09' }
  ]
})

watch(() => route.query.code, (value) => {
  if (value) {
    code.value = String(value)
    currentCode.value = String(value)
  }
})

function query() {
  const value = code.value.trim().toUpperCase()
  if (!value) return ElMessage.warning('请输入溯源码')
  if (!DB.traces.some(t => t.code === value && t.code !== '—')) {
    currentCode.value = value
    return ElMessage.warning('未找到该溯源码，试试 TR-00021')
  }
  currentCode.value = value
  ElMessage.success('已找到该批次溯源档案')
  document.querySelector('.trace-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
function pick(value) {
  code.value = value
  currentCode.value = value
  document.querySelector('.trace-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
function cropIcon(crop = '') {
  if (crop.includes('番茄')) return '🍅'
  if (crop.includes('黄瓜')) return '🥒'
  if (crop.includes('草莓')) return '🍓'
  if (crop.includes('稻') || crop.includes('米')) return '🌾'
  return '🌱'
}
function harvestDate(t) {
  return DB.harvests.find(h => h.batch === t.batch)?.date || '—'
}
function downloadReport() {
  ElMessage.success('检测报告已开始下载（演示环境）')
}
</script>

<style scoped>
.trace-page { background: var(--cream); }
.trace-hero { background: radial-gradient(110% 130% at 80% 10%, #dfeed8 0%, #f4f4ea 48%, #f7f5ee 100%); border-bottom: 1px solid rgba(224, 230, 218, .8); position: relative; overflow: hidden; }
.trace-hero::before { content: ""; position: absolute; left: -120px; bottom: -180px; width: 420px; height: 420px; border-radius: 50%; border: 1px dashed rgba(85, 130, 88, .22); }
.th-inner { max-width: 1200px; margin: 0 auto; padding: 62px 24px 56px; display: grid; grid-template-columns: 1.1fr .9fr; gap: 50px; align-items: center; position: relative; }
.kicker { font-size: 9.5px; letter-spacing: 2.2px; color: var(--brand-500); }
.th-copy h1 { font-size: 42px; line-height: 1.28; letter-spacing: .5px; margin: 12px 0 14px; color: var(--brand-900); }
.th-copy h1 em { font-style: normal; color: var(--brand-600); }
.th-copy > p { font-size: 13px; line-height: 1.95; color: var(--ink-500); max-width: 480px; }
.trace-search { display: flex; gap: 8px; margin-top: 24px; max-width: 470px; }
.quick-codes { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 12px; font-size: 10.5px; color: var(--ink-400); }
.quick-codes button { border: 1px solid var(--line-strong); background: rgba(255,255,255,.7); border-radius: 20px; padding: 3px 10px; font-size: 10.5px; color: var(--brand-700); cursor: pointer; font-family: ui-monospace, Consolas, monospace; }
.quick-codes button:hover { background: #fff; border-color: var(--brand-400); }
.th-visual { position: relative; display: flex; justify-content: center; align-items: center; min-height: 330px; }
.qr-card { width: 260px; background: #fff; border-radius: 22px; padding: 24px 22px 20px; text-align: center; box-shadow: 0 26px 60px rgba(31, 63, 39, .16); border: 1px solid rgba(255,255,255,.8); position: relative; z-index: 2; }
.qr-frame { display: inline-flex; padding: 9px; border: 1px solid var(--line); border-radius: 14px; background: #fff; }
.qr-card > b { display: block; font-size: 18px; letter-spacing: 1px; margin-top: 13px; font-family: ui-monospace, Consolas, monospace; }
.qr-card > span { display: block; font-size: 10.5px; color: var(--ink-400); margin-top: 2px; }
.qr-pass { display: inline-flex; align-items: center; gap: 5px; margin-top: 10px; font-size: 10px; color: #47724a; background: #eef8ea; border: 1px solid #d7ecd0; border-radius: 20px; padding: 3px 10px; }
.qr-pass i { width: 6px; height: 6px; border-radius: 50%; background: #4f9a5b; }
.float-chip { position: absolute; display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,.94); border: 1px solid #fff; border-radius: 13px; padding: 9px 12px; box-shadow: 0 12px 30px rgba(31,63,39,.12); z-index: 3; }
.float-chip span { font-size: 19px; }
.float-chip b { display: block; font-size: 11px; }
.float-chip small { font-size: 9px; color: var(--ink-400); }
.float-chip.c1 { left: 0; top: 44px; animation: float 5s ease-in-out infinite; }
.float-chip.c2 { right: -6px; bottom: 42px; animation: float 6s ease-in-out infinite reverse; }
@keyframes float { 50% { transform: translateY(-8px); } }
.trace-body { max-width: 1200px; margin: 0 auto; padding: 32px 24px 0; }
.trace-grid { display: grid; grid-template-columns: 1.55fr .75fr; gap: 24px; align-items: start; }
.result-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; margin-bottom: 14px; }
.result-head h2 { font-size: 24px; margin-top: 4px; }
.result-code { display: flex; align-items: center; gap: 7px; font-size: 11.5px; color: var(--ink-500); }
.result-code b { font-family: ui-monospace, Consolas, monospace; font-size: 13px; letter-spacing: .5px; }
.agri-card { margin-top: 18px; }
.agri-list { padding: 4px 20px 12px; }
.agri-row { display: flex; align-items: flex-start; gap: 11px; padding: 12px 0; border-bottom: 1px dashed #eef1e8; }
.agri-row:last-child { border-bottom: none; }
.agri-ico { width: 32px; height: 32px; border-radius: 9px; background: var(--brand-50); display: grid; place-items: center; font-size: 15px; flex: 0 0 32px; }
.agri-main { flex: 1; min-width: 0; }
.agri-main b { font-size: 12px; }
.agri-main p { font-size: 11px; color: var(--ink-400); line-height: 1.65; margin-top: 2px; }
.agri-date { font-size: 10.5px; color: var(--ink-300); flex: 0 0 auto; }
.trace-side { display: flex; flex-direction: column; gap: 14px; }
.side-card { padding: 17px 18px; }
.sc-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
.sc-head h3 { font-size: 13.5px; }
.sc-head .tag { font-size: 9.5px; color: var(--brand-600); background: var(--brand-50); border-radius: 20px; padding: 2px 8px; }
.fact { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 6.5px 0; border-bottom: 1px dashed #eef1e8; font-size: 11px; }
.fact:last-child { border-bottom: none; }
.fact span { color: var(--ink-400); flex: 0 0 60px; }
.fact b { font-weight: 500; text-align: right; word-break: break-all; }
.test-card { background: linear-gradient(160deg, #fbfdf7, #f5f9ee); }
.test-no { font-family: ui-monospace, Consolas, monospace; font-size: 12.5px; font-weight: 600; }
.test-org { font-size: 10px; color: var(--ink-400); margin: 2px 0 8px; }
.test-items { font-size: 10.5px; color: var(--ink-500); line-height: 1.6; background: #fff; border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; }
.test-pass { display: flex; align-items: center; gap: 5px; margin-top: 9px; font-size: 10.5px; color: #47724a; }
.test-file { display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%; margin-top: 10px; border: 1px dashed var(--brand-300); background: var(--brand-50); color: var(--brand-700); border-radius: 8px; padding: 7px; font-size: 10.5px; cursor: pointer; }
.test-file:hover { background: #e9f4e3; }
.env-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.env-grid div { background: #fafbf6; border: 1px solid #eef1e8; border-radius: 10px; padding: 9px; text-align: center; }
.env-grid span { font-size: 15px; }
.env-grid b { display: block; font-size: 15px; color: var(--brand-700); margin-top: 1px; }
.env-grid small { font-size: 9px; color: var(--ink-400); }
.env-note { display: flex; align-items: center; gap: 6px; margin-top: 10px; font-size: 10px; color: var(--ink-400); }
.env-note i { width: 5px; height: 5px; border-radius: 50%; background: #4f9a5b; }
.side-help { display: flex; gap: 9px; padding: 13px 14px; background: #fdf6e8; border: 1px solid #f1e2c4; border-radius: 12px; }
.side-help span { font-size: 19px; }
.side-help b { display: block; font-size: 11.5px; color: #8a6527; }
.side-help p { font-size: 10.5px; color: #a58652; line-height: 1.6; margin-top: 2px; }
.no-result { margin-bottom: 8px; }
.empty-codes { display: flex; justify-content: center; gap: 6px; margin-top: 14px; flex-wrap: wrap; }
.empty-codes button { border: 1px solid var(--line-strong); background: #fff; border-radius: 20px; padding: 3px 10px; font-size: 10.5px; color: var(--brand-700); cursor: pointer; font-family: ui-monospace, Consolas, monospace; }
.recent-section { margin-top: 46px; }
.recent-section .kicker { color: var(--brand-500); }
.section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 18px; flex-wrap: wrap; }
.section-head h2 { font-size: 24px; margin-top: 4px; }
.more { border: none; background: transparent; font-size: 12px; color: var(--ink-500); cursor: pointer; display: inline-flex; align-items: center; gap: 3px; }
.more:hover { color: var(--brand-600); }
.recent-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.recent-card { text-align: left; background: #fff; border: 1px solid var(--line); border-radius: 15px; padding: 15px 17px; cursor: pointer; transition: all .18s; }
.recent-card:hover, .recent-card.on { border-color: var(--brand-300); box-shadow: 0 10px 24px rgba(50, 80, 55, .08); transform: translateY(-2px); }
.rc-top { display: flex; align-items: center; gap: 10px; }
.rc-ico { width: 38px; height: 38px; border-radius: 11px; background: var(--brand-50); display: grid; place-items: center; font-size: 20px; flex: 0 0 38px; }
.rc-top > div { flex: 1; min-width: 0; }
.rc-top b { display: block; font-size: 12.5px; font-family: ui-monospace, Consolas, monospace; }
.rc-top span { font-size: 10.5px; color: var(--ink-400); }
.rc-meta { display: flex; gap: 16px; margin: 10px 0 9px; padding-bottom: 9px; border-bottom: 1px dashed var(--line); flex-wrap: wrap; }
.rc-meta span { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; color: var(--ink-400); }
.rc-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 10.5px; color: var(--brand-600); }
.rc-foot em { font-style: normal; color: var(--ink-400); }
.trace-cta { margin: 50px 0 20px; padding: 30px 34px; border-radius: 22px; background: linear-gradient(120deg, #2e5137, #47754c 62%, #6c9667); color: #eaf3e6; display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
.trace-cta > div:first-child { flex: 1; min-width: 260px; }
.trace-cta .kicker { color: #a9d0a0; }
.trace-cta h2 { font-size: 22px; color: #fff; margin: 5px 0 5px; }
.trace-cta p { font-size: 12px; color: #bdd6bd; }
.cta-actions { display: flex; gap: 9px; flex-wrap: wrap; }
.cta-actions :deep(.el-button--primary) { --el-button-bg-color: #d7e9bf; --el-button-border-color: #d7e9bf; --el-button-text-color: #24402c; }
.cta-actions :deep(.el-button:not(.el-button--primary)) { background: transparent; border-color: rgba(255,255,255,.35); color: #eaf3e6; }
.cta-actions :deep(.el-button:not(.el-button--primary):hover) { background: rgba(255,255,255,.1); }
@media (max-width: 1040px) {
  .th-inner { grid-template-columns: 1fr; gap: 34px; padding-top: 46px; }
  .th-visual { min-height: 300px; }
  .trace-grid { grid-template-columns: 1fr; }
  .trace-side { display: grid; grid-template-columns: 1fr 1fr; }
  .side-help { grid-column: 1 / -1; }
}
@media (max-width: 700px) {
  .th-inner { padding: 36px 18px; }
  .th-copy h1 { font-size: 31px; }
  .trace-search { flex-direction: column; }
  .qr-card { width: 230px; }
  .float-chip { display: none; }
  .th-visual { min-height: 280px; }
  .trace-body { padding: 24px 16px 0; }
  .trace-side { grid-template-columns: 1fr; }
  .recent-grid { grid-template-columns: 1fr; }
  .section-head h2 { font-size: 20px; }
  .trace-cta { padding: 24px 20px; }
}
</style>
