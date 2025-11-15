/**
 * 百度站内搜索Mock数据
 * 注意：此Mock数据仅用于开发测试
 * 生产环境应该调用真实的百度站内搜索API
 */

/**
 * 生成站内搜索Mock结果
 */
function generateSiteSearchResults(targetSite, searchSite) {
  const mockResults = [
    {
      title: `${targetSite} - 在${searchSite}上的相关页面`,
      url: `https://${searchSite}/article/${targetSite.replace(/\./g, '-')}-1.html`,
      snippet: `这是关于<em>${targetSite}</em>的详细介绍页面，在<em>${searchSite}</em>网站上发布。该页面包含了${targetSite}的主要功能、特点和服务内容。`,
      time: '2024-01-20 14:30:00'
    },
    {
      title: `关于${targetSite}的深度分析 - ${searchSite}`,
      url: `https://${searchSite}/news/${targetSite.replace(/\./g, '-')}-analysis.html`,
      snippet: `本文详细分析了<em>${targetSite}</em>网站的结构和内容，探讨了其在搜索引擎优化方面的表现。文章发布于<em>${searchSite}</em>平台。`,
      time: '2024-01-19 10:15:00'
    },
    {
      title: `${targetSite}网站优化案例分享`,
      url: `https://${searchSite}/case/${targetSite.replace(/\./g, '-')}-optimization.html`,
      snippet: `本文分享了<em>${targetSite}</em>的SEO优化案例，包括关键词策略、内容优化和外部链接建设等方面的实践经验。`,
      time: '2024-01-18 16:45:00'
    },
    {
      title: `如何优化${targetSite}的搜索引擎排名`,
      url: `https://${searchSite}/guide/${targetSite.replace(/\./g, '-')}-seo-guide.html`,
      snippet: `本指南详细介绍了如何提升<em>${targetSite}</em>在搜索引擎中的排名，涵盖了技术SEO、内容营销和用户体验优化等多个方面。`,
      time: '2024-01-17 09:20:00'
    },
    {
      title: `${targetSite}网站建设与运营经验`,
      url: `https://${searchSite}/experience/${targetSite.replace(/\./g, '-')}-experience.html`,
      snippet: `本文总结了<em>${targetSite}</em>网站建设和运营过程中的经验教训，包括网站架构设计、内容规划和用户增长策略等。`,
      time: '2024-01-16 11:30:00'
    },
    {
      title: `深度解析${targetSite}的内容营销策略`,
      url: `https://${searchSite}/strategy/${targetSite.replace(/\./g, '-')}-content-strategy.html`,
      snippet: `本文深入分析了<em>${targetSite}</em>的内容营销策略，探讨了其在内容创作、分发和推广方面的成功经验。`,
      time: '2024-01-15 13:50:00'
    },
    {
      title: `${targetSite}用户体验优化实践`,
      url: `https://${searchSite}/ux/${targetSite.replace(/\./g, '-')}-ux-optimization.html`,
      snippet: `本文介绍了<em>${targetSite}</em>在用户体验优化方面的实践，包括页面加载速度优化、交互设计改进和移动端适配等。`,
      time: '2024-01-14 15:25:00'
    },
    {
      title: `从${targetSite}看网站SEO发展趋势`,
      url: `https://${searchSite}/trends/${targetSite.replace(/\./g, '-')}-seo-trends.html`,
      snippet: `通过分析<em>${targetSite}</em>的SEO实践，本文探讨了当前网站SEO的发展趋势和未来方向，为其他网站提供参考。`,
      time: '2024-01-13 08:40:00'
    }
  ]
  
  return mockResults
}

/**
 * 查询站内搜索结果
 */
export function querySiteSearch(params) {
  const { targetSite, searchSite } = params
  
  // 验证参数
  if (!targetSite || !searchSite) {
    return {
      code: 400,
      message: '目标网站和查询网站不能为空',
      data: {
        results: []
      }
    }
  }
  
  // 生成Mock结果
  const mockResults = generateSiteSearchResults(targetSite, searchSite)
  
  // 随机返回3-8条结果，模拟真实搜索的不确定性
  const resultCount = Math.floor(Math.random() * 6) + 3
  const selectedResults = mockResults.slice(0, resultCount)
  
  return {
    code: 200,
    message: `查询完成，找到 ${selectedResults.length} 条记录`,
    data: {
      results: selectedResults
    }
  }
}

export const siteSearchMockMap = {
  'POST /api/seo/site-search/query': querySiteSearch
}

