import { defineStore } from 'pinia'
import { api, checkHealth, getToken, setToken, getSavedUser, saveUser, isOnline } from '@/api/client'
import { DEMO_ACCOUNTS, ROLE_META } from '@/data/menus'

const LOCAL_KEY = 'agri_vue_local_user'

function localUser(account) {
  const preset = DEMO_ACCOUNTS.find(a => a.account.toLowerCase() === String(account).toLowerCase())
  if (!preset) return null
  const meta = ROLE_META[preset.role]
  const names = { admin: '张', ops: '谭', farmer: '龙', agri: '朱', consumer: '王双红' }
  return {
    id: 'L-' + preset.role,
    account: preset.account,
    name: names[preset.role],
    role: preset.role,
    phone: preset.role === 'consumer' ? '18700002233' : '138****' + (1000 + preset.role.length),
    park: preset.role === 'consumer' ? '—' : '永川智慧农业示范园',
    avatar: meta.short,
    local: true
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: getSavedUser(),
    token: getToken(),
    online: false,
    ready: false,
    loading: false
  }),
  getters: {
    role: (s) => s.user?.role || '',
    roleMeta: (s) => ROLE_META[s.user?.role] || ROLE_META.consumer,
    isLogged: (s) => !!s.user,
    isConsumer: (s) => s.user?.role === 'consumer'
  },
  actions: {
    async init() {
      this.online = await checkHealth(true)
      this.user = getSavedUser()
      this.token = getToken()
      if (this.online && this.token) {
        try {
          const me = await api.me()
          this.user = { ...this.user, ...me, role: me.role || this.user.role, avatar: ROLE_META[me.role]?.short || '农' }
          saveUser(this.user)
        } catch {
          this.token = ''
          setToken('')
        }
      }
      this.ready = true
    },
    async login(account, password) {
      this.loading = true
      try {
        if (!account || !password) throw new Error('请输入账号和密码')
        if (this.online) {
          try {
            const data = await api.login(account, password)
            this.applyRemote(data)
            return this.user
          } catch (err) {
            const fallback = localUser(account)
            if (!fallback || password !== DEMO_ACCOUNTS.find(a => a.role === fallback.role)?.password) throw err
          }
        }
        const fallback = localUser(account)
        if (!fallback) throw new Error('账号或密码不正确')
        const preset = DEMO_ACCOUNTS.find(a => a.role === fallback.role)
        if (password !== preset.password) throw new Error('账号或密码不正确')
        this.user = fallback
        this.token = ''
        saveUser(this.user)
        localStorage.setItem(LOCAL_KEY, '1')
        return this.user
      } finally {
        this.loading = false
      }
    },
    async loginCode(phone, code) {
      this.loading = true
      try {
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
    applyRemote(data) {
      this.token = data.token
      setToken(data.token)
      this.user = {
        ...data.user,
        avatar: ROLE_META[data.user.role]?.short || '农'
      }
      saveUser(this.user)
    },
    quick(role) {
      const p = DEMO_ACCOUNTS.find(a => a.role === role)
      if (!p) return null
      this.user = localUser(p.account)
      this.token = ''
      setToken('')
      saveUser(this.user)
      return this.user
    },
    logout() {
      this.user = null
      this.token = ''
      setToken('')
      saveUser(null)
    },
    patchUser(patch) {
      this.user = { ...this.user, ...patch }
      saveUser(this.user)
    }
  }
})
