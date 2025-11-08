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
  const daysLeft = calculateDaysLeft(data.expireDate)
  const status = getStatus(daysLeft)
  
  const newDomain = {
    id: mockDomainList.length + 1,
    ...data,
    daysLeft,
    status,
    createTime: new Date().toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    }).replace(/\//g, '-')
  }
  mockDomainList.push(newDomain)
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
  
  // 分页
  const start = (page - 1) * size
  const end = start + size
  const paginatedList = filteredList.slice(start, end)
  
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
 * Mock数据路由映射
 */
export const domainMockMap = {
  'POST /api/seo/domain/add': addDomain,
  'POST /api/seo/domain/update': updateDomain,
  'POST /api/seo/domain/delete': deleteDomain,
  'GET /api/seo/domain/list': getDomainList,
  'POST /api/seo/domain/check': checkDomain
}





