<template>
  <router-link class="app-logo" :class="[tone, { compact }]" to="/mall">
    <span class="mark">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 20c0-8 6-14 16-14 0 10-6 16-16 16" />
        <path d="M4 20c4-4 8-6 12-7" />
      </svg>
    </span>
    <span v-if="!compact" class="text">
      <strong>{{ title }}</strong>
      <small>{{ subtitle }}</small>
    </span>
  </router-link>
</template>

<script setup>
defineProps({
  title: { type: String, default: '智慧农业 · 农场直供' },
  subtitle: { type: String, default: 'FRESH FROM THE FARM' },
  tone: { type: String, default: 'dark' },
  compact: Boolean
})
</script>

<style scoped>
.app-logo { display: inline-flex; align-items: center; gap: 11px; line-height: 1.2; }
.mark {
  width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center;
  background: var(--brand-600); color: #e8f4de; flex: 0 0 40px;
  box-shadow: 0 6px 16px rgba(63, 111, 74, .22);
}
.text strong { display: block; font-size: 16px; letter-spacing: .4px; color: var(--ink-900); }
.text small { display: block; font-size: 9.5px; letter-spacing: 1.7px; color: var(--ink-400); margin-top: 3px; }
.light .mark { background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.22); color: #d8edc4; box-shadow: none; }
.light .text strong { color: #fff; }
.light .text small { color: #a9c9b6; }
.compact .mark { width: 36px; height: 36px; flex-basis: 36px; }
</style>
