/**
 * SEO关键字查询模块Mock数据
 */

/**
 * 从HTML中提取title和meta description
 */
function extractTitleAndMeta(html) {
  let title = ''
  let metaDescription = ''
  
  // 提取title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) {
    title = titleMatch[1].trim()
  }
  
  // 提取meta description
  const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
  if (metaMatch) {
    metaDescription = metaMatch[1].trim()
  }
  
  return { title, metaDescription }
}

/**
 * 查询网站title和meta description
 * 使用CORS代理服务来获取网站内容
 */
export async function queryKeyword(params) {
  const { url } = params
  
  if (!url) {
    return {
      code: 400,
      message: 'URL参数不能为空',
      data: null
    }
  }
  
  // 确保URL包含协议
  let targetUrl = url.trim()
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl
  }
  
  try {
    // 使用CORS代理服务获取网站内容
    // 这里使用allorigins.win作为代理，也可以使用其他CORS代理服务
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`
    
    const response = await fetch(proxyUrl)
    const data = await response.json()
    
    if (data.status.http_code !== 200) {
      return {
        code: 500,
        message: `无法访问网站: ${data.status.http_code}`,
        data: {
          url: targetUrl,
          title: '',
          metaDescription: ''
        }
      }
    }
    
    const html = data.contents
    const { title, metaDescription } = extractTitleAndMeta(html)
    
    return {
      code: 200,
      message: '查询成功',
      data: {
        url: targetUrl,
        title: title || '未找到标题',
        metaDescription: metaDescription || '未找到描述'
      }
    }
  } catch (error) {
    console.error('获取网站信息失败:', error)
    return {
      code: 500,
      message: `获取网站信息失败: ${error.message}`,
      data: {
        url: targetUrl,
        title: '',
        metaDescription: ''
      }
    }
  }
}

/**
 * Mock映射表
 */
export const keywordMockMap = {
  'GET /api/seo/keyword/query': queryKeyword
}

