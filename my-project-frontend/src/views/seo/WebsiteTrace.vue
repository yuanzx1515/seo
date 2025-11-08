<template>
  <div class="website-trace">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>网站痕迹</span>
          <el-button type="primary" @click="handleAddTrace">添加痕迹</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索网站或关键词"
          style="width: 300px; margin-right: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <!-- 痕迹列表 -->
      <el-table :data="traceList" style="width: 100%; margin-top: 20px" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="website" label="网站" min-width="200" />
        <el-table-column prop="keyword" label="关键词" min-width="150" />
        <el-table-column prop="traceType" label="痕迹类型" width="120">
          <template #default="scope">
            <el-tag :type="getTraceTypeColor(scope.row.traceType)">
              {{ scope.row.traceType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="traceUrl" label="痕迹URL" min-width="250" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
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
        <el-form-item label="网站" prop="website">
          <el-input v-model="form.website" placeholder="请输入网站" />
        </el-form-item>
        <el-form-item label="关键词" prop="keyword">
          <el-input v-model="form.keyword" placeholder="请输入关键词" />
        </el-form-item>
        <el-form-item label="痕迹类型" prop="traceType">
          <el-select v-model="form.traceType" placeholder="请选择痕迹类型" style="width: 100%">
            <el-option label="外链" value="外链" />
            <el-option label="评论" value="评论" />
            <el-option label="分享" value="分享" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="痕迹URL" prop="traceUrl">
          <el-input v-model="form.traceUrl" placeholder="请输入痕迹URL" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
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
const loading = ref(false)
const traceList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加痕迹')
const formRef = ref()

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const form = reactive({
  id: null,
  website: '',
  keyword: '',
  traceType: '外链',
  traceUrl: '',
  description: ''
})

const rules = {
  website: [
    { required: true, message: '请输入网站', trigger: 'blur' }
  ],
  keyword: [
    { required: true, message: '请输入关键词', trigger: 'blur' }
  ],
  traceType: [
    { required: true, message: '请选择痕迹类型', trigger: 'change' }
  ],
  traceUrl: [
    { required: true, message: '请输入痕迹URL', trigger: 'blur' },
    { type: 'url', message: '请输入正确的URL格式', trigger: 'blur' }
  ]
}

function getTraceTypeColor(type) {
  const map = {
    '外链': 'success',
    '评论': 'warning',
    '分享': 'info',
    '其他': ''
  }
  return map[type] || ''
}

function handleSearch() {
  pagination.page = 1
  loadTraceList()
}

function handleReset() {
  searchKeyword.value = ''
  pagination.page = 1
  loadTraceList()
}

function handleAddTrace() {
  dialogTitle.value = '添加痕迹'
  form.id = null
  form.website = ''
  form.keyword = ''
  form.traceType = '外链'
  form.traceUrl = ''
  form.description = ''
  dialogVisible.value = true
}

function handleEdit(row) {
  dialogTitle.value = '编辑痕迹'
  form.id = row.id
  form.website = row.website
  form.keyword = row.keyword
  form.traceType = row.traceType
  form.traceUrl = row.traceUrl
  form.description = row.description
  dialogVisible.value = true
}

function handleDelete(row) {
  ElMessageBox.confirm('确定要删除这个痕迹吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    post('/api/seo/trace/delete', { id: row.id }, () => {
      ElMessage.success('删除成功')
      loadTraceList()
    })
  })
}

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      const url = form.id ? '/api/seo/trace/update' : '/api/seo/trace/add'
      post(url, form, () => {
        ElMessage.success(form.id ? '更新成功' : '添加成功')
        dialogVisible.value = false
        loadTraceList()
      })
    }
  })
}

function loadTraceList() {
  loading.value = true
  const params = new URLSearchParams({
    page: pagination.page,
    size: pagination.size
  })
  if (searchKeyword.value) params.append('keyword', searchKeyword.value)
  
  get(`/api/seo/trace/list?${params.toString()}`, (data) => {
    traceList.value = data.list || []
    pagination.total = data.total || 0
    loading.value = false
  }, () => {
    loading.value = false
  })
}

function handleSizeChange(val) {
  pagination.size = val
  loadTraceList()
}

function handlePageChange(val) {
  pagination.page = val
  loadTraceList()
}

onMounted(() => {
  loadTraceList()
})
</script>

<style scoped>
.website-trace {
  width: 100%;
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

.search-area {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.pagination-area {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}
</style>





