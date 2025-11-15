/**
 * 工作台统计Mock数据
 */

// 模拟统计数据
const mockStatistics = {
  websiteCount: 12,
  activeWebsiteCount: 10,
  domainCount: 8,
  expiringDomainCount: 2,
  serverCount: 5,
  onlineServerCount: 4,
  siteSearchCount: 156,
  todaySearchCount: 8
}

// 模拟最近操作记录
const mockRecentOperations = [
  {
    id: 1,
    type: 'website',
    action: '添加网站',
    content: '添加了网站: https://www.example.com',
    time: '2024-01-20 14:30:00',
    operator: '管理员'
  },
  {
    id: 2,
    type: 'domain',
    action: '检查域名',
    content: '检查了域名: example.com，状态正常',
    time: '2024-01-20 13:15:00',
    operator: '管理员'
  },
  {
    id: 3,
    type: 'server',
    action: '更新服务器',
    content: '更新了服务器: 生产服务器-01',
    time: '2024-01-20 11:45:00',
    operator: '管理员'
  },
  {
    id: 4,
    type: 'site-search',
    action: '站内搜索',
    content: '查询了站内搜索: example.com in site:demo.com',
    time: '2024-01-20 10:20:00',
    operator: '管理员'
  },
  {
    id: 5,
    type: 'website',
    action: '分析网站',
    content: '分析了网站: https://www.demo.com',
    time: '2024-01-20 09:10:00',
    operator: '管理员'
  }
]

// 模拟趋势数据（最近7天）
const mockTrendData = {
  website: [8, 9, 9, 10, 11, 11, 12],
  domain: [6, 6, 7, 7, 8, 8, 8],
  server: [4, 4, 5, 5, 5, 5, 5],
  search: [12, 15, 18, 20, 22, 25, 28]
}

/**
 * 获取工作台统计数据
 */
export function getDashboardStatistics() {
  return {
    code: 200,
    message: '获取成功',
    data: {
      statistics: mockStatistics,
      recentOperations: mockRecentOperations,
      trendData: mockTrendData,
      dateRange: getLast7Days()
    }
  }
}

/**
 * 获取最近7天的日期数组
 */
function getLast7Days() {
  const dates = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }))
  }
  return dates
}

export const dashboardMockMap = {
  'GET /api/seo/dashboard/statistics': getDashboardStatistics
}

