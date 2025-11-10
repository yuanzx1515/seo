<template>
  <div class="site-search">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>百度站内搜索查询</span>
        </div>
      </template>

      <!-- 查询区域 -->
      <div class="search-area">
        <div class="form-item">
          <label class="form-label">目标网站:</label>
          <el-input
            v-model="targetSite"
            placeholder="请输入目标网站，例如：example.com"
            style="width: 100%"
            clearable
          >
            <template #prefix>
              <el-icon><Link /></el-icon>
            </template>
          </el-input>
          <div class="form-hint">第一个网站是目标网站</div>
        </div>

        <div class="form-item">
          <label class="form-label">查询网站:</label>
          <el-input
            v-model="searchSite"
            placeholder="请输入要查询的网站，例如：zq.zhaopin.com"
            style="width: 100%"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <div class="form-hint">查询该网站有没有这个网站的文本记录，cc=zq.zhaopin.com</div>
        </div>

        <div class="button-area">
          <el-button 
            type="primary" 
            @click="handleSearch" 
            :loading="searching"
            size="large"
          >
            <el-icon><Search /></el-icon>
            开始查询
          </el-button>
          <el-button @click="handleReset" size="large">重置</el-button>
        </div>
      </div>

      <!-- 查询结果 -->
      <div v-if="searchResults.length > 0" class="results-area">
        <el-divider>
          <span>查询结果 (共 {{ searchResults.length }} 条)</span>
        </el-divider>
        
        <div class="results-list">
          <div 
            v-for="(result, index) in searchResults" 
            :key="index"
            class="result-item"
          >
            <div class="result-header">
              <el-link 
                :href="result.url" 
                target="_blank" 
                type="primary"
                class="result-title"
              >
                {{ result.title }}
              </el-link>
              <el-tag size="small" type="info">{{ index + 1 }}</el-tag>
            </div>
            <div class="result-url">{{ result.url }}</div>
            <div class="result-snippet" v-html="result.snippet"></div>
            <div class="result-meta">
              <span class="result-time">{{ result.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty 
        v-if="!searching && searchResults.length === 0 && hasSearched" 
        description="未找到相关记录"
      />

      <!-- 加载状态 -->
      <div v-if="searching" class="loading-area">
        <el-skeleton :rows="5" animated />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Link } from '@element-plus/icons-vue'
import { get, post } from '@/net'

const targetSite = ref('')
const searchSite = ref('zq.zhaopin.com')
const searching = ref(false)
const searchResults = ref([])
const hasSearched = ref(false)

// 验证网站格式
function validateSite(site) {
  if (!site || !site.trim()) {
    return false
  }
  // 简单的域名格式验证
  const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
  return domainPattern.test(site.trim())
}

// 解析百度站内搜索结果
function parseBaiduSiteSearchResults(html) {
  const results = []
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  
  // 查找搜索结果项
  const resultItems = doc.querySelectorAll('.result, .c-result, .result-item, .g')
  
  resultItems.forEach((item, index) => {
    try {
      // 提取标题和链接
      const titleElement = item.querySelector('h3 a, .t a, .c-title-text, a[href]')
      const title = titleElement ? titleElement.textContent.trim() : ''
      const url = titleElement ? titleElement.getAttribute('href') : ''
      
      // 提取摘要
      const snippetElement = item.querySelector('.c-abstract, .c-span9, .c-content, .s')
      let snippet = snippetElement ? snippetElement.textContent.trim() : ''
      
      // 提取时间
      const timeElement = item.querySelector('.c-showurl, .c-gray, .c-time')
      const time = timeElement ? timeElement.textContent.trim() : ''
      
      if (title && url) {
        results.push({
          title: title,
          url: url,
          snippet: snippet || '暂无摘要',
          time: time || ''
        })
      }
    } catch (error) {
      console.error('解析结果项失败:', error)
    }
  })
  
  // 如果上面的选择器没有找到结果，尝试其他方式
  if (results.length === 0) {
    // 尝试查找所有链接
    const links = doc.querySelectorAll('a[href]')
    links.forEach((link, index) => {
      const href = link.getAttribute('href')
      const text = link.textContent.trim()
      
      // 过滤掉一些明显不是搜索结果的链接
      if (href && text && 
          !href.includes('javascript:') && 
          !href.includes('#') &&
          (href.startsWith('http://') || href.startsWith('https://'))) {
        results.push({
          title: text,
          url: href,
          snippet: '',
          time: ''
        })
      }
    })
  }
  
  return results
}

async function handleSearch() {
  // 验证输入
  if (!targetSite.value.trim()) {
    ElMessage.warning('请输入目标网站')
    return
  }
  
  if (!searchSite.value.trim()) {
    ElMessage.warning('请输入查询网站')
    return
  }

  // 验证网站格式
  if (!validateSite(targetSite.value.trim())) {
    ElMessage.warning('目标网站格式不正确，请输入正确的域名，例如：example.com')
    return
  }

  if (!validateSite(searchSite.value.trim())) {
    ElMessage.warning('查询网站格式不正确，请输入正确的域名，例如：zq.zhaopin.com')
    return
  }

  searching.value = true
  hasSearched.value = true
  searchResults.value = []

  try {
    // 构建百度站内搜索URL
    // 格式：https://zhannei.baidu.com/cse/site?q=网站=1&cc=查询的网站
    const searchUrl = `https://zhannei.baidu.com/cse/site?q=${encodeURIComponent(targetSite.value.trim())}=1&cc=${encodeURIComponent(searchSite.value.trim())}`
    
    // 先尝试通过后端API调用（推荐方式，避免CORS问题）
    const queryParams = {
      targetSite: targetSite.value.trim(),
      searchSite: searchSite.value.trim()
    }

    // 调用后端API
    post('/api/seo/site-search/query', queryParams, (data) => {
      searchResults.value = data.results || []
      if (searchResults.value.length === 0) {
        ElMessage.info('未找到相关记录')
      } else {
        ElMessage.success(`查询完成，找到 ${searchResults.value.length} 条记录`)
      }
      searching.value = false
    }, async (message) => {
      // 如果后端API失败，尝试直接调用百度站内搜索
      console.log('后端API调用失败，尝试直接调用百度站内搜索:', message)
      
      try {
        // 使用fetch直接调用（可能遇到CORS问题）
        const response = await fetch(searchUrl, {
          method: 'GET',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          mode: 'cors'
        })
        
        if (response.ok) {
          const html = await response.text()
          const parsedResults = parseBaiduSiteSearchResults(html)
          searchResults.value = parsedResults
          
          if (parsedResults.length === 0) {
            ElMessage.info('未找到相关记录')
          } else {
            ElMessage.success(`查询完成，找到 ${parsedResults.length} 条记录`)
          }
        } else {
          throw new Error('请求失败')
        }
      } catch (error) {
        console.error('直接调用百度站内搜索失败:', error)
        // 如果直接调用也失败，尝试使用代理
        try {
          // 使用CORS代理服务（示例）
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(searchUrl)}`
          const proxyResponse = await fetch(proxyUrl)
          const proxyData = await proxyResponse.json()
          
          if (proxyData.contents) {
            const parsedResults = parseBaiduSiteSearchResults(proxyData.contents)
            searchResults.value = parsedResults
            
            if (parsedResults.length === 0) {
              ElMessage.info('未找到相关记录')
            } else {
              ElMessage.success(`查询完成，找到 ${parsedResults.length} 条记录`)
            }
          } else {
            throw new Error('代理服务返回数据格式错误')
          }
        } catch (proxyError) {
          console.error('使用代理服务也失败:', proxyError)
          ElMessage.error('查询失败，请检查网络连接或联系管理员')
        }
      }
      
      searching.value = false
    })
  } catch (error) {
    console.error('查询出错:', error)
    ElMessage.error('查询失败，请稍后重试')
    searching.value = false
  }
}

function handleReset() {
  targetSite.value = ''
  searchSite.value = 'zq.zhaopin.com'
  searchResults.value = []
  hasSearched.value = false
}
</script>

<style scoped>
.site-search {
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
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.form-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

.button-area {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}

.results-area {
  margin-top: 24px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}

.result-item:hover {
  background: #f0f2f5;
  border-color: #c0c4cc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.result-title {
  font-size: 16px;
  font-weight: 500;
  flex: 1;
  margin-right: 12px;
  word-break: break-all;
}

.result-url {
  font-size: 13px;
  color: #0c9a4a;
  margin-bottom: 8px;
  word-break: break-all;
}

.result-snippet {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
  word-break: break-word;
}

.result-snippet :deep(em) {
  color: #f56c6c;
  font-weight: 500;
  font-style: normal;
  background: #fef0f0;
  padding: 0 2px;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.loading-area {
  margin-top: 24px;
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-item {
    margin-bottom: 16px;
  }

  .button-area {
    flex-direction: column;
  }

  .button-area .el-button {
    width: 100%;
  }

  .result-item {
    padding: 12px;
  }

  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>

