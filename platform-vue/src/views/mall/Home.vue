<template>
  <div class="home">
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-copy">
          <span class="hero-kicker">FRESH FROM THE FARM · 产地直供</span>
          <h1>把一整座农场<br /><em>新鲜送到你餐桌</em></h1>
          <p>当日采摘、冷链直发、一物一码溯源。每一份农产品都能查到它生长的地块、农事记录和农残检测报告，让新鲜与安心看得见。</p>
          <div class="hero-actions">
            <el-button type="primary" size="large" @click="$router.push('/mall/products')">立即选购 <el-icon><ArrowRight /></el-icon></el-button>
            <el-button size="large" @click="scrollTo('trace')">查产品溯源</el-button>
          </div>
          <div class="hero-stats">
            <div><b>3</b><span>自营园区</span></div>
            <div><b>{{ DB.catTree.length }}</b><span>品类大类</span></div>
            <div><b>{{ DB.goods.length }}</b><span>在售商品</span></div>
            <div><b>24h</b><span>主城送达</span></div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hv-card main">
            <span class="hv-tag">今日现摘</span>
            <span class="hv-emoji">🍅</span>
            <div class="hv-info">
              <b>永川粉贝贝番茄</b>
              <span>500g/盒 · 一级果</span>
              <strong>¥12.8</strong>
            </div>
          </div>
          <div class="hv-badge trace"><span>🛡️</span><div><b>溯源可查</b><small>一物一码</small></div></div>
          <div class="hv-badge cold"><span>❄️</span><div><b>冷链锁鲜</b><small>采摘 2h 预冷</small></div></div>
          <div class="hv-ring"></div>
        </div>
      </div>
    </section>

    <section class="trust-strip">
      <div class="ts-inner">
        <div class="ts-item"><span>🌱</span><div><b>产地直供</b><small>没有中间商，价格更实在</small></div></div>
        <div class="ts-item"><span>🛡️</span><div><b>农残检测</b><small>每批次检测合格才上架</small></div></div>
        <div class="ts-item"><span>📦</span><div><b>冷链配送</b><small>采摘 2 小时内预冷发运</small></div></div>
        <div class="ts-item"><span>💚</span><div><b>坏果包赔</b><small>拍照反馈，按坏果退款</small></div></div>
      </div>
    </section>

    <section class="section categories">
      <div class="section-head">
        <div><span class="kicker">SHOP BY CATEGORY</span><h2>今天想吃点什么？</h2></div>
        <button class="more" @click="$router.push('/mall/products')">全部农产品 <el-icon><ArrowRight /></el-icon></button>
      </div>
      <div class="cat-grid">
        <button v-for="c in cats" :key="c.name" class="cat-card" :style="{ background: c.bg }" @click="goCat(c.name)">
          <span class="cat-emoji">{{ c.icon }}</span>
          <b>{{ c.name }}</b>
          <span>{{ c.desc }}</span>
          <em>{{ countCat(c.name) }} 款在售</em>
        </button>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <div><span class="kicker">PICKED THIS MORNING</span><h2>今日现摘</h2></div>
        <div class="head-actions">
          <span class="tiny muted">每日 6:00 更新采摘批次</span>
          <button class="more" @click="$router.push('/mall/products')">查看全部 <el-icon><ArrowRight /></el-icon></button>
        </div>
      </div>
      <div class="product-grid">
        <ProductCard
          v-for="g in goods"
          :key="g.id"
          :goods="g"
          :favorite="mall.isFavorite(g.id)"
          @add="add"
          @fav="fav"
          @open="open"
        />
      </div>
    </section>

    <section id="trace" class="trace-section">
      <div class="trace-inner">
        <div class="trace-copy">
          <span class="kicker">FARM TO TABLE · 全程可查</span>
          <h2>扫一扫，看看它<br />从哪块地里来</h2>
          <p>输入包装上的溯源码，或直接体验示例批次。你能看到生长环境、农事操作、采收分级和农残检测的完整记录。</p>
          <div class="trace-search">
            <el-input v-model="code" placeholder="输入溯源码，如 TR-00021" size="large" clearable @keyup.enter="queryTrace">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-button type="primary" size="large" @click="queryTrace">查询</el-button>
          </div>
          <div class="quick-codes">
            <span>示例：</span>
            <button v-for="t in DB.traces.filter(t => t.code !== '—').slice(0, 3)" :key="t.code" @click="code = t.code; queryTrace()">{{ t.code }}</button>
          </div>
          <div class="trace-points">
            <span><i></i>地块环境</span><span><i></i>农事记录</span><span><i></i>农残检测</span><span><i></i>冷链配送</span>
          </div>
        </div>
        <div class="trace-preview">
          <div class="tp-card">
            <div class="tp-top">
              <span class="tp-qr">▦</span>
              <div><b>{{ sample.code }}</b><span>{{ sample.crop }} · {{ sample.plot }}</span></div>
              <span class="tp-pass">检测合格</span>
            </div>
            <div class="tp-steps">
              <div v-for="(s, i) in previewSteps" :key="i" class="tp-step">
                <span class="tp-dot"></span>
                <div><b>{{ s.title }}</b><p>{{ s.text }}</p></div>
              </div>
            </div>
            <button class="tp-more" @click="queryTrace">查看完整溯源档案 →</button>
          </div>
        </div>
      </div>
    </section>

    <section class="section story">
      <div class="story-inner">
        <div class="story-visual">
          <div class="sv-panel">
            <span class="sv-emoji">🌾</span>
            <div class="sv-chip c1">🌱 春播</div>
            <div class="sv-chip c2">💧 智能灌溉</div>
            <div class="sv-chip c3">🧺 当日采收</div>
          </div>
        </div>
        <div class="story-copy">
          <span class="kicker">WHY OUR FARM</span>
          <h2>不是所有农产品，<br />都敢把过程摊开给你看</h2>
          <p>我们自有 3 个示范园区、2,610 亩种植基地，从育苗、施肥、灌溉到采收，全程由物联网设备记录。你买到的每一份蔬菜水果，都能对应到具体地块和批次。</p>
          <div class="story-list">
            <div><span class="sl-num">01</span><div><b>看得见的生长环境</b><p>温度、湿度、光照、土壤墒情每 60 秒采集一次。</p></div></div>
            <div><span class="sl-num">02</span><div><b>说得清的农事操作</b><p>施肥、打药、灌溉全部登记，农药安全间隔期严格管理。</p></div></div>
            <div><span class="sl-num">03</span><div><b>查得到的检测报告</b><p>每批次上市前送检，农残检测合格后才会生成溯源码。</p></div></div>
          </div>
          <el-button type="primary" plain @click="$router.push('/mall/trace')">去看产品溯源</el-button>
        </div>
      </div>
    </section>

    <section class="section reviews">
      <div class="section-head">
        <div><span class="kicker">WHAT CUSTOMERS SAY</span><h2>他们收到的，是这样的</h2></div>
        <div class="review-score"><b>4.8</b><el-rate :model-value="4.8" disabled /><span>来自 {{ mall.reviews.length * 127 }} 位买家</span></div>
      </div>
      <div class="review-grid">
        <article v-for="r in mall.reviews.slice(0, 3)" :key="r.id" class="review-card">
          <div class="rc-head">
            <span class="rc-avatar">{{ r.user.slice(0, 1) }}</span>
            <div><b>{{ r.user }}</b><el-rate :model-value="r.stars" disabled size="small" /></div>
            <span class="rc-good">{{ r.goods }}</span>
          </div>
          <p>{{ r.text }}</p>
          <div class="rc-foot"><span>{{ r.time }}</span><span class="rc-verified">✓ 已购</span></div>
        </article>
      </div>
    </section>

    <section class="section faq">
      <div class="faq-inner">
        <div class="faq-copy">
          <span class="kicker">GOOD TO KNOW</span>
          <h2>买之前，<br />你可能想知道</h2>
          <p>如果还有其他问题，可以联系农户或平台客服，我们每天 6:00 – 22:00 在线。</p>
          <el-button plain @click="contact">联系客服</el-button>
        </div>
        <el-collapse v-model="activeFaq" class="faq-list">
          <el-collapse-item v-for="(f, i) in DB.faqs" :key="i" :name="i">
            <template #title><span class="faq-q">{{ f.q }}</span></template>
            <p class="faq-a">{{ f.a }}</p>
          </el-collapse-item>
        </el-collapse>
      </div>
    </section>

    <section class="cta">
      <div class="cta-inner">
        <span class="cta-emoji">🧺</span>
        <div><h2>今天下单，明天早上就能吃到</h2><p>产地当日采摘，16:00 前下单当日发出，重庆市内次日达。</p></div>
        <el-button type="primary" size="large" @click="$router.push('/mall/products')">去挑点新鲜的</el-button>
      </div>
    </section>

    <el-dialog v-model="traceOpen" title="产品溯源档案" width="620px" destroy-on-close>
      <TraceTimeline v-if="trace" :trace="trace" />
      <div v-else class="empty-box"><div class="icon">🔎</div><div>未找到该溯源码，请检查后重试</div></div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowRight, Search } from '@element-plus/icons-vue'
import ProductCard from '@/components/ProductCard.vue'
import TraceTimeline from '@/components/TraceTimeline.vue'
import { useCartStore } from '@/stores/cart'
import { useMallStore } from '@/stores/mall'
import DB from '@/data/db'

const router = useRouter()
const cart = useCartStore()
const mall = useMallStore()

const goods = DB.goods
const code = ref('TR-00021')
const traceOpen = ref(false)
const traceCode = ref('TR-00021')
const activeFaq = ref([0])
const sample = DB.traces[0]
const trace = computed(() => DB.traces.find(t => t.code === traceCode.value))
const previewSteps = computed(() => (trace.value ? [
  { title: '产地地块', text: `${trace.value.plot} · ${trace.value.batch}` },
  { title: '生长环境', text: trace.value.env },
  { title: '农事与检测', text: `${trace.value.work}；${trace.value.test}` }
] : []))

const catBg = {
  果蔬: 'linear-gradient(135deg,#eef7e4,#dbecc9)',
  粮油: 'linear-gradient(135deg,#f8f2de,#ece1bd)',
  水产: 'linear-gradient(135deg,#e8f2f5,#d0e4ea)',
  肉禽蛋: 'linear-gradient(135deg,#fdeee7,#f3d7cc)'
}
const cats = DB.catTree.map(c => ({ ...c, bg: catBg[c.name] || 'linear-gradient(135deg,#f5f6ee,#e7ecdd)' }))
const countCat = (big) => DB.goods.filter(g => g.big === big).length

function add(g) {
  const res = cart.add(g.id, 1)
  ElMessage[res.ok ? 'success' : 'warning'](res.ok ? `${g.name} 已加入购物车` : res.message)
}
function fav(g) {
  const on = mall.toggleFavorite(g.id)
  ElMessage.success(on ? '已收藏' : '已取消收藏')
}
function open(g) { router.push(`/mall/product/${g.id}`) }
function goCat(name) { router.push({ path: '/mall/products', query: { big: name } }) }
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
function queryTrace() {
  const c = code.value.trim().toUpperCase()
  if (!c) return ElMessage.warning('请输入溯源码')
  const found = DB.traces.find(t => t.code === c)
  if (!found) return ElMessage.warning('未找到该溯源码，试试 TR-00021')
  traceCode.value = c
  traceOpen.value = true
}
function contact() { ElMessage.info('客服热线：400-880-2026（演示环境）') }
</script>

<style scoped>
.home { background: var(--cream); }
.hero { position: relative; overflow: hidden; background: radial-gradient(120% 120% at 85% 10%, #e8f2e1 0%, #f7f5ee 45%, #f7f5ee 100%); }
.hero::before { content: ""; position: absolute; right: -160px; top: -220px; width: 620px; height: 620px; border-radius: 50%; background: radial-gradient(circle, rgba(125,171,112,.18), transparent 68%); }
.hero-inner { max-width: 1240px; margin: 0 auto; padding: 66px 24px 58px; display: grid; grid-template-columns: 1.1fr .9fr; gap: 40px; align-items: center; position: relative; }
.hero-kicker { font-size: 10.5px; letter-spacing: 2.4px; color: var(--brand-600); }
.hero h1 { font-size: 46px; line-height: 1.25; letter-spacing: 1px; margin: 14px 0 16px; color: var(--brand-900); }
.hero h1 em { font-style: normal; color: var(--brand-600); position: relative; }
.hero h1 em::after { content: ""; position: absolute; left: 0; right: 0; bottom: 4px; height: 10px; background: rgba(148, 190, 126, .32); border-radius: 6px; z-index: -1; }
.hero-copy > p { font-size: 14px; line-height: 1.95; color: var(--ink-500); max-width: 480px; }
.hero-actions { display: flex; gap: 10px; margin: 26px 0 30px; flex-wrap: wrap; }
.hero-stats { display: flex; gap: 34px; flex-wrap: wrap; }
.hero-stats b { display: block; font-size: 25px; color: var(--brand-700); letter-spacing: -.5px; }
.hero-stats span { font-size: 11px; color: var(--ink-400); }
.hero-visual { position: relative; height: 400px; }
.hv-card { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 260px; background: #fff; border-radius: 24px; padding: 20px; box-shadow: 0 28px 60px rgba(31, 63, 39, .16); border: 1px solid rgba(255,255,255,.7); }
.hv-tag { position: absolute; top: 14px; left: 16px; font-size: 10px; background: var(--brand-50); color: var(--brand-700); border-radius: 20px; padding: 2px 8px; }
.hv-emoji { display: block; font-size: 118px; text-align: center; line-height: 1.25; filter: drop-shadow(0 16px 22px rgba(120, 45, 30, .2)); }
.hv-info { text-align: center; }
.hv-info b { display: block; font-size: 15px; }
.hv-info span { font-size: 10.5px; color: var(--ink-400); }
.hv-info strong { display: block; font-size: 24px; color: #b5473d; margin-top: 4px; }
.hv-badge { position: absolute; display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,.94); border: 1px solid #fff; border-radius: 14px; padding: 9px 12px; box-shadow: 0 12px 30px rgba(31,63,39,.12); }
.hv-badge span { font-size: 20px; }
.hv-badge b { display: block; font-size: 11.5px; }
.hv-badge small { font-size: 9.5px; color: var(--ink-400); }
.hv-badge.trace { left: -6px; top: 52px; animation: float 5s ease-in-out infinite; }
.hv-badge.cold { right: -6px; bottom: 48px; animation: float 6s ease-in-out infinite reverse; }
@keyframes float { 50% { transform: translateY(-9px); } }
.hv-ring { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 350px; height: 350px; border: 1px dashed rgba(88, 133, 94, .28); border-radius: 50%; }
.trust-strip { background: #fff; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.ts-inner { max-width: 1200px; margin: 0 auto; padding: 20px 24px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
.ts-item { display: flex; align-items: center; gap: 11px; }
.ts-item > span { font-size: 24px; }
.ts-item b { display: block; font-size: 12.5px; }
.ts-item small { font-size: 10.5px; color: var(--ink-400); }
.section { max-width: 1240px; margin: 0 auto; padding: 52px 24px 0; }
.section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 22px; flex-wrap: wrap; }
.kicker { font-size: 9.5px; letter-spacing: 2px; color: var(--brand-500); }
.section-head h2 { font-size: 27px; letter-spacing: .3px; margin-top: 5px; }
.more { border: none; background: transparent; font-size: 12px; color: var(--ink-500); cursor: pointer; display: inline-flex; align-items: center; gap: 3px; }
.more:hover { color: var(--brand-600); }
.head-actions { display: flex; align-items: center; gap: 16px; }
.cat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.cat-card { border: none; border-radius: 18px; padding: 18px 14px 16px; text-align: center; cursor: pointer; transition: transform .2s, box-shadow .2s; }
.cat-card:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(50, 80, 55, .12); }
.cat-emoji { display: block; font-size: 38px; margin-bottom: 7px; }
.cat-card b { display: block; font-size: 13.5px; color: var(--ink-900); }
.cat-card > span:not(.cat-emoji) { display: block; font-size: 10px; color: var(--ink-500); margin: 1px 0 5px; }
.cat-card em { font-style: normal; font-size: 9.5px; color: var(--ink-400); background: rgba(255,255,255,.6); border-radius: 20px; padding: 1px 7px; }
.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.product-grid :deep(.product-card) { background: transparent; border: 1px solid #ecefe6; }
.trace-section { margin-top: 58px; background: linear-gradient(135deg, #3f7d4b 0%, #5a9a60 100%); color: #e2f0dc; }
.trace-inner { max-width: 1200px; margin: 0 auto; padding: 52px 24px; display: grid; grid-template-columns: 1fr .92fr; gap: 44px; align-items: center; }
.trace-copy .kicker { color: #bde0b7; }
.trace-copy h2 { font-size: 31px; color: #ffffff; line-height: 1.35; margin: 10px 0 12px; }
.trace-copy p { font-size: 12.5px; line-height: 1.9; color: #e0efd9; max-width: 450px; }
.trace-search { display: flex; gap: 8px; margin-top: 20px; max-width: 440px; }
.trace-search :deep(.el-input__wrapper) { background: rgba(255,255,255,.1); box-shadow: 0 0 0 1px rgba(255,255,255,.16) inset; }
.trace-search :deep(.el-input__inner) { color: #eaf6e7; }
.trace-search :deep(.el-input__inner::placeholder) { color: #a9c6a4; }
.trace-search :deep(.el-button--primary) { --el-button-bg-color: #d7e9bf; --el-button-border-color: #d7e9bf; --el-button-text-color: #24402c; }
.quick-codes { display: flex; align-items: center; gap: 6px; margin-top: 10px; font-size: 10.5px; color: #bcd6b6; flex-wrap: wrap; }
.quick-codes button { border: 1px solid rgba(255,255,255,.15); background: transparent; color: #b6d2b8; border-radius: 20px; padding: 2px 8px; font-size: 10.5px; cursor: pointer; }
.quick-codes button:hover { background: rgba(255,255,255,.08); }
.trace-points { display: flex; gap: 16px; margin-top: 22px; flex-wrap: wrap; }
.trace-points span { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: #dbecd4; }
.trace-points i { width: 5px; height: 5px; border-radius: 50%; background: #cdeec2; }
.tp-card { background: #fbfcf7; border-radius: 20px; padding: 20px; color: var(--ink-900); box-shadow: 0 26px 60px rgba(5, 20, 10, .28); }
.tp-top { display: flex; align-items: center; gap: 10px; padding-bottom: 14px; border-bottom: 1px dashed var(--line-strong); }
.tp-qr { width: 42px; height: 42px; border-radius: 11px; background: var(--brand-50); color: var(--brand-600); display: grid; place-items: center; font-size: 22px; }
.tp-top b { display: block; font-size: 16px; font-family: ui-monospace, Consolas, monospace; letter-spacing: .5px; }
.tp-top span { font-size: 10px; color: var(--ink-400); }
.tp-pass { margin-left: auto; font-size: 10px; background: #eef8ea; border: 1px solid #d7ecd0; color: #47724a; border-radius: 20px; padding: 3px 9px; }
.tp-steps { padding: 6px 0; }
.tp-step { display: flex; gap: 11px; padding: 10px 0; position: relative; }
.tp-step:not(:last-child)::before { content: ""; position: absolute; left: 4px; top: 22px; bottom: -6px; width: 1px; background: #e0e9da; }
.tp-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--brand-500); margin-top: 4px; flex: 0 0 9px; box-shadow: 0 0 0 3px rgba(91,140,98,.13); }
.tp-step b { font-size: 11.5px; }
.tp-step p { font-size: 10.5px; color: var(--ink-500); line-height: 1.55; }
.tp-more { width: 100%; border: 1px dashed var(--brand-200); background: var(--brand-50); color: var(--brand-700); border-radius: 10px; padding: 9px; font-size: 11px; cursor: pointer; margin-top: 4px; }
.tp-more:hover { background: #e9f3e4; }
.story-inner { display: grid; grid-template-columns: .9fr 1.1fr; gap: 44px; align-items: center; }
.story-visual { position: relative; }
.sv-panel { height: 350px; border-radius: 24px; background: linear-gradient(140deg, #dcebd5, #b9d3ac 55%, #8fb486); position: relative; overflow: hidden; display: grid; place-items: center; }
.sv-panel::after { content: ""; position: absolute; inset: auto -20% -40% -20%; height: 180px; border-radius: 50%; background: rgba(255,255,255,.3); }
.sv-emoji { font-size: 110px; filter: drop-shadow(0 16px 24px rgba(50, 90, 50, .2)); position: relative; z-index: 1; }
.sv-chip { position: absolute; background: rgba(255,255,255,.9); border-radius: 20px; padding: 6px 11px; font-size: 10.5px; color: var(--brand-800); box-shadow: 0 8px 20px rgba(40,80,45,.12); }
.sv-chip.c1 { left: 28px; top: 40px; }
.sv-chip.c2 { right: 24px; top: 120px; }
.sv-chip.c3 { left: 50px; bottom: 44px; }
.story-copy .kicker { color: var(--brand-500); }
.story-copy h2 { font-size: 30px; line-height: 1.38; margin: 9px 0 12px; }
.story-copy > p { font-size: 12.5px; color: var(--ink-500); line-height: 1.9; max-width: 500px; }
.story-list { margin: 20px 0 22px; display: flex; flex-direction: column; gap: 14px; }
.story-list > div { display: flex; gap: 12px; }
.sl-num { font-size: 11px; font-weight: 700; color: var(--brand-400); letter-spacing: 1px; padding-top: 2px; }
.story-list b { font-size: 12.5px; color: #ffffff; }
.story-list p { font-size: 11.5px; color: rgba(255, 255, 255, .72); line-height: 1.6; margin-top: 2px; }
.review-score { display: flex; align-items: center; gap: 8px; }
.review-score b { font-size: 27px; color: #b47821; }
.review-score span { font-size: 10.5px; color: rgba(255, 255, 255, .72); }
.review-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.review-card { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 18px; }
.rc-head { display: flex; align-items: center; gap: 9px; }
.rc-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #7ca66e, #426f4a); color: #fff; display: grid; place-items: center; font-size: 13px; flex: 0 0 34px; }
.rc-head b { display: block; font-size: 11.5px; }
.rc-good { margin-left: auto; font-size: 9.5px; color: var(--brand-600); background: var(--brand-50); border-radius: 20px; padding: 2px 8px; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.review-card > p { font-size: 12px; color: var(--ink-500); line-height: 1.8; margin: 12px 0; min-height: 65px; }
.rc-foot { display: flex; justify-content: space-between; font-size: 9.5px; color: var(--ink-300); }
.rc-verified { color: var(--brand-500); }
.faq-inner { display: grid; grid-template-columns: .8fr 1.2fr; gap: 44px; align-items: start; }
.faq-copy h2 { font-size: 28px; line-height: 1.4; margin: 9px 0 12px; }
.faq-copy p { font-size: 12.5px; color: var(--ink-500); line-height: 1.85; margin-bottom: 18px; max-width: 340px; }
.faq-list { background: transparent; border: none; }
.faq-list :deep(.el-collapse-item__header) { background: transparent; border-bottom: 1px solid var(--line); font-size: 14px; height: 56px; }
.faq-list :deep(.el-collapse-item__wrap) { background: transparent; border-bottom: 1px solid var(--line); }
.faq-list :deep(.el-collapse-item__content) { padding-bottom: 18px; }
.faq-q { font-size: 14px; font-weight: 500; }
.faq-a { font-size: 12.5px; color: var(--ink-500); line-height: 1.9; }
.cta { max-width: 1240px; margin: 52px auto 0; padding: 0 24px; }
.cta-inner { background: linear-gradient(120deg, #b7d7a8 0%, #cde8c7 100%); border: 1px solid rgba(255,255,255,.65); border-radius: 22px; padding: 28px 34px; display: flex; align-items: center; gap: 18px; color: #24402c; box-shadow: 0 14px 30px rgba(70, 120, 78, .12); flex-wrap: wrap; }
.cta-emoji { font-size: 38px; width: 62px; height: 62px; border-radius: 16px; background: rgba(255,255,255,.6); display: grid; place-items: center; flex: 0 0 62px; }
.cta-inner > div { flex: 1; min-width: 240px; }
.cta-inner h2 { font-size: 21px; color: #1f3526; }
.cta-inner p { font-size: 12px; color: #3f5a49; margin-top: 4px; }
.cta-inner :deep(.el-button--primary) { --el-button-bg-color: #3d7a49; --el-button-border-color: #3d7a49; --el-button-text-color: #fff; --el-button-hover-bg-color: #345f3d; --el-button-hover-border-color: #345f3d; --el-button-hover-text-color: #fff; box-shadow: 0 8px 18px rgba(45, 86, 55, .18); }
@media (max-width: 1000px) {
  .hero-inner { grid-template-columns: 1fr; padding-top: 46px; }
  .hero-visual { display: none; }
  .cat-grid { grid-template-columns: repeat(3, 1fr); }
  .product-grid { grid-template-columns: repeat(3, 1fr); }
  .trace-inner, .story-inner, .faq-inner { grid-template-columns: 1fr; }
  .review-grid { grid-template-columns: 1fr; }
  .story-visual { order: 2; }
}
@media (max-width: 700px) {
  .hero h1 { font-size: 32px; }
  .section { padding: 38px 16px 0; }
  .section-head h2 { font-size: 22px; }
  .cat-grid { grid-template-columns: 1fr 1fr; }
  .cat-card { padding: 14px 10px; }
  .product-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .ts-inner { grid-template-columns: 1fr 1fr; padding: 16px; }
  .trace-inner { padding: 38px 18px; }
  .trace-copy h2 { font-size: 24px; }
  .sv-panel { height: 250px; }
  .sv-emoji { font-size: 76px; }
  .cta { padding: 0 16px; }
  .cta-inner { padding: 22px; }
  .review-score { display: none; }
}
/* 绿主题：恢复深色文字 */
.section-head h2, .story-copy h2, .faq-copy h2 { color: var(--ink-900); }
.kicker, .story-copy .kicker { color: var(--brand-500); }
.more { color: var(--ink-500); }
.more:hover { color: var(--brand-600); }
.story-copy > p { color: var(--ink-500); }
.story-list b { color: var(--ink-900); }
.story-list p { color: var(--ink-400); }
.sl-num { color: var(--brand-400); }
.review-score span { color: var(--ink-400); }
.head-actions .tiny { color: var(--ink-400); }
</style>
