<template>
  <div class="zhaopin-publish-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><EditPen /></el-icon>
          <span>智联招聘发布动态</span>
        </div>
      </template>

      <el-row :gutter="20">
        <!-- 左侧：发布表单 -->
        <el-col :xs="24" :sm="24" :md="14" :lg="14" :xl="14">
          <el-card shadow="hover" class="publish-card">
            <template #header>
              <div class="publish-header">
                <el-icon><Edit /></el-icon>
                <span>发布新动态</span>
              </div>
            </template>

            <el-form :model="publishForm" :rules="rules" ref="publishFormRef" label-width="100px">
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

        <!-- 右侧：已发布动态列表 -->
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { post, get, del } from '@/net'

// 表单引用
const publishFormRef = ref(null)
const publishing = ref(false)
const loadingMoments = ref(false)

// 发布表单
const publishForm = reactive({
  content: '',
  images: []
})

// 图片列表
const imageList = ref([])
const dialogVisible = ref(false)
const dialogImageUrl = ref('')

// 已发布动态列表
const moments = ref([])

// 表单验证规则
const rules = {
  content: [
    { required: true, message: '请输入动态内容', trigger: 'blur' },
    { min: 1, max: 2000, message: '内容长度在 1 到 2000 个字符', trigger: 'blur' }
  ]
}

// 图片预览
function handlePictureCardPreview(file) {
  dialogImageUrl.value = file.url
  dialogVisible.value = true
}

// 移除图片
function handleRemove(file, fileList) {
  imageList.value = fileList
}

// 超出限制
function handleExceed() {
  ElMessage.warning('最多只能上传9张图片')
}

// 发布动态
function handlePublish() {
  publishFormRef.value.validate((valid) => {
    if (!valid) {
      return false
    }

    publishing.value = true

    // 构建请求数据
    const requestData = {
      content: publishForm.content,
      images: imageList.value.map(file => {
        // 如果是真实上传，这里应该是上传后的URL
        // Mock模式下，我们使用本地预览URL
        return file.url || URL.createObjectURL(file.raw)
      })
    }

    post('/api/seo/zhaopin/publish', requestData, (data) => {
      ElMessage.success('动态发布成功！')
      publishing.value = false
      handleReset()
      loadMoments()
    }, (message) => {
      ElMessage.error(message || '发布失败，请重试')
      publishing.value = false
    })
  })
}

// 重置表单
function handleReset() {
  publishFormRef.value?.resetFields()
  imageList.value = []
  publishForm.content = ''
  publishForm.images = []
}

// 加载动态列表
function loadMoments() {
  loadingMoments.value = true
  get('/api/seo/zhaopin/moments?page=1&pageSize=10', (data) => {
    moments.value = data.list || []
  }, (message) => {
    ElMessage.error(message || '加载失败')
  }, () => {
    loadingMoments.value = false
  })
}

// 删除动态
function handleDelete(id) {
  ElMessageBox.confirm('确定要删除这条动态吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    del(`/api/seo/zhaopin/moment/${id}`, (data) => {
      ElMessage.success('删除成功')
      loadMoments()
    }, (message) => {
      ElMessage.error(message || '删除失败')
    })
  }).catch(() => {})
}

// 组件挂载时加载动态列表
onMounted(() => {
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

.publish-card,
.moments-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.publish-header,
.moments-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
}

.moments-header {
  width: 100%;
}

.form-tip {
  margin-top: 5px;
  margin-left: 0;
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
</style>

