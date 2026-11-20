<template>
  <div class="cart-page">
    <div class="cart-head">
      <div>
        <span class="kicker">SHOPPING BAG</span>
        <h1>购物车</h1>
        <p>已选 <b>{{ cart.count }}</b> 件商品，满 ¥59 包邮，产地当日采摘后统一发出。</p>
      </div>
      <div class="head-steps">
        <span class="on"><i>1</i>购物车</span>
        <em></em>
        <span><i>2</i>确认订单</span>
        <em></em>
        <span><i>3</i>支付完成</span>
      </div>
    </div>

    <template v-if="cart.details.length">
      <div class="cart-toolbar card">
        <el-checkbox :model-value="cart.allSelected" @change="val => cart.toggleAll(val)">全选</el-checkbox>
        <span class="tb-count">共 {{ cart.details.length }} 种商品 · {{ cart.count }} 件</span>
        <div class="tb-actions">
          <button @click="removeSelected">删除已选</button>
          <button class="danger" @click="clearAll">清空购物车</button>
        </div>
      </div>

      <div class="cart-grid">
        <div class="cart-list">
          <article v-for="item in cart.details" :key="item.id" class="cart-row card" :class="{ unselected: !item.selected }">
            <el-checkbox :model-value="item.selected" @change="cart.toggle(item.id)" />
            <router-link :to="`/mall/product/${item.id}`" class="cr-media">
              <span>{{ item.icon }}</span>
            </router-link>
            <div class="cr-main">
              <router-link :to="`/mall/product/${item.id}`" class="cr-name">{{ item.name }}</router-link>
              <p class="cr-spec">{{ item.spec }} · {{ item.cat }}</p>
              <div class="cr-tags">
                <span>{{ item.tag }}</span>
                <span v-if="item.trace !== '—'">可溯源</span>
                <span>冷链直发</span>
              </div>
              <div class="cr-mobile-price">¥{{ item.price }} <small>/ 份</small></div>
            </div>
            <div class="cr-price">
              <b>¥{{ item.price }}</b>
              <small>/ 份</small>
            </div>
            <div class="cr-qty">
              <QtyStepper :model-value="item.qty" :max="Math.max(1, item.stock)" size="sm" @update:model-value="val => cart.setQty(item.id, val)" />
              <span class="stock">库存 {{ item.stock }}</span>
            </div>
            <div class="cr-sub">
              <b>¥{{ (item.price * item.qty).toFixed(2) }}</b>
              <button class="del" aria-label="删除" @click="removeOne(item)"><el-icon><Delete /></el-icon></button>
            </div>
          </article>

          <div class="cart-extra">
            <div class="ce-card">
              <span>🧺</span>
              <div><b>产地当日采摘</b><p>16:00 前下单当日发出，重庆市内次日达。</p></div>
            </div>
            <div class="ce-card">
              <span>💚</span>
              <div><b>坏果包赔</b><p>收货 24 小时内拍照反馈，按坏果数量退款。</p></div>
            </div>
          </div>
        </div>

        <aside class="cart-summary card">
          <div class="cs-head">
            <h3>订单汇总</h3>
            <span>{{ cart.selectedCount }} 件已选</span>
          </div>

          <div class="ship-progress">
            <div class="sp-text">
              <template v-if="cart.subtotal >= 59"><el-icon><CircleCheckFilled /></el-icon>已满足包邮条件</template>
              <template v-else>再买 <b>¥{{ (59 - cart.subtotal).toFixed(2) }}</b> 即可包邮</template>
            </div>
            <div class="sp-bar"><i :style="{ width: Math.min(100, (cart.subtotal / 59) * 100) + '%' }"></i></div>
          </div>

          <div class="cs-rows">
            <div><span>商品金额</span><b>¥{{ cart.subtotal.toFixed(2) }}</b></div>
            <div><span>运费</span><b :class="{ free: cart.shipping === 0 }">{{ cart.shipping === 0 ? '免运费' : '¥' + cart.shipping.toFixed(2) }}</b></div>
            <div v-if="cart.discount"><span>优惠券</span><b class="minus">-¥{{ cart.discount.toFixed(2) }}</b></div>
          </div>

          <div class="coupon-box">
            <div class="cb-head"><span>优惠券</span><small>满 ¥49 / ¥99 可用</small></div>
            <div v-if="cart.coupon" class="coupon-on">
              <div>
                <b>{{ cart.coupon.code }}</b>
                <span>{{ cart.coupon.label }}</span>
              </div>
              <button @click="cart.clearCoupon(); ElMessage.info('已取消优惠券')">取消</button>
            </div>
            <div v-else class="coupon-input">
              <el-input v-model="coupon" placeholder="输入优惠码" size="default" @keyup.enter="useCoupon" />
              <el-button @click="useCoupon">使用</el-button>
            </div>
            <div class="coupon-chips">
              <button v-for="c in coupons" :key="c.code" :class="{ disabled: cart.subtotal < c.min }" @click="quickCoupon(c)">
                <b>{{ c.code }}</b><span>{{ c.label }}</span>
              </button>
            </div>
          </div>

          <div class="cs-total">
            <span>应付合计</span>
            <div><small>¥</small><b>{{ cart.total.toFixed(2) }}</b></div>
          </div>

          <el-button type="primary" size="large" class="checkout-btn" :disabled="!cart.selectedCount" @click="checkout">
            去结算（{{ cart.selectedCount }}）
          </el-button>
          <router-link to="/mall/products" class="continue">继续选购 <el-icon><ArrowRight /></el-icon></router-link>

          <div class="cs-safe">
            <span><el-icon><Lock /></el-icon>安全支付</span>
            <span><el-icon><Van /></el-icon>冷链配送</span>
            <span><el-icon><CircleCheck /></el-icon>坏果包赔</span>
          </div>
        </aside>
      </div>

      <section class="recommend">
        <div class="section-head">
          <div><span class="kicker">YOU MAY ALSO LIKE</span><h2>顺便再带点</h2></div>
          <button class="more" @click="$router.push('/mall/products')">查看全部 <el-icon><ArrowRight /></el-icon></button>
        </div>
        <div class="rec-grid">
          <ProductCard
            v-for="g in recommend"
            :key="g.id"
            :goods="g"
            :favorite="mall.isFavorite(g.id)"
            @add="quickAdd"
            @fav="quickFav"
            @open="g2 => $router.push(`/mall/product/${g2.id}`)"
          />
        </div>
      </section>
    </template>

    <div v-else class="cart-empty card">
      <div class="ce-illustration">
        <span>🧺</span>
        <i class="leaf l1">🌿</i>
        <i class="leaf l2">🍅</i>
      </div>
      <h2>购物车还是空的</h2>
      <p>去挑几样当日现摘的蔬菜水果吧，满 ¥59 包邮，重庆市内次日达。</p>
      <el-button type="primary" size="large" @click="$router.push('/mall/products')">去逛逛农产品</el-button>
      <div class="empty-links">
        <router-link to="/mall/trace">查询产品溯源</router-link>
        <span>·</span>
        <router-link to="/mall/orders">查看我的订单</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, ArrowRight, Lock, Van, CircleCheck, CircleCheckFilled } from '@element-plus/icons-vue'
import ProductCard from '@/components/ProductCard.vue'
import QtyStepper from '@/components/QtyStepper.vue'
import { useCartStore } from '@/stores/cart'
import { useMallStore } from '@/stores/mall'
import DB from '@/data/db'

const router = useRouter()
const cart = useCartStore()
const mall = useMallStore()

const coupon = ref('')
const coupons = [
  { code: 'FRESH5', label: '新人立减 5 元', min: 49 },
  { code: 'FARM10', label: '满 99 减 10', min: 99 }
]

const recommend = computed(() => {
  const ids = cart.items.map(i => i.id)
  return DB.goods.filter(g => !ids.includes(g.id)).slice(0, 4)
})

function useCoupon() {
  if (!coupon.value.trim()) return ElMessage.warning('请输入优惠码')
  const res = cart.applyCoupon(coupon.value)
  ElMessage[res.ok ? 'success' : 'warning'](res.message)
  if (res.ok) coupon.value = ''
}
function quickCoupon(c) {
  if (cart.subtotal < c.min) return ElMessage.warning(`订单满 ¥${c.min} 才可使用该优惠券`)
  coupon.value = c.code
  useCoupon()
}
function removeOne(item) {
  cart.remove(item.id)
  ElMessage.success('已从购物车移除')
}
async function removeSelected() {
  if (!cart.selectedCount) return ElMessage.warning('请先选择要删除的商品')
  try {
    await ElMessageBox.confirm(`确定删除已选的 ${cart.selectedCount} 件商品吗？`, '删除商品', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '再想想' })
    cart.removeSelected()
    ElMessage.success('已删除所选商品')
  } catch {}
}
async function clearAll() {
  try {
    await ElMessageBox.confirm('确定清空购物车吗？此操作不可恢复。', '清空购物车', { type: 'warning', confirmButtonText: '清空', cancelButtonText: '取消' })
    cart.clear()
    ElMessage.success('购物车已清空')
  } catch {}
}
function checkout() {
  if (!cart.selectedCount) return ElMessage.warning('请选择要结算的商品')
  router.push('/mall/checkout')
}
function quickAdd(g) {
  const res = cart.add(g.id, 1)
  ElMessage[res.ok ? 'success' : 'warning'](res.ok ? `${g.name} 已加入购物车` : res.message)
}
function quickFav(g) { ElMessage.success(mall.toggleFavorite(g.id) ? '已收藏' : '已取消收藏') }
</script>

<style scoped>
.cart-page { max-width: 1200px; margin: 0 auto; padding: 28px 24px 16px; }
.cart-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
.kicker { font-size: 9.5px; letter-spacing: 2px; color: var(--brand-500); }
.cart-head h1 { font-size: 30px; margin: 4px 0 4px; }
.cart-head p { font-size: 12px; color: var(--ink-400); }
.cart-head p b { color: var(--brand-700); }
.head-steps { display: flex; align-items: center; gap: 8px; font-size: 10.5px; color: var(--ink-300); }
.head-steps span { display: inline-flex; align-items: center; gap: 5px; }
.head-steps i { width: 20px; height: 20px; border-radius: 50%; background: #fff; border: 1px solid var(--line-strong); display: grid; place-items: center; font-style: normal; font-size: 10px; }
.head-steps span.on { color: var(--brand-700); }
.head-steps span.on i { background: var(--brand-600); border-color: var(--brand-600); color: #fff; }
.head-steps em { width: 26px; height: 1px; background: var(--line-strong); }
.cart-toolbar { display: flex; align-items: center; gap: 14px; padding: 11px 16px; margin-bottom: 14px; }
.cart-toolbar :deep(.el-checkbox__label) { font-size: 12.5px; }
.tb-count { font-size: 11px; color: var(--ink-400); }
.tb-actions { margin-left: auto; display: flex; gap: 13px; }
.tb-actions button { border: none; background: transparent; font-size: 11px; color: var(--ink-400); cursor: pointer; }
.tb-actions button:hover { color: var(--brand-600); }
.tb-actions button.danger:hover { color: var(--danger); }
.cart-grid { display: grid; grid-template-columns: 1fr 316px; gap: 18px; align-items: start; }
.cart-list { display: flex; flex-direction: column; gap: 10px; }
.cart-row { display: grid; grid-template-columns: 22px 86px 1fr 86px 126px 90px; align-items: center; gap: 13px; padding: 14px 16px; transition: opacity .2s; }
.cart-row.unselected { opacity: .58; }
.cr-media { width: 86px; height: 86px; border-radius: 13px; background: linear-gradient(135deg, #f0f8ef, #dcecdc); display: grid; place-items: center; }
.cr-media span { font-size: 42px; filter: drop-shadow(0 5px 7px rgba(40, 80, 45, .15)); }
.cr-main { min-width: 0; }
.cr-name { display: block; font-size: 13.5px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cr-name:hover { color: var(--brand-600); }
.cr-spec { font-size: 10.5px; color: var(--ink-400); margin-top: 3px; }
.cr-tags { display: flex; gap: 4px; margin-top: 7px; flex-wrap: wrap; }
.cr-tags span { font-size: 9px; color: var(--brand-600); background: var(--brand-50); border: 1px solid var(--brand-100); border-radius: 20px; padding: 1px 6px; }
.cr-mobile-price { display: none; }
.cr-price { text-align: right; }
.cr-price b { display: block; font-size: 15px; color: var(--ink-900); }
.cr-price small { font-size: 9.5px; color: var(--ink-300); }
.cr-qty { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.cr-qty .stock { font-size: 9px; color: var(--ink-300); }
.cr-sub { text-align: right; }
.cr-sub b { display: block; font-size: 15px; color: #b5473d; }
.del { border: none; background: transparent; color: var(--ink-300); cursor: pointer; font-size: 13px; padding: 2px; margin-top: 4px; }
.del:hover { color: var(--danger); }
.cart-extra { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 4px; }
.ce-card { display: flex; gap: 9px; padding: 12px 14px; background: #fff; border: 1px solid var(--line); border-radius: 12px; }
.ce-card span { font-size: 19px; }
.ce-card b { display: block; font-size: 11px; }
.ce-card p { font-size: 10px; color: var(--ink-400); line-height: 1.5; margin-top: 1px; }
.cart-summary { padding: 18px; position: sticky; top: 88px; }
.cs-head { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--line); }
.cs-head h3 { font-size: 15px; }
.cs-head span { font-size: 10.5px; color: var(--ink-400); }
.ship-progress { margin: 14px 0 12px; }
.sp-text { font-size: 10.5px; color: var(--ink-500); display: flex; align-items: center; gap: 4px; }
.sp-text b { color: #b5473d; }
.sp-text .el-icon { color: #4f9a5b; }
.sp-bar { height: 5px; border-radius: 3px; background: #eef1e8; overflow: hidden; margin-top: 7px; }
.sp-bar i { display: block; height: 100%; background: linear-gradient(90deg, #7ca66e, #4f7f56); border-radius: 3px; transition: width .3s; }
.cs-rows { padding: 4px 0 12px; border-bottom: 1px solid var(--line); }
.cs-rows div { display: flex; justify-content: space-between; font-size: 11.5px; padding: 4px 0; }
.cs-rows span { color: var(--ink-400); }
.cs-rows b { font-weight: 500; }
.cs-rows b.free { color: var(--success); }
.cs-rows b.minus { color: #b5473d; }
.coupon-box { padding: 12px 0; border-bottom: 1px solid var(--line); }
.cb-head { display: flex; justify-content: space-between; align-items: center; font-size: 11.5px; margin-bottom: 8px; }
.cb-head small { font-size: 9px; color: var(--ink-300); }
.coupon-input { display: flex; gap: 6px; }
.coupon-input :deep(.el-button) { border-radius: 9px; }
.coupon-on { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 10px; background: #fdf6e8; border: 1px dashed #e6c78f; border-radius: 9px; }
.coupon-on b { font-size: 11.5px; color: #9a6a17; letter-spacing: .5px; }
.coupon-on span { display: block; font-size: 9.5px; color: #b28a44; }
.coupon-on button { border: none; background: transparent; font-size: 10px; color: var(--ink-400); cursor: pointer; }
.coupon-chips { display: flex; gap: 5px; margin-top: 7px; flex-wrap: wrap; }
.coupon-chips button { border: 1px dashed #e6c78f; background: #fffdf7; border-radius: 7px; padding: 3px 7px; cursor: pointer; text-align: left; }
.coupon-chips button b { display: block; font-size: 9.5px; color: #9a6a17; }
.coupon-chips button span { font-size: 8.5px; color: #b28a44; }
.coupon-chips button.disabled { opacity: .42; cursor: not-allowed; }
.cs-total { display: flex; align-items: flex-end; justify-content: space-between; padding: 14px 0 12px; }
.cs-total > span { font-size: 12px; color: var(--ink-500); }
.cs-total small { font-size: 13px; color: #b5473d; }
.cs-total b { font-size: 27px; color: #b5473d; letter-spacing: -.8px; }
.checkout-btn { width: 100%; height: 44px; border-radius: 22px; font-size: 14px; }
.continue { display: flex; align-items: center; justify-content: center; gap: 3px; font-size: 11px; color: var(--ink-400); margin-top: 10px; }
.continue:hover { color: var(--brand-600); }
.cs-safe { display: flex; justify-content: space-between; gap: 4px; margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--line); }
.cs-safe span { display: inline-flex; align-items: center; gap: 3px; font-size: 9px; color: var(--ink-400); }
.recommend { margin-top: 42px; }
.section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.section-head h2 { font-size: 23px; margin-top: 4px; }
.more { border: none; background: transparent; font-size: 12px; color: var(--ink-500); cursor: pointer; display: inline-flex; align-items: center; gap: 3px; }
.more:hover { color: var(--brand-600); }
.rec-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.cart-empty { max-width: 680px; margin: 40px auto; padding: 50px 24px; text-align: center; }
.ce-illustration { position: relative; width: 150px; height: 128px; margin: 0 auto 8px; display: grid; place-items: center; background: linear-gradient(140deg, #eef6e9, #d8e9d2); border-radius: 50% 50% 46% 54%; }
.ce-illustration > span { font-size: 62px; filter: drop-shadow(0 10px 14px rgba(50, 90, 50, .15)); }
.ce-illustration .leaf { position: absolute; font-style: normal; font-size: 24px; }
.ce-illustration .l1 { left: -8px; top: 16px; transform: rotate(-16deg); }
.ce-illustration .l2 { right: -4px; bottom: 8px; transform: rotate(12deg); }
.cart-empty h2 { font-size: 23px; margin: 12px 0 6px; }
.cart-empty > p { font-size: 12.5px; color: var(--ink-400); line-height: 1.8; max-width: 380px; margin: 0 auto 20px; }
.empty-links { display: flex; justify-content: center; gap: 8px; margin-top: 16px; font-size: 11.5px; color: var(--ink-400); }
.empty-links a:hover { color: var(--brand-600); }
@media (max-width: 980px) {
  .cart-grid { grid-template-columns: 1fr 286px; }
  .cart-row { grid-template-columns: 22px 74px 1fr 72px 110px; }
  .cr-sub { grid-column: 2 / -1; display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-top: -4px; }
  .cr-sub b { font-size: 13px; }
  .cr-media { width: 74px; height: 74px; }
  .cr-media span { font-size: 36px; }
  .rec-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 780px) {
  .cart-grid { grid-template-columns: 1fr; }
  .cart-summary { position: static; }
  .cart-row { grid-template-columns: 22px 68px 1fr; gap: 10px; align-items: start; }
  .cr-media { width: 68px; height: 68px; }
  .cr-media span { font-size: 33px; }
  .cr-price, .cr-qty { display: none; }
  .cr-mobile-price { display: block; font-size: 15px; color: #b5473d; font-weight: 600; margin-top: 6px; }
  .cr-mobile-price small { font-size: 9px; color: var(--ink-300); font-weight: 400; }
  .cr-sub { grid-column: 2 / -1; display: flex; justify-content: space-between; align-items: center; margin-top: 0; }
  .cr-sub::before { content: "小计"; font-size: 10px; color: var(--ink-400); }
  .cr-sub b { font-size: 14px; }
  .del { margin-top: 0; }
  .head-steps { display: none; }
  .cart-page { padding: 20px 16px 12px; }
  .rec-grid { grid-template-columns: repeat(2, 1fr); gap: 9px; }
}
@media (max-width: 520px) {
  .cart-head h1 { font-size: 25px; }
  .cart-toolbar { padding: 9px 12px; gap: 8px; }
  .tb-count { display: none; }
  .cart-extra { grid-template-columns: 1fr; }
  .cart-summary { padding: 15px; }
  .ce-card p { display: none; }
}
</style>
