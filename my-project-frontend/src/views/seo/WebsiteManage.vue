<template>
  <div class="website-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>SEO网站管理</span>
          <el-button type="primary" @click="handleAddWebsite">添加网站</el-button>
        </div>
      </template>

      <!-- 搜索和添加区域 -->
      <div class="search-area">
        <el-input
          v-model="searchUrl"
          placeholder="输入网站URL，自动获取关键词"
          style="width: 400px; margin-right: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleAnalyzeWebsite" :loading="analyzing">
          <el-icon><RefreshRight /></el-icon>
          分析网站
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <!-- 关键词展示区域 -->
      <div v-if="keywords.length > 0" class="keywords-area">
        <el-divider>提取的关键词</el-divider>
        <el-tag
          v-for="(keyword, index) in keywords"
          :key="index"
          style="margin: 5px"
          closable
          @close="handleRemoveKeyword(index)"
        >
          {{ keyword }}
        </el-tag>
      </div>

      <!-- 网站列表 -->
      <el-table :data="websiteList" style="width: 100%; margin-top: 20px" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="url" label="网站URL" min-width="200" />
        <el-table-column prop="title" label="网站标题" min-width="150" />
        <el-table-column prop="keywords" label="关键词" min-width="200">
          <template #default="scope">
            <el-tag
              v-for="(keyword, index) in scope.row.keywords?.split(',')"
              :key="index"
              size="small"
              style="margin-right: 5px"
            >
              {{ keyword }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
              {{ scope.row.status === 'active' ? '活跃' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
            <el-button type="success" size="small" @click="handleViewCode(scope.row)">查看代码</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-area">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="网站URL" prop="url">
          <el-input v-model="form.url" placeholder="请输入网站URL，如：https://example.com" />
        </el-form-item>
        <el-form-item label="网站标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入网站标题" />
        </el-form-item>
        <el-form-item label="关键词" prop="keywords">
          <el-input
            v-model="form.keywords"
            type="textarea"
            :rows="3"
            placeholder="请输入关键词，多个关键词用逗号分隔"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">活跃</el-radio>
            <el-radio label="inactive">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 代码查看对话框 -->
    <el-dialog
      v-model="codeDialogVisible"
      title="代码文件"
      width="800px"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane label="HTML代码" name="html">
          <el-input
            v-model="codeContent.html"
            type="textarea"
            :rows="15"
            readonly
          />
        </el-tab-pane>
        <el-tab-pane label="关键词代码" name="keywords">
          <el-input
            v-model="codeContent.keywords"
            type="textarea"
            :rows="15"
            readonly
          />
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="handleCopyCode">复制代码</el-button>
        <el-button type="primary" @click="codeDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, RefreshRight } from '@element-plus/icons-vue'
import { get, post } from '@/net'

const searchUrl = ref('')
const keywords = ref([])
const analyzing = ref(false)
const loading = ref(false)
const websiteList = ref([])
const dialogVisible = ref(false)
const codeDialogVisible = ref(false)
const dialogTitle = ref('添加网站')
const activeTab = ref('html')
const formRef = ref()

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const form = reactive({
  id: null,
  url: '',
  title: '',
  keywords: '',
  status: 'active'
})

const codeContent = reactive({
  html: '',
  keywords: ''
})

const rules = {
  url: [
    { required: true, message: '请输入网站URL', trigger: 'blur' },
    { type: 'url', message: '请输入正确的URL格式', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '请输入网站标题', trigger: 'blur' }
  ]
}

// 分析网站获取关键词
function handleAnalyzeWebsite() {
  if (!searchUrl.value) {
    ElMessage.warning('请输入网站URL')
    return
  }
  analyzing.value = true
  post('/api/seo/website/analyze', { url: searchUrl.value }, (data) => {
    keywords.value = data.keywords || []
    form.url = searchUrl.value
    form.title = data.title || ''
    form.keywords = keywords.value.join(',')
    ElMessage.success('分析完成')
    analyzing.value = false
  }, (message) => {
    ElMessage.error(message)
    analyzing.value = false
  })
}

// 移除关键词
function handleRemoveKeyword(index) {
  keywords.value.splice(index, 1)
  form.keywords = keywords.value.join(',')
}

// 重置
function handleReset() {
  searchUrl.value = ''
  keywords.value = []
  form.url = ''
  form.title = ''
  form.keywords = ''
}

// 添加网站
function handleAddWebsite() {
  dialogTitle.value = '添加网站'
  form.id = null
  form.url = ''
  form.title = ''
  form.keywords = ''
  form.status = 'active'
  dialogVisible.value = true
}

// 编辑网站
function handleEdit(row) {
  dialogTitle.value = '编辑网站'
  form.id = row.id
  form.url = row.url
  form.title = row.title
  form.keywords = row.keywords
  form.status = row.status
  dialogVisible.value = true
}

// 删除网站
function handleDelete(row) {
  ElMessageBox.confirm('确定要删除这个网站吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    post('/api/seo/website/delete', { id: row.id }, () => {
      ElMessage.success('删除成功')
      loadWebsiteList()
    })
  })
}

// 查看代码
function handleViewCode(row) {
  get(`/api/seo/website/code/${row.id}`, (data) => {
    codeContent.html = data.html || ''
    codeContent.keywords = data.keywords || ''
    codeDialogVisible.value = true
  })
}

// 提交表单
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      const url = form.id ? '/api/seo/website/update' : '/api/seo/website/add'
      post(url, form, () => {
        ElMessage.success(form.id ? '更新成功' : '添加成功')
        dialogVisible.value = false
        loadWebsiteList()
      })
    }
  })
}

// 复制代码
function handleCopyCode() {
  const text = activeTab.value === 'html' ? codeContent.html : codeContent.keywords
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('复制成功')
  })
}

// 加载网站列表
function loadWebsiteList() {
  loading.value = true
  get(`/api/seo/website/list?page=${pagination.page}&size=${pagination.size}`, (data) => {
    websiteList.value = data.list || []
    pagination.total = data.total || 0
    loading.value = false
  }, () => {
    loading.value = false
  })
}

// 分页处理
function handleSizeChange(val) {
  pagination.size = val
  loadWebsiteList()
}

function handlePageChange(val) {
  pagination.page = val
  loadWebsiteList()
}

onMounted(() => {
  loadWebsiteList()
})
</script>

<style scoped>
.website-manage {
  width: 100%;
}

:deep(.el-card) {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: none;
}

:deep(.el-card__header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 1px solid #e4e7ed;
  padding: 20px 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

:deep(.el-card__body) {
  padding: 24px;
}

.search-area {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  background-color: #ffffff !important;
  background: #ffffff !important;
}

:deep(.el-input__inner) {
  background-color: #ffffff !important;
  color: #303133 !important;
}

:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f5f7fa !important;
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s;
  background-color: #ffffff !important;
}

:deep(.el-button:not(.el-button--primary):not(.el-button--danger)) {
  background-color: #ffffff !important;
  color: #606266 !important;
  border-color: #dcdfe6 !important;
}

:deep(.el-button:not(.el-button--primary):not(.el-button--danger):hover) {
  background-color: #f5f7fa !important;
  border-color: #c0c4cc !important;
  color: #606266 !important;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.keywords-area {
  margin-top: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #e4e7ed;
}

:deep(.el-divider) {
  margin: 16px 0;
}

:deep(.el-tag) {
  border-radius: 6px;
  padding: 4px 12px;
  font-weight: 500;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* 表格样式优化 - 强制浅色主题 */
:deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
  background-color: #ffffff !important;
  color: #303133 !important;
}

:deep(.el-table__header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%) !important;
}

:deep(.el-table__header-wrapper) {
  background-color: #ffffff !important;
}

:deep(.el-table__body-wrapper) {
  background-color: #ffffff !important;
}

:deep(.el-table th) {
  background: #ffffff !important;
  background-color: #ffffff !important;
  color: #606266 !important;
  font-weight: 600;
  border-bottom: 2px solid #e4e7ed;
}

:deep(.el-table th.el-table__cell) {
  background-color: #ffffff !important;
  background: #ffffff !important;
}

:deep(.el-table td) {
  background-color: #ffffff !important;
  color: #303133 !important;
  border-bottom: 1px solid #f0f2f5;
}

:deep(.el-table td.el-table__cell) {
  background-color: #ffffff !important;
  background: #ffffff !important;
}

:deep(.el-table__row) {
  background-color: #ffffff !important;
}

:deep(.el-table__row:hover) {
  background-color: #f8f9fa !important;
}

:deep(.el-table__row:hover td) {
  background-color: #f8f9fa !important;
}

:deep(.el-table__empty-block) {
  background-color: #ffffff !important;
}

:deep(.el-table__empty-text) {
  color: #909399 !important;
}

.pagination-area {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}
</style>

