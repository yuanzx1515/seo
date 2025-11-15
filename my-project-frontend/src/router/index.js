import { createRouter, createWebHistory } from 'vue-router'
import { unauthorized } from "@/net";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'welcome',
            component: () => import('@/views/WelcomeView.vue'),
            children: [
                {
                    path: '',
                    name: 'welcome-login',
                    component: () => import('@/views/welcome/LoginPage.vue')
                }, {
                    path: 'register',
                    name: 'welcome-register',
                    component: () => import('@/views/welcome/RegisterPage.vue')
                }, {
                    path: 'forget',
                    name: 'welcome-forget',
                    component: () => import('@/views/welcome/ForgetPage.vue')
                }
            ]
        }, {
            path: '/index',
            name: 'index',
            redirect: '/seo'
        }, {
            path: '/seo',
            name: 'seo',
            component: () => import('@/views/SeoLayout.vue'),
            redirect: '/seo/dashboard',
            children: [
                {
                    path: 'dashboard',
                    name: 'seo-dashboard',
                    component: () => import('@/views/seo/Dashboard.vue')
                }, {
                    path: 'keyword',
                    name: 'seo-keyword',
                    component: () => import('@/views/seo/KeywordQuery.vue')
                }, {
                    path: 'domain',
                    name: 'seo-domain',
                    component: () => import('@/views/seo/DomainManage.vue')
                }, {
                    path: 'server',
                    name: 'seo-server',
                    component: () => import('@/views/seo/ServerManage.vue')
                }, {
                    path: 'site-search',
                    name: 'seo-site-search',
                    component: () => import('@/views/seo/SiteSearch.vue')
                }, {
                    path: 'tools',
                    name: 'seo-tools',
                    component: () => import('@/views/seo/Tools.vue')
                }, {
                    path: 'zhaopin',
                    name: 'seo-zhaopin',
                    component: () => import('@/views/seo/ZhaopinPublish.vue')
                }
            ]
        }
    ]
})

router.beforeEach((to, from, next) => {
    // 暂时禁用登录检查，方便浏览前端项目
    // 如需启用登录验证，取消下面的注释，并注释掉 next() 部分
    next()
    
    /* 登录验证逻辑（暂时禁用）
    const isUnauthorized = unauthorized()
    if(to.name.startsWith('welcome') && !isUnauthorized) {
        next('/seo')
    } else if(to.fullPath.startsWith('/seo') && isUnauthorized) {
        next('/')
    } else {
        next()
    }
    */
})

export default router
