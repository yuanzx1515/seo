/**
 * GEO功能模块Mock数据
 */

// 模拟GEO列表数据
const mockGeoList = [
  {
    id: 1,
    country: '中国',
    countryCode: 'CN',
    ip: '116.30.45.123',
    location: '北京市',
    latitude: 39.9042,
    longitude: 116.4074,
    timezone: 'Asia/Shanghai',
    isp: '中国电信',
    status: 'active',
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    country: '美国',
    countryCode: 'US',
    ip: '192.168.1.100',
    location: '纽约',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York',
    isp: 'Verizon',
    status: 'active',
    createTime: '2024-01-16 14:20:00'
  },
  {
    id: 3,
    country: '英国',
    countryCode: 'GB',
    ip: '192.168.1.101',
    location: '伦敦',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
    isp: 'BT',
    status: 'active',
    createTime: '2024-01-17 09:15:00'
  },
  {
    id: 4,
    country: '日本',
    countryCode: 'JP',
    ip: '192.168.1.102',
    location: '东京',
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: 'Asia/Tokyo',
    isp: 'NTT',
    status: 'inactive',
    createTime: '2024-01-18 11:00:00'
  }
]

/**
 * 添加GEO配置
 */
export function addGeo(data) {
  const newGeo = {
    id: mockGeoList.length + 1,
    ...data,
    createTime: new Date().toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    }).replace(/\//g, '-')
  }
  mockGeoList.push(newGeo)
  return {
    code: 200,
    message: '添加成功',
    data: newGeo
  }
}

/**
 * 更新GEO配置
 */
export function updateGeo(data) {
  const index = mockGeoList.findIndex(item => item.id === data.id)
  if (index !== -1) {
    mockGeoList[index] = {
      ...mockGeoList[index],
      ...data,
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
      data: mockGeoList[index]
    }
  }
  return {
    code: 404,
    message: 'GEO配置不存在',
    data: null
  }
}

/**
 * 删除GEO配置
 */
export function deleteGeo(id) {
  const index = mockGeoList.findIndex(item => item.id === id)
  if (index !== -1) {
    mockGeoList.splice(index, 1)
    return {
      code: 200,
      message: '删除成功',
      data: null
    }
  }
  return {
    code: 404,
    message: 'GEO配置不存在',
    data: null
  }
}

/**
 * 获取GEO列表
 */
export function getGeoList(params) {
  const { page = 1, size = 10, keyword = '', country = '' } = params
  let filteredList = [...mockGeoList]
  
  // 关键词搜索
  if (keyword) {
    filteredList = filteredList.filter(item => 
      item.country.includes(keyword) || 
      item.location.includes(keyword) ||
      item.ip.includes(keyword)
    )
  }
  
  // 国家筛选
  if (country) {
    filteredList = filteredList.filter(item => item.countryCode === country)
  }
  
  // 计算统计信息
  const statistics = {
    total: filteredList.length,
    active: filteredList.filter(item => item.status === 'active').length,
    countries: new Set(filteredList.map(item => item.countryCode)).size,
    ips: filteredList.length
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
      size: parseInt(size),
      statistics
    }
  }
}

/**
 * Mock数据路由映射
 */
export const geoMockMap = {
  'POST /api/seo/geo/add': addGeo,
  'POST /api/seo/geo/update': updateGeo,
  'POST /api/seo/geo/delete': deleteGeo,
  'GET /api/seo/geo/list': getGeoList
}











