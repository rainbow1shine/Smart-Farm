<template>
  <div class="nf-page">
    <div class="nf-card">
      <div class="nf-icon">
        <span>🌾</span>
        <i class="n1">🍅</i>
        <i class="n2">🥬</i>
      </div>
      <span class="nf-code">404 · PAGE NOT FOUND</span>
      <h1>这块地还没种上内容</h1>
      <p>你要找的页面可能已经下架、改名，或者链接输入有误。可以回商城逛逛，或者进入管理后台。</p>
      <div class="nf-actions">
        <el-button type="primary" size="large" @click="$router.push('/mall')">返回商城首页</el-button>
        <el-button size="large" @click="$router.push('/mall/products')">看看农产品</el-button>
      </div>
      <div class="nf-links">
        <router-link to="/mall/trace">产品溯源</router-link>
        <span>·</span>
        <router-link to="/admin/dashboard">管理后台</router-link>
        <span>·</span>
        <router-link to="/screen">可视化大屏</router-link>
        <span>·</span>
        <router-link to="/mobile">移动端预览</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.nf-page { min-height: 100vh; display: grid; place-items: center; padding: 30px 20px; background: radial-gradient(110% 90% at 50% 0%, #e8f2e0, #f7f5ee 58%); }
.nf-card { max-width: 620px; text-align: center; background: rgba(255,255,255,.72); border: 1px solid rgba(255,255,255,.9); border-radius: 24px; padding: 40px 36px 30px; box-shadow: 0 24px 60px rgba(31, 63, 39, .1); backdrop-filter: blur(8px); }
.nf-icon { position: relative; width: 140px; height: 130px; margin: 0 auto 14px; display: grid; place-items: center; background: linear-gradient(140deg, #e6f2dd, #cfe4c6); border-radius: 46% 54% 50% 50%; }
.nf-icon > span { font-size: 58px; filter: drop-shadow(0 10px 14px rgba(50,90,50,.15)); }
.nf-icon i { position: absolute; font-style: normal; font-size: 22px; }
.nf-icon .n1 { left: -4px; top: 16px; transform: rotate(-14deg); }
.nf-icon .n2 { right: 0; bottom: 10px; transform: rotate(11deg); }
.nf-code { font-size: 9.5px; letter-spacing: 2.2px; color: var(--brand-500); }
.nf-card h1 { font-size: 27px; margin: 8px 0 8px; letter-spacing: .3px; }
.nf-card > p { font-size: 12.5px; color: var(--ink-500); line-height: 1.9; max-width: 420px; margin: 0 auto 22px; }
.nf-actions { display: flex; justify-content: center; gap: 9px; flex-wrap: wrap; }
.nf-actions :deep(.el-button) { border-radius: 22px; }
.nf-links { display: flex; justify-content: center; gap: 8px; margin-top: 22px; padding-top: 16px; border-top: 1px solid rgba(212, 220, 205, .7); font-size: 11px; color: var(--ink-400); flex-wrap: wrap; }
.nf-links a:hover { color: var(--brand-600); }
@media (max-width: 520px) {
  .nf-card { padding: 30px 20px 24px; }
  .nf-icon { width: 112px; height: 104px; }
  .nf-icon > span { font-size: 46px; }
  .nf-card h1 { font-size: 22px; }
}
</style>
