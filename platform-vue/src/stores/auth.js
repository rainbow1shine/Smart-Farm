/**
 * ============================================================
 * 登录认证 Store —— 管理当前用户登录态
 * ------------------------------------------------------------
 * 讲解重点：
 *   1. 双模式自动切换（后端在线 → 调 API / 离线 → 演示账号）
 *   2. localStorage 持久化登录态（刷新不丢）
 *   3. JWT Token 存储（演示环境为空）
 *   4. init() 启动时自动恢复登录态 + 校验 Token 有效性
 * ============================================================
 */
import { defineStore } from 'pinia'
import { api, checkHealth, getToken, setToken, getSavedUser, saveUser, isOnline } from '@/api/client'
import { DEMO_ACCOUNTS, ROLE_META } from '@/data/menus'

const LOCAL_KEY = 'agri_vue_local_user'

// 根据预设账号生成本地演示用户（后端不可用时的降级方案）
function localUser(account) {
  const preset = DEMO_ACCOUNTS.find(a => a.account.toLowerCase() === String(account).toLowerCase())
  if (!preset) return null
  const meta = ROLE_META[preset.role]
  const names = { admin: '龙管理', ops: '王运维', farmer: '吴农户', agri: '张农艺', consumer: '朱消费' }
  const accountNames = { twt: '谭管理', '18700002233': '王双红' }
  return {
    id: 'L-' + preset.role,
    account: preset.account,
    name: accountNames[preset.account] || names[preset.role],
    role: preset.role,
    phone: preset.role === 'consumer' ? '18700002233' : '138****' + (1000 + preset.role.length),
    park: preset.role === 'consumer' ? '—' : '永川智慧农业示范园',
    avatar: meta.short,
    local: true
  }
}

// ⭐ Pinia Store —— 登录认证中心（Vue 3 官方推荐，比 Vuex 更简洁）
export const useAuthStore = defineStore('auth', {
  /**
   * state —— 核心状态
   *   user    当前登录用户对象（从 localStorage 恢复）
   *   token   JWT Token（演示环境为空字符串）
   *   online  后端是否在线（影响登录模式选择）
   *   ready   是否初始化完成（路由守卫会等它）
   *   loading 登录按钮 loading 状态
   */
  state: () => ({
    user: getSavedUser(),    // 启动时从 localStorage 自动恢复
    token: getToken(),       // JWT Token（演示环境为空）
    online: false,           // 后端是否在线
    ready: false,            // 是否初始化完成（路由守卫会等它）
    loading: false           // 登录按钮 loading
  }),

  /**
   * getters —— 便捷计算属性，避免组件里反复写 user?.role
   */
  getters: {
    role: (s) => s.user?.role || '',
    roleMeta: (s) => ROLE_META[s.user?.role] || ROLE_META.consumer,
    isLogged: (s) => !!s.user,          // 布尔值，方便模板里 v-if
    isConsumer: (s) => s.user?.role === 'consumer'
  },

  actions: {
    // 启动时调用：检测后端 + 恢复登录态 + 校验 Token
    async init() {
      this.online = await checkHealth(true)
      this.user = getSavedUser()
      this.token = getToken()
      // 有 Token 且在线 → 调 api.me() 校验有效性
      if (this.online && this.token) {
        try {
          const me = await api.me()
          this.user = { ...this.user, ...me, role: me.role || this.user.role, avatar: ROLE_META[me.role]?.short || '农' }
          saveUser(this.user)
        } catch {
          // Token 无效 → 清除，下次登录
          this.token = ''
          setToken('')
        }
      }
      this.ready = true
    },

    // ⭐ 双模式登录：在线调 API，离线降级用演示账号
    async login(account, password) {
      this.loading = true
      try {
        if (!account || !password) throw new Error('请输入账号和密码')

        if (this.online) {
          // ① 后端在线 → 尝试真实 API
          try {
            const data = await api.login(account, password)
            this.applyRemote(data)
            return this.user
          } catch (err) {
            // API 失败 → 降级到本地演示
            const fallback = localUser(account)
            if (!fallback || password !== DEMO_ACCOUNTS.find(a => a.account.toLowerCase() === String(account).toLowerCase())?.password) throw err
          }
        }

        // ② 离线或降级成功 → 用预设账号登录（DEMO_ACCOUNTS 定义在 menus.js）
        const fallback = localUser(account)
        if (!fallback) throw new Error('账号或密码不正确')
        const preset = DEMO_ACCOUNTS.find(a => a.account.toLowerCase() === String(account).toLowerCase())
        if (password !== preset.password) throw new Error('账号或密码不正确')
        this.user = fallback
        this.token = ''
        saveUser(this.user)     // 💾 持久化到 localStorage
        localStorage.setItem(LOCAL_KEY, '1')
        return this.user
      } finally {
        this.loading = false
      }
    },

    // 手机号验证码登录（消费者端），同样是双模式
    async loginCode(phone, code) {
      this.loading = true
      try {
        // 手机号正则：1开头 + 3-9第二位 + 9位数字
        if (!/^1[3-9]\d{9}$/.test(phone)) throw new Error('请输入正确的 11 位手机号')
        if (!/^\d{4,6}$/.test(code)) throw new Error('请输入正确的验证码')
        if (this.online) {
          try {
            const data = await api.loginCode(phone, code)
            this.applyRemote(data)
            return this.user
          } catch (err) {
            if (code !== '8888') throw err
          }
        } else if (code !== '8888') {
          throw new Error('验证码不正确（演示环境固定为 8888）')
        }
        this.user = {
          id: 'C-' + phone.slice(-4),
          account: phone,
          name: '客' + phone.slice(-4),
          role: 'consumer',
          phone,
          park: '—',
          avatar: '客',
          local: true
        }
        this.token = ''
        saveUser(this.user)
        return this.user
      } finally {
        this.loading = false
      }
    },

    async sendCode(phone) {
      if (!/^1[3-9]\d{9}$/.test(phone)) throw new Error('请输入正确的 11 位手机号')
      if (this.online) {
        return api.sendCode(phone)
      }
      return { message: '验证码已发送', demoCode: '8888' }
    },

    // 在线登录成功 → 应用后端返回的 token + user
    applyRemote(data) {
      this.token = data.token
      setToken(data.token)
      this.user = { ...data.user, avatar: ROLE_META[data.user.role]?.short || '农' }
      saveUser(this.user)
    },

    // 快捷登录（演示用，跳过密码）
    quick(account) {
      const key = String(account || '').toLowerCase()
      const p = DEMO_ACCOUNTS.find(a => a.account.toLowerCase() === key) || DEMO_ACCOUNTS.find(a => a.role === account)
      if (!p) return null
      this.user = localUser(p.account)
      this.token = ''
      setToken('')
      saveUser(this.user)
      return this.user
    },

    // 退出登录：清空状态 + localStorage
    logout() {
      this.user = null
      this.token = ''
      setToken('')
      saveUser(null)
    },

    // 更新当前用户部分字段
    patchUser(patch) {
      this.user = { ...this.user, ...patch }
      saveUser(this.user)
    }
  }
})
