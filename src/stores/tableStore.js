import { reactive, watch } from 'vue'

const LS_KEY = 'agri_tables_v1'

const seed = {
  envList: [
    { id:'E01', name:'3号大棚空气温度', value:24.6, unit:'℃', status:'ok', time:'2026-11-10 09:12' },
    { id:'E02', name:'3号大棚土壤湿度', value:58, unit:'%', status:'ok', time:'2026-11-10 09:12' },
    { id:'E03', name:'5号大田水体PH', value:7.2, unit:'', status:'warn', time:'2026-11-10 09:10' },
    { id:'E04', name:'园区气象站温度', value:19.8, unit:'℃', status:'ok', time:'2026-11-10 09:10' },
    { id:'E05', name:'光照强度', value:8432, unit:'lux', status:'ok', time:'2026-11-10 09:12' },
  ],
  controlDevices: [
    { id:'D01', name:'3号大棚水泵1', type:'水泵', location:'3号大棚', status:'on', auto:false },
    { id:'D02', name:'3号大棚电磁阀', type:'电磁阀', location:'3号大棚', status:'off', auto:true },
    { id:'D03', name:'3号大棚风机', type:'风机', location:'3号大棚', status:'on', auto:false },
    { id:'D04', name:'补光灯', type:'补光灯', location:'3号大棚', status:'off', auto:true },
    { id:'D05', name:'遮阳帘', type:'遮阳帘', location:'3号大棚', status:'open', auto:false },
    { id:'D06', name:'增氧机', type:'增氧机', location:'2号水产塘', status:'on', auto:true },
  ],
  controlStrategies: [
    { id:'S01', name:'高温自动通风', devices:['D03'], trigger:'温度>28℃', status:'启用' },
    { id:'S02', name:'定时灌溉', devices:['D01','D02'], trigger:'每天06:30', status:'启用' },
    { id:'S03', name:'低湿自动补水', devices:['D02'], trigger:'湿度<40%', status:'停用' },
  ],
  devices: [
    { id:'G01', name:'3号大棚网关', type:'网关', location:'3号大棚', online:true, lastSeen:'2026-11-10 09:12' },
    { id:'S01', name:'空气温度传感器', type:'传感器', location:'3号大棚', online:true, lastSeen:'2026-11-10 09:12' },
    { id:'S02', name:'土壤湿度传感器', type:'传感器', location:'3号大棚', online:true, lastSeen:'2026-11-10 09:12' },
    { id:'S03', name:'水体PH传感器', type:'传感器', location:'2号水产塘', online:false, lastSeen:'2026-11-09 22:05' },
    { id:'E01', name:'水泵1', type:'执行器', location:'3号大棚', online:true, lastSeen:'2026-11-10 09:12' },
    { id:'E02', name:'电磁阀', type:'执行器', location:'3号大棚', online:true, lastSeen:'2026-11-10 09:12' },
  ],
  fields: [
    { id:'F01', name:'3号大棚', type:'设施大棚', area:8, crop:'番茄', status:'正常', manager:'李农夫' },
    { id:'F02', name:'5号大田', type:'露地大田', area:120, crop:'玉米', status:'正常', manager:'李农夫' },
    { id:'F03', name:'1号果园', type:'果园', area:35, crop:'柑橘', status:'正常', manager:'李农夫' },
    { id:'F04', name:'2号水产塘', type:'水产养殖', area:15, crop:'鲫鱼', status:'低氧告警', manager:'李农夫' },
  ],
  farms: [
    { id:'WO-1102-01', type:'施肥', field:'3号大棚', planDate:'2026-11-05', assignee:'张农工', progress:'已完成', note:'复合肥15kg' },
    { id:'WO-1105-02', type:'打药', field:'3号大棚', planDate:'2026-11-08', assignee:'李农夫', progress:'进行中', note:'灰霉病防治' },
    { id:'WO-1107-03', type:'灌溉', field:'5号大田', planDate:'2026-11-10', assignee:'王农技', progress:'待执行', note:'土壤偏干' },
    { id:'WO-1108-04', type:'采收', field:'1号果园', planDate:'2026-11-12', assignee:'李农夫', progress:'待执行', note:'早熟柑橘' },
  ],
  agriMats: [
    { id:'M01', name:'复合肥15-15-15', type:'肥料', unit:'kg', stock:450, threshold:100, supplier:'金正大', expire:'2027-06' },
    { id:'M02', name:'吡虫啉', type:'农药', unit:'L', stock:32, threshold:20, supplier:'拜耳', expire:'2026-12' },
    { id:'M03', name:'滴灌带', type:'耗材', unit:'米', stock:800, threshold:200, supplier:'节水科技', expire:null },
    { id:'M04', name:'生物有机肥', type:'肥料', unit:'kg', stock:80, threshold:100, supplier:'绿源生物', expire:'2027-03' },
  ],
  harvests: [
    { id:'PC-20261105', product:'早熟番茄', field:'3号大棚', date:'2026-11-05', qty:128, unit:'kg', grade:'A级' },
    { id:'PC-20261108', product:'玉米', field:'5号大田', date:'2026-11-08', qty:3200, unit:'kg', grade:'B级' },
    { id:'PC-20261110', product:'鲫鱼', field:'2号水产塘', date:'2026-11-10', qty:56, unit:'kg', grade:'A级' },
  ],
  traces: [
    { id:'T-2026-045', batch:'PC-20261105', product:'早熟番茄', date:'2026-11-05', link:'扫码溯源二维码待生成', testReport:'农残检测合格', status:'正常' },
    { id:'T-2026-046', batch:'PC-20261108', product:'玉米', date:'2026-11-08', link:'待录入', testReport:'待上传', status:'待完善' },
  ],
  alarms: [
    { id:'A001', time:'2026-11-10 09:10', level:'紧急', type:'设备离线', location:'2号水产塘', content:'水体PH传感器离线', status:'处理中' },
    { id:'A002', time:'2026-11-10 08:45', level:'重要', type:'环境超限', location:'3号大棚', content:'3号大棚温度超过32℃', status:'未处理' },
    { id:'A003', time:'2026-11-10 07:20', level:'一般', type:'库存预警', location:'农资库', content:'生物有机肥库存低于阈值', status:'已闭环' },
    { id:'A004', time:'2026-11-09 22:05', level:'重要', type:'设备离线', location:'2号水产塘', content:'水体PH传感器离线', status:'已闭环' },
  ],
  products: [
    { id:'P01', name:'有机番茄', category:'蔬菜', price:12.8, unit:'元/斤', stock:560, origin:'沙坪坝种植基地', onSale:true },
    { id:'P02', name:'甜玉米', category:'粮食', price:4.5, unit:'元/斤', stock:3200, origin:'沙坪坝种植基地', onSale:true },
    { id:'P03', name:'早熟柑橘', category:'水果', price:8.8, unit:'元/斤', stock:420, origin:'渝北果园基地', onSale:true },
    { id:'P04', name:'生态鲫鱼', category:'水产', price:28, unit:'元/斤', stock:112, origin:'北碚水产养殖基地', onSale:true },
    { id:'P05', name:'土鸡', category:'畜禽', price:68, unit:'元/只', stock:35, origin:'北碚水产养殖基地', onSale:false },
    { id:'P06', name:'有机大米', category:'粮食', price:15.8, unit:'元/斤', stock:800, origin:'智慧农业示范园区', onSale:true },
  ],
  orders: [
    { id:'O-20261108001', customer:'赵顾客', product:'有机番茄', qty:20, amount:256, time:'2026-11-08 10:22', status:'待发货' },
    { id:'O-20261108002', customer:'孙老板', product:'甜玉米', qty:500, amount:2250, time:'2026-11-08 14:15', status:'已发货' },
    { id:'O-20261109001', customer:'周先生', product:'早熟柑橘', qty:80, amount:704, time:'2026-11-09 09:05', status:'待发货' },
    { id:'O-20261109002', customer:'钱女士', product:'生态鲫鱼', qty:10, amount:280, time:'2026-11-09 16:40', status:'已完成' },
    { id:'O-20261110001', customer:'吴先生', product:'有机大米', qty:30, amount:474, time:'2026-11-10 08:30', status:'待确认' },
  ],
  users: [
    { id:1, username:'admin', realName:'平台管理员', role:'admin', phone:'13800000001', status:'启用', createTime:'2026-03-15' },
    { id:2, username:'ops',   realName:'运维张工',   role:'ops',   phone:'13800000002', status:'启用', createTime:'2026-04-02' },
    { id:3, username:'farmer',realName:'李农夫',   role:'farmer',phone:'13800000003', status:'启用', createTime:'2026-05-18' },
    { id:4, username:'agri',  realName:'王农技',   role:'agri',  phone:'13800000004', status:'启用', createTime:'2026-05-20' },
    { id:5, username:'consumer',realName:'赵顾客', role:'consumer',phone:'13800000005', status:'启用', createTime:'2026-06-10' },
  ],
  logs: [
    { id:1, type:'登录', username:'admin', action:'登录系统', ip:'192.168.1.100', time:'2026-11-10 08:30:15' },
    { id:2, type:'操作', username:'farmer', action:'创建农事工单 WO-1107-03', ip:'192.168.1.105', time:'2026-11-10 07:45:22' },
    { id:3, type:'操作', username:'ops', action:'启用设备 S03（水体PH传感器）', ip:'192.168.1.102', time:'2026-11-09 18:20:08' },
    { id:4, type:'登录', username:'agri', action:'登录系统', ip:'192.168.1.103', time:'2026-11-09 09:10:33' },
    { id:5, type:'导出', username:'admin', action:'导出日志审计记录', ip:'192.168.1.100', time:'2026-11-08 16:50:12' },
  ],
  contacts: [
    { id:'C01', name:'王农技', role:'agri', status:'在线', lastMsg:'番茄灰霉病用异菌脲+咪鲜胺...', lastTime:'09:15' },
    { id:'C02', name:'张农工', role:'farmer', status:'在线', lastMsg:'今天3号大棚湿度达标', lastTime:'08:58' },
    { id:'C03', name:'刘农工', role:'farmer', status:'离线', lastMsg:'我下午去大田', lastTime:'昨天' },
  ],
  chatMessages: [
    { id:1, from:'C01', text:'李农夫你好，看到3号大棚番茄叶片有灰霉症状？', time:'09:12' },
    { id:2, from:'me',   text:'是的王老师，叶背有灰霉层，已经3天了', time:'09:13' },
    { id:3, from:'C01', text:'判断正确，建议用异菌脲500倍液叶面喷施，连打2次间隔5天', time:'09:14' },
    { id:4, from:'C01', text:'我已下发技术方案，点击右侧可查看', time:'09:15' },
    { id:5, from:'me',   text:'好的，马上安排！', time:'09:16' },
  ],
  videoParticipants: [
    { id:'V01', name:'王农技', role:'agri', host:true, mic:true, cam:true },
    { id:'V02', name:'李农夫', role:'farmer', host:false, mic:true, cam:true },
    { id:'V03', name:'张农工', role:'farmer', host:false, mic:false, cam:true, apply:true },
  ],
}

let loaded = null
try {
  const raw = localStorage.getItem(LS_KEY)
  if (raw) loaded = JSON.parse(raw)
} catch {}

const store = reactive(loaded || JSON.parse(JSON.stringify(seed)))

watch(store, () => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(store)) } catch {}
}, { deep: true })

export { store, seed }

// 增删改通用辅助
export function addRow(list, row) {
  list.unshift({
    id: (row.id || '') + '-' + Date.now().toString(36).slice(-4),
    createTime: new Date().toISOString().slice(0,19).replace('T',' '),
    ...row,
  })
}
export function updateRow(list, id, patch) {
  const row = list.find(x => x.id === id)
  if (row) Object.assign(row, patch)
}
export function removeRow(list, id) {
  const i = list.findIndex(x => x.id === id)
  if (i >= 0) list.splice(i, 1)
}
export function resetAll() {
  Object.assign(store, JSON.parse(JSON.stringify(seed)))
  try { localStorage.removeItem(LS_KEY) } catch {}
}
export function genId(prefix = 'ID') {
  return prefix + '-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase()
}
