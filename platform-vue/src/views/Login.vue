<template>
  <div class="login-page">
    <aside class="login-aside">
      <div class="la-top">
        <AppLogo title="智慧农业综合管理平台" subtitle="SMART AGRICULTURE PLATFORM" />
        <span class="la-version">Vue 3 版 · V3.0</span>
      </div>
      <div class="la-copy">
        <span class="kicker">FROM FARM TO TABLE</span>
        <h1>让每一份新鲜，<br /><em>都有数据可依</em></h1>
        <p>一个平台连接消费者商城、农场生产、环境监测、溯源管理与可视化大屏。登录后按角色进入对应工作台。</p>
        <div class="la-points">
          <div><span>🛒</span><div><b>消费者商城</b><small>产地直供 · 一物一码 · 冷链配送</small></div></div>
          <div><span>🌡️</span><div><b>生产环境监测</b><small>温湿度、光照、土壤墒情实时采集</small></div></div>
          <div><span>🛡️</span><div><b>全流程质量溯源</b><small>农事记录与农残检测批批归档</small></div></div>
        </div>
        <div class="la-stats">
          <div><b>3</b><span>自营园区</span></div>
          <div><b>2,610<small>亩</small></b><span>种植基地</span></div>
          <div><b>48<small>+</small></b><span>管理模块</span></div>
          <div><b>24<small>h</small></b><span>主城送达</span></div>
        </div>
      </div>
      <div class="la-visual">
        <span class="lv-emoji">🌾</span>
        <div class="lv-chip c1">🍅 今日现摘</div>
        <div class="lv-chip c2">📡 设备在线 96%</div>
        <div class="lv-chip c3">🛡️ 检测合格</div>
        <i class="lv-ring r1"></i>
        <i class="lv-ring r2"></i>
      </div>
      <div class="la-foot">
        <span>© 2026 智慧农业综合管理平台</span>
        <router-link to="/mall">返回消费者商城 →</router-link>
      </div>
    </aside>

    <main class="login-main">
      <div class="lm-card">
        <div class="lm-head">
          <div>
            <span class="kicker">WELCOME BACK</span>
            <h2>登录平台</h2>
            <p>选择角色快捷体验，或使用账号密码登录</p>
          </div>
          <span class="lm-status" :class="{ online: auth.online }"><i></i>{{ auth.online ? '服务在线' : '演示模式' }}</span>
        </div>

        <div class="login-tabs">
          <button :class="{ on: mode === 'account' }" @click="mode = 'account'">账号密码</button>
          <button :class="{ on: mode === 'code' }" @click="mode = 'code'">手机验证码</button>
        </div>

        <form v-if="mode === 'account'" class="login-form" @submit.prevent="submitAccount">
          <label class="field">
            <span>账号</span>
            <el-input v-model="account" size="large" placeholder="请输入账号，如 admin" clearable @keyup.enter="submitAccount">
              <template #prefix><el-icon><User /></el-icon></template>
            </el-input>
          </label>
          <label class="field">
            <span>密码</span>
            <el-input v-model="password" size="large" type="password" show-password placeholder="请输入登录密码" @keyup.enter="submitAccount">
              <template #prefix><el-icon><Lock /></el-icon></template>
            </el-input>
          </label>
          <div class="form-extra">
            <el-checkbox v-model="remember">记住账号</el-checkbox>
            <button type="button" @click="forgot">忘记密码？</button>
          </div>
          <el-button type="primary" size="large" class="submit" :loading="auth.loading" native-type="submit">登 录</el-button>
        </form>

        <form v-else class="login-form" @submit.prevent="submitCode">
          <label class="field">
            <span>手机号</span>
            <el-input v-model="phone" size="large" placeholder="请输入 11 位手机号" maxlength="11" clearable @keyup.enter="submitCode">
              <template #prefix><el-icon><Iphone /></el-icon></template>
            </el-input>
          </label>
          <label class="field">
            <span>验证码</span>
            <div class="code-row">
              <el-input v-model="code" size="large" placeholder="请输入 4-6 位验证码" maxlength="6" @keyup.enter="submitCode">
                <template #prefix><el-icon><Message /></el-icon></template>
              </el-input>
              <el-button size="large" :disabled="counting > 0" @click="sendCode">{{ counting > 0 ? counting + 's 后重发' : '发送验证码' }}</el-button>
            </div>
          </label>
          <div class="code-tip"><el-icon><InfoFilled /></el-icon>演示环境验证码固定为 <b>8888</b>，手机号可任意填写。</div>
          <el-button type="primary" size="large" class="submit" :loading="auth.loading" native-type="submit">登录 / 注册</el-button>
        </form>

        <div class="demo-divider"><span>角色快捷体验</span></div>
        <div class="demo-grid">
          <button v-for="d in DEMO_ACCOUNTS" :key="d.account" class="demo-card" :class="d.role" @click="quick(d)">
            <span class="dc-avatar">{{ roleShort(d.role) }}</span>
            <div><b>{{ d.label }}</b><small>{{ d.desc }}</small></div>
            <el-icon class="dc-arrow"><ArrowRight /></el-icon>
          </button>
        </div>

        <div class="login-foot">
          <span>登录即表示同意《平台服务协议》与《隐私政策》</span>
          <router-link to="/mall">先逛逛商城 <el-icon><ArrowRight /></el-icon></router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Iphone, Message, InfoFilled, ArrowRight } from '@element-plus/icons-vue'
import AppLogo from '@/components/AppLogo.vue'
import { useAuthStore } from '@/stores/auth'
import { DEMO_ACCOUNTS, ROLE_META } from '@/data/menus'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const mode = ref('account')
const account = ref('admin')
const password = ref('admin123')
const remember = ref(true)
const phone = ref('18700002233')
const code = ref('')
const counting = ref(0)
let timer = null

function roleShort(role) { return ROLE_META[role]?.short || '农' }

function target(user) {
  if (user.role === 'consumer') return '/mall'
  return '/admin/dashboard'
}
function afterLogin(user) {
  const redirect = route.query.redirect
  let to = redirect ? String(redirect) : target(user)
  if (to.startsWith('/admin') && user.role === 'consumer') to = '/mall'
  router.replace(to)
}

async function submitAccount() {
  if (!account.value.trim()) return ElMessage.warning('请输入账号')
  if (!password.value) return ElMessage.warning('请输入密码')
  try {
    const user = await auth.login(account.value.trim(), password.value)
    if (remember.value) localStorage.setItem('agri_vue_remember', account.value.trim())
    ElMessage.success(`欢迎回来，${user.name}`)
    afterLogin(user)
  } catch (err) {
    ElMessage.error(err.message || '登录失败，请检查账号密码')
  }
}
async function submitCode() {
  if (!/^1[3-9]\d{9}$/.test(phone.value)) return ElMessage.warning('请输入正确的 11 位手机号')
  if (!/^\d{4,6}$/.test(code.value)) return ElMessage.warning('请输入验证码')
  try {
    const user = await auth.loginCode(phone.value, code.value)
    ElMessage.success(`登录成功，${user.name}`)
    afterLogin(user)
  } catch (err) {
    ElMessage.error(err.message || '验证码不正确')
  }
}
async function sendCode() {
  if (!/^1[3-9]\d{9}$/.test(phone.value)) return ElMessage.warning('请输入正确的 11 位手机号')
  try {
    const res = await auth.sendCode(phone.value)
    counting.value = 60
    timer = setInterval(() => {
      counting.value -= 1
      if (counting.value <= 0) { clearInterval(timer); timer = null }
    }, 1000)
    ElMessage.success(`验证码已发送（演示码 ${res?.demoCode || '8888'}）`)
    if (res?.demoCode) code.value = res.demoCode
  } catch (err) {
    ElMessage.error(err.message || '发送失败，请稍后重试')
  }
}
function quick(d) {
  const user = auth.quick(d.account)
  if (!user) return ElMessage.warning('快捷登录失败')
  ElMessage.success(`已以「${d.label}」身份进入`)
  afterLogin(user)
}
function forgot() { ElMessage.info('演示环境请使用页面下方的角色快捷体验登录。') }

onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.login-page { min-height: 100vh; display: grid; grid-template-columns: 1.12fr .88fr; background-image: var(--theme-gradient); background-size: cover; }
.login-aside { position: relative; overflow: hidden; padding: 32px 46px 26px; background: linear-gradient(145deg, #b7d7a8 0%, #cde8c7 100%); color: #2f5238; display: flex; flex-direction: column; }
.login-aside::before { content: ""; position: absolute; right: -180px; top: -240px; width: 640px; height: 640px; border-radius: 50%; background: radial-gradient(circle, rgba(255, 255, 255, .5), transparent 66%); }
.login-aside::after { content: ""; position: absolute; left: -160px; bottom: -220px; width: 460px; height: 460px; border-radius: 50%; border: 1px dashed rgba(31, 53, 38, .14); }
.la-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; position: relative; z-index: 1; }
.la-version { font-size: 9.5px; letter-spacing: .6px; color: #4a6353; border: 1px solid rgba(31, 53, 38, .18); border-radius: 20px; padding: 3px 10px; }
.la-copy { position: relative; z-index: 1; margin: 52px 0 0; max-width: 520px; }
.kicker { font-size: 9.5px; letter-spacing: 2.4px; color: #4f8b5a; }
.la-copy h1 { font-size: 42px; line-height: 1.28; letter-spacing: .5px; color: #1f3526; margin: 13px 0 14px; }
.la-copy h1 em { font-style: normal; color: #2f7a3f; position: relative; }
.la-copy h1 em::after { content: ""; position: absolute; left: 0; right: 0; bottom: 3px; height: 9px; background: rgba(79, 139, 90, .22); border-radius: 6px; }
.la-copy > p { font-size: 12.5px; line-height: 1.95; color: #3f5c46; max-width: 440px; }
.la-points { display: flex; flex-direction: column; gap: 12px; margin-top: 26px; }
.la-points > div { display: flex; align-items: center; gap: 11px; }
.la-points > div > span { width: 36px; height: 36px; border-radius: 10px; background: rgba(255, 255, 255, .55); border: 1px solid rgba(31, 53, 38, .1); display: grid; place-items: center; font-size: 17px; flex: 0 0 36px; }
.la-points b { display: block; font-size: 12px; color: #1f3526; }
.la-points small { font-size: 10.5px; color: #4a6353; }
.la-stats { display: flex; gap: 34px; margin-top: 34px; padding-top: 22px; border-top: 1px solid rgba(31, 53, 38, .14); }
.la-stats b { display: block; font-size: 24px; color: #1f3526; letter-spacing: -.5px; }
.la-stats b small { font-size: 11px; color: #4a6353; font-weight: 400; margin-left: 1px; }
.la-stats span { font-size: 9.5px; color: #4a6353; }
.la-visual { position: absolute; right: 42px; bottom: 104px; width: 240px; height: 240px; display: grid; place-items: center; }
.lv-emoji { font-size: 126px; filter: drop-shadow(0 16px 22px rgba(31, 53, 38, .22)); position: relative; z-index: 2; }
.lv-ring { position: absolute; border-radius: 50%; border: 1px dashed rgba(31, 53, 38, .18); }
.lv-ring.r1 { width: 230px; height: 230px; }
.lv-ring.r2 { width: 290px; height: 290px; border-color: rgba(31, 53, 38, .1); }
.lv-chip { position: absolute; z-index: 3; background: rgba(255,255,255,.93); color: #2b4b33; font-size: 10px; border-radius: 20px; padding: 5px 10px; box-shadow: 0 10px 24px rgba(0,0,0,.14); }
.lv-chip.c1 { left: -18px; top: 38px; animation: float 5s ease-in-out infinite; }
.lv-chip.c2 { right: -30px; top: 112px; animation: float 6s ease-in-out infinite reverse; }
.lv-chip.c3 { left: 6px; bottom: 34px; animation: float 7s ease-in-out infinite; }
@keyframes float { 50% { transform: translateY(-7px); } }
.la-foot { margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 12px; position: relative; z-index: 1; font-size: 10px; color: #4a6353; padding-top: 20px; }
.la-foot a { color: #2f5238; }
.la-foot a:hover { color: #1f3526; }
.login-main { display: flex; align-items: center; justify-content: center; padding: 30px 24px; }
.lm-card { width: 100%; max-width: 446px; background: #fff; border: 1px solid var(--line); border-radius: 22px; padding: 28px 30px 22px; box-shadow: 0 24px 60px rgba(30, 55, 35, .1); }
.lm-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.lm-head h2 { font-size: 25px; margin: 4px 0 2px; letter-spacing: .3px; }
.lm-head p { font-size: 11px; color: var(--ink-400); }
.lm-status { display: inline-flex; align-items: center; gap: 5px; font-size: 9.5px; color: var(--ink-400); background: #f7f8f4; border: 1px solid var(--line); border-radius: 20px; padding: 3px 9px; flex: 0 0 auto; }
.lm-status i { width: 5px; height: 5px; border-radius: 50%; background: #c9a25a; }
.lm-status.online { color: #47724a; background: #f0f8eb; border-color: #d7ecd0; }
.lm-status.online i { background: #4f9a5b; }
.login-tabs { display: flex; gap: 4px; margin: 20px 0 16px; border-bottom: 1px solid var(--line); }
.login-tabs button { position: relative; border: none; background: transparent; padding: 8px 12px 11px; font-size: 13px; color: var(--ink-400); cursor: pointer; }
.login-tabs button.on { color: var(--brand-700); font-weight: 600; }
.login-tabs button.on::after { content: ""; position: absolute; left: 10px; right: 10px; bottom: -1px; height: 2px; border-radius: 2px; background: var(--brand-600); }
.login-form { display: flex; flex-direction: column; gap: 13px; }
.field > span { display: block; font-size: 11.5px; color: var(--ink-700); margin-bottom: 5px; }
.field :deep(.el-input__wrapper) { border-radius: 10px; }
.form-extra { display: flex; align-items: center; justify-content: space-between; margin-top: -3px; }
.form-extra :deep(.el-checkbox__label) { font-size: 11px; }
.form-extra button { border: none; background: transparent; font-size: 10.5px; color: var(--brand-600); cursor: pointer; padding: 0; }
.submit { width: 100%; height: 43px; border-radius: 22px; font-size: 14px; margin-top: 3px; }
.code-row { display: flex; gap: 7px; }
.code-row :deep(.el-button) { flex: 0 0 auto; border-radius: 10px; font-size: 12px; }
.code-tip { display: flex; align-items: center; gap: 5px; font-size: 10px; color: #a58652; background: #fdf8ec; border: 1px solid #f2e7cc; border-radius: 8px; padding: 7px 9px; }
.code-tip b { color: #8a6527; }
.demo-divider { position: relative; text-align: center; margin: 22px 0 14px; font-size: 9.5px; color: var(--ink-300); }
.demo-divider::before, .demo-divider::after { content: ""; position: absolute; top: 50%; width: 30%; height: 1px; background: var(--line); }
.demo-divider::before { left: 0; }
.demo-divider::after { right: 0; }
.demo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
.demo-card { display: flex; align-items: center; gap: 8px; border: 1px solid var(--line); background: #fcfdf9; border-radius: 10px; padding: 8px 9px; cursor: pointer; text-align: left; transition: all .15s; }
.demo-card:hover { border-color: var(--brand-300); background: var(--brand-50); transform: translateY(-1px); }
.demo-card:last-child { grid-column: 1 / -1; }
.dc-avatar { width: 27px; height: 27px; border-radius: 8px; background: var(--brand-600); color: #fff; display: grid; place-items: center; font-size: 11px; flex: 0 0 27px; }
.demo-card.ops .dc-avatar { background: #3b78a8; }
.demo-card.farmer .dc-avatar { background: #5c8a43; }
.demo-card.agri .dc-avatar { background: #8a6a35; }
.demo-card.consumer .dc-avatar { background: #c28632; }
.demo-card > div { flex: 1; min-width: 0; }
.demo-card b { display: block; font-size: 10.5px; }
.demo-card small { display: block; font-size: 8.5px; color: var(--ink-400); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dc-arrow { font-size: 10px; color: var(--ink-300); }
.login-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 18px; padding-top: 14px; border-top: 1px solid #f0f3ea; font-size: 9px; color: var(--ink-300); flex-wrap: wrap; }
.login-foot a { display: inline-flex; align-items: center; gap: 2px; color: var(--brand-600); }
@media (max-width: 1000px) {
  .login-page { grid-template-columns: 1fr; }
  .login-aside { display: none; }
  .login-main { min-height: 100vh; padding: 24px 18px; }
}
@media (max-width: 480px) {
  .lm-card { padding: 22px 18px 18px; border-radius: 18px; }
  .demo-grid { grid-template-columns: 1fr; }
  .demo-card:last-child { grid-column: auto; }
  .lm-head h2 { font-size: 22px; }
  .lm-status { font-size: 8.5px; padding: 2px 7px; }
}
</style>
