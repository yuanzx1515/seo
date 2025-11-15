/**
 * 智联招聘发布动态Mock数据
 */

// 模拟已发布的动态列表
let mockMoments = [
  {
    id: 66024057,
    content: '这是一条测试动态内容，用于测试智联招聘发布接口',
    images: [],
    createdTime: '2025-11-09 07:04:12.480505',
    createdTimeShow: '刚刚',
    likeNum: 0,
    commentNum: 0,
    readNum: 1,
    status: 1
  }
]

/**
 * 发布动态
 * @param {Object} data - 请求数据
 * @param {string} data.content - 动态内容
 * @param {Array} data.images - 图片URL数组
 */
export function publishMoment(data) {
  // 验证输入
  if (!data.content || !data.content.trim()) {
    return {
      code: 400,
      message: '动态内容不能为空',
      data: null
    }
  }

  if (data.content.length > 2000) {
    return {
      code: 400,
      message: '动态内容不能超过2000个字符',
      data: null
    }
  }

  // 模拟生成新的动态
  const now = new Date()
  const moment = {
    id: 66024057 + mockMoments.length, // 模拟递增ID
    content: data.content.trim(),
    images: data.images || [],
    createdTime: now.toISOString().replace('T', ' ').substring(0, 23),
    createdTimeShow: '刚刚',
    likeNum: 0,
    commentNum: 0,
    readNum: 0,
    status: 1,
    address: null,
    article: null,
    articleId: 0,
    articleUri: null,
    author: null,
    clarifiedComment: null,
    community: null,
    communityId: 0,
    company: null,
    companyStarScore: null,
    contentSource: null,
    creatorCommunityMember: null,
    identityType: 1,
    isAnonymous: 0,
    isHrClarified: 0,
    isLiked: 0,
    isTopTopicContent: null,
    isValid: 1,
    labels: null,
    latestInteractTime: null,
    md5Content: 'DDYVookLV8MwpDdbmYlw8A==',
    orgNumber: null,
    platform: 103,
    quality: 4000,
    readNumShow: 1,
    recmdLabelList: null,
    recmdStrategy: null,
    recmdStrategyAlias: null,
    reviewStar: 0,
    selected: 0,
    topCommentList: null,
    topics: [],
    type: 0,
    uid: 1243510345,
    updatedTime: now.toISOString().replace('T', ' ').substring(0, 23),
    updatedTimeShow: '刚刚',
    user: null,
    videos: null,
    voteData: null,
    weight: 1274000,
    weightZ: 0
  }

  // 添加到列表
  mockMoments.unshift(moment)

  return {
    code: 200,
    message: 'Success',
    data: {
      callback: null,
      moment: moment,
      msg: 'SUCCESS',
      obj: null,
      rtnflag: 0
    },
    time: now.toISOString().replace('T', ' ').substring(0, 19),
    StatusCode: 200,
    taskId: `task_${Date.now()}`
  }
}

/**
 * 获取动态列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 */
export function getMomentList(params = {}) {
  const page = params.page || 1
  const pageSize = params.pageSize || 10
  const start = (page - 1) * pageSize
  const end = start + pageSize

  const list = mockMoments.slice(start, end)

  return {
    code: 200,
    message: '获取成功',
    data: {
      list: list,
      total: mockMoments.length,
      page: page,
      pageSize: pageSize
    }
  }
}

/**
 * 删除动态
 * @param {Object} params - 参数
 * @param {number} params.id - 动态ID
 */
export function deleteMoment(params) {
  const id = params.id
  const index = mockMoments.findIndex(m => m.id === id)
  
  if (index === -1) {
    return {
      code: 404,
      message: '动态不存在',
      data: null
    }
  }

  mockMoments.splice(index, 1)

  return {
    code: 200,
    message: '删除成功',
    data: null
  }
}

// 路由映射
export const zhaopinMockMap = {
  'POST /api/seo/zhaopin/publish': publishMoment,
  'GET /api/seo/zhaopin/moments': getMomentList,
  'DELETE /api/seo/zhaopin/moment/:id': deleteMoment
}

