export const ROLE_META = {
  admin: { key: 'admin', name: '管理员', short: '管', color: '#4f7f56', desc: '平台用户、角色、权限与系统参数统一管理' },
  ops: { key: 'ops', name: '运维', short: '维', color: '#3b78a8', desc: '硬件设施与平台系统日常运维' },
  farmer: { key: 'farmer', name: '农户', short: '农', color: '#5c8a43', desc: '园区地块日常生产管理' },
  agri: { key: 'agri', name: '农艺技术人员', short: '艺', color: '#8a6a35', desc: '农业生产技术指导与质量评估' },
  consumer: { key: 'consumer', name: '消费者', short: '客', color: '#c28632', desc: '农产品浏览购买与溯源查询' }
}

export const DEMO_ACCOUNTS = [
  { role: 'admin', account: 'admin', password: 'admin123', label: '管理员（龙）', desc: '用户 / 角色 / 监管 / 档案' },
  { role: 'admin', account: 'twt', password: '123', label: '管理员（谭）', desc: '数据监管 / 商城运营' },
  { role: 'ops', account: 'ops01', password: 'ops123', label: '运维', desc: '设备 / 采集 / 告警 / 备份' },
  { role: 'farmer', account: 'farmer01', password: 'farmer123', label: '农户', desc: '监测 / 控制 / 工单 / 商城' },
  { role: 'agri', account: 'agri01', password: 'agri123', label: '农艺', desc: '诊断 / 方案 / 质量评估' },
  { role: 'consumer', account: '18700002233', password: '8888', label: '消费者', desc: '商城 / 溯源 / 订单' }
]

export const MENUS = {
  admin: [
    { group: '平台总览', items: [{ id: 'dashboard', name: '工作台', icon: 'DataBoard' }] },
    { group: '系统管理', items: [
      { id: 'user', name: '用户管理', icon: 'User' },
      { id: 'role', name: '角色管理', icon: 'Avatar' },
      { id: 'perm', name: '权限管理', icon: 'Lock' },
      { id: 'param', name: '系统参数', icon: 'Setting' },
      { id: 'log', name: '日志审计', icon: 'Document' },
      { id: 'api', name: '接口管理', icon: 'Connection' }
    ] },
    { group: '监管核查', items: [
      { id: 'data-check', name: '数据监管核查', icon: 'View' },
      { id: 'trace-test', name: '农残报告核查', icon: 'DocumentChecked' },
      { id: 'goods-audit', name: '商品监管', icon: 'Goods' },
      { id: 'consumer-ctl', name: '消费者管理', icon: 'UserFilled' },
      { id: 'agri-rating', name: '农艺师星级', icon: 'Star' },
      { id: 'alarm', name: '告警总览', icon: 'Bell', badge: 4 }
    ] },
    { group: '基础信息', items: [
      { id: 'basic-plot', name: '地块档案', icon: 'MapLocation' },
      { id: 'basic-device', name: '设备档案', icon: 'Cpu' },
      { id: 'basic-dict', name: '字典与参数', icon: 'Menu' },
      { id: 'basic-input', name: '农资档案', icon: 'Box' }
    ] },
    { group: '全局视图', items: [
      { id: 'gis', name: 'GIS 地图', icon: 'MapLocation' },
      { id: 'screen', name: '可视化大屏', icon: 'Monitor', jump: 'screen' }
    ] }
  ],
  ops: [
    { group: '平台总览', items: [{ id: 'dashboard', name: '工作台', icon: 'DataBoard' }] },
    { group: '设备运维', items: [
      { id: 'repair', name: '报修工单', icon: 'Tools', badge: 2 },
      { id: 'device', name: '设备管理', icon: 'Cpu' },
      { id: 'device-collect', name: '采集管理', icon: 'Odometer' },
      { id: 'alarm', name: '告警处置', icon: 'Bell', badge: 4 }
    ] },
    { group: '系统运维', items: [
      { id: 'basic-dict', name: '字典与参数', icon: 'Menu' },
      { id: 'log', name: '日志审计', icon: 'Document' },
      { id: 'api', name: '接口管理', icon: 'Connection' },
      { id: 'ops', name: '备份与恢复', icon: 'Refresh' }
    ] },
    { group: '全局视图', items: [
      { id: 'gis', name: 'GIS 地图', icon: 'MapLocation' },
      { id: 'screen', name: '可视化大屏', icon: 'Monitor', jump: 'screen' }
    ] }
  ],
  farmer: [
    { group: '平台总览', items: [{ id: 'dashboard', name: '工作台', icon: 'DataBoard' }] },
    { group: '感知与控制', items: [
      { id: 'env-monitor', name: '环境监测', icon: 'Odometer' },
      { id: 'video', name: '视频监控', icon: 'VideoCamera' },
      { id: 'control', name: '远程控制', icon: 'Switch' },
      { id: 'farmer-repair', name: '设备报修', icon: 'Tools', badge: 2 }
    ] },
    { group: '生产农事', items: [
      { id: 'farm-plot', name: '地块管理', icon: 'MapLocation' },
      { id: 'farm-workorder', name: '农事工单', icon: 'Calendar' },
      { id: 'farm-input', name: '农资管理', icon: 'Box' },
      { id: 'farm-harvest', name: '采收管理', icon: 'Grape' }
    ] },
    { group: '质量溯源', items: [
      { id: 'trace', name: '溯源信息录入', icon: 'Ticket' },
      { id: 'trace-test', name: '农残检测管理', icon: 'DocumentChecked' }
    ] },
    { group: '产销对接', items: [
      { id: 'market-goods', name: '产品上架', icon: 'Goods' },
      { id: 'market-order', name: '订单管理', icon: 'List', badge: 2 },
      { id: 'market-sales', name: '销售统计', icon: 'TrendCharts' },
      { id: 'market-review', name: '消费者评价', icon: 'ChatDotSquare', badge: 3 }
    ] },
    { group: '技术咨询', items: [
      { id: 'farmer-consult', name: '在线咨询', icon: 'ChatLineSquare', badge: 3 }
    ] },
    { group: '分析与视图', items: [
      { id: 'data-report', name: '统计报表', icon: 'PieChart' },
      { id: 'ai', name: 'AI 智能分析', icon: 'MagicStick' },
      { id: 'gis', name: 'GIS 地图', icon: 'MapLocation' },
      { id: 'alarm', name: '告警消息', icon: 'Bell', badge: 4 }
    ] },
    { group: '快捷入口', items: [
      { id: 'screen', name: '可视化大屏', icon: 'Monitor', jump: 'screen' },
      { id: 'mall', name: '消费者商城', icon: 'ShoppingBag', jump: 'mall' }
    ] }
  ],
  agri: [
    { group: '平台总览', items: [{ id: 'dashboard', name: '工作台', icon: 'DataBoard' }] },
    { group: '技术指导', items: [
      { id: 'expert-env', name: '环境与长势查看', icon: 'Sunny' },
      { id: 'expert-pest', name: '病虫害诊断', icon: 'MagicStick' },
      { id: 'expert-plan', name: '农事技术方案', icon: 'Document' },
      { id: 'agri-consult', name: '农户咨询应答', icon: 'ChatLineSquare', badge: 2 }
    ] },
    { group: '质量评估', items: [
      { id: 'expert-quality', name: '采收质量评估', icon: 'Star' },
      { id: 'expert-residue', name: '农残报告查看', icon: 'DocumentChecked' },
      { id: 'expert-rating', name: '我的服务评价', icon: 'Medal' }
    ] },
    { group: '分析视图', items: [
      { id: 'ai', name: 'AI 智能分析', icon: 'MagicStick' },
      { id: 'data-report', name: '统计报表', icon: 'PieChart' },
      { id: 'gis', name: 'GIS 地图', icon: 'MapLocation' },
      { id: 'alarm', name: '告警消息', icon: 'Bell', badge: 4 }
    ] },
    { group: '快捷入口', items: [
      { id: 'screen', name: '可视化大屏', icon: 'Monitor', jump: 'screen' }
    ] }
  ],
  consumer: [
    { group: '商城入口', items: [{ id: 'mall', name: '进入商城', icon: 'ShoppingBag', jump: 'mall' }] }
  ]
}

export function menuItems(role) {
  return (MENUS[role] || []).flatMap(g => g.items)
}

export function findMenu(role, id) {
  return menuItems(role).find(i => i.id === id)
}
