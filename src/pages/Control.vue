<template>
  <div>
    <!-- 设备组卡片 -->
    <div class="g3">
      <div v-for="g in groups" :key="g.name" class="card">
        <h3>{{ g.name }} <span class="more">共 {{ g.devices.length }} 台</span></h3>
        <table class="tbl">
          <thead><tr><th>设备</th><th>状态</th><th>自动</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="d in g.devices" :key="d.id">
              <td style="font-weight:600">{{ d.name }}</td>
              <td>
                <button :class="['switch', d.status ? 'on' : '']" @click="d.status = !d.status"></button>
              </td>
              <td>
                <el-switch v-model="d.auto" />
              </td>
              <td>
                <el-button size="small" type="primary" link
                  @click="d.status = d.auto ? false : true">
                  {{ d.status ? '关闭' : '开启' }}
                </el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 联动策略 -->
    <div class="card mt">
      <h3>自动联动策略
        <el-button type="primary" size="small" style="margin-left:auto" @click="openDialog()">+ 新建联动</el-button>
      </h3>

      <table class="tbl">
        <thead><tr><th>ID</th><th>策略名称</th><th>联动设备</th><th>触发条件</th><th>启用</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="s in store.controlStrategies" :key="s.id">
            <td>{{ s.id }}</td>
            <td>{{ s.name }}</td>
            <td>{{ s.devices.map(id => store.controlDevices.find(d=>d.id===id)?.name || id).join('、') }}</td>
            <td>{{ s.trigger }}</td>
            <td><el-switch v-model="s.enabled" /></td>
            <td>
              <div class="actions">
                <el-button type="primary" link @click="openDialog(s)">编辑</el-button>
                <el-button type="danger" link @click="delStrategy(s)">删除</el-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 联动策略对话框 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑联动策略' : '新建联动策略'" width="620px">
      <el-form :model="form" label-width="90px">
        <div class="form-grid">
          <el-form-item label="策略名称"><el-input v-model="form.name" placeholder="例如：高温自动通风" /></el-form-item>
          <el-form-item label="触发条件"><el-input v-model="form.trigger" placeholder="例如：温度>30℃ 时开启..." /></el-form-item>
          <el-form-item label="联动设备" class="full">
            <el-transfer
              v-model="form.devices"
              :data="transferData"
              :titles="['待选设备','已选设备']"
              filterable
              filter-placeholder="搜索设备"
              style="width:100%"
            />
          </el-form-item>
          <el-form-item label="启用策略">
            <el-switch v-model="form.enabled" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { store, addRow, updateRow, removeRow, genId } from '../stores/tableStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const dialogVisible = ref(false)
const form = reactive({ id:'', name:'', trigger:'', devices:[], enabled:true })

const groups = computed(() => [
  { name:'3号大棚',   devices: store.controlDevices.filter(d => d.location === '3号大棚') },
  { name:'2号水产塘', devices: store.controlDevices.filter(d => d.location === '2号水产塘') },
  { name:'1号果园',   devices: store.controlDevices.filter(d => d.location === '1号果园') },
])

const transferData = computed(() =>
  store.controlDevices.map(d => ({ key:d.id, value:d.id, label:`${d.name}（${d.location}）` }))
)

function openDialog(row) {
  if (row) Object.assign(form, { ...row, devices:[...row.devices] })
  else     Object.assign(form, { id:'', name:'', trigger:'', devices:[], enabled:true })
  dialogVisible.value = true
}

function submit() {
  if (!form.name.trim()) return ElMessage.warning('请填写策略名称')
  if (form.id) updateRow(store.controlStrategies, form.id, { ...form, devices:[...form.devices] })
  else         addRow(store.controlStrategies, { ...form, id: genId('S'), devices:[...form.devices] })
  dialogVisible.value = false
  ElMessage.success('保存成功')
}

function delStrategy(s) {
  ElMessageBox.confirm(`确认删除联动策略「${s.name}」？`, '删除确认', { type:'warning' })
    .then(() => { removeRow(store.controlStrategies, s.id); ElMessage.success('已删除') })
    .catch(() => {})
}
</script>
