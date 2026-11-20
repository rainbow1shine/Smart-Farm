<template>
  <div v-if="trace" class="trace-panel">
    <div class="tp-head">
      <div class="qr">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h2v2h2v2h-2v2"/></svg>
      </div>
      <div class="tp-code">
        <div class="code">{{ trace.code }}</div>
        <div class="tiny muted">{{ trace.crop }} · {{ trace.plot }}</div>
      </div>
      <StatusTag :status="trace.status" />
    </div>

    <div class="pass-banner">
      <span class="dot"></span>
      <b>检测合格</b>
      <span>本批次农残检测全部合格，可放心食用</span>
    </div>

    <el-timeline class="trace-timeline">
      <el-timeline-item
        v-for="(s, i) in steps"
        :key="i"
        :timestamp="s.time"
        placement="top"
        :color="i === steps.length - 1 ? '#c28632' : '#4f7f56'"
      >
        <div class="step">
          <div class="step-icon">{{ s.icon }}</div>
          <div>
            <h4>{{ s.title }}</h4>
            <p>{{ s.text }}</p>
          </div>
        </div>
      </el-timeline-item>
    </el-timeline>

    <div class="trace-foot">
      <el-icon><InfoFilled /></el-icon>
      <span>该溯源码由平台「一物一码」生成，共查询 <b>{{ scanCount }}</b> 次。扫码记录可追溯，请认准包装上的溯源标签。</span>
    </div>
  </div>
  <div v-else class="empty-box">
    <div class="icon">🔎</div>
    <div>未找到该溯源批次，请检查批次码</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import DB from '@/data/db'
import StatusTag from './StatusTag.vue'

const props = defineProps({ code: String, trace: Object })

const t = computed(() => props.trace || DB.traces.find(x => x.code === props.code))
const test = computed(() => DB.tests.find(x => x.batch === t.value?.batch))
const harvest = computed(() => DB.harvests.find(x => x.batch === t.value?.batch))
const scanCount = computed(() => (props.code || t.value?.code || '').length * 7 + 12)

const steps = computed(() => {
  const x = t.value
  if (!x) return []
  return [
    { icon: '🏡', title: '产地地块', text: `${x.plot} · 生产批次 ${x.batch}`, time: '' },
    { icon: '🌡️', title: '生长环境', text: `${x.env}，温度 20–26℃、湿度 62–75%，处于适宜区间`, time: '全程监测' },
    { icon: '🌱', title: '农事操作', text: `${x.work}；${x.input}，均按技术方案执行`, time: '生产期' },
    { icon: '🧺', title: '采收分级', text: harvest.value ? `${harvest.value.date} 采收 ${harvest.value.qty}kg，${harvest.value.grade}` : '采收批次信息已归档', time: harvest.value?.date || '' },
    { icon: '🛡️', title: '农残检测', text: test.value ? `${test.value.org} · ${test.value.no} · ${test.value.result}` : x.test, time: test.value?.date || '' },
    { icon: '🚚', title: '冷链配送', text: '采摘后 2 小时预冷至 4℃，当日发运，重庆市内次日达', time: '采后 2 小时' }
  ]
})
</script>

<style scoped>
.trace-panel { background: #fff; border: 1px solid var(--line); border-radius: var(--radius); padding: 22px; }
.tp-head { display: flex; align-items: center; gap: 12px; padding-bottom: 16px; border-bottom: 1px dashed var(--line); }
.qr { width: 46px; height: 46px; border-radius: 12px; background: var(--brand-50); color: var(--brand-600); display: grid; place-items: center; flex: 0 0 46px; }
.tp-code { flex: 1; min-width: 0; }
.code { font-size: 18px; font-weight: 700; letter-spacing: .6px; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
.pass-banner { display: flex; align-items: center; gap: 8px; margin: 16px 0 22px; padding: 11px 14px; background: #eef8ea; border: 1px solid #d7ecd0; border-radius: 10px; color: #3e6b42; font-size: 12.5px; }
.pass-banner .dot { width: 7px; height: 7px; border-radius: 50%; background: #4f9a5b; box-shadow: 0 0 0 3px rgba(79,154,91,.14); }
.trace-timeline { padding-left: 4px; margin-top: 4px; }
.step { display: flex; gap: 10px; padding: 2px 0 8px; }
.step-icon { width: 30px; height: 30px; border-radius: 9px; background: var(--brand-50); display: grid; place-items: center; font-size: 15px; flex: 0 0 30px; }
.step h4 { font-size: 13px; font-weight: 600; margin-bottom: 3px; }
.step p { font-size: 12.5px; color: var(--ink-500); line-height: 1.7; }
.trace-foot { display: flex; gap: 8px; align-items: flex-start; margin-top: 12px; padding: 11px 13px; background: #f2f7fb; border: 1px solid #dbe9f3; border-radius: 10px; color: #4a718c; font-size: 12px; line-height: 1.7; }
</style>
