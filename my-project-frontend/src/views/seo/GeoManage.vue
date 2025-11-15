<template>
  <div class="geo-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>GEO功能管理</span>
          <el-button type="primary" @click="handleAddGeo">添加GEO配置</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索国家/地区或IP"
          style="width: 300px; margin-right: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="searchCountry" placeholder="国家筛选" style="width: 150px; margin-right: 10px" clearable>
          <el-option label="全部" value="" />
          <el-option label="中国" value="CN" />
          <el-option label="美国" value="US" />
          <el-option label="英国" value="GB" />
          <el-option label="日本" value="JP" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <!-- 统计卡片 -->
      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">总配置数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-value">{{ statistics.active }}</div>
              <div class="stat-label">活跃配置</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-value">{{ statistics.countries }}</div>
              <div class="stat-label">覆盖国家</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-value">{{ statistics.ips }}</div>
              <div class="stat-label">IP数量</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- GEO列表 -->
      <el-table :data="geoList" style="width: 100%; margin-top: 20px" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="country" label="国家/地区" width="120">
          <template #default="scope">
            <el-tag>{{ scope.row.country }} ({{ scope.row.countryCode }})</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP地址" min-width="150" />
        <el-table-column prop="location" label="地理位置" min-width="200" />
        <el-table-column prop="latitude" label="纬度" width="100" />
        <el-table-column prop="longitude" label="经度" width="100" />
        <el-table-column prop="timezone" label="时区" width="120" />
        <el-table-column prop="isp" label="ISP" min-width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
              {{ scope.row.status === 'active' ? '活跃' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
            <el-button type="success" size="small" @click="handleViewMap(scope.row)">查看地图</el-button>
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
      width="700px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="国家" prop="country">
              <el-input v-model="form.country" placeholder="请输入国家名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="国家代码" prop="countryCode">
              <el-input v-model="form.countryCode" placeholder="如：CN, US" maxlength="2" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="IP地址" prop="ip">
          <el-input v-model="form.ip" placeholder="请输入IP地址" />
        </el-form-item>
        <el-form-item label="地理位置" prop="location">
          <el-input v-model="form.location" placeholder="请输入地理位置，如：北京市" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="纬度" prop="latitude">
              <el-input-number v-model="form.latitude" :precision="6" :step="0.000001" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经度" prop="longitude">
              <el-input-number v-model="form.longitude" :precision="6" :step="0.000001" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="时区" prop="timezone">
              <el-input v-model="form.timezone" placeholder="如：Asia/Shanghai" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="ISP" prop="isp">
              <el-input v-model="form.isp" placeholder="请输入ISP" />
            </el-form-item>
          </el-col>
        </el-row>
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

    <!-- 地图查看对话框 -->
    <el-dialog
      v-model="mapDialogVisible"
      title="地理位置地图"
      width="800px"
    >
      <div class="map-container">
        <div v-if="currentGeo" class="map-info">
          <p><strong>位置：</strong>{{ currentGeo.location }}</p>
          <p><strong>坐标：</strong>{{ currentGeo.latitude }}, {{ currentGeo.longitude }}</p>
          <p><strong>IP：</strong>{{ currentGeo.ip }}</p>
        </div>
        <div class="map-placeholder">
          <el-icon :size="50"><MapLocation /></el-icon>
          <p>地图可视化区域</p>
          <p style="font-size: 12px; color: #999">可以集成百度地图、高德地图或Google Maps API</p>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="mapDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, MapLocation } from '@element-plus/icons-vue'
import { get, post } from '@/net'

const searchKeyword = ref('')
const searchCountry = ref('')
const loading = ref(false)
const geoList = ref([])
const dialogVisible = ref(false)
const mapDialogVisible = ref(false)
const dialogTitle = ref('添加GEO配置')
const currentGeo = ref(null)
const formRef = ref()

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const statistics = reactive({
  total: 0,
  active: 0,
  countries: 0,
  ips: 0
})

const form = reactive({
  id: null,
  country: '',
  countryCode: '',
  ip: '',
  location: '',
  latitude: 0,
  longitude: 0,
  timezone: '',
  isp: '',
  status: 'active'
})

const rules = {
  country: [
    { required: true, message: '请输入国家名称', trigger: 'blur' }
  ],
  countryCode: [
    { required: true, message: '请输入国家代码', trigger: 'blur' },
    { pattern: /^[A-Z]{2}$/, message: '国家代码必须是2位大写字母', trigger: 'blur' }
  ],
  ip: [
    { required: true, message: '请输入IP地址', trigger: 'blur' },
    { pattern: /^(\d{1,3}\.){3}\d{1,3}$/, message: '请输入正确的IP地址格式', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入地理位置', trigger: 'blur' }
  ]
}

// 搜索
function handleSearch() {
  pagination.page = 1
  loadGeoList()
}

// 重置
function handleReset() {
  searchKeyword.value = ''
  searchCountry.value = ''
  pagination.page = 1
  loadGeoList()
}

// 添加GEO配置
function handleAddGeo() {
  dialogTitle.value = '添加GEO配置'
  form.id = null
  form.country = ''
  form.countryCode = ''
  form.ip = ''
  form.location = ''
  form.latitude = 0
  form.longitude = 0
  form.timezone = ''
  form.isp = ''
  form.status = 'active'
  dialogVisible.value = true
}

// 编辑GEO配置
function handleEdit(row) {
  dialogTitle.value = '编辑GEO配置'
  form.id = row.id
  form.country = row.country
  form.countryCode = row.countryCode
  form.ip = row.ip
  form.location = row.location
  form.latitude = row.latitude
  form.longitude = row.longitude
  form.timezone = row.timezone
  form.isp = row.isp
  form.status = row.status
  dialogVisible.value = true
}

// 删除GEO配置
function handleDelete(row) {
  ElMessageBox.confirm('确定要删除这个GEO配置吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    post('/api/seo/geo/delete', { id: row.id }, () => {
      ElMessage.success('删除成功')
      loadGeoList()
    })
  })
}

// 查看地图
function handleViewMap(row) {
  currentGeo.value = row
  mapDialogVisible.value = true
}

// 提交表单
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      const url = form.id ? '/api/seo/geo/update' : '/api/seo/geo/add'
      post(url, form, () => {
        ElMessage.success(form.id ? '更新成功' : '添加成功')
        dialogVisible.value = false
        loadGeoList()
      })
    }
  })
}

// 加载GEO列表
function loadGeoList() {
  loading.value = true
  const params = new URLSearchParams({
    page: pagination.page,
    size: pagination.size
  })
  if (searchKeyword.value) params.append('keyword', searchKeyword.value)
  if (searchCountry.value) params.append('country', searchCountry.value)
  
  get(`/api/seo/geo/list?${params.toString()}`, (data) => {
    geoList.value = data.list || []
    pagination.total = data.total || 0
    statistics.total = data.statistics?.total || 0
    statistics.active = data.statistics?.active || 0
    statistics.countries = data.statistics?.countries || 0
    statistics.ips = data.statistics?.ips || 0
    loading.value = false
  }, () => {
    loading.value = false
  })
}

// 分页处理
function handleSizeChange(val) {
  pagination.size = val
  loadGeoList()
}

function handlePageChange(val) {
  pagination.page = val
  loadGeoList()
}

onMounted(() => {
  loadGeoList()
})
</script>

<style scoped>
.geo-manage {
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

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.pagination-area {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.map-container {
  min-height: 400px;
}

.map-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.map-info p {
  margin: 5px 0;
}

.map-placeholder {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #909399;
}

.map-placeholder p {
  margin: 10px 0;
}
</style>











