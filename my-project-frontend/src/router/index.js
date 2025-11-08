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
            component: () => import('@/views/IndexView.vue'),
        }, {
            path: '/seo',
            name: 'seo',
            component: () => import('@/views/SeoLayout.vue'),
            redirect: '/seo/keyword',
            children: [
                {
                    path: 'keyword',
                    name: 'seo-keyword',
                    component: () => import('@/views/seo/KeywordQuery.vue')
                }, {
                    path: 'trace',
                    name: 'seo-trace',
                    component: () => import('@/views/seo/WebsiteTrace.vue')
                }, {
                    path: 'domain',
                    name: 'seo-domain',
                    component: () => import('@/views/seo/DomainManage.vue')
                }, {
                    path: 'server',
                    name: 'seo-server',
                    component: () => import('@/views/seo/ServerManage.vue')
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
        next('/index')
    } else if((to.fullPath.startsWith('/index') || to.fullPath.startsWith('/seo')) && isUnauthorized) {
        next('/')
    } else {
        next()
    }
    */
})

export default router
