/**
 * SEO外链管理模块Mock数据
 */

// 模拟外链列表数据
const mockBacklinkList = [
  {
    id: 1,
    url: 'https://www.example.com/article1',
    anchorText: 'SEO优化服务',
    targetUrl: 'https://www.target.com',
    domain: 'example.com',
    type: 'dofollow',
    status: 'active',
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    url: 'https://www.demo.com/post',
    anchorText: '网站建设',
    targetUrl: 'https://www.target.com/service',
    domain: 'demo.com',
    type: 'nofollow',
    status: 'active',
    createTime: '2024-01-16 14:20:00'
  },
  {
    id: 3,
    url: 'https://www.test.com/blog',
    anchorText: '搜索引擎优化',
    targetUrl: 'https://www.target.com',
    domain: 'test.com',
    type: 'dofollow',
    status: 'inactive',
    createTime: '2024-01-17 09:15:00'
  }
]

/**
 * 添加外链
 */
export function addBacklink(data) {
  const newBacklink = {
    id: mockBacklinkList.length + 1,
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
  mockBacklinkList.push(newBacklink)
  return {
    code: 200,
    message: '添加成功',
    data: newBacklink
  }
}

/**
 * 更新外链
 */
export function updateBacklink(data) {
  const index = mockBacklinkList.findIndex(item => item.id === data.id)
  if (index !== -1) {
    mockBacklinkList[index] = {
      ...mockBacklinkList[index],
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
      data: mockBacklinkList[index]
    }
  }
  return {
    code: 404,
    message: '外链不存在',
    data: null
  }
}

/**
 * 删除外链
 */
export function deleteBacklink(id) {
  const index = mockBacklinkList.findIndex(item => item.id === id)
  if (index !== -1) {
    mockBacklinkList.splice(index, 1)
    return {
      code: 200,
      message: '删除成功',
      data: null
    }
  }
  return {
    code: 404,
    message: '外链不存在',
    data: null
  }
}

/**
 * 获取外链列表
 */
export function getBacklinkList(params) {
  const { page = 1, size = 10, keyword = '', status = '' } = params
  let filteredList = [...mockBacklinkList]
  
  // 关键词搜索
  if (keyword) {
    filteredList = filteredList.filter(item => 
      item.url.includes(keyword) || 
      item.anchorText.includes(keyword) ||
      item.targetUrl.includes(keyword) ||
      item.domain.includes(keyword)
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
 * 检查外链
 */
export function checkBacklink(id) {
  const backlink = mockBacklinkList.find(item => item.id === id)
  if (backlink) {
    // 模拟检查结果，随机返回有效或无效
    const isActive = Math.random() > 0.3
    backlink.status = isActive ? 'active' : 'inactive'
    
    return {
      code: 200,
      message: '检查完成',
      data: {
        id: backlink.id,
        status: backlink.status,
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
    message: '外链不存在',
    data: null
  }
}

/**
 * Mock数据路由映射
 */
export const backlinkMockMap = {
  'POST /api/seo/backlink/add': addBacklink,
  'POST /api/seo/backlink/update': updateBacklink,
  'POST /api/seo/backlink/delete': deleteBacklink,
  'GET /api/seo/backlink/list': getBacklinkList,
  'POST /api/seo/backlink/check': checkBacklink
}





