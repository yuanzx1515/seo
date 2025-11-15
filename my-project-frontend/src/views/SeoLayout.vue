<template>
  <div class="seo-layout">
    <el-container style="height: 100vh">
      <!-- 侧边栏 -->
      <el-aside width="250px" class="sidebar">
        <div class="logo">
          <h2>SEO管理系统</h2>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          background-color="transparent"
          text-color="#606266"
          active-text-color="#ffffff"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/seo/dashboard">
            <el-icon><Odometer /></el-icon>
            <span>工作台</span>
          </el-menu-item>
          <el-menu-item index="/seo/keyword">
            <el-icon><Search /></el-icon>
            <span>网站关键字查询</span>
          </el-menu-item>
          <el-menu-item index="/seo/domain">
            <el-icon><Location /></el-icon>
            <span>域名管理</span>
          </el-menu-item>
          <el-menu-item index="/seo/server">
            <el-icon><Monitor /></el-icon>
            <span>服务器管理</span>
          </el-menu-item>
          <el-menu-item index="/seo/site-search">
            <el-icon><Connection /></el-icon>
            <span>站内搜索查询</span>
          </el-menu-item>
          <el-menu-item index="/seo/tools">
            <el-icon><Setting /></el-icon>
            <span>工具合集</span>
          </el-menu-item>
          <el-menu-item index="/seo/zhaopin">
            <el-icon><EditPen /></el-icon>
            <span>智联招聘发布</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <el-header class="header">
          <div class="header-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/seo' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-button @click="handleLogout" type="danger" plain>退出登录</el-button>
          </div>
        </el-header>
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { logout } from '@/net'
// 图标已在main.js中全局注册，直接使用组件名
// 如果没有对应的图标，使用类似的替代

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)

const pageTitleMap = {
  '/seo/dashboard': '工作台',
  '/seo/keyword': '网站关键字查询',
  '/seo/domain': '域名管理',
  '/seo/server': '服务器管理',
  '/seo/site-search': '站内搜索查询',
  '/seo/tools': '工具合集',
  '/seo/zhaopin': '智联招聘发布'
}

const currentPageTitle = computed(() => {
  return pageTitleMap[route.path] || '首页'
})

function handleMenuSelect(index) {
  console.log('菜单选择:', index)
  router.push(index).catch(err => {
    console.error('菜单跳转失败:', err)
    if (err?.name !== 'NavigationDuplicated') {
      // 如果跳转失败且不是重复导航，尝试使用路由名称
      const routeNameMap = {
        '/seo/dashboard': 'seo-dashboard',
        '/seo/keyword': 'seo-keyword',
        '/seo/domain': 'seo-domain',
        '/seo/server': 'seo-server',
        '/seo/site-search': 'seo-site-search',
        '/seo/tools': 'seo-tools',
        '/seo/zhaopin': 'seo-zhaopin'
      }
      if (routeNameMap[index]) {
        router.push({ name: routeNameMap[index] }).catch(console.error)
      }
    }
  })
}

function handleLogout() {
  logout(() => router.push('/'))
}
</script>

<style scoped>
.seo-layout {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.sidebar {
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border-right: 1px solid #e4e7ed;
}

.logo {
  height: 70px;
  line-height: 70px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.logo h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
}

.sidebar-menu {
  border-right: none;
  height: calc(100vh - 70px);
  background: transparent;
}

/* 菜单项样式 */
:deep(.el-menu-item) {
  margin: 4px 8px;
  border-radius: 8px;
  height: 48px;
  line-height: 48px;
  transition: all 0.3s;
}

:deep(.el-menu-item:hover) {
  background-color: #f0f2f5 !important;
  color: #667eea !important;
  transform: translateX(4px);
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

:deep(.el-menu-item.is-active .el-icon) {
  color: white !important;
}

:deep(.el-menu-item .el-icon) {
  color: #606266;
  font-size: 18px;
}

.header {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  height: 64px;
}

.header-left {
  flex: 1;
}

:deep(.el-breadcrumb) {
  font-size: 14px;
}

:deep(.el-breadcrumb__inner) {
  color: #606266;
  font-weight: 400;
}

:deep(.el-breadcrumb__inner.is-link) {
  color: #667eea;
}

.header-right {
  display: flex;
  align-items: center;
}

.main-content {
  background: #f5f7fa;
  padding: 24px;
  min-height: calc(100vh - 64px);
  overflow-y: auto;
}
</style>

