<template>
  <div class="page-wrap">
    <PageHeader title="权限管理" sub="RBAC 菜单 / 功能 / 数据权限配置">
      <template #actions>
        <el-button type="primary" :icon="Check" @click="save">保存权限</el-button>
        <el-button :icon="Refresh" @click="admin.resetDemo(); ElMessage.success('已恢复默认权限')">恢复默认</el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="功能模块" :value="admin.perms.length" unit="项" foot="菜单级权限" icon="Menu" />
      <StatCard label="角色数量" :value="admin.roles.length" unit="个" foot="含系统内置角色" icon="Avatar" tone="info" />
      <StatCard label="权限组合" :value="admin.perms.reduce((a, b) => a + b.roles.length, 0)" unit="条" foot="角色 × 模块" icon="Connection" />
      <StatCard label="数据范围" value="4" unit="级" foot="全部 / 园区 / 地块 / 本人" icon="Lock" tone="warn" />
    </div>

    <div class="notice-item">
      <el-icon><InfoFilled /></el-icon>
      <span>权限采用 RBAC 模型：角色绑定菜单与功能权限，数据权限按园区 / 地块 / 本人逐级收敛。管理员默认拥有全部权限。</span>
    </div>

    <div class="card perm-table">
      <div class="card-head">
        <h3>角色权限矩阵</h3>
        <span class="sub">勾选表示该角色拥有对应模块权限</span>
        <div class="acts"><el-button text type="primary" @click="addPerm">新增模块</el-button></div>
      </div>
      <div class="pt-scroll">
        <table class="pt">
          <thead>
            <tr>
              <th class="module-col">功能模块</th>
              <th>功能权限</th>
              <th>数据范围</th>
              <th v-for="r in admin.roles" :key="r.id">{{ r.name }}</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in admin.perms" :key="p.module">
              <td><b>{{ p.module }}</b></td>
              <td class="muted">{{ p.menu }}</td>
              <td><span class="soft-tag">{{ p.data }}</span></td>
              <td v-for="r in admin.roles" :key="r.id" class="center">
                <el-checkbox :model-value="p.roles.includes(r.name)" @change="v => toggle(p, r.name, v)" />
              </td>
              <td><el-button link type="primary" size="small" @click="removePerm(p)">移除</el-button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * PermManage.vue —— ⭐ RBAC 权限矩阵（管理员核心功能！）
 *
 * 讲解重点：
 *   RBAC 模型：用户 → 角色 → 权限 三层解耦
 *   三级权限：菜单级（能不能看）+ 功能级（能不能操作）+ 数据级（能看谁的数据）
 *   数据范围：全部 → 园区 → 地块 → 本人（逐级收敛）
 *
 * 关键逻辑：
 *   1. toggle() —— Set 自动去重处理 checkbox 勾选
 *   2. save() —— 反向同步 r.perm = admin.perms.filter(p => p.roles.includes(r.name))
 *      即"根据权限勾选情况，反推每个角色拥有的模块权限字符串"
 */
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Refresh } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()
function toggle(p, role, val) {
  const set = new Set(p.roles)
  val ? set.add(role) : set.delete(role)
  p.roles = [...set]
}
function save() {
  admin.roles.forEach(r => {
    r.perm = admin.perms.filter(p => p.roles.includes(r.name)).map(p => p.module).join('、') || '工作台'
  })
  admin.save()
  ElMessage.success('权限配置已保存')
}
async function addPerm() {
  try {
    const { value } = await ElMessageBox.prompt('请输入功能模块名称', '新增权限模块', { inputPlaceholder: '如：视频回放' })
    if (!value) return
    admin.add('perms', { module: value, menu: '查看 / 操作', data: '本园区', roles: ['管理员'] })
    ElMessage.success('已新增模块')
  } catch {}
}
function removePerm(p) {
  ElMessageBox.confirm(`确定移除「${p.module}」权限模块？`, '移除确认', { type: 'warning' }).then(() => {
    admin.perms = admin.perms.filter(x => x.module !== p.module)
    admin.save()
    ElMessage.success('已移除')
  }).catch(() => {})
}
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.notice-item { display: flex; gap: 8px; align-items: flex-start; background: #eef5fa; border: 1px solid #dbe8f1; color: #4a718c; padding: 11px 14px; border-radius: 10px; font-size: 12.5px; margin-bottom: 16px; }
.perm-table { overflow: hidden; }
.pt-scroll { overflow: auto; }
.pt { width: 100%; border-collapse: collapse; min-width: 860px; }
.pt th, .pt td { padding: 12px 14px; text-align: left; font-size: 12.5px; border-bottom: 1px solid #f1f4ec; }
.pt th { background: #f7f9f3; color: #526057; font-weight: 600; font-size: 12px; white-space: nowrap; }
.pt .module-col { width: 140px; }
.pt .center { text-align: center; }
.pt tbody tr:hover { background: #fbfcf7; }
@media (max-width: 1180px) { .stat-grid { grid-template-columns: 1fr 1fr; } }
</style>
