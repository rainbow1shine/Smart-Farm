<template>
  <div class="page-wrap">
    <PageHeader title="消费者商城" sub="农产品浏览 / 溯源查询 / 下单购买">
      <template #actions>
        <el-button type="primary" :icon="ShoppingBag" @click="$router.push('/mall')">进入商城</el-button>
        <el-button :icon="Monitor" @click="$router.push('/screen')">大屏展示</el-button>
      </template>
    </PageHeader>

    <div class="mall-hero">
      <div class="mh-copy">
        <span class="mh-kicker">FRESH FROM THE FARM · 产地直供</span>
        <h1>从地块到餐桌<br />每一口都有据可查</h1>
        <p>当日采摘、农残检测、一物一码溯源、冷链直发。消费者商城主打「看得见的新鲜」，同时为管理端提供商品、订单、评价与消费者运营入口。</p>
        <div class="mh-actions">
          <el-button type="primary" size="large" :icon="ShoppingBag" @click="$router.push('/mall')">打开消费者商城</el-button>
          <el-button size="large" @click="$router.push('/mall/trace')">体验产品溯源</el-button>
        </div>
        <div class="mh-chips">
          <span>农残检测</span><span>基地直供</span><span>坏果包赔</span><span>次日达</span>
        </div>
      </div>
      <div class="mh-phone">
        <div class="phone-frame">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <div class="ps-head">
              <span class="ps-logo">🌿</span>
              <b>智慧农业商城</b>
              <span class="ps-cart">🛒</span>
            </div>
            <div class="ps-search">搜索番茄、草莓、大米…</div>
            <div class="ps-banner">
              <div><b>今日现摘</b><span>产地直发 · 冷链锁鲜</span></div>
              <span class="ps-emoji">🍅</span>
            </div>
            <div class="ps-grid">
              <div v-for="g in DB.goods.slice(0, 4)" :key="g.id" class="ps-item">
                <span>{{ g.icon }}</span><b>{{ g.name.slice(0, 5) }}</b><em>¥{{ g.price }}</em>
              </div>
            </div>
            <div class="ps-tabbar"><span class="on">首页</span><span>产品</span><span>溯源</span><span>我的</span></div>
          </div>
        </div>
      </div>
    </div>

    <div class="stat-grid">
      <StatCard label="在售商品" :value="admin.goods.length" unit="款" foot="6 个品类" icon="Goods" />
      <StatCard label="今日订单" :value="admin.orderList.length" unit="笔" foot="待发货 2 笔" icon="List" tone="info" />
      <StatCard label="待回复评价" :value="admin.reviews.filter(r => r.status === '待回复').length" unit="条" foot="建议 24h 内处理" icon="ChatDotSquare" tone="warn" />
      <StatCard label="溯源查询" value="1,862" unit="次" foot="近 30 天扫码" icon="Ticket" />
    </div>

    <div class="entry-grid">
      <button class="entry-card card" @click="$router.push('/mall')">
        <span class="ec-icon" style="background:#eef5ea;color:#4f7f56">🏠</span>
        <b>商城首页</b><span>轮播、今日现摘、溯源故事、买家评价</span><em>打开 →</em>
      </button>
      <button class="entry-card card" @click="$router.push('/mall/products')">
        <span class="ec-icon" style="background:#eaf2f7;color:#3b78a8">🧺</span>
        <b>全部农产品</b><span>分类、价格、排序、筛选与快速加购</span><em>打开 →</em>
      </button>
      <button class="entry-card card" @click="$router.push('/mall/trace')">
        <span class="ec-icon" style="background:#fbf1df;color:#b47821">🔎</span>
        <b>产品溯源</b><span>输入溯源码查看环境、农事、检测全记录</span><em>打开 →</em>
      </button>
      <button class="entry-card card" @click="$router.push('/admin/market-goods')">
        <span class="ec-icon" style="background:#fbece9;color:#b84d40">🏷️</span>
        <b>商品管理</b><span>上架、下架、价格与库存维护</span><em>管理 →</em>
      </button>
      <button class="entry-card card" @click="$router.push('/admin/market-order')">
        <span class="ec-icon" style="background:#eef5ea;color:#4f7f56">📦</span>
        <b>订单发货</b><span>查看订单、填写物流、闭环跟踪</span><em>管理 →</em>
      </button>
      <button class="entry-card card" @click="$router.push('/admin/market-sales')">
        <span class="ec-icon" style="background:#eaf2f7;color:#3b78a8">📈</span>
        <b>销售统计</b><span>销售额、热销产品与渠道分析</span><em>查看 →</em>
      </button>
    </div>

    <div class="card mt-16 preview-card">
      <div class="card-head"><h3>商城数据概览</h3><span class="sub">与商城端实时同步</span><div class="acts"><el-button text type="primary" @click="$router.push('/mall')">去商城看看</el-button></div></div>
      <div class="preview-grid">
        <div class="pv-section">
          <h4>热销产品</h4>
          <div v-for="g in admin.goods.slice().sort((a, b) => b.sold - a.sold).slice(0, 4)" :key="g.id" class="pv-goods">
            <span class="pv-emoji">{{ g.icon }}</span>
            <div class="pv-main"><b>{{ g.name }}</b><span>{{ g.cat }} · {{ money(g.price) }}</span></div>
            <span class="pv-sold">已售 {{ g.sold }}</span>
          </div>
        </div>
        <div class="pv-section">
          <h4>最新评价</h4>
          <div v-for="r in admin.reviews.slice(0, 4)" :key="r.id" class="pv-review">
            <div class="pv-rhead"><b>{{ r.user }}</b><el-rate :model-value="r.stars" disabled size="small" /><StatusTag :status="r.status" /></div>
            <p>{{ r.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Monitor, ShoppingBag } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useAdminStore } from '@/stores/admin'
import DB from '@/data/db'
import { money } from '@/utils/format'

const admin = useAdminStore()
</script>

<style scoped>
.mall-hero { display: flex; align-items: center; gap: 30px; padding: 28px 34px; border-radius: 22px; background: linear-gradient(125deg, #2c4f36, #47754c 55%, #6c9667); color: #e8f2e5; margin-bottom: 16px; overflow: hidden; position: relative; }
.mall-hero::after { content: ""; position: absolute; right: -90px; bottom: -140px; width: 380px; height: 380px; border-radius: 50%; background: radial-gradient(circle, rgba(220,242,190,.16), transparent 65%); }
.mh-copy { flex: 1; position: relative; z-index: 1; }
.mh-kicker { font-size: 10px; letter-spacing: 2px; color: #b4d2b3; }
.mh-copy h1 { font-size: 30px; line-height: 1.3; color: #fff; margin: 9px 0 8px; letter-spacing: .5px; }
.mh-copy p { font-size: 12px; color: #c3dbc2; line-height: 1.85; max-width: 560px; }
.mh-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
.mh-actions :deep(.el-button--primary) { --el-button-bg-color: #d7e9bf; --el-button-border-color: #d7e9bf; --el-button-text-color: #2e5137; }
.mh-actions :deep(.el-button:not(.el-button--primary)) { --el-button-bg-color: rgba(255,255,255,.1); --el-button-border-color: rgba(255,255,255,.22); --el-button-text-color: #e8f2e5; }
.mh-chips { display: flex; gap: 6px; margin-top: 16px; flex-wrap: wrap; }
.mh-chips span { font-size: 10.5px; border: 1px solid rgba(255,255,255,.16); border-radius: 20px; padding: 3px 9px; color: #b8d3b7; }
.mh-phone { position: relative; z-index: 1; flex: 0 0 235px; }
.phone-frame { width: 235px; height: 430px; border-radius: 30px; background: #14261a; padding: 9px; box-shadow: 0 24px 50px rgba(10, 25, 15, .35); position: relative; }
.phone-notch { position: absolute; top: 14px; left: 50%; transform: translateX(-50%); width: 70px; height: 6px; border-radius: 4px; background: #0d1a12; z-index: 3; }
.phone-screen { height: 100%; border-radius: 23px; background: #f7f5ee; overflow: hidden; padding: 20px 11px 0; display: flex; flex-direction: column; }
.ps-head { display: flex; align-items: center; gap: 5px; font-size: 10px; }
.ps-logo { font-size: 14px; }
.ps-cart { margin-left: auto; font-size: 12px; }
.ps-search { margin-top: 9px; font-size: 8px; color: #b3beb5; background: #fff; border-radius: 20px; padding: 5px 9px; border: 1px solid #e4e8df; }
.ps-banner { margin-top: 9px; background: linear-gradient(120deg, #e7f0e3, #d3e6cc); border-radius: 11px; padding: 9px 10px; display: flex; align-items: center; }
.ps-banner b { display: block; font-size: 11px; color: #2e5137; }
.ps-banner span { font-size: 7px; color: #6f8a72; }
.ps-emoji { margin-left: auto; font-size: 26px; }
.ps-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; margin-top: 9px; }
.ps-item { background: #fff; border-radius: 8px; padding: 6px; display: flex; flex-direction: column; align-items: center; gap: 1px; border: 1px solid #edf0e8; }
.ps-item span { font-size: 20px; }
.ps-item b { font-size: 7.5px; color: #3d4b43; }
.ps-item em { font-style: normal; font-size: 8px; color: #b5473d; font-weight: 600; }
.ps-tabbar { margin-top: auto; display: flex; border-top: 1px solid #e4e8df; padding: 6px 2px; background: #fff; margin-left: -11px; margin-right: -11px; }
.ps-tabbar span { flex: 1; text-align: center; font-size: 7.5px; color: #8b998f; }
.ps-tabbar span.on { color: #3f6f4a; font-weight: 600; }
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.entry-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.entry-card { text-align: left; padding: 16px 17px; cursor: pointer; transition: transform .16s, box-shadow .16s; background: #fff; }
.entry-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
.ec-icon { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; font-size: 18px; margin-bottom: 10px; }
.entry-card b { display: block; font-size: 13.5px; }
.entry-card > span:not(.ec-icon) { display: block; font-size: 10.5px; color: var(--ink-400); line-height: 1.6; margin: 3px 0 9px; }
.entry-card em { font-style: normal; font-size: 10.5px; color: var(--brand-600); }
.preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 14px 20px 18px; }
.pv-section h4 { font-size: 12px; color: var(--ink-700); margin-bottom: 8px; }
.pv-goods { display: flex; align-items: center; gap: 9px; padding: 7px 0; border-bottom: 1px solid #f2f4ee; }
.pv-emoji { font-size: 22px; }
.pv-main { flex: 1; min-width: 0; }
.pv-main b { display: block; font-size: 11.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pv-main span { font-size: 10px; color: var(--ink-400); }
.pv-sold { font-size: 10px; color: var(--brand-600); }
.pv-review { padding: 7px 0; border-bottom: 1px solid #f2f4ee; }
.pv-rhead { display: flex; align-items: center; gap: 8px; }
.pv-rhead b { font-size: 11.5px; }
.pv-rhead > :last-child { margin-left: auto; }
.pv-review p { font-size: 10.5px; color: var(--ink-500); line-height: 1.6; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
@media (max-width: 1100px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } .mall-hero { flex-direction: column; align-items: flex-start; } .mh-phone { align-self: center; } .entry-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 700px) { .stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; } .mh-copy h1 { font-size: 23px; } .entry-grid { grid-template-columns: 1fr; } .preview-grid { grid-template-columns: 1fr; } }
</style>
