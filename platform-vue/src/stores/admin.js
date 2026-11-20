import { defineStore } from 'pinia'
import DB from '@/data/db'
import { dateTime, orderNo } from '@/utils/format'

const KEY = 'agri_vue_admin_state_v2'
const clone = (v) => JSON.parse(JSON.stringify(v))

const pick = () => ({
  users: clone(DB.users),
  roles: clone(DB.roles),
  perms: clone(DB.perms),
  devices: clone(DB.devices),
  alarms: clone(DB.alarms),
  workorders: clone(DB.workorders),
  orderList: clone(DB.orders),
  goods: clone(DB.goods),
  plots: clone(DB.plots),
  inputs: clone(DB.inputs),
  traces: clone(DB.traces),
  tests: clone(DB.tests),
  reviews: clone(DB.reviews),
  repairs: clone(DB.repairs),
  backups: clone(DB.backups),
  consults: clone(DB.consults),
  consumers: clone(DB.consumers),
  logs: clone(DB.logs),
  apis: clone(DB.apis),
  dicts: clone(DB.dicts),
  harvests: clone(DB.harvests),
  strategies: clone(DB.strategies),
  timers: clone(DB.timers),
  controlLogs: clone(DB.controlLogs),
  pestCases: clone(DB.pestCases),
  techPlans: clone(DB.techPlans),
  supervise: clone(DB.supervise),
  threshold: { temp: 30, humidity: 35, oxygen: 4.5, repeat: 3, sms: true },
  permissions: clone(DB.perms)
})

const read = () => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return pick()
    return { ...pick(), ...JSON.parse(raw) }
  } catch { return pick() }
}

export const useAdminStore = defineStore('admin', {
  state: () => read(),
  getters: {
    onlineDevices: (s) => s.devices.filter(d => d.online === 1),
    openAlarms: (s) => s.alarms.filter(a => a.status !== '已闭环' && a.status !== '已处置'),
    pendingOrders: (s) => s.orderList.filter(o => o.status === '待发货'),
    lowStock: (s) => s.inputs.filter(i => i.stock <= i.min),
    todaySales: (s) => s.orderList.filter(o => o.pay === '已支付').reduce((a, b) => a + b.amount, 0)
  },
  actions: {
    save() {
      const data = {}
      for (const k of Object.keys(pick())) data[k] = this[k]
      try { localStorage.setItem(KEY, JSON.stringify(data)) } catch {}
    },
    resetDemo() {
      Object.assign(this, pick())
      this.save()
    },
    add(collection, item) {
      this[collection].unshift(item)
      this.save()
    },
    update(collection, id, patch) {
      const arr = this[collection]
      const item = arr.find(x => x.id === id || x.no === id || x.code === id)
      if (item) Object.assign(item, patch)
      this.save()
      return item
    },
    remove(collection, id) {
      this[collection] = this[collection].filter(x => x.id !== id && x.no !== id && x.code !== id)
      this.save()
    },
    addUser(payload) {
      const user = { id: 'U' + Date.now(), status: '启用', last: dateTime(), ...payload }
      this.users.unshift(user)
      this.save()
      return user
    },
    deleteUser(id) { this.remove('users', id) },
    toggleUser(id) {
      const u = this.users.find(x => x.id === id)
      if (u) u.status = u.status === '启用' ? '停用' : '启用'
      this.save()
      return u
    },
    shipOrder(no, company, tracking) {
      const o = this.orderList.find(x => x.no === no)
      if (!o) return
      o.status = '已发货'
      o.logistics = { company, tracking, time: dateTime() }
      this.save()
      return o
    },
    confirmDelivered(no) {
      const o = this.orderList.find(x => x.no === no)
      if (o) o.status = '已完成'
      this.save()
    },
    handleAlarm(id, note, status = '已处置') {
      const a = this.alarms.find(x => x.id === id)
      if (a) { a.status = status; a.note = note; a.handledAt = dateTime(); a.handler = '谭' }
      this.save()
      return a
    },
    controlDevice(id, action) {
      const d = this.devices.find(x => x.id === id)
      if (!d) return
      d.status = action === 'on' ? '运行' : '停止'
      d.value = action === 'on' ? '设备运行中' : '设备已关闭'
      d.last = dateTime()
      this.logs.unshift({ time: dateTime(), user: '当前用户', role: '运维', ip: '10.20.0.9', action: `${action === 'on' ? '开启' : '关闭'} ${d.name}`, type: '操作日志', result: '成功' })
      this.save()
      return d
    },
    addWorkorder(payload) {
      const wo = {
        id: 'WO-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + String(this.workorders.length + 1).padStart(2, '0'),
        status: '待执行', progress: 0, hours: 0, material: '—', ...payload
      }
      this.workorders.unshift(wo)
      this.save()
      return wo
    },
    checkInWorkorder(id, progress = 20, hours = 0.5) {
      const w = this.workorders.find(x => x.id === id)
      if (!w) return
      w.progress = Math.min(100, w.progress + progress)
      w.hours = +(w.hours + hours).toFixed(1)
      w.status = w.progress >= 100 ? '已完成' : '执行中'
      this.save()
      return w
    },
    completeWorkorder(id) {
      const w = this.workorders.find(x => x.id === id)
      if (w) { w.progress = 100; w.status = '已完成' }
      this.save()
    },
    replyReview(id, reply) {
      const r = this.reviews.find(x => x.id === id)
      if (r) { r.reply = reply; r.status = '已回复' }
      this.save()
    },
    removeReview(id) { this.remove('reviews', id) },
    warnConsumer(id) {
      const c = this.consumers.find(x => x.id === id)
      if (c) { c.warn = (c.warn || 0) + 1; c.status = c.warn >= 3 ? '已限制' : '已警告' }
      this.save()
    },
    banConsumer(id) {
      const c = this.consumers.find(x => x.id === id)
      if (c) c.status = '已限制'
      this.save()
    },
    auditGoods(id, status) {
      const g = this.goods.find(x => x.id === id)
      if (g) g.audit = status
      this.save()
    },
    addGoods(payload) {
      const g = { id: 'SP-' + String(this.goods.length + 1).padStart(3, '0'), sold: 0, audit: '待审核', ...payload }
      this.goods.unshift(g)
      this.save()
      return g
    },
    addRepair(payload) {
      const r = { id: 'RP-' + Date.now().toString().slice(-4), status: '待接单', time: dateTime(), assignee: '—', ...payload }
      this.repairs.unshift(r)
      this.save()
      return r
    },
    assignRepair(id) {
      const r = this.repairs.find(x => x.id === id)
      if (r) { r.status = '维修中'; r.assignee = '谭' }
      this.save()
    },
    finishRepair(id) {
      const r = this.repairs.find(x => x.id === id)
      if (r) r.status = '已完成'
      this.save()
    },
    addBackup() {
      const b = { id: 'BK-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''), name: '手动备份', size: '86.6 MB', type: '手动', time: dateTime(), status: '成功' }
      this.backups.unshift(b)
      this.save()
      return b
    },
    replyConsult(id, reply) {
      this.sendConsultMessage(id, 'expert', reply)
    },
    /* 农艺 / 农户共用一条会话线程，双方都能持续对话 */
    sendConsultMessage(id, from, text) {
      const c = this.consults.find(x => x.id === id)
      if (!c || !text) return null
      if (!c.messages) c.messages = []
      c.messages.push({ from, text, time: dateTime() })
      if (from === 'expert') {
        c.reply = text
        c.status = '已回复'
      } else {
        c.status = '待回复'
        c.content = c.content || text
      }
      this.save()
      return c
    },
    addConsult(payload) {
      const time = dateTime()
      const c = {
        id: 'CS-' + Date.now().toString().slice(-4),
        status: '待回复',
        reply: '',
        time,
        messages: [{ from: 'farmer', text: payload.content, time }],
        ...payload
      }
      this.consults.unshift(c)
      this.save()
      return c
    },
    addPestCase(payload) {
      const p = { id: 'PC-' + Date.now().toString().slice(-4), status: '待复核', time: dateTime(), ...payload }
      this.pestCases.unshift(p)
      this.save()
      return p
    },
    addTechPlan(payload) {
      const p = { id: 'TP-' + Date.now().toString().slice(-4), status: '草稿', time: dateTime().slice(0, 10), ...payload }
      this.techPlans.unshift(p)
      this.save()
      return p
    },
    updateThreshold(patch) { Object.assign(this.threshold, patch); this.save() },
    toggleStrategy(id) {
      const s = this.strategies.find(x => x.id === id)
      if (s) s.on = s.on ? 0 : 1
      this.save()
    },
    toggleTimer(id) {
      const t = this.timers.find(x => x.id === id)
      if (t) t.on = t.on ? 0 : 1
      this.save()
    }
  }
})
