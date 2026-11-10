<template>
  <div>
    <div class="toolbar">
      <el-button type="primary" @click="openDialog()"><el-icon><Plus /></el-icon>新增用户</el-button>
      <el-tag type="info">共 {{ store.users.length }} 位用户 · 启用 {{ store.users.filter(u=>u.status).length }} 位</el-tag>
    </div>

    <div class="g-3-1">
      <div class="card">
        <h3>👥 用户权限表</h3>
        <table class="tbl">
          <thead><tr><th>用户ID</th><th>用户名</th><th>真实姓名</th><th>角色</th><th>手机</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="u in store.users" :key="u.id">
              <td>{{ u.id }}</td>
              <td>{{ u.username }}</td>
              <td>{{ u.realName }}</td>
              <td><span :class="['tag', roleTag(u.role)]">{{ roleLabel(u.role) }}</span></td>
              <td>{{ u.phone }}</td>
              <td>
                <el-switch v-model="u.status" @change="(v) => toggleStatus(u, v)" />
              </td>
              <td class="actions">
                <el-button size="small" @click="openDialog(u)">编辑</el-button>
                <el-button size="small" type="warning" @click="resetPwd(u)">重置密码</el-button>
                <el-button size="small" type="danger" @click="del(u)">删除</el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h3>🛡️ 角色说明</h3>
        <div style="font-size:13px; line-height:2">
          <div><span class="tag red" style="background:#fbdcd9;color:#c23b31">admin</span> 系统管理员</div>
          <div><span class="tag warn">ops</span> 运维工程师</div>
          <div><span class="tag ok">farmer</span> 农户</div>
          <div><span class="tag blue">agri</span> 农技专家</div>
          <div><span class="tag gray">consumer</span> 消费者</div>
        </div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑用户' : '新增用户'" width="500px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="用户名"><el-input v-model="form.username" /></el-form-item>
        <el-form-item label="真实姓名"><el-input v-model="form.realName" /></el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role" style="width:100%">
            <el-option label="系统管理员 admin" value="admin" />
            <el-option label="运维工程师 ops" value="ops" />
            <el-option label="农户 farmer" value="farmer" />
            <el-option label="农技专家 agri" value="agri" />
            <el-option label="消费者 consumer" value="consumer" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" />
        </el-form-item>
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

const dialogVisible = reactive({ v: false })
const editing = reactive({ v: null })
const form = reactive({ id:'', username:'', realName:'', role:'farmer', phone:'', status:true })

function roleTag(r) { return r==='admin'?'bad':r==='farmer'?'ok':r==='agri'?'blue':r==='ops'?'warn':'gray' }
function roleLabel(r) { return { admin:'管理员', ops:'运维', farmer:'农户', agri:'农技', consumer:'消费者' }[r] || r }

function openDialog(row) {
  if (row) { editing.v = row.id; Object.assign(form, row) }
  else { editing.v = null; Object.assign(form, { id:'U-' + String(Date.now()).slice(-4), username:'', realName:'', role:'farmer', phone:'', status:true }) }
  dialogVisible.v = true
}
function save() {
  if (!form.username || !form.realName) { ElMessage.warning('请填写完整'); return }
  if (editing.v) updateRow('users', editing.v, { ...form })
  else addRow('users', { ...form })
  ElMessage.success('保存成功'); dialogVisible.v = false
}
function toggleStatus(u, v) { ElMessage.success(`已${v?'启用':'停用'}用户 ${u.username}`) }
function resetPwd(u) {
  ElMessageBox.confirm(`确定重置「${u.username}」的密码？`, '重置确认', { type: 'warning' })
    .then(() => ElMessage.success('密码已重置为 123456')).catch(()=>{})
}
function del(u) {
  ElMessageBox.confirm(`确定删除用户「${u.username}」？`, '删除确认', { type: 'warning' })
    .then(() => { removeRow('users', u.id); ElMessage.success('已删除') }).catch(()=>{})
}
</script>
