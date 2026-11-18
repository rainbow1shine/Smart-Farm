<template>
  <div class="page-wrap">
    <PageHeader title="产品上架 / 商品监管" sub="农产品信息、图片、规格与价格管理">
      <template #actions>
        <el-button :icon="Refresh" @click="refresh">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreate">新增商品</el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="在售商品" :value="onlineGoods.length" unit="款" foot="覆盖 6 个品类" icon="Goods" />
      <StatCard label="待审核" :value="pendingGoods.length" unit="款" foot="需人工复核" icon="Warning" tone="warn" />
      <StatCard label="库存预警" :value="lowStock.length" unit="款" foot="库存低于 60" icon="Box" tone="danger" />
      <StatCard label="累计销量" :value="totalSold.toLocaleString()" unit="份" foot="已售出份数" icon="TrendCharts" tone="info" />
    </div>

    <div class="toolbar card">
      <div class="chips">
        <button class="chip" :class="{ on: cat === '全部' }" @click="cat = '全部'">全部</button>
        <button v-for="c in catTree" :key="c.name" class="chip" :class="{ on: cat === c.name }" @click="cat = c.name">{{ c.icon }} {{ c.name }}</button>
      </div>
      <el-input v-model="keyword" placeholder="搜索商品名称 / 地块 / 溯源码" clearable class="search">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
    </div>

    <div class="goods-grid">
      <article v-for="g in shown" :key="g.id" class="goods-card card">
        <div class="gc-media">
          <span class="gc-emoji">{{ g.icon || '🌱' }}</span>
          <span class="gc-tag">{{ g.tag || '基地直供' }}</span>
          <StatusTag :status="g.audit || '已上架'" class="gc-status" />
        </div>
        <div class="gc-body">
          <div class="gc-title">
            <h3>{{ g.name }}</h3>
            <span class="tiny muted">{{ g.id }}</span>
          </div>
          <p class="gc-spec">{{ g.spec }} · {{ g.plot }}</p>
          <div class="gc-price">{{ money(g.price) }}<small>{{ g.unit?.replace('元/', '/') }}</small></div>
          <div class="gc-meta">
            <span>库存 <b :class="{ danger: g.stock < 60 }">{{ g.stock }}</b></span>
            <span>已售 {{ g.sold }}</span>
            <span v-if="g.trace !== '—'" class="trace">可溯源</span>
          </div>
          <div class="gc-acts">
            <el-button size="small" @click="openEdit(g)">编辑</el-button>
            <el-button size="small" @click="openDetail(g)">详情</el-button>
            <el-button v-if="(g.audit || '已上架') === '已上架'" size="small" type="warning" plain @click="toggleAudit(g)">下架</el-button>
            <el-button v-else size="small" type="primary" plain @click="toggleAudit(g)">通过上架</el-button>
          </div>
        </div>
      </article>
      <div v-if="!shown.length" class="card empty-box" style="grid-column:1/-1">
        <div class="icon">🌾</div><div>没有匹配的商品</div>
      </div>
    </div>

    <el-drawer v-model="detailOpen" title="商品详情" size="460px">
      <div v-if="current" class="gd">
        <div class="gd-media">{{ current.icon || '🌱' }}</div>
        <h3>{{ current.name }}</h3>
        <div class="gd-tags">
          <el-tag round size="small">{{ current.big }}</el-tag>
          <el-tag round size="small">{{ current.cat }}</el-tag>
          <el-tag round size="small" type="success">{{ current.tag }}</el-tag>
          <StatusTag :status="current.audit || '已上架'" />
        </div>
        <div class="gd-price">{{ money(current.price) }} <small>{{ current.unit }}</small></div>
        <div class="gd-list">
          <div class="gd-row"><span>商品编号</span><b>{{ current.id }}</b></div>
          <div class="gd-row"><span>规格</span><b>{{ current.spec }}</b></div>
          <div class="gd-row"><span>产地地块</span><b>{{ current.plot }}</b></div>
          <div class="gd-row"><span>库存 / 销量</span><b>{{ current.stock }} / {{ current.sold }}</b></div>
          <div class="gd-row"><span>溯源批次</span><b>{{ current.trace }}</b></div>
        </div>
        <div class="gd-tip"><el-icon><InfoFilled /></el-icon> 商品上架前需完成农残检测并关联溯源批次，检测不合格的商品禁止上架。</div>
      </div>
      <template #footer>
        <el-button @click="detailOpen = false">关闭</el-button>
        <el-button type="primary" @click="openEdit(current)">编辑商品</el-button>
      </template>
    </el-drawer>

    <el-dialog v-model="editOpen" :title="editing" width="640px" destroy-on-close>
      <el-form label-width="88px" label-position="left">
        <div class="form-grid">
          <el-form-item label="商品名称"><el-input v-model="form.name" /></el-form-item>
          <el-form-item label="图标"><el-input v-model="form.icon" placeholder="如 🍅" /></el-form-item>
          <el-form-item label="品类大类">
            <el-select v-model="form.big" class="w-full" @change="onBigChange">
              <el-option v-for="c in catTree" :key="c.name" :label="c.name" :value="c.name" />
            </el-select>
          </el-form-item>
          <el-form-item label="品类小类">
            <el-select v-model="form.cat" class="w-full">
              <el-option v-for="c in subCats" :key="c" :label="c" :value="c" />
            </el-select>
          </el-form-item>
          <el-form-item label="价格"><el-input-number v-model="form.price" :min="0" :precision="1" class="w-full" /></el-form-item>
          <el-form-item label="单位"><el-input v-model="form.unit" placeholder="元/500g" /></el-form-item>
          <el-form-item label="库存"><el-input-number v-model="form.stock" :min="0" class="w-full" /></el-form-item>
          <el-form-item label="规格"><el-input v-model="form.spec" /></el-form-item>
          <el-form-item label="地块"><el-input v-model="form.plot" /></el-form-item>
          <el-form-item label="标签"><el-input v-model="form.tag" /></el-form-item>
          <el-form-item label="溯源码"><el-input v-model="form.trace" placeholder="TR-00020 或 —" /></el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="editOpen = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Plus, Search, InfoFilled } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useAdminStore } from '@/stores/admin'
import DB from '@/data/db'
import { money } from '@/utils/format'

const admin = useAdminStore()
const catTree = DB.catTree
const cats = ['全部', ...DB.catTree.map(c => c.name)]
const cat = ref('全部')
const keyword = ref('')
const detailOpen = ref(false)
const editOpen = ref(false)
const editing = ref('新增商品')
const current = ref(null)
const form = reactive({})
const subCats = computed(() => DB.catTree.find(c => c.name === form.big)?.children || [])

const onlineGoods = computed(() => admin.goods.filter(g => (g.audit || '已上架') === '已上架'))
const pendingGoods = computed(() => admin.goods.filter(g => g.audit === '待审核'))
const lowStock = computed(() => admin.goods.filter(g => g.stock < 60))
const totalSold = computed(() => admin.goods.reduce((a, b) => a + b.sold, 0))
const shown = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return admin.goods.filter(g => {
    if (cat.value !== '全部' && g.big !== cat.value) return false
    if (!kw) return true
    return [g.name, g.plot, g.trace, g.big, g.cat].some(k => String(k ?? '').toLowerCase().includes(kw))
  })
})

function openDetail(g) { current.value = g; detailOpen.value = true }
function openEdit(g) {
  detailOpen.value = false
  editing.value = g ? '编辑商品' : '新增商品'
  Object.keys(form).forEach(k => delete form[k])
  Object.assign(form, g ? { ...g } : { name: '', icon: '🌱', big: '果蔬', cat: '番茄', plot: '', price: 9.9, unit: '元/500g', stock: 100, spec: '500g/份', tag: '基地直供', trace: '—' })
  current.value = g
  editOpen.value = true
}
function onBigChange(big) {
  form.cat = DB.catTree.find(c => c.name === big)?.children[0] || ''
}
function openCreate() { openEdit(null) }
function save() {
  if (!form.name?.trim()) return ElMessage.warning('请填写商品名称')
  if (current.value) {
    admin.update('goods', current.value.id, { ...form })
    ElMessage.success('商品已更新')
  } else {
    admin.addGoods({ ...form, sold: 0, audit: '待审核' })
    ElMessage.success('商品已提交，等待审核上架')
  }
  editOpen.value = false
}
function toggleAudit(g) {
  const next = (g.audit || '已上架') === '已上架' ? '已下架' : '已上架'
  admin.auditGoods(g.id, next)
  ElMessage.success(next === '已上架' ? '商品已通过审核上架' : '商品已下架')
}
function refresh() { ElMessage.success('商品数据已刷新') }
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.toolbar { display: flex; align-items: center; gap: 12px; padding: 12px 14px; margin-bottom: 14px; flex-wrap: wrap; }
.chips { display: flex; gap: 6px; flex-wrap: wrap; }
.search { width: 270px; margin-left: auto; }
.goods-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.goods-card { overflow: hidden; display: flex; flex-direction: column; }
.gc-media { position: relative; height: 128px; display: grid; place-items: center; background: linear-gradient(135deg, #f0f8ef, #dcecdc); }
.gc-emoji { font-size: 52px; filter: drop-shadow(0 8px 12px rgba(32, 80, 42, .14)); }
.gc-tag { position: absolute; left: 10px; top: 10px; font-size: 10px; background: rgba(255,255,255,.85); color: var(--brand-700); border-radius: 20px; padding: 2px 8px; }
.gc-status { position: absolute; right: 8px; top: 8px; }
.gc-body { padding: 12px 14px 14px; display: flex; flex-direction: column; flex: 1; }
.gc-title { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.gc-title h3 { font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gc-spec { font-size: 11.5px; color: var(--ink-400); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gc-price { margin-top: 8px; color: #b5473d; font-size: 21px; font-weight: 700; }
.gc-price small { font-size: 10.5px; color: var(--ink-400); font-weight: 400; margin-left: 2px; }
.gc-meta { display: flex; gap: 10px; align-items: center; font-size: 10.5px; color: var(--ink-400); margin-top: 6px; flex-wrap: wrap; }
.gc-meta b { color: var(--ink-700); }
.gc-meta b.danger { color: #b84d40; }
.gc-meta .trace { color: var(--brand-600); }
.gc-acts { display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap; }
.gc-acts .el-button + .el-button { margin-left: 0; }
.gd { text-align: center; }
.gd-media { height: 150px; display: grid; place-items: center; font-size: 66px; background: linear-gradient(135deg, #f0f8ef, #dcecdc); border-radius: 14px; }
.gd h3 { font-size: 18px; margin: 14px 0 8px; }
.gd-tags { display: flex; justify-content: center; gap: 6px; flex-wrap: wrap; }
.gd-price { font-size: 26px; color: #b5473d; font-weight: 700; margin: 12px 0; }
.gd-price small { font-size: 12px; color: var(--ink-400); font-weight: 400; }
.gd-list { text-align: left; border-top: 1px solid var(--line); padding-top: 10px; }
.gd-row { display: flex; justify-content: space-between; gap: 14px; padding: 7px 0; font-size: 12.5px; color: var(--ink-500); }
.gd-row b { color: var(--ink-900); font-weight: 500; }
.gd-tip { display: flex; gap: 7px; text-align: left; margin-top: 14px; padding: 10px 12px; background: var(--brand-50); border-radius: 9px; color: var(--brand-700); font-size: 11.5px; line-height: 1.7; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
@media (max-width: 1280px) { .goods-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 1000px) { .goods-grid { grid-template-columns: repeat(2, 1fr); } .stat-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 700px) { .goods-grid { grid-template-columns: 1fr; } .form-grid { grid-template-columns: 1fr; } .search { width: 100%; margin-left: 0; } }
</style>
