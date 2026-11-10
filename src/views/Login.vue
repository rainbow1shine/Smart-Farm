<template>
  <div class="login-wrap">
    <!-- 左侧品牌面板 -->
    <div class="brand">
      <div class="brand-inner">
        <div class="logo">禾</div>
        <h1>智慧农业平台</h1>
        <p class="sub">Smart Agriculture Cloud · V1.0</p>
        <div class="features">
          <div class="ft">
            <i>Monitor</i>
            <div><b>物联网感知监测</b><span>实时采集环境与设备数据</span></div>
          </div>
          <div class="ft">
            <i>Cpu</i>
            <div><b>远程智能控制</b><span>策略化自动作业指令下发</span></div>
          </div>
          <div class="ft">
            <i>DataAnalysis</i>
            <div><b>数据中心与 AI</b><span>分析预测辅助生产决策</span></div>
          </div>
          <div class="ft">
            <i>Link</i>
            <div><b>溯源与产销对接</b><span>从田间到餐桌全链路可追溯</span></div>
          </div>
        </div>
        <div class="demo">
          <b>🧪 一键体验：点击下方账号自动填充（密码均为 123456）</b>
          <div class="chips">
            <span v-for="r in demoRoles" :key="r.value" class="chip" @click="quickFill(r.value)">{{ r.label }} · {{ r.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录卡片 -->
    <div class="form-side">
      <div class="card">
        <h2>欢迎登录 <span class="dot"></span></h2>
        <p class="tip">选择角色后输入对应账号密码即可进入系统</p>
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @keyup.enter="onSubmit">
          <el-form-item label="账号" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" prefix-icon="User" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password />
          </el-form-item>
          <el-form-item label="角色" prop="role">
            <el-select v-model="form.role" placeholder="请选择角色" class="full">
              <el-option v-for="r in demoRoles" :key="r.value" :label="r.label" :value="r.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button class="login-btn" type="primary" :loading="loading" @click="onSubmit">登 录</el-button>
          </el-form-item>
        </el-form>
        <div class="foot">
          <router-link to="/register">注册账号</router-link>
          <span class="sep">|</span>
          <a class="link-forgot" @click="$message.info('演示环境暂无找回功能')">忘记密码</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { loginUser, roleLabel } from '../mock/users'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const loading = ref(false)

const demoRoles = Object.entries(roleLabel).map(([v, l]) => ({ value: v, label: l }))

const form = reactive({
  username: '',
  password: '',
  role: 'admin',
})

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

function quickFill(role) {
  form.role = role
  form.username = role
  form.password = '123456'
}

function onSubmit() {
  formRef.value.validate(ok => {
    if (!ok) return
    loading.value = true
    setTimeout(() => {
      const res = loginUser(form.username, form.password)
      loading.value = false
      if (!res.ok) { ElMessage.error(res.msg); return }
      if (res.data.role !== form.role) {
        ElMessage.warning(`该账号属于「${roleLabel[res.data.role]}」，已自动切换角色`)
      }
      localStorage.setItem('smartUser', JSON.stringify(res.data))
      ElMessage.success('登录成功')
      const redirect = route.query.redirect || '/dashboard'
      router.replace(redirect)
    }, 250)
  })
}
</script>

<style scoped>
.login-wrap { min-height: 100vh; display: grid; grid-template-columns: 1.15fr 1fr; }
.brand {
  background: linear-gradient(135deg, #3cc783 0%, #5cd095 45%, #7fe0ac 100%);
  color: #fff; position: relative; overflow: hidden;
}
.brand::after {
  content:''; position:absolute; right:-80px; bottom:-120px; width:420px; height:420px;
  background: radial-gradient(circle, rgba(255,255,255,.18) 0%, transparent 70%); border-radius: 50%;
}
.brand-inner { position: relative; z-index: 1; padding: 56px 64px; height: 100%; display: flex; flex-direction: column; }
.logo { width:64px; height:64px; background:#fff; color:#2fbf7a; border-radius: 18px; display:flex; align-items:center; justify-content:center; font-size:36px; font-weight:800; margin-bottom:18px; box-shadow: 0 6px 22px rgba(0,0,0,.1); }
.brand h1 { font-size: 30px; letter-spacing: 2px; }
.brand .sub { opacity:.9; font-size:13px; margin:6px 0 32px; letter-spacing: 1px; }
.features { display:flex; flex-direction:column; gap:14px; margin-bottom:38px; }
.ft { display:flex; align-items:center; gap:14px; background: rgba(255,255,255,.14); border-radius: 12px; padding: 14px 18px; backdrop-filter: blur(6px); }
.ft i { width: 42px; height:42px; border-radius:10px; background:#fff; color:#2fbf7a; display:flex; align-items:center; justify-content:center; font-size:20px; font-style: normal; font-weight:700; }
.ft b { display:block; font-size: 14px; margin-bottom: 2px; }
.ft span { font-size: 12px; opacity: .85; }
.demo { margin-top:auto; background: rgba(255,255,255,.16); border-radius: 14px; padding: 16px 18px; backdrop-filter: blur(6px); }
.demo b { font-size: 13px; display:block; margin-bottom: 10px; }
.chips { display:flex; flex-wrap: wrap; gap:8px; }
.chip { cursor:pointer; background:#fff; color:#1f9d5c; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; transition: .2s; }
.chip:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.15); }

.form-side { display:flex; align-items:center; justify-content:center; padding: 40px; background: linear-gradient(180deg,#f7fcf9,#edf5f0); }
.card { background:#fff; border-radius: 20px; box-shadow: 0 10px 40px rgba(31,120,75,.1); padding: 40px 44px; width: 100%; max-width: 440px; }
.card h2 { font-size: 22px; color: #1c2b23; display:flex; align-items:center; gap: 10px; }
.card h2 .dot { width: 10px; height: 10px; border-radius: 50%; background: linear-gradient(135deg,#4cd98f,#2fbf7a); }
.tip { color: #8fa095; font-size: 12.5px; margin: 6px 0 22px; }
.login-btn { width:100%; height: 44px; font-size: 15px; letter-spacing: 4px; }
.foot { text-align:center; color: #8fa095; font-size: 13px; margin-top: 8px; }
.foot a { color: #2fbf7a; text-decoration: none; margin: 0 6px; }
.foot .sep { margin: 0 6px; }
.link-forgot { cursor: pointer; }
.full { width:100%; }

@media (max-width: 900px) {
  .login-wrap { grid-template-columns: 1fr; }
  .brand { display: none; }
}
</style>
