const TOKEN_KEY = 'agri_vue_token'
const USER_KEY = 'agri_vue_user'

let online = false
let checked = false
let healthInfo = null

export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY) || '' } catch { return '' } }
export const setToken = (t) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY) } catch {} }
export const getSavedUser = () => { try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') } catch { return null } }
export const saveUser = (u) => { try { u ? localStorage.setItem(USER_KEY, JSON.stringify(u)) : localStorage.removeItem(USER_KEY) } catch {} }

export const isOnline = () => online
export const getHealth = () => healthInfo

export async function checkHealth(force = false) {
  if (checked && !force) return online
  checked = true
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 1800)
    const res = await fetch('/api/health', { signal: ctrl.signal, cache: 'no-store' })
    clearTimeout(timer)
    const json = await res.json()
    online = !!(res.ok && json?.ok)
    healthInfo = online ? json.data : null
  } catch {
    online = false
    healthInfo = null
  }
  return online
}

async function request(path, options = {}) {
  const headers = { Accept: 'application/json', ...(options.headers || {}) }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token && options.auth !== false) headers.Authorization = `Bearer ${token}`
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), options.timeout || 8000)
  try {
    const res = await fetch(path, {
      method: options.method || 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: ctrl.signal,
      cache: 'no-store'
    })
    let json = null
    try { json = await res.json() } catch {}
    if (res.status === 401) { setToken(''); window.dispatchEvent(new CustomEvent('agri:unauthorized')) }
    if (!res.ok || !json || json.ok === false) {
      const err = new Error(json?.error?.message || `请求失败（HTTP ${res.status}）`)
      err.status = res.status
      err.code = json?.error?.code
      throw err
    }
    return json.data
  } finally {
    clearTimeout(timer)
  }
}

export const api = {
  request,
  login: (account, password) => request('/api/auth/login', { method: 'POST', body: { account, password }, auth: false }),
  loginCode: (phone, code) => request('/api/auth/login-code', { method: 'POST', body: { phone, code }, auth: false }),
  sendCode: (phone) => request('/api/auth/send-code', { method: 'POST', body: { phone }, auth: false }),
  me: () => request('/api/auth/me'),
  goods: (params = {}) => request('/api/goods?' + new URLSearchParams(params).toString()),
  goodsOne: (id) => request('/api/goods/' + encodeURIComponent(id)),
  traces: () => request('/api/traces'),
  trace: (code) => request('/api/traces/' + encodeURIComponent(code)),
  createOrder: (payload) => request('/api/orders', { method: 'POST', body: payload }),
  myOrders: () => request('/api/orders'),
  updateOrder: (no, status) => request(`/api/orders/${encodeURIComponent(no)}/status`, { method: 'PATCH', body: { status } }),
  reviews: () => request('/api/reviews'),
  createReview: (payload) => request('/api/reviews', { method: 'POST', body: payload }),
  messages: () => request('/api/messages'),
  alarms: () => request('/api/alarms'),
  handleAlarm: (id, note) => request(`/api/alarms/${encodeURIComponent(id)}/handle`, { method: 'POST', body: { note } }),
  devices: (params = {}) => request('/api/devices?' + new URLSearchParams(params).toString()),
  controlDevice: (id, action) => request(`/api/devices/${encodeURIComponent(id)}/control`, { method: 'POST', body: { action } }),
  consults: () => request('/api/consults'),
  createConsult: (payload) => request('/api/consults', { method: 'POST', body: payload }),
  dashboard: () => request('/api/dashboard')
}
