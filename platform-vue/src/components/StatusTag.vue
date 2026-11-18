<template>
  <el-tag :type="type" :size="size" effect="light" round class="status-tag">{{ status || '—' }}</el-tag>
</template>

<script setup>
import { computed } from 'vue'
import { statusTone } from '@/utils/format'
const props = defineProps({
  status: { type: String, default: '' },
  size: { type: String, default: 'small' }
})
const type = computed(() => statusTone(props.status))
</script>

<style scoped>
.status-tag { font-weight: 500; }
</style>
