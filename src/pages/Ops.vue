<template>
  <div>
    <!-- 顶部 tile 统计 -->
    <div class="strip">
      <div class="tile"><div class="ic" style="background:#e6f7ee;color:#1f9d5c">📦</div>
        <div><div class="lab">设备总数</div><div class="num">{{ store.devices.length }}</div><div class="sub">接入平台管理</div></div>
      </div>
      <div class="tile"><div class="ic" style="background:#eaf1fb;color:#2b6cb0">✅</div>
        <div><div class="lab">在线运行</div><div class="num">{{ onlineCnt }}</div><div class="sub">运行率 {{ onlineRate }}%</div></div>
      </div>
      <div class="tile"><div class="ic" style="background:#fdf0d8;color:#b07414">⚠️</div>
        <div><div class="lab">离线设备</div><div class="num">{{ offlineCnt }}</div><div class="sub">需要关注</div></div>
      </div>
      <div class="tile"><div class="ic" style="background:#fbdcd9;color:#c23b31">🔧</div>
        <div><div class="lab">待维护</div><div class="num">{{ offlineCnt }}</div><div class="sub">近 7 天</div></div>
      </div>
    </div>

    <!-- g-3-1 布局：左 档案表 + 右 快速新增 -->
    <div class="g-3-1">
      <!-- 左：设备档案表 -->
      <div class="card">
        <h3>设备档案
          <el-button type="primary" size="small" style="margin-left:auto" @click="openDialog()">+ 新增设备</el-button>
        </h3>
        <div class="toolbar" style="margin-bottom:12px">
          <el-input v-model="kw" placeholder="搜索名称/ID/位置" clearable style="min-width:220px" />
          <el-select v-model="typeFilter" placeholder="类型" clearable style="min-width:140px">
            <el-option label="传感器" value="传感器" />
            <el-option label="执行器" value="执行器" />
            <el-option label="视频设备" value="视频设备" />
            <el-option label="监测站" value="监测站" />
          </el-select>
          <el-select v-model="locFilter" placeholder="位置" clearable style="min-width:140px">
            <el-option v-for="p in locations" :key="p" :label="p" :value="p" />
          </el-select>
        </div>
        <table class="tbl">
          <thead><tr><th>ID</th><th>名称</th><th>类型</th><th>位置</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="d in filteredDevices" :key="d.id">
              <td style="color:#8fa095">{{ d.id }}</td>
              <td style="font-weight:600">{{ d.name }}</td>
              <td><span class="tag blue">{{ d.type }}</span></td>
              <td>{{ d.location }}</td>
              <td>
                <span :class="['tag', d.online ? 'ok' : 'warn']">{{ d.online ? '在线' : '离线' }}</span>
              </td>
              <td>
                <div class="actions">
                  <el-button type="primary" link @click="openDialog(d)">编辑</el-button>
                  <el-button type="warning" link @click="toggleOnline(d)">{{ d.online ? '停用' : '启用' }}</el-button>
                  <el-button type="danger" link @click="delDevice(d)">删除</el-button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 右：快速新增表单 -->
      <div class="card">
        <h3>快速新增设备</h3>
        <el-form :model="quick" label-width="80px" style="margin-top:8px">
          <el-form-item label="设备ID">
            <el-input v-model="quick.id" placeholder="自动生成" disabled />
          </el-form-item>
          <el-form-item label="设备名称">
            <el-input v-model="quick.name" placeholder="例如：PH传感器-X1" />
          </el-form-item>
          <el-form-item label="设备类型">
            <el-select v-model="quick.type" placeholder="选择类型" style="width:100%">
              <el-option label="传感器" value="传感器" />
              <el-option label="执行器" value="执行器" />
              <el-option label="视频设备" value="视频设备" />
              <el-option label="监测站" value="监测站" />
            </el-select>
          </el-form-item>
          <el-form-item label="部署位置">
            <el-select v-model="quick.location" placeholder="选择位置" style="width:100%">
              <el-option label="1号果园" value="1号果园" />
              <el-option label="3号大棚" value="3号大棚" />
              <el-option label="2号水产塘" value="2号水产塘" />
              <el-option label="4号试验田" value="4号试验田" />
            </el-select>
          </el-form-item>
          <el-form-item label="初始状态">
            <el-switch v-model="quick.online" active-text="在线" inactive-text="离线" />
          </el-form-item>
          <el-button type="primary" style="width:100%" @click="quickAdd">+ 添加到档案</el-button>
        </el-form>
      </div>
    </div>

    <!-- 新增/编辑 对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialog.id ? '编辑设备' : '新增设备'" width="500px">
      <el-form :model="dialog" label-width="90px">
        <el-form-item label="设备ID">
          <el-input v-model="dialog.id" :disabled="!!dialog.id" placeholder="系统自动生成" />
        </el-form-item>
        <el-form-item label="设备名称"><el-input v-model="dialog.name" /></el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="dialog.type" style="width:100%">
            <el-option label="传感器" value="传感器" />
            <el-option label="执行器" value="执行器" />
            <el-option label="视频设备" value="视频设备" />
            <el-option label="监测站" value="监测站" />
          </el-select>
        </el-form-item>
        <el-form-item label="部署位置"><el-input v-model="dialog.location" /></el-form-item>
        <el-form-item label="在线状态"><el-switch v-model="dialog.online" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitDialog">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { store, addRow, updateRow, removeRow, genId } from '../stores/tableStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const kw = ref('')
const typeFilter = ref('')
const locFilter = ref('')
const dialogVisible = ref(false)

const quick = reactive({ id:'', name:'', type:'', location:'', online:true })
const dialog = reactive({ id:'', name:'', type:'', location:'', online:true })

const onlineCnt = computed(() => store.devices.filter(d => d.online).length)
const offlineCnt = computed(() => store.devices.length - onlineCnt.value)
const onlineRate = computed(() => store.devices.length ? (onlineCnt.value/store.devices.length*100).toFixed(1) : 0)
const locations = computed(() => [...new Set(store.devices.map(d => d.location))])

const filteredDevices = computed(() => store.devices.filter(d => {
  if (kw.value && !(d.name+d.id+d.location).includes(kw.value)) return false
  if (typeFilter.value && d.type !== typeFilter.value) return false
  if (locFilter.value && d.location !== locFilter.value) return false
  return true
}))

function openDialog(row) {
  if (row) Object.assign(dialog, row)
  else     Object.assign(dialog, { id:'', name:'', type:'传感器', location:'1号果园', online:true })
  dialogVisible.value = true
}

function submitDialog() {
  if (!dialog.name.trim() || !dialog.type || !dialog.location) return ElMessage.warning('请完整填写表单')
  if (dialog.id) updateRow(store.devices, dialog.id, { ...dialog })
  else { dialog.id = genId('D'); addRow(store.devices, { ...dialog }) }
  dialogVisible.value = false
  ElMessage.success('设备已保存')
}

function quickAdd() {
  if (!quick.name.trim() || !quick.type || !quick.location) return ElMessage.warning('请完整填写表单')
  addRow(store.devices, { id:genId('D'), name:quick.name, type:quick.type, location:quick.location, online:quick.online })
  Object.assign(quick, { name:'', type:'', location:'', online:true })
  ElMessage.success('已添加到档案')
}

function toggleOnline(d) {
  d.online = !d.online
  ElMessage.success(`${d.name} 已${d.online ? '启用' : '停用'}`)
}

function delDevice(d) {
  ElMessageBox.confirm(`确认删除设备「${d.name}」？`, '删除确认', { type:'warning' })
    .then(() => { removeRow(store.devices, d.id); ElMessage.success('已删除') })
    .catch(() => {})
}
</script>
