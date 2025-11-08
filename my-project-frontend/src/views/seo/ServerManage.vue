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
          placeholder="搜索服务器IP或名称"
          style="width: 300px; margin-right: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="searchStatus" placeholder="状态筛选" style="width: 150px; margin-right: 10px" clearable>
          <el-option label="全部" value="" />
          <el-option label="在线" value="online" />
          <el-option label="离线" value="offline" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <!-- 服务器列表 -->
      <el-table :data="serverList" style="width: 100%; margin-top: 20px" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="服务器名称" min-width="150" />
        <el-table-column prop="ip" label="IP地址" min-width="150" />
        <el-table-column prop="port" label="端口" width="100" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag>{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'online' ? 'success' : 'danger'">
              {{ scope.row.status === 'online' ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cpu" label="CPU使用率" width="120">
          <template #default="scope">
            <el-progress :percentage="scope.row.cpu || 0" :color="getProgressColor(scope.row.cpu)" />
          </template>
        </el-table-column>
        <el-table-column prop="memory" label="内存使用率" width="120">
          <template #default="scope">
            <el-progress :percentage="scope.row.memory || 0" :color="getProgressColor(scope.row.memory)" />
          </template>
        </el-table-column>
        <el-table-column prop="disk" label="磁盘使用率" width="120">
          <template #default="scope">
            <el-progress :percentage="scope.row.disk || 0" :color="getProgressColor(scope.row.disk)" />
          </template>
        </el-table-column>
        <el-table-column prop="lastCheckTime" label="最后检查时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
            <el-button type="success" size="small" @click="handleCheck(scope.row)">检查</el-button>
            <el-button type="warning" size="small" @click="handleConnect(scope.row)">连接</el-button>
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
        <el-form-item label="服务器名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入服务器名称" />
        </el-form-item>
        <el-form-item label="IP地址" prop="ip">
          <el-input v-model="form.ip" placeholder="请输入IP地址" />
        </el-form-item>
        <el-form-item label="端口" prop="port">
          <el-input-number v-model="form.port" :min="1" :max="65535" style="width: 100%" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择服务器类型" style="width: 100%">
            <el-option label="Linux" value="linux" />
            <el-option label="Windows" value="windows" />
            <el-option label="MacOS" value="macos" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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
  port: 22,
  username: '',
  password: '',
  type: 'linux',
  remark: ''
})

const rules = {
  name: [
    { required: true, message: '请输入服务器名称', trigger: 'blur' }
  ],
  ip: [
    { required: true, message: '请输入IP地址', trigger: 'blur' },
    { pattern: /^(\d{1,3}\.){3}\d{1,3}$/, message: '请输入正确的IP地址格式', trigger: 'blur' }
  ],
  port: [
    { required: true, message: '请输入端口', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 获取进度条颜色
function getProgressColor(percentage) {
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

// 搜索
function handleSearch() {
  pagination.page = 1
  loadServerList()
}

// 重置
function handleReset() {
  searchKeyword.value = ''
  searchStatus.value = ''
  pagination.page = 1
  loadServerList()
}

// 添加服务器
function handleAddServer() {
  dialogTitle.value = '添加服务器'
  form.id = null
  form.name = ''
  form.ip = ''
  form.port = 22
  form.username = ''
  form.password = ''
  form.type = 'linux'
  form.remark = ''
  dialogVisible.value = true
}

// 编辑服务器
function handleEdit(row) {
  dialogTitle.value = '编辑服务器'
  form.id = row.id
  form.name = row.name
  form.ip = row.ip
  form.port = row.port
  form.username = row.username
  form.password = ''
  form.type = row.type
  form.remark = row.remark
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

// 检查服务器
function handleCheck(row) {
  post('/api/seo/server/check', { id: row.id }, (data) => {
    ElMessage.success(`服务器状态：${data.status === 'online' ? '在线' : '离线'}`)
    loadServerList()
  })
}

// 连接服务器
function handleConnect(row) {
  post('/api/seo/server/connect', { id: row.id }, (data) => {
    ElMessage.success('连接成功')
    loadServerList()
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
  if (searchStatus.value) params.append('status', searchStatus.value)
  
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

