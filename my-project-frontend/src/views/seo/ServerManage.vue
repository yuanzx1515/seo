<template>
  <div class="server-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>服务器管理</span>
          <el-button type="primary" @click="handleAddServer">添加服务器</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索服务器名称、IP地址或地区"
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

      <!-- 服务器列表 -->
      <el-table :data="serverList" style="width: 100%; margin-top: 20px" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="服务器名称" min-width="150" />
        <el-table-column prop="ip" label="IP地址" min-width="150" />
        <el-table-column prop="panelUrl" label="面板登录地址" min-width="200" />
        <el-table-column prop="panelPassword" label="面板登录密码" min-width="150">
          <template #default="scope">
            <span>{{ scope.row.panelPassword ? '******' : '' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="region" label="服务器所属地区" min-width="150" />
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
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="服务器名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入服务器名称" />
        </el-form-item>
        <el-form-item label="IP地址" prop="ip">
          <el-input v-model="form.ip" placeholder="请输入IP地址" />
        </el-form-item>
        <el-form-item label="面板登录地址" prop="panelUrl">
          <el-input v-model="form.panelUrl" placeholder="请输入面板登录地址，如：https://panel.example.com" />
        </el-form-item>
        <el-form-item label="面板登录密码" prop="panelPassword">
          <el-input v-model="form.panelPassword" type="password" placeholder="请输入面板登录密码" show-password />
        </el-form-item>
        <el-form-item label="服务器所属地区" prop="region">
          <el-input v-model="form.region" placeholder="请输入服务器所属地区，如：北京、上海、广州等" />
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
const serverList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加服务器')
const formRef = ref()

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const form = reactive({
  id: null,
  name: '',
  ip: '',
  panelUrl: '',
  panelPassword: '',
  region: ''
})

const rules = {
  name: [
    { required: true, message: '请输入服务器名称', trigger: 'blur' }
  ],
  ip: [
    { required: true, message: '请输入IP地址', trigger: 'blur' },
    { pattern: /^(\d{1,3}\.){3}\d{1,3}$/, message: '请输入正确的IP地址格式', trigger: 'blur' }
  ],
  panelUrl: [
    { required: true, message: '请输入面板登录地址', trigger: 'blur' },
    { type: 'url', message: '请输入正确的URL格式', trigger: 'blur' }
  ],
  panelPassword: [
    { required: true, message: '请输入面板登录密码', trigger: 'blur' }
  ],
  region: [
    { required: true, message: '请输入服务器所属地区', trigger: 'blur' }
  ]
}


// 搜索
function handleSearch() {
  pagination.page = 1
  loadServerList()
}

// 重置
function handleReset() {
  searchKeyword.value = ''
  pagination.page = 1
  loadServerList()
}

// 添加服务器
function handleAddServer() {
  dialogTitle.value = '添加服务器'
  form.id = null
  form.name = ''
  form.ip = ''
  form.panelUrl = ''
  form.panelPassword = ''
  form.region = ''
  dialogVisible.value = true
}

// 编辑服务器
function handleEdit(row) {
  dialogTitle.value = '编辑服务器'
  form.id = row.id
  form.name = row.name
  form.ip = row.ip
  form.panelUrl = row.panelUrl
  form.panelPassword = ''
  form.region = row.region
  dialogVisible.value = true
}

// 删除服务器
function handleDelete(row) {
  ElMessageBox.confirm('确定要删除这个服务器吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    post('/api/seo/server/delete', { id: row.id }, () => {
      ElMessage.success('删除成功')
      loadServerList()
    })
  })
}

// 提交表单
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      const url = form.id ? '/api/seo/server/update' : '/api/seo/server/add'
      post(url, form, () => {
        ElMessage.success(form.id ? '更新成功' : '添加成功')
        dialogVisible.value = false
        loadServerList()
      })
    }
  })
}

// 加载服务器列表
function loadServerList() {
  loading.value = true
  const params = new URLSearchParams({
    page: pagination.page,
    size: pagination.size
  })
  if (searchKeyword.value) params.append('keyword', searchKeyword.value)
  
  get(`/api/seo/server/list?${params.toString()}`, (data) => {
    serverList.value = data.list || []
    pagination.total = data.total || 0
    loading.value = false
  }, () => {
    loading.value = false
  })
}

// 分页处理
function handleSizeChange(val) {
  pagination.size = val
  loadServerList()
}

function handlePageChange(val) {
  pagination.page = val
  loadServerList()
}

onMounted(() => {
  loadServerList()
})
</script>

<style scoped>
.server-manage {
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

