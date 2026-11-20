<template>
  <div class="profile-page">
    <section class="profile-hero">
      <div class="ph-avatar">{{ auth.user?.name?.slice(0, 1) || '客' }}</div>
      <div class="ph-main">
        <span class="ph-role">{{ auth.roleMeta?.name || '消费者' }}</span>
        <h1>{{ auth.user?.name || '商城用户' }}</h1>
        <p>{{ auth.user?.phone || '187****2233' }} · {{ level.name }}</p>
        <div class="ph-chips">
          <span>🌱 {{ level.desc }}</span>
          <span v-if="auth.online">🟢 已连接平台服务</span>
          <span v-else>⚪ 离线演示模式</span>
        </div>
      </div>
      <div class="ph-stats">
        <div><b>{{ mall.orders.length }}</b><span>我的订单</span></div>
        <div><b>{{ mall.favorites.length }}</b><span>收藏商品</span></div>
        <div><b>{{ totalSpend.toFixed(0) }}</b><span>累计消费 / 元</span></div>
        <div><b>{{ mall.unreadCount }}</b><span>未读消息</span></div>
      </div>
    </section>

    <div class="profile-grid">
      <aside class="profile-nav card">
        <button v-for="n in navs" :key="n.key" :class="{ on: tab === n.key }" @click="tab = n.key">
          <span class="pn-ico"><component :is="n.icon" /></span>
          <span>{{ n.label }}</span>
          <em v-if="n.key === 'messages' && mall.unreadCount">{{ mall.unreadCount }}</em>
          <el-icon class="pn-arrow"><ArrowRight /></el-icon>
        </button>
        <div class="pn-help">
          <span>🌾</span>
          <b>需要帮助？</b>
          <p>客服每天 6:00 – 22:00 在线，也可以直接联系熟悉的农户。</p>
          <el-button size="small" plain @click="contact">联系客服</el-button>
        </div>
      </aside>

      <main class="profile-main">
        <template v-if="tab === 'overview'">
          <section class="card p-card">
            <div class="card-head"><h3>最近订单</h3><span class="sub">近 {{ Math.min(3, mall.orders.length) }} 笔</span><div class="acts"><el-button text type="primary" size="small" @click="tab = 'orders'">全部订单</el-button></div></div>
            <div class="order-preview">
              <div v-for="o in mall.orders.slice(0, 3)" :key="o.no" class="op-row" @click="$router.push(`/mall/orders/${o.no}`)">
                <span class="op-ico">📦</span>
                <div class="op-main"><b>{{ o.goods }}</b><span>{{ o.no }} · {{ o.time }}</span></div>
                <StatusTag :status="o.status" />
                <b class="op-amount">¥{{ Number(o.amount).toFixed(2) }}</b>
                <el-icon class="op-arrow"><ArrowRight /></el-icon>
              </div>
              <div v-if="!mall.orders.length" class="empty-box" style="padding:30px">还没有订单，去挑点新鲜的吧</div>
            </div>
          </section>

          <div class="overview-grid">
            <section class="card p-card quick-card">
              <div class="card-head"><h3>快捷入口</h3></div>
              <div class="quick-grid">
                <button @click="$router.push('/mall/products')"><span>🧺</span><b>去逛商城</b><small>当日现摘</small></button>
                <button @click="$router.push('/mall/trace')"><span>🔎</span><b>产品溯源</b><small>一物一码</small></button>
                <button @click="$router.push('/mall/cart')"><span>🛒</span><b>购物车</b><small>{{ cart.count }} 件商品</small></button>
                <button @click="$router.push('/mall/orders')"><span>📦</span><b>我的订单</b><small>{{ mall.orderCounts['待收货'] || 0 }} 笔运输中</small></button>
              </div>
            </section>

            <section class="card p-card address-preview">
              <div class="card-head"><h3>默认地址</h3><div class="acts"><el-button text type="primary" size="small" @click="tab = 'address'">管理地址</el-button></div></div>
              <div v-if="mall.defaultAddress" class="ap-body">
                <div class="ap-name">{{ mall.defaultAddress.name }} <span>{{ mall.defaultAddress.phone }}</span><em>{{ mall.defaultAddress.tag }}</em></div>
                <p>{{ mall.defaultAddress.region }} {{ mall.defaultAddress.detail }}</p>
                <div class="ap-tip"><el-icon><CircleCheck /></el-icon>下单时默认使用此地址</div>
              </div>
              <div v-else class="empty-box" style="padding:26px">还没有收货地址，去添加一个吧</div>
            </section>
          </div>

          <section class="card p-card">
            <div class="card-head"><h3>猜你喜欢</h3><div class="acts"><el-button text type="primary" size="small" @click="$router.push('/mall/products')">更多</el-button></div></div>
            <div class="fav-grid">
              <ProductCard
                v-for="g in DB.goods.slice(0, 4)"
                :key="g.id"
                :goods="g"
                :favorite="mall.isFavorite(g.id)"
                @add="addCart"
                @fav="toggleFav"
                @open="g2 => $router.push(`/mall/product/${g2.id}`)"
              />
            </div>
          </section>
        </template>

        <template v-else-if="tab === 'orders'">
          <section class="card p-card">
            <div class="card-head">
              <h3>我的订单</h3>
              <span class="sub">共 {{ mall.orders.length }} 笔</span>
              <div class="acts"><el-button text type="primary" size="small" @click="$router.push('/mall/orders')">订单管理</el-button></div>
            </div>
            <div class="order-status-chips">
              <button v-for="s in orderStatus" :key="s.key" @click="$router.push('/mall/orders')">
                <b>{{ countStatus(s.key) }}</b><span>{{ s.label }}</span>
              </button>
            </div>
            <div class="order-preview">
              <div v-for="o in mall.orders" :key="o.no" class="op-row" @click="$router.push(`/mall/orders/${o.no}`)">
                <span class="op-ico">📦</span>
                <div class="op-main"><b>{{ o.goods }}</b><span>{{ o.no }} · {{ o.time }} · {{ o.pay }}</span></div>
                <StatusTag :status="o.status" />
                <b class="op-amount">¥{{ Number(o.amount).toFixed(2) }}</b>
                <el-icon class="op-arrow"><ArrowRight /></el-icon>
              </div>
              <div v-if="!mall.orders.length" class="empty-box" style="padding:40px">
                <div class="icon">📦</div>
                <div>还没有订单</div>
                <el-button type="primary" plain class="mt-12" @click="$router.push('/mall/products')">去逛逛</el-button>
              </div>
            </div>
          </section>
        </template>

        <template v-else-if="tab === 'afterSales'">
          <section class="card p-card">
            <div class="card-head">
              <h3>售后与退款</h3>
              <span class="sub">共 {{ mall.afterSales.length }} 条申请</span>
              <div class="acts"><el-button text type="primary" size="small" @click="$router.push('/mall/orders')">查看订单</el-button></div>
            </div>
            <div v-if="mall.afterSales.length" class="as-list">
              <article v-for="a in mall.afterSales" :key="a.id" class="as-item">
                <span class="as-ico">🛡️</span>
                <div class="as-main">
                  <div class="as-top">
                    <b>{{ a.type }}</b>
                    <StatusTag :status="a.status" />
                    <span class="as-time">{{ a.time }}</span>
                  </div>
                  <p>{{ a.goods }} · 订单 {{ a.orderNo }}</p>
                  <p class="as-reason">{{ a.reason }}</p>
                  <span v-if="a.handleNote" class="as-note">农户说明：{{ a.handleNote }}</span>
                </div>
                <div class="as-side">
                  <b>¥{{ Number(a.amount || 0).toFixed(2) }}</b>
                  <el-button v-if="a.status === '待处理'" size="small" text type="danger" @click="cancelAfterSale(a)">撤销申请</el-button>
                  <el-button size="small" text type="primary" @click="$router.push(`/mall/orders/${a.orderNo}`)">订单详情</el-button>
                </div>
              </article>
            </div>
            <div v-else class="empty-box">
              <div class="icon">🛡️</div>
              <div>暂无售后记录</div>
              <p class="muted tiny">在订单详情页可以对坏果、少件等问题发起售后申请。</p>
              <el-button type="primary" plain class="mt-12" @click="$router.push('/mall/orders')">查看我的订单</el-button>
            </div>
          </section>
        </template>

        <template v-else-if="tab === 'favorites'">
          <section class="card p-card">
            <div class="card-head">
              <h3>我的收藏</h3>
              <span class="sub">{{ mall.favorites.length }} 款商品</span>
              <div class="acts"><el-button text type="primary" size="small" @click="$router.push('/mall/products')">去发现更多</el-button></div>
            </div>
            <div v-if="mall.favoriteGoods.length" class="fav-grid">
              <ProductCard
                v-for="g in mall.favoriteGoods"
                :key="g.id"
                :goods="g"
                :favorite="true"
                @add="addCart"
                @fav="toggleFav"
                @open="g2 => $router.push(`/mall/product/${g2.id}`)"
              />
            </div>
            <div v-else class="empty-box">
              <div class="icon">♡</div>
              <div>还没有收藏商品</div>
              <p class="muted tiny">看到喜欢的农产品，点一下商品卡片上的爱心就能收藏。</p>
              <el-button type="primary" plain class="mt-12" @click="$router.push('/mall/products')">去挑选</el-button>
            </div>
          </section>
        </template>

        <template v-else-if="tab === 'address'">
          <section class="card p-card">
            <div class="card-head">
              <h3>收货地址</h3>
              <span class="sub">{{ mall.addresses.length }} 个地址</span>
              <div class="acts"><el-button type="primary" size="small" :icon="Plus" @click="openAddress()">新增地址</el-button></div>
            </div>
            <div class="address-list">
              <article v-for="a in mall.addresses" :key="a.id" class="address-item">
                <div class="ai-top">
                  <span class="ai-tag">{{ a.tag || '地址' }}</span>
                  <b>{{ a.name }}</b>
                  <span class="ai-phone">{{ a.phone }}</span>
                  <span v-if="a.def" class="ai-default">默认地址</span>
                </div>
                <p>{{ a.region }} {{ a.detail }}</p>
                <div class="ai-actions">
                  <button @click="openAddress(a)"><el-icon><Edit /></el-icon>编辑</button>
                  <button @click="removeAddress(a)"><el-icon><Delete /></el-icon>删除</button>
                  <button v-if="!a.def" @click="setDefault(a)"><el-icon><CircleCheck /></el-icon>设为默认</button>
                </div>
              </article>
              <button class="address-add" @click="openAddress()">
                <el-icon><Plus /></el-icon>
                <b>新增收货地址</b>
                <span>添加后可在结算时快速选择</span>
              </button>
            </div>
          </section>
        </template>

        <template v-else-if="tab === 'messages'">
          <section class="card p-card">
            <div class="card-head">
              <h3>消息中心</h3>
              <span class="sub">{{ mall.unreadCount }} 条未读</span>
              <div class="acts"><el-button text type="primary" size="small" @click="mall.readAllMessages(); ElMessage.success('已全部标记为已读')">全部已读</el-button></div>
            </div>
            <div class="msg-filters">
              <button v-for="t in msgTypes" :key="t" :class="{ on: msgFilter === t }" @click="msgFilter = t">{{ t }}</button>
            </div>
            <div class="msg-items">
              <div v-for="m in filteredMessages" :key="m.id" class="msg-item" :class="{ unread: !m.read }" @click="openMessage(m)">
                <span class="mi-ico" :class="m.type">{{ typeIcon(m.type) }}</span>
                <div class="mi-main">
                  <div class="mi-title"><b>{{ m.title }}</b><span class="mi-type">{{ m.type }}</span><span class="mi-time">{{ m.time }}</span></div>
                  <p>{{ m.text }}</p>
                </div>
                <span v-if="!m.read" class="mi-dot"></span>
              </div>
              <div v-if="!filteredMessages.length" class="empty-box">
                <div class="icon">🔔</div>
                <div>暂无{{ msgFilter === '全部' ? '' : msgFilter }}消息</div>
              </div>
            </div>
          </section>
        </template>

        <template v-else-if="tab === 'settings'">
          <section class="card p-card">
            <div class="card-head"><h3>账号资料</h3><span class="sub">修改后自动保存到本地</span></div>
            <el-form :model="profileForm" label-position="top" class="settings-form">
              <div class="form-row">
                <el-form-item label="昵称"><el-input v-model="profileForm.name" maxlength="20" /></el-form-item>
                <el-form-item label="手机号"><el-input v-model="profileForm.phone" maxlength="20" /></el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="邮箱"><el-input v-model="profileForm.email" placeholder="用于接收订单通知" /></el-form-item>
                <el-form-item label="所在城市"><el-input v-model="profileForm.city" placeholder="如：重庆市 渝北区" /></el-form-item>
              </div>
              <el-form-item label="收货偏好"><el-input v-model="profileForm.prefer" type="textarea" :rows="2" maxlength="80" show-word-limit placeholder="如：工作日 18 点后送达，放门口即可" /></el-form-item>
              <div class="settings-actions">
                <el-button type="primary" @click="saveProfile">保存资料</el-button>
                <el-button @click="resetProfile">重置</el-button>
              </div>
            </el-form>
          </section>

          <section class="card p-card">
            <div class="card-head"><h3>消息与安全</h3></div>
            <div class="setting-rows">
              <div class="setting-row"><div><b>订单状态通知</b><small>发货、签收、售后等关键节点提醒</small></div><el-switch v-model="notify.order" /></div>
              <div class="setting-row"><div><b>活动与新品通知</b><small>新品上架、限时优惠推送</small></div><el-switch v-model="notify.promo" /></div>
              <div class="setting-row"><div><b>溯源报告更新</b><small>已购批次新增检测报告时提醒</small></div><el-switch v-model="notify.trace" /></div>
              <div class="setting-row"><div><b>登录密码</b><small>建议定期更换密码，保护账号安全</small></div><el-button size="small" @click="pwdOpen = true">修改密码</el-button></div>
            </div>
          </section>

          <section class="card p-card">
            <div class="card-head"><h3>账号信息</h3></div>
            <div class="account-grid">
              <div><span>账号 ID</span><b>{{ auth.user?.id || 'C-2233' }}</b></div>
              <div><span>账号角色</span><b>{{ auth.roleMeta?.name }}</b></div>
              <div><span>登录方式</span><b>{{ auth.user?.local ? '演示账号' : '平台账号' }}</b></div>
              <div><span>注册时间</span><b>2026-08-12</b></div>
            </div>
            <div class="danger-zone">
              <div><b>退出当前账号</b><small>退出后需要重新登录才能查看订单和个人信息。</small></div>
              <el-button type="danger" plain size="small" @click="logout">退出登录</el-button>
            </div>
          </section>
        </template>
      </main>
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
              <el-option label="家" value="家" /><el-option label="公司" value="公司" /><el-option label="学校" value="学校" /><el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
          <el-form-item label="设为默认"><el-switch v-model="addrForm.def" /></el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="addrOpen = false">取消</el-button>
        <el-button type="primary" @click="saveAddress">保存地址</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="pwdOpen" title="修改登录密码" width="420px" destroy-on-close>
      <el-form :model="pwdForm" label-position="top">
        <el-form-item label="当前密码"><el-input v-model="pwdForm.old" type="password" show-password placeholder="请输入当前密码" /></el-form-item>
        <el-form-item label="新密码"><el-input v-model="pwdForm.next" type="password" show-password placeholder="至少 6 位字符" /></el-form-item>
        <el-form-item label="确认新密码"><el-input v-model="pwdForm.confirm" type="password" show-password placeholder="请再次输入新密码" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdOpen = false">取消</el-button>
        <el-button type="primary" @click="savePassword">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, List, Star, Location, Bell, Setting, ArrowRight, Plus, Edit, Delete, CircleCheck, Warning } from '@element-plus/icons-vue'
import ProductCard from '@/components/ProductCard.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useMallStore } from '@/stores/mall'
import DB from '@/data/db'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const mall = useMallStore()

const tab = ref('overview')
const navs = [
  { key: 'overview', label: '个人概览', icon: User },
  { key: 'orders', label: '我的订单', icon: List },
  { key: 'afterSales', label: '售后与退款', icon: Warning },
  { key: 'favorites', label: '我的收藏', icon: Star },
  { key: 'address', label: '收货地址', icon: Location },
  { key: 'messages', label: '消息中心', icon: Bell },
  { key: 'settings', label: '账号设置', icon: Setting }
]

const totalSpend = computed(() => mall.orders.filter(o => o.status !== '已取消').reduce((a, o) => a + Number(o.amount || 0), 0))
const level = computed(() => {
  if (totalSpend.value >= 300) return { name: '金穗会员', desc: '金穗会员 · 专属客服与优先发货' }
  if (totalSpend.value >= 100) return { name: '青梅会员', desc: '青梅会员 · 每月 2 张优惠券' }
  return { name: '新芽会员', desc: '新芽会员 · 新人首单立减 5 元' }
})

const orderStatus = [
  { key: '待付款', label: '待付款' },
  { key: '待发货', label: '待发货' },
  { key: '待收货', label: '待收货' },
  { key: '待评价', label: '待评价' }
]
function countStatus(key) {
  if (key === '待收货') return mall.orders.filter(o => ['运输中', '待收货'].includes(o.status)).length
  return mall.orders.filter(o => o.status === key).length
}

const msgFilter = ref('全部')
const msgTypes = ['全部', '订单', '评价', '活动', '系统']
const filteredMessages = computed(() => msgFilter.value === '全部' ? mall.messages : mall.messages.filter(m => m.type === msgFilter.value))
function typeIcon(type) {
  return { 订单: '📦', 评价: '💬', 活动: '🎁', 系统: '🔔' }[type] || '🔔'
}
function openMessage(m) {
  mall.readMessage(m.id)
  ElMessage.info(m.text)
}

const profileForm = reactive({
  name: auth.user?.name || '',
  phone: auth.user?.phone || '',
  email: auth.user?.email || 'user@freshfarm.cn',
  city: auth.user?.city || '重庆市 渝北区',
  prefer: auth.user?.prefer || '工作日 18 点后送达，放门口即可'
})
function saveProfile() {
  if (!profileForm.name.trim()) return ElMessage.warning('昵称不能为空')
  auth.patchUser({ ...profileForm })
  ElMessage.success('资料已保存')
}
function resetProfile() {
  profileForm.name = auth.user?.name || ''
  profileForm.phone = auth.user?.phone || ''
  profileForm.email = 'user@freshfarm.cn'
  profileForm.city = '重庆市 渝北区'
  profileForm.prefer = '工作日 18 点后送达，放门口即可'
  ElMessage.info('已恢复当前账号资料')
}

const notify = reactive({ order: true, promo: false, trace: true })
const pwdOpen = ref(false)
const pwdForm = reactive({ old: '', next: '', confirm: '' })
function savePassword() {
  if (!pwdForm.old) return ElMessage.warning('请输入当前密码')
  if (pwdForm.next.length < 6) return ElMessage.warning('新密码至少 6 位')
  if (pwdForm.next !== pwdForm.confirm) return ElMessage.warning('两次输入的新密码不一致')
  pwdOpen.value = false
  pwdForm.old = ''
  pwdForm.next = ''
  pwdForm.confirm = ''
  ElMessage.success('密码已更新（演示环境）')
}
function logout() {
  ElMessageBox.confirm('确定退出当前账号吗？', '退出登录', { type: 'warning', confirmButtonText: '退出', cancelButtonText: '取消' })
    .then(() => {
      auth.logout()
      ElMessage.success('已退出登录')
      router.push('/mall')
    })
    .catch(() => {})
}

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
function openAddress(a) {
  editing.value = a?.id || ''
  Object.assign(addrForm, a
    ? { name: a.name, phone: a.phone, region: a.region, detail: a.detail, tag: a.tag || '家', def: !!a.def }
    : { name: '', phone: '', region: '重庆市 ', detail: '', tag: '家', def: false })
  addrOpen.value = true
}
async function saveAddress() {
  await addrFormRef.value?.validate()
  if (editing.value) {
    mall.updateAddress(editing.value, { ...addrForm })
    ElMessage.success('地址已更新')
  } else {
    mall.addAddress({ ...addrForm })
    ElMessage.success('地址已添加')
  }
  addrOpen.value = false
}
async function removeAddress(a) {
  try {
    await ElMessageBox.confirm(`确定删除「${a.name} ${a.region}」这个地址吗？`, '删除地址', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' })
    mall.removeAddress(a.id)
    ElMessage.success('地址已删除')
  } catch {}
}
function setDefault(a) { mall.updateAddress(a.id, { def: true }); ElMessage.success('已设为默认地址') }

function addCart(g) {
  const res = cart.add(g.id, 1)
  ElMessage[res.ok ? 'success' : 'warning'](res.ok ? `${g.name} 已加入购物车` : res.message)
}
function toggleFav(g) { ElMessage.success(mall.toggleFavorite(g.id) ? '已收藏' : '已取消收藏') }
async function cancelAfterSale(a) {
  try {
    await ElMessageBox.confirm('确定撤销这条售后申请吗？', '撤销售后', { type: 'warning', confirmButtonText: '撤销', cancelButtonText: '取消' })
    mall.cancelAfterSale(a.id)
    ElMessage.success('售后申请已撤销')
  } catch {}
}
function contact() { ElMessage.info('客服热线：400-880-2026（演示环境）') }
</script>

<style scoped>
.profile-page { max-width: 1180px; margin: 0 auto; padding: 24px 24px 16px; }
.profile-hero { position: relative; display: flex; align-items: center; gap: 20px; padding: 26px 30px; border-radius: 20px; background: linear-gradient(120deg, #2e5137, #47754c 58%, #6f9869); color: #eaf3e6; overflow: hidden; }
.profile-hero::before { content: ""; position: absolute; right: -60px; top: -90px; width: 280px; height: 280px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,.14), transparent 68%); }
.profile-hero::after { content: "🌾"; position: absolute; right: 32%; bottom: -26px; font-size: 96px; opacity: .09; }
.ph-avatar { width: 76px; height: 76px; border-radius: 50%; background: rgba(255,255,255,.16); border: 1px solid rgba(255,255,255,.3); display: grid; place-items: center; font-size: 30px; flex: 0 0 76px; position: relative; z-index: 1; }
.ph-main { flex: 1; min-width: 0; position: relative; z-index: 1; }
.ph-role { font-size: 9.5px; letter-spacing: 1.5px; color: #c9e2b8; background: rgba(255,255,255,.12); border-radius: 20px; padding: 2px 9px; }
.ph-main h1 { font-size: 25px; color: #fff; margin: 5px 0 2px; }
.ph-main > p { font-size: 11.5px; color: #bdd6bd; }
.ph-chips { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
.ph-chips span { font-size: 9.5px; color: #cfe3c9; border: 1px solid rgba(255,255,255,.16); border-radius: 20px; padding: 2px 9px; }
.ph-stats { display: flex; gap: 30px; position: relative; z-index: 1; }
.ph-stats b { display: block; font-size: 23px; color: #fff; line-height: 1.2; }
.ph-stats span { font-size: 9.5px; color: #a9c9b6; }
.profile-grid { display: grid; grid-template-columns: 214px 1fr; gap: 16px; margin-top: 16px; align-items: start; }
.profile-nav { padding: 10px; position: sticky; top: 88px; }
.profile-nav > button { display: flex; align-items: center; gap: 9px; width: 100%; border: none; background: transparent; border-radius: 9px; padding: 10px 11px; font-size: 12.5px; color: var(--ink-500); cursor: pointer; text-align: left; transition: all .15s; }
.profile-nav > button:hover { background: #f8faf4; color: var(--brand-700); }
.profile-nav > button.on { background: var(--brand-50); color: var(--brand-700); font-weight: 600; }
.pn-ico { width: 26px; height: 26px; border-radius: 8px; background: #f6f8f1; display: grid; place-items: center; font-size: 14px; }
.profile-nav > button.on .pn-ico { background: var(--brand-600); color: #fff; }
.profile-nav em { margin-left: auto; font-style: normal; font-size: 9px; background: #cf5d4d; color: #fff; border-radius: 8px; padding: 0 5px; line-height: 15px; }
.pn-arrow { margin-left: auto; font-size: 11px; color: var(--ink-300); }
.profile-nav em + .pn-arrow { margin-left: 4px; }
.pn-help { margin-top: 12px; padding: 14px; border-radius: 12px; background: #fbf7eb; border: 1px solid #f0e5c9; }
.pn-help > span { font-size: 20px; }
.pn-help b { display: block; font-size: 11.5px; margin-top: 4px; color: #8a6527; }
.pn-help p { font-size: 10px; color: #a58652; line-height: 1.6; margin: 3px 0 9px; }
.profile-main { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.p-card { padding: 0 0 16px; }
.p-card .card-head { padding: 15px 20px; }
.order-preview { padding: 2px 20px 0; }
.as-list { padding: 0 20px; display: flex; flex-direction: column; }
.as-item { display: flex; gap: 11px; padding: 13px 0; border-bottom: 1px dashed #eef1e8; }
.as-item:last-child { border-bottom: none; }
.as-ico { width: 36px; height: 36px; border-radius: 10px; background: var(--brand-50); display: grid; place-items: center; font-size: 17px; flex: 0 0 36px; }
.as-main { flex: 1; min-width: 0; }
.as-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.as-top b { font-size: 12px; }
.as-time { margin-left: auto; font-size: 9.5px; color: var(--ink-300); }
.as-main p { font-size: 10.5px; color: var(--ink-400); line-height: 1.6; margin-top: 3px; }
.as-main .as-reason { color: var(--ink-600); }
.as-note { display: inline-block; margin-top: 4px; font-size: 9.5px; color: var(--brand-700); background: var(--brand-50); border-radius: 6px; padding: 2px 7px; }
.as-side { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex: 0 0 auto; }
.as-side b { font-size: 13px; color: #b5473d; }
.op-row { display: flex; align-items: center; gap: 10px; padding: 11px 0; border-bottom: 1px dashed #eef1e8; cursor: pointer; }
.op-row:last-child { border-bottom: none; }
.op-row:hover .op-main b { color: var(--brand-600); }
.op-ico { width: 36px; height: 36px; border-radius: 10px; background: var(--brand-50); display: grid; place-items: center; font-size: 17px; flex: 0 0 36px; }
.op-main { flex: 1; min-width: 0; }
.op-main b { display: block; font-size: 11.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.op-main span { font-size: 9.5px; color: var(--ink-400); }
.op-amount { font-size: 12px; color: #b5473d; flex: 0 0 auto; }
.op-arrow { font-size: 11px; color: var(--ink-300); }
.overview-grid { display: grid; grid-template-columns: 1.2fr .8fr; gap: 14px; }
.quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 2px 20px 0; }
.quick-grid button { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; border: 1px solid var(--line); background: #fcfdf9; border-radius: 11px; padding: 11px 12px; cursor: pointer; text-align: left; transition: all .15s; }
.quick-grid button:hover { border-color: var(--brand-300); background: var(--brand-50); }
.quick-grid span { font-size: 19px; }
.quick-grid b { font-size: 11.5px; }
.quick-grid small { font-size: 9px; color: var(--ink-400); }
.ap-body { padding: 2px 20px 0; }
.ap-name { display: flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 600; }
.ap-name span { font-size: 10px; color: var(--ink-400); font-weight: 400; }
.ap-name em { font-style: normal; font-size: 8.5px; color: var(--brand-700); background: var(--brand-50); border-radius: 4px; padding: 1px 5px; }
.ap-body > p { font-size: 11px; color: var(--ink-500); line-height: 1.6; margin-top: 5px; }
.ap-tip { display: flex; align-items: center; gap: 4px; margin-top: 9px; font-size: 9.5px; color: var(--brand-600); }
.fav-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 2px 20px 0; }
.order-status-chips { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 2px 20px 12px; }
.order-status-chips button { border: 1px solid var(--line); background: #fcfdf9; border-radius: 10px; padding: 9px; cursor: pointer; text-align: center; }
.order-status-chips button:hover { border-color: var(--brand-300); background: var(--brand-50); }
.order-status-chips b { display: block; font-size: 18px; color: var(--brand-700); }
.order-status-chips span { font-size: 9.5px; color: var(--ink-400); }
.address-list { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 2px 20px 0; }
.address-item { border: 1px solid var(--line); background: #fff; border-radius: 12px; padding: 13px 15px; }
.ai-top { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.ai-tag { font-size: 8.5px; color: var(--brand-700); background: var(--brand-50); border-radius: 4px; padding: 1px 5px; }
.ai-top b { font-size: 12.5px; }
.ai-phone { font-size: 10px; color: var(--ink-400); }
.ai-default { margin-left: auto; font-size: 8.5px; color: #a86c18; background: #fdf3e3; border-radius: 4px; padding: 1px 5px; }
.address-item > p { font-size: 11px; color: var(--ink-500); line-height: 1.6; margin-top: 6px; min-height: 34px; }
.ai-actions { display: flex; gap: 11px; padding-top: 8px; border-top: 1px dashed var(--line); }
.ai-actions button { display: inline-flex; align-items: center; gap: 3px; border: none; background: transparent; font-size: 9.5px; color: var(--ink-400); cursor: pointer; padding: 0; }
.ai-actions button:hover { color: var(--brand-600); }
.address-add { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; border: 1px dashed var(--line-strong); background: #fcfdf9; border-radius: 12px; padding: 18px; cursor: pointer; color: var(--ink-400); min-height: 118px; }
.address-add:hover { border-color: var(--brand-300); color: var(--brand-600); }
.address-add .el-icon { font-size: 19px; }
.address-add b { font-size: 11.5px; }
.address-add span { font-size: 9.5px; }
.msg-filters { display: flex; gap: 5px; padding: 0 20px 10px; flex-wrap: wrap; }
.msg-filters button { border: 1px solid var(--line); background: #fff; border-radius: 20px; padding: 4px 12px; font-size: 10.5px; color: var(--ink-400); cursor: pointer; }
.msg-filters button.on { background: var(--brand-600); border-color: var(--brand-600); color: #fff; }
.msg-items { padding: 0 20px; }
.msg-item { display: flex; gap: 10px; padding: 12px 0; border-bottom: 1px dashed #eef1e8; cursor: pointer; }
.msg-item:last-child { border-bottom: none; }
.msg-item:hover .mi-title b { color: var(--brand-600); }
.mi-ico { width: 34px; height: 34px; border-radius: 10px; background: var(--brand-50); display: grid; place-items: center; font-size: 16px; flex: 0 0 34px; }
.mi-main { flex: 1; min-width: 0; }
.mi-title { display: flex; align-items: center; gap: 7px; }
.mi-title b { font-size: 11.5px; }
.mi-type { font-size: 8.5px; color: var(--brand-600); background: var(--brand-50); border-radius: 4px; padding: 0 5px; }
.mi-time { margin-left: auto; font-size: 9.5px; color: var(--ink-300); }
.mi-main p { font-size: 10.5px; color: var(--ink-400); line-height: 1.6; margin-top: 2px; }
.mi-dot { width: 6px; height: 6px; border-radius: 50%; background: #c65b4e; margin-top: 10px; flex: 0 0 6px; }
.settings-form { padding: 2px 20px 0; max-width: 680px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.settings-actions { display: flex; gap: 8px; margin-top: 4px; }
.setting-rows { padding: 0 20px; }
.setting-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 12px 0; border-bottom: 1px dashed #eef1e8; }
.setting-row:last-child { border-bottom: none; }
.setting-row b { display: block; font-size: 12px; }
.setting-row small { font-size: 10px; color: var(--ink-400); }
.account-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px; padding: 0 20px; }
.account-grid div { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px dashed #eef1e8; font-size: 10.5px; }
.account-grid span { color: var(--ink-400); }
.account-grid b { font-weight: 500; }
.danger-zone { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin: 16px 20px 0; padding: 13px 15px; background: #fdf6f5; border: 1px solid #f0deda; border-radius: 11px; }
.danger-zone b { display: block; font-size: 12px; color: #a3483d; }
.danger-zone small { font-size: 10px; color: #b77a72; }
@media (max-width: 980px) {
  .ph-stats { gap: 18px; }
  .profile-grid { grid-template-columns: 1fr; }
  .profile-nav { display: flex; gap: 4px; overflow-x: auto; position: static; padding: 8px; }
  .profile-nav > button { width: auto; white-space: nowrap; padding: 8px 10px; }
  .pn-arrow { display: none; }
  .pn-help { display: none; }
  .fav-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 700px) {
  .profile-page { padding: 16px 16px 12px; }
  .profile-hero { padding: 20px; flex-wrap: wrap; gap: 14px; }
  .ph-avatar { width: 58px; height: 58px; font-size: 23px; flex-basis: 58px; }
  .ph-main h1 { font-size: 20px; }
  .ph-stats { width: 100%; justify-content: space-between; gap: 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.14); }
  .ph-stats b { font-size: 18px; }
  .ph-stats span { font-size: 8.5px; }
  .overview-grid { grid-template-columns: 1fr; }
  .fav-grid { grid-template-columns: 1fr 1fr; gap: 9px; padding: 2px 14px 0; }
  .p-card .card-head { padding: 13px 14px; }
  .order-preview, .msg-items { padding-left: 14px; padding-right: 14px; }
  .quick-grid, .ap-body { padding-left: 14px; padding-right: 14px; }
  .address-list { grid-template-columns: 1fr; padding: 2px 14px 0; }
  .order-status-chips { grid-template-columns: 1fr 1fr; padding: 2px 14px 12px; }
  .settings-form, .setting-rows, .account-grid { padding-left: 14px; padding-right: 14px; }
  .form-row { grid-template-columns: 1fr; }
  .op-amount { display: none; }
  .account-grid { grid-template-columns: 1fr; }
  .msg-filters { padding-left: 14px; padding-right: 14px; }
}
</style>
