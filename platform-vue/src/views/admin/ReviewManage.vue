<template>
  <div class="page-wrap">
    <PageHeader title="消费者评价" sub="买家评价实时推送，可直接回复买家">
      <template #actions>
        <el-button :icon="Refresh" @click="refresh">刷新</el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="评价总数" :value="reviews.length" unit="条" foot="近 30 天" icon="ChatDotSquare" />
      <StatCard label="平均星级" :value="avgStars" unit="星" foot="满分 5 星" icon="Star" tone="warn" />
      <StatCard label="待回复" :value="pending.length" unit="条" foot="建议 24 小时内回复" icon="ChatLineSquare" tone="danger" />
      <StatCard label="好评率" :value="goodRate" unit="%" foot="4 星及以上" icon="CircleCheck" tone="info" />
    </div>

    <div class="review-grid">
      <div class="card rating-card">
        <div class="card-head"><h3>星级分布</h3><span class="sub">{{ reviews.length }} 条评价</span></div>
        <div class="rating-body">
          <div class="rating-score">
            <b>{{ avgStars }}</b>
            <el-rate :model-value="Number(avgStars)" disabled />
            <span>综合评分</span>
          </div>
          <div class="rating-bars">
            <div v-for="r in ratingDist" :key="r.star" class="rb-row">
              <span>{{ r.star }} 星</span>
              <div class="rb-track"><i :style="{ width: r.percent + '%' }"></i></div>
              <b>{{ r.count }}</b>
            </div>
          </div>
        </div>
      </div>
      <div class="card quick-reply">
        <div class="card-head"><h3>快捷回复</h3><span class="sub">点击填入回复框</span></div>
        <div class="qr-list">
          <button v-for="q in quickReplies" :key="q" @click="applyQuick(q)">{{ q }}</button>
        </div>
      </div>
    </div>

    <DataTable
      :columns="columns"
      :rows="reviews"
      :filters="filters"
      :search-keys="['goods', 'user', 'text', 'reply']"
      search-placeholder="搜索商品 / 用户 / 评价内容…"
      export-name="消费者评价"
      :row-actions="rowActions"
      :action-width="150"
      @row-action="onAction"
      @refresh="refresh"
    />

    <el-dialog v-model="replyOpen" title="回复评价" width="520px" destroy-on-close>
      <div v-if="current" class="reply-target">
        <div class="rt-head">
          <b>{{ current.user }}</b>
          <el-rate :model-value="current.stars" disabled size="small" />
          <span class="tiny muted">{{ current.time }}</span>
        </div>
        <p>{{ current.text }}</p>
        <div class="tiny muted">商品：{{ current.goods }}</div>
      </div>
      <el-input v-model="replyText" type="textarea" :rows="4" maxlength="160" show-word-limit placeholder="输入回复内容，买家会收到通知…" />
      <div class="quick-inline">
        <button v-for="q in quickReplies.slice(0, 3)" :key="q" @click="replyText = q">{{ q }}</button>
      </div>
      <template #footer>
        <el-button @click="replyOpen = false">取消</el-button>
        <el-button type="primary" @click="sendReply">发送回复</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import DataTable from '@/components/DataTable.vue'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()
const reviews = computed(() => admin.reviews)
const pending = computed(() => reviews.value.filter(r => r.status === '待回复'))
const avgStars = computed(() => reviews.value.length ? (reviews.value.reduce((a, b) => a + b.stars, 0) / reviews.value.length).toFixed(1) : '0.0')
const goodRate = computed(() => reviews.value.length ? Math.round(reviews.value.filter(r => r.stars >= 4).length / reviews.value.length * 100) : 0)
const ratingDist = computed(() => [5, 4, 3, 2, 1].map(star => {
  const count = reviews.value.filter(r => r.stars === star).length
  return { star, count, percent: reviews.value.length ? Math.round(count / reviews.value.length * 100) : 0 }
}))

const columns = [
  { prop: 'goods', label: '商品', minWidth: 180 },
  { prop: 'user', label: '用户', width: 110 },
  { prop: 'stars', label: '评分', width: 150, type: 'stars' },
  { prop: 'text', label: '评价内容', minWidth: 300 },
  { prop: 'time', label: '评价时间', width: 150 },
  { prop: 'reply', label: '商家回复', minWidth: 220 },
  { prop: 'status', label: '状态', width: 90, type: 'tag' }
]
const filters = [
  { key: 'status', label: '回复状态', options: ['待回复', '已回复'].map(v => ({ label: v, value: v })) },
  { key: 'stars', label: '星级', options: [5, 4, 3, 2, 1].map(v => ({ label: v + ' 星', value: v })) }
]
const rowActions = [
  { key: 'reply', label: '回复' },
  { key: 'view', label: '详情' },
  { key: 'delete', label: '删除', type: 'danger' }
]
const quickReplies = [
  '感谢您的支持，我们会继续保持品质！',
  '非常抱歉给您带来不好的体验，已安排客服跟进处理。',
  '产地当日采摘，冷链直发，欢迎下次再来～',
  '感谢反馈，已记录并同步给种植户改进。'
]

const replyOpen = ref(false)
const current = ref(null)
const replyText = ref('')

function onAction({ action, row }) {
  if (action === 'reply') { current.value = row; replyText.value = row.reply || ''; replyOpen.value = true }
  if (action === 'view') { current.value = row; replyText.value = row.reply || ''; replyOpen.value = true }
  if (action === 'delete') {
    ElMessageBox.confirm('确定删除该条评价？删除后不可恢复。', '删除评价', { type: 'warning' }).then(() => {
      admin.removeReview(row.id)
      ElMessage.success('评价已删除')
    }).catch(() => {})
  }
}
function applyQuick(q) { replyText.value = q }
function sendReply() {
  if (!replyText.value.trim()) return ElMessage.warning('请输入回复内容')
  admin.replyReview(current.value.id, replyText.value.trim())
  replyOpen.value = false
  ElMessage.success('回复已发送')
}
function refresh() { ElMessage.success('评价数据已刷新') }
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.review-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 14px; margin-bottom: 16px; }
.rating-body { display: flex; gap: 26px; padding: 16px 20px 20px; align-items: center; }
.rating-score { text-align: center; min-width: 120px; }
.rating-score b { display: block; font-size: 42px; line-height: 1; color: #b47821; letter-spacing: -1px; }
.rating-score .el-rate { margin: 8px 0 4px; }
.rating-score span { font-size: 11.5px; color: var(--ink-400); }
.rating-bars { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.rb-row { display: flex; align-items: center; gap: 9px; font-size: 11.5px; color: var(--ink-500); }
.rb-row > span { width: 32px; }
.rb-row > b { width: 24px; text-align: right; color: var(--ink-700); }
.rb-track { flex: 1; height: 7px; border-radius: 4px; background: #f0f3ea; overflow: hidden; }
.rb-track i { display: block; height: 100%; border-radius: 4px; background: linear-gradient(90deg, #d9b26a, #c28632); }
.qr-list { display: flex; flex-wrap: wrap; gap: 8px; padding: 15px 18px 18px; }
.qr-list button, .quick-inline button { border: 1px solid var(--line); background: #fff; border-radius: 20px; padding: 6px 11px; font-size: 11.5px; color: var(--ink-500); cursor: pointer; text-align: left; line-height: 1.5; }
.qr-list button:hover, .quick-inline button:hover { border-color: var(--brand-300); color: var(--brand-700); background: var(--brand-50); }
.reply-target { background: var(--bg-soft); border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; margin-bottom: 12px; }
.rt-head { display: flex; align-items: center; gap: 10px; }
.rt-head b { font-size: 13px; }
.rt-head .muted { margin-left: auto; }
.reply-target p { font-size: 12.5px; color: var(--ink-700); line-height: 1.75; margin: 7px 0; }
.quick-inline { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
@media (max-width: 1100px) { .review-grid { grid-template-columns: 1fr; } }
@media (max-width: 760px) { .stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; } .rating-body { flex-direction: column; gap: 14px; } .rating-bars { width: 100%; } }
</style>
