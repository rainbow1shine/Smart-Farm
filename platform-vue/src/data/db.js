/* ==========================================================
   Mock 数据层：按需求说明书 4.3 功能模块组织
   ========================================================== */

const DB = {
  /* 园区 */
  parks: [
    { id: 'PK01', name: '永川智慧农业示范园', area: 1260, plots: 18, crops: '番茄、黄瓜、草莓', addr: '重庆市永川区卫星湖街道' },
    { id: 'PK02', name: '南川大观生态农业园', area: 890, plots: 12, crops: '水稻、玉米', addr: '重庆市南川区大观镇' },
    { id: 'PK03', name: '璧山蔬菜保供基地', area: 460, plots: 9, crops: '叶菜、辣椒', addr: '重庆市璧山区大兴镇' },
  ],

  /* 地块 / 大棚 */
  plots: [
    { id: 'DK-A01', name: 'A区1号连栋大棚', park: '永川智慧农业示范园', crop: '番茄（粉贝贝）', area: 12.6, type: '设施大棚', stage: '结果期', plant: '2026-08-18', status: '正常', devices: 14 },
    { id: 'DK-A02', name: 'A区2号日光温室', park: '永川智慧农业示范园', crop: '黄瓜（津优35）', area: 8.4, type: '设施大棚', stage: '采收期', plant: '2026-08-02', status: '正常', devices: 11 },
    { id: 'DK-B01', name: 'B区露天大田', park: '永川智慧农业示范园', crop: '水稻（宜香优）', area: 168.0, type: '大田', stage: '灌浆期', plant: '2026-05-12', status: '正常', devices: 9 },
    { id: 'DK-B02', name: 'B区2号大田', park: '南川大观生态农业园', crop: '玉米（正红6号）', area: 96.5, type: '大田', stage: '成熟期', plant: '2026-04-28', status: '预警', devices: 7 },
    { id: 'DK-C01', name: 'C区草莓园', park: '璧山蔬菜保供基地', crop: '草莓（红颜）', area: 5.2, type: '设施大棚', stage: '开花期', plant: '2026-09-20', status: '正常', devices: 8 },
    { id: 'DK-C02', name: 'C区叶菜基地', park: '璧山蔬菜保供基地', crop: '小白菜', area: 32.0, type: '大田', stage: '苗期', plant: '2026-10-08', status: '正常', devices: 6 },
    { id: 'DK-D01', name: 'D区水产塘1号', park: '南川大观生态农业园', crop: '草鱼、鲢鱼', area: 15.0, type: '水产养殖', stage: '养成期', plant: '2026-06-15', status: '正常', devices: 5 },
    { id: 'DK-E01', name: 'E区蛋鸡舍', park: '永川智慧农业示范园', crop: '蛋鸡', area: 3.8, type: '畜禽养殖', stage: '产蛋期', plant: '2026-07-10', status: '正常', devices: 6 },
  ],

  /* 设备 */
  devices: [
    { id: 'DEV-1001', name: 'A01空气温湿度传感器', type: '传感器', sub: '空气温湿度', plot: 'DK-A01', online: 1, status: '运行', ip: '10.20.1.31', rate: '60秒', last: '2026-11-09 09:12', value: '23.6℃ / 68%' },
    { id: 'DEV-1002', name: 'A01土壤墒情传感器', type: '传感器', sub: '土壤温湿度/EC', plot: 'DK-A01', online: 1, status: '运行', ip: '10.20.1.32', rate: '60秒', last: '2026-11-09 09:12', value: '18.4℃ / 32%' },
    { id: 'DEV-1003', name: 'A01光合有效辐射', type: '传感器', sub: '光照强度', plot: 'DK-A01', online: 1, status: '运行', ip: '10.20.1.33', rate: '60秒', last: '2026-11-09 09:12', value: '28600 lx' },
    { id: 'DEV-1004', name: 'A01 CO2浓度传感器', type: '传感器', sub: 'CO2浓度', plot: 'DK-A01', online: 1, status: '运行', ip: '10.20.1.34', rate: '60秒', last: '2026-11-09 09:12', value: '612 ppm' },
    { id: 'DEV-1005', name: 'A01灌溉电磁阀', type: '执行器', sub: '电磁阀', plot: 'DK-A01', online: 1, status: '停止', ip: '10.20.2.11', rate: '—', last: '2026-11-09 06:30', value: '阀门关闭' },
    { id: 'DEV-1006', name: 'A01内遮阳电机', type: '执行器', sub: '遮阳帘', plot: 'DK-A01', online: 1, status: '运行', ip: '10.20.2.12', rate: '—', last: '2026-11-09 09:05', value: '展开 60%' },
    { id: 'DEV-1007', name: 'A01环流风机1号', type: '执行器', sub: '风机', plot: 'DK-A01', online: 1, status: '运行', ip: '10.20.2.13', rate: '—', last: '2026-11-09 08:20', value: '转速 1200r/min' },
    { id: 'DEV-1008', name: 'A01 LED补光灯', type: '执行器', sub: '补光灯', plot: 'DK-A01', online: 0, status: '离线', ip: '10.20.2.14', rate: '—', last: '2026-11-08 21:40', value: '通讯中断' },
    { id: 'DEV-1009', name: 'B01气象站', type: '传感器', sub: '风速风向/雨量', plot: 'DK-B01', online: 1, status: '运行', ip: '10.20.1.51', rate: '30秒', last: '2026-11-09 09:12', value: '2.4m/s 东南风' },
    { id: 'DEV-1010', name: 'B01水泵机组', type: '执行器', sub: '水泵', plot: 'DK-B01', online: 1, status: '运行', ip: '10.20.2.31', rate: '—', last: '2026-11-09 07:10', value: '流量 42m³/h' },
    { id: 'DEV-1011', name: ' D02溶氧仪', type: '传感器', sub: '水体溶氧', plot: 'DK-D01', online: 1, status: '运行', ip: '10.20.1.71', rate: '120秒', last: '2026-11-09 09:10', value: '5.8 mg/L' },
    { id: 'DEV-1012', name: 'D01增氧机1号', type: '执行器', sub: '增氧机', plot: 'DK-D01', online: 1, status: '运行', ip: '10.20.2.51', rate: '—', last: '2026-11-09 05:00', value: '运行 6h' },
    { id: 'DEV-1013', name: 'E01鸡舍温控器', type: '执行器', sub: '加温设备', plot: 'DK-E01', online: 1, status: '停止', ip: '10.20.2.71', rate: '—', last: '2026-11-09 06:00', value: '待机' },
    { id: 'DEV-1014', name: '1号物联网网关', type: '网关', sub: '数据汇聚', plot: '全园区', online: 1, status: '运行', ip: '10.20.0.1', rate: '实时', last: '2026-11-09 09:12', value: '接入 46 台' },
    { id: 'DEV-1015', name: 'A02卷帘机', type: '执行器', sub: '卷帘', plot: 'DK-A02', online: 1, status: '停止', ip: '10.20.2.21', rate: '—', last: '2026-11-09 08:50', value: '帘幕关闭' },
    { id: 'DEV-1016', name: 'C01育苗补光板', type: '执行器', sub: '补光灯', plot: 'DK-C01', online: 0, status: '故障', ip: '10.20.2.81', rate: '—', last: '2026-11-08 22:15', value: '电源异常' },
  ],

  /* 环境实时读数（空气 / 土壤 / 水体 / 气象） */
  envLive: {
    air: [
      { k: '空气温度', v: '23.6', u: '℃', n: 22, mn: 18, mx: 30, st: 'ok' },
      { k: '空气湿度', v: '68', u: '%', n: 70, mn: 50, mx: 85, st: 'ok' },
      { k: 'CO2 浓度', v: '612', u: 'ppm', n: 50, mn: 400, mx: 1000, st: 'ok' },
      { k: '光照强度', v: '28600', u: 'lx', n: 60, mn: 0, mx: 60000, st: 'ok' },
      { k: '大气压', v: '98.6', u: 'kPa', n: 70, mn: 95, mx: 103, st: 'ok' },
      { k: 'PM2.5', v: '32', u: 'μg/m³', n: 30, mn: 0, mx: 150, st: 'ok' },
      { k: '氨气 NH3', v: '0.42', u: 'ppm', n: 20, mn: 0, mx: 5, st: 'ok' },
      { k: '硫化氢 H2S', v: '0.03', u: 'ppm', n: 10, mn: 0, mx: 2, st: 'ok' },
    ],
    soil: [
      { k: '土壤温度', v: '18.4', u: '℃', n: 55, mn: 12, mx: 28, st: 'ok' },
      { k: '土壤湿度', v: '32', u: '%', n: 52, mn: 25, mx: 60, st: 'warn' },
      { k: '土壤 pH', v: '6.4', u: '', n: 62, mn: 5.5, mx: 7.5, st: 'ok' },
      { k: 'EC 电导率', v: '1.32', u: 'mS/cm', n: 58, mn: 0.8, mx: 2.5, st: 'ok' },
      { k: '速效氮', v: '86', u: 'mg/kg', n: 60, mn: 40, mx: 120, st: 'ok' },
      { k: '有效磷', v: '34', u: 'mg/kg', n: 45, mn: 20, mx: 80, st: 'ok' },
      { k: '速效钾', v: '112', u: 'mg/kg', n: 68, mn: 60, mx: 180, st: 'ok' },
    ],
    water: [
      { k: '水温', v: '19.2', u: '℃', n: 60, mn: 15, mx: 30, st: 'ok' },
      { k: '溶氧量', v: '5.8', u: 'mg/L', n: 58, mn: 4, mx: 9, st: 'ok' },
      { k: '水体 pH', v: '7.2', u: '', n: 64, mn: 6.5, mx: 8.5, st: 'ok' },
      { k: '氨氮', v: '0.28', u: 'mg/L', n: 40, mn: 0, mx: 1.0, st: 'ok' },
      { k: '亚硝酸盐', v: '0.04', u: 'mg/L', n: 25, mn: 0, mx: 0.2, st: 'ok' },
      { k: '浊度', v: '12', u: 'NTU', n: 30, mn: 0, mx: 50, st: 'ok' },
    ],
    weather: [
      { k: '风速', v: '2.4', u: 'm/s', n: 35, mn: 0, mx: 10, st: 'ok' },
      { k: '风向', v: '东南风', u: '', n: 50, mn: 0, mx: 100, st: 'ok' },
      { k: '降雨量', v: '0.0', u: 'mm', n: 10, mn: 0, mx: 50, st: 'ok' },
      { k: '日照时长', v: '4.2', u: 'h', n: 45, mn: 0, mx: 12, st: 'ok' },
      { k: '蒸发量', v: '1.8', u: 'mm', n: 30, mn: 0, mx: 8, st: 'ok' },
    ],
  },

  /* 24 小时趋势（空气温度 / 土壤湿度 / 光照） */
  trend24: {
    hours: ['0','2','4','6','8','10','12','14','16','18','20','22'],
    temp: [16.2,15.6,15.1,16.4,19.8,23.1,26.4,28.2,26.8,23.4,20.1,18.2],
    humidity: [74,76,78,72,64,58,52,49,54,62,68,72],
    light: [0,0,0,1200,9600,22400,31800,28600,14200,3200,0,0],
  },

  /* 7 日曲线 */
  trend7: {
    days: ['11-03','11-04','11-05','11-06','11-07','11-08','11-09'],
    maxTemp: [24,26,25,27,29,28,26],
    minTemp: [15,16,15,17,18,17,16],
    soil: [34,36,33,35,32,31,32],
  },

  /* 农事工单 */
  workorders: [
    { id: 'WO-20261109-01', plot: 'DK-A01', type: '施肥', title: '番茄结果期水肥一体化追肥', plan: '2026-11-09', assignee: '吴农户', status: '执行中', progress: 60, hours: 4.5, material: '硫酸钾 12kg、磷酸一铵 6kg' },
    { id: 'WO-20261109-02', plot: 'DK-A02', type: '采收', title: '黄瓜第三批次采收', plan: '2026-11-09', assignee: '吴农户', status: '待执行', progress: 0, hours: 0, material: '采收筐 40 个' },
    { id: 'WO-20261109-03', plot: 'DK-C01', type: '打药', title: '草莓白粉病预防性喷药', plan: '2026-11-09', assignee: '吴农户', status: '待执行', progress: 0, hours: 0, material: '醚菌酯 400g' },
    { id: 'WO-20261108-01', plot: 'DK-B01', type: '灌溉', title: '水稻灌浆期补水', plan: '2026-11-08', assignee: '吴农户', status: '已完成', progress: 100, hours: 3.0, material: '—' },
    { id: 'WO-20261108-02', plot: 'DK-C02', type: '除草', title: '小白菜苗期人工除草', plan: '2026-11-08', assignee: '吴农户', status: '已完成', progress: 100, hours: 5.5, material: '—' },
    { id: 'WO-20261107-01', plot: 'DK-A02', type: '播种', title: '黄瓜补苗移栽', plan: '2026-11-07', assignee: '吴农户', status: '已验收', progress: 100, hours: 6.0, material: '穴盘苗 320 株' },
    { id: 'WO-20261106-01', plot: 'DK-D01', type: '投喂', title: '水产塘例行投喂与水质检查', plan: '2026-11-06', assignee: '吴农户', status: '已验收', progress: 100, hours: 2.0, material: '配合饲料 80kg' },
    { id: 'WO-20261109-04', plot: 'DK-E01', type: '巡检', title: '蛋鸡舍环境与产蛋巡检', plan: '2026-11-09', assignee: '吴农户', status: '待执行', progress: 0, hours: 0, material: '—' },
  ],

  /* 农事计划模板 */
  planTemplates: [
    { name: '番茄结果期管理', stage: '结果期', items: '水肥追施（7天/次）、整枝打杈（5天/次）、病虫害巡查（3天/次）', days: 42 },
    { name: '水稻灌浆期管理', stage: '灌浆期', items: '浅水灌溉、叶面喷肥、稻飞虱监测', days: 25 },
    { name: '草莓开花期管理', stage: '开花期', items: '控温控湿、熊蜂授粉、灰霉病预防', days: 30 },
  ],

  /* 农资 */
  inputs: [
    { id: 'NZ-001', name: '硫酸钾复合肥', cat: '化肥', spec: '50kg/袋', supplier: '重庆农资集团', stock: 86, unit: '袋', min: 40, price: 168, batch: 'FL20260918', expire: '2029-09-18', status: '正常' },
    { id: 'NZ-002', name: '磷酸一铵', cat: '化肥', spec: '25kg/袋', supplier: '重庆农资集团', stock: 12, unit: '袋', min: 30, price: 132, batch: 'FL20260802', expire: '2029-08-02', status: '低库存' },
    { id: 'NZ-003', name: '番茄粉贝贝种子', cat: '种子', spec: '1000粒/袋', supplier: '先正达种业', stock: 24, unit: '袋', min: 10, price: 420, batch: 'ZZ20260720', expire: '2028-07-20', status: '正常' },
    { id: 'NZ-004', name: '醚菌酯水分散粒剂', cat: '农药', spec: '100g/袋', supplier: '巴斯夫（中国）', stock: 58, unit: '袋', min: 20, price: 46, batch: 'NY20260815', expire: '2028-08-15', status: '正常' },
    { id: 'NZ-005', name: '吡虫啉可湿性粉剂', cat: '农药', spec: '50g/袋', supplier: '海利尔药业', stock: 6, unit: '袋', min: 15, price: 28, batch: 'NY20260706', expire: '2028-07-06', status: '低库存' },
    { id: 'NZ-006', name: '黑色地膜', cat: '地膜', spec: '1.2m×500m', supplier: '山东华丰塑业', stock: 15, unit: '卷', min: 8, price: 210, batch: 'DM20260910', expire: '2031-09-10', status: '正常' },
    { id: 'NZ-007', name: '育秧基质', cat: '基质', spec: '50L/袋', supplier: '镇江培蕾基质', stock: 42, unit: '袋', min: 20, price: 38, batch: 'JZ20260905', expire: '2027-09-05', status: '正常' },
  ],

  /* 农资出入库流水 */
  inputFlow: [
    { time: '2026-11-09 08:20', type: '出库', name: '硫酸钾复合肥', qty: 12, unit: '袋', target: 'DK-A01 追肥', who: '吴农户' },
    { time: '2026-11-08 16:10', type: '入库', name: '醚菌酯水分散粒剂', qty: 30, unit: '袋', target: '供应商到货', who: '吴农户' },
    { time: '2026-11-08 09:35', type: '出库', name: '黑色地膜', qty: 3, unit: '卷', target: 'DK-C02 覆盖', who: '吴农户' },
    { time: '2026-11-07 14:00', type: '出库', name: '育秧基质', qty: 8, unit: '袋', target: 'DK-A02 补苗', who: '吴农户' },
    { time: '2026-11-06 10:20', type: '入库', name: '磷酸一铵', qty: 15, unit: '袋', target: '供应商到货', who: '吴农户' },
  ],

  /* 农药使用台账 */
  pesticideLedger: [
    { date: '2026-11-09', plot: 'DK-C01', name: '醚菌酯', dose: '400g/亩', crop: '草莓', operator: '吴农户', safeDay: 7, residue: '待检测' },
    { date: '2026-11-05', plot: 'DK-A01', name: '吡虫啉', dose: '50g/亩', crop: '番茄', operator: '吴农户', safeDay: 10, residue: '合格' },
    { date: '2026-10-28', plot: 'DK-C02', name: '高效氯氟氰菊酯', dose: '30ml/亩', crop: '小白菜', operator: '吴农户', safeDay: 5, residue: '合格' },
  ],

  /* 采收批次 */
  harvests: [
    { batch: 'SC-20261109-A02-01', plot: 'DK-A02', crop: '黄瓜', date: '2026-11-09', qty: 1260, unit: 'kg', grade: '一级 78% / 二级 18% / 等外 4%', status: '已溯源', trace: 'TR-00021' },
    { batch: 'SC-20261108-B01-01', plot: 'DK-B01', crop: '水稻', date: '2026-11-08', qty: 0, unit: 'kg', grade: '未到采收期', status: '计划中', trace: '—' },
    { batch: 'SC-20261107-A01-02', plot: 'DK-A01', crop: '番茄', date: '2026-11-07', qty: 860, unit: 'kg', grade: '一级 82% / 二级 15% / 等外 3%', status: '已溯源', trace: 'TR-00020' },
    { batch: 'SC-20261105-A01-01', plot: 'DK-A01', crop: '番茄', date: '2026-11-05', qty: 742, unit: 'kg', grade: '一级 76% / 二级 20% / 等外 4%', status: '已完结', trace: 'TR-00019' },
    { batch: 'SC-20261030-C01-01', plot: 'DK-C01', crop: '草莓', date: '2026-10-30', qty: 380, unit: 'kg', grade: '一级 88% / 二级 10% / 等外 2%', status: '已完结', trace: 'TR-00018' },
  ],

  /* 溯源批次 */
  traces: [
    { code: 'TR-00021', batch: 'SC-20261109-A02-01', crop: '黄瓜（津优35）', plot: 'A区2号日光温室', env: '已关联 30 天环境数据', work: '6 条农事记录', input: '4 次农资使用', test: '农残检测合格', qr: 1, status: '已发布' },
    { code: 'TR-00020', batch: 'SC-20261107-A01-02', crop: '番茄（粉贝贝）', plot: 'A区1号连栋大棚', env: '已关联 30 天环境数据', work: '8 条农事记录', input: '5 次农资使用', test: '农残检测合格', qr: 1, status: '已发布' },
    { code: 'TR-00019', batch: 'SC-20261105-A01-01', crop: '番茄（粉贝贝）', plot: 'A区1号连栋大棚', env: '已关联 28 天环境数据', work: '7 条农事记录', input: '4 次农资使用', test: '农残检测合格', qr: 1, status: '已发布' },
    { code: 'TR-00018', batch: 'SC-20261030-C01-01', crop: '草莓（红颜）', plot: 'C区草莓园', env: '已关联 25 天环境数据', work: '5 条农事记录', input: '3 次农资使用', test: '农残检测合格', qr: 1, status: '已发布' },
    { code: '—', batch: 'SC-20261109-A02-01D', crop: '黄瓜（津优35）', plot: 'A区2号日光温室', env: '待关联', work: '待补充', input: '待补充', test: '检测中', qr: 0, status: '待生成' },
  ],

  /* 农残检测报告 */
  tests: [
    { no: 'JC-20261109-01', batch: 'SC-20261109-A02-01', crop: '黄瓜', org: '重庆市农科院检测中心', date: '2026-11-09', items: '有机磷、氨基甲酸酯、拟除虫菊酯共 24 项', result: '合格', file: '检测报告_JC20261109-01.pdf' },
    { no: 'JC-20261107-01', batch: 'SC-20261107-A01-02', crop: '番茄', org: '重庆市农科院检测中心', date: '2026-11-07', items: '有机磷、氨基甲酸酯、拟除虫菊酯共 24 项', result: '合格', file: '检测报告_JC20261107-01.pdf' },
    { no: 'JC-20261105-01', batch: 'SC-20261105-A01-01', crop: '番茄', org: '永川区农产品质检站', date: '2026-11-05', items: '有机磷、重金属铅镉共 18 项', result: '合格', file: '检测报告_JC20261105-01.pdf' },
    { no: 'JC-20261030-01', batch: 'SC-20261030-C01-01', crop: '草莓', org: '永川区农产品质检站', date: '2026-10-30', items: '有机磷、氨基甲酸酯共 16 项', result: '合格', file: '检测报告_JC20261030-01.pdf' },
    { no: 'JC-20261109-02', batch: 'SC-20261109-A02-01D', crop: '黄瓜', org: '重庆市农科院检测中心', date: '2026-11-09', items: '有机磷、氨基甲酸酯、拟除虫菊酯共 24 项', result: '检测中', file: '—' },
  ],

  /* 商品品类：大类 → 小类 */
  catTree: [
    { name: '果蔬', icon: '🥬', desc: '番茄 / 黄瓜 / 草莓 / 叶菜', children: ['番茄', '黄瓜', '草莓', '叶菜'] },
    { name: '粮油', icon: '🌾', desc: '大米 / 玉米', children: ['大米', '玉米'] },
    { name: '水产', icon: '🐟', desc: '草鱼 / 鲈鱼', children: ['草鱼', '鲈鱼'] },
    { name: '肉禽蛋', icon: '🥩', desc: '羊肉 / 土鸡 / 土鸡蛋', children: ['羊肉', '土鸡', '土鸡蛋'] },
  ],

  /* 商品（big = 大类，cat = 小类） */
  goods: [
    { id: 'SP-001', icon: '🍅', big: '果蔬', cat: '番茄', name: '永川粉贝贝番茄', plot: 'A区1号连栋大棚', price: 12.8, unit: '元/500g', stock: 320, sold: 1280, spec: '500g/盒 · 一级果', tag: '基地直供', trace: 'TR-00020' },
    { id: 'SP-002', icon: '🥒', big: '果蔬', cat: '黄瓜', name: '津优35水果黄瓜', plot: 'A区2号日光温室', price: 9.6, unit: '元/500g', stock: 480, sold: 960, spec: '500g/袋 · 一级果', tag: '当日采摘', trace: 'TR-00021' },
    { id: 'SP-003', icon: '🍓', big: '果蔬', cat: '草莓', name: '璧山红颜草莓', plot: 'C区草莓园', price: 32.0, unit: '元/500g', stock: 96, sold: 640, spec: '250g/盒 · 精选大果', tag: '冷链配送', trace: 'TR-00018' },
    { id: 'SP-004', icon: '🌾', big: '粮油', cat: '大米', name: '南川宜香优大米', plot: 'B区露天大田', price: 68.0, unit: '元/5kg', stock: 210, sold: 320, spec: '5kg/袋 · 当季新米', tag: '地理标志', trace: '—' },
    { id: 'SP-005', icon: '🥬', big: '果蔬', cat: '叶菜', name: '璧山小白菜', plot: 'C区叶菜基地', price: 5.2, unit: '元/500g', stock: 160, sold: 880, spec: '500g/把 · 无农残', tag: '农残合格', trace: '—' },
    { id: 'SP-006', icon: '🐟', big: '水产', cat: '草鱼', name: '生态草鱼（活鲜）', plot: 'D区水产塘1号', price: 18.0, unit: '元/500g', stock: 88, sold: 210, spec: '约 3-4 斤/条', tag: '活鲜直发', trace: '—' },
    { id: 'SP-007', icon: '🍖', big: '肉禽蛋', cat: '羊肉', name: '南川散养山羊腿肉', plot: 'E区养殖区', price: 88.0, unit: '元/500g', stock: 56, sold: 148, spec: '500g/份 · 冷鲜分割', tag: '冷鲜直发', trace: '—' },
    { id: 'SP-008', icon: '🥚', big: '肉禽蛋', cat: '土鸡蛋', name: '永川林下土鸡蛋', plot: 'E区蛋鸡舍', price: 15.8, unit: '元/10枚', stock: 240, sold: 520, spec: '10枚/盒 · 当日捡拾', tag: '当日新鲜', trace: '—' },
    { id: 'SP-009', icon: '🌽', big: '粮油', cat: '玉米', name: '璧山水果玉米', plot: 'B区2号大田', price: 6.8, unit: '元/500g', stock: 180, sold: 260, spec: '2 根/份 · 可生食', tag: '基地直供', trace: '—' },
    { id: 'SP-010', icon: '🐠', big: '水产', cat: '鲈鱼', name: '生态鲈鱼（活鲜）', plot: 'D区水产塘1号', price: 32.0, unit: '元/500g', stock: 64, sold: 132, spec: '约 1-1.5 斤/条', tag: '活鲜直发', trace: '—' },
    { id: 'SP-011', icon: '🐔', big: '肉禽蛋', cat: '土鸡', name: '南川散养土鸡', plot: 'E区养殖区', price: 118.0, unit: '元/只', stock: 32, sold: 96, spec: '约 3 斤/只 · 现杀', tag: '冷鲜直发', trace: '—' },
  ],

  /* 农户订单 */
  orders: [
    { no: 'DD-20261109-001', buyer: '谭女士', phone: '138****6621', goods: '永川粉贝贝番茄 × 2', amount: 25.6, time: '2026-11-09 09:02', status: '待发货', pay: '已支付', addr: '重庆市渝北区龙湖天街' },
    { no: 'DD-20261109-002', buyer: '吴先生', phone: '135****8890', goods: '津优35水果黄瓜 × 3', amount: 28.8, time: '2026-11-09 08:41', status: '待发货', pay: '已支付', addr: '重庆市南岸区学府大道' },
    { no: 'DD-20261108-003', buyer: '王女士', phone: '187****2233', goods: '璧山红颜草莓 × 4', amount: 128.0, time: '2026-11-08 20:15', status: '已发货', pay: '已支付', addr: '重庆市江北区观音桥' },
    { no: 'DD-20261108-004', buyer: '张先生', phone: '159****5512', goods: '南川宜香优大米 × 1', amount: 68.0, time: '2026-11-08 15:30', status: '已完成', pay: '已支付', addr: '重庆市九龙坡区' },
    { no: 'DD-20261107-005', buyer: '朱女士', phone: '136****9901', goods: '璧山小白菜 × 2、番茄 × 1', amount: 23.2, time: '2026-11-07 11:20', status: '已完成', pay: '已支付', addr: '重庆市沙坪坝区' },
  ],

  /* 消费者订单（商城端） */
  mallOrders: [
    { no: 'M20261109001', goods: '永川粉贝贝番茄 × 2', amount: 25.6, status: '待发货', time: '2026-11-09 09:02', addr: '重庆市渝北区龙湖天街 3 栋 1201' },
    { no: 'M20261108002', goods: '璧山红颜草莓 × 4', amount: 128.0, status: '运输中', time: '2026-11-08 20:15', addr: '重庆市江北区观音桥 5 号' },
    { no: 'M20261103003', goods: '南川宜香优大米 × 1', amount: 68.0, status: '待收货', time: '2026-11-03 10:00', addr: '重庆市渝北区龙湖天街 3 栋 1201' },
  ],

  /* 告警 */
  alarms: [
    { id: 'AL-0912', level: '紧急', type: '设备故障', target: 'A01 LED补光灯', plot: 'DK-A01', desc: '补光灯电源异常，设备已离线', time: '2026-11-09 08:56', status: '待处置' },
    { id: 'AL-0911', level: '重要', type: '环境超限', target: 'A01 土壤湿度', plot: 'DK-A01', desc: '土壤湿度 32%，低于灌溉阈值 35%', time: '2026-11-09 08:40', status: '处置中' },
    { id: 'AL-0910', level: '重要', type: '设备故障', target: 'C01 育苗补光板', plot: 'DK-C01', desc: '设备上报电源异常，已停止工作', time: '2026-11-09 08:12', status: '待处置' },
    { id: 'AL-0909', level: '一般', type: '离线掉线', target: 'A01 LED补光灯', plot: 'DK-A01', desc: '设备连续 3 个采集周期无数据', time: '2026-11-09 07:50', status: '已闭环' },
    { id: 'AL-0908', level: '一般', type: '库存不足', target: '吡虫啉可湿性粉剂', plot: '农资库', desc: '当前库存 6 袋，低于安全库存 15 袋', time: '2026-11-09 07:20', status: '已闭环' },
    { id: 'AL-0907', level: '紧急', type: '灾害预警', target: '南川大观生态农业园', plot: '全园区', desc: '气象台发布暴雨蓝色预警，24h 降雨 30-50mm', time: '2026-11-08 21:30', status: '已处置' },
    { id: 'AL-0906', level: '一般', type: '传感器异常', target: 'B01 气象站', plot: 'DK-B01', desc: '风向数据跳变异常，已触发自动校准', time: '2026-11-08 18:10', status: '已闭环' },
  ],

  /* 控制日志 */
  controlLogs: [
    { time: '2026-11-09 08:20', who: '吴农户', dev: 'A01环流风机1号', action: '开启', mode: '手动', result: '成功' },
    { time: '2026-11-09 07:10', who: '系统策略', dev: 'B01水泵机组', action: '开启', mode: '自动联动', result: '成功' },
    { time: '2026-11-09 06:30', who: '系统策略', dev: 'A01灌溉电磁阀', action: '关闭', mode: '定时任务', result: '成功' },
    { time: '2026-11-09 05:00', who: '系统策略', dev: 'D01增氧机1号', action: '开启', mode: '定时任务', result: '成功' },
    { time: '2026-11-08 21:40', who: '吴农户', dev: 'A01 LED补光灯', action: '开启', mode: '手动', result: '失败（设备离线）' },
    { time: '2026-11-08 20:05', who: '吴农户', dev: 'A02卷帘机', action: '关闭', mode: '手动', result: '成功' },
  ],

  /* 自动联动策略 */
  strategies: [
    { id: 'ST-01', name: '土壤湿度联动灌溉', plot: 'DK-A01', cond: '土壤湿度 < 35%', act: '开启 A01 灌溉电磁阀 15 分钟', on: 1, last: '2026-11-09 06:30' },
    { id: 'ST-02', name: '高温联动通风', plot: 'DK-A01', cond: '棚内温度 > 30℃', act: '开启 A01 环流风机1号', on: 1, last: '2026-11-08 14:20' },
    { id: 'ST-03', name: '弱光联动补光', plot: 'DK-A01', cond: '光照 < 8000lx 且 时间 06:00-20:00', act: '开启 LED补光灯（4h）', on: 0, last: '2026-11-08 21:40' },
    { id: 'ST-04', name: '夜间增氧', plot: 'DK-D01', cond: '溶氧 < 4.5mg/L', act: '开启 D01 增氧机 4 小时', on: 1, last: '2026-11-09 05:00' },
    { id: 'ST-05', name: '雨天自动闭帘', plot: 'DK-A02', cond: '降雨量 > 5mm 或 风速 > 6 级', act: '关闭卷帘机、暂停灌溉', on: 1, last: '2026-11-08 21:35' },
  ],

  /* 定时任务 */
  timers: [
    { id: 'TM-01', name: '清晨灌溉', plot: 'DK-A01', cron: '每日 06:00', act: '电磁阀开启 15 分钟', on: 1 },
    { id: 'TM-02', name: '午间通风', plot: 'DK-A01', cron: '每日 12:30', act: '风机开启 2 小时', on: 1 },
    { id: 'TM-03', name: '傍晚补光', plot: 'DK-C01', cron: '每日 18:30', act: '补光板开启 3 小时', on: 0 },
    { id: 'TM-04', name: '水产夜间增氧', plot: 'DK-D01', cron: '每日 22:00', act: '增氧机开启 6 小时', on: 1 },
  ],

  /* 场景模板 */
  scenes: [
    { name: '育苗场景', temp: '22-25℃', hum: '65-75%', light: '12h 补光', desc: '高湿、弱光、控温平稳' },
    { name: '开花场景', temp: '20-24℃', hum: '55-65%', light: '自然光+4h', desc: '降湿促花、控温防徒长' },
    { name: '越冬场景', temp: '18-22℃', hum: '50-60%', light: '自然光', desc: '保温为主、减少通风' },
  ],

  /* AI 分析 */
  aiGrowth: [
    { plot: 'A区1号连栋大棚', crop: '番茄', level: '优', score: 92, note: '叶绿素含量高、株型紧凑，长势优于同期 8%', predict: '2026-12-05' },
    { plot: 'A区2号日光温室', crop: '黄瓜', level: '优', score: 88, note: '蔓长正常，第12节坐果良好', predict: '2026-11-20' },
    { plot: 'C区草莓园', crop: '草莓', level: '良', score: 74, note: '开花数偏少，建议调整夜温', predict: '2026-12-28' },
    { plot: 'B区2号大田', crop: '玉米', level: '中', score: 61, note: '叶面积指数偏低，建议追施氮肥', predict: '2026-11-25' },
  ],
  aiPest: [
    { plot: 'C区草莓园', crop: '草莓', pest: '白粉病', conf: 87, level: '中风险', advise: '建议 11-09 前使用醚菌酯 400g/亩预防性喷施，7 天后复检', time: '2026-11-08 17:20' },
    { plot: 'A区1号连栋大棚', crop: '番茄', pest: '早疫病', conf: 42, level: '低风险', advise: '保持通风降湿，暂不需用药，3 天后复查', time: '2026-11-08 09:15' },
    { plot: 'B区2号大田', crop: '玉米', pest: '玉米螟', conf: 68, level: '中风险', advise: '建议释放赤眼蜂卵卡，或使用氯虫苯甲酰胺颗粒剂', time: '2026-11-07 16:40' },
  ],
  aiFertilize: [
    { plot: 'A区1号连栋大棚', crop: '番茄', stage: '结果期', n: '12', p: '6', k: '18', advise: '当前土壤速效钾 112mg/kg 偏低，建议追施硫酸钾 12kg/亩，配合磷酸一铵 6kg，分两次随水施入', water: '8 m³/亩·次' },
    { plot: 'B区2号大田', crop: '玉米', stage: '成熟期', n: '0', p: '0', k: '4', advise: '已进入成熟期，停止氮肥，可叶面喷施 0.2% 磷酸二氢钾保粒重', water: '不灌溉' },
  ],
  aiWeather: [
    { date: '11-09', type: '晴转多云', high: 26, low: 16, rain: 0, warn: '' },
    { date: '11-10', type: '小雨', high: 22, low: 15, rain: 8, warn: '注意棚内降湿' },
    { date: '11-11', type: '中雨', high: 19, low: 14, rain: 22, warn: '暴雨蓝色预警' },
    { date: '11-12', type: '阴', high: 20, low: 13, rain: 3, warn: '' },
  ],

  /* GIS 图层 */
  layers: [
    { name: '地块图层', on: 1, count: 39 },
    { name: '大棚图层', on: 1, count: 18 },
    { name: '设备点位图层', on: 1, count: 46 },
    { name: '气象图层', on: 1, count: 3 },
    { name: '遥感影像图层（NDVI）', on: 1, count: 1 },
    { name: '作业轨迹图层', on: 0, count: 12 },
  ],

  /* 用户 */
  users: [
    { id: 'U001', account: 'admin', name: '龙管理', gender: '女', phone: '13800001111', park: '平台中心', role: '管理员', status: '启用', last: '2026-11-09 08:30' },
    { id: 'U002', account: 'ops01', name: '王运维', gender: '女', phone: '13800002222', park: '永川智慧农业示范园', role: '运维', status: '启用', last: '2026-11-09 08:05' },
    { id: 'U003', account: 'farmer01', name: '吴农户', gender: '女', phone: '13800003333', park: '永川智慧农业示范园', role: '农户', status: '启用', last: '2026-11-09 07:10' },
    { id: 'U004', account: 'agri01', name: '张农艺', gender: '女', phone: '13800006666', park: '全园区', role: '农艺技术人员', status: '启用', last: '2026-11-09 09:00' },
    { id: 'U005', account: 'user001', name: '朱消费', gender: '女', phone: '18700002234', park: '—', role: '消费者', status: '启用', last: '2026-11-09 09:02' },
    { id: 'U006', account: 'twt', name: '谭管理', gender: '女', phone: '13212518067', park: '平台中心', role: '管理员', status: '启用', last: '2026-10-22 20:30' },
  ],

  /* 角色 */
  roles: [
    { id: 'R1', name: '管理员', perm: '用户管理、角色管理、权限管理、系统参数、日志审计、接口管理、数据监管', users: 1, desc: '平台最高权限，负责用户权限与系统参数统一管理' },
    { id: 'R2', name: '运维', perm: '设备管理、采集管理、系统运维、告警处置', users: 1, desc: '负责硬件设施与平台系统日常运维' },
    { id: 'R3', name: '农户', perm: '环境监测、视频监控、远程控制、农事工单、农资、采收、溯源、订单、报表', users: 3, desc: '负责园区地块的日常生产管理' },
    { id: 'R4', name: '农艺技术人员', perm: '环境与长势、病虫害诊断、技术方案、工单督导、采收质量、农残报告', users: 2, desc: '提供农业生产技术指导与质量评估' },
    { id: 'R5', name: '消费者', perm: '商品浏览、溯源查询、下单支付、订单管理', users: 2, desc: '平台农产品购买方，含游客与注册用户' },
  ],

  /* 字典 */
  dicts: [
    { code: 'CROP_TYPE', name: '作物类型', val: '番茄、黄瓜、草莓、水稻、玉米、小白菜、辣椒', param: '—' },
    { code: 'DEV_TYPE', name: '设备类型', val: '传感器、执行器、网关、摄像头', param: '—' },
    { code: 'ALARM_TYPE', name: '告警类型', val: '传感器异常、设备故障、环境超限、离线掉线、库存不足、灾害预警', param: '—' },
    { code: 'COLLECT_FREQ', name: '采集频率', val: '30秒、60秒、120秒、300秒', param: '默认 60 秒' },
    { code: 'ALARM_THRESHOLD', name: '告警阈值', val: '土壤湿度 35%、温度 30℃、溶氧 4.5mg/L', param: '按地块可覆盖' },
    { code: 'GRADE_STD', name: '分级标准', val: '一级、二级、等外', param: '按品类配置' },
  ],

  /* 日志 */
  logs: [
    { time: '2026-11-09 09:02', user: '朱消费', role: '消费者', ip: '117.139.21.9', action: '提交订单 DD-20261109-001', type: '操作日志', result: '成功' },
    { time: '2026-11-09 08:30', user: '龙管理', role: '管理员', ip: '10.20.0.9', action: '登录平台', type: '登录日志', result: '成功' },
    { time: '2026-11-09 08:20', user: '吴农户', role: '农户', ip: '10.20.3.41', action: '开启 A01 环流风机1号', type: '操作日志', result: '成功' },
    { time: '2026-11-09 08:05', user: '王运维', role: '运维', ip: '10.20.0.21', action: '登录平台', type: '登录日志', result: '成功' },
    { time: '2026-11-09 07:40', user: '未知账号', role: '—', ip: '45.132.8.66', action: '尝试登录失败（密码错误）', type: '登录日志', result: '失败' },
    { time: '2026-11-08 22:15', user: '系统', role: '—', ip: '—', action: '生成告警 AL-0912', type: '系统日志', result: '成功' },
  ],

  /* 接口 */
  apis: [
    { name: '气象数据服务', vendor: '重庆市气象局', url: 'https://api.cqweather.gov.cn/v1/forecast', freq: '每 30 分钟', status: '已授权', calls: 1428, last: '2026-11-09 09:00' },
    { name: '农业监管平台上报', vendor: '重庆市农业农村委', url: 'https://nyjg.cq.gov.cn/open/v1/report', freq: '每日 1 次', status: '已授权', calls: 96, last: '2026-11-09 06:00' },
    { name: '物联网网关接入', vendor: '自建网关', url: 'mqtt://iot.agri.local:1883', freq: '实时', status: '已授权', calls: 284619, last: '2026-11-09 09:12' },
    { name: '视频平台（海康 ISC）', vendor: '海康威视', url: 'https://isc.hikvision.local/api', freq: '实时', status: '已授权', calls: 8420, last: '2026-11-09 09:11' },
    { name: '电商订单同步', vendor: '抖音电商', url: 'https://openapi.jinritemai.com/order', freq: '每 10 分钟', status: '待配置', calls: 0, last: '—' },
  ],

  /* 农技：病虫害问诊 */
  pestCases: [
    { id: 'PC-001', plot: 'C区草莓园', crop: '草莓', reporter: '吴农户', question: '叶片背面出现白色粉状霉层，果实表面也有一层白粉，近两天湿度较高', images: 3, status: '待复核', time: '2026-11-09 08:26', ai: '白粉病（置信度 87%）' },
    { id: 'PC-002', plot: 'A区1号连栋大棚', crop: '番茄', reporter: '吴农户', question: '下部老叶出现褐色同心轮纹病斑，边缘有黄色晕圈', images: 2, status: '已诊断', time: '2026-11-08 09:15', ai: '早疫病（置信度 42%）' },
    { id: 'PC-003', plot: 'B区2号大田', crop: '玉米', reporter: '吴农户', question: '心叶展开后有排孔状被害，茎秆上有虫粪', images: 2, status: '已诊断', time: '2026-11-07 16:40', ai: '玉米螟（置信度 68%）' },
  ],

  /* 农技：技术方案 */
  techPlans: [
    { id: 'TP-001', plot: 'A区1号连栋大棚', crop: '番茄', stage: '结果期', type: '施肥方案', content: '硫酸钾 12kg/亩 + 磷酸一铵 6kg/亩，随水施入，7 天 1 次，连续 3 次', author: '张农艺', status: '已下发', time: '2026-11-08' },
    { id: 'TP-002', plot: 'C区草莓园', crop: '草莓', stage: '开花期', type: '病虫害防治', content: '醚菌酯 400g/亩 预防性喷施，重点喷叶背，安全间隔期 7 天', author: '张农艺', status: '已下发', time: '2026-11-08' },
    { id: 'TP-003', plot: 'B区2号大田', crop: '玉米', stage: '成熟期', type: '水分管理', content: '停止灌溉，保持田间持水量 60%，雨后及时排水', author: '张农艺', status: '草稿', time: '2026-11-09' },
  ],

  /* 农技：工单督导记录 */
  supervise: [
    { wo: 'WO-20261109-01', plot: 'DK-A01', title: '番茄结果期水肥一体化追肥', exec: '吴农户', check: '配比正确、施入均匀', problem: '—', advice: '建议补充微量元素硼、钙，防止脐腐病', status: '合格', time: '2026-11-09 10:15' },
    { wo: 'WO-20261108-01', plot: 'DK-B01', title: '水稻灌浆期补水', exec: '吴农户', check: '水位控制合理', problem: '局部田块水层偏深 3cm', advice: '适当退水，避免根系缺氧早衰', status: '需整改', time: '2026-11-08 15:20' },
    { wo: 'WO-20261107-01', plot: 'DK-A02', title: '黄瓜补苗移栽', exec: '吴农户', check: '株距 35cm、浇定根水', problem: '有 12 株未浇透', advice: '补浇定根水，3 天内观察缓苗情况', status: '合格', time: '2026-11-07 16:40' },
  ],

  /* 大屏数据 */
  screen: {
    parks: 3, area: 2610, devices: 46, online: 43, alarms: 7, output: 12680,
    cropDist: [
      { name: '番茄', v: 32 }, { name: '黄瓜', v: 21 }, { name: '水稻', v: 18 },
      { name: '草莓', v: 12 }, { name: '玉米', v: 9 }, { name: '叶菜', v: 8 },
    ],
    deviceRun: { run: 31, stop: 12, fault: 3 },
    traceCount: 21, scanCount: 1862, orders: 38, sales: 4286.5,
    workProgress: [
      { plot: 'A区1号连栋大棚', done: 6, total: 8 },
      { plot: 'A区2号日光温室', done: 4, total: 7 },
      { plot: 'C区草莓园', done: 3, total: 5 },
      { plot: 'B区露天大田', done: 5, total: 6 },
    ],
  },
};

/* ===== Vue 版补充数据 ===== */
DB.reviews = [
  { id: 'RV-001', goods: '永川粉贝贝番茄', goodsId: 'SP-001', user: '小青梅', stars: 5, text: '番茄很新鲜，酸甜适中，第二天一早就到了，包装也很严实。', time: '2026-11-09 19:20', reply: '', status: '待回复' },
  { id: 'RV-002', goods: '津优35水果黄瓜', goodsId: 'SP-002', user: '山城食客', stars: 5, text: '黄瓜脆嫩，生吃很清甜，孩子很喜欢。', time: '2026-11-09 12:05', reply: '感谢支持，下一批明天采摘！', status: '已回复' },
  { id: 'RV-003', goods: '南川宜香优大米', goodsId: 'SP-004', user: '小青梅', stars: 5, text: '米香很足，煮粥很黏，已经回购第三次了。', time: '2026-11-08 20:30', reply: '感谢支持！新米下周还有一批，可以关注一下「新鲜上市」。', status: '已回复' },
  { id: 'RV-004', goods: '璧山红颜草莓', goodsId: 'SP-003', user: 'CQ柠檬茶', stars: 4, text: '草莓个头大，甜度不错，有两颗稍微压软了，整体满意。', time: '2026-11-08 16:12', reply: '', status: '待回复' }
];

DB.messages = [
  { id: 'M1', type: '订单', title: '订单已发货', text: '你的「永川粉贝贝番茄 × 2」已由产地发出，预计明日 10:00 前送达。', time: '11-10 07:20', read: false },
  { id: 'M2', type: '评价', title: '评价回复提醒', text: '农户「吴农户」回复了你的评价：感谢支持！新米下周还有一批。', time: '11-09 21:02', read: false },
  { id: 'M3', type: '活动', title: '本周新品上架', text: '璧山红颜草莓进入盛果期，限时 9 折，冷链次日达。', time: '11-08 09:00', read: false },
  { id: 'M4', type: '系统', title: '溯源信息已更新', text: '你购买的大米批次 TR-00021 新增农残检测报告，可在「产品溯源」查看。', time: '11-07 16:40', read: true }
];

DB.consults = [
  {
    id: 'CS-001', from: '吴农户', role: '农户', plot: 'A区1号连栋大棚', title: '番茄下部叶片发黄',
    content: '最近三天番茄下部老叶发黄，叶脉还是绿的，棚内湿度 75% 左右，请问是缺镁还是病害？',
    time: '2026-11-09 08:40', status: '待回复', reply: '',
    messages: [
      { from: 'farmer', text: '吴老师，最近三天番茄下部老叶发黄，叶脉还是绿的，棚内湿度 75% 左右，是缺镁还是病害？', time: '2026-11-09 08:40' }
    ]
  },
  {
    id: 'CS-002', from: '吴农户', role: '农户', plot: 'C区草莓园', title: '草莓白粉病用药建议',
    content: '草莓叶片背面有白色粉状物，已经用了一次醚菌酯，还需要补喷吗？',
    time: '2026-11-08 17:10', status: '已回复',
    reply: '间隔 7 天后再补喷一次，重点喷叶背，注意采收安全间隔期。',
    messages: [
      { from: 'farmer', text: '草莓叶片背面有白色粉状物，已经用了一次醚菌酯，还需要补喷吗？', time: '2026-11-08 17:10' },
      { from: 'expert', text: '间隔 7 天后再补喷一次，重点喷叶背，注意采收安全间隔期。', time: '2026-11-08 17:26' }
    ]
  }
];

/* 售后申请（消费者发起，农户处理） */
DB.afterSales = [
  {
    id: 'AS-20261109-01', orderNo: 'M20261108002', user: '王双红', account: '18700002233',
    goods: '璧山红颜草莓 × 4', type: '坏果赔付', amount: 32,
    reason: '收到时有 3 颗草莓压软变质，已拍照留存。',
    status: '待处理', time: '2026-11-09 10:20', handleNote: '', handleTime: ''
  }
];

DB.consumers = [
  { id: 'CU-001', name: '王双红', phone: '187****2233', level: '青梅会员', orders: 3, spend: 221.6, status: '正常', reg: '2026-08-12', warn: 0 },
  { id: 'CU-002', name: '谭消费', phone: '138****6621', level: '新芽会员', orders: 1, spend: 25.6, status: '正常', reg: '2026-10-03', warn: 0 },
  { id: 'CU-003', name: '吴消费', phone: '135****8890', level: '新芽会员', orders: 1, spend: 28.8, status: '已警告', reg: '2026-09-18', warn: 1 }
];

DB.repairs = [
  { id: 'RP-001', dev: 'A01 LED补光灯', plot: 'A区1号连栋大棚', reporter: '吴农户', desc: '补光灯无法启动，配电箱指示灯不亮', level: '紧急', status: '待接单', time: '2026-11-09 08:56', assignee: '—' },
  { id: 'RP-002', dev: 'C01 育苗补光板', plot: 'C区草莓园', reporter: '吴农户', desc: '设备上报电源异常，已停止工作', level: '重要', status: '维修中', time: '2026-11-09 08:12', assignee: '王运维' },
  { id: 'RP-003', dev: 'B01 气象站', plot: 'B区露天大田', reporter: '吴农户', desc: '风向数据跳变，疑似传感器松动', level: '一般', status: '已完成', time: '2026-11-08 18:10', assignee: '王运维' }
];

DB.backups = [
  { id: 'BK-20261109', name: '全量备份', size: '86.4 MB', type: '自动', time: '2026-11-09 02:00', status: '成功' },
  { id: 'BK-20261108', name: '全量备份', size: '85.9 MB', type: '自动', time: '2026-11-08 02:00', status: '成功' },
  { id: 'BK-20261107', name: '手动备份', size: '85.1 MB', type: '手动', time: '2026-11-07 16:30', status: '成功' },
  { id: 'BK-20261106', name: '全量备份', size: '84.8 MB', type: '自动', time: '2026-11-06 02:00', status: '成功' }
];

DB.perms = [
  { module: '工作台', menu: '查看总览', data: '全平台', roles: ['管理员', '运维', '农户', '农艺技术人员'] },
  { module: '用户管理', menu: '新增 / 编辑 / 启停 / 删除', data: '全部用户', roles: ['管理员'] },
  { module: '角色权限', menu: '角色与权限配置', data: '全部角色', roles: ['管理员'] },
  { module: '环境监测', menu: '查看 / 导出', data: '所属园区', roles: ['管理员', '农户', '农艺技术人员'] },
  { module: '远程控制', menu: '设备启停 / 策略', data: '所属地块', roles: ['管理员', '运维', '农户'] },
  { module: '农事工单', menu: '创建 / 派单 / 打卡', data: '所属园区', roles: ['管理员', '农户', '农艺技术人员'] },
  { module: '订单管理', menu: '查看 / 发货', data: '本店铺', roles: ['管理员', '农户'] },
  { module: '溯源查询', menu: '查看 / 录入', data: '公开 / 本园区', roles: ['全部角色'] }
];

DB.orderItems = {
  M20261109001: [{ id: 'SP-001', qty: 2 }],
  M20261108002: [{ id: 'SP-003', qty: 4 }],
  M20261103003: [{ id: 'SP-004', qty: 1 }]
};

DB.faqs = [
  { q: '多久能发货？', a: '产地当日采摘，16:00 前下单当日发出，重庆市内次日达，周边省市 48 小时内送达。' },
  { q: '如何查询溯源？', a: '包装标签上有溯源二维码，也可在「产品溯源」页输入批次码，查看环境、农事、检测全记录。' },
  { q: '坏果怎么赔？', a: '收货 24 小时内拍照联系农户，经核实后按坏果数量退款或补发，无需退回。' }
];

export default DB;

