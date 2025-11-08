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
          v-model="searchDomain"
          placeholder="输入域名进行查询"
          style="width: 400px; margin-right: 10px"
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
      <div v-if="searchResults.length > 0" class="results-area">
        <el-divider>查询结果</el-divider>
        <el-table :data="searchResults" style="width: 100%; margin-top: 20px" v-loading="searching">
          <el-table-column prop="keyword" label="关键字" min-width="150" />
          <el-table-column prop="website" label="网站" min-width="200" />
          <el-table-column prop="rank" label="排名" width="100" />
          <el-table-column prop="url" label="URL" min-width="250" />
          <el-table-column prop="title" label="标题" min-width="200" />
          <el-table-column prop="updateTime" label="更新时间" width="180" />
        </el-table>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="!searching && searchResults.length === 0 && hasSearched" description="暂无查询结果" />
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { get } from '@/net'

const searchDomain = ref('')
const searching = ref(false)
const searchResults = ref([])
const hasSearched = ref(false)

function handleSearch() {
  if (!searchDomain.value.trim()) {
    ElMessage.warning('请输入域名')
    return
  }
  
  searching.value = true
  hasSearched.value = true
  
  // 使用Mock数据或API
  get(`/api/seo/keyword/query?domain=${encodeURIComponent(searchDomain.value)}`, (data) => {
    searchResults.value = data.list || []
    ElMessage.success('查询完成')
    searching.value = false
  }, () => {
    // Mock数据
    setTimeout(() => {
      searchResults.value = [
        {
          keyword: '示例关键词1',
          website: searchDomain.value,
          rank: 1,
          url: `https://${searchDomain.value}/page1`,
          title: '搜索结果标题1',
          updateTime: '2024-01-20 10:30:00'
        },
        {
          keyword: '示例关键词2',
          website: searchDomain.value,
          rank: 2,
          url: `https://${searchDomain.value}/page2`,
          title: '搜索结果标题2',
          updateTime: '2024-01-20 10:30:00'
        }
      ]
      searching.value = false
      ElMessage.success('查询完成')
    }, 1000)
  })
}

function handleReset() {
  searchDomain.value = ''
  searchResults.value = []
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
</style>





