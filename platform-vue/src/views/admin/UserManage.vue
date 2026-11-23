<template>
  <div class="page-wrap">
    <PageHeader title="用户管理" sub="平台账号新增、修改、启停与查询">
      <template #actions>
        <el-button type="primary" :icon="Plus" @click="openAdd">新增用户</el-button>
        <el-button :icon="Download" @click="exportUsers">导出</el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="账号总数" :value="admin.users.length" unit="个" foot="覆盖 5 类角色" icon="User" />
      <StatCard label="正常启用" :value="admin.users.filter(u => u.status === '启用').length" unit="个" foot="可正常登录" icon="CircleCheck" />
      <StatCard label="农户账号" :value="admin.users.filter(u => u.role === '农户').length" unit="个" foot="一线生产人员" icon="UserFilled" tone="info" />
      <StatCard label="停用账号" :value="admin.users.filter(u => u.status === '停用').length" unit="个" foot="需管理员复核" icon="Warning" tone="danger" />
    </div>

    <DataTable
      :columns="columns"
      :rows="admin.users"
      :filters="filters"
      :row-actions="rowActions"
      search-placeholder="搜索账号、姓名、手机号…"
      export-name="用户管理"
      @row-action="onAction"
    >
      <template #toolbar-right>
        <el-button :icon="Refresh" text @click="refresh">刷新</el-button>
      </template>
    </DataTable>

    <el-dialog v-model="dialogOpen" :title="editId ? '编辑用户' : '新增用户'" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="88px" label-position="left">
        <el-form-item label="账号" prop="account"><el-input v-model="form.account" :disabled="!!editId" placeholder="登录账号，如 farmer04" /></el-form-item>
        <el-form-item label="姓名" prop="name"><el-input v-model="form.name" placeholder="真实姓名" /></el-form-item>
        <el-form-item label="手机号" prop="phone"><el-input v-model="form.phone" maxlength="11" placeholder="11 位手机号" /></el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" class="w-full">
            <el-option v-for="r in roles" :key="r" :label="r" :value="r" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属园区">
          <el-select v-model="form.park" class="w-full">
            <el-option v-for="p in parks" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.gender"><el-radio value="男">男</el-radio><el-radio value="女">女</el-radio></el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" active-value="启用" inactive-value="停用" active-text="启用" inactive-text="停用" />
        </el-form-item>
        <el-form-item v-if="!editId" label="初始密码">
          <el-input v-model="form.password" placeholder="默认 123456，建议首次登录修改" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogOpen = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * UserManage.vue —— 用户管理（讲解重点！）
 *
 * 讲解知识点：
 *   1. Element Plus 表单校验（rules + formRef.validate()）
 *   2. :disabled="!!editId" 编辑时禁用账号字段（不允许修改登录账号）
 *   3. 手机号正则校验 /^1[3-9]\d{9}$/
 *   4. 启停/删除带 ElMessageBox.confirm 二次确认
 *   5. downloadCsv() 导出 CSV —— columns 配置里的 formatter 自动调用
 */
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, Refresh } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import DataTable from '@/components/DataTable.vue'
import { useAdminStore } from '@/stores/admin'
import { downloadCsv, maskPhone } from '@/utils/format'

const admin = useAdminStore()
const dialogOpen = ref(false)
const editId = ref('')
const saving = ref(false)
const formRef = ref(null)
const form = reactive({ account: '', name: '', phone: '', role: '农户', park: '永川智慧农业示范园', gender: '男', status: '启用', password: '123456' })
const roles = ['管理员', '运维', '农户', '农艺技术人员', '消费者']
const parks = ['平台中心', '永川智慧农业示范园', '南川大观生态农业园', '璧山蔬菜保供基地', '全园区', '—']
const columns = [
  { prop: 'id', label: '编号', width: 90 },
  { prop: 'account', label: '账号', width: 120 },
  { prop: 'name', label: '姓名', width: 110 },
  { prop: 'role', label: '角色', width: 130 },
  { prop: 'phone', label: '手机号', width: 130, formatter: r => maskPhone(r.phone) },
  { prop: 'park', label: '所属园区', minWidth: 170 },
  { prop: 'last', label: '最后登录', width: 150 },
  { prop: 'status', label: '状态', width: 80, type: 'tag' }
]
const filters = [
  { key: 'role', label: '角色', options: roles.map(v => ({ label: v, value: v })) },
  { key: 'status', label: '状态', options: ['启用', '停用'].map(v => ({ label: v, value: v })) }
]
const rowActions = [
  { key: 'edit', label: '编辑' },
  { key: 'toggle', label: '启停', show: r => r.status === '启用' },
  { key: 'enable', label: '启用', show: r => r.status === '停用' },
  { key: 'delete', label: '删除', type: 'danger' }
]
const rules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, pattern: /^1[3-9]\d{9}$/, message: '请输入正确的 11 位手机号', trigger: 'blur' }]
}

function resetForm() {
  Object.assign(form, { account: '', name: '', phone: '', role: '农户', park: '永川智慧农业示范园', gender: '男', status: '启用', password: '123456' })
  editId.value = ''
}
function openAdd() { resetForm(); dialogOpen.value = true }
function openEdit(row) {
  editId.value = row.id
  Object.assign(form, { ...row, password: '' })
  dialogOpen.value = true
}
async function save() {
  try { await formRef.value.validate() } catch { return }
  if (!editId.value && admin.users.some(u => u.account.toLowerCase() === form.account.toLowerCase())) {
    return ElMessage.error('该账号已存在，请更换')
  }
  saving.value = true
  setTimeout(() => {
    if (editId.value) {
      admin.update('users', editId.value, { name: form.name, phone: form.phone, role: form.role, park: form.park, gender: form.gender, status: form.status })
      ElMessage.success('用户信息已更新')
    } else {
      admin.addUser({ account: form.account, name: form.name, phone: form.phone, role: form.role, park: form.park, gender: form.gender, status: form.status })
      ElMessage.success('用户已创建，初始密码 123456')
    }
    saving.value = false
    dialogOpen.value = false
  }, 240)
}
function onAction({ action, row }) {
  if (action === 'edit') openEdit(row)
  if (action === 'toggle') {
    ElMessageBox.confirm(`确定${row.status === '启用' ? '停用' : '启用'}「${row.name}」的账号？`, '状态变更', { type: 'warning' }).then(() => {
      admin.toggleUser(row.id)
      ElMessage.success('状态已更新')
    }).catch(() => {})
  }
  if (action === 'enable') { admin.update('users', row.id, { status: '启用' }); ElMessage.success('账号已启用') }
  if (action === 'delete') {
    ElMessageBox.confirm(`删除用户「${row.name}」后不可恢复，确定继续？`, '删除确认', { type: 'warning' }).then(() => {
      admin.deleteUser(row.id)
      ElMessage.success('用户已删除')
    }).catch(() => {})
  }
}
function refresh() { ElMessage.success('用户数据已刷新') }
function exportUsers() {
  downloadCsv('用户管理-' + new Date().toISOString().slice(0, 10) + '.csv',
    columns.map(c => ({ ...c, value: r => c.formatter ? c.formatter(r) : r[c.prop] })), admin.users)
  ElMessage.success('已导出当前用户列表')
}
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
@media (max-width: 1180px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; } }
</style>
