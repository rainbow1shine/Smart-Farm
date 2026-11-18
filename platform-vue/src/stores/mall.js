import { defineStore } from 'pinia'
import DB from '@/data/db'
import { useAuthStore } from '@/stores/auth'
import { api, isOnline, getToken } from '@/api/client'
import { orderNo, dateTime } from '@/utils/format'

/* 每个账号独立保存，避免新注册用户看到别人的订单 / 消息 */
const K = {
  orders: 'agri_vue_orders_v3',
  msg: 'agri_vue_msg_v3',
  fav: 'agri_vue_fav_v3',
  addr: 'agri_vue_addr_v3',
  after: 'agri_vue_after_v3',
  reviews: 'agri_vue_reviews_v3'
}
const DEMO_ACCOUNT = '18700002233'
const FARMER_ACCOUNT = 'farmer01'

const read = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
const write = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }
const currentAccount = () => useAuthStore().user?.account || 'guest'

const seedOrders = () => (DB.mallOrders || []).map(o => ({
  ...o,
  account: DEMO_ACCOUNT,
  items: DB.orderItems?.[o.no] || [],
  receiver: '王双红',
  phone: '187****2233',
  pay: '微信支付',
  delivery: '产地直发 · 冷链配送',
  reviewed: false,
  timeline: orderTimeline(o)
}))

function orderTimeline(o) {
  const base = [
    { text: '订单已提交', time: o.time, done: true },
    { text: '支付成功', time: o.time, done: true }
  ]
  if (['运输中', '待收货', '待评价', '已完成'].includes(o.status)) base.push({ text: '农户已发货', time: '2026-11-09 07:20', done: true })
  if (['待收货', '待评价', '已完成'].includes(o.status)) base.push({ text: '快件运输中', time: '2026-11-09 18:40', done: true })
  if (['待评价', '已完成'].includes(o.status)) base.push({ text: '已签收', time: '2026-11-10 09:30', done: true })
  return base
}

function seedBooks() {
  return {
    orders: { [DEMO_ACCOUNT]: seedOrders() },
    msg: { [DEMO_ACCOUNT]: JSON.parse(JSON.stringify(DB.messages)) },
    fav: { [DEMO_ACCOUNT]: ['SP-001', 'SP-003'] },
    addr: {
      [DEMO_ACCOUNT]: [
        { id: 'A1', name: '王双红', phone: '187****2233', region: '重庆市 渝北区', detail: '龙湖天街 3 栋 1201', tag: '家', def: true },
        { id: 'A2', name: '王双红', phone: '187****2233', region: '重庆市 南岸区', detail: '南泉街道工程学院菜鸟驿站', tag: '学校', def: false }
      ]
    },
    after: { [DEMO_ACCOUNT]: JSON.parse(JSON.stringify(DB.afterSales || [])) }
  }
}

const bookOr = (key, fallback) => read(key, null) || fallback

export const useMallStore = defineStore('mall', {
  state: () => {
    const seed = seedBooks()
    return {
      orderBook: bookOr(K.orders, seed.orders),
      msgBook: bookOr(K.msg, seed.msg),
      favBook: bookOr(K.fav, seed.fav),
      addrBook: bookOr(K.addr, seed.addr),
      afterBook: bookOr(K.after, seed.after),
      reviews: read(K.reviews, null) || JSON.parse(JSON.stringify(DB.reviews || [])),
      lastOrder: null
    }
  },
  getters: {
    account: () => currentAccount(),
    orders: (s) => s.orderBook[currentAccount()] || [],
    messages: (s) => s.msgBook[currentAccount()] || [],
    favorites: (s) => s.favBook[currentAccount()] || [],
    addresses: (s) => s.addrBook[currentAccount()] || [],
    afterSales: (s) => s.afterBook[currentAccount()] || [],
    allOrders: (s) => Object.values(s.orderBook).flat().slice().sort((a, b) => String(b.time).localeCompare(String(a.time))),
    allAfterSales: (s) => Object.values(s.afterBook).flat().slice().sort((a, b) => String(b.time).localeCompare(String(a.time))),
    unreadCount: (s) => (s.msgBook[currentAccount()] || []).filter(m => !m.read).length,
    favoriteGoods: (s) => (s.favBook[currentAccount()] || []).map(id => DB.goods.find(g => g.id === id)).filter(Boolean),
    orderCounts: (s) => {
      const list = s.orderBook[currentAccount()] || []
      const c = { all: list.length, 待付款: 0, 待发货: 0, 运输中: 0, 待收货: 0, 待评价: 0, 已完成: 0, 已取消: 0, 售后中: 0 }
      list.forEach(o => { c[o.status] = (c[o.status] || 0) + 1 })
      c.售后中 = (s.afterBook[currentAccount()] || []).filter(a => a.status === '待处理').length
      return c
    },
    defaultAddress: (s) => {
      const list = s.addrBook[currentAccount()] || []
      return list.find(a => a.def) || list[0] || null
    }
  },
  actions: {
    arr(book, acc = currentAccount()) {
      if (!this[book][acc]) this[book][acc] = []
      return this[book][acc]
    },
    persist() {
      write(K.orders, this.orderBook)
      write(K.msg, this.msgBook)
      write(K.fav, this.favBook)
      write(K.addr, this.addrBook)
      write(K.after, this.afterBook)
      write(K.reviews, this.reviews)
    },
    isFavorite(id) { return this.favorites.includes(id) },
    toggleFavorite(id) {
      const list = this.arr('favBook')
      const i = list.indexOf(id)
      if (i > -1) list.splice(i, 1)
      else list.push(id)
      this.persist()
      return i === -1
    },
    addMessage(msg, account = currentAccount()) {
      this.arr('msgBook', account).unshift({ id: 'M' + Date.now() + Math.random().toString(16).slice(2, 6), time: '刚刚', read: false, ...msg })
      this.persist()
    },
    readMessage(id) {
      const m = this.messages.find(x => x.id === id)
      if (m) m.read = true
      this.persist()
    },
    readAllMessages() { this.arr('msgBook').forEach(m => { m.read = true }); this.persist() },
    addAddress(addr) {
      const list = this.arr('addrBook')
      if (addr.def) list.forEach(a => { a.def = false })
      const item = { ...addr, id: 'A' + Date.now() }
      list.push(item)
      this.persist()
      return item
    },
    updateAddress(id, patch) {
      const list = this.arr('addrBook')
      const a = list.find(x => x.id === id)
      if (a) Object.assign(a, patch)
      if (patch.def) list.forEach(x => { if (x.id !== id) x.def = false })
      this.persist()
    },
    removeAddress(id) {
      const acc = currentAccount()
      this.addrBook[acc] = (this.addrBook[acc] || []).filter(a => a.id !== id)
      if (this.addrBook[acc].length && !this.addrBook[acc].some(a => a.def)) this.addrBook[acc][0].def = true
      this.persist()
    },
    createOrder(payload) {
      const items = payload.items.map(it => {
        const g = DB.goods.find(x => x.id === it.id)
        return { id: it.id, qty: it.qty, name: g.name, price: g.price, icon: g.icon, spec: g.spec }
      })
      const subtotal = items.reduce((a, b) => a + b.price * b.qty, 0)
      const shipping = payload.shipping ?? (subtotal >= 59 ? 0 : 6)
      const discount = payload.discount || 0
      const order = {
        no: orderNo(),
        account: currentAccount(),
        items,
        goods: items.map(i => `${i.name} × ${i.qty}`).join('、'),
        amount: +(subtotal + shipping - discount).toFixed(2),
        subtotal,
        shipping,
        discount,
        status: '待发货',
        time: dateTime(),
        addr: `${payload.region || ''} ${payload.address || ''}`.trim(),
        receiver: payload.receiver,
        phone: payload.phone,
        pay: payload.pay || '微信支付',
        delivery: payload.delivery || '产地直发 · 冷链配送',
        remark: payload.remark || '',
        reviewed: false,
        synced: false,
        timeline: [
          { text: '订单已提交', time: dateTime(), done: true },
          { text: '支付成功', time: dateTime(), done: true },
          { text: '农户备货中', time: dateTime(), done: true }
        ]
      }
      this.arr('orderBook').unshift(order)
      this.lastOrder = order
      this.addMessage({ type: '订单', title: '下单成功', text: `订单 ${order.no} 已创建，农户正在备货。` })
      /* 通知农户接单（农户端只接收自己的待发货提醒） */
      this.addMessage({ type: '订单', title: '新订单待发货', text: `${order.receiver} 下单「${order.goods}」，金额 ¥${order.amount.toFixed(2)}，请及时采摘发货。` }, FARMER_ACCOUNT)
      this.persist()
      if (isOnline() && getToken()) {
        api.createOrder({
          items: payload.items,
          addr: order.addr,
          receiver: order.receiver,
          phone: order.phone,
          remark: order.remark,
          payMethod: order.pay
        }).then(remote => {
          order.no = remote.no || order.no
          order.amount = remote.amount ?? order.amount
          order.synced = true
          this.persist()
        }).catch(err => { order.syncError = err.message; this.persist() })
      }
      return order
    },
    findOrder(no) { return this.orders.find(o => o.no === no) },
    updateStatus(no, status) {
      const o = this.findOrder(no)
      if (!o) return
      o.status = status
      if (status === '已取消') o.timeline.push({ text: '订单已取消', time: dateTime(), done: true })
      if (status === '已完成') o.timeline.push({ text: '订单已完成', time: dateTime(), done: true })
      if (status === '待评价') o.timeline.push({ text: '已签收', time: dateTime(), done: true })
      this.persist()
      if (isOnline() && getToken()) {
        api.updateOrder(no, status).catch(() => {})
      }
    },
    /* 农户端发货：改状态、写物流、通知下单的消费者 */
    shipOrder(no, company, tracking) {
      let owner = ''
      let order = null
      Object.keys(this.orderBook).forEach(acc => {
        const hit = (this.orderBook[acc] || []).find(o => o.no === no)
        if (hit) { owner = acc; order = hit }
      })
      if (!order) return null
      order.status = '运输中'
      order.logistics = { company, tracking, time: dateTime() }
      order.timeline = [...(order.timeline || []), { text: `农户已发货 · ${company}`, time: dateTime(), done: true }]
      this.addMessage({ type: '订单', title: '农户已发货', text: `订单 ${no} 已由产地发出（${company} ${tracking}），预计次日送达。` }, owner)
      this.persist()
      return order
    },
    /* 农户端完成订单 */
    finishOrder(no) {
      let owner = ''
      let order = null
      Object.keys(this.orderBook).forEach(acc => {
        const hit = (this.orderBook[acc] || []).find(o => o.no === no)
        if (hit) { owner = acc; order = hit }
      })
      if (!order) return null
      order.status = '已完成'
      order.timeline = [...(order.timeline || []), { text: '买家已签收，订单完成', time: dateTime(), done: true }]
      this.addMessage({ type: '订单', title: '订单已完成', text: `订单 ${no} 已签收完成，感谢你的信任。` }, owner)
      this.persist()
      return order
    },
    addReview({ orderNo, goods, goodsId, stars, text, user }) {
      const rec = {
        id: 'RV-' + Date.now(),
        orderNo,
        goods,
        goodsId,
        user: user || '商城用户',
        stars,
        text: text || '（未填写文字评价）',
        time: dateTime().slice(5),
        reply: '',
        status: '待回复'
      }
      const o = this.findOrder(orderNo)
      if (o) { o.status = '已完成'; o.reviewed = true }
      this.reviews.unshift(rec)
      this.addMessage({ type: '评价', title: '评价已提交', text: `你对「${goods}」的评价已送达农户。` })
      this.persist()
      if (isOnline() && getToken()) {
        api.createReview({ goods, stars, text, orderNo }).catch(() => {})
      }
      return rec
    },
    /* ===== 售后 ===== */
    applyAfterSale({ orderNo, types, reason, amount }) {
      const order = this.findOrder(orderNo)
      const rec = {
        id: 'AS-' + Date.now().toString().slice(-8),
        orderNo,
        user: useAuthStore().user?.name || '商城用户',
        account: currentAccount(),
        goods: order?.goods || '—',
        type: types,
        amount: amount || 0,
        reason,
        status: '待处理',
        time: dateTime(),
        handleNote: '',
        handleTime: ''
      }
      this.arr('afterBook').unshift(rec)
      this.addMessage({ type: '订单', title: '售后申请已提交', text: `订单 ${orderNo} 的「${types}」申请已提交，农户会在 24 小时内处理。` })
      this.addMessage({ type: '订单', title: '新的售后申请', text: `${rec.user} 对订单 ${orderNo} 申请「${types}」，请尽快处理。` }, FARMER_ACCOUNT)
      this.persist()
      return rec
    },
    cancelAfterSale(id) {
      const list = this.arr('afterBook')
      const i = list.findIndex(a => a.id === id)
      if (i > -1) list.splice(i, 1)
      this.persist()
    },
    handleAfterSale(id, status, note = '') {
      let rec = null
      Object.keys(this.afterBook).forEach(acc => {
        const hit = (this.afterBook[acc] || []).find(a => a.id === id)
        if (hit) rec = hit
      })
      if (!rec) return null
      rec.status = status
      rec.handleNote = note
      rec.handleTime = dateTime()
      const text = status === '已同意'
        ? `你的售后申请（订单 ${rec.orderNo}）已通过，退款 ¥${Number(rec.amount).toFixed(2)} 将在 1-3 个工作日到账。`
        : `你的售后申请（订单 ${rec.orderNo}）未通过${note ? '：' + note : '，如有疑问可联系农户。'}`
      this.addMessage({ type: '订单', title: `售后${status}`, text }, rec.account)
      this.persist()
      return rec
    }
  }
})

export const orderStatusForFarmer = (o) => {
  if (o.status === '待发货') return '待发货'
  if (['运输中', '待收货'].includes(o.status)) return '已发货'
  if (['待评价', '已完成'].includes(o.status)) return '已完成'
  return o.status
}

export const DEMO_MALL_ACCOUNT = DEMO_ACCOUNT
export const FARMER_MALL_ACCOUNT = FARMER_ACCOUNT
