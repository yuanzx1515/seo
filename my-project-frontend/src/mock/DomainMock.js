/**
 * 域名管理模块Mock数据
 */

// 模拟域名列表数据
const mockDomainList = [
  {
    id: 1,
    domain: 'example.com',
    registrar: '阿里云',
    registerDate: '2020-01-01',
    expireDate: '2025-01-01',
    daysLeft: 365,
    dns: 'ns1.example.com,ns2.example.com',
    status: 'normal',
    sourceWebsite: 'https://www.example-source.com',
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    domain: 'demo.com',
    registrar: '腾讯云',
    registerDate: '2019-06-15',
    expireDate: '2024-06-15',
    daysLeft: 30,
    dns: 'f1g1ns1.dnspod.net,f1g1ns2.dnspod.net',
    status: 'expiring',
    sourceWebsite: 'https://www.demo-source.com',
    createTime: '2024-01-16 14:20:00'
  },
  {
    id: 3,
    domain: 'test.com',
    registrar: 'GoDaddy',
    registerDate: '2018-03-20',
    expireDate: '2023-03-20',
    daysLeft: -30,
    dns: 'ns1.godaddy.com,ns2.godaddy.com',
    status: 'expired',
    sourceWebsite: '',
    createTime: '2024-01-17 09:15:00'
  }
]

/**
 * 计算剩余天数
 */
function calculateDaysLeft(expireDate) {
  const expire = new Date(expireDate)
  const now = new Date()
  const diff = expire.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * 获取状态
 */
function getStatus(daysLeft) {
  if (daysLeft < 0) return 'expired'
  if (daysLeft <= 30) return 'expiring'
  return 'normal'
}

/**
 * 添加域名
 */
export function addDomain(data) {
  // 确保日期格式正确
  let expireDate = data.expireDate
  if (expireDate instanceof Date) {
    expireDate = expireDate.toISOString().split('T')[0]
  } else if (typeof expireDate === 'string' && expireDate.includes('T')) {
    expireDate = expireDate.split('T')[0]
  }
  
  let registerDate = data.registerDate
  if (registerDate instanceof Date) {
    registerDate = registerDate.toISOString().split('T')[0]
  } else if (typeof registerDate === 'string' && registerDate.includes('T')) {
    registerDate = registerDate.split('T')[0]
  }
  
  const daysLeft = calculateDaysLeft(expireDate)
  const status = getStatus(daysLeft)
  
  // 确保ID唯一（使用时间戳+随机数）
  const newId = mockDomainList.length > 0 
    ? Math.max(...mockDomainList.map(d => d.id)) + 1 
    : 1
  
  const newDomain = {
    id: newId,
    domain: data.domain || '',
    registrar: data.registrar || '',
    registerDate: registerDate || '',
    expireDate: expireDate || '',
    dns: data.dns || '',
    daysLeft: daysLeft,
    status: status,
    sourceWebsite: data.sourceWebsite || '',
    createTime: new Date().toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    }).replace(/\//g, '-')
  }
  
  // 添加到列表开头，这样新添加的会优先显示
  mockDomainList.unshift(newDomain)
  
  console.log('添加域名成功:', newDomain)
  console.log('当前域名列表:', mockDomainList)
  
  return {
    code: 200,
    message: '添加成功',
    data: newDomain
  }
}

/**
 * 更新域名
 */
export function updateDomain(data) {
  const index = mockDomainList.findIndex(item => item.id === data.id)
  if (index !== -1) {
    const daysLeft = calculateDaysLeft(data.expireDate)
    const status = getStatus(daysLeft)
    
    mockDomainList[index] = {
      ...mockDomainList[index],
      ...data,
      daysLeft,
      status,
      updateTime: new Date().toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }).replace(/\//g, '-')
    }
    return {
      code: 200,
      message: '更新成功',
      data: mockDomainList[index]
    }
  }
  return {
    code: 404,
    message: '域名不存在',
    data: null
  }
}

/**
 * 删除域名
 */
export function deleteDomain(id) {
  const index = mockDomainList.findIndex(item => item.id === id)
  if (index !== -1) {
    mockDomainList.splice(index, 1)
    return {
      code: 200,
      message: '删除成功',
      data: null
    }
  }
  return {
    code: 404,
    message: '域名不存在',
    data: null
  }
}

/**
 * 获取域名列表
 */
export function getDomainList(params) {
  const { page = 1, size = 10, keyword = '', status = '' } = params
  
  console.log('获取域名列表，参数:', params)
  console.log('当前域名列表:', mockDomainList)
  
  let filteredList = [...mockDomainList]
  
  // 关键词搜索
  if (keyword) {
    filteredList = filteredList.filter(item => 
      item.domain.includes(keyword) || 
      item.registrar.includes(keyword)
    )
  }
  
  // 状态筛选
  if (status) {
    filteredList = filteredList.filter(item => item.status === status)
  }
  
  // 按创建时间倒序排列（最新的在前面）
  filteredList.sort((a, b) => {
    const timeA = new Date(a.createTime || 0).getTime()
    const timeB = new Date(b.createTime || 0).getTime()
    return timeB - timeA
  })
  
  // 分页
  const start = (page - 1) * size
  const end = start + size
  const paginatedList = filteredList.slice(start, end)
  
  console.log('过滤后的列表:', filteredList)
  console.log('分页后的列表:', paginatedList)
  
  return {
    code: 200,
    message: '获取成功',
    data: {
      list: paginatedList,
      total: filteredList.length,
      page: parseInt(page),
      size: parseInt(size)
    }
  }
}

/**
 * 检查域名
 */
export function checkDomain(id) {
  const domain = mockDomainList.find(item => item.id === id)
  if (domain) {
    const daysLeft = calculateDaysLeft(domain.expireDate)
    const status = getStatus(daysLeft)
    domain.daysLeft = daysLeft
    domain.status = status
    
    return {
      code: 200,
      message: '检查完成',
      data: {
        id: domain.id,
        status: domain.status,
        daysLeft: domain.daysLeft,
        checkTime: new Date().toLocaleString('zh-CN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        }).replace(/\//g, '-')
      }
    }
  }
  return {
    code: 404,
    message: '域名不存在',
    data: null
  }
}

/**
 * 解析域名信息
 */
export function parseDomain(params) {
  const { domain } = params
  
  if (!domain) {
    return {
      code: 400,
      message: '域名不能为空',
      data: null
    }
  }

  // 模拟解析结果
  // 实际应该调用WHOIS API或域名查询服务
  const registrars = ['阿里云', '腾讯云', 'GoDaddy', 'Namecheap', 'Cloudflare', '万网']
  const registrar = registrars[Math.floor(Math.random() * registrars.length)]
  
  // 生成随机注册日期（1-5年前）
  const registerYear = new Date().getFullYear() - Math.floor(Math.random() * 5) - 1
  const registerMonth = Math.floor(Math.random() * 12) + 1
  const registerDay = Math.floor(Math.random() * 28) + 1
  const registerDate = `${registerYear}-${String(registerMonth).padStart(2, '0')}-${String(registerDay).padStart(2, '0')}`
  
  // 生成到期日期（注册日期后1-10年）
  const expireYear = registerYear + Math.floor(Math.random() * 10) + 1
  const expireMonth = Math.floor(Math.random() * 12) + 1
  const expireDay = Math.floor(Math.random() * 28) + 1
  const expireDate = `${expireYear}-${String(expireMonth).padStart(2, '0')}-${String(expireDay).padStart(2, '0')}`
  
  // 生成DNS服务器
  const dnsOptions = [
    ['ns1.example.com', 'ns2.example.com'],
    ['f1g1ns1.dnspod.net', 'f1g1ns2.dnspod.net'],
    ['ns1.godaddy.com', 'ns2.godaddy.com'],
    ['dns1.cloudflare.com', 'dns2.cloudflare.com'],
    ['ns1.aliyun.com', 'ns2.aliyun.com']
  ]
  const dns = dnsOptions[Math.floor(Math.random() * dnsOptions.length)]

  return {
    code: 200,
    message: '解析成功',
    data: {
      domain: domain,
      registrar: registrar,
      registerDate: registerDate,
      expireDate: expireDate,
      dns: dns
    }
  }
}

/**
 * Mock数据路由映射
 */
export const domainMockMap = {
  'POST /api/seo/domain/add': addDomain,
  'POST /api/seo/domain/update': updateDomain,
  'POST /api/seo/domain/delete': deleteDomain,
  'GET /api/seo/domain/list': getDomainList,
  'POST /api/seo/domain/check': checkDomain,
  'POST /api/seo/domain/parse': parseDomain
}






