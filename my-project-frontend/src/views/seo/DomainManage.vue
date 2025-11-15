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
        <el-select v-model="groupBy" placeholder="分组方式" style="width: 150px; margin-right: 10px" clearable>
          <el-option label="不分组" value="" />
          <el-option label="按注册商" value="registrar" />
          <el-option label="按来源网站" value="sourceWebsite" />
          <el-option label="按状态" value="status" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <!-- 域名列表 - 分组显示 -->
      <template v-if="groupBy">
        <div v-for="(group, groupKey) in groupedDomainList" :key="groupKey" class="domain-group">
          <div class="group-header">
            <el-tag type="info" size="large">{{ getGroupLabel(groupKey) }}</el-tag>
            <span class="group-count">共 {{ group.length }} 个域名</span>
          </div>
          <el-table :data="group" style="width: 100%; margin-top: 10px" v-loading="loading" :row-key="row => row.id">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="domain" label="域名" min-width="200" />
            <el-table-column prop="registrar" label="注册商" min-width="150" v-if="groupBy !== 'registrar'" />
            <el-table-column prop="registerDate" label="注册日期" width="120" />
            <el-table-column prop="expireDate" label="到期日期" width="120" />
            <el-table-column prop="daysLeft" label="剩余天数" width="100">
              <template #default="scope">
                <el-tag :type="getDaysLeftType(scope.row.daysLeft)">
                  {{ scope.row.daysLeft }} 天
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100" v-if="groupBy !== 'status'">
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
            <el-table-column prop="sourceWebsite" label="来源网站" min-width="200" v-if="groupBy !== 'sourceWebsite'">
              <template #default="scope">
                <el-link 
                  v-if="scope.row.sourceWebsite" 
                  :href="scope.row.sourceWebsite" 
                  target="_blank" 
                  type="primary"
                >
                  {{ scope.row.sourceWebsite }}
                </el-link>
                <span v-else style="color: #909399;">-</span>
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
        </div>
        <el-empty v-if="Object.keys(groupedDomainList).length === 0 && !loading" description="暂无数据" />
      </template>

      <!-- 域名列表 - 不分组显示 -->
      <el-table v-else :data="domainList" style="width: 100%; margin-top: 20px" v-loading="loading" :row-key="row => row.id">
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
        <el-table-column prop="sourceWebsite" label="来源网站" min-width="200">
          <template #default="scope">
            <el-link 
              v-if="scope.row.sourceWebsite" 
              :href="scope.row.sourceWebsite" 
              target="_blank" 
              type="primary"
            >
              {{ scope.row.sourceWebsite }}
            </el-link>
            <span v-else style="color: #909399;">-</span>
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
          <div style="display: flex; gap: 10px; width: 100%;">
            <el-input 
              v-model="form.domain" 
              placeholder="请输入域名，如：example.com"
              @blur="handleDomainBlur"
            />
            <el-button 
              type="primary" 
              @click="handleParseDomain" 
              :loading="parsing"
              :disabled="!form.domain"
            >
              <el-icon><Refresh /></el-icon>
              自动解析
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="来源网站" prop="sourceWebsite">
          <el-input 
            v-model="form.sourceWebsite" 
            placeholder="请输入域名来源网站，如：https://example.com"
            clearable
          >
            <template #prefix>
              <el-icon><Link /></el-icon>
            </template>
          </el-input>
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">
            用于记录该域名是从哪个网站获取的，方便管理
          </div>
        </el-form-item>
        <el-form-item label="注册商" prop="registrar">
          <el-input v-model="form.registrar" placeholder="请输入注册商" />
        </el-form-item>
        <el-form-item label="注册日期" prop="registerDate">
          <el-date-picker
            v-model="form.registerDate"
            type="date"
            placeholder="选择注册日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="到期日期" prop="expireDate">
          <el-date-picker
            v-model="form.expireDate"
            type="date"
            placeholder="选择到期日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Link } from '@element-plus/icons-vue'
import { get, post } from '@/net'

const searchKeyword = ref('')
const searchStatus = ref('')
const groupBy = ref('')
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
  status: 'normal',
  sourceWebsite: ''
})

const parsing = ref(false)

const rules = {
  domain: [
    { required: true, message: '请输入域名', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/, message: '请输入正确的域名格式', trigger: 'blur' }
  ],
  registrar: [
    { required: true, message: '请输入注册商（可点击"自动解析"按钮自动获取）', trigger: 'blur' }
  ],
  expireDate: [
    { required: true, message: '请选择到期日期（可点击"自动解析"按钮自动获取）', trigger: 'change' }
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
  groupBy.value = ''
  pagination.page = 1
  loadDomainList()
}

// 获取分组后的域名列表
const groupedDomainList = computed(() => {
  if (!groupBy.value || domainList.value.length === 0) {
    return {}
  }
  
  const grouped = {}
  domainList.value.forEach(domain => {
    let key = ''
    if (groupBy.value === 'registrar') {
      key = domain.registrar || '未知注册商'
    } else if (groupBy.value === 'sourceWebsite') {
      key = domain.sourceWebsite || '无来源网站'
    } else if (groupBy.value === 'status') {
      key = getStatusText(domain.status)
    }
    
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(domain)
  })
  
  return grouped
})

// 获取分组标签
function getGroupLabel(key) {
  if (groupBy.value === 'registrar') {
    return `注册商: ${key}`
  } else if (groupBy.value === 'sourceWebsite') {
    return `来源网站: ${key}`
  } else if (groupBy.value === 'status') {
    return `状态: ${key}`
  }
  return key
}

// 域名输入失焦时，尝试从剪贴板获取来源网站
function handleDomainBlur() {
  // 如果来源网站为空，尝试从剪贴板获取
  if (!form.sourceWebsite && navigator.clipboard) {
    navigator.clipboard.readText().then(text => {
      // 检查是否是URL格式
      try {
        const url = new URL(text)
        if (url.hostname) {
          form.sourceWebsite = text
        }
      } catch (e) {
        // 不是有效URL，忽略
      }
    }).catch(() => {
      // 剪贴板读取失败，忽略
    })
  }
}

// 自动解析域名信息
function handleParseDomain() {
  if (!form.domain || !form.domain.trim()) {
    ElMessage.warning('请输入域名')
    return
  }

  // 验证域名格式
  const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/
  if (!domainPattern.test(form.domain.trim())) {
    ElMessage.warning('请输入正确的域名格式')
    return
  }

  parsing.value = true

  // 调用解析接口
  post('/api/seo/domain/parse', { domain: form.domain.trim() }, (data) => {
    // 自动填充解析结果
    if (data.registrar) {
      form.registrar = data.registrar
    }
    
    // 处理注册日期 - 转换为Date对象或保持字符串格式
    if (data.registerDate) {
      // Element Plus日期选择器支持字符串格式 'YYYY-MM-DD'
      form.registerDate = data.registerDate
    }
    
    // 处理到期日期 - 转换为Date对象或保持字符串格式
    if (data.expireDate) {
      // Element Plus日期选择器支持字符串格式 'YYYY-MM-DD'
      form.expireDate = data.expireDate
    }
    
    // 处理DNS服务器
    if (data.dns && data.dns.length > 0) {
      form.dns = data.dns.join(',')
    }
    
    // 计算状态
    if (data.expireDate) {
      const daysLeft = calculateDaysLeft(data.expireDate)
      if (daysLeft < 0) {
        form.status = 'expired'
      } else if (daysLeft <= 30) {
        form.status = 'expiring'
      } else {
        form.status = 'normal'
      }
    }

    // 验证必填字段是否都已填充
    const missingFields = []
    if (!form.registrar) missingFields.push('注册商')
    if (!form.expireDate) missingFields.push('到期日期')
    
    if (missingFields.length > 0) {
      ElMessage.warning(`解析完成，但以下字段未获取到：${missingFields.join('、')}`)
    } else {
      ElMessage.success('域名解析成功，所有必填字段已自动填充')
    }
    
    parsing.value = false
  }, (message) => {
    ElMessage.error(message || '域名解析失败，请检查网络连接或稍后重试')
    parsing.value = false
  })
}

// 计算剩余天数
function calculateDaysLeft(expireDate) {
  if (!expireDate) return 0
  const expire = new Date(expireDate)
  const now = new Date()
  const diff = expire.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
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
  form.sourceWebsite = ''
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
  form.sourceWebsite = row.sourceWebsite || ''
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
        // 如果是添加，重置到第一页
        if (!form.id) {
          pagination.page = 1
        }
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
    console.log('获取到的域名列表数据:', data)
    domainList.value = data.list || []
    pagination.total = data.total || 0
    console.log('设置后的域名列表:', domainList.value)
    loading.value = false
  }, (message) => {
    console.error('获取域名列表失败:', message)
    ElMessage.error(message || '获取域名列表失败')
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

/* 分组样式 */
.domain-group {
  margin-bottom: 30px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 10px;
}

.group-count {
  font-size: 14px;
  color: #909399;
  margin-left: auto;
}
</style>

