<template>
  <div class="keyword-query">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>网站关键字查询</span>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-input
          v-model="searchUrl"
          placeholder="输入网站URL（如：example.com 或 https://example.com）"
          style="width: 500px; margin-right: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch" :loading="searching">
          <el-icon><Search /></el-icon>
          查询
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <!-- 查询结果 -->
      <div v-if="websiteInfo" class="results-area">
        <el-divider>查询结果</el-divider>
        <el-descriptions :column="1" border style="margin-top: 20px">
          <el-descriptions-item label="网站URL">
            <el-link :href="websiteInfo.url" target="_blank" type="primary">
              {{ websiteInfo.url }}
            </el-link>
          </el-descriptions-item>
          <el-descriptions-item label="网站标题">
            <span :class="{ 'text-placeholder': !websiteInfo.title || websiteInfo.title === '未找到标题' }">
              {{ websiteInfo.title || '未找到标题' }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="Meta描述">
            <span :class="{ 'text-placeholder': !websiteInfo.metaDescription || websiteInfo.metaDescription === '未找到描述' }">
              {{ websiteInfo.metaDescription || '未找到描述' }}
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="!searching && !websiteInfo && hasSearched" description="暂无查询结果" />
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { get } from '@/net'

const searchUrl = ref('')
const searching = ref(false)
const websiteInfo = ref(null)
const hasSearched = ref(false)

function handleSearch() {
  if (!searchUrl.value.trim()) {
    ElMessage.warning('请输入网站URL')
    return
  }
  
  searching.value = true
  hasSearched.value = true
  websiteInfo.value = null
  
  // 调用API查询网站信息
  get(`/api/seo/keyword/query?url=${encodeURIComponent(searchUrl.value)}`, (data) => {
    websiteInfo.value = data
    ElMessage.success('查询完成')
    searching.value = false
  }, (message) => {
    ElMessage.error(message || '查询失败')
    searching.value = false
  })
}

function handleReset() {
  searchUrl.value = ''
  websiteInfo.value = null
  hasSearched.value = false
}
</script>

<style scoped>
.keyword-query {
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

.results-area {
  margin-top: 24px;
}

.text-placeholder {
  color: #909399;
  font-style: italic;
}
</style>





