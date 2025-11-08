/**
 * 服务器管理模块Mock数据
 */

// 模拟服务器列表数据
const mockServerList = [
  {
    id: 1,
    name: '生产服务器-01',
    ip: '192.168.1.100',
    port: 22,
    username: 'root',
    type: 'linux',
    status: 'online',
    cpu: 45.5,
    memory: 60.2,
    disk: 35.8,
    remark: '主要生产服务器',
    lastCheckTime: '2024-01-20 10:30:00',
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: '测试服务器-01',
    ip: '192.168.1.101',
    port: 22,
    username: 'admin',
    type: 'linux',
    status: 'online',
    cpu: 25.3,
    memory: 45.6,
    disk: 55.2,
    remark: '测试环境服务器',
    lastCheckTime: '2024-01-20 09:15:00',
    createTime: '2024-01-16 14:20:00'
  },
  {
    id: 3,
    name: 'Windows服务器-01',
    ip: '192.168.1.102',
    port: 3389,
    username: 'administrator',
    type: 'windows',
    status: 'offline',
    cpu: 0,
    memory: 0,
    disk: 0,
    remark: 'Windows服务器',
    lastCheckTime: '2024-01-19 15:45:00',
    createTime: '2024-01-17 09:15:00'
  }
]

/**
 * 生成随机资源使用率
 */
function generateResourceUsage() {
  return {
    cpu: Math.round((Math.random() * 80 + 10) * 10) / 10,
    memory: Math.round((Math.random() * 70 + 20) * 10) / 10,
    disk: Math.round((Math.random() * 60 + 30) * 10) / 10
  }
}

/**
 * 添加服务器
 */
export function addServer(data) {
  const newServer = {
    id: mockServerList.length + 1,
    ...data,
    status: 'offline',
    cpu: 0,
    memory: 0,
    disk: 0,
    createTime: new Date().toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    }).replace(/\//g, '-')
  }
  mockServerList.push(newServer)
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
  const { page = 1, size = 10, keyword = '', status = '' } = params
  let filteredList = [...mockServerList]
  
  // 关键词搜索
  if (keyword) {
    filteredList = filteredList.filter(item => 
      item.name.includes(keyword) || 
      item.ip.includes(keyword)
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
 * 检查服务器状态
 */
export function checkServer(id) {
  const server = mockServerList.find(item => item.id === id)
  if (server) {
    // 模拟检查结果，90%概率在线
    const isOnline = Math.random() > 0.1
    const resourceUsage = isOnline ? generateResourceUsage() : { cpu: 0, memory: 0, disk: 0 }
    
    server.status = isOnline ? 'online' : 'offline'
    server.cpu = resourceUsage.cpu
    server.memory = resourceUsage.memory
    server.disk = resourceUsage.disk
    server.lastCheckTime = new Date().toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    }).replace(/\//g, '-')
    
    return {
      code: 200,
      message: '检查完成',
      data: {
        id: server.id,
        status: server.status,
        cpu: server.cpu,
        memory: server.memory,
        disk: server.disk,
        checkTime: server.lastCheckTime
      }
    }
  }
  return {
    code: 404,
    message: '服务器不存在',
    data: null
  }
}

/**
 * 连接服务器
 */
export function connectServer(id) {
  const server = mockServerList.find(item => item.id === id)
  if (server) {
    // 模拟连接，80%成功率
    const success = Math.random() > 0.2
    if (success) {
      server.status = 'online'
      const resourceUsage = generateResourceUsage()
      server.cpu = resourceUsage.cpu
      server.memory = resourceUsage.memory
      server.disk = resourceUsage.disk
      
      return {
        code: 200,
        message: '连接成功',
        data: {
          id: server.id,
          connectTime: new Date().toLocaleString('zh-CN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }).replace(/\//g, '-')
        }
      }
    } else {
      return {
        code: 500,
        message: '连接失败，请检查服务器配置',
        data: null
      }
    }
  }
  return {
    code: 404,
    message: '服务器不存在',
    data: null
  }
}

/**
 * Mock数据路由映射
 */
export const serverMockMap = {
  'POST /api/seo/server/add': addServer,
  'POST /api/seo/server/update': updateServer,
  'POST /api/seo/server/delete': deleteServer,
  'GET /api/seo/server/list': getServerList,
  'POST /api/seo/server/check': checkServer,
  'POST /api/seo/server/connect': connectServer
}





