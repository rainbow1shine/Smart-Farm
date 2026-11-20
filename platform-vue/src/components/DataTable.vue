<template>
  <div class="data-table card">
    <div v-if="showToolbar" class="dt-toolbar">
      <div class="dt-left">
        <el-input v-model="keyword" :placeholder="searchPlaceholder" clearable class="dt-search">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <slot name="filters" />
        <el-select
          v-for="f in filters"
          :key="f.key"
          v-model="activeFilters[f.key]"
          :placeholder="f.label"
          clearable
          class="dt-filter"
        >
          <el-option v-for="o in f.options" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
        <slot name="toolbar-left" />
      </div>
      <div class="dt-right">
        <slot name="toolbar-right" />
        <el-button v-if="showExport" text :icon="Download" @click="exportCsv">导出</el-button>
        <el-button v-if="showRefresh" text :icon="Refresh" @click="$emit('refresh')">刷新</el-button>
      </div>
    </div>

    <div v-if="filteredRows.length" class="dt-meta">
      <span>匹配 <b>{{ filteredRows.length }}</b> / 共 {{ rows.length }} 条</span>
      <span v-if="keyword || activeFilterCount" class="clear" @click="clearAll">清除筛选</span>
    </div>

    <el-table
      :data="pagedRows"
      v-loading="loading"
      :row-key="rowKey"
      stripe
      class="dt-table"
      @row-click="(row) => $emit('row-click', row)"
      @sort-change="onSortChange"
    >
      <el-table-column v-if="showIndex" type="index" label="#" width="54" />
      <el-table-column
        v-for="col in columns"
        :key="col.prop || col.label"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth"
        :align="col.align || 'left'"
        :sortable="col.sortable === false ? false : 'custom'"
        :fixed="col.fixed"
      >
        <template #default="scope">
          <slot v-if="col.slot" :name="col.slot" :row="scope.row" :value="scope.row[col.prop]" :index="scope.$index" />
          <template v-else-if="col.type === 'tag'">
            <StatusTag :status="String(scope.row[col.prop] ?? '—')" />
          </template>
          <template v-else-if="col.type === 'money'">
            <b class="money">{{ money(scope.row[col.prop]) }}</b>
          </template>
          <template v-else-if="col.type === 'progress'">
            <div class="prog-cell">
              <el-progress :percentage="Number(scope.row[col.prop] || 0)" :stroke-width="6" :show-text="false" />
              <span>{{ scope.row[col.prop] || 0 }}%</span>
            </div>
          </template>
          <template v-else-if="col.type === 'stars'">
            <el-rate :model-value="Number(scope.row[col.prop] || 0)" disabled size="small" />
          </template>
          <template v-else>
            {{ col.formatter ? col.formatter(scope.row) : (scope.row[col.prop] ?? '—') }}
          </template>
        </template>
      </el-table-column>
      <el-table-column v-if="rowActions.length" label="操作" :width="actionWidth" fixed="right">
        <template #default="scope">
          <div class="row-acts">
            <template v-for="a in visibleActions(scope.row)" :key="a.key">
              <el-button
                link
                :type="a.type || 'primary'"
                size="small"
                @click.stop="$emit('row-action', { action: a.key, row: scope.row })"
              >{{ a.label }}</el-button>
            </template>
          </div>
        </template>
      </el-table-column>
      <template #empty>
        <div class="empty-box">
          <div class="icon">🌱</div>
          <div>{{ emptyText }}</div>
          <el-button v-if="keyword || activeFilterCount" text type="primary" @click="clearAll">清除筛选条件</el-button>
        </div>
      </template>
    </el-table>

    <div v-if="filteredRows.length > size" class="dt-pager">
      <span class="pager-tip">第 {{ (page - 1) * size + 1 }}–{{ Math.min(page * size, filteredRows.length) }} 条，共 {{ filteredRows.length }} 条</span>
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :page-sizes="pageSizes"
        :total="filteredRows.length"
        layout="sizes, prev, pager, next"
        background
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Search, Download, Refresh } from '@element-plus/icons-vue'
import StatusTag from './StatusTag.vue'
import { money, downloadCsv } from '@/utils/format'

const props = defineProps({
  columns: { type: Array, default: () => [] },
  rows: { type: Array, default: () => [] },
  searchKeys: { type: Array, default: () => [] },
  searchPlaceholder: { type: String, default: '搜索关键词' },
  pageSize: { type: Number, default: 10 },
  pageSizes: { type: Array, default: () => [10, 20, 50] },
  rowKey: { type: String, default: 'id' },
  showIndex: { type: Boolean, default: false },
  showToolbar: { type: Boolean, default: true },
  showExport: { type: Boolean, default: true },
  showRefresh: { type: Boolean, default: true },
  loading: Boolean,
  filters: { type: Array, default: () => [] },
  rowActions: { type: Array, default: () => [] },
  actionWidth: { type: [Number, String], default: 160 },
  emptyText: { type: String, default: '暂无匹配数据' },
  exportName: { type: String, default: '数据导出' }
})
const emit = defineEmits(['row-action', 'refresh', 'row-click'])

const keyword = ref('')
const page = ref(1)
const size = ref(props.pageSize)
const sortProp = ref('')
const sortOrder = ref('')
const activeFilters = reactive({})
props.filters.forEach(f => { activeFilters[f.key] = '' })

const activeFilterCount = computed(() => Object.values(activeFilters).filter(v => v !== '' && v != null).length)

const searchKeys = computed(() => {
  if (props.searchKeys.length) return props.searchKeys
  return [...new Set(props.columns.map(c => c.prop).filter(Boolean))]
})

const filteredRows = computed(() => {
  let list = props.rows.slice()
  const kw = keyword.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(row => searchKeys.value.some(key => {
      const v = row[key]
      return v != null && String(v).toLowerCase().includes(kw)
    }))
  }
  for (const f of props.filters) {
    const v = activeFilters[f.key]
    if (v !== '' && v != null) list = list.filter(row => String(row[f.key]) === String(v))
  }
  if (sortProp.value && sortOrder.value) {
    list.sort((a, b) => {
      const x = a[sortProp.value], y = b[sortProp.value]
      const n = (typeof x === 'number' && typeof y === 'number') ? x - y : String(x ?? '').localeCompare(String(y ?? ''), 'zh')
      return sortOrder.value === 'ascending' ? n : -n
    })
  }
  return list
})

watch([filteredRows, () => props.rows], () => { page.value = 1 })
watch(() => props.pageSize, v => { size.value = v })

const pagedRows = computed(() => {
  const start = (page.value - 1) * size.value
  return filteredRows.value.slice(start, start + size.value)
})

function onSortChange({ prop, order }) {
  sortProp.value = order ? prop : ''
  sortOrder.value = order || ''
}

function visibleActions(row) {
  return props.rowActions.filter(a => !a.show || a.show(row))
}
function clearAll() {
  keyword.value = ''
  Object.keys(activeFilters).forEach(k => { activeFilters[k] = '' })
  page.value = 1
}
function exportCsv() {
  const cols = props.columns.filter(c => c.prop).map(c => ({
    label: c.label,
    value: (row) => {
      const v = row[c.prop]
      if (c.type === 'money') return money(v)
      return c.formatter ? c.formatter(row) : v
    }
  }))
  downloadCsv(`${props.exportName}-${new Date().toISOString().slice(0, 10)}.csv`, cols, filteredRows.value)
}
</script>

<style scoped>
.data-table { overflow: hidden; }
.dt-toolbar { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid var(--line); flex-wrap: wrap; }
.dt-left, .dt-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.dt-right { margin-left: auto; }
.dt-search { width: 230px; }
.dt-filter { width: 132px; }
.dt-meta { display: flex; align-items: center; gap: 12px; padding: 9px 18px; font-size: 11.5px; color: var(--ink-400); border-bottom: 1px solid var(--line); background: #fcfdf9; }
.dt-meta b { color: var(--brand-700); }
.dt-meta .clear { color: var(--brand-600); cursor: pointer; }
.dt-table { width: 100%; }
.money { color: #b04b3e; font-weight: 600; }
.prog-cell { display: flex; align-items: center; gap: 8px; min-width: 110px; }
.prog-cell .el-progress { flex: 1; }
.prog-cell span { font-size: 11.5px; color: var(--ink-500); width: 34px; text-align: right; }
.row-acts { display: flex; align-items: center; gap: 2px; flex-wrap: wrap; }
.dt-pager { display: flex; align-items: center; gap: 12px; padding: 12px 18px; border-top: 1px solid var(--line); flex-wrap: wrap; }
.pager-tip { font-size: 11.5px; color: var(--ink-400); }
.dt-pager .el-pagination { margin-left: auto; }
@media (max-width: 700px) {
  .dt-search { width: 100%; }
  .dt-left { width: 100%; }
  .dt-filter { flex: 1; width: auto; }
  .dt-right { margin-left: 0; width: 100%; justify-content: flex-end; }
}
</style>
