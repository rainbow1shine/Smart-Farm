<template>
  <div>
    <div class="g2 mb">
      <!-- 批次溯源档案 -->
      <div class="card">
        <h3>🔗 批次溯源档案</h3>
        <table class="tbl">
          <thead><tr><th>溯源ID</th><th>批次</th><th>产品</th><th>地块</th><th>日期</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="t in store.traces" :key="t.id">
              <td>{{ t.id }}</td>
              <td>{{ t.batch }}</td>
              <td>{{ t.product }}</td>
              <td>{{ t.field }}</td>
              <td>{{ t.date }}</td>
              <td><span :class="['tag', t.status==='正常'?'ok':'bad']">{{ t.status }}</span></td>
              <td class="actions">
                <el-button size="small" type="success" @click="genQr(t)">生成溯源二维码</el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 问题批次召回 -->
      <div class="card" style="border-color:#fbdcd9; box-shadow:0 4px 18px rgba(224,82,74,.1)">
        <h3 style="color:#c23b31">🚨 问题批次召回</h3>
        <table class="tbl">
          <thead><tr><th>批次</th><th>产品</th><th>问题描述</th><th>日期</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="t in problems" :key="t.id">
              <td>{{ t.batch }}</td>
              <td>{{ t.product }}</td>
              <td style="color:#c23b31">{{ t.testReport }}</td>
              <td>{{ t.reportDate }}</td>
              <td class="actions">
                <el-button size="small" type="danger" @click="notify(t)">通知农户</el-button>
                <el-button size="small" type="warning" @click="recall(t)">启动召回</el-button>
              </td>
            </tr>
            <tr v-if="problems.length===0"><td colspan="5" style="text-align:center; color:var(--ink3)">暂无问题批次 ✅</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 农残检测录入 -->
    <div class="card">
      <h3>🧪 农残检测录入</h3>
      <div class="form-grid">
        <div class="form-item">
          <label>选择批次</label>
          <el-select v-model="testForm.batch" filterable placeholder="请选择批次" style="width:100%">
            <el-option v-for="h in store.harvests" :key="h.id" :label="h.id + ' · ' + h.crop" :value="h.id" />
          </el-select>
        </div>
        <div class="form-item">
          <label>检测日期</label>
          <el-date-picker v-model="testForm.date" type="date" value-format="YYYY-MM-DD" style="width:100%" />
        </div>
        <div class="form-item full">
          <label>检测报告</label>
          <el-input v-model="testForm.testReport" type="textarea" :rows="3" placeholder="录入农残检测结果..." />
        </div>
        <div class="form-item">
          <label style="display:block; margin-bottom:6px">附件上传</label>
          <el-button><el-icon><UploadFilled /></el-icon> 上传检测报告</el-button>
        </div>
        <div class="form-item" style="display:flex; align-items:flex-end">
          <el-button type="primary" @click="submitTest" style="width:160px">📤 提交检测结果</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { store, updateRow, addRow } from '../stores/tableStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const problems = computed(() => store.traces.filter(t => t.status === '问题批次'))

const testForm = reactive({ batch: '', date: '', testReport: '' })

function genQr(t) { ElMessage.success('二维码已生成，保存至生成目录') }
function notify(t) { ElMessage.success('已通知农户：' + t.batch) }
function recall(t) {
  ElMessageBox.confirm(`确定对批次 ${t.batch} 启动召回？`, '召回确认', { type: 'warning' })
    .then(() => { updateRow('traces', t.id, { status: '召回中' }); ElMessage.success('召回流程已启动') }).catch(()=>{})
}

function submitTest() {
  if (!testForm.batch || !testForm.testReport) { ElMessage.warning('请选择批次并填写检测报告'); return }
  const trace = store.traces.find(t => t.batch === testForm.batch)
  if (trace) {
    updateRow('traces', trace.id, { testReport: testForm.testReport, reportDate: testForm.date || new Date().toISOString().slice(0,10), status: testForm.testReport.includes('超标') ? '问题批次' : '正常' })
  } else {
    addRow('traces', {
      id: 'T-' + String(Date.now()).slice(-6),
      batch: testForm.batch,
      product: testForm.batch,
      field: '-',
      date: testForm.date || new Date().toISOString().slice(0,10),
      testReport: testForm.testReport,
      reportDate: testForm.date || new Date().toISOString().slice(0,10),
      status: testForm.testReport.includes('超标') ? '问题批次' : '正常',
    })
  }
  ElMessage.success('农残检测结果已提交')
  Object.assign(testForm, { batch: '', date: '', testReport: '' })
}
</script>

<style scoped>
.mb { margin-bottom: 14px; }
.form-item label { font-size: 12.5px; color: var(--ink2); margin-bottom: 6px; display: block; }
</style>
