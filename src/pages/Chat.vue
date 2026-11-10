<template>
  <div class="chat-layout" ref="chatWrap">
    <!-- 左侧联系人 -->
    <aside class="chat-side">
      <div class="side-header">联系人列表</div>
      <el-input v-model="sideKeyword" placeholder="🔍 搜索" clearable size="small" style="margin:10px" />

      <div class="nav-group">
        <div class="nav-title">在线农技专家</div>
        <div v-for="c in filterContacts(experts)" :key="c.id" class="g" :class="{sel: selectedContact?.id===c.id}" @click="selectContact(c)">
          <el-avatar :style="{background:'linear-gradient(135deg,#2fbf7a,#1f9d5c)'}">{{ c.name[0] }}</el-avatar>
          <div class="c-name">{{ c.name }}</div>
          <el-tag size="small" type="success">{{ c.role }}</el-tag>
        </div>
      </div>

      <div class="nav-group">
        <div class="nav-title">在线农户</div>
        <div v-for="c in filterContacts(farmers)" :key="c.id" class="g" :class="{sel: selectedContact?.id===c.id}" @click="selectContact(c)">
          <el-avatar :style="{background:'linear-gradient(135deg,#3b82c4,#2768a3)'}">{{ c.name[0] }}</el-avatar>
          <div class="c-name">{{ c.name }}</div>
          <el-tag size="small">{{ c.role }}</el-tag>
        </div>
      </div>

      <div class="nav-group">
        <div class="nav-title">系统通知</div>
        <div v-for="c in filterContacts(systems)" :key="c.id" class="g" :class="{sel: selectedContact?.id===c.id}" @click="selectContact(c)">
          <el-avatar :style="{background:'linear-gradient(135deg,#e8a33d,#c27b1f)'}">{{ c.name[0] }}</el-avatar>
          <div class="c-name">{{ c.name }}</div>
          <el-tag size="small" type="warning">{{ c.role }}</el-tag>
        </div>
      </div>
    </aside>

    <!-- 中间聊天 -->
    <section class="chat-mid">
      <header class="mid-head" v-if="selectedContact">
        <el-avatar :size="32" :style="{background:'linear-gradient(135deg,#2fbf7a,#1f9d5c)'}">{{ selectedContact.name[0] }}</el-avatar>
        <div>
          <div class="m-name">{{ selectedContact.name }} <span class="dot">●</span></div>
          <div class="m-sub"><span class="tag gray">{{ selectedContact.role }}</span> · 在线</div>
        </div>
      </header>
      <header v-else class="mid-head">👈 请选择左侧联系人开始对话</header>

      <div class="msg-list" ref="msgList">
        <template v-for="(msg, i) in chatMessages" :key="i">
          <div v-if="msg.isNotice" class="tag gray sys-notice">{{ msg.text }}</div>
          <div v-else :class="['msg-row', msg.me ? 'me' : 'other']">
            <div class="bubble">{{ msg.text }}</div>
            <div class="time">{{ msg.time }}</div>
          </div>
        </template>
      </div>

      <div class="mid-input">
        <el-input v-model="inputMsg" type="textarea" :rows="3" placeholder="输入消息..." @keydown.enter.exact.prevent="send" />
        <div class="btns">
          <el-button><el-icon><Paperclip /></el-icon>附件</el-button>
          <el-button><el-icon><Sunny /></el-icon>表情</el-button>
          <el-button type="primary" @click="send" style="margin-left:auto">发送</el-button>
        </div>
      </div>
    </section>

    <!-- 右侧面板 -->
    <aside class="chat-right" v-if="selectedContact">
      <div class="card">
        <h3>👤 详细信息</h3>
        <div style="text-align:center; padding:10px 0">
          <el-avatar :size="64" :style="{background:'linear-gradient(135deg,#2fbf7a,#1f9d5c)', fontSize:'26px'}">{{ selectedContact.name[0] }}</el-avatar>
          <div style="font-weight:700; font-size:15px; margin-top:8px">{{ selectedContact.name }}</div>
          <div class="tag blue" style="margin-top:4px">{{ selectedContact.role }}</div>
        </div>
        <div class="mini-info">
          <div><span>园区</span>{{ selectedContact.parkName || '智慧农业示范园' }}</div>
          <div><span>手机</span>{{ selectedContact.phone || '138****8888' }}</div>
        </div>
      </div>

      <div class="card">
        <h3>⚡ 快捷操作</h3>
        <div class="pills">
          <el-button size="small" @click="$router.push('/videocall')">📹 发起视频通话</el-button>
          <el-button size="small">📋 下发技术方案</el-button>
          <el-button size="small">📷 共享田间照片</el-button>
        </div>
      </div>

      <div class="card">
        <h3>📎 历史附件</h3>
        <div class="attachs">
          <a v-for="a in attachs" :key="a" class="attach-link">📄 {{ a }}</a>
        </div>
      </div>
    </aside>
    <aside class="chat-right" v-else>
      <div class="card" style="text-align:center; padding:40px 20px; color:var(--ink3)">
        请在左侧选择联系人
      </div>
    </aside>
  </div>
</template>

<script setup>
import { reactive, ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const experts = [
  { id:'e1', name:'王农技', role:'农技专家', parkName:'3号大棚园区', phone:'139****2222' },
  { id:'e2', name:'刘植保', role:'植保专家', parkName:'果园监测站', phone:'139****3333' },
  { id:'e3', name:'赵土肥', role:'土壤专家', parkName:'大田示范区', phone:'139****4444' },
]
const farmers = [
  { id:'f1', name:'李农夫', role:'农户', parkName:'5号大田', phone:'137****1111' },
  { id:'f2', name:'张农工', role:'农工', parkName:'1号果园', phone:'136****2222' },
  { id:'f3', name:'陈水产', role:'水产户', parkName:'2号水产塘', phone:'135****3333' },
  { id:'f4', name:'孙菜农', role:'菜农', parkName:'3号大棚', phone:'134****4444' },
]
const systems = [
  { id:'s1', name:'系统告警', role:'系统', parkName:'-', phone:'-' },
  { id:'s2', name:'AI助手', role:'智能', parkName:'AI平台', phone:'-' },
]

const allContacts = [...experts, ...farmers, ...systems]
const sideKeyword = ref('')
const selectedContact = ref(null)
const inputMsg = ref('')
const msgList = ref(null)

const chatMessages = ref([])

function filterContacts(list) {
  if (!sideKeyword.value) return list
  return list.filter(c => (c.name + c.role).toLowerCase().includes(sideKeyword.value.toLowerCase()))
}

function timeStr() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function selectContact(c) {
  selectedContact.value = c
  chatMessages.value = [
    { isNotice: true, text: `2026-11-10 · ${c.name} 为您下发了《番茄灰霉病防治方案》` },
    { me: false, text: '您好！最近番茄长势怎么样？遇到病虫害了吗？', time: '09:02' },
    { me: true,  text: '你好王老师！最近有些叶片发黄，怀疑是灰霉病。', time: '09:05' },
    { me: false, text: '那要注意通风降湿，我已经把方案发给您了，先按照上面用药。', time: '09:06' },
    { isNotice: true, text: '2026-11-10 10:30 · 附件《农药安全间隔期一览表.pdf》 已发送' },
  ]
  nextTick(scrollBottom)
}

function scrollBottom() {
  msgList.value?.scrollTo({ top: msgList.value.scrollHeight, behavior: 'smooth' })
}

function send() {
  if (!inputMsg.value.trim() || !selectedContact.value) return
  chatMessages.value.push({ me: true, text: inputMsg.value.trim(), time: timeStr() })
  inputMsg.value = ''
  nextTick(scrollBottom)
  // 模拟回复
  setTimeout(() => {
    chatMessages.value.push({ me: false, text: '收到，我看一下~', time: timeStr() })
    nextTick(scrollBottom)
  }, 600)
}

const attachs = [
  '番茄灰霉病诊断报告.pdf',
  '农药安全间隔期一览表.pdf',
  '大棚通风管理要点.docx',
]

onMounted(() => { selectContact(experts[0]) })
</script>

<style scoped>
.chat-layout {
  display: flex; gap: 12px;
  height: calc(100vh - 100px);
  min-height: 620px;
}
.chat-side { width: 240px; background: #fff; border: 1px solid var(--line); border-radius: var(--r); overflow-y: auto; flex-shrink: 0; box-shadow: var(--shadow); }
.side-header { padding: 14px 16px; font-weight: 700; font-size: 14.5px; border-bottom: 1px solid var(--line); }
.nav-group .nav-title { font-size: 12px; color: var(--ink3); padding: 10px 16px 4px; text-transform: uppercase; letter-spacing: .5px; }
.nav-group .g { display: flex; align-items: center; gap: 8px; padding: 10px 16px; cursor: pointer; transition: .15s; }
.nav-group .g:hover { background: var(--pri-ll); }
.nav-group .g.sel { background: var(--pri-l); border-left: 3px solid var(--pri); }
.nav-group .c-name { flex: 1; font-size: 13.5px; font-weight: 600; }

.chat-mid { flex: 1; background: #fff; border: 1px solid var(--line); border-radius: var(--r); display: flex; flex-direction: column; overflow: hidden; box-shadow: var(--shadow); }
.mid-head { padding: 12px 16px; border-bottom: 1px solid var(--line); display: flex; gap: 10px; align-items: center; }
.m-name { font-weight: 700; }
.m-name .dot { color: #2fbf7a; font-size: 10px; margin-left: 4px; }
.m-sub { font-size: 12px; color: var(--ink2); }
.msg-list { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px; }
.msg-row { display: flex; flex-direction: column; max-width: 70%; }
.msg-row.me { align-self: flex-end; align-items: flex-end; }
.msg-row.other { align-self: flex-start; }
.bubble { padding: 10px 14px; border-radius: 14px; line-height: 1.55; font-size: 13.5px; word-break: break-word; }
.msg-row.me .bubble { background: var(--pri); color: #fff; border-top-left-radius: 2px; }
.msg-row.other .bubble { background: #fff; border: 1px solid var(--line); border-top-right-radius: 2px; }
.time { font-size: 11px; color: var(--ink3); margin-top: 4px; }
.sys-notice { align-self: center; text-align: center; font-size: 12px; max-width: 90%; }

.mid-input { border-top: 1px solid var(--line); padding: 10px 14px; }
.mid-input .btns { display: flex; gap: 8px; margin-top: 8px; align-items: center; }

.chat-right { width: 320px; display: flex; flex-direction: column; gap: 14px; flex-shrink: 0; overflow-y: auto; }
.mini-info > div { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed var(--line); font-size: 12.5px; }
.mini-info > div span { color: var(--ink3); }
.pills { display: flex; flex-wrap: wrap; gap: 8px; }
.attach-link { display: block; padding: 6px 0; color: var(--pri); text-decoration: none; font-size: 13px; border-bottom: 1px dashed var(--line); }
.attach-link:hover { text-decoration: underline; }
</style>
