<template>
  <div class="products-page">
    <div class="page-hero">
      <div class="ph-inner">
        <span class="kicker">ALL PRODUCTS · 产地直供</span>
        <h1>全部农产品</h1>
        <p>基地当日采摘，农残检测合格后上架。按品类、价格或销量找到你想要的那一份新鲜。</p>
        <div class="hero-search">
          <el-input v-model="keyword" placeholder="搜索番茄、草莓、大米…" size="large" clearable @keyup.enter="applySearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-button type="primary" size="large" @click="applySearch">搜索</el-button>
        </div>
      </div>
    </div>

    <div class="products-inner">
      <aside class="filter-side card" :class="{ open: filterOpen }">
        <div class="fs-head">
          <h3>筛选</h3>
          <button class="reset" @click="reset">重置</button>
        </div>
        <div class="fs-group">
          <h4>品类大类</h4>
          <div class="fs-chips">
            <button class="chip" :class="{ on: !big }" @click="pickBig('')">全部</button>
            <button v-for="b in bigCats" :key="b.name" class="chip" :class="{ on: big === b.name }" @click="pickBig(b.name)">{{ b.icon }} {{ b.name }}</button>
          </div>
          <h4 class="sub-title">小类</h4>
          <div class="fs-chips">
            <button class="chip" :class="{ on: !cat }" @click="cat = ''">全部</button>
            <button v-for="c in subCats" :key="c" class="chip" :class="{ on: cat === c }" @click="cat = c">{{ c }}</button>
          </div>
        </div>
        <div class="fs-group">
          <h4>价格区间</h4>
          <div class="price-inputs">
            <el-input-number v-model="minPrice" :min="0" :max="1000" size="small" controls-position="right" />
            <span>—</span>
            <el-input-number v-model="maxPrice" :min="0" :max="1000" size="small" controls-position="right" />
          </div>
          <div class="price-presets">
            <button v-for="p in pricePresets" :key="p.label" :class="{ on: minPrice === p.min && maxPrice === p.max }" @click="minPrice = p.min; maxPrice = p.max">{{ p.label }}</button>
          </div>
        </div>
        <div class="fs-group">
          <h4>服务筛选</h4>
          <el-checkbox v-model="onlyTrace">仅看可溯源</el-checkbox>
          <el-checkbox v-model="onlyStock">仅看有库存</el-checkbox>
          <el-checkbox v-model="onlyFresh">当日采摘</el-checkbox>
        </div>
        <div class="fs-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>显示 {{ filtered.length }} 款商品，满 ¥59 包邮。</span>
        </div>
      </aside>

      <main class="products-main">
        <div class="toolbar card">
          <div class="tb-left">
            <button class="filter-btn" @click="filterOpen = !filterOpen"><el-icon><Filter /></el-icon>筛选</button>
            <div class="quick-cats">
              <button class="chip" :class="{ on: !big }" @click="pickBig('')">全部</button>
              <button v-for="b in bigCats" :key="b.name" class="chip" :class="{ on: big === b.name }" @click="pickBig(b.name)">{{ b.name }}</button>
            </div>
          </div>
          <div class="tb-right">
            <span class="count">共 <b>{{ filtered.length }}</b> 款</span>
            <el-select v-model="sort" size="default" class="sort-select">
              <el-option label="综合推荐" value="default" />
              <el-option label="销量优先" value="sold" />
              <el-option label="价格从低到高" value="priceAsc" />
              <el-option label="价格从高到低" value="priceDesc" />
              <el-option label="新品上架" value="new" />
            </el-select>
          </div>
        </div>

        <div v-if="filtered.length" class="product-grid">
          <ProductCard
            v-for="g in paged"
            :key="g.id"
            :goods="g"
            :favorite="mall.isFavorite(g.id)"
            @add="add"
            @fav="fav"
            @open="open"
          />
        </div>
        <div v-else class="card empty-box">
          <div class="icon">🧺</div>
          <div>没有找到符合条件的农产品</div>
          <el-button type="primary" plain class="mt-12" @click="reset">清除筛选条件</el-button>
        </div>

        <div v-if="filtered.length > pageSize" class="pager">
          <el-pagination v-model:current-page="page" :page-size="pageSize" :total="filtered.length" layout="prev, pager, next" background />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Filter, InfoFilled } from '@element-plus/icons-vue'
import ProductCard from '@/components/ProductCard.vue'
import { useCartStore } from '@/stores/cart'
import { useMallStore } from '@/stores/mall'
import DB from '@/data/db'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const mall = useMallStore()

const bigCats = DB.catTree
const big = ref(String(route.query.big || ''))
const keyword = ref(String(route.query.q || ''))
const cat = ref(String(route.query.cat || ''))
const subCats = computed(() => {
  if (big.value) return DB.catTree.find(b => b.name === big.value)?.children || []
  return [...new Set(DB.goods.map(g => g.cat))]
})
const minPrice = ref(0)
const maxPrice = ref(1000)
const onlyTrace = ref(false)
const onlyStock = ref(false)
const onlyFresh = ref(false)
const sort = ref('default')
const page = ref(1)
const pageSize = 8
const filterOpen = ref(false)
const pricePresets = [
  { label: '¥10 以下', min: 0, max: 10 },
  { label: '¥10–30', min: 10, max: 30 },
  { label: '¥30 以上', min: 30, max: 1000 }
]

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  let list = DB.goods.filter(g => {
    if (big.value && g.big !== big.value) return false
    if (cat.value && g.cat !== cat.value) return false
    if (g.price < minPrice.value || g.price > maxPrice.value) return false
    if (onlyTrace.value && (!g.trace || g.trace === '—')) return false
    if (onlyStock.value && g.stock <= 0) return false
    if (onlyFresh.value && !['当日采摘', '基地直供', '冷链配送'].includes(g.tag)) return false
    if (!kw) return true
    return [g.name, g.big, g.cat, g.plot, g.spec, g.tag].some(k => String(k ?? '').toLowerCase().includes(kw))
  })
  if (sort.value === 'sold') list = list.slice().sort((a, b) => b.sold - a.sold)
  else if (sort.value === 'priceAsc') list = list.slice().sort((a, b) => a.price - b.price)
  else if (sort.value === 'priceDesc') list = list.slice().sort((a, b) => b.price - a.price)
  else if (sort.value === 'new') list = list.slice().reverse()
  return list
})
const paged = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))

watch([keyword, big, cat, minPrice, maxPrice, onlyTrace, onlyStock, onlyFresh, sort], () => { page.value = 1 })
watch(() => route.query, (q) => {
  if (q.q !== undefined) keyword.value = String(q.q)
  if (q.cat !== undefined) cat.value = String(q.cat)
  if (q.big !== undefined) big.value = String(q.big)
})

function pickBig(name) {
  big.value = name
  cat.value = ''
}
function applySearch() {
  router.replace({ path: '/mall/products', query: { ...(keyword.value ? { q: keyword.value } : {}), ...(big.value ? { big: big.value } : {}), ...(cat.value ? { cat: cat.value } : {}) } })
}
function reset() {
  keyword.value = ''
  big.value = ''
  cat.value = ''
  minPrice.value = 0
  maxPrice.value = 1000
  onlyTrace.value = false
  onlyStock.value = false
  onlyFresh.value = false
  sort.value = 'default'
  page.value = 1
  router.replace('/mall/products')
}
function add(g) {
  const res = cart.add(g.id, 1)
  ElMessage[res.ok ? 'success' : 'warning'](res.ok ? `${g.name} 已加入购物车` : res.message)
}
function fav(g) { ElMessage.success(mall.toggleFavorite(g.id) ? '已收藏' : '已取消收藏') }
function open(g) { router.push(`/mall/product/${g.id}`) }
</script>

<style scoped>
.products-page { background: var(--cream); min-height: 70vh; }
.page-hero { background: linear-gradient(120deg, #eef5e8, #f7f5ee 60%, #f3efe4); border-bottom: 1px solid rgba(228,232,223,.7); }
.ph-inner { max-width: 1240px; margin: 0 auto; padding: 38px 24px 34px; }
.kicker { font-size: 9.5px; letter-spacing: 2px; color: var(--brand-500); }
.ph-inner h1 { font-size: 33px; margin: 6px 0 5px; letter-spacing: .4px; }
.ph-inner > p { font-size: 12.5px; color: var(--ink-500); max-width: 520px; line-height: 1.8; }
.hero-search { display: flex; gap: 8px; max-width: 460px; margin-top: 18px; }
.products-inner { max-width: 1240px; margin: 0 auto; padding: 24px; display: grid; grid-template-columns: 228px 1fr; gap: 20px; align-items: start; }
.filter-side { padding: 18px; position: sticky; top: 88px; }
.fs-head { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--line); }
.fs-head h3 { font-size: 14px; }
.reset { border: none; background: transparent; font-size: 10.5px; color: var(--ink-400); cursor: pointer; }
.reset:hover { color: var(--brand-600); }
.fs-group { padding: 15px 0; border-bottom: 1px solid #f1f4ec; }
.fs-group h4 { font-size: 11.5px; color: var(--ink-700); margin-bottom: 9px; }
.fs-group h4.sub-title { margin-top: 12px; }
.fs-chips { display: flex; flex-wrap: wrap; gap: 5px; }
.fs-chips .chip { height: 26px; padding: 0 9px; font-size: 10.5px; }
.price-inputs { display: flex; align-items: center; gap: 5px; }
.price-inputs :deep(.el-input-number) { width: 86px; }
.price-inputs > span { font-size: 10px; color: var(--ink-300); }
.price-presets { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
.price-presets button { border: 1px solid var(--line); background: #fff; border-radius: 20px; padding: 2px 8px; font-size: 9.5px; color: var(--ink-400); cursor: pointer; }
.price-presets button.on { border-color: var(--brand-300); background: var(--brand-50); color: var(--brand-700); }
.fs-group :deep(.el-checkbox) { display: flex; margin-bottom: 5px; }
.fs-group :deep(.el-checkbox__label) { font-size: 11.5px; }
.fs-tip { display: flex; gap: 6px; align-items: flex-start; padding-top: 13px; font-size: 10.5px; color: var(--ink-400); line-height: 1.6; }
.toolbar { display: flex; align-items: center; gap: 10px; padding: 10px 13px; margin-bottom: 15px; flex-wrap: wrap; }
.tb-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.filter-btn { display: none; align-items: center; gap: 4px; border: 1px solid var(--line); background: #fff; border-radius: 20px; padding: 5px 10px; font-size: 12px; color: var(--ink-500); cursor: pointer; }
.quick-cats { display: flex; gap: 4px; flex-wrap: wrap; }
.quick-cats .chip { height: 27px; padding: 0 10px; font-size: 11px; }
.tb-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
.count { font-size: 11px; color: var(--ink-400); }
.count b { color: var(--brand-700); }
.sort-select { width: 138px; }
.product-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.pager { display: flex; justify-content: center; padding: 26px 0 6px; }
@media (max-width: 1050px) {
  .products-inner { grid-template-columns: 1fr; }
  .filter-side { display: none; position: static; }
  .filter-side.open { display: block; }
  .filter-btn { display: inline-flex; }
  .product-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 780px) {
  .product-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .quick-cats { display: none; }
  .tb-right .count { display: none; }
}
@media (max-width: 520px) {
  .ph-inner { padding: 28px 16px; }
  .ph-inner h1 { font-size: 26px; }
  .products-inner { padding: 14px; }
  .product-grid { grid-template-columns: 1fr 1fr; gap: 9px; }
  .sort-select { width: 118px; }
}
</style>
