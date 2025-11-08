/**
 * SEO网站管理模块Mock数据
 */

// 模拟网站列表数据
const mockWebsiteList = [
  {
    id: 1,
    url: 'https://www.example.com',
    title: '示例网站 - 专业服务提供商',
    keywords: 'SEO优化,网站建设,搜索引擎优化',
    status: 'active',
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    url: 'https://www.demo.com',
    title: '演示网站 - 创新科技解决方案',
    keywords: '科技创新,数字化转型,智能解决方案',
    status: 'active',
    createTime: '2024-01-16 14:20:00'
  },
  {
    id: 3,
    url: 'https://www.test.com',
    title: '测试网站 - 优质产品展示',
    keywords: '产品展示,在线购物,优质服务',
    status: 'inactive',
    createTime: '2024-01-17 09:15:00'
  }
]

/**
 * 分析网站获取关键词
 */
export function analyzeWebsite(url) {
  return {
    code: 200,
    message: '分析成功',
    data: {
      title: '网站标题 - ' + url,
      keywords: ['SEO优化', '网站建设', '搜索引擎', '关键词优化', '内容营销'],
      description: '这是一个专业的网站，提供优质的服务和产品'
    }
  }
}

/**
 * 添加网站
 */
export function addWebsite(data) {
  const newWebsite = {
    id: mockWebsiteList.length + 1,
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
  mockWebsiteList.push(newWebsite)
  return {
    code: 200,
    message: '添加成功',
    data: newWebsite
  }
}

/**
 * 更新网站
 */
export function updateWebsite(data) {
  const index = mockWebsiteList.findIndex(item => item.id === data.id)
  if (index !== -1) {
    mockWebsiteList[index] = {
      ...mockWebsiteList[index],
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
      data: mockWebsiteList[index]
    }
  }
  return {
    code: 404,
    message: '网站不存在',
    data: null
  }
}

/**
 * 删除网站
 */
export function deleteWebsite(id) {
  const index = mockWebsiteList.findIndex(item => item.id === id)
  if (index !== -1) {
    mockWebsiteList.splice(index, 1)
    return {
      code: 200,
      message: '删除成功',
      data: null
    }
  }
  return {
    code: 404,
    message: '网站不存在',
    data: null
  }
}

/**
 * 获取网站列表
 */
export function getWebsiteList(params) {
  const { page = 1, size = 10, keyword = '' } = params
  let filteredList = [...mockWebsiteList]
  
  // 关键词搜索
  if (keyword) {
    filteredList = filteredList.filter(item => 
      item.url.includes(keyword) || 
      item.title.includes(keyword) ||
      item.keywords.includes(keyword)
    )
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
 * 获取网站代码
 */
export function getWebsiteCode(params) {
  const id = parseInt(params.id)
  const website = mockWebsiteList.find(item => item.id === id)
  if (website) {
    const keywordsArray = website.keywords.split(',')
    const keywordsMeta = keywordsArray.map(k => k.trim()).join(', ')
    
    return {
      code: 200,
      message: '获取成功',
      data: {
        html: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${website.title}</title>
    <meta name="keywords" content="${keywordsMeta}">
    <meta name="description" content="${website.title}">
</head>
<body>
    <h1>${website.title}</h1>
    <p>网站内容...</p>
</body>
</html>`,
        keywords: `<meta name="keywords" content="${keywordsMeta}">`
      }
    }
  }
  return {
    code: 404,
    message: '网站不存在',
    data: null
  }
}

/**
 * Mock数据路由映射
 */
export const websiteMockMap = {
  'POST /api/seo/website/analyze': analyzeWebsite,
  'POST /api/seo/website/add': addWebsite,
  'POST /api/seo/website/update': updateWebsite,
  'POST /api/seo/website/delete': deleteWebsite,
  'GET /api/seo/website/list': getWebsiteList,
  'GET /api/seo/website/code/:id': getWebsiteCode
}

