<template>
  <article class="product-card">
    <div class="pc-media" @click="go">
      <span class="pc-tag">{{ goods.tag }}</span>
      <span v-if="goods.trace && goods.trace !== '—'" class="pc-trace">可溯源</span>
      <span class="pc-emoji">{{ goods.icon || '🌱' }}</span>
      <button class="pc-fav" :class="{ on: favorite }" :aria-label="favorite ? '取消收藏' : '收藏'" @click.stop="$emit('fav', goods)">
        {{ favorite ? '♥' : '♡' }}
      </button>
    </div>
    <div class="pc-body" @click="go">
      <h3>{{ goods.name }}</h3>
      <p class="spec">{{ goods.spec }}</p>
      <p class="plot"><el-icon><Location /></el-icon>{{ goods.plot }}</p>
      <p class="sold">已售 {{ goods.sold }} · 库存 {{ goods.stock }}</p>
      <div class="pc-foot">
        <div class="price">¥{{ goods.price }}<small>/份</small></div>
        <button class="add" aria-label="加入购物车" @click.stop="$emit('add', goods)">
          <el-icon><Plus /></el-icon>
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
const props = defineProps({ goods: Object, favorite: Boolean })
const emit = defineEmits(['add', 'fav', 'open'])
const go = () => emit('open', props.goods)
</script>

<style scoped>
.product-card { background: #fff; border: 1px solid var(--line); border-radius: 18px; overflow: hidden; transition: transform .22s, box-shadow .22s, border-color .22s; }
.product-card:hover { transform: translateY(-4px); box-shadow: var(--shadow); border-color: var(--brand-200); }
.pc-media { position: relative; height: 178px; display: grid; place-items: center; cursor: pointer; background: linear-gradient(135deg, #f0f8ef, #dcecdc); }
.pc-media::after { content: ""; position: absolute; inset: auto -20% -55% -20%; height: 120px; border-radius: 50%; background: rgba(255,255,255,.38); }
.pc-emoji { font-size: 62px; line-height: 1; position: relative; z-index: 1; filter: drop-shadow(0 8px 12px rgba(32, 80, 42, .16)); transition: transform .22s; }
.product-card:hover .pc-emoji { transform: scale(1.08) rotate(-3deg); }
.pc-tag { position: absolute; left: 12px; top: 12px; z-index: 2; background: rgba(255,255,255,.86); backdrop-filter: blur(6px); color: var(--brand-700); font-size: 10.5px; padding: 3px 8px; border-radius: 20px; }
.pc-trace { position: absolute; right: 12px; top: 12px; z-index: 2; background: rgba(44, 75, 51, .82); color: #e5f2d8; font-size: 10.5px; padding: 3px 8px; border-radius: 20px; display: inline-flex; align-items: center; gap: 3px; }
.pc-fav { position: absolute; right: 11px; bottom: 11px; z-index: 3; width: 30px; height: 30px; border-radius: 50%; border: 1px solid rgba(255,255,255,.6); background: rgba(255,255,255,.76); backdrop-filter: blur(6px); color: #7b8b80; cursor: pointer; font-size: 16px; line-height: 1; }
.pc-fav.on { color: #d9534f; }
.pc-body { padding: 14px 15px 13px; cursor: pointer; }
.pc-body h3 { font-size: 14.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.spec { font-size: 11.5px; color: var(--ink-400); margin-top: 4px; }
.plot { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--ink-400); margin-top: 7px; }
.sold { font-size: 10.5px; color: var(--ink-300); margin-top: 4px; }
.pc-foot { display: flex; align-items: flex-end; margin-top: 10px; }
.price { font-size: 22px; font-weight: 700; color: #b5473d; letter-spacing: -.5px; line-height: 1; }
.price small { font-size: 10.5px; color: var(--ink-400); font-weight: 400; margin-left: 2px; }
.add { margin-left: auto; width: 32px; height: 32px; border-radius: 50%; border: none; background: var(--brand-600); color: #fff; cursor: pointer; display: grid; place-items: center; box-shadow: 0 4px 10px rgba(63,111,74,.25); transition: transform .15s, background .15s; }
.add:hover { background: var(--brand-500); transform: scale(1.06); }
@media (max-width: 620px) {
  .pc-media { height: 136px; }
  .pc-emoji { font-size: 46px; }
  .price { font-size: 19px; }
}
</style>
