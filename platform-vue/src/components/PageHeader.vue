<template>
  <div class="page-header">
    <div class="ph-left">
      <button v-if="back" class="back" aria-label="返回" @click="$router.back()"><el-icon><ArrowLeft /></el-icon></button>
      <div>
        <h1>{{ title }}</h1>
        <p v-if="sub">{{ sub }}</p>
      </div>
    </div>
    <div class="ph-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({ title: String, sub: String, back: Boolean })
</script>

<style scoped>
.page-header { display: flex; align-items: flex-end; gap: 14px; margin-bottom: 18px; flex-wrap: wrap; }
.ph-left { display: flex; align-items: center; gap: 10px; }
h1 { font-size: 21px; letter-spacing: .3px; line-height: 1.25; color: var(--ink-900); }
p { font-size: 12.5px; color: var(--ink-500); margin-top: 5px; }
.ph-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.back { width: 32px; height: 32px; border-radius: 9px; border: 1px solid var(--line); background: #ffffff; cursor: pointer; color: var(--ink-500); display: grid; place-items: center; }
.back:hover { color: var(--brand-600); border-color: var(--brand-300); }
</style>
