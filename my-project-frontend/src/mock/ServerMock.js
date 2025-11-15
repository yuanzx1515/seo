/**
 * 服务器管理模块Mock数据
 */

// 模拟服务器列表数据
const mockServerList = [
  {
    id: 1,
    name: '生产服务器-01',
    ip: '192.168.1.100',
    panelUrl: 'https://panel.example.com',
    panelPassword: 'password123',
    region: '北京',
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: '测试服务器-01',
    ip: '192.168.1.101',
    panelUrl: 'https://test-panel.example.com',
    panelPassword: 'test123456',
    region: '上海',
    createTime: '2024-01-16 14:20:00'
  },
  {
    id: 3,
    name: '备用服务器-01',
    ip: '192.168.1.102',
    panelUrl: 'https://backup-panel.example.com',
    panelPassword: 'backup789',
    region: '广州',
    createTime: '2024-01-17 09:15:00'
  }
]

/**
 * 添加服务器
 */
export function addServer(data) {
  const maxId = mockServerList.length > 0 ? Math.max(...mockServerList.map(s => s.id)) : 0
  const newServer = {
    id: maxId + 1,
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
  mockServerList.unshift(newServer)
  return {
    code: 200,
    message: '添加成功',
    data: newServer
  }
}

/**
 * 更新服务器
 */
export function updateServer(data) {
  const index = mockServerList.findIndex(item => item.id === data.id)
  if (index !== -1) {
    mockServerList[index] = {
      ...mockServerList[index],
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
      data: mockServerList[index]
    }
  }
  return {
    code: 404,
    message: '服务器不存在',
    data: null
  }
}

/**
 * 删除服务器
 */
export function deleteServer(id) {
  const index = mockServerList.findIndex(item => item.id === id)
  if (index !== -1) {
    mockServerList.splice(index, 1)
    return {
      code: 200,
      message: '删除成功',
      data: null
    }
  }
  return {
    code: 404,
    message: '服务器不存在',
    data: null
  }
}

/**
 * 获取服务器列表
 */
export function getServerList(params) {
  const { page = 1, size = 10, keyword = '' } = params
  let filteredList = [...mockServerList]
  
  // 关键词搜索
  if (keyword) {
    filteredList = filteredList.filter(item => 
      item.name.includes(keyword) || 
      item.ip.includes(keyword) ||
      item.region.includes(keyword)
    )
  }
  
  // 按创建时间倒序排列
  filteredList.sort((a, b) => {
    return new Date(b.createTime) - new Date(a.createTime)
  })
  
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
 * Mock数据路由映射
 */
export const serverMockMap = {
  'POST /api/seo/server/add': addServer,
  'POST /api/seo/server/update': updateServer,
  'POST /api/seo/server/delete': deleteServer,
  'GET /api/seo/server/list': getServerList
}







