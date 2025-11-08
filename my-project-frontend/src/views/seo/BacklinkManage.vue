<template>
  <div class="backlink-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>SEO外链管理</span>
          <el-button type="primary" @click="handleAddBacklink">添加外链</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索外链URL或关键词"
          style="width: 300px; margin-right: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="searchStatus" placeholder="状态筛选" style="width: 150px; margin-right: 10px" clearable>
          <el-option label="全部" value="" />
          <el-option label="有效" value="active" />
          <el-option label="无效" value="inactive" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <!-- 外链列表 -->
      <el-table :data="backlinkList" style="width: 100%; margin-top: 20px" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="url" label="外链URL" min-width="250" />
        <el-table-column prop="anchorText" label="锚文本" min-width="150" />
        <el-table-column prop="targetUrl" label="目标URL" min-width="200" />
        <el-table-column prop="domain" label="域名" min-width="150" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'dofollow' ? 'success' : 'info'">
              {{ scope.row.type === 'dofollow' ? 'DoFollow' : 'NoFollow' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '有效' : '无效' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
            <el-button type="success" size="small" @click="handleCheck(scope.row)">检查</el-button>
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
        <el-form-item label="外链URL" prop="url">
          <el-input v-model="form.url" placeholder="请输入外链URL" />
        </el-form-item>
        <el-form-item label="锚文本" prop="anchorText">
          <el-input v-model="form.anchorText" placeholder="请输入锚文本" />
        </el-form-item>
        <el-form-item label="目标URL" prop="targetUrl">
          <el-input v-model="form.targetUrl" placeholder="请输入目标URL" />
        </el-form-item>
        <el-form-item label="域名" prop="domain">
          <el-input v-model="form.domain" placeholder="请输入域名" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio label="dofollow">DoFollow</el-radio>
            <el-radio label="nofollow">NoFollow</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">有效</el-radio>
            <el-radio label="inactive">无效</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { get, post } from '@/net'

const searchKeyword = ref('')
const searchStatus = ref('')
const loading = ref(false)
const backlinkList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加外链')
const formRef = ref()

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const form = reactive({
  id: null,
  url: '',
  anchorText: '',
  targetUrl: '',
  domain: '',
  type: 'dofollow',
  status: 'active'
})

const rules = {
  url: [
    { required: true, message: '请输入外链URL', trigger: 'blur' },
    { type: 'url', message: '请输入正确的URL格式', trigger: 'blur' }
  ],
  anchorText: [
    { required: true, message: '请输入锚文本', trigger: 'blur' }
  ],
  targetUrl: [
    { required: true, message: '请输入目标URL', trigger: 'blur' },
    { type: 'url', message: '请输入正确的URL格式', trigger: 'blur' }
  ],
  domain: [
    { required: true, message: '请输入域名', trigger: 'blur' }
  ]
}

// 搜索
function handleSearch() {
  pagination.page = 1
  loadBacklinkList()
}

// 重置
function handleReset() {
  searchKeyword.value = ''
  searchStatus.value = ''
  pagination.page = 1
  loadBacklinkList()
}

// 添加外链
function handleAddBacklink() {
  dialogTitle.value = '添加外链'
  form.id = null
  form.url = ''
  form.anchorText = ''
  form.targetUrl = ''
  form.domain = ''
  form.type = 'dofollow'
  form.status = 'active'
  dialogVisible.value = true
}

// 编辑外链
function handleEdit(row) {
  dialogTitle.value = '编辑外链'
  form.id = row.id
  form.url = row.url
  form.anchorText = row.anchorText
  form.targetUrl = row.targetUrl
  form.domain = row.domain
  form.type = row.type
  form.status = row.status
  dialogVisible.value = true
}

// 删除外链
function handleDelete(row) {
  ElMessageBox.confirm('确定要删除这个外链吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    post('/api/seo/backlink/delete', { id: row.id }, () => {
      ElMessage.success('删除成功')
      loadBacklinkList()
    })
  })
}

// 检查外链
function handleCheck(row) {
  post('/api/seo/backlink/check', { id: row.id }, (data) => {
    ElMessage.success(`外链状态：${data.status === 'active' ? '有效' : '无效'}`)
    loadBacklinkList()
  })
}

// 提交表单
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      const url = form.id ? '/api/seo/backlink/update' : '/api/seo/backlink/add'
      post(url, form, () => {
        ElMessage.success(form.id ? '更新成功' : '添加成功')
        dialogVisible.value = false
        loadBacklinkList()
      })
    }
  })
}

// 加载外链列表
function loadBacklinkList() {
  loading.value = true
  const params = new URLSearchParams({
    page: pagination.page,
    size: pagination.size
  })
  if (searchKeyword.value) params.append('keyword', searchKeyword.value)
  if (searchStatus.value) params.append('status', searchStatus.value)
  
  get(`/api/seo/backlink/list?${params.toString()}`, (data) => {
    backlinkList.value = data.list || []
    pagination.total = data.total || 0
    loading.value = false
  }, () => {
    loading.value = false
  })
}

// 分页处理
function handleSizeChange(val) {
  pagination.size = val
  loadBacklinkList()
}

function handlePageChange(val) {
  pagination.page = val
  loadBacklinkList()
}

onMounted(() => {
  loadBacklinkList()
})
</script>

<style scoped>
.backlink-manage {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-area {
  margin-bottom: 20px;
}

.pagination-area {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

