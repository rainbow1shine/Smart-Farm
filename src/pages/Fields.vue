<template>
  <div>
    <div class="toolbar">
      <el-button type="primary" @click="openDialog()"><el-icon><Plus /></el-icon>新建地块</el-button>
      <el-tag type="info">当前地块总数：{{ store.fields.length }}</el-tag>
    </div>

    <div class="g-3-1">
      <!-- 左侧 GIS 假地图 -->
      <div class="card" style="min-height: 520px; position: relative; overflow: hidden; background:
        radial-gradient(circle at 30% 20%, #8bd9a8 0%, transparent 40%),
        radial-gradient(circle at 70% 60%, #6dc98c 0%, transparent 45%),
        linear-gradient(135deg, #d4f0dd, #b5e2c4);">
        <h3 style="color:#1c4a2e">🗺️ 园区 GIS 一张图 <span class="more">图例</span></h3>

        <!-- 地块矩形 -->
        <div v-for="(f, i) in store.fields" :key="f.id" class="field-rect"
          :style="{ left: rects[i].x + '%', top: rects[i].y + '%', width: rects[i].w + '%', height: rects[i].h + '%' }"
          :class="'t' + (i % 4)">
          <div class="f-title">{{ f.name }}</div>
          <div class="f-sub">{{ f.type }} · {{ f.area }}㎡</div>
          <div class="f-devs">
            <span v-for="d in f.devices" :key="d" class="dev-dot" :title="d">●</span>
          </div>
        </div>

        <div style="position:absolute; bottom:14px; right:14px; font-size:12px; color:#1c4a2e; background:rgba(255,255,255,0.7); padding:6px 10px; border-radius:8px;">
          ● 绿色=正常 &nbsp; ○ 灰色=离线
        </div>
      </div>

      <!-- 右侧表格 -->
      <div class="card">
        <h3>📋 地块档案</h3>
        <table class="tbl">
          <thead><tr><th>编号</th><th>名称</th><th>类型</th><th>面积(㎡)</th><th>作物</th><th>负责人</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="f in store.fields" :key="f.id">
              <td>{{ f.id }}</td>
              <td>{{ f.name }}</td>
              <td><span class="tag blue">{{ f.type }}</span></td>
              <td>{{ f.area }}</td>
              <td>{{ f.crop }}</td>
              <td>{{ f.manager }}</td>
              <td class="actions">
                <el-button size="small" @click="openDialog(f)">编辑</el-button>
                <el-button size="small" type="danger" @click="del(f)">删除</el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="editing ? '编辑地块' : '新建地块'" width="520px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="地块编号"><el-input v-model="form.id" /></el-form-item>
        <el-form-item label="地块名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="地块类型">
          <el-select v-model="form.type" style="width:100%">
            <el-option label="温室大棚" value="温室大棚" />
            <el-option label="露天大田" value="露天大田" />
            <el-option label="果园" value="果园" />
            <el-option label="水产养殖" value="水产养殖" />
          </el-select>
        </el-form-item>
        <el-form-item label="面积(㎡)"><el-input-number v-model="form.area" :min="1" style="width:100%" /></el-form-item>
        <el-form-item label="种植作物"><el-input v-model="form.crop" /></el-form-item>
        <el-form-item label="负责人"><el-input v-model="form.manager" /></el-form-item>
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
import { store, addRow, updateRow, removeRow } from '../stores/tableStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const rects = [
  { x: 12, y: 18, w: 32, h: 28 },
  { x: 52, y: 24, w: 36, h: 38 },
  { x: 14, y: 60, w: 30, h: 22 },
  { x: 56, y: 68, w: 32, h: 22 },
]

const dialogVisible = reactive({ v: false })
const editing = reactive({ v: null })
const form = reactive({ id: '', name: '', type: '温室大棚', area: 1000, crop: '', manager: '' })

function openDialog(row) {
  if (row) {
    editing.v = row.id
    Object.assign(form, row)
  } else {
    editing.v = null
    Object.assign(form, { id: 'F' + String(Date.now()).slice(-4), name: '', type: '温室大棚', area: 1000, crop: '', manager: '', devices: [] })
  }
  dialogVisible.v = true
}
function save() {
  if (!form.id || !form.name) { ElMessage.warning('请填写完整信息'); return }
  if (editing.v) updateRow('fields', editing.v, { ...form })
  else addRow('fields', { ...form, devices: form.devices || [] })
  ElMessage.success('保存成功')
  dialogVisible.v = false
}
function del(row) {
  ElMessageBox.confirm(`确定删除地块「${row.name}」？`, '提示', { type: 'warning' })
    .then(() => { removeRow('fields', row.id); ElMessage.success('已删除') }).catch(() => {})
}
</script>

<style scoped>
.field-rect {
  position: absolute;
  border-radius: 12px;
  border: 2px dashed rgba(255,255,255,.8);
  padding: 10px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  transition: .2s;
}
.field-rect:hover { transform: scale(1.02); z-index: 10; box-shadow: 0 6px 22px rgba(0,0,0,.2); }
.t0 { background: linear-gradient(135deg, #2fbf7a, #1f9d5c); }
.t1 { background: linear-gradient(135deg, #e8a33d, #c27b1f); }
.t2 { background: linear-gradient(135deg, #3b82c4, #2768a3); }
.t3 { background: linear-gradient(135deg, #6c5ce7, #4a3eb8); }
.f-title { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
.f-sub { opacity: .9; font-size: 11px; }
.f-devs { margin-top: 6px; letter-spacing: 4px; font-size: 14px; }
.dev-dot { color: #fff; }
</style>
