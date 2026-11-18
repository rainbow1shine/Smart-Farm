<template>
  <div class="stat-card" :class="tone">
    <div class="stat-top">
      <span class="label">{{ label }}</span>
      <span class="ico"><component :is="icon || 'DataLine'" /></span>
    </div>
    <div class="value">{{ value }}<small v-if="unit">{{ unit }}</small></div>
    <div class="foot">{{ foot }}</div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: [String, Number],
  unit: String,
  foot: String,
  icon: { type: String, default: 'DataLine' },
  tone: { type: String, default: '' }
})
</script>

<style scoped>
.stat-card {
  position: relative; padding: 17px 18px 15px; border-radius: var(--radius);
  background: #fff; border: 1px solid var(--line); box-shadow: var(--shadow-sm); overflow: hidden;
}
.stat-card::after {
  content: ""; position: absolute; right: -18px; bottom: -26px; width: 86px; height: 86px;
  border-radius: 50%; background: var(--brand-50); opacity: .7;
}
.stat-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.label { font-size: 12.5px; color: var(--ink-500); }
.ico { width: 30px; height: 30px; border-radius: 9px; background: var(--brand-50); color: var(--brand-600); display: grid; place-items: center; font-size: 15px; }
.value { margin-top: 8px; font-size: 25px; line-height: 1.15; font-weight: 650; letter-spacing: -.4px; color: var(--ink-900); position: relative; z-index: 1; }
.value small { font-size: 12px; color: var(--ink-400); font-weight: 400; margin-left: 3px; }
.foot { margin-top: 5px; font-size: 11.5px; color: var(--ink-400); position: relative; z-index: 1; }
.stat-card.warn .ico { background: #fbf1df; color: #b47821; }
.stat-card.warn .value { color: #a86c18; }
.stat-card.danger .ico { background: #fbece9; color: #b84d40; }
.stat-card.danger .value { color: #b84d40; }
.stat-card.info .ico { background: #eaf2f7; color: #3b78a8; }
.stat-card.info .value { color: #356f9c; }
</style>
