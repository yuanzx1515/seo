<template>
  <div class="dashboard">
    <!-- 欢迎区域 -->
    <el-card class="welcome-card" shadow="never">
      <div class="welcome-content">
        <div class="welcome-text">
          <h2>欢迎回来！</h2>
          <p>今天是 {{ currentDate }}，祝您工作愉快！</p>
        </div>
        <div class="welcome-icon">
          <el-icon :size="80" color="#667eea"><Odometer /></el-icon>
        </div>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon website">
              <el-icon :size="40"><Link /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.websiteCount }}</div>
              <div class="stat-label">网站总数</div>
              <div class="stat-detail">活跃: {{ statistics.activeWebsiteCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon domain">
              <el-icon :size="40"><Location /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.domainCount }}</div>
              <div class="stat-label">域名总数</div>
              <div class="stat-detail">即将过期: {{ statistics.expiringDomainCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon server">
              <el-icon :size="40"><Monitor /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.serverCount }}</div>
              <div class="stat-label">服务器总数</div>
              <div class="stat-detail">在线: {{ statistics.onlineServerCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon search">
              <el-icon :size="40"><Search /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.siteSearchCount }}</div>
              <div class="stat-label">站内搜索次数</div>
              <div class="stat-detail">今日: {{ statistics.todaySearchCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据趋势和最近操作 -->
    <el-row :gutter="20" class="content-row">
      <!-- 数据趋势图表 -->
      <el-col :xs="24" :lg="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>数据趋势（最近7天）</span>
              <el-button text @click="refreshData">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>
          <div class="chart-container" v-loading="loading">
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-color website"></span>
                <span>网站数量</span>
              </div>
              <div class="legend-item">
                <span class="legend-color domain"></span>
                <span>域名数量</span>
              </div>
              <div class="legend-item">
                <span class="legend-color server"></span>
                <span>服务器数量</span>
              </div>
              <div class="legend-item">
                <span class="legend-color search"></span>
                <span>搜索次数</span>
              </div>
            </div>
            <div class="chart-wrapper">
              <div class="chart-bars">
                <div 
                  v-for="(date, index) in trendData.dateRange" 
                  :key="index"
                  class="chart-bar-group"
                >
                  <div class="bar-item website" :style="{ height: `${(trendData.website[index] / 15) * 100}%` }">
                    <el-tooltip :content="`网站: ${trendData.website[index]}`" placement="top">
                      <div class="bar"></div>
                    </el-tooltip>
                  </div>
                  <div class="bar-item domain" :style="{ height: `${(trendData.domain[index] / 10) * 100}%` }">
                    <el-tooltip :content="`域名: ${trendData.domain[index]}`" placement="top">
                      <div class="bar"></div>
                    </el-tooltip>
                  </div>
                  <div class="bar-item server" :style="{ height: `${(trendData.server[index] / 6) * 100}%` }">
                    <el-tooltip :content="`服务器: ${trendData.server[index]}`" placement="top">
                      <div class="bar"></div>
                    </el-tooltip>
                  </div>
                  <div class="bar-item search" :style="{ height: `${(trendData.search[index] / 30) * 100}%` }">
                    <el-tooltip :content="`搜索: ${trendData.search[index]}`" placement="top">
                      <div class="bar"></div>
                    </el-tooltip>
                  </div>
                  <div class="bar-date">{{ date }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 最近操作 -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>最近操作</span>
            </div>
          </template>
          <div class="operations-list" v-loading="loading">
            <div 
              v-for="operation in recentOperations" 
              :key="operation.id"
              class="operation-item"
            >
              <div class="operation-icon" :class="operation.type">
                <el-icon v-if="operation.type === 'website'"><Link /></el-icon>
                <el-icon v-else-if="operation.type === 'domain'"><Location /></el-icon>
                <el-icon v-else-if="operation.type === 'server'"><Monitor /></el-icon>
                <el-icon v-else><Search /></el-icon>
              </div>
              <div class="operation-content">
                <div class="operation-action">{{ operation.action }}</div>
                <div class="operation-text">{{ operation.content }}</div>
                <div class="operation-time">{{ operation.time }}</div>
              </div>
            </div>
            <el-empty v-if="recentOperations.length === 0" description="暂无操作记录" :image-size="80" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <el-card shadow="never" class="quick-actions-card">
      <template #header>
        <div class="card-header">
          <span>快速操作</span>
        </div>
      </template>
      <div class="quick-actions">
        <el-button type="primary" @click="goToPage('/seo/keyword')">
          <el-icon><Search /></el-icon>
          网站关键字查询
        </el-button>
        <el-button type="success" @click="goToPage('/seo/domain')">
          <el-icon><Location /></el-icon>
          域名管理
        </el-button>
        <el-button type="warning" @click="goToPage('/seo/server')">
          <el-icon><Monitor /></el-icon>
          服务器管理
        </el-button>
        <el-button type="info" @click="goToPage('/seo/site-search')">
          <el-icon><Connection /></el-icon>
          站内搜索查询
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { get } from '@/net'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const statistics = reactive({
  websiteCount: 0,
  activeWebsiteCount: 0,
  domainCount: 0,
  expiringDomainCount: 0,
  serverCount: 0,
  onlineServerCount: 0,
  siteSearchCount: 0,
  todaySearchCount: 0
})

const recentOperations = ref([])
const trendData = reactive({
  website: [],
  domain: [],
  server: [],
  search: [],
  dateRange: []
})

// 计算当前日期
const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// 加载统计数据
function loadStatistics() {
  loading.value = true
  get('/api/seo/dashboard/statistics', (data) => {
    // 更新统计数据
    if (data.statistics) {
      Object.assign(statistics, data.statistics)
    }
    
    // 更新最近操作
    if (data.recentOperations) {
      recentOperations.value = data.recentOperations
    }
    
    // 更新趋势数据
    if (data.trendData) {
      Object.assign(trendData, data.trendData)
      if (data.dateRange) {
        trendData.dateRange = data.dateRange
      }
    }
    
    loading.value = false
  }, () => {
    loading.value = false
    ElMessage.error('加载统计数据失败')
  })
}

// 刷新数据
function refreshData() {
  loadStatistics()
  ElMessage.success('数据已刷新')
}

// 快速跳转
function goToPage(path) {
  router.push(path)
}

onMounted(() => {
  loadStatistics()
})
</script>

<style scoped>
.dashboard {
  width: 100%;
}

/* 欢迎卡片 */
.welcome-card {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.welcome-card :deep(.el-card__body) {
  padding: 30px;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text h2 {
  margin: 0 0 10px 0;
  color: white;
  font-size: 28px;
  font-weight: 600;
}

.welcome-text p {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
}

.welcome-icon {
  opacity: 0.3;
}

/* 统计卡片行 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  transition: all 0.3s;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  color: white;
}

.stat-icon.website {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.domain {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.server {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.search {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-detail {
  font-size: 12px;
  color: #c0c4cc;
}

/* 内容行 */
.content-row {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 图表容器 */
.chart-container {
  padding: 20px 0;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.website {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.legend-color.domain {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.legend-color.server {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.legend-color.search {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.chart-wrapper {
  height: 300px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.chart-bars {
  display: flex;
  gap: 15px;
  align-items: flex-end;
  height: 100%;
  width: 100%;
  justify-content: space-around;
}

.chart-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  flex: 1;
  max-width: 80px;
}

.bar-item {
  width: 100%;
  display: flex;
  justify-content: center;
  min-height: 20px;
}

.bar {
  width: 20px;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  transition: all 0.3s;
}

.bar-item.website .bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bar-item.domain .bar {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.bar-item.server .bar {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.bar-item.search .bar {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.bar-item:hover .bar {
  opacity: 0.8;
  transform: scaleY(1.05);
}

.bar-date {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  text-align: center;
}

/* 操作列表 */
.operations-list {
  max-height: 500px;
  overflow-y: auto;
}

.operation-item {
  display: flex;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.operation-item:last-child {
  border-bottom: none;
}

.operation-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
  flex-shrink: 0;
}

.operation-icon.website {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.operation-icon.domain {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.operation-icon.server {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.operation-icon.site-search {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.operation-content {
  flex: 1;
  min-width: 0;
}

.operation-action {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 5px;
}

.operation-text {
  font-size: 13px;
  color: #606266;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.operation-time {
  font-size: 12px;
  color: #909399;
}

/* 快速操作 */
.quick-actions-card {
  margin-bottom: 20px;
}

.quick-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.quick-actions .el-button {
  flex: 1;
  min-width: 150px;
  height: 50px;
  font-size: 15px;
}

/* 响应式 */
@media (max-width: 768px) {
  .welcome-content {
    flex-direction: column;
    text-align: center;
  }
  
  .welcome-icon {
    margin-top: 20px;
  }
  
  .chart-bars {
    gap: 8px;
  }
  
  .chart-bar-group {
    max-width: 40px;
  }
  
  .bar {
    width: 15px;
  }
  
  .quick-actions .el-button {
    min-width: 100%;
  }
}
</style>
