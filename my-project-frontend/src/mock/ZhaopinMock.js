/**
 * 智联招聘发布模块 Mock
 */

const MIN_CHECK_DELAY_MS = 5 * 60 * 1000

function pad(num) {
  return String(num).padStart(2, '0')
}

function formatDateTime(date) {
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function resolveLinkStatus(link, { setLastChecked = false } = {}) {
  const now = new Date()
  const publishDate = link.publishedAt ? new Date(link.publishedAt) : now
  const dynamicId = (link.dynamicId || '').trim()

  if (!/^\d+$/.test(dynamicId)) {
    link.status = 'invalid'
    link.reason = '动态编号不合法'
    link.isValid = false
  } else {
    const diff = now.getTime() - publishDate.getTime()
    if (diff >= MIN_CHECK_DELAY_MS) {
      link.status = 'valid'
      link.reason = '检测通过，链接有效'
      link.isValid = true
    } else {
      link.status = 'pending'
      link.reason = '发布未满5分钟，请稍后检测'
      link.isValid = false
    }
  }

  link.publishedAtShow = formatDateTime(publishDate)

  if (setLastChecked) {
    const ts = formatDateTime(now)
    link.lastCheckedAt = ts
    link.lastCheckedAtShow = ts
  }

  return link
}

function nextId(list) {
  if (list.length === 0) return 1
  return Math.max(...list.map(item => item.id)) + 1
}

// 初始数据
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

let mockGroups = [
  {
    id: 1,
    name: '校园招聘组',
    description: '用于跟进校园渠道的投放动态',
    createdAt: formatDateTime(new Date(Date.now() - 6 * 60 * 60 * 1000))
  },
  {
    id: 2,
    name: '社招组',
    description: '社招岗位动态集合',
    createdAt: formatDateTime(new Date(Date.now() - 24 * 60 * 60 * 1000))
  }
]

let mockLinks = [
  {
    id: 1,
    groupId: 1,
    url: 'https://xiaoyuan.zhaopin.com/dynamic/66024057',
    dynamicId: '66024057',
    publishedAt: formatDateTime(new Date(Date.now() - 12 * 60 * 1000)),
    lastCheckedAt: null,
    lastCheckedAtShow: '',
    status: 'pending',
    reason: '等待检测',
    isValid: false
  },
  {
    id: 2,
    groupId: 1,
    url: 'https://xiaoyuan.zhaopin.com/dynamic/ABC123',
    dynamicId: 'ABC123',
    publishedAt: formatDateTime(new Date(Date.now() - 30 * 60 * 1000)),
    lastCheckedAt: null,
    lastCheckedAtShow: '',
    status: 'pending',
    reason: '等待检测',
    isValid: false
  },
  {
    id: 3,
    groupId: 2,
    url: 'https://xiaoyuan.zhaopin.com/dynamic/770011',
    dynamicId: '770011',
    publishedAt: formatDateTime(new Date(Date.now() - 2 * 60 * 1000)),
    lastCheckedAt: null,
    lastCheckedAtShow: '',
    status: 'pending',
    reason: '等待检测',
    isValid: false
  }
]

mockLinks.forEach(link => resolveLinkStatus(link))

export function publishMoment(data) {
  if (!data.content || !data.content.trim()) {
    return { code: 400, message: '动态内容不能为空', data: null }
  }
  if (data.content.length > 2000) {
    return { code: 400, message: '动态内容不能超过2000个字符', data: null }
  }
  if (!data.cookie || !data.cookie.trim()) {
    return { code: 400, message: '智联Cookie 不能为空', data: null }
  }

  const now = new Date()
  const moment = {
    id: nextId(mockMoments),
    content: data.content.trim(),
    images: data.images || [],
    createdTime: formatDateTime(now),
    createdTimeShow: '刚刚',
    likeNum: 0,
    commentNum: 0,
    readNum: 0,
    status: 1
  }
  mockMoments.unshift(moment)

  return {
    code: 200,
    message: 'Success',
    data: {
      moment,
      taskId: `task_${Date.now()}`
    }
  }
}

export function getMomentList(params = {}) {
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  const start = (page - 1) * pageSize
  const list = mockMoments.slice(start, start + pageSize)
  return {
    code: 200,
    message: '获取成功',
    data: { list, total: mockMoments.length, page, pageSize }
  }
}

export function deleteMoment(params) {
  const id = Number(params.id)
  const index = mockMoments.findIndex(item => item.id === id)
  if (index === -1) {
    return { code: 404, message: '动态不存在', data: null }
  }
  mockMoments.splice(index, 1)
  mockLinks = mockLinks.filter(link => link.dynamicId !== String(id))
  return { code: 200, message: '删除成功', data: null }
}

export function listGroups() {
  const countMap = mockLinks.reduce((acc, link) => {
    acc[link.groupId] = (acc[link.groupId] || 0) + 1
    return acc
  }, {})

  return {
    code: 200,
    message: '获取成功',
    data: {
      list: mockGroups.map(group => ({
        ...group,
        linkCount: countMap[group.id] || 0
      }))
    }
  }
}

export function createGroup(data) {
  const name = (data.name || '').trim()
  const description = (data.description || '').trim()
  if (!name) {
    return { code: 400, message: '分组名称不能为空', data: null }
  }
  if (mockGroups.some(group => group.name === name)) {
    return { code: 400, message: '分组名称已存在', data: null }
  }
  const group = {
    id: nextId(mockGroups),
    name,
    description,
    createdAt: formatDateTime(new Date())
  }
  mockGroups.unshift(group)
  return { code: 200, message: '创建成功', data: group }
}

export function removeGroup(params) {
  const id = Number(params.id)
  const idx = mockGroups.findIndex(group => group.id === id)
  if (idx === -1) {
    return { code: 404, message: '分组不存在', data: null }
  }
  mockGroups.splice(idx, 1)
  mockLinks = mockLinks.filter(link => link.groupId !== id)
  return { code: 200, message: '删除成功', data: null }
}

export function listGroupLinks(params) {
  const groupId = Number(params.groupId)
  if (!groupId) {
    return { code: 400, message: '分组ID无效', data: null }
  }
  if (!mockGroups.some(group => group.id === groupId)) {
    return { code: 404, message: '分组不存在', data: null }
  }

  const list = mockLinks
    .filter(link => link.groupId === groupId)
    .map(link => ({ ...resolveLinkStatus({ ...link }) }))

  return { code: 200, message: '获取成功', data: { list } }
}

export function addLinkToGroup(data) {
  const groupId = Number(data.groupId)
  const url = (data.url || '').trim()
  const dynamicId = (data.dynamicId || '').trim()
  const publishedAt = data.publishedAt ? formatDateTime(new Date(data.publishedAt)) : formatDateTime(new Date())

  if (!groupId || !mockGroups.some(group => group.id === groupId)) {
    return { code: 400, message: '分组不存在', data: null }
  }
  if (!url) {
    return { code: 400, message: '动态链接不能为空', data: null }
  }
  if (!dynamicId) {
    return { code: 400, message: '动态编号不能为空', data: null }
  }
  if (mockLinks.some(link => link.groupId === groupId && link.dynamicId === dynamicId)) {
    return { code: 400, message: '该动态已存在当前分组', data: null }
  }

  const link = {
    id: nextId(mockLinks),
    groupId,
    url,
    dynamicId,
    publishedAt,
    lastCheckedAt: null,
    lastCheckedAtShow: '',
    status: 'pending',
    reason: '等待检测',
    isValid: false
  }
  resolveLinkStatus(link)
  mockLinks.unshift(link)
  return { code: 200, message: '添加成功', data: link }
}

export function checkLinkStatus(data) {
  const linkId = Number(data.linkId)
  const link = mockLinks.find(item => item.id === linkId)
  if (!link) {
    return { code: 404, message: '动态链接不存在', data: null }
  }
  resolveLinkStatus(link, { setLastChecked: true })
  return { code: 200, message: '检测完成', data: link }
}

export const zhaopinMockMap = {
  'POST /api/seo/zhaopin/publish': publishMoment,
  'GET /api/seo/zhaopin/moments': getMomentList,
  'DELETE /api/seo/zhaopin/moment/:id': deleteMoment,
  'GET /api/seo/zhaopin/groups': listGroups,
  'POST /api/seo/zhaopin/groups': createGroup,
  'DELETE /api/seo/zhaopin/groups/:id': removeGroup,
  'GET /api/seo/zhaopin/groups/:groupId/links': listGroupLinks,
  'POST /api/seo/zhaopin/groups/:groupId/links': addLinkToGroup,
  'POST /api/seo/zhaopin/links/check': checkLinkStatus
}
