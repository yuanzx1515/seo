import axios from "axios";
import {ElMessage} from "element-plus";
import router from "@/router";
import { MOCK_ENABLED, MOCK_DELAY } from "@/config/mock";
import { websiteMockMap } from "@/mock/WebsiteMock";
import { backlinkMockMap } from "@/mock/BacklinkMock";
import { domainMockMap } from "@/mock/DomainMock";
import { serverMockMap } from "@/mock/ServerMock";
import { geoMockMap } from "@/mock/GeoMock";

const authItemName = "authorize"

// 合并所有Mock映射
const mockMap = {
  ...websiteMockMap,
  ...backlinkMockMap,
  ...domainMockMap,
  ...serverMockMap,
  ...geoMockMap
}

const accessHeader = () => {
    return {
        'Authorization': `Bearer ${takeAccessToken()}`
    }
}

const defaultError = (error) => {
    console.error(error)
    const status = error.response.status
    if (status === 429) {
        ElMessage.error(error.response.data.message)
    } else {
        ElMessage.error('发生了一些错误，请联系管理员')
    }
}

const defaultFailure = (message, status, url) => {
    console.warn(`请求地址: ${url}, 状态码: ${status}, 错误信息: ${message}`)
    ElMessage.warning(message)
}

function takeAccessToken() {
    const str = localStorage.getItem(authItemName) || sessionStorage.getItem(authItemName);
    if(!str) return null
    const authObj = JSON.parse(str)
    if(new Date(authObj.expire) <= new Date()) {
        deleteAccessToken()
        ElMessage.warning("登录状态已过期，请重新登录！")
        return null
    }
    return authObj.token
}

function storeAccessToken(remember, token, expire){
    const authObj = {
        token: token,
        expire: expire
    }
    const str = JSON.stringify(authObj)
    if(remember)
        localStorage.setItem(authItemName, str)
    else
        sessionStorage.setItem(authItemName, str)
}

function deleteAccessToken(redirect = false) {
    localStorage.removeItem(authItemName)
    sessionStorage.removeItem(authItemName)
    if(redirect) {
        router.push({ name: 'welcome-login' })
    }
}

/**
 * 查找匹配的Mock函数
 */
function findMockHandler(method, url) {
    // 先尝试精确匹配
    const exactKey = `${method} ${url}`
    if (mockMap[exactKey]) {
        return mockMap[exactKey]
    }
    
    // 尝试匹配带路径参数的URL（如 /api/seo/website/code/:id）
    for (const key in mockMap) {
        const [mockMethod, mockPath] = key.split(' ')
        if (mockMethod !== method) continue
        
        // 将路径参数转换为正则表达式
        const regexPath = mockPath.replace(/:[^/]+/g, '[^/]+')
        const regex = new RegExp(`^${regexPath}$`)
        if (regex.test(url)) {
            return mockMap[key]
        }
    }
    
    return null
}

/**
 * 从URL中提取路径参数
 */
function extractPathParams(method, url) {
    for (const key in mockMap) {
        const [mockMethod, mockPath] = key.split(' ')
        if (mockMethod !== method) continue
        
        // 将路径参数转换为正则表达式
        const regexPath = mockPath.replace(/:[^/]+/g, '([^/]+)')
        const regex = new RegExp(`^${regexPath}$`)
        const match = url.match(regex)
        
        if (match) {
            const paramNames = mockPath.match(/:[^/]+/g) || []
            const params = {}
            paramNames.forEach((name, index) => {
                const paramName = name.substring(1) // 去掉冒号
                params[paramName] = match[index + 1]
            })
            return params
        }
    }
    return {}
}

/**
 * 从URL中提取Query参数
 */
function extractQueryParams(url) {
    const params = {}
    const queryString = url.split('?')[1]
    if (queryString) {
        queryString.split('&').forEach(param => {
            const [key, value] = param.split('=')
            params[decodeURIComponent(key)] = decodeURIComponent(value || '')
        })
    }
    return params
}

/**
 * 执行Mock请求
 */
function executeMock(method, url, data, success, failure) {
    const handler = findMockHandler(method, url)
    if (!handler) {
        failure('未找到对应的Mock处理器', 404, url)
        return
    }
    
    // 提取路径参数和Query参数
    const pathParams = extractPathParams(method, url)
    const queryParams = extractQueryParams(url)
    const params = { ...pathParams, ...queryParams }
    
    // 模拟网络延迟
    setTimeout(() => {
        try {
            let result
            if (method === 'GET') {
                result = handler(params)
            } else {
                // POST请求合并路径参数和请求体数据
                result = handler({ ...params, ...(data || {}) })
            }
            
            // 处理响应
            if (result.code === 200) {
                success(result.data)
            } else if (result.code === 401) {
                failure('登录状态已过期，请重新登录！')
                deleteAccessToken(true)
            } else {
                failure(result.message, result.code, url)
            }
        } catch (error) {
            console.error('Mock执行错误:', error)
            failure('Mock数据执行出错', 500, url)
        }
    }, MOCK_DELAY)
}

function internalPost(url, data, headers, success, failure, error = defaultError){
    // 检查是否启用Mock
    if (MOCK_ENABLED && url.startsWith('/api/seo/')) {
        executeMock('POST', url, data, success, failure)
        return
    }
    
    axios.post(url, data, { headers: headers }).then(({data}) => {
        if(data.code === 200) {
            success(data.data)
        } else if(data.code === 401) {
            failure('登录状态已过期，请重新登录！')
            deleteAccessToken(true)
        } else {
            failure(data.message, data.code, url)
        }
    }).catch(err => error(err))
}

function internalGet(url, headers, success, failure, error = defaultError){
    // 检查是否启用Mock
    if (MOCK_ENABLED && url.startsWith('/api/seo/')) {
        executeMock('GET', url, null, success, failure)
        return
    }
    
    axios.get(url, { headers: headers }).then(({data}) => {
        if(data.code === 200) {
            success(data.data)
        } else if(data.code === 401) {
            failure('登录状态已过期，请重新登录！')
            deleteAccessToken(true)
        } else {
            failure(data.message, data.code, url)
        }
    }).catch(err => error(err))
}

function login(username, password, remember, success, failure = defaultFailure){
    internalPost('/api/auth/login', {
        username: username,
        password: password
    }, {
        'Content-Type': 'application/x-www-form-urlencoded'
    }, (data) => {
        storeAccessToken(remember, data.token, data.expire)
        ElMessage.success(`登录成功，欢迎 ${data.username} 来到我们的系统`)
        success(data)
    }, failure)
}

function post(url, data, success, failure = defaultFailure) {
    internalPost(url, data, accessHeader() , success, failure)
}

function logout(success, failure = defaultFailure){
    get('/api/auth/logout', () => {
        deleteAccessToken()
        ElMessage.success(`退出登录成功，欢迎您再次使用`)
        success()
    }, failure)
}

function get(url, success, failure = defaultFailure) {
    internalGet(url, accessHeader(), success, failure)
}

function unauthorized() {
    return !takeAccessToken()
}

export { post, get, login, logout, unauthorized }
