<template>
  <div class="nf">
    <div class="nf-inner">
      <div class="nf-num">404</div>
      <div class="nf-title">抱歉，您访问的页面不存在</div>
      <div class="nf-desc">可能是链接已失效，或您没有访问该页面的权限</div>
      <el-button type="primary" size="large" class="btn-back" @click="$router.push('/dashboard')">返回主页</el-button>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.nf { min-height: 100vh; display:flex; align-items:center; justify-content:center; background: linear-gradient(180deg,#f1f8f3 0%,#e8f3ec 100%); }
.nf-inner { text-align: center; }
.nf-num {
  font-size: 160px; font-weight: 800; line-height: 1;
  background: linear-gradient(135deg,#4cd98f,#2fbf7a,#1f9d5c);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 14px;
  letter-spacing: -6px;
}
.nf-title { font-size: 22px; color: #1c2b23; margin-bottom: 10px; font-weight: 600; }
.nf-desc { color: #8fa095; font-size: 13px; margin-bottom: 30px; }
.btn-back { padding: 0 30px; height: 42px; font-size: 15px; letter-spacing: 2px; }
</style>
