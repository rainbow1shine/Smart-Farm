<template>
  <div>
    <div class="toolbar">
      <el-button type="primary" @click="openDialog()"><el-icon><Plus /></el-icon>上架新产品</el-button>
      <el-tag type="info">共 {{ store.products.length }} 件产品 · 在售 {{ store.products.filter(p=>p.onSale).length }} 件</el-tag>
    </div>

    <div class="g3">
      <div v-for="p in store.products" :key="p.id" class="card product-card" :class="{ offline: !p.onSale }">
        <div class="p-ic">{{ emojiOf(p.category) }}</div>
        <div class="p-info">
          <div class="p-name">
            {{ p.name }}
            <span v-if="!p.onSale" class="tag gray">已下架</span>
          </div>
          <div style="margin:6px 0">
            <el-tag v-for="c in p.category" :key="c" size="small" type="success" effect="plain" style="margin-right:4px">{{ c }}</el-tag>
          </div>
          <div class="p-price">
            <span class="currency">¥</span><span class="amount">{{ p.price }}</span>
            <span class="unit">/{{ p.unit }}</span>
          </div>
          <div class="p-stock">库存：<b>{{ p.stock }}</b> {{ p.unit }} · 产地：{{ p.origin }}</div>
          <div class="p-desc">{{ p.desc }}</div>
        </div>
        <div class="p-actions">
          <el-button size="small" @click="openDialog(p)">编辑</el-button>
          <el-button size="small" v-if="p.onSale" type="warning" @click="offline(p)">下架</el-button>
          <el-button size="small" v-else type="success" @click="online(p)">上架</el-button>
        </div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑产品' : '上架新产品'" width="600px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="产品编号"><el-input v-model="form.id" /></el-form-item>
        <el-form-item label="产品名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category" multiple collapse-tags collapse-tags-tooltip style="width:100%" placeholder="选择分类">
            <el-option label="蔬菜" value="蔬菜" />
            <el-option label="水果" value="水果" />
            <el-option label="有机" value="有机" />
            <el-option label="水产" value="水产" />
            <el-option label="粮油" value="粮油" />
            <el-option label="禽蛋" value="禽蛋" />
          </el-select>
        </el-form-item>
        <div class="form-grid" style="width:100%">
          <el-form-item label="售价">
            <el-input-number v-model="form.price" :min="0.1" :precision="2" style="width:100%" />
          </el-form-item>
          <el-form-item label="单位">
            <el-select v-model="form.unit" style="width:100%">
              <el-option label="斤" value="斤" /><el-option label="kg" value="kg" /><el-option label="箱" value="箱" />
            </el-select>
          </el-form-item>
          <el-form-item label="库存"><el-input-number v-model="form.stock" :min="0" style="width:100%" /></el-form-item>
          <el-form-item label="产地"><el-input v-model="form.origin" /></el-form-item>
        </div>
        <el-form-item label="产品描述"><el-input v-model="form.desc" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { store, addRow, updateRow } from '../stores/tableStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const dialogVisible = reactive({ v: false })
const editing = reactive({ v: null })
const form = reactive({ id:'', name:'', category:[], price:0, unit:'斤', stock:0, origin:'', desc:'', onSale:true })

function emojiOf(cat) {
  const all = cat.join(',')
  if (all.includes('水果')) return '🍎'
  if (all.includes('水产')) return '🐟'
  if (all.includes('粮油')) return '🌾'
  if (all.includes('禽蛋')) return '🥚'
  if (all.includes('蔬菜')) return '🥬'
  return '🌱'
}

function openDialog(row) {
  if (row) { editing.v = row.id; Object.assign(form, row) }
  else { editing.v = null; Object.assign(form, { id:'P-' + String(store.products.length+1).padStart(3,'0'), name:'', category:[], price:0, unit:'斤', stock:0, origin:'', desc:'', onSale:true }) }
  dialogVisible.v = true
}
function save() {
  if (!form.name || !form.category.length) { ElMessage.warning('请填写完整'); return }
  if (editing.v) updateRow('products', editing.v, { ...form })
  else addRow('products', { ...form })
  ElMessage.success('保存成功'); dialogVisible.v = false
}
function offline(p) {
  ElMessageBox.confirm(`确定下架「${p.name}」？`, '下架确认').then(() => {
    updateRow('products', p.id, { onSale: false }); ElMessage.success('已下架')
  }).catch(()=>{})
}
function online(p) {
  updateRow('products', p.id, { onSale: true }); ElMessage.success('已上架')
}
</script>

<style scoped>
.product-card { position: relative; transition: .2s; }
.product-card:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(31,157,92,.18); }
.product-card.offline { opacity: .65; }
.p-ic { font-size: 46px; text-align: center; margin-bottom: 8px; }
.p-name { font-size: 15.5px; font-weight: 700; color: var(--ink); }
.p-price { margin: 6px 0; color: #c23b31; font-weight: 700; }
.p-price .currency { font-size: 13px; }
.p-price .amount { font-size: 24px; }
.p-price .unit { font-size: 12px; color: var(--ink3); font-weight: 400; }
.p-stock { font-size: 12.5px; color: var(--ink2); }
.p-desc { font-size: 12.5px; color: var(--ink3); margin-top: 6px; line-height: 1.6; min-height: 40px; }
.p-actions { margin-top: 12px; display: flex; gap: 6px; }
</style>
