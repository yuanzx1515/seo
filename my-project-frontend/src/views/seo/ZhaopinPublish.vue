<template>
  <div class="zhaopin-publish-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><EditPen /></el-icon>
          <span>智联招聘发布动态</span>
        </div>
      </template>

      <!-- 分组与链接检测 -->
      <el-row :gutter="20" class="group-section">
        <el-col :xs="24" :sm="24" :md="14" :lg="14" :xl="14">
          <el-card shadow="hover" class="group-card">
            <template #header>
              <div class="group-header">
                <el-icon><FolderAdd /></el-icon>
                <span>动态分组管理</span>
              </div>
            </template>

            <el-alert
              type="info"
              :closable="false"
              show-icon
              class="group-tip"
              title="在开始检测前，请先创建分组并选择一个分组用于收集动态链接"
            />

            <el-form
              ref="groupFormRef"
              :model="groupForm"
              :rules="groupRules"
              label-width="90px"
              class="group-form"
            >
              <el-form-item label="分组名称" prop="name">
                <el-input
                  v-model="groupForm.name"
                  placeholder="例如：深圳校招组"
                  maxlength="20"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item label="分组说明" prop="description">
                <el-input
                  v-model="groupForm.description"
                  placeholder="可选，用于帮助团队理解该分组"
                  maxlength="50"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="creatingGroup" @click="handleCreateGroup">
                  <el-icon><FolderAdd /></el-icon>
                  创建分组
                </el-button>
                <el-button :disabled="creatingGroup" @click="handleResetGroup">
                  <el-icon><Refresh /></el-icon>
                  重置
                </el-button>
              </el-form-item>
            </el-form>

            <div class="group-list" v-loading="groupLoading">
              <el-empty v-if="groups.length === 0" description="尚未创建任何分组" />
              <el-space v-else wrap size="16" class="group-tags">
                <div
                  v-for="group in groups"
                  :key="group.id"
                  class="group-tag"
                  :class="{ active: group.id === selectedGroupId }"
                >
                  <div class="group-tag-main" @click="handleSelectGroup(group.id)">
                    <div class="group-tag-name">{{ group.name }}</div>
                    <el-text type="info" size="small">{{ group.description || '暂无描述' }}</el-text>
                    <div class="group-meta">
                      <el-text type="info" size="small">
                        <el-icon><Tickets /></el-icon>
                        动态 {{ group.linkCount || 0 }} 条
                      </el-text>
                      <el-text type="info" size="small">
                        <el-icon><Timer /></el-icon>
                        {{ group.createdAt }}
                      </el-text>
                    </div>
                  </div>
                  <div class="group-tag-actions">
                    <el-popconfirm
                      title="确定删除该分组及其动态链接吗？"
                      width="240"
                      @confirm="handleDeleteGroup(group.id)"
                    >
                      <template #reference>
                        <el-button
                          text
                          type="danger"
                          :loading="deletingGroupId === group.id"
                          circle
                          size="small"
                        >
                          <el-icon><Delete /></el-icon>
                        </el-button>
                      </template>
                    </el-popconfirm>
                  </div>
                </div>
              </el-space>
            </div>

            <el-alert
              v-if="!selectedGroupId"
              type="warning"
              :closable="false"
              show-icon
              title="请先创建并选择一个分组，以查看该分组的检测结果"
              class="group-warning"
            />
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="24" :md="10" :lg="10" :xl="10">
          <el-card shadow="hover" class="link-status-card">
            <template #header>
              <div class="link-header">
                <div class="link-header-left">
                  <el-icon><View /></el-icon>
                  <span>动态链接有效性检测</span>
                  <el-text
                    v-if="currentGroup"
                    type="info"
                    size="small"
                    class="current-group-label"
                  >
                    当前分组：{{ currentGroup.name }}
                  </el-text>
                </div>
                <div class="link-header-actions">
                  <el-button
                    type="success"
                    text
                    size="small"
                    :disabled="!selectedGroupId || linkList.length === 0"
                    @click="handleCopyAllLinks"
                  >
                    <el-icon><DocumentCopy /></el-icon>
                    复制全部链接
                  </el-button>
                  <el-button
                    type="primary"
                    text
                    size="small"
                    :disabled="!selectedGroupId"
                    :loading="linkLoading"
                    @click="loadLinks"
                  >
                    <el-icon><Refresh /></el-icon>
                    刷新
                  </el-button>
                </div>
              </div>
            </template>

            <el-alert
              type="info"
              :closable="false"
              show-icon
              class="link-alert"
            >
              系统会在动态发布 {{ CHECK_DELAY_MINUTES }} 分钟后给出最终检测结果，如检测到动态编号不合法会立即判定为无效。
            </el-alert>

            <template v-if="!selectedGroupId">
              <el-empty description="请先选择一个分组" />
            </template>
            <template v-else>
              <el-empty
                v-if="linkList.length === 0 && !linkLoading"
                description="当前分组还未添加动态链接"
              />
              <el-table
                v-else
                v-loading="linkLoading"
                :data="linkList"
                border
                class="link-table"
              >
                <el-table-column label="动态链接" min-width="180">
                  <template #default="{ row }">
                    <el-link :href="row.url" target="_blank" type="primary" :underline="false">
                      {{ row.url }}
                    </el-link>
                  </template>
                </el-table-column>
                <el-table-column label="动态编号" prop="dynamicId" width="140" />
                <el-table-column label="发布时间" min-width="140">
                  <template #default="{ row }">
                    {{ row.publishedAtShow || row.publishedAt }}
                  </template>
                </el-table-column>
                <el-table-column label="最后检测" min-width="140">
                  <template #default="{ row }">
                    {{ row.lastCheckedAtShow || '暂未检测' }}
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="110">
                  <template #default="{ row }">
                    <el-tag :type="linkStatusTagType(row.status)">
                      {{ linkStatusText(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="检测结果" min-width="180">
                  <template #default="{ row }">
                    <span class="link-reason">{{ row.reason || '等待检测' }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="160" fixed="right">
                  <template #default="{ row }">
                    <el-button
                      type="primary"
                      text
                      size="small"
                      :loading="checkingLinkId === row.id"
                      @click="handleCheckLink(row)"
                    >
                      <el-icon><VideoPlay /></el-icon>
                      检测
                    </el-button>
                    <el-button
                      type="primary"
                      text
                      size="small"
                      @click="handleCopyLink(row)"
                    >
                      <el-icon><DocumentCopy /></el-icon>
                      复制链接
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-card>
        </el-col>
      </el-row>

      <el-divider class="section-divider" content-position="left">
        <el-icon><ChatLineRound /></el-icon>
        <span>动态发布与列表</span>
      </el-divider>

      <el-row :gutter="20">
        <!-- 发布表单 -->
        <el-col :xs="24" :sm="24" :md="14" :lg="14" :xl="14">
          <el-card shadow="hover" class="publish-card">
            <template #header>
              <div class="publish-header">
                <el-icon><Edit /></el-icon>
                <span>发布新动态</span>
              </div>
            </template>

            <el-form :model="publishForm" :rules="publishRules" ref="publishFormRef" label-width="100px">
              <el-form-item label="动态内容" prop="content">
                <el-input
                  v-model="publishForm.content"
                  type="textarea"
                  :rows="8"
                  placeholder="请输入动态内容，支持最多2000个字符"
                  maxlength="2000"
                  show-word-limit
                  clearable
                />
                <div class="form-tip">
                  <el-text type="info" size="small">
                    提示：内容要真实、有价值，避免发布广告或违规内容
                  </el-text>
                </div>
              </el-form-item>

              <el-form-item label="添加图片" prop="images">
                <el-upload
                  v-model:file-list="imageList"
                  action="#"
                  list-type="picture-card"
                  :auto-upload="false"
                  :limit="9"
                  :on-preview="handlePictureCardPreview"
                  :on-remove="handleRemove"
                  :on-exceed="handleExceed"
                  accept="image/*"
                >
                  <el-icon><Plus /></el-icon>
                </el-upload>
                <el-dialog v-model="dialogVisible" width="50%">
                  <img w-full :src="dialogImageUrl" alt="预览图片" />
                </el-dialog>
                <div class="form-tip">
                  <el-text type="info" size="small">
                    最多可上传9张图片，支持 JPG、PNG 格式
                  </el-text>
                </div>
              </el-form-item>

              <el-form-item label="智联Cookie" prop="cookie">
                <el-input
                  v-model="publishForm.cookie"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入可访问智联招聘的 Cookie"
                  show-word-limit
                />
                <div class="cookie-tools">
                  <el-text type="info" size="small">
                    Cookie 会随发布请求一并发送，请确保来自已登录智联招聘。
                  </el-text>
                  <div class="cookie-actions">
                    <el-checkbox v-model="rememberCookie" :disabled="!isBrowserEnv">
                      记住Cookie
                    </el-checkbox>
                    <el-button
                      v-if="clipboardSupported"
                      type="primary"
                      text
                      size="small"
                      @click="handlePasteCookie"
                    >
                      <el-icon><DocumentCopy /></el-icon>
                      粘贴剪贴板
                    </el-button>
                  </div>
                </div>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="handlePublish" :loading="publishing" size="large">
                  <el-icon><Promotion /></el-icon>
                  发布动态
                </el-button>
                <el-button @click="handleReset" :disabled="publishing">
                  <el-icon><Refresh /></el-icon>
                  重置
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <!-- 已发布动态列表 -->
        <el-col :xs="24" :sm="24" :md="10" :lg="10" :xl="10">
          <el-card shadow="hover" class="moments-card">
            <template #header>
              <div class="moments-header">
                <el-icon><List /></el-icon>
                <span>已发布动态</span>
                <el-button
                  type="primary"
                  text
                  size="small"
                  @click="loadMoments"
                  :loading="loadingMoments"
                  style="margin-left: auto"
                >
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
              </div>
            </template>

            <div v-loading="loadingMoments" class="moments-list">
              <el-empty v-if="moments.length === 0" description="暂无发布的动态" />
              <div v-else>
                <div
                  v-for="moment in moments"
                  :key="moment.id"
                  class="moment-item"
                >
                  <div class="moment-content">
                    <el-text>{{ moment.content }}</el-text>
                  </div>
                  <div class="moment-images" v-if="moment.images && moment.images.length > 0">
                    <el-image
                      v-for="(img, index) in moment.images"
                      :key="index"
                      :src="img"
                      :preview-src-list="moment.images"
                      fit="cover"
                      class="moment-image"
                    />
                  </div>
                  <div class="moment-footer">
                    <el-text type="info" size="small">
                      <el-icon><Clock /></el-icon>
                      {{ moment.createdTimeShow }}
                    </el-text>
                    <div class="moment-stats">
                      <el-text type="info" size="small">
                        <el-icon><View /></el-icon>
                        {{ moment.readNum }}
                      </el-text>
                      <el-text type="info" size="small">
                        <el-icon><ChatDotRound /></el-icon>
                        {{ moment.commentNum }}
                      </el-text>
                      <el-text type="info" size="small">
                        <el-icon><Star /></el-icon>
                        {{ moment.likeNum }}
                      </el-text>
                    </div>
                    <el-button
                      type="danger"
                      text
                      size="small"
                      @click="handleDelete(moment.id)"
                    >
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { post, get, del } from '@/net'

const CHECK_DELAY_MINUTES = 5
const COOKIE_STORAGE_KEY = 'seo_zhaopin_cookie'
const isBrowserEnv = typeof window !== 'undefined'
const clipboardSupported = typeof navigator !== 'undefined' && !!navigator.clipboard

const publishFormRef = ref(null)
const groupFormRef = ref(null)
const publishing = ref(false)
const loadingMoments = ref(false)
const groupLoading = ref(false)
const linkLoading = ref(false)
const creatingGroup = ref(false)
const checkingLinkId = ref(null)
const deletingGroupId = ref(null)

const storedCookie = isBrowserEnv ? window.localStorage.getItem(COOKIE_STORAGE_KEY) || '' : ''
const rememberCookie = ref(!!storedCookie)
const cookieState = ref(storedCookie)

const publishForm = reactive({
  content: '',
  images: [],
  cookie: storedCookie
})

const groupForm = reactive({
  name: '',
  description: ''
})

const imageList = ref([])
const dialogVisible = ref(false)
const dialogImageUrl = ref('')

const moments = ref([])
const groups = ref([])
const selectedGroupId = ref(null)
const linkList = ref([])

const currentGroup = computed(() => groups.value.find(group => group.id === selectedGroupId.value) || null)

const publishRules = {
  content: [
    { required: true, message: '请输入动态内容', trigger: 'blur' },
    { min: 1, max: 2000, message: '内容长度在 1 到 2000 个字符', trigger: 'blur' }
  ],
  cookie: [
    { required: true, message: '请输入Cookie', trigger: 'blur' }
  ]
}

const groupRules = {
  name: [
    { required: true, message: '请输入分组名称', trigger: 'blur' },
    { min: 2, max: 20, message: '分组名称需在 2-20 个字符之间', trigger: 'blur' }
  ],
  description: [
    { max: 50, message: '分组说明不能超过 50 个字符', trigger: 'blur' }
  ]
}

watch(cookieState, (val) => {
  if (publishForm.cookie !== val) {
    publishForm.cookie = val
  }
  if (rememberCookie.value) {
    persistCookie(val)
  }
}, { immediate: true })

watch(() => publishForm.cookie, (val) => {
  if (cookieState.value !== val) {
    cookieState.value = val
  }
})

watch(rememberCookie, (val) => {
  if (val) {
    persistCookie(cookieState.value)
  } else {
    clearStoredCookie()
  }
})

watch(selectedGroupId, (newVal) => {
  if (newVal) {
    loadLinks()
  } else {
    linkList.value = []
  }
})

function handlePictureCardPreview(file) {
  dialogImageUrl.value = file.url
  dialogVisible.value = true
}

function handleRemove(file, fileList) {
  imageList.value = fileList
}

function handleExceed() {
  ElMessage.warning('最多只能上传9张图片')
}

function handlePublish() {
  publishFormRef.value.validate((valid) => {
    if (!valid) {
      return false
    }

    publishing.value = true
    const cookie = getActiveCookie()
    if (!cookie) {
      ElMessage.warning('请先填写Cookie')
      publishing.value = false
      return
    }

    const requestData = {
      content: publishForm.content,
      images: imageList.value.map(file => file.url || URL.createObjectURL(file.raw)),
      cookie
    }

    post('/api/seo/zhaopin/publish', requestData, (data) => {
      ElMessage.success('动态发布成功！')
      publishing.value = false
      handleReset()
      loadMoments()
      if (data?.moment) {
        autoAttachMomentLink(data.moment)
      }
    }, (message) => {
      ElMessage.error(message || '发布失败，请重试')
      publishing.value = false
    })
  })
}

function handleReset() {
  const snapshot = cookieState.value
  publishFormRef.value?.resetFields()
  imageList.value = []
  publishForm.content = ''
  publishForm.images = []
  publishForm.cookie = snapshot
  cookieState.value = snapshot
}

function loadMoments() {
  loadingMoments.value = true
  get('/api/seo/zhaopin/moments?page=1&pageSize=10', (data) => {
    moments.value = data.list || []
    loadingMoments.value = false
  }, (message) => {
    ElMessage.error(message || '加载失败')
    loadingMoments.value = false
  })
}

function handleDelete(id) {
  ElMessageBox.confirm('确定要删除这条动态吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    del(`/api/seo/zhaopin/moment/${id}`, () => {
      ElMessage.success('删除成功')
      loadMoments()
    }, (message) => {
      ElMessage.error(message || '删除失败')
    })
  }).catch(() => {})
}

function loadGroups() {
  groupLoading.value = true
  get('/api/seo/zhaopin/groups', (data) => {
    groups.value = data.list || []
    groupLoading.value = false

    if (groups.value.length === 0) {
      selectedGroupId.value = null
      linkList.value = []
      return
    }

    const keepCurrent = groups.value.some(group => group.id === selectedGroupId.value)
    if (!keepCurrent) {
      selectedGroupId.value = groups.value[0].id
    } else {
      loadLinks()
    }
  }, (message) => {
    ElMessage.error(message || '加载分组失败')
    groupLoading.value = false
  })
}

function handleCreateGroup() {
  groupFormRef.value.validate((valid) => {
    if (!valid) return

    creatingGroup.value = true
    post('/api/seo/zhaopin/groups', {
      name: groupForm.name.trim(),
      description: groupForm.description.trim()
    }, () => {
      ElMessage.success('分组创建成功')
      creatingGroup.value = false
      handleResetGroup()
      loadGroups()
    }, (message) => {
      ElMessage.error(message || '创建分组失败')
      creatingGroup.value = false
    })
  })
}

function handleResetGroup() {
  groupFormRef.value?.resetFields()
  groupForm.name = ''
  groupForm.description = ''
}

function handleSelectGroup(id) {
  if (selectedGroupId.value === id) return
  selectedGroupId.value = id
}

function handleDeleteGroup(id) {
  deletingGroupId.value = id
  del(`/api/seo/zhaopin/groups/${id}`, () => {
    ElMessage.success('分组已删除')
    deletingGroupId.value = null
    loadGroups()
  }, (message) => {
    ElMessage.error(message || '删除分组失败')
    deletingGroupId.value = null
  })
}

function loadLinks() {
  if (!selectedGroupId.value) return
  linkLoading.value = true
  get(`/api/seo/zhaopin/groups/${selectedGroupId.value}/links`, (data) => {
    linkList.value = data.list || []
    linkLoading.value = false
  }, (message) => {
    ElMessage.error(message || '加载动态链接失败')
    linkLoading.value = false
  })
}

function updateLinkInList(updated) {
  const index = linkList.value.findIndex(item => item.id === updated.id)
  if (index !== -1) {
    linkList.value.splice(index, 1, { ...linkList.value[index], ...updated })
  }
}

function handleCheckLink(link) {
  checkingLinkId.value = link.id
  post('/api/seo/zhaopin/links/check', { linkId: link.id }, (data) => {
    updateLinkInList(data)
    checkingLinkId.value = null
    ElMessage.success('检测完成')
  }, (message) => {
    ElMessage.error(message || '检测失败')
    checkingLinkId.value = null
  })
}

function buildDynamicUrl(dynamicId) {
  if (!dynamicId) return ''
  return `https://xiaoyuan.zhaopin.com/dynamic/${dynamicId}`
}

function getActiveCookie() {
  return (cookieState.value || '').trim()
}

function linkExistsInCurrentGroup(dynamicId) {
  if (!dynamicId) return false
  return linkList.value.some(item => item.dynamicId === dynamicId)
}

function autoAttachMomentLink(moment) {
  if (!moment || !moment.id || !selectedGroupId.value) return
  const dynamicId = String(moment.id)
  if (linkExistsInCurrentGroup(dynamicId)) {
    return
  }
  const payload = {
    url: buildDynamicUrl(dynamicId),
    dynamicId,
    publishedAt: moment.createdTime || new Date().toISOString()
  }
  post(`/api/seo/zhaopin/groups/${selectedGroupId.value}/links`, payload, () => {
    loadLinks()
    ElMessage.success('最新动态已自动加入当前分组')
  }, (message) => {
    ElMessage.info(message || '该动态已存在当前分组')
  })
}

async function handlePasteCookie() {
  if (!clipboardSupported || typeof navigator === 'undefined' || !navigator.clipboard) {
    ElMessage.warning('当前环境不支持读取剪贴板')
    return
  }
  try {
    const text = await navigator.clipboard.readText()
    if (!text) {
      ElMessage.warning('剪贴板为空，请先复制Cookie')
      return
    }
    cookieState.value = text
    ElMessage.success('Cookie 已粘贴')
  } catch (error) {
    console.error('读取剪贴板失败', error)
    ElMessage.error('读取剪贴板失败，请手动粘贴')
  }
}

async function copyTextToClipboard(text, successMessage) {
  const content = (text || '').trim()
  if (!content) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(content)
    } else if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea')
      textarea.value = content
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    } else {
      throw new Error('Clipboard not supported')
    }
    ElMessage.success(successMessage)
  } catch (error) {
    console.error('复制失败', error)
    ElMessage.error('复制失败，请手动复制')
  }
}

function handleCopyAllLinks() {
  if (linkList.value.length === 0) {
    ElMessage.warning('当前分组暂无链接可复制')
    return
  }
  const text = linkList.value.map(item => `${item.dynamicId || '-'}\t${item.url}`).join('\n')
  copyTextToClipboard(text, '已复制全部链接')
}

function handleCopyLink(row) {
  copyTextToClipboard(row?.url, '链接已复制')
}

function linkStatusTagType(status) {
  if (status === 'valid') return 'success'
  if (status === 'invalid') return 'danger'
  return 'warning'
}

function linkStatusText(status) {
  if (status === 'valid') return '有效'
  if (status === 'invalid') return '无效'
  return '检测中'
}

function persistCookie(value) {
  if (!isBrowserEnv) return
  window.localStorage.setItem(COOKIE_STORAGE_KEY, value || '')
}

function clearStoredCookie() {
  if (!isBrowserEnv) return
  window.localStorage.removeItem(COOKIE_STORAGE_KEY)
}

onMounted(() => {
  loadGroups()
  loadMoments()
})
</script>

<style scoped>
.zhaopin-publish-container {
  min-height: calc(100vh - 64px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #667eea;
}

.group-section {
  margin-bottom: 30px;
}

.group-card,
.link-status-card,
.publish-card,
.moments-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.group-header,
.link-header,
.publish-header,
.moments-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
}

.link-header {
  justify-content: space-between;
}

.link-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.link-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.current-group-label {
  margin-left: 4px;
  font-weight: 400;
}

.group-form {
  margin-bottom: 20px;
}

.group-tip,
.group-warning {
  margin-bottom: 20px;
}

.group-list {
  min-height: 80px;
}

.group-tags {
  width: 100%;
}

.group-tag {
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  padding: 12px;
  width: calc(50% - 8px);
  display: flex;
  justify-content: space-between;
  gap: 8px;
  background: #fff;
  transition: all 0.2s ease;
}

.group-tag.active {
  border-color: #667eea;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.2);
  background: #f5f7ff;
}

.group-tag-main {
  flex: 1;
  cursor: pointer;
}

.group-tag-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.group-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.group-tag-actions {
  display: flex;
  align-items: flex-start;
}

.link-alert {
  margin-bottom: 12px;
}

.link-table {
  width: 100%;
}

.link-reason {
  color: #606266;
}

.section-divider {
  margin: 30px 0 20px;
  font-weight: 600;
}

.moments-list {
  max-height: 600px;
  overflow-y: auto;
}

.moment-item {
  padding: 15px;
  margin-bottom: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}

.moment-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.moment-content {
  margin-bottom: 10px;
  line-height: 1.6;
  word-break: break-word;
}

.moment-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.moment-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  cursor: pointer;
}

.moment-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #e4e7ed;
}

.moment-stats {
  display: flex;
  gap: 15px;
  align-items: center;
}

.moment-stats .el-text {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cookie-tools {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cookie-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 100px;
  height: 100px;
}

:deep(.el-textarea__inner) {
  font-size: 14px;
  line-height: 1.6;
}

:deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-card__body) {
  padding: 20px;
}

@media (max-width: 768px) {
  .group-tag {
    width: 100%;
  }
}
</style>
