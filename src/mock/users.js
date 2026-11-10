export const mockUsers = [
  { id:1, username:'admin', password:'123456', realName:'平台管理员', role:'admin', phone:'13800000001', parkName:'智慧农业示范园区' },
  { id:2, username:'ops',   password:'123456', realName:'运维张工',   role:'ops',   phone:'13800000002', parkName:'智慧农业示范园区' },
  { id:3, username:'farmer',password:'123456', realName:'李农夫',     role:'farmer',phone:'13800000003', parkName:'沙坪坝种植基地' },
  { id:4, username:'agri',  password:'123456', realName:'王农技',     role:'agri',  phone:'13800000004', parkName:'跨园区指导' },
  { id:5, username:'consumer',password:'123456', realName:'赵顾客',role:'consumer',phone:'13800000005', parkName:null },
]

export const roleLabel = { admin:'管理员', ops:'运维', farmer:'农户', agri:'农技专家', consumer:'注册消费者' }

export const roleMap = {
  admin:    { username:'admin',    realName:'平台管理员',  role:'admin',    phone:'13800000001', parkName:'智慧农业示范园区' },
  ops:      { username:'ops',      realName:'运维张工',    role:'ops',      phone:'13800000002', parkName:'智慧农业示范园区' },
  farmer:   { username:'farmer',   realName:'李农夫',      role:'farmer',   phone:'13800000003', parkName:'沙坪坝种植基地' },
  agri:     { username:'agri',     realName:'王农技',      role:'agri',     phone:'13800000004', parkName:'跨园区指导' },
  consumer: { username:'consumer', realName:'赵顾客',      role:'consumer', phone:'13800000005', parkName:null },
}

export function loginUser(u, p) {
  const x = mockUsers.find(x => x.username === u && x.password === p)
  if (!x) return { ok:false, msg:'用户名或密码错误' }
  const { password: _, ...safe } = x
  return { ok:true, data:safe }
}

export function registerUser(p) {
  if (mockUsers.find(u => u.username === p.username))
    return { ok:false, msg:'用户名已存在' }
  mockUsers.push({ id: mockUsers.length + 1, ...p, role: p.role || 'farmer' })
  return { ok:true, msg:'注册成功' }
}

export function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
