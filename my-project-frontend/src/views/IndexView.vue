<template>
  <div class="index-view">
    <!-- 顶部导航栏 -->
    <div class="header-nav">
      <div class="nav-left">
        <h2 class="logo">SEO管理系统</h2>
      </div>
      <div class="nav-right">
        <el-button @click="userLogout" type="danger" plain>退出登录</el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-container">
      <div class="welcome-section">
        <h1 class="welcome-title">欢迎使用SEO管理系统</h1>
        <p class="welcome-subtitle">请选择要进入的功能模块</p>
      </div>

      <!-- 功能卡片区域 -->
      <div class="function-cards">
        <div 
          class="function-card" 
          @click.stop="goToSeo"
          @keyup.enter="goToSeo"
          role="button"
          tabindex="0"
        >
          <div class="card-icon-wrapper">
            <el-icon :size="60" class="card-icon">
              <Link />
            </el-icon>
          </div>
          <div class="card-content">
            <h3 class="card-title">SEO管理系统</h3>
            <div class="card-features">
              <el-tag size="small" class="feature-tag">网站管理</el-tag>
              <el-tag size="small" class="feature-tag">外链管理</el-tag>
              <el-tag size="small" class="feature-tag">域名管理</el-tag>
              <el-tag size="small" class="feature-tag">服务器管理</el-tag>
              <el-tag size="small" class="feature-tag">GEO功能</el-tag>
            </div>
            <p class="card-description">全面的SEO工具集，帮助您高效管理网站优化工作</p>
          </div>
          <div class="card-footer">
            <span class="enter-text">点击进入 →</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { logout } from '@/net'
import { Link } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

function userLogout() {
  logout(() => {
    router.push("/")
  }, () => {
    // 如果logout失败，也跳转到登录页
    router.push("/")
  })
}

function goToSeo(event) {
  console.log('=== 点击事件触发 ===', event)
  
  // 阻止默认行为和事件冒泡
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  // 直接使用router.push，Vue Router会自动处理
  console.log('开始跳转到 /seo')
  router.push('/seo')
    .then(() => {
      console.log('✅ 跳转成功')
    })
    .catch(err => {
      console.error('❌ 跳转失败:', err)
      console.error('错误详情:', {
        name: err?.name,
        message: err?.message,
        stack: err?.stack
      })
      
      // 如果是重复导航，忽略
      if (err?.name === 'NavigationDuplicated') {
        console.log('已在目标路由，忽略重复导航')
        return
      }
      
      // 其他错误，使用location作为备用
      console.log('尝试使用 window.location 跳转')
      setTimeout(() => {
        window.location.href = '/seo'
      }, 100)
    })
}
</script>

<style scoped>
.index-view {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
  margin: 0;
}

.header-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-left {
  flex: 1;
}

.logo {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.nav-right {
  display: flex;
  align-items: center;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 60px;
}

.welcome-title {
  font-size: 48px;
  font-weight: bold;
  color: white;
  margin: 0 0 20px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.welcome-subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.function-cards {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 30px;
}

.function-card {
  width: 380px;
  background: white;
  border-radius: 16px;
  padding: 40px 30px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  pointer-events: auto;
}

.function-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.function-card:hover {
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  transform: translateY(-8px) scale(1.02);
}

.card-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.card-icon {
  color: #409EFF;
  filter: drop-shadow(0 4px 8px rgba(64, 158, 255, 0.3));
}

.card-content {
  text-align: center;
}

.card-title {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 20px 0;
}

.card-features {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.feature-tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 4px 12px;
}

.card-description {
  font-size: 14px;
  color: #909399;
  line-height: 1.8;
  margin: 0 0 20px 0;
}

.card-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.enter-text {
  font-size: 16px;
  color: #409EFF;
  font-weight: 500;
  transition: all 0.3s;
}

.function-card:hover .enter-text {
  color: #667eea;
  transform: translateX(5px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-title {
    font-size: 36px;
  }
  
  .welcome-subtitle {
    font-size: 18px;
  }
  
  .function-card {
    width: 100%;
    max-width: 380px;
  }
  
  .header-nav {
    padding: 15px 20px;
  }
  
  .logo {
    font-size: 20px;
  }
}
</style>
