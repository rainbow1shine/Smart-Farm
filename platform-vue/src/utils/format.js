export const money = (n, digits = 2) => '¥' + Number(n || 0).toFixed(digits)

export const shortMoney = (n) => {
  const v = Number(n || 0)
  return v >= 10000 ? '¥' + (v / 10000).toFixed(1) + '万' : money(v)
}

export const dateTime = (d = new Date()) => {
  const p = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export const dateOnly = (d = new Date()) => {
  const p = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export const maskPhone = (phone) => String(phone || '').replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')

export const orderNo = () => {
  const d = new Date()
  const p = (x) => String(x).padStart(2, '0')
  return `M${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${String(Date.now()).slice(-6)}`
}

export const greeting = () => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 11) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

export const downloadCsv = (filename, columns, rows) => {
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const head = columns.map(c => escape(c.label)).join(',')
  const body = rows.map(r => columns.map(c => escape(typeof c.value === 'function' ? c.value(r) : r[c.prop])).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + head + '\n' + body], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

export const qrSvg = (size = 120, cells = 21) => {
  const cw = size / cells
  let rects = ''
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      const fx = x < 8 && y < 8, fy = x >= cells - 8 && y < 8, fz = x < 8 && y >= cells - 8
      let fill = false
      if (fx) fill = x === 0 || y === 0 || x === 7 || y === 7 || (x >= 2 && x <= 5 && y >= 2 && y <= 5)
      else if (fy) { const xx = x - (cells - 8); fill = xx === 0 || y === 0 || xx === 7 || y === 7 || (xx >= 2 && xx <= 5 && y >= 2 && y <= 5) }
      else if (fz) fill = x === 0 || y === cells - 8 || x === 7 || y === cells - 1 || (x >= 2 && x <= 5 && y >= cells - 6 && y <= cells - 3)
      else fill = ((x * 7 + y * 13 + x * y) % 5) < 2
      if (fill) rects += `<rect x="${(x * cw).toFixed(2)}" y="${(y * cw).toFixed(2)}" width="${cw.toFixed(2)}" height="${cw.toFixed(2)}" fill="#1f2a1b"/>`
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="border-radius:10px;background:#fff">${rects}</svg>`
}

export const statusTone = (s) => {
  const map = {
    正常: 'success', 运行: 'success', 启用: 'success', 合格: 'success', 已完成: 'info',
    已验收: 'info', 已闭环: 'info', 已发布: 'success', 优: 'success', 良: 'success', 优秀: 'success',
    预警: 'warning', 低库存: 'warning', 待执行: 'info', 计划中: 'info', 处置中: 'warning',
    中风险: 'warning', 一般: 'warning', 待发货: 'warning', 运输中: 'primary', 待收货: 'primary',
    已发货: 'primary', 离线: 'info', 停止: 'info', 待机: 'info', 需整改: 'danger', 故障: 'danger',
    紧急: 'danger', 待处置: 'danger', 待回复: 'warning', 待审核: 'warning', 待接单: 'danger',
    维修中: 'warning', 检测中: 'primary', 待生成: 'info', 草稿: 'info', 待复核: 'warning',
    已诊断: 'success', 已完结: 'info', 中断: 'danger', 待配置: 'warning', 已授权: 'success',
    停用: 'info', 失败: 'danger', 成功: 'success', 已溯源: 'success', 执行中: 'primary',
    待整改: 'danger', 已下发: 'success', 已警告: 'danger', 已取消: 'info', 待评价: 'warning',
    已回复: 'success', 待付款: 'warning', 已支付: 'success'
  }
  return map[s] || 'info'
}
