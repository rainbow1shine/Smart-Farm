<template>
  <div class="page-wrap">
    <PageHeader title="角色管理" sub="创建角色并为角色分配功能权限">
      <template #actions><el-button type="primary" :icon="Plus" @click="openAdd">新建角色</el-button></template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="角色数量" :value="admin.roles.length" unit="个" foot="覆盖平台全部角色" icon="Avatar" />
      <StatCard label="权限模块" :value="admin.perms.length" unit="项" foot="菜单 / 功能 / 数据" icon="Lock" tone="info" />
      <StatCard label="账号总数" :value="admin.users.length" unit="个" foot="已分配角色" icon="User" />
      <StatCard label="待优化" value="2" unit="项" foot="角色权限建议复核" icon="Warning" tone="warn" />
    </div>

    <div class="role-grid">
      <div v-for="r in admin.roles" :key="r.id" class="role-card">
        <div class="rc-head">
          <div class="rc-avatar">{{ r.name.slice(0, 1) }}</div>
          <div class="rc-title">
            <h3>{{ r.name }}</h3>
            <span>{{ r.users }} 个账号</span>
          </div>
          <el-dropdown trigger="click" @command="cmd => onCmd(cmd, r)">
            <el-button text :icon="MoreFilled" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">编辑权限</el-dropdown-item>
                <el-dropdown-item command="delete" :disabled="r.id === 'R1'">删除角色</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <p class="rc-desc">{{ r.desc }}</p>
        <div class="rc-perms">
          <span v-for="p in r.perm.split('、').slice(0, 6)" :key="p">{{ p }}</span>
          <span v-if="r.perm.split('、').length > 6" class="more">+{{ r.perm.split('、').length - 6 }}</span>
        </div>
        <div class="rc-foot">
          <span class="tiny muted">角色编号 {{ r.id }}</span>
          <el-button text type="primary" size="small" @click="openEdit(r)">配置权限</el-button>
        </div>
      </div>
    </div>

    <div class="card perm-card">
      <div class="card-head"><h3>权限矩阵</h3><span class="sub">角色 × 功能模块</span></div>
      <el-table :data="admin.perms" stripe>
        <el-table-column prop="module" label="功能模块" width="140" />
        <el-table-column prop="menu" label="菜单 / 功能权限" min-width="220" />
        <el-table-column prop="data" label="数据范围" width="140" />
        <el-table-column label="拥有角色" min-width="240">
          <template #default="{ row }">
            <el-tag v-for="r in row.roles" :key="r" size="small" effect="plain" class="role-tag">{{ r }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogOpen" :title="editId ? '配置角色权限' : '新建角色'" width="600px" destroy-on-close>
      <el-form label-width="80px" label-position="left">
        <el-form-item label="角色名称"><el-input v-model="form.name" placeholder="如：园区主管" /></el-form-item>
        <el-form-item label="角色描述"><el-input v-model="form.desc" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="功能权限">
          <el-checkbox-group v-model="form.checked" class="perm-checks">
            <el-checkbox v-for="p in admin.perms" :key="p.module" :value="p.module">{{ p.module }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogOpen = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * RoleManage.vue —— 角色管理（RBAC 核心！）
 *
 * 讲解知识点：
 *   1. 卡片式布局（role-grid + role-card），比纯表格更直观
 *   2. el-checkbox-group 多选分配模块权限
 *   3. form.checked.join('、') —— checkbox 数组 → 字符串存储
 *   4. 权限矩阵表：admin.perms × admin.roles 的交叉展示
 *   5. r.id === 'R1' 禁止删除内置管理员角色（guard clause）
 */
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, MoreFilled } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()
const dialogOpen = ref(false)
const editId = ref('')
const form = reactive({ name: '', desc: '', checked: [] })

function reset() { editId.value = ''; Object.assign(form, { name: '', desc: '', checked: [] }) }
function openAdd() { reset(); dialogOpen.value = true }
function openEdit(r) {
  editId.value = r.id
  Object.assign(form, { name: r.name, desc: r.desc, checked: r.perm.split('、') })
  dialogOpen.value = true
}
function save() {
  if (!form.name.trim()) return ElMessage.warning('请输入角色名称')
  const perm = form.checked.join('、') || '工作台'
  if (editId.value) {
    admin.update('roles', editId.value, { name: form.name, desc: form.desc, perm })
    ElMessage.success('角色权限已更新')
  } else {
    admin.add('roles', { id: 'R' + Date.now().toString().slice(-3), name: form.name, desc: form.desc, perm, users: 0 })
    ElMessage.success('角色已创建')
  }
  dialogOpen.value = false
}
function onCmd(cmd, r) {
  if (cmd === 'edit') openEdit(r)
  if (cmd === 'delete') {
    ElMessageBox.confirm(`确定删除角色「${r.name}」？`, '删除确认', { type: 'warning' }).then(() => {
      admin.remove('roles', r.id)
      ElMessage.success('角色已删除')
    }).catch(() => {})
  }
}
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.role-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 18px; }
.role-card { background: #fff; border: 1px solid var(--line); border-radius: var(--radius); padding: 18px; box-shadow: var(--shadow-sm); transition: all .18s; }
.role-card:hover { border-color: var(--brand-300); box-shadow: var(--shadow); }
.rc-head { display: flex; align-items: center; gap: 10px; }
.rc-avatar { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #dcebd3, #b7d3ae); color: #356040; display: grid; place-items: center; font-size: 15px; font-weight: 600; }
.rc-title { flex: 1; }
.rc-title h3 { font-size: 14.5px; }
.rc-title span { font-size: 10.5px; color: var(--ink-400); }
.rc-desc { font-size: 11.5px; color: var(--ink-500); line-height: 1.7; margin: 12px 0; min-height: 38px; }
.rc-perms { display: flex; flex-wrap: wrap; gap: 5px; }
.rc-perms span { font-size: 10px; padding: 2px 7px; border-radius: 4px; background: var(--brand-50); color: var(--brand-700); }
.rc-perms .more { background: #f4f4ef; color: var(--ink-400); }
.rc-foot { display: flex; align-items: center; margin-top: 14px; padding-top: 10px; border-top: 1px dashed var(--line); }
.rc-foot .el-button { margin-left: auto; }
.perm-card { overflow: hidden; }
.role-tag { margin: 2px 4px 2px 0; }
.perm-checks { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; }
@media (max-width: 1100px) { .role-grid { grid-template-columns: 1fr 1fr; } .stat-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 680px) { .role-grid { grid-template-columns: 1fr; } .perm-checks { grid-template-columns: 1fr; } }
</style>
