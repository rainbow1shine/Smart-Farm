<template>
  <div class="checkout-page">
    <div class="checkout-head">
      <div>
        <span class="kicker">CHECKOUT</span>
        <h1>确认订单</h1>
        <p>请核对收货信息，支付成功后农户将在 16:00 前完成采摘打包。</p>
      </div>
      <div class="head-steps">
        <span class="done"><i>✓</i>购物车</span>
        <em></em>
        <span class="on"><i>2</i>确认订单</span>
        <em></em>
        <span :class="{ done: !!placedOrder }"><i>{{ placedOrder ? '✓' : '3' }}</i>支付完成</span>
      </div>
    </div>

    <div v-if="placedOrder" class="success-card card">
      <div class="success-ico"><el-icon><CircleCheckFilled /></el-icon></div>
      <h2>订单提交成功</h2>
      <p class="success-sub">农户已收到你的订单，正在安排当日采摘。我们会在发货后第一时间通知你。</p>
      <div class="success-order">
        <div><span>订单编号</span><b>{{ placedOrder.no }}</b></div>
        <div><span>支付金额</span><b class="amount">¥{{ placedOrder.amount.toFixed(2) }}</b></div>
        <div><span>支付方式</span><b>{{ placedOrder.pay }}</b></div>
        <div><span>配送方式</span><b>{{ placedOrder.delivery }}</b></div>
        <div class="wide"><span>收货地址</span><b>{{ placedOrder.receiver }} {{ placedOrder.phone }} · {{ placedOrder.addr }}</b></div>
      </div>
      <div class="success-actions">
        <el-button type="primary" size="large" @click="$router.push(`/mall/orders/${placedOrder.no}`)">查看订单详情</el-button>
        <el-button size="large" @click="$router.push('/mall/products')">继续逛逛</el-button>
      </div>
      <div class="success-tip">
        <span>🔔</span>
        <p>订单状态变更会通过站内消息通知你，也可以在「我的订单」中查看物流进度。</p>
      </div>
    </div>

    <template v-else-if="orderItems.length">
      <div class="checkout-grid">
        <div class="co-main">
          <section class="co-card card">
            <div class="co-head">
              <div><h3>收货信息</h3><span>选择一个收货地址</span></div>
              <el-button text type="primary" :icon="Plus" @click="openAddress()">新增地址</el-button>
            </div>
            <div class="address-grid">
              <button
                v-for="a in mall.addresses"
                :key="a.id"
                class="address-card"
                :class="{ on: selectedAddressId === a.id }"
                @click="selectedAddressId = a.id"
              >
                <div class="ac-top">
                  <span class="ac-tag">{{ a.tag || '地址' }}</span>
                  <span class="ac-name">{{ a.name }}</span>
                  <span class="ac-phone">{{ a.phone }}</span>
                  <span v-if="a.def" class="ac-default">默认</span>
                  <span class="ac-check"><el-icon><Check /></el-icon></span>
                </div>
                <p>{{ a.region }} {{ a.detail }}</p>
                <div class="ac-actions" @click.stop>
                  <button @click="openAddress(a)"><el-icon><Edit /></el-icon>编辑</button>
                  <button @click="removeAddress(a)"><el-icon><Delete /></el-icon>删除</button>
                </div>
              </button>
              <button class="address-card add" @click="openAddress()">
                <el-icon><Plus /></el-icon>
                <span>新增收货地址</span>
              </button>
            </div>
          </section>

          <section class="co-card card">
            <div class="co-head">
              <div><h3>配送方式</h3><span>冷链配送，全程温控</span></div>
            </div>
            <div class="option-list">
              <button v-for="d in deliveries" :key="d.key" class="option-card" :class="{ on: delivery === d.key }" @click="delivery = d.key">
                <span class="oc-ico">{{ d.icon }}</span>
                <div><b>{{ d.name }}</b><small>{{ d.desc }}</small></div>
                <span class="oc-fee">{{ shippingFeeFor(d) === 0 ? '免运费' : '¥' + shippingFeeFor(d).toFixed(2) }}</span>
                <span class="oc-radio"><i></i></span>
              </button>
            </div>
          </section>

          <section class="co-card card">
            <div class="co-head">
              <div><h3>商品清单</h3><span>{{ orderItems.length }} 种商品 · {{ cart.selectedCount }} 件</span></div>
              <el-button text @click="$router.push('/mall/cart')">返回修改</el-button>
            </div>
            <div class="co-items">
              <div v-for="item in orderItems" :key="item.id" class="co-item">
                <span class="ci-media">{{ item.icon }}</span>
                <div class="ci-main">
                  <b>{{ item.name }}</b>
                  <small>{{ item.spec }}</small>
                  <div class="ci-tags"><span>{{ item.tag }}</span><span v-if="item.trace !== '—'">可溯源</span></div>
                </div>
                <div class="ci-price">¥{{ item.price }} <small>/ 份</small></div>
                <div class="ci-qty">× {{ item.qty }}</div>
                <div class="ci-sub">¥{{ (item.price * item.qty).toFixed(2) }}</div>
              </div>
            </div>
          </section>

          <section class="co-card card">
            <div class="co-head">
              <div><h3>支付方式</h3><span>演示环境不会产生真实扣款</span></div>
            </div>
            <div class="pay-list">
              <button v-for="p in payments" :key="p.key" class="pay-card" :class="{ on: pay === p.key }" @click="pay = p.key">
                <span class="pay-ico" :style="{ background: p.bg, color: p.color }">{{ p.icon }}</span>
                <div><b>{{ p.name }}</b><small>{{ p.desc }}</small></div>
                <span class="oc-radio"><i></i></span>
              </button>
            </div>
          </section>

          <section class="co-card card">
            <div class="co-head">
              <div><h3>备注与发票</h3><span>选填</span></div>
            </div>
            <el-input v-model="remark" type="textarea" :rows="3" maxlength="120" show-word-limit placeholder="如：请放门口、工作日 18 点后送达、需要开票等" />
            <div class="invoice-row">
              <el-checkbox v-model="needInvoice">需要开具发票</el-checkbox>
              <el-input v-if="needInvoice" v-model="invoiceTitle" placeholder="请输入发票抬头" size="default" class="invoice-input" />
            </div>
          </section>
        </div>

        <aside class="co-side">
          <div class="co-summary card">
            <div class="cs-head"><h3>订单金额</h3><span>{{ cart.selectedCount }} 件</span></div>
            <div class="cs-items">
              <div v-for="item in orderItems" :key="item.id">
                <span>{{ item.name }} × {{ item.qty }}</span>
                <b>¥{{ (item.price * item.qty).toFixed(2) }}</b>
              </div>
            </div>
            <div class="cs-rows">
              <div><span>商品金额</span><b>¥{{ cart.subtotal.toFixed(2) }}</b></div>
              <div><span>运费</span><b :class="{ free: shippingFee === 0 }">{{ shippingFee === 0 ? '免运费' : '¥' + shippingFee.toFixed(2) }}</b></div>
              <div v-if="cart.discount"><span>优惠券</span><b class="minus">-¥{{ cart.discount.toFixed(2) }}</b></div>
            </div>
            <div class="cs-total">
              <span>应付合计</span>
              <div><small>¥</small><b>{{ payable.toFixed(2) }}</b></div>
            </div>
            <el-checkbox v-model="agree" class="agree">我已阅读并同意《商城购买协议》</el-checkbox>
            <el-button type="primary" size="large" class="submit-btn" :loading="submitting" :disabled="!agree" @click="submit">
              提交订单 · ¥{{ payable.toFixed(2) }}
            </el-button>
            <div class="cs-note">
              <el-icon><Lock /></el-icon>
              <span>支付信息经加密传输，平台不会保存你的支付密码。</span>
            </div>
          </div>

          <div class="side-help">
            <div><span>❄️</span><b>冷链锁鲜</b><small>采摘 2 小时内预冷</small></div>
            <div><span>🛡️</span><b>农残检测</b><small>不合格不上架</small></div>
            <div><span>💚</span><b>坏果包赔</b><small>24 小时内反馈</small></div>
          </div>
        </aside>
      </div>
    </template>

    <div v-else class="card empty-box">
      <div class="icon">🧺</div>
      <div>购物车里没有已选商品</div>
      <p class="muted tiny">请先勾选要购买的商品，再进入结算。</p>
      <el-button type="primary" plain class="mt-12" @click="$router.push('/mall/cart')">返回购物车</el-button>
    </div>

    <el-dialog v-model="addrOpen" :title="editing ? '编辑收货地址' : '新增收货地址'" width="480px" destroy-on-close>
      <el-form ref="addrFormRef" :model="addrForm" :rules="addrRules" label-position="top">
        <div class="form-row">
          <el-form-item label="收货人" prop="name"><el-input v-model="addrForm.name" placeholder="请输入姓名" /></el-form-item>
          <el-form-item label="手机号" prop="phone"><el-input v-model="addrForm.phone" placeholder="请输入手机号" /></el-form-item>
        </div>
        <el-form-item label="所在地区" prop="region"><el-input v-model="addrForm.region" placeholder="如：重庆市 渝北区" /></el-form-item>
        <el-form-item label="详细地址" prop="detail"><el-input v-model="addrForm.detail" placeholder="街道、门牌号、小区楼栋等" /></el-form-item>
        <div class="form-row">
          <el-form-item label="标签">
            <el-select v-model="addrForm.tag" style="width: 100%">
              <el-option label="家" value="家" />
              <el-option label="公司" value="公司" />
              <el-option label="学校" value="学校" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
          <el-form-item label="默认地址">
            <el-switch v-model="addrForm.def" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="addrOpen = false">取消</el-button>
        <el-button type="primary" @click="saveAddress">保存地址</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Check, Edit, Delete, Lock, CircleCheckFilled } from '@element-plus/icons-vue'
import { useCartStore } from '@/stores/cart'
import { useMallStore } from '@/stores/mall'

const router = useRouter()
const cart = useCartStore()
const mall = useMallStore()

const orderItems = computed(() => cart.selectedDetails)
const selectedAddressId = ref(mall.defaultAddress?.id || '')
const delivery = ref('cold')
const shippingFeeFor = (d) => (d?.key === 'pickup' ? 0 : cart.shipping)
const shippingFee = computed(() => (delivery.value === 'pickup' ? 0 : cart.shipping))
const payable = computed(() => Math.max(0, cart.subtotal + shippingFee.value - cart.discount))
const pay = ref('wechat')
const remark = ref('')
const needInvoice = ref(false)
const invoiceTitle = ref('')
const agree = ref(true)
const submitting = ref(false)
const placedOrder = ref(null)

const addrOpen = ref(false)
const editing = ref('')
const addrFormRef = ref(null)
const addrForm = reactive({ name: '', phone: '', region: '重庆市 ', detail: '', tag: '家', def: false })
const addrRules = {
  name: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }, { pattern: /^1[3-9]\d{9}$|^\d{3}\*{4}\d{4}$/, message: '请输入正确的手机号', trigger: 'blur' }],
  region: [{ required: true, message: '请选择所在地区', trigger: 'blur' }],
  detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

const deliveries = [
  { key: 'cold', icon: '❄️', name: '产地冷链直发', desc: '采摘后 2h 预冷，顺丰冷链，重庆市内次日达' },
  { key: 'city', icon: '🚚', name: '同城优先达', desc: '重庆主城区，次日 10:00 前送达' },
  { key: 'pickup', icon: '🏡', name: '基地自提', desc: '永川智慧农业示范园自提点 · 9:00–18:00' }
]
const payments = [
  { key: 'wechat', icon: '微', name: '微信支付', desc: '推荐使用，支付更快捷', bg: '#e8f7ec', color: '#2f9e44' },
  { key: 'alipay', icon: '支', name: '支付宝', desc: '支持花呗分期', bg: '#e8f1fb', color: '#1677ff' },
  { key: 'balance', icon: '余', name: '账户余额', desc: '可用余额 ¥286.00（演示）', bg: '#fdf3e3', color: '#c28632' }
]

function openAddress(addr) {
  editing.value = addr?.id || ''
  Object.assign(addrForm, addr
    ? { name: addr.name, phone: addr.phone, region: addr.region, detail: addr.detail, tag: addr.tag || '家', def: !!addr.def }
    : { name: '', phone: '', region: '重庆市 ', detail: '', tag: '家', def: false })
  addrOpen.value = true
}
async function saveAddress() {
  await addrFormRef.value?.validate()
  if (editing.value) {
    mall.updateAddress(editing.value, { ...addrForm })
    selectedAddressId.value = editing.value
    ElMessage.success('地址已更新')
  } else {
    const created = mall.addAddress({ ...addrForm })
    selectedAddressId.value = created.id
    ElMessage.success('地址已添加')
  }
  addrOpen.value = false
}
async function removeAddress(addr) {
  try {
    await ElMessageBox.confirm(`确定删除「${addr.name} ${addr.region}」这个地址吗？`, '删除地址', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' })
    mall.removeAddress(addr.id)
    if (selectedAddressId.value === addr.id) selectedAddressId.value = mall.defaultAddress?.id || ''
    ElMessage.success('地址已删除')
  } catch {}
}

async function submit() {
  const addr = mall.addresses.find(a => a.id === selectedAddressId.value)
  if (!addr) return ElMessage.warning('请选择收货地址')
  if (!agree.value) return ElMessage.warning('请先同意购买协议')
  const payItem = payments.find(p => p.key === pay.value)
  const items = orderItems.value.map(i => ({ id: i.id, qty: i.qty }))
  const deliveryName = deliveries.find(d => d.key === delivery.value)?.name || '产地冷链直发'
  submitting.value = true
  await new Promise(resolve => setTimeout(resolve, 650))
  const order = mall.createOrder({
    items,
    receiver: addr.name,
    phone: addr.phone,
    region: addr.region,
    address: addr.detail,
    pay: payItem?.name || '微信支付',
    delivery: deliveryName,
    remark: [remark.value, needInvoice.value ? `发票抬头：${invoiceTitle.value || '未填写'}` : ''].filter(Boolean).join('；'),
    discount: cart.discount,
    shipping: shippingFee.value
  })
  cart.clear()
  placedOrder.value = order
  submitting.value = false
  ElMessage.success('订单提交成功')
}
</script>

<style scoped>
.checkout-page { max-width: 1180px; margin: 0 auto; padding: 28px 24px 16px; }
.checkout-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
.kicker { font-size: 9.5px; letter-spacing: 2px; color: var(--brand-500); }
.checkout-head h1 { font-size: 30px; margin: 4px 0 4px; }
.checkout-head p { font-size: 12px; color: var(--ink-400); }
.head-steps { display: flex; align-items: center; gap: 8px; font-size: 10.5px; color: var(--ink-300); }
.head-steps span { display: inline-flex; align-items: center; gap: 5px; }
.head-steps i { width: 20px; height: 20px; border-radius: 50%; background: #fff; border: 1px solid var(--line-strong); display: grid; place-items: center; font-style: normal; font-size: 10px; }
.head-steps span.on { color: var(--brand-700); }
.head-steps span.on i, .head-steps span.done i { background: var(--brand-600); border-color: var(--brand-600); color: #fff; }
.head-steps span.done { color: var(--brand-600); }
.head-steps em { width: 26px; height: 1px; background: var(--line-strong); }
.checkout-grid { display: grid; grid-template-columns: 1fr 322px; gap: 18px; align-items: start; }
.co-main { display: flex; flex-direction: column; gap: 14px; }
.co-card { padding: 18px 20px; }
.co-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.co-head h3 { font-size: 15px; }
.co-head span { display: block; font-size: 10.5px; color: var(--ink-400); margin-top: 1px; }
.address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.address-card { position: relative; text-align: left; border: 1px solid var(--line); background: #fff; border-radius: 12px; padding: 13px 14px; cursor: pointer; transition: all .18s; }
.address-card:hover { border-color: var(--brand-300); }
.address-card.on { border-color: var(--brand-500); background: #fbfdf8; box-shadow: 0 0 0 2px rgba(86, 133, 93, .1); }
.ac-top { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.ac-tag { font-size: 9px; background: var(--brand-50); color: var(--brand-700); border-radius: 4px; padding: 1px 5px; }
.ac-name { font-size: 12.5px; font-weight: 600; }
.ac-phone { font-size: 10.5px; color: var(--ink-400); }
.ac-default { font-size: 9px; color: #a86c18; background: #fdf3e3; border-radius: 4px; padding: 1px 5px; }
.ac-check { margin-left: auto; width: 18px; height: 18px; border-radius: 50%; border: 1px solid var(--line-strong); display: grid; place-items: center; font-size: 11px; color: transparent; }
.address-card.on .ac-check { background: var(--brand-600); border-color: var(--brand-600); color: #fff; }
.address-card > p { font-size: 11px; color: var(--ink-500); line-height: 1.6; margin-top: 6px; min-height: 35px; }
.ac-actions { display: flex; gap: 10px; margin-top: 6px; padding-top: 7px; border-top: 1px dashed var(--line); }
.ac-actions button { display: inline-flex; align-items: center; gap: 3px; border: none; background: transparent; font-size: 9.5px; color: var(--ink-400); cursor: pointer; padding: 0; }
.ac-actions button:hover { color: var(--brand-600); }
.address-card.add { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; border-style: dashed; color: var(--ink-400); font-size: 11px; min-height: 118px; }
.address-card.add:hover { color: var(--brand-600); border-color: var(--brand-300); }
.address-card.add .el-icon { font-size: 19px; }
.option-list { display: flex; flex-direction: column; gap: 8px; }
.option-card, .pay-card { display: flex; align-items: center; gap: 10px; border: 1px solid var(--line); background: #fff; border-radius: 11px; padding: 11px 13px; cursor: pointer; text-align: left; transition: all .16s; }
.option-card:hover, .pay-card:hover { border-color: var(--brand-300); }
.option-card.on, .pay-card.on { border-color: var(--brand-500); background: #fbfdf8; }
.oc-ico { width: 32px; height: 32px; border-radius: 9px; background: var(--brand-50); display: grid; place-items: center; font-size: 16px; flex: 0 0 32px; }
.option-card > div, .pay-card > div { flex: 1; min-width: 0; }
.option-card b, .pay-card b { display: block; font-size: 12px; }
.option-card small, .pay-card small { font-size: 10px; color: var(--ink-400); }
.oc-fee { font-size: 10.5px; color: var(--success); }
.oc-radio { width: 16px; height: 16px; border-radius: 50%; border: 1px solid var(--line-strong); display: grid; place-items: center; flex: 0 0 16px; }
.oc-radio i { width: 8px; height: 8px; border-radius: 50%; background: transparent; }
.on > .oc-radio { border-color: var(--brand-600); }
.on > .oc-radio i { background: var(--brand-600); }
.pay-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; }
.pay-card { padding: 12px; }
.pay-ico { width: 32px; height: 32px; border-radius: 9px; display: grid; place-items: center; font-size: 14px; font-weight: 600; flex: 0 0 32px; }
.co-items { display: flex; flex-direction: column; }
.co-item { display: flex; align-items: center; gap: 12px; padding: 11px 0; border-bottom: 1px dashed #eef1e8; }
.co-item:last-child { border-bottom: none; }
.ci-media { width: 58px; height: 58px; border-radius: 10px; background: linear-gradient(135deg, #f0f8ef, #dcecdc); display: grid; place-items: center; font-size: 29px; flex: 0 0 58px; }
.ci-main { flex: 1; min-width: 0; }
.ci-main b { display: block; font-size: 12.5px; }
.ci-main small { font-size: 10px; color: var(--ink-400); }
.ci-tags { display: flex; gap: 4px; margin-top: 4px; }
.ci-tags span { font-size: 8.5px; color: var(--brand-600); background: var(--brand-50); border-radius: 20px; padding: 1px 5px; }
.ci-price { font-size: 11.5px; text-align: right; }
.ci-price small { font-size: 9px; color: var(--ink-300); }
.ci-qty { width: 42px; text-align: center; font-size: 11px; color: var(--ink-400); }
.ci-sub { width: 74px; text-align: right; font-size: 13px; color: #b5473d; font-weight: 600; }
.invoice-row { display: flex; align-items: center; gap: 12px; margin-top: 10px; }
.invoice-row :deep(.el-checkbox__label) { font-size: 12px; }
.invoice-input { max-width: 260px; }
.co-side { display: flex; flex-direction: column; gap: 12px; }
.co-summary { padding: 18px; position: sticky; top: 88px; }
.cs-head { display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid var(--line); }
.cs-head h3 { font-size: 15px; }
.cs-head span { font-size: 10.5px; color: var(--ink-400); }
.cs-items { padding: 9px 0; border-bottom: 1px dashed var(--line); max-height: 154px; overflow: auto; }
.cs-items div { display: flex; justify-content: space-between; gap: 10px; font-size: 10.5px; color: var(--ink-500); padding: 3px 0; }
.cs-items span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cs-items b { font-weight: 500; flex: 0 0 auto; }
.cs-rows { padding: 8px 0 12px; }
.cs-rows div { display: flex; justify-content: space-between; font-size: 11.5px; padding: 3px 0; }
.cs-rows span { color: var(--ink-400); }
.cs-rows b { font-weight: 500; }
.cs-rows b.free { color: var(--success); }
.cs-rows b.minus { color: #b5473d; }
.cs-total { display: flex; align-items: flex-end; justify-content: space-between; padding: 12px 0; border-top: 1px solid var(--line); }
.cs-total > span { font-size: 12px; color: var(--ink-500); }
.cs-total small { font-size: 13px; color: #b5473d; }
.cs-total b { font-size: 27px; color: #b5473d; letter-spacing: -.8px; }
.agree { margin: 2px 0 10px; }
.agree :deep(.el-checkbox__label) { font-size: 10px; color: var(--ink-400); }
.submit-btn { width: 100%; height: 44px; border-radius: 22px; font-size: 13.5px; }
.cs-note { display: flex; align-items: flex-start; gap: 5px; margin-top: 10px; font-size: 9px; color: var(--ink-300); line-height: 1.5; }
.side-help { display: flex; justify-content: space-between; gap: 6px; padding: 13px 14px; background: #fff; border: 1px solid var(--line); border-radius: 12px; }
.side-help div { text-align: center; }
.side-help span { font-size: 17px; }
.side-help b { display: block; font-size: 9.5px; }
.side-help small { font-size: 8.5px; color: var(--ink-400); }
.success-card { max-width: 700px; margin: 20px auto; padding: 38px 40px 30px; text-align: center; }
.success-ico { width: 66px; height: 66px; margin: 0 auto 14px; border-radius: 50%; background: #eef8ea; color: #4f9a5b; display: grid; place-items: center; font-size: 34px; }
.success-card h2 { font-size: 24px; }
.success-sub { font-size: 12px; color: var(--ink-400); line-height: 1.8; max-width: 440px; margin: 6px auto 22px; }
.success-order { text-align: left; background: #fafbf6; border: 1px solid var(--line); border-radius: 13px; padding: 16px 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; }
.success-order div { display: flex; justify-content: space-between; gap: 12px; font-size: 11px; }
.success-order .wide { grid-column: 1 / -1; }
.success-order span { color: var(--ink-400); flex: 0 0 auto; }
.success-order b { font-weight: 500; text-align: right; }
.success-order b.amount { color: #b5473d; font-size: 13px; }
.success-actions { display: flex; justify-content: center; gap: 10px; margin: 22px 0 16px; flex-wrap: wrap; }
.success-tip { display: flex; align-items: flex-start; gap: 8px; text-align: left; padding: 11px 14px; background: #f2f7fb; border: 1px solid #dbe9f3; border-radius: 10px; }
.success-tip span { font-size: 16px; }
.success-tip p { font-size: 10.5px; color: #4a718c; line-height: 1.65; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-row :deep(.el-form-item) { margin-bottom: 14px; }
@media (max-width: 960px) {
  .checkout-grid { grid-template-columns: 1fr; }
  .co-summary { position: static; }
  .co-side { flex-direction: column; }
}
@media (max-width: 700px) {
  .checkout-page { padding: 20px 16px 12px; }
  .checkout-head h1 { font-size: 25px; }
  .head-steps { display: none; }
  .address-grid { grid-template-columns: 1fr; }
  .pay-list { grid-template-columns: 1fr; }
  .co-item { flex-wrap: wrap; }
  .ci-main { flex-basis: calc(100% - 70px); }
  .ci-price { display: none; }
  .ci-qty { margin-left: auto; width: auto; }
  .success-card { padding: 26px 18px; }
  .success-order { grid-template-columns: 1fr; }
  .success-order .wide { grid-column: auto; }
  .form-row { grid-template-columns: 1fr; }
}
</style>
