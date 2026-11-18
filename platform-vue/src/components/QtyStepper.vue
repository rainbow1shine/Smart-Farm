<template>
  <div class="qty" :class="size">
    <button type="button" :disabled="modelValue <= min" aria-label="减少数量" @click="change(-1)">−</button>
    <span>{{ modelValue }}</span>
    <button type="button" :disabled="modelValue >= max" aria-label="增加数量" @click="change(1)">+</button>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Number, default: 1 },
  min: { type: Number, default: 1 },
  max: { type: Number, default: 99 },
  size: { type: String, default: 'md' }
})
const emit = defineEmits(['update:modelValue', 'change'])
function change(d) {
  const next = Math.max(props.min, Math.min(props.max, props.modelValue + d))
  if (next !== props.modelValue) {
    emit('update:modelValue', next)
    emit('change', next)
  }
}
</script>

<style scoped>
.qty { display: inline-flex; align-items: center; border: 1px solid var(--line-strong); border-radius: 9px; overflow: hidden; background: #fff; }
.qty button { width: 32px; height: 32px; border: none; background: #f7f9f3; color: var(--ink-700); font-size: 16px; cursor: pointer; }
.qty button:hover:not(:disabled) { background: var(--brand-50); color: var(--brand-700); }
.qty button:disabled { color: var(--ink-300); cursor: not-allowed; }
.qty span { min-width: 34px; text-align: center; font-size: 13px; font-weight: 600; }
.qty.sm button { width: 26px; height: 26px; font-size: 14px; }
.qty.sm span { min-width: 28px; font-size: 12px; }
.qty.lg button { width: 38px; height: 38px; }
</style>
