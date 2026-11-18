import { defineStore } from 'pinia'
import DB from '@/data/db'

const KEY = 'agri_vue_cart'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: read(),
    coupon: null
  }),
  getters: {
    details: (s) => s.items.map(it => {
      const goods = DB.goods.find(g => g.id === it.id)
      return goods ? { ...goods, qty: it.qty, selected: it.selected !== false } : null
    }).filter(Boolean),
    count: (s) => s.items.reduce((a, b) => a + b.qty, 0),
    selectedDetails() { return this.details.filter(d => d.selected) },
    selectedCount() { return this.selectedDetails.reduce((a, b) => a + b.qty, 0) },
    subtotal() { return this.selectedDetails.reduce((a, b) => a + b.price * b.qty, 0) },
    shipping() { const t = this.subtotal; return t === 0 || t >= 59 ? 0 : 6 },
    discount() { return this.coupon ? this.coupon.discount : 0 },
    total() { return Math.max(0, this.subtotal + this.shipping - this.discount) },
    allSelected() { return this.details.length > 0 && this.details.every(d => d.selected) }
  },
  actions: {
    save() { try { localStorage.setItem(KEY, JSON.stringify(this.items)) } catch {} },
    add(id, qty = 1, selectOnly = false) {
      const g = DB.goods.find(x => x.id === id)
      if (!g) return { ok: false, message: '商品不存在' }
      const line = this.items.find(x => x.id === id)
      const cur = line ? line.qty : 0
      const next = Math.min(g.stock, cur + qty)
      if (next === cur) return { ok: false, message: '已达到库存上限' }
      if (line) { line.qty = next; line.selected = true } else this.items.push({ id, qty: next, selected: true })
      if (selectOnly) this.items.forEach(x => { x.selected = x.id === id })
      this.save()
      return { ok: true, message: `已将「${g.name}」加入购物车` }
    },
    setQty(id, qty) {
      const g = DB.goods.find(x => x.id === id)
      const line = this.items.find(x => x.id === id)
      if (!line || !g) return
      line.qty = Math.max(1, Math.min(g.stock, qty))
      this.save()
    },
    remove(id) { this.items = this.items.filter(x => x.id !== id); this.save() },
    removeSelected() { this.items = this.items.filter(x => !x.selected); this.save() },
    toggle(id) { const l = this.items.find(x => x.id === id); if (l) { l.selected = !l.selected; this.save() } },
    toggleAll(val) { this.items.forEach(x => { x.selected = val }); this.save() },
    setOnly(id) { this.items.forEach(x => { x.selected = x.id === id }); this.save() },
    clear() { this.items = []; this.coupon = null; this.save() },
    applyCoupon(code) {
      const c = String(code || '').trim().toUpperCase()
      if (c === 'FRESH5' && this.subtotal >= 49) { this.coupon = { code: c, discount: 5, label: '新人立减 5 元' }; return { ok: true, message: '优惠券已使用，立减 ¥5.00' } }
      if (c === 'FARM10' && this.subtotal >= 99) { this.coupon = { code: c, discount: 10, label: '满 99 减 10' }; return { ok: true, message: '优惠券已使用，立减 ¥10.00' } }
      return { ok: false, message: this.subtotal < 49 ? '订单满 ¥49 才可使用优惠券' : '优惠券无效或未达到使用门槛' }
    },
    clearCoupon() { this.coupon = null }
  }
})
