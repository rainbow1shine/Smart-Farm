export const ALL_MENUS = [
  { group:'总览', items:[
    { path:'/dashboard', title:'可视化大屏', icon:'Monitor' },
    { path:'/ai',        title:'数据中心·AI分析', icon:'DataAnalysis' },
  ]},
  { group:'感知与控制', items:[
    { path:'/env',     title:'环境监测',     icon:'Sunny' },
    { path:'/video',   title:'视频监控',     icon:'VideoCamera' },
    { path:'/control', title:'远程智能控制', icon:'Cpu' },
    { path:'/ops',     title:'设备运维',     icon:'Tools' },
  ]},
  { group:'生产管理', items:[
    { path:'/fields',  title:'地块·GIS一张图', icon:'MapLocation' },
    { path:'/farm',    title:'农事工单',       icon:'Tickets' },
    { path:'/agri',    title:'农资管理',       icon:'Goods' },
    { path:'/harvest', title:'采收管理',       icon:'Finished' },
  ]},
  { group:'质量与告警', items:[
    { path:'/trace',   title:'溯源·农残检测', icon:'Link' },
    { path:'/alarm',   title:'告警中心',      icon:'Bell' },
  ]},
  { group:'产销对接', items:[
    { path:'/prod',    title:'产品上架',      icon:'Goods' },
    { path:'/orders',  title:'订单管理',      icon:'Document' },
    { path:'/sales',   title:'销售统计',      icon:'TrendCharts' },
  ]},
  { group:'系统后台', items:[
    { path:'/users',   title:'用户与权限',    icon:'UserFilled' },
    { path:'/log',     title:'日志审计',      icon:'Notebook' },
  ]},
]

// 角色过滤：每个角色能看到哪些分组
export const ROLE_GROUP_MAP = {
  admin:    ['总览','感知与控制','生产管理','质量与告警','产销对接','系统后台'],
  ops:      ['感知与控制','生产管理','质量与告警','系统后台'],
  farmer:   ['感知与控制','生产管理','质量与告警','产销对接'],
  agri:     ['总览','生产管理','质量与告警'],
  consumer: ['产销对接'],
}
// 通讯协同（仅 farmer/agri 可见）
export const CHAT_GROUP = { group:'通讯协同', items:[
  { path:'/chat',      title:'对话聊天', icon:'ChatDotRound' },
  { path:'/videocall', title:'视频通话', icon:'VideoCameraFilled' },
]}

export const pathCrumbs = {
  '/dashboard':'可视化大屏', '/ai':'数据中心·AI分析',
  '/env':'环境监测', '/video':'视频监控', '/control':'远程智能控制', '/ops':'设备运维',
  '/fields':'地块·GIS一张图', '/farm':'农事工单', '/agri':'农资管理', '/harvest':'采收管理',
  '/trace':'溯源·农残检测', '/alarm':'告警中心',
  '/prod':'产品上架', '/orders':'订单管理', '/sales':'销售统计',
  '/users':'用户与权限', '/log':'日志审计',
  '/chat':'对话聊天', '/videocall':'视频通话',
}
