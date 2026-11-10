<template>
  <div class="vc-layout">
    <!-- 左侧主视频 -->
    <div class="vc-main">
      <div class="vc-video">
        <div class="vc-emoji">🎥</div>
        <div class="vc-wait">等待对方加入...</div>

        <!-- 右上角小窗 -->
        <div class="vc-floating">
          <div class="vc-f-label">📷 我的画面</div>
        </div>

        <!-- 计时 -->
        <el-tag class="vc-timer" effect="dark" type="success">00:02:35</el-tag>

        <!-- 控制栏 -->
        <div class="vc-ctrl">
          <div class="pill-btn hangup" @click="hangup">
            <el-icon><PhoneFilled /></el-icon><span>挂断</span>
          </div>
          <div class="pill-btn"><el-icon><Microphone /></el-icon><span>静音</span></div>
          <div class="pill-btn"><el-icon><VideoCameraFilled /></el-icon><span>摄像头</span></div>
          <div class="pill-btn"><el-icon><Monitor /></el-icon><span>屏幕共享</span></div>
          <el-dropdown>
            <div class="pill-btn"><el-icon><UserFilled /></el-icon><span>邀请参会</span></div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="p in inviteList" :key="p">{{ p }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <div class="pill-btn"><el-icon><MoreFilled /></el-icon><span>更多</span></div>
        </div>
      </div>
    </div>

    <!-- 右侧面板 -->
    <aside class="vc-side">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="实时聊天" name="chat">
          <div class="side-msg-list">
            <div class="tag gray sys-c" style="text-align:center; margin: 6px auto; display:block">2026-11-10 · 会议开始</div>
            <div class="side-msg other">
              <div class="b">大家好！今天讨论番茄灰霉病防治</div>
            </div>
            <div class="side-msg me">
              <div class="b">好的王老师，我这边大棚3号的情况比较紧急</div>
            </div>
            <div class="side-msg other">
              <div class="b">好的，我们先看一下现场监控画面</div>
            </div>
            <div class="side-msg other">
              <div class="b">李农夫 现在方便共享一下田间画面吗？</div>
            </div>
          </div>
          <div class="side-input">
            <el-input v-model="sideInput" placeholder="输入消息..." size="small" @keydown.enter.exact.prevent="sendSide" />
            <el-button type="primary" size="small" @click="sendSide">发送</el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="参会人员 (3)" name="people">
          <div class="people-list">
            <div v-for="p in participants" :key="p.name" class="people-item">
              <div class="av-box">
                <el-avatar :style="{background:p.color}">{{ p.name[0] }}</el-avatar>
                <span class="online-dot" v-if="p.online"></span>
              </div>
              <div class="p-info">
                <div class="p-name">{{ p.name }} <span v-if="p.host" class="tag ok" style="margin-left:4px">主持人</span></div>
                <div class="p-role">{{ p.role }}</div>
              </div>
              <div class="p-indicators">
                <el-icon :style="{color:p.mic?'#2fbf7a':'#b0b8b3'}"><Microphone /></el-icon>
                <el-icon :style="{color:p.cam?'#2fbf7a':'#b0b8b3'}"><VideoCameraFilled /></el-icon>
              </div>
              <el-tag v-if="p.pending" type="warning" size="small">申请中</el-tag>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <div class="vc-quick">
        <el-button class="qbtn" size="small">📷 拍摄照片</el-button>
        <el-button class="qbtn" size="small">📎 发送文件</el-button>
        <el-button class="qbtn" size="small">🖊️ 标注屏幕</el-button>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const activeTab = ref('chat')
const sideInput = ref('')
const inviteList = ['李农夫 - 农户', '陈水产 - 水产户', '孙菜农 - 菜农']

const participants = [
  { name:'王农技', role:'农技专家', host:true, online:true, mic:true, cam:true, color:'linear-gradient(135deg,#2fbf7a,#1f9d5c)' },
  { name:'李农夫', role:'农户', host:false, online:true, mic:false, cam:true, color:'linear-gradient(135deg,#3b82c4,#2768a3)' },
  { name:'张农工', role:'农工', host:false, online:false, mic:false, cam:false, pending:true, color:'linear-gradient(135deg,#e8a33d,#c27b1f)' },
]

const sideMsgs = ref([
  { me:false, text:'大家好！今天讨论番茄灰霉病防治', sys:false },
  { me:true, text:'好的王老师，我这边大棚3号的情况比较紧急', sys:false },
  { me:false, text:'好的，我们先看一下现场监控画面', sys:false },
  { me:false, text:'李农夫 现在方便共享一下田间画面吗？', sys:false },
])

function hangup() {
  ElMessageBox.confirm('确定结束本次通话？', '挂断确认', { type: 'warning' })
    .then(() => { ElMessage.success('通话已结束'); router.back() }).catch(()=>{})
}

function sendSide() {
  if (!sideInput.value.trim()) return
  sideMsgs.value.push({ me: true, text: sideInput.value.trim() })
  sideInput.value = ''
  setTimeout(() => {
    sideMsgs.value.push({ me: false, text: '收到~' })
  }, 600)
}
</script>

<style scoped>
.vc-layout { display: grid; grid-template-columns: 1fr 300px; gap: 16px; height: calc(100vh - 100px); min-height: 560px; }
.vc-main { display: flex; flex-direction: column; }
.vc-video {
  position: relative;
  background: #1a2e20;
  border-radius: 14px;
  min-height: 520px;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow);
  overflow: hidden;
}
.vc-emoji { font-size: 60px; opacity: .35; }
.vc-wait { color: rgba(255,255,255,.7); margin-top: 14px; font-size: 14px; }

.vc-floating {
  position: absolute; top: 20px; right: 20px;
  width: 140px; height: 90px;
  background: #22402e; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; color: rgba(255,255,255,.8);
  border: 1px solid rgba(255,255,255,.15);
}
.vc-timer { position: absolute; top: 20px; left: 20px; font-family: monospace; }

.vc-ctrl {
  position: absolute; bottom: 24px;
  display: flex; gap: 14px;
}
.pill-btn {
  background: rgba(0,0,0,.55);
  color: #fff; border-radius: 999px;
  padding: 10px 22px;
  display: flex; align-items: center; gap: 6px;
  cursor: pointer; transition: .2s;
  font-size: 13px;
}
.pill-btn:hover { background: rgba(0,0,0,.75); transform: translateY(-1px); }
.pill-btn.hangup { background: #e0524a; }
.pill-btn.hangup:hover { background: #c23b31; }

.vc-side { background: #fff; border-radius: 14px; border: 1px solid var(--line); padding: 12px; box-shadow: var(--shadow); display: flex; flex-direction: column; overflow: hidden; }
.side-msg-list { flex: 1; overflow-y: auto; max-height: calc(100% - 180px); padding: 6px; }
.side-msg { margin: 8px 0; }
.side-msg .b { padding: 8px 12px; border-radius: 12px; font-size: 13px; max-width: 85%; }
.side-msg.me { text-align: right; }
.side-msg.me .b { background: var(--pri); color: #fff; display: inline-block; border-top-left-radius: 2px; }
.side-msg.other .b { background: var(--pri-ll); color: var(--ink); border-top-right-radius: 2px; }
.side-input { display: flex; gap: 8px; padding-top: 10px; border-top: 1px solid var(--line); }

.people-list { padding: 6px; overflow-y: auto; max-height: calc(100vh - 300px); }
.people-item { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 10px; margin-bottom: 6px; transition: .15s; }
.people-item:hover { background: var(--pri-ll); }
.av-box { position: relative; }
.av-box .online-dot {
  position: absolute; bottom: -2px; right: -2px; width: 10px; height: 10px;
  background: #2fbf7a; border-radius: 50%; border: 2px solid #fff;
}
.p-info { flex: 1; }
.p-name { font-weight: 600; font-size: 13.5px; }
.p-role { font-size: 11.5px; color: var(--ink3); }
.p-indicators { display: flex; gap: 6px; font-size: 16px; }

.vc-quick { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
.qbtn { background: linear-gradient(135deg,#4cd98f,#2fbf7a); color: #fff; border: none; }
.qbtn:hover { background: var(--pri-d); }
</style>
