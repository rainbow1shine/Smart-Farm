import DB from '@/data/db'

const S = (label, value, unit, foot, icon, tone) => ({ label, value, unit, foot, icon, tone })

const META = {
  dashboard: { title: '工作台', sub: '园区生产运行总览', custom: 'Dashboard' },
  user: { title: '用户管理', sub: '平台账号新增、修改、启停与查询', custom: 'UserManage' },
  role: { title: '角色管理', sub: '创建角色并为角色分配功能权限', custom: 'RoleManage' },
  perm: { title: '权限管理', sub: 'RBAC 菜单 / 功能 / 数据权限配置', custom: 'PermManage' },
  param: { title: '系统参数配置', sub: '字典数据 / 告警阈值 / 采集频率', custom: 'ParamManage' },
  log: { title: '日志审计', sub: '登录日志 / 操作日志 / 系统日志', collection: 'logs' },
  api: { title: '接口管理', sub: '对外 API 授权、调用记录与第三方对接', collection: 'apis' },
  'data-check': { title: '数据监管核查', sub: '园区生产统计 / 农残报告核查 / 溯源信息核查', collection: 'traces' },
  device: { title: '设备管理', sub: '网关、传感器、执行器增删改与通信状态监测', custom: 'DeviceManage' },
  'device-collect': { title: '采集管理', sub: '传感器接入注册 / 采集频率设置 / 掉线检测', custom: 'CollectManage' },
  ops: { title: '备份与恢复', sub: '系统备份、文件管理、恢复策略', custom: 'BackupManage' },
  'basic-plot': { title: '地块档案', sub: '基础信息维护 · 地块与大棚档案', collection: 'plots' },
  'basic-device': { title: '设备档案', sub: '基础数据：设备名称、类型、所属地块、通信状态、参数配置', collection: 'devices' },
  'basic-dict': { title: '字典与系统参数', sub: '基础数据：字典名称、字典值、采集频率、告警阈值', collection: 'dicts' },
  'basic-input': { title: '农资档案', sub: '基础数据：农资名称、类别、规格、供应商、库存数量', collection: 'inputs' },
  'mall-entry': { title: '消费者商城', sub: '农产品浏览 / 溯源查询 / 下单购买', custom: 'MallEntry' },
  mall: { title: '消费者商城', sub: '农产品浏览 / 溯源查询 / 下单购买', custom: 'MallEntry' },
  'farmer-repair': { title: '设备报修', sub: '发现设备故障时上报运维，跟踪维修进度', custom: 'RepairManage' },
  repair: { title: '报修工单', sub: '接单、到场、维修、闭环', custom: 'RepairManage' },
  'market-review': { title: '消费者评价', sub: '买家评价实时推送，可直接回复买家', custom: 'ReviewManage' },
  'goods-audit': { title: '商品监管', sub: '下架违规或质检不合格的农产品，并可警告卖家', custom: 'GoodsManage' },
  'consumer-ctl': { title: '消费者管理', sub: '警告、拉黑异常账号，保障交易秩序', custom: 'ConsumerManage' },
  'agri-rating': { title: '农艺师星级', sub: '农户对咨询服务的评分汇总，作为考核依据', collection: 'consults' },
  'expert-rating': { title: '我的服务评价', sub: '查看农户对每次咨询的星级评价与建议', collection: 'consults' },
  'expert-env': { title: '环境与长势查看', sub: '跨地块环境数据与作物长势对比', custom: 'ExpertEnv' },
  'expert-pest': { title: '病虫害诊断', sub: '农户问诊复核 / AI 辅助识别 / 防治方案', custom: 'PestDiagnosis' },
  'expert-plan': { title: '农事技术方案', sub: '按作物与生育期制定施肥、打药、灌溉方案', collection: 'techPlans' },
  'expert-supervise': { title: '农事工单督导', sub: '查看工单执行情况 / 提出技术整改意见', collection: 'supervise' },
  'expert-quality': { title: '采收质量评估', sub: '采收批次分级评估 / 采收时机建议', collection: 'harvests' },
  'expert-residue': { title: '农残报告查看', sub: '查看检测报告与文件 / 出具质量技术意见', collection: 'tests' },
  'market-goods': { title: '产品上架', sub: '农产品信息、图片、规格与价格管理', custom: 'GoodsManage' },
  'market-order': { title: '订单管理', sub: '客户下单 / 订单状态 / 发货管理', custom: 'OrderManage' },
  'market-sales': { title: '销售统计', sub: '销售额 / 销量 / 热销产品分析', custom: 'SalesReport' },
  'farm-plot': { title: '地块管理', sub: '地块与大棚档案、GIS 边界、作物档案', collection: 'plots' },
  'farm-workorder': { title: '农事工单管理', sub: '计划创建 / 派单 / 打卡 / 历史台账', custom: 'WorkOrders' },
  'farm-input': { title: '农资管理', sub: '出入库 / 库存预警 / 供应商 / 农药使用台账', custom: 'InputManage' },
  'farm-harvest': { title: '采收管理', sub: '批次登记 / 产量分级 / 采收统计', collection: 'harvests' },
  'farm-staff': { title: '人员管理', sub: '农户档案 / 角色权限 / 工时统计', collection: 'users' },
  trace: { title: '溯源信息录入', sub: '一物一码 / 批次关联 / 二维码生成', custom: 'TraceEntry' },
  'trace-test': { title: '农残检测管理', sub: '检测报告录入 / 检测文件上传 / 批次判定', collection: 'tests' },
  'env-monitor': { title: '环境监测', sub: '空气 / 土壤 / 水体 / 气象四类环境数据', custom: 'EnvMonitor' },
  video: { title: '视频监控', sub: '实时预览 / 录像回放 / 抓拍 / AI 视频识别', custom: 'VideoMonitor' },
  control: { title: '远程控制', sub: '手动控制 / 自动联动 / 定时任务 / 分组控制', custom: 'Control' },
  alarm: { title: '告警消息中心', sub: '多类型告警分级与闭环处置', custom: 'AlarmCenter' },
  gis: { title: 'GIS 地理信息', sub: '地块、设备点位、灌溉管网与空间统计', custom: 'GisMap' },
  ai: { title: 'AI 智能分析', sub: '长势分析 / 病虫害预警 / 水肥推荐 / 气象灾害预警', custom: 'AiAnalysis' },
  'data-report': { title: '数据中心与统计报表', sub: '环境月报 / 水肥消耗 / 设备运行 / 多维对比', custom: 'DataReport' },
  'farmer-consult': { title: '在线技术咨询', sub: '向农艺技术人员发请求、对话、视频', custom: 'Consult' },
  'agri-consult': { title: '农户咨询应答', sub: '接单、答复农户，支持视频连线', custom: 'Consult' }
}

export function getPageMeta(id) {
  return META[id] || { title: '页面', sub: '智慧农业综合管理平台' }
}

const tag = (prop, label, width) => ({ prop, label, type: 'tag', width })
const moneyCol = (prop, label, width) => ({ prop, label, type: 'money', width })

const CONFIG = {
  log: {
    stats: [
      S('日志总量', (s) => s.logs.length, '条', '近 24 小时', 'Document', 'info'),
      S('登录日志', (s) => s.logs.filter(x => x.type === '登录日志').length, '条', '成功 2 · 失败 1', 'User'),
      S('操作日志', (s) => s.logs.filter(x => x.type === '操作日志').length, '条', '覆盖 4 类角色', 'Edit'),
      S('失败记录', (s) => s.logs.filter(x => x.result === '失败').length, '条', '需关注', 'Warning', 'danger')
    ],
    columns: [
      { prop: 'time', label: '时间', width: 150 },
      { prop: 'user', label: '用户', width: 110 },
      { prop: 'role', label: '角色', width: 110 },
      { prop: 'ip', label: 'IP 地址', width: 130 },
      { prop: 'action', label: '操作内容', minWidth: 220 },
      tag('type', '类型', 100),
      tag('result', '结果', 90)
    ],
    filters: [
      { key: 'type', label: '日志类型', options: ['登录日志', '操作日志', '系统日志'].map(v => ({ label: v, value: v })) },
      { key: 'result', label: '结果', options: ['成功', '失败'].map(v => ({ label: v, value: v })) }
    ],
    rowActions: [{ key: 'view', label: '详情' }]
  },
  api: {
    stats: [
      S('接口总数', (s) => s.apis.length, '个', '内外部接口', 'Connection', 'info'),
      S('已授权', (s) => s.apis.filter(x => x.status === '已授权').length, '个', '运行稳定', 'CircleCheck'),
      S('累计调用', (s) => s.apis.reduce((a, b) => a + b.calls, 0).toLocaleString(), '次', '近 30 天', 'TrendCharts'),
      S('待配置', (s) => s.apis.filter(x => x.status === '待配置').length, '个', '需补充密钥', 'Warning', 'warn')
    ],
    columns: [
      { prop: 'name', label: '接口名称', minWidth: 180 },
      { prop: 'vendor', label: '提供方', width: 140 },
      { prop: 'url', label: '地址', minWidth: 240 },
      { prop: 'freq', label: '调用频率', width: 110 },
      tag('status', '状态', 90),
      { prop: 'calls', label: '调用次数', width: 100 },
      { prop: 'last', label: '最后调用', width: 150 }
    ],
    rowActions: [{ key: 'view', label: '详情' }, { key: 'toggle', label: '授权/停用' }]
  },
  'data-check': {
    stats: [
      S('溯源批次', (s) => s.traces.length, '批', '已发布 4 批', 'Ticket'),
      S('检测报告', (s) => s.tests.filter(t => t.result === '合格').length, '份', '全部合格', 'DocumentChecked'),
      S('采收记录', (s) => s.harvests.length, '批', '覆盖 4 个地块', 'Grape'),
      S('待核查', (s) => s.tests.filter(t => t.result === '检测中').length, '项', '需跟进', 'Warning', 'warn')
    ],
    notices: [{ text: '本周期共核查 4 个溯源批次，农残检测全部合格；1 个批次检测中，建议在上市前完成报告归档。', tone: 'success' }],
    charts: [
      {
        title: '各园区溯源批次', type: 'bar', span: 2,
        option: { tooltip: { trigger: 'axis' }, grid: { left: 40, right: 20, top: 30, bottom: 30 }, xAxis: { type: 'category', data: ['永川园区', '南川园区', '璧山基地'] }, yAxis: { type: 'value' }, series: [{ type: 'bar', data: [12, 6, 3], barWidth: 26, itemStyle: { color: '#5b8c62', borderRadius: [5, 5, 0, 0] } }] }
      },
      {
        title: '检测结果分布', type: 'pie', span: 2,
        option: { tooltip: { trigger: 'item' }, legend: { bottom: 0 }, series: [{ type: 'pie', radius: ['45%', '68%'], center: ['50%', '44%'], label: { formatter: '{b}\n{d}%' }, data: [{ name: '合格', value: 4, itemStyle: { color: '#5b8c62' } }, { name: '检测中', value: 1, itemStyle: { color: '#d1a14a' } }] }] }
      }
    ],
    columns: [
      { prop: 'code', label: '溯源码', width: 110 },
      { prop: 'crop', label: '作物', width: 130 },
      { prop: 'plot', label: '地块', minWidth: 150 },
      { prop: 'work', label: '农事记录', width: 120 },
      { prop: 'test', label: '检测结论', width: 120 },
      tag('status', '状态', 90)
    ],
    searchKeys: ['code', 'crop', 'plot', 'batch'],
    rowActions: [{ key: 'view', label: '核查' }]
  },
  'basic-plot': {
    stats: [
      S('地块总数', (s) => s.plots.length, '块', '3 个园区', 'MapLocation'),
      S('总面积', (s) => s.plots.reduce((a, b) => a + b.area, 0).toFixed(1), '亩', '设施 + 大田 + 水产', 'Crop'),
      S('接入设备', (s) => s.devices.length, '台', '在线率 93%', 'Cpu', 'info'),
      S('预警地块', (s) => s.plots.filter(p => p.status === '预警').length, '块', 'B区2号大田', 'Warning', 'warn')
    ],
    columns: [
      { prop: 'id', label: '地块编号', width: 110 },
      { prop: 'name', label: '地块名称', minWidth: 170 },
      { prop: 'park', label: '所属园区', minWidth: 160 },
      { prop: 'crop', label: '当前作物', width: 140 },
      { prop: 'area', label: '面积(亩)', width: 90 },
      { prop: 'type', label: '类型', width: 100 },
      { prop: 'stage', label: '生育期', width: 90 },
      tag('status', '状态', 80)
    ],
    filters: [{ key: 'type', label: '地块类型', options: ['设施大棚', '大田', '水产养殖', '畜禽养殖'].map(v => ({ label: v, value: v })) }],
    rowActions: [{ key: 'view', label: '详情' }, { key: 'edit', label: '编辑' }]
  },
  'basic-device': {
    stats: [
      S('设备总数', (s) => s.devices.length, '台', '覆盖 8 个地块', 'Cpu'),
      S('在线设备', (s) => s.devices.filter(d => d.online).length, '台', '在线率 87.5%', 'CircleCheck'),
      S('故障设备', (s) => s.devices.filter(d => d.status === '故障').length, '台', '需立即处理', 'Warning', 'danger'),
      S('网关接入', (s) => s.devices.filter(d => d.type === '网关').length, '台', '接入 46 台终端', 'Connection', 'info')
    ],
    columns: [
      { prop: 'id', label: '设备编号', width: 110 },
      { prop: 'name', label: '设备名称', minWidth: 180 },
      { prop: 'type', label: '类型', width: 90 },
      { prop: 'sub', label: '子类型', width: 120 },
      { prop: 'plot', label: '所属地块', width: 110 },
      { prop: 'ip', label: 'IP', width: 120 },
      { prop: 'last', label: '最后在线', width: 150 },
      tag('status', '状态', 80)
    ],
    filters: [{ key: 'type', label: '设备类型', options: ['传感器', '执行器', '网关'].map(v => ({ label: v, value: v })) }],
    rowActions: [{ key: 'view', label: '详情' }]
  },
  'basic-dict': {
    stats: [
      S('字典项', (s) => s.dicts.length, '组', '覆盖作物/设备/告警', 'Menu'),
      S('采集频率', () => '60', '秒', '默认采集周期', 'Odometer', 'info'),
      S('告警阈值', () => '3', '类', '温度/湿度/溶氧', 'Warning', 'warn'),
      S('分级标准', () => '3', '级', '一级 / 二级 / 等外', 'Star')
    ],
    columns: [
      { prop: 'code', label: '字典编码', width: 160 },
      { prop: 'name', label: '字典名称', width: 140 },
      { prop: 'val', label: '字典值', minWidth: 340 },
      { prop: 'param', label: '参数说明', width: 150 }
    ],
    rowActions: [{ key: 'view', label: '查看' }, { key: 'edit', label: '编辑' }]
  },
  'basic-input': {
    stats: [
      S('农资品类', (s) => s.inputs.length, '种', '化肥/种子/农药', 'Box'),
      S('库存预警', (s) => s.inputs.filter(i => i.stock <= i.min).length, '种', '低于安全库存', 'Warning', 'warn'),
      S('库存总值', (s) => '¥' + s.inputs.reduce((a, b) => a + b.stock * b.price, 0).toLocaleString(), '', '按当前单价', 'Money', 'info'),
      S('临期批次', () => 0, '批', '90 天内到期', 'Timer')
    ],
    columns: [
      { prop: 'name', label: '农资名称', minWidth: 170 },
      { prop: 'cat', label: '类别', width: 80 },
      { prop: 'spec', label: '规格', width: 120 },
      { prop: 'supplier', label: '供应商', width: 150 },
      { prop: 'stock', label: '库存', width: 80 },
      { prop: 'min', label: '安全库存', width: 90 },
      moneyCol('price', '单价', 90),
      tag('status', '状态', 80)
    ],
    rowActions: [{ key: 'view', label: '详情' }, { key: 'edit', label: '编辑' }]
  },
  'trace-test': {
    stats: [
      S('检测报告', (s) => s.tests.length, '份', '覆盖 5 个批次', 'DocumentChecked'),
      S('合格', (s) => s.tests.filter(t => t.result === '合格').length, '份', '合格率 80%', 'CircleCheck'),
      S('检测中', (s) => s.tests.filter(t => t.result === '检测中').length, '份', '待出报告', 'Timer', 'warn'),
      S('检测机构', (s) => new Set(s.tests.map(t => t.org)).size, '家', '市/区两级', 'OfficeBuilding', 'info')
    ],
    columns: [
      { prop: 'no', label: '报告编号', width: 150 },
      { prop: 'batch', label: '关联批次', minWidth: 190 },
      { prop: 'crop', label: '作物', width: 90 },
      { prop: 'org', label: '检测机构', minWidth: 180 },
      { prop: 'date', label: '检测日期', width: 110 },
      { prop: 'items', label: '检测项目', minWidth: 220 },
      tag('result', '结论', 90)
    ],
    rowActions: [{ key: 'view', label: '查看报告' }, { key: 'edit', label: '录入' }]
  },
  'expert-plan': {
    stats: [
      S('技术方案', (s) => s.techPlans.length, '份', '覆盖 3 类作物', 'Document'),
      S('已下发', (s) => s.techPlans.filter(p => p.status === '已下发').length, '份', '农户已接收', 'CircleCheck'),
      S('草稿', (s) => s.techPlans.filter(p => p.status === '草稿').length, '份', '待完善', 'Edit', 'warn'),
      S('指导面积', () => '1260', '亩', '本周期累计', 'MapLocation', 'info')
    ],
    columns: [
      { prop: 'id', label: '编号', width: 100 },
      { prop: 'plot', label: '地块', minWidth: 160 },
      { prop: 'crop', label: '作物', width: 80 },
      { prop: 'stage', label: '生育期', width: 90 },
      { prop: 'type', label: '方案类型', width: 120 },
      { prop: 'content', label: '方案内容', minWidth: 300 },
      { prop: 'author', label: '制定人', width: 100 },
      tag('status', '状态', 80)
    ],
    rowActions: [{ key: 'view', label: '详情' }, { key: 'edit', label: '编辑' }, { key: 'delete', label: '删除', type: 'danger' }],
    actions: [{ key: 'add', label: '新建方案', type: 'primary', dialog: 'techPlan' }]
  },
  'expert-supervise': {
    stats: [
      S('督导记录', (s) => s.supervise.length, '条', '本周期', 'Document'),
      S('合格', (s) => s.supervise.filter(x => x.status === '合格').length, '条', '执行规范', 'CircleCheck'),
      S('需整改', (s) => s.supervise.filter(x => x.status === '需整改').length, '条', '已给出建议', 'Warning', 'warn'),
      S('整改完成率', () => '75', '%', '持续跟踪', 'TrendCharts', 'info')
    ],
    columns: [
      { prop: 'wo', label: '工单号', width: 160 },
      { prop: 'plot', label: '地块', width: 100 },
      { prop: 'title', label: '工单标题', minWidth: 220 },
      { prop: 'exec', label: '执行人', width: 90 },
      { prop: 'check', label: '检查情况', minWidth: 180 },
      { prop: 'advice', label: '技术建议', minWidth: 220 },
      tag('status', '结论', 80)
    ],
    rowActions: [{ key: 'view', label: '详情' }]
  },
  'expert-quality': {
    stats: [
      S('采收批次', (s) => s.harvests.length, '批', '本月累计', 'Grape'),
      S('一级果占比', () => '81', '%', '较上月 +3%', 'TrendCharts'),
      S('采收总量', (s) => s.harvests.reduce((a, b) => a + b.qty, 0).toLocaleString(), 'kg', '含计划批次', 'Box'),
      S('待评估', (s) => s.harvests.filter(h => h.status === '已溯源').length, '批', '需出具意见', 'Warning', 'warn')
    ],
    columns: [
      { prop: 'batch', label: '采收批次', minWidth: 200 },
      { prop: 'crop', label: '作物', width: 80 },
      { prop: 'date', label: '采收日期', width: 110 },
      { prop: 'qty', label: '产量(kg)', width: 90 },
      { prop: 'grade', label: '分级结果', minWidth: 220 },
      tag('status', '状态', 90)
    ],
    rowActions: [{ key: 'view', label: '评估' }]
  },
  'expert-residue': {
    stats: [
      S('报告总数', (s) => s.tests.length, '份', '近 30 天', 'DocumentChecked'),
      S('合格率', () => '80', '%', '4 份合格', 'CircleCheck'),
      S('检测项', () => '24', '项', '有机磷/菊酯等', 'List'),
      S('检测中', (s) => s.tests.filter(t => t.result === '检测中').length, '份', '待报告', 'Timer', 'warn')
    ],
    columns: [
      { prop: 'no', label: '报告编号', width: 150 },
      { prop: 'batch', label: '批次', minWidth: 190 },
      { prop: 'crop', label: '作物', width: 80 },
      { prop: 'org', label: '检测机构', minWidth: 180 },
      { prop: 'items', label: '检测项目', minWidth: 220 },
      { prop: 'date', label: '日期', width: 110 },
      tag('result', '结论', 90)
    ],
    rowActions: [{ key: 'view', label: '查看报告' }]
  },
  'expert-rating': {
    stats: [
      S('服务评价', (s) => s.consults.length, '条', '本月累计', 'ChatDotSquare'),
      S('平均星级', () => '4.8', '星', '满分 5 星', 'Star'),
      S('已回复', (s) => s.consults.filter(c => c.status === '已回复').length, '条', '响应及时', 'CircleCheck'),
      S('待回复', (s) => s.consults.filter(c => c.status === '待回复').length, '条', '需尽快处理', 'Warning', 'warn')
    ],
    columns: [
      { prop: 'id', label: '编号', width: 100 },
      { prop: 'from', label: '农户', width: 100 },
      { prop: 'plot', label: '地块', width: 150 },
      { prop: 'title', label: '咨询主题', minWidth: 200 },
      { prop: 'content', label: '咨询内容', minWidth: 260 },
      { prop: 'time', label: '时间', width: 150 },
      tag('status', '状态', 80)
    ],
    rowActions: [{ key: 'view', label: '查看' }, { key: 'reply', label: '回复' }]
  },
  'agri-rating': {
    stats: [
      S('农艺师', () => 2, '人', '在岗', 'User'),
      S('咨询总量', (s) => s.consults.length, '次', '本月累计', 'ChatLineSquare'),
      S('平均响应', () => '12', '分钟', '优于平台均值', 'Timer', 'info'),
      S('平均评分', () => '4.8', '星', '农户满意度', 'Star')
    ],
    columns: [
      { prop: 'id', label: '咨询编号', width: 110 },
      { prop: 'from', label: '农户', width: 100 },
      { prop: 'plot', label: '地块', width: 160 },
      { prop: 'title', label: '主题', minWidth: 200 },
      { prop: 'status', label: '状态', width: 90 },
      { prop: 'time', label: '时间', width: 150 }
    ],
    rowActions: [{ key: 'view', label: '详情' }]
  },
  'farm-plot': {
    stats: [
      S('地块数量', (s) => s.plots.length, '块', '设施/大田/水产/畜禽', 'MapLocation'),
      S('种植面积', (s) => s.plots.reduce((a, b) => a + b.area, 0).toFixed(1), '亩', '含复种', 'Crop'),
      S('在田作物', () => '6', '类', '番茄/黄瓜/草莓等', 'Grape'),
      S('预警', (s) => s.plots.filter(p => p.status === '预警').length, '块', '需现场核查', 'Warning', 'warn')
    ],
    columns: [
      { prop: 'name', label: '地块名称', minWidth: 180 },
      { prop: 'park', label: '园区', minWidth: 160 },
      { prop: 'crop', label: '作物', width: 150 },
      { prop: 'area', label: '面积(亩)', width: 90 },
      { prop: 'stage', label: '生育期', width: 90 },
      { prop: 'plant', label: '定植日期', width: 110 },
      tag('status', '状态', 80)
    ],
    rowActions: [{ key: 'view', label: '详情' }, { key: 'edit', label: '编辑' }]
  },
  'farm-harvest': {
    stats: [
      S('采收批次', (s) => s.harvests.length, '批', '本周期', 'Grape'),
      S('采收总量', (s) => s.harvests.reduce((a, b) => a + b.qty, 0).toLocaleString(), 'kg', '已分级入库', 'Box'),
      S('已溯源', (s) => s.harvests.filter(h => h.status === '已溯源').length, '批', '生成溯源码', 'Ticket'),
      S('计划中', (s) => s.harvests.filter(h => h.status === '计划中').length, '批', '待采收', 'Calendar', 'info')
    ],
    columns: [
      { prop: 'batch', label: '批次号', minWidth: 200 },
      { prop: 'plot', label: '地块', width: 100 },
      { prop: 'crop', label: '作物', width: 80 },
      { prop: 'date', label: '采收日期', width: 110 },
      { prop: 'qty', label: '产量(kg)', width: 100 },
      { prop: 'grade', label: '分级', minWidth: 220 },
      tag('status', '状态', 90)
    ],
    rowActions: [{ key: 'view', label: '详情' }]
  },
  'farm-staff': {
    stats: [
      S('人员总数', (s) => s.users.length, '人', '含 4 类角色', 'User'),
      S('农户', (s) => s.users.filter(u => u.role === '农户').length, '人', '一线生产', 'UserFilled'),
      S('农艺师', (s) => s.users.filter(u => u.role === '农艺技术人员').length, '人', '技术指导', 'Medal', 'info'),
      S('停用账号', (s) => s.users.filter(u => u.status === '停用').length, '个', '需复核', 'Warning', 'warn')
    ],
    columns: [
      { prop: 'name', label: '姓名', width: 100 },
      { prop: 'account', label: '账号', width: 120 },
      { prop: 'role', label: '角色', width: 130 },
      { prop: 'phone', label: '手机号', width: 120 },
      { prop: 'park', label: '所属园区', minWidth: 170 },
      { prop: 'last', label: '最后登录', width: 150 },
      tag('status', '状态', 80)
    ],
    rowActions: [{ key: 'view', label: '详情' }]
  }
}

export function getPageConfig(id, store) {
  const meta = META[id] || {}
  if (!meta.collection || !store) return null
  const base = CONFIG[id] || {}
  return {
    ...base,
    rows: () => store[meta.collection] || [],
    collection: meta.collection,
    columns: base.columns || Object.keys(store[meta.collection]?.[0] || {}).map(k => ({ prop: k, label: k, minWidth: 120 })),
    stats: (base.stats || []).map(s => ({ ...s, value: typeof s.value === 'function' ? s.value(store) : s.value })),
    rowActions: base.rowActions || [{ key: 'view', label: '详情' }]
  }
}

export { DB }
