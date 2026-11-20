<template>
  <div v-if="goods" class="pd-page">
    <div class="pd-crumb">
      <router-link to="/mall">首页</router-link>
      <span>/</span>
      <router-link to="/mall/products">全部农产品</router-link>
      <span>/</span>
      <router-link :to="{ path: '/mall/products', query: { big: goods.big } }">{{ goods.big }}</router-link>
      <span>/</span>
      <router-link :to="{ path: '/mall/products', query: { big: goods.big, cat: goods.cat } }">{{ goods.cat }}</router-link>
      <span>/</span>
      <b>{{ goods.name }}</b>
    </div>

    <section class="pd-main">
      <div class="pd-media">
        <div class="pd-stage" :style="{ background: gallery[active].bg }">
          <span class="stage-tag">{{ goods.tag }}</span>
          <span class="stage-emoji">{{ gallery[active].emoji }}</span>
          <span class="stage-label">{{ gallery[active].label }}</span>
          <i class="stage-ring"></i>
        </div>
        <div class="pd-thumbs">
          <button
            v-for="(g, i) in gallery"
            :key="i"
            :class="{ on: active === i }"
            :style="{ background: g.bg }"
            @click="active = i"
          >
            <span>{{ g.emoji }}</span>
            <small>{{ g.label }}</small>
          </button>
        </div>
        <div class="pd-trust">
          <div><span>🛡️</span><b>批批检测</b><small>农残合格上架</small></div>
          <div><span>❄️</span><b>冷链锁鲜</b><small>采后 2h 预冷</small></div>
          <div><span>💚</span><b>坏果包赔</b><small>24h 拍照反馈</small></div>
        </div>
      </div>

      <div class="pd-info">
        <div class="pd-title-row">
          <div>
            <span class="pd-cat">{{ goods.cat }} · {{ goods.plot }}</span>
            <h1>{{ goods.name }}</h1>
            <p>{{ goods.spec }} · {{ goods.tag }}</p>
          </div>
          <button class="fav-btn" :class="{ on: favorite }" @click="toggleFav">
            <el-icon><StarFilled v-if="favorite" /><Star v-else /></el-icon>
          </button>
        </div>

        <div class="pd-price-box">
          <div class="pd-price">
            <span class="cur">¥</span><b>{{ goods.price }}</b><span class="unit">{{ goods.unit }}</span>
          </div>
          <div class="pd-sales">已售 <b>{{ goods.sold }}</b> · 库存 <b>{{ goods.stock }}</b> 份</div>
          <div class="pd-promo">
            <span>满 ¥59 包邮</span>
            <span>新人立减 ¥5</span>
            <span>坏果包赔</span>
          </div>
        </div>

        <div class="pd-rating">
          <el-rate :model-value="Number(avgScore)" disabled />
          <b>{{ avgScore }}</b>
          <span>· {{ reviewList.length || '暂无' }} 条评价</span>
          <button @click="goReviews">查看评价</button>
        </div>

        <div class="pd-meta">
          <div><span>产地</span><b>{{ goods.plot }}</b></div>
          <div><span>采收</span><b>每日 6:00 现摘</b></div>
          <div><span>配送</span><b>冷链直发 · 主城次日达</b></div>
          <div>
            <span>溯源码</span>
            <b>{{ goods.trace === '—' ? '暂未开放' : goods.trace }}</b>
            <em v-if="goods.trace !== '—'" @click="tab = 'trace'">查看</em>
          </div>
        </div>

        <div class="pd-row">
          <span class="row-label">规格</span>
          <div class="spec-static">
            <b>{{ goods.spec }}</b>
            <small>同批次统一分级，净重充足</small>
          </div>
        </div>

        <div class="pd-row">
          <span class="row-label">数量</span>
          <QtyStepper v-model="qty" :max="Math.max(1, goods.stock)" size="lg" />
          <span class="stock-tip">库存 {{ goods.stock }} 份</span>
        </div>

        <div class="pd-actions">
          <el-button size="large" class="add-cart" :icon="ShoppingCart" @click="addCart">加入购物车</el-button>
          <el-button type="primary" size="large" class="buy-now" @click="buyNow">立即购买</el-button>
        </div>

        <div class="pd-note">
          <el-icon><InfoFilled /></el-icon>
          <span>16:00 前下单当日发出；重庆市内次日达，周边省市 48 小时内送达。</span>
        </div>
      </div>
    </section>

    <section ref="tabsEl" class="pd-tabs card">
      <el-tabs v-model="tab">
        <el-tab-pane label="商品详情" name="detail">
          <div class="detail-grid">
            <div class="detail-copy">
              <h3>这份 {{ goods.name }}，从 {{ goods.plot }} 来</h3>
              <p>
                {{ goods.big }}类 · {{ goods.cat }}采用标准化种植管理，
                从育苗、水肥到采收全程记录，每一批次上市前均送检农残，检测合格后才会上架销售。
              </p>
              <p>
                采摘后 2 小时内完成预冷与分级，{{ goods.spec }}，全程冷链发运。收到后建议冷藏保存，
                尽快食用，风味最佳。
              </p>
              <div class="detail-points">
                <div><span>01</span><b>产地直供</b><small>没有中间环节，价格更实在</small></div>
                <div><span>02</span><b>标准分级</b><small>按果径、色泽、成熟度分级</small></div>
                <div><span>03</span><b>全程可溯</b><small>地块、农事、检测一码可查</small></div>
              </div>
            </div>
            <div class="detail-side">
              <div class="ds-card">
                <h4>产品信息</h4>
                <div><span>品类</span><b>{{ goods.big }} · {{ goods.cat }}</b></div>
                <div><span>规格</span><b>{{ goods.spec }}</b></div>
                <div><span>产地</span><b>{{ goods.plot }}</b></div>
                <div><span>储存</span><b>0–4℃ 冷藏</b></div>
                <div><span>保质期</span><b>建议 3 日内食用</b></div>
                <div><span>溯源码</span><b>{{ goods.trace === '—' ? '暂未开放' : goods.trace }}</b></div>
              </div>
              <div class="ds-tip">
                <span>🧺</span>
                <div><b>今日采摘批次</b><p>每日 6:00 更新，售完即止。可在「产品溯源」查看当批检测报告。</p></div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="溯源档案" name="trace">
          <div class="trace-wrap">
            <TraceTimeline v-if="trace" :trace="trace" />
            <div v-else class="empty-box">
              <div class="icon">🔎</div>
              <div>该商品暂未开放溯源档案</div>
              <el-button type="primary" plain class="mt-12" @click="$router.push('/mall/trace')">去看看其他批次</el-button>
            </div>
            <aside v-if="trace" class="trace-side">
              <div class="ts-qr" v-html="qrSvg(132)"></div>
              <b>扫码查看完整档案</b>
              <small>溯源码 {{ trace.code }}</small>
              <div class="ts-facts">
                <div><span>生产批次</span><b>{{ trace.batch }}</b></div>
                <div><span>农残检测</span><b>{{ trace.test }}</b></div>
                <div><span>环境数据</span><b>{{ trace.env }}</b></div>
                <div><span>农事记录</span><b>{{ trace.work }}</b></div>
              </div>
            </aside>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="`用户评价${reviewList.length ? `(${reviewList.length})` : ''}`" name="reviews">
          <div class="reviews-wrap">
            <aside class="review-summary">
              <div class="rs-score">
                <b>{{ avgScore }}</b>
                <div>
                  <el-rate :model-value="Number(avgScore)" disabled />
                  <span>{{ reviewList.length || 0 }} 条真实评价</span>
                </div>
              </div>
              <div class="rs-bars">
                <div v-for="row in starRows" :key="row.star">
                  <span>{{ row.star }} 星</span>
                  <i><em :style="{ width: row.pct + '%' }"></em></i>
                  <small>{{ row.count }}</small>
                </div>
              </div>
              <div class="rs-tags">
                <span v-for="t in reviewTags" :key="t">{{ t }}</span>
              </div>
            </aside>
            <div class="review-list">
              <article v-for="r in reviewList" :key="r.id" class="review-item">
                <div class="ri-head">
                  <span class="ri-avatar">{{ r.user.slice(0, 1) }}</span>
                  <div>
                    <b>{{ r.user }}</b>
                    <el-rate :model-value="r.stars" disabled size="small" />
                  </div>
                  <span class="ri-time">{{ r.time }}</span>
                </div>
                <p>{{ r.text }}</p>
                <div v-if="r.reply" class="ri-reply"><b>农户回复：</b>{{ r.reply }}</div>
              </article>
              <div v-if="!reviewList.length" class="empty-box">
                <div class="icon">💬</div>
                <div>还没有评价，买一份试试看吧</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </section>

    <section class="pd-related">
      <div class="section-head">
        <div><span class="kicker">YOU MAY ALSO LIKE</span><h2>同产地的好物</h2></div>
        <button class="more" @click="$router.push('/mall/products')">查看全部 <el-icon><ArrowRight /></el-icon></button>
      </div>
      <div class="product-grid">
        <ProductCard
          v-for="g in related"
          :key="g.id"
          :goods="g"
          :favorite="mall.isFavorite(g.id)"
          @add="quickAdd"
          @fav="quickFav"
          @open="openGoods"
        />
      </div>
    </section>
  </div>

  <div v-else class="card empty-box not-found">
    <div class="icon">🧺</div>
    <div>没有找到这款农产品，可能已经下架了</div>
    <el-button type="primary" plain class="mt-12" @click="$router.push('/mall/products')">返回全部农产品</el-button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart, Star, StarFilled, InfoFilled, ArrowRight } from '@element-plus/icons-vue'
import ProductCard from '@/components/ProductCard.vue'
import QtyStepper from '@/components/QtyStepper.vue'
import TraceTimeline from '@/components/TraceTimeline.vue'
import { useCartStore } from '@/stores/cart'
import { useMallStore } from '@/stores/mall'
import DB from '@/data/db'
import { qrSvg } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const mall = useMallStore()

const qty = ref(1)
const active = ref(0)
const tab = ref('detail')
const tabsEl = ref(null)

const goods = computed(() => DB.goods.find(g => g.id === route.params.id))
const favorite = computed(() => goods.value && mall.isFavorite(goods.value.id))

const gallery = computed(() => {
  const g = goods.value
  if (!g) return []
  return [
    { emoji: g.icon, label: '产地实拍', bg: 'linear-gradient(145deg, #f2f8ec, #dbeacf 60%, #bcd6ad)' },
    { emoji: '🌿', label: '田间生长', bg: 'linear-gradient(145deg, #eaf6e4, #cfe6c4 60%, #a9c99a)' },
    { emoji: '📦', label: '分级包装', bg: 'linear-gradient(145deg, #f8f3e6, #ede0c4 60%, #dccb9f)' },
    { emoji: '🛡️', label: '检测合格', bg: 'linear-gradient(145deg, #edf4f8, #d9e8f0 60%, #bad4e2)' }
  ]
})

const trace = computed(() => (goods.value?.trace && goods.value.trace !== '—' ? DB.traces.find(t => t.code === goods.value.trace) : null))
const reviewList = computed(() => (goods.value ? mall.reviews.filter(r => r.goodsId === goods.value.id || r.goods === goods.value.name) : []))
const avgScore = computed(() => {
  if (!reviewList.value.length) return '4.9'
  const total = reviewList.value.reduce((a, b) => a + b.stars, 0)
  return (total / reviewList.value.length).toFixed(1)
})

const starRows = computed(() => {
  const rows = [5, 4, 3, 2, 1].map(star => {
    const count = reviewList.value.filter(r => r.stars === star).length
    return { star, count, pct: reviewList.value.length ? Math.round((count / reviewList.value.length) * 100) : 0 }
  })
  if (!reviewList.value.length) {
    return rows.map(r => ({ ...r, count: [68, 21, 8, 2, 1][5 - r.star], pct: [68, 21, 8, 2, 1][5 - r.star] }))
  }
  return rows
})
const reviewTags = computed(() => (goods.value ? ['新鲜', '包装好', '物流快', '口感好', '分量足'] : []))

const related = computed(() => {
  if (!goods.value) return []
  const same = DB.goods.filter(g => g.id !== goods.value.id && g.big === goods.value.big)
  const other = DB.goods.filter(g => g.id !== goods.value.id && g.big !== goods.value.big)
  return [...same, ...other].slice(0, 4)
})

function addCart() {
  const res = cart.add(goods.value.id, qty.value)
  ElMessage[res.ok ? 'success' : 'warning'](res.ok ? `${goods.value.name} × ${qty.value} 已加入购物车` : res.message)
}
function buyNow() {
  const res = cart.add(goods.value.id, qty.value, true)
  if (!res.ok) return ElMessage.warning(res.message)
  router.push('/mall/checkout')
}
function toggleFav() {
  const on = mall.toggleFavorite(goods.value.id)
  ElMessage.success(on ? '已加入收藏' : '已取消收藏')
}
function goReviews() {
  tab.value = 'reviews'
  tabsEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
function quickAdd(g) {
  const res = cart.add(g.id, 1)
  ElMessage[res.ok ? 'success' : 'warning'](res.ok ? `${g.name} 已加入购物车` : res.message)
}
function quickFav(g) { ElMessage.success(mall.toggleFavorite(g.id) ? '已收藏' : '已取消收藏') }
function openGoods(g) { router.push(`/mall/product/${g.id}`) }
</script>

<style scoped>
.pd-page { max-width: 1240px; margin: 0 auto; padding: 20px 24px 20px; }
.pd-crumb { display: flex; align-items: center; gap: 7px; font-size: 11.5px; color: var(--ink-400); padding: 4px 0 16px; flex-wrap: wrap; }
.pd-crumb a:hover { color: var(--brand-600); }
.pd-crumb b { color: var(--ink-700); font-weight: 500; }
.pd-main { display: grid; grid-template-columns: 480px 1fr; gap: 34px; align-items: start; }
.pd-stage { position: relative; height: 430px; border-radius: 24px; display: grid; place-items: center; overflow: hidden; }
.pd-stage::after { content: ""; position: absolute; left: -15%; right: -15%; bottom: -42%; height: 210px; border-radius: 50%; background: rgba(255,255,255,.36); }
.stage-tag { position: absolute; left: 18px; top: 18px; background: rgba(255,255,255,.88); backdrop-filter: blur(6px); color: var(--brand-700); font-size: 11px; padding: 4px 11px; border-radius: 20px; }
.stage-emoji { font-size: 170px; line-height: 1; position: relative; z-index: 1; filter: drop-shadow(0 22px 30px rgba(40, 80, 40, .22)); }
.stage-label { position: absolute; left: 18px; bottom: 18px; font-size: 11px; color: rgba(44, 70, 46, .72); background: rgba(255,255,255,.5); border-radius: 20px; padding: 3px 10px; z-index: 2; }
.stage-ring { position: absolute; width: 300px; height: 300px; border: 1px dashed rgba(70, 115, 74, .25); border-radius: 50%; }
.pd-thumbs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 9px; margin-top: 12px; }
.pd-thumbs button { border: 2px solid transparent; border-radius: 13px; height: 74px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; cursor: pointer; transition: border-color .15s, transform .15s; }
.pd-thumbs button:hover { transform: translateY(-2px); }
.pd-thumbs button.on { border-color: var(--brand-500); }
.pd-thumbs span { font-size: 26px; line-height: 1; }
.pd-thumbs small { font-size: 9px; color: var(--ink-500); }
.pd-trust { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 14px; padding: 13px 14px; background: #fff; border: 1px solid var(--line); border-radius: 14px; }
.pd-trust div { display: flex; align-items: center; gap: 6px; }
.pd-trust span { font-size: 17px; }
.pd-trust b { display: block; font-size: 10.5px; }
.pd-trust small { font-size: 9px; color: var(--ink-400); }
.pd-info { padding-top: 6px; }
.pd-title-row { display: flex; align-items: flex-start; gap: 16px; }
.pd-cat { font-size: 10.5px; letter-spacing: 1.2px; color: var(--brand-500); }
.pd-info h1 { font-size: 29px; letter-spacing: .3px; margin: 6px 0 5px; line-height: 1.3; }
.pd-title-row p { font-size: 12px; color: var(--ink-400); }
.fav-btn { margin-left: auto; flex: 0 0 40px; width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--line); background: #fff; color: var(--ink-400); cursor: pointer; display: grid; place-items: center; font-size: 18px; transition: all .15s; }
.fav-btn:hover { border-color: #e2b2ac; color: #d9534f; }
.fav-btn.on { color: #d9534f; border-color: #eccac5; background: #fdf4f2; }
.pd-price-box { margin-top: 18px; padding: 16px 18px; border-radius: 16px; background: linear-gradient(110deg, #fdf1e8, #fbf8ee 70%); border: 1px solid #f0e2d2; }
.pd-price { display: flex; align-items: baseline; color: #b5473d; }
.pd-price .cur { font-size: 18px; font-weight: 600; }
.pd-price b { font-size: 40px; line-height: 1; letter-spacing: -1.4px; font-weight: 700; }
.pd-price .unit { margin-left: 6px; font-size: 11.5px; color: var(--ink-400); }
.pd-sales { font-size: 11px; color: var(--ink-400); margin-top: 5px; }
.pd-sales b { color: var(--ink-700); }
.pd-promo { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
.pd-promo span { font-size: 10px; color: #a86c18; background: #fff7e8; border: 1px solid #f1e0bf; border-radius: 4px; padding: 2px 7px; }
.pd-rating { display: flex; align-items: center; gap: 7px; margin-top: 14px; font-size: 11px; color: var(--ink-400); }
.pd-rating b { color: #b47821; font-size: 13px; }
.pd-rating button { margin-left: auto; border: none; background: transparent; font-size: 11px; color: var(--brand-600); cursor: pointer; }
.pd-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 22px; margin-top: 16px; padding: 14px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.pd-meta div { display: flex; align-items: center; gap: 9px; font-size: 11.5px; min-width: 0; }
.pd-meta span { color: var(--ink-400); flex: 0 0 42px; }
.pd-meta b { color: var(--ink-700); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pd-meta em { font-style: normal; color: var(--brand-600); cursor: pointer; font-size: 10.5px; }
.pd-row { display: flex; align-items: center; gap: 14px; margin-top: 16px; }
.row-label { font-size: 11.5px; color: var(--ink-400); width: 38px; flex: 0 0 38px; }
.spec-static { display: flex; flex-direction: column; gap: 2px; }
.spec-static b { font-size: 12.5px; font-weight: 600; }
.spec-static small { font-size: 10px; color: var(--ink-400); }
.stock-tip { font-size: 10.5px; color: var(--ink-400); }
.pd-actions { display: flex; gap: 10px; margin-top: 22px; }
.pd-actions :deep(.el-button) { height: 46px; padding: 0 30px; border-radius: 23px; font-size: 14px; }
.add-cart { color: var(--brand-700); border-color: var(--brand-300); background: var(--brand-50); }
.add-cart:hover { background: #e8f2e2; border-color: var(--brand-400); color: var(--brand-800); }
.buy-now { flex: 1; max-width: 240px; }
.pd-note { display: flex; align-items: flex-start; gap: 6px; margin-top: 14px; font-size: 10.5px; color: var(--ink-400); line-height: 1.6; }
.pd-tabs { margin-top: 34px; padding: 4px 24px 24px; }
.pd-tabs :deep(.el-tabs__header) { margin-bottom: 18px; }
.pd-tabs :deep(.el-tabs__item) { font-size: 13.5px; height: 48px; }
.detail-grid { display: grid; grid-template-columns: 1.5fr .7fr; gap: 34px; }
.detail-copy h3 { font-size: 18px; margin-bottom: 12px; }
.detail-copy p { font-size: 12.5px; color: var(--ink-500); line-height: 2; margin-bottom: 10px; }
.detail-points { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 18px; }
.detail-points div { background: var(--brand-50); border: 1px solid #e4eedd; border-radius: 12px; padding: 13px; }
.detail-points span { font-size: 10px; color: var(--brand-400); letter-spacing: 1px; }
.detail-points b { display: block; font-size: 12px; margin: 4px 0 2px; }
.detail-points small { font-size: 10px; color: var(--ink-400); line-height: 1.5; display: block; }
.ds-card { background: #fafbf6; border: 1px solid var(--line); border-radius: 14px; padding: 16px; }
.ds-card h4 { font-size: 12.5px; margin-bottom: 10px; }
.ds-card div { display: flex; justify-content: space-between; gap: 10px; font-size: 11px; padding: 6px 0; border-bottom: 1px dashed #e9ede2; }
.ds-card div:last-child { border-bottom: none; }
.ds-card span { color: var(--ink-400); }
.ds-card b { font-weight: 500; text-align: right; }
.ds-tip { display: flex; gap: 9px; margin-top: 12px; padding: 12px 13px; background: #fdf6e8; border: 1px solid #f1e2c4; border-radius: 12px; }
.ds-tip span { font-size: 20px; }
.ds-tip b { display: block; font-size: 11.5px; color: #8a6527; }
.ds-tip p { font-size: 10.5px; color: #a58652; line-height: 1.6; margin-top: 2px; }
.trace-wrap { display: grid; grid-template-columns: 1.6fr .65fr; gap: 24px; align-items: start; }
.trace-side { background: #fafbf6; border: 1px solid var(--line); border-radius: 14px; padding: 20px; text-align: center; }
.ts-qr { display: inline-flex; padding: 8px; background: #fff; border: 1px solid var(--line); border-radius: 12px; }
.trace-side > b { display: block; font-size: 12.5px; margin-top: 10px; }
.trace-side > small { display: block; font-size: 10.5px; color: var(--ink-400); }
.ts-facts { margin-top: 14px; text-align: left; }
.ts-facts div { display: flex; justify-content: space-between; gap: 10px; padding: 7px 0; border-top: 1px dashed var(--line); font-size: 10.5px; }
.ts-facts span { color: var(--ink-400); }
.ts-facts b { font-weight: 500; text-align: right; max-width: 62%; }
.reviews-wrap { display: grid; grid-template-columns: 280px 1fr; gap: 28px; align-items: start; }
.review-summary { background: #fafbf6; border: 1px solid var(--line); border-radius: 14px; padding: 18px; }
.rs-score { display: flex; align-items: center; gap: 13px; padding-bottom: 14px; border-bottom: 1px solid var(--line); }
.rs-score > b { font-size: 36px; line-height: 1; color: #b47821; letter-spacing: -1px; }
.rs-score span { display: block; font-size: 10px; color: var(--ink-400); margin-top: 2px; }
.rs-bars { padding: 13px 0 8px; }
.rs-bars div { display: flex; align-items: center; gap: 7px; margin-bottom: 6px; font-size: 10px; color: var(--ink-400); }
.rs-bars span { width: 28px; flex: 0 0 28px; }
.rs-bars i { flex: 1; height: 5px; border-radius: 3px; background: #e9ede2; overflow: hidden; }
.rs-bars em { display: block; height: 100%; background: #d8b06a; border-radius: 3px; }
.rs-bars small { width: 24px; text-align: right; flex: 0 0 24px; }
.rs-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px; }
.rs-tags span { font-size: 10px; color: var(--brand-700); background: var(--brand-50); border: 1px solid var(--brand-100); border-radius: 20px; padding: 2px 8px; }
.review-item { padding: 15px 0; border-bottom: 1px solid #f0f3eb; }
.review-item:first-child { padding-top: 2px; }
.ri-head { display: flex; align-items: center; gap: 10px; }
.ri-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #7ca66e, #426f4a); color: #fff; display: grid; place-items: center; font-size: 12px; flex: 0 0 34px; }
.ri-head b { display: block; font-size: 11.5px; }
.ri-time { margin-left: auto; font-size: 10px; color: var(--ink-300); }
.review-item > p { font-size: 12px; color: var(--ink-500); line-height: 1.8; margin-top: 9px; }
.ri-reply { margin-top: 9px; background: #f7f9f1; border-left: 2px solid var(--brand-300); padding: 8px 11px; border-radius: 0 8px 8px 0; font-size: 11px; color: var(--ink-500); line-height: 1.7; }
.ri-reply b { color: var(--brand-600); }
.pd-related { margin-top: 40px; }
.section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.kicker { font-size: 9.5px; letter-spacing: 2px; color: var(--brand-500); }
.section-head h2 { font-size: 23px; margin-top: 4px; }
.more { border: none; background: transparent; font-size: 12px; color: var(--ink-500); cursor: pointer; display: inline-flex; align-items: center; gap: 3px; }
.more:hover { color: var(--brand-600); }
.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.not-found { max-width: 640px; margin: 60px auto; }
@media (max-width: 1080px) {
  .pd-main { grid-template-columns: 400px 1fr; gap: 24px; }
  .pd-stage { height: 370px; }
  .stage-emoji { font-size: 140px; }
  .detail-grid, .trace-wrap, .reviews-wrap { grid-template-columns: 1fr; }
  .trace-side { max-width: 340px; }
}
@media (max-width: 860px) {
  .pd-page { padding: 14px 16px; }
  .pd-main { grid-template-columns: 1fr; gap: 22px; }
  .pd-stage { height: 320px; }
  .stage-emoji { font-size: 118px; }
  .pd-trust { grid-template-columns: repeat(3, 1fr); }
  .pd-info h1 { font-size: 24px; }
  .pd-tabs { padding: 2px 14px 18px; margin-top: 24px; }
  .detail-points { grid-template-columns: 1fr; }
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .pd-actions :deep(.el-button) { padding: 0 18px; }
}
@media (max-width: 560px) {
  .pd-stage { height: 270px; }
  .stage-emoji { font-size: 96px; }
  .pd-thumbs button { height: 62px; }
  .pd-meta { grid-template-columns: 1fr; gap: 6px; }
  .pd-price b { font-size: 34px; }
  .pd-actions :deep(.el-button) { flex: 1; padding: 0 10px; }
  .buy-now { max-width: none; }
  .review-summary { padding: 14px; }
}
</style>
