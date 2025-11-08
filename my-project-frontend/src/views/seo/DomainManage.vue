<template>
  <div class="domain-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>域名管理</span>
          <el-button type="primary" @click="handleAddDomain">添加域名</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索域名"
          style="width: 300px; margin-right: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="searchStatus" placeholder="状态筛选" style="width: 150px; margin-right: 10px" clearable>
          <el-option label="全部" value="" />
          <el-option label="正常" value="normal" />
          <el-option label="过期" value="expired" />
          <el-option label="即将过期" value="expiring" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <!-- 域名列表 -->
      <el-table :data="domainList" style="width: 100%; margin-top: 20px" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="domain" label="域名" min-width="200" />
        <el-table-column prop="registrar" label="注册商" min-width="150" />
        <el-table-column prop="registerDate" label="注册日期" width="120" />
        <el-table-column prop="expireDate" label="到期日期" width="120" />
        <el-table-column prop="daysLeft" label="剩余天数" width="100">
          <template #default="scope">
            <el-tag :type="getDaysLeftType(scope.row.daysLeft)">
              {{ scope.row.daysLeft }} 天
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dns" label="DNS服务器" min-width="150">
          <template #default="scope">
            <el-tag
              v-for="(dns, index) in scope.row.dns?.split(',')"
              :key="index"
              size="small"
              style="margin-right: 5px"
            >
              {{ dns }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
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
        <el-form-item label="域名" prop="domain">
          <el-input v-model="form.domain" placeholder="请输入域名，如：example.com" />
        </el-form-item>
        <el-form-item label="注册商" prop="registrar">
          <el-input v-model="form.registrar" placeholder="请输入注册商" />
        </el-form-item>
        <el-form-item label="注册日期" prop="registerDate">
          <el-date-picker
            v-model="form.registerDate"
            type="date"
            placeholder="选择注册日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="到期日期" prop="expireDate">
          <el-date-picker
            v-model="form.expireDate"
            type="date"
            placeholder="选择到期日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="DNS服务器" prop="dns">
          <el-input
            v-model="form.dns"
            type="textarea"
            :rows="3"
            placeholder="请输入DNS服务器，多个DNS用逗号分隔"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="normal">正常</el-radio>
            <el-radio label="expired">过期</el-radio>
            <el-radio label="expiring">即将过期</el-radio>
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
const domainList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加域名')
const formRef = ref()

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const form = reactive({
  id: null,
  domain: '',
  registrar: '',
  registerDate: '',
  expireDate: '',
  dns: '',
  status: 'normal'
})

const rules = {
  domain: [
    { required: true, message: '请输入域名', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/, message: '请输入正确的域名格式', trigger: 'blur' }
  ],
  registrar: [
    { required: true, message: '请输入注册商', trigger: 'blur' }
  ],
  expireDate: [
    { required: true, message: '请选择到期日期', trigger: 'change' }
  ]
}

// 获取状态类型
function getStatusType(status) {
  const map = {
    normal: 'success',
    expired: 'danger',
    expiring: 'warning'
  }
  return map[status] || 'info'
}

// 获取状态文本
function getStatusText(status) {
  const map = {
    normal: '正常',
    expired: '过期',
    expiring: '即将过期'
  }
  return map[status] || status
}

// 获取剩余天数类型
function getDaysLeftType(daysLeft) {
  if (daysLeft < 0) return 'danger'
  if (daysLeft <= 30) return 'warning'
  return 'success'
}

// 搜索
function handleSearch() {
  pagination.page = 1
  loadDomainList()
}

// 重置
function handleReset() {
  searchKeyword.value = ''
  searchStatus.value = ''
  pagination.page = 1
  loadDomainList()
}

// 添加域名
function handleAddDomain() {
  dialogTitle.value = '添加域名'
  form.id = null
  form.domain = ''
  form.registrar = ''
  form.registerDate = ''
  form.expireDate = ''
  form.dns = ''
  form.status = 'normal'
  dialogVisible.value = true
}

// 编辑域名
function handleEdit(row) {
  dialogTitle.value = '编辑域名'
  form.id = row.id
  form.domain = row.domain
  form.registrar = row.registrar
  form.registerDate = row.registerDate
  form.expireDate = row.expireDate
  form.dns = row.dns
  form.status = row.status
  dialogVisible.value = true
}

// 删除域名
function handleDelete(row) {
  ElMessageBox.confirm('确定要删除这个域名吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    post('/api/seo/domain/delete', { id: row.id }, () => {
      ElMessage.success('删除成功')
      loadDomainList()
    })
  })
}

// 检查域名
function handleCheck(row) {
  post('/api/seo/domain/check', { id: row.id }, (data) => {
    ElMessage.success(`域名状态：${getStatusText(data.status)}，剩余${data.daysLeft}天`)
    loadDomainList()
  })
}

// 提交表单
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      const url = form.id ? '/api/seo/domain/update' : '/api/seo/domain/add'
      post(url, form, () => {
        ElMessage.success(form.id ? '更新成功' : '添加成功')
        dialogVisible.value = false
        loadDomainList()
      })
    }
  })
}

// 加载域名列表
function loadDomainList() {
  loading.value = true
  const params = new URLSearchParams({
    page: pagination.page,
    size: pagination.size
  })
  if (searchKeyword.value) params.append('keyword', searchKeyword.value)
  if (searchStatus.value) params.append('status', searchStatus.value)
  
  get(`/api/seo/domain/list?${params.toString()}`, (data) => {
    domainList.value = data.list || []
    pagination.total = data.total || 0
    loading.value = false
  }, () => {
    loading.value = false
  })
}

// 分页处理
function handleSizeChange(val) {
  pagination.size = val
  loadDomainList()
}

function handlePageChange(val) {
  pagination.page = val
  loadDomainList()
}

onMounted(() => {
  loadDomainList()
})
</script>

<style scoped>
.domain-manage {
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

