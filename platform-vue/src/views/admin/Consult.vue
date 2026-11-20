<template>
  <div class="page-wrap">
    <PageHeader :title="isExpert ? '农户咨询应答' : '我的技术咨询'" :sub="isExpert ? '接收农户提问、持续对话、给出专业建议' : '向农艺技术人员提问，支持多轮对话与视频连线'">
      <template #actions>
        <el-button v-if="!isExpert" type="primary" :icon="Plus" @click="createOpen = true">发起新咨询</el-button>
        <el-button :icon="VideoCamera" @click="videoCall">视频连线</el-button>
        <el-button :icon="Refresh" @click="refresh">刷新</el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard :label="isExpert ? '咨询总数' : '我的咨询'" :value="consults.length" unit="条" :foot="isExpert ? '全部农户提问' : '历史对话累计'" icon="ChatLineSquare" />
      <StatCard label="待回复" :value="pending.length" unit="条" :foot="isExpert ? '平均响应 12 分钟' : '等待农艺师回复'" icon="Timer" tone="warn" />
      <StatCard label="已回复" :value="consults.length - pending.length" unit="条" :foot="isExpert ? '农户满意度 4.8 星' : '已得到专业建议'" icon="CircleCheck" />
      <StatCard :label="isExpert ? '在线农户' : '在线农艺师'" :value="isExpert ? 3 : 2" :unit="isExpert ? '人' : '人'" :foot="isExpert ? '龙 / 王 / 张' : '朱 / 王'" icon="User" tone="info" />
    </div>

    <div class="consult-layout">
      <aside class="conv-list card">
        <div class="cl-head">
          <h3>{{ isExpert ? '农户咨询会话' : '我的咨询记录' }}</h3>
          <el-input v-model="keyword" :placeholder="isExpert ? '搜索农户 / 主题' : '搜索咨询主题'" clearable size="small">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <div class="cl-tabs">
          <button v-for="t in tabs" :key="t" :class="{ on: tab === t }" @click="tab = t">{{ t }}<span v-if="t !== '全部'">{{ t === '待回复' ? pending.length : consults.length - pending.length }}</span></button>
        </div>
        <div class="cl-rows">
          <button v-for="c in shown" :key="c.id" class="conv-item" :class="{ on: current?.id === c.id }" @click="select(c)">
            <span class="conv-avatar">{{ (isExpert ? c.from : (c.from === auth.user?.name ? '我' : c.from)).slice(0, 1) }}</span>
            <div class="conv-main">
              <div class="conv-title"><b>{{ isExpert ? c.from : '农艺师 · 朱' }}</b><span>{{ c.time.slice(5, 10) }}</span></div>
              <p>{{ lastText(c) }}</p>
              <span class="conv-plot">{{ c.plot }}</span>
            </div>
            <span class="conv-dot" :class="{ read: c.status === '已回复' }"></span>
          </button>
          <div v-if="!shown.length" class="empty-box" style="padding:30px">
            <div class="icon">💬</div>
            <div>{{ isExpert ? '暂无待处理咨询' : '还没有咨询记录' }}</div>
            <el-button v-if="!isExpert" type="primary" plain size="small" class="mt-12" @click="createOpen = true">发起咨询</el-button>
          </div>
        </div>
      </aside>

      <section v-if="current" class="chat card">
        <div class="chat-head">
          <span class="chat-avatar" :class="{ expert: !isExpert }">{{ isExpert ? current.from.slice(0, 1) : '艺' }}</span>
          <div class="chat-who">
            <b>{{ isExpert ? current.from + ' ' : '农艺师 · 朱 ' }}<small>{{ isExpert ? current.role : '农艺技术人员' }}</small></b>
            <span>{{ current.plot }} · 咨询编号 {{ current.id }}</span>
          </div>
          <StatusTag :status="current.status" />
          <div class="chat-acts">
            <el-button size="small" :icon="VideoCamera" @click="videoCall">视频</el-button>
            <el-button size="small" :icon="Phone" @click="call">电话</el-button>
          </div>
        </div>

        <div ref="bodyEl" class="chat-body">
          <div class="date-divider">{{ current.time.slice(0, 10) }}</div>
          <div class="bubble-title-card">
            <b>{{ current.title }}</b>
            <span>{{ current.plot }}</span>
          </div>
          <div v-for="(m, i) in thread(current)" :key="i" class="msg-row" :class="{ right: (m.from === 'expert') === isExpert }">
            <span v-if="(m.from === 'expert') !== isExpert" class="msg-avatar" :class="{ expert: m.from === 'expert' }">{{ m.from === 'expert' ? '艺' : (current.from.slice(0, 1)) }}</span>
            <div class="bubble" :class="{ mine: (m.from === 'expert') === isExpert }">
              <b class="bubble-title">{{ m.from === 'expert' ? '农艺师建议' : '农户提问' }}</b>
              <p>{{ m.text }}</p>
              <small>{{ m.time }}</small>
            </div>
            <span v-if="(m.from === 'expert') === isExpert" class="msg-avatar" :class="{ expert: m.from === 'expert' }">{{ m.from === 'expert' ? '艺' : current.from.slice(0, 1) }}</span>
          </div>
          <div v-if="!thread(current).length" class="msg-tip"><el-icon><InfoFilled /></el-icon>还没有对话内容</div>
        </div>

        <div class="chat-input">
          <div v-if="isExpert" class="quick-chips">
            <button v-for="q in quickReplies" :key="q" @click="reply = q">{{ q }}</button>
          </div>
          <div v-else class="quick-chips farmer-chips">
            <button v-for="q in farmerReplies" :key="q" @click="reply = q">{{ q }}</button>
          </div>
          <el-input v-model="reply" type="textarea" :rows="3" maxlength="300" show-word-limit :placeholder="isExpert ? '输入专业建议，支持施肥、用药、环境调控等方案…' : '补充你的问题，或回复农艺师的建议…'" />
          <div class="ci-actions">
            <span class="tiny muted">{{ isExpert ? '回复后农户会收到消息通知' : '农艺师通常 15 分钟内响应' }}</span>
            <el-button @click="reply = ''">清空</el-button>
            <el-button type="primary" :icon="Promotion" @click="send">{{ isExpert ? '发送回复' : '发送消息' }}</el-button>
          </div>
        </div>
      </section>
      <section v-else class="chat card empty-box">
        <div class="icon">💬</div>
        <div>{{ isExpert ? '选择左侧农户会话开始应答' : '暂无咨询，点击右上角「发起新咨询」' }}</div>
      </section>
    </div>

    <el-dialog v-model="createOpen" title="发起技术咨询" width="540px" destroy-on-close>
      <el-form label-width="84px" label-position="left">
        <el-form-item label="地块">
          <el-select v-model="form.plot" class="w-full">
            <el-option v-for="p in DB.plots" :key="p.id" :label="p.name" :value="p.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="咨询主题"><el-input v-model="form.title" placeholder="如：番茄下部叶片发黄" /></el-form-item>
        <el-form-item label="问题描述"><el-input v-model="form.content" type="textarea" :rows="4" placeholder="描述症状、环境条件、已采取的措施…" /></el-form-item>
        <div class="upload-hint"><el-icon><Plus /></el-icon>可上传 3 张田间照片（演示环境暂不支持真实上传）</div>
      </el-form>
      <template #footer>
        <el-button @click="createOpen = false">取消</el-button>
        <el-button type="primary" @click="submitConsult">提交咨询</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Plus, VideoCamera, Phone, Search, InfoFilled, Promotion, ChatLineSquare } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useAdminStore } from '@/stores/admin'
import { useAuthStore } from '@/stores/auth'
import DB from '@/data/db'

const admin = useAdminStore()
const auth = useAuthStore()
const isExpert = computed(() => auth.role === 'agri')

/* 农户只看到自己发起的咨询，农艺师看到全部农户咨询 */
const consults = computed(() => isExpert.value
  ? admin.consults
  : admin.consults.filter(c => c.from === auth.user?.name))
const pending = computed(() => consults.value.filter(c => c.status === '待回复'))
const tabs = ['全部', '待回复', '已回复']
const tab = ref('全部')
const keyword = ref('')
const current = ref(consults.value[0] || null)
const reply = ref('')
const bodyEl = ref(null)
const createOpen = ref(false)
const form = reactive({ plot: DB.plots[0].name, title: '', content: '' })
const quickReplies = [
  '这是典型的缺镁症状，建议叶面喷施 0.2% 硫酸镁，7 天一次，连续 2 次。',
  '注意控制棚内湿度，中午短时通风，避免病害扩散。',
  '建议先采样送检，确认病因后再用药，注意农药安全间隔期。'
]
const farmerReplies = ['好的，我按建议处理试试。', '已拍照，麻烦帮忙看一下。', '请问需要间隔几天再复查？']

const shown = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return consults.value.filter(c => {
    if (tab.value !== '全部' && c.status !== tab.value) return false
    if (!kw) return true
    return [c.from, c.title, c.plot, c.content].some(k => String(k ?? '').toLowerCase().includes(kw))
  })
})

watch(shown, (list) => {
  if (!list.some(c => c.id === current.value?.id)) current.value = list[0] || null
})

function thread(c) {
  if (c.messages && c.messages.length) return c.messages
  return [{ from: 'farmer', text: c.content, time: c.time }]
}
function lastText(c) {
  const list = thread(c)
  return list[list.length - 1]?.text || c.title
}
function select(c) { current.value = c }
async function scrollBottom() {
  await nextTick()
  if (bodyEl.value) bodyEl.value.scrollTop = bodyEl.value.scrollHeight
}
watch(current, scrollBottom)
watch(() => current.value?.messages?.length, scrollBottom)

function send() {
  if (!current.value) return
  const text = reply.value.trim()
  if (!text) return ElMessage.warning('请先输入内容')
  admin.sendConsultMessage(current.value.id, isExpert.value ? 'expert' : 'farmer', text)
  reply.value = ''
  scrollBottom()
}
function videoCall() { ElMessage.info('正在建立视频连线…（演示环境）') }
function call() { ElMessage.info(`正在拨打 ${isExpert.value ? current.value?.from || '农户' : '农艺师'} 的电话（演示环境）`) }
function refresh() { ElMessage.success('咨询列表已刷新') }
function submitConsult() {
  if (!form.title.trim() || !form.content.trim()) return ElMessage.warning('请填写咨询主题和问题描述')
  const c = admin.addConsult({ from: auth.user?.name || '龙', role: '农户', plot: form.plot, title: form.title.trim(), content: form.content.trim() })
  createOpen.value = false
  form.title = ''
  form.content = ''
  current.value = c
  ElMessage.success('咨询已提交，农艺师会尽快回复')
  scrollBottom()
}
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.consult-layout { display: grid; grid-template-columns: 340px 1fr; gap: 16px; min-height: 560px; }
.conv-list { display: flex; flex-direction: column; overflow: hidden; }
.cl-head { padding: 14px 15px 10px; border-bottom: 1px solid var(--line); }
.cl-head h3 { font-size: 14px; margin-bottom: 9px; }
.cl-tabs { display: flex; gap: 3px; padding: 8px 10px; border-bottom: 1px solid var(--line); }
.cl-tabs button { flex: 1; border: none; background: transparent; border-radius: 7px; padding: 6px 4px; font-size: 11.5px; color: var(--ink-500); cursor: pointer; }
.cl-tabs button.on { background: var(--brand-50); color: var(--brand-700); font-weight: 600; }
.cl-tabs span { margin-left: 3px; font-size: 9px; background: rgba(0,0,0,.06); border-radius: 8px; padding: 0 4px; }
.cl-rows { flex: 1; overflow-y: auto; padding: 6px 8px 12px; }
.conv-item { width: 100%; display: flex; align-items: flex-start; gap: 9px; padding: 10px 8px; border: none; background: transparent; border-radius: 9px; cursor: pointer; text-align: left; position: relative; }
.conv-item:hover { background: #fbfcf7; }
.conv-item.on { background: var(--brand-50); }
.conv-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #e3b47a, #c28632); color: #fff; display: grid; place-items: center; font-size: 12px; flex: 0 0 32px; }
.conv-main { flex: 1; min-width: 0; }
.conv-title { display: flex; align-items: baseline; justify-content: space-between; gap: 6px; }
.conv-title b { font-size: 12px; }
.conv-title span { font-size: 9px; color: var(--ink-300); }
.conv-main p { font-size: 11px; color: var(--ink-500); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 2px 0; }
.conv-plot { font-size: 9.5px; color: var(--ink-300); }
.conv-dot { width: 6px; height: 6px; border-radius: 50%; background: #c65b4e; margin-top: 5px; flex: 0 0 6px; }
.conv-dot.read { background: transparent; }
.chat { display: flex; flex-direction: column; overflow: hidden; }
.chat-head { display: flex; align-items: center; gap: 10px; padding: 13px 18px; border-bottom: 1px solid var(--line); flex-wrap: wrap; }
.chat-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #7ca66e, #426f4a); color: #fff; display: grid; place-items: center; font-size: 14px; flex: 0 0 36px; }
.chat-avatar.expert { background: linear-gradient(135deg, #7ca66e, #426f4a); }
.chat-who { flex: 1; min-width: 0; }
.chat-who b { font-size: 13px; }
.chat-who b small { font-size: 9.5px; color: var(--brand-600); background: var(--brand-50); border-radius: 20px; padding: 1px 6px; margin-left: 5px; font-weight: 400; }
.chat-who span { display: block; font-size: 10px; color: var(--ink-400); }
.chat-acts { display: flex; gap: 6px; }
.chat-acts .el-button + .el-button { margin-left: 0; }
.chat-body { flex: 1; overflow-y: auto; padding: 18px 22px; background: var(--bg-soft); min-height: 300px; max-height: 420px; }
.date-divider { text-align: center; font-size: 9.5px; color: var(--ink-300); margin-bottom: 12px; }
.bubble-title-card { display: flex; align-items: center; gap: 9px; margin: 0 auto 16px; padding: 8px 13px; max-width: 78%; background: #fff; border: 1px dashed var(--line-strong); border-radius: 10px; }
.bubble-title-card b { font-size: 12px; }
.bubble-title-card span { font-size: 10px; color: var(--ink-400); }
.msg-row { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 15px; }
.msg-row.right { justify-content: flex-end; }
.msg-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #e3b47a, #c28632); color: #fff; display: grid; place-items: center; font-size: 10px; flex: 0 0 28px; }
.msg-avatar.expert { background: linear-gradient(135deg, #7ca66e, #426f4a); }
.bubble { max-width: 74%; background: #fff; border: 1px solid var(--line); border-radius: 4px 13px 13px 13px; padding: 11px 13px; }
.bubble.mine { background: var(--brand-50); border-color: var(--brand-100); border-radius: 13px 4px 13px 13px; }
.bubble-title { display: block; font-size: 11px; color: var(--brand-800); margin-bottom: 4px; }
.bubble p { font-size: 12.5px; color: var(--ink-700); line-height: 1.75; white-space: pre-wrap; }
.bubble small { display: block; font-size: 9px; color: var(--ink-300); margin-top: 5px; text-align: right; }
.msg-tip { display: flex; align-items: center; gap: 6px; justify-content: center; font-size: 11px; color: var(--ink-400); background: #fff; border: 1px dashed var(--line-strong); border-radius: 8px; padding: 10px; margin-top: 18px; }
.chat-input { border-top: 1px solid var(--line); padding: 13px 18px 15px; background: #fff; }
.quick-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 9px; }
.quick-chips button { border: 1px solid var(--line); background: #fff; border-radius: 20px; padding: 4px 9px; font-size: 10.5px; color: var(--ink-500); cursor: pointer; }
.quick-chips button:hover { border-color: var(--brand-300); color: var(--brand-700); background: var(--brand-50); }
.farmer-chips button:hover { border-color: var(--brand-300); color: var(--brand-700); background: var(--brand-50); }
.ci-actions { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
.ci-actions .muted { margin-right: auto; }
.upload-hint { display: flex; align-items: center; gap: 6px; padding: 10px 12px; border: 1px dashed var(--line-strong); border-radius: 9px; color: var(--ink-400); font-size: 11px; }
@media (max-width: 1000px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } .consult-layout { grid-template-columns: 280px 1fr; } }
@media (max-width: 760px) { .consult-layout { grid-template-columns: 1fr; } .conv-list { max-height: 300px; } .chat-body { padding: 14px; max-height: 340px; } .bubble { max-width: 86%; } .stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; } }
</style>
