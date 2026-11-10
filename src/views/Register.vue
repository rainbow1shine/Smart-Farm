<template>
  <div class="login-wrap">
    <!-- 左侧品牌面板（与登录相同风格） -->
    <div class="brand">
      <div class="brand-inner">
        <div class="logo">禾</div>
        <h1>智慧农业平台</h1>
        <p class="sub">注册新账号 · 开启您的智慧农业之旅</p>
        <div class="features">
          <div class="ft">
            <i>User</i>
            <div><b>多角色统一注册</b><span>农户/专家/消费者统一入口</span></div>
          </div>
          <div class="ft">
            <i>MapLocation</i>
            <div><b>绑定所属基地</b><span>快速接入已有种植园区</span></div>
          </div>
          <div class="ft">
            <i>Shield</i>
            <div><b>数据安全保障</b><span>生产经营数据本地加密</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧注册卡片 -->
    <div class="form-side">
      <div class="card">
        <h2>注册账号 <span class="dot"></span></h2>
        <p class="tip">请填写以下信息完成注册，所有字段均为必填</p>
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="form-grid">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="登录账号（英文/数字）" />
          </el-form-item>
          <el-form-item label="真实姓名" prop="realName">
            <el-input v-model="form.realName" placeholder="请输入真实姓名" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" placeholder="至少 6 位" show-password />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirm">
            <el-input v-model="form.confirm" type="password" placeholder="再次输入密码" show-password />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="11 位手机号" />
          </el-form-item>
          <el-form-item label="身份角色" prop="role">
            <el-select v-model="form.role" placeholder="选择角色" class="full">
              <el-option v-for="r in roleOpts" :key="r.value" :label="r.label" :value="r.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="所属园区/基地" prop="parkName" class="full">
            <el-select v-model="form.parkName" placeholder="请选择" class="full" filterable allow-create>
              <el-option v-for="p in parkOpts" :key="p" :label="p" :value="p" />
            </el-select>
          </el-form-item>
          <el-form-item prop="agree" class="full">
            <el-checkbox v-model="form.agree">我已阅读并同意《智慧农业平台用户协议》和《隐私政策》</el-checkbox>
          </el-form-item>
          <el-form-item class="full">
            <el-button class="login-btn" type="primary" :loading="loading" @click="onSubmit">立即注册</el-button>
          </el-form-item>
        </el-form>
        <div class="foot">
          已有账号？<router-link to="/login">返回登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { registerUser, roleLabel } from '../mock/users'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const roleOpts = Object.entries(roleLabel).filter(([v]) => v !== 'admin').map(([value, label]) => ({ value, label }))

const parkOpts = [
  '智慧农业示范园区',
  '沙坪坝种植基地',
  '渝北果园基地',
  '北碚水产养殖基地',
  '跨园区指导',
]

const form = reactive({
  username: '',
  realName: '',
  password: '',
  confirm: '',
  phone: '',
  role: 'farmer',
  parkName: '沙坪坝种植基地',
  agree: false,
})

const rules = {
  username:  [{ required:true, message:'请输入用户名', trigger:'blur' }],
  realName:  [{ required:true, message:'请输入真实姓名', trigger:'blur' }],
  password:  [{ required:true, min:6, message:'密码至少 6 位', trigger:'blur' }],
  confirm: [
    { required:true, message:'请再次输入密码', trigger:'blur' },
    { validator: (_,v,cb) => v === form.password ? cb() : cb(new Error('两次密码不一致')), trigger:'blur' },
  ],
  phone: [
    { required:true, message:'请输入手机号', trigger:'blur' },
    { pattern:/^1[3-9]\d{9}$/, message:'手机号格式不正确', trigger:'blur' },
  ],
  role:    [{ required:true, message:'请选择角色', trigger:'change' }],
  parkName:[{ required:true, message:'请选择所属园区', trigger:'change' }],
  agree:   [{ validator: (_,v,cb) => v ? cb() : cb(new Error('请先勾选同意协议')), trigger:'change' }],
}

function onSubmit() {
  formRef.value.validate(ok => {
    if (!ok) return
    loading.value = true
    setTimeout(() => {
      const res = registerUser({
        username: form.username,
        password: form.password,
        realName: form.realName,
        phone: form.phone,
        role: form.role,
        parkName: form.parkName,
      })
      loading.value = false
      if (!res.ok) { ElMessage.error(res.msg); return }
      ElMessage.success('注册成功，请使用账号密码登录')
      router.replace('/login')
    }, 250)
  })
}
</script>

<style scoped>
.login-wrap { min-height: 100vh; display: grid; grid-template-columns: 1.1fr 1fr; }
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
.features { display:flex; flex-direction:column; gap:14px; }
.ft { display:flex; align-items:center; gap:14px; background: rgba(255,255,255,.14); border-radius: 12px; padding: 14px 18px; backdrop-filter: blur(6px); }
.ft i { width: 42px; height:42px; border-radius:10px; background:#fff; color:#2fbf7a; display:flex; align-items:center; justify-content:center; font-size:20px; font-style:normal; font-weight:700; }
.ft b { display:block; font-size: 14px; margin-bottom: 2px; }
.ft span { font-size: 12px; opacity: .85; }

.form-side { display:flex; align-items:center; justify-content:center; padding: 40px 20px; background: linear-gradient(180deg,#f7fcf9,#edf5f0); }
.card { background:#fff; border-radius: 20px; box-shadow: 0 10px 40px rgba(31,120,75,.1); padding: 32px 36px; width: 100%; max-width: 560px; }
.card h2 { font-size: 22px; color: #1c2b23; display:flex; align-items:center; gap: 10px; }
.card h2 .dot { width: 10px; height: 10px; border-radius: 50%; background: linear-gradient(135deg,#4cd98f,#2fbf7a); }
.tip { color: #8fa095; font-size: 12.5px; margin: 6px 0 18px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 18px; }
.form-grid .full { grid-column: 1 / -1; }
.login-btn { width:100%; height: 44px; font-size: 15px; letter-spacing: 4px; }
.foot { text-align:center; color: #8fa095; font-size: 13px; }
.foot a { color: #2fbf7a; text-decoration: none; margin-left: 4px; }
.full { width:100%; }

@media (max-width: 900px) {
  .login-wrap { grid-template-columns: 1fr; }
  .brand { display: none; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>
