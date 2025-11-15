# SEO 管理系统接口文档

> 统一响应格式：
>
> ```json
> {
>   "code": 200,
>   "message": "操作成功",
>   "data": {}
> }
> ```
>
> - `code = 200` 表示成功；400/401/403/404/500 分别表示参数错误、未授权、无权限、资源不存在、服务器错误。
> - 所有接口路径均默认以 `/api` 为前缀，下文省略。

## 0. 认证授权

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/auth/login` | POST | 用户登录（Spring Security 表单登录） |
| `/auth/logout` | POST | 用户登出 |
| `/auth/ask-code` | GET | 请求邮件验证码 |
| `/auth/register` | POST | 用户注册 |
| `/auth/reset-confirm` | POST | 密码重置确认（验证码校验） |
| `/auth/reset-password` | POST | 密码重置操作 |

### 0.1 POST `/auth/login`

Spring Security 表单登录接口，登录成功后返回 JWT Token。

**请求参数**

表单数据：
- `username`: 用户名或邮箱
- `password`: 密码

**响应示例**

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expire": "2024-03-21T10:30:00"
  }
}
```

### 0.2 POST `/auth/logout`

用户登出接口，清除认证信息。

### 0.3 GET `/auth/ask-code`

**请求参数**

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `email` | string | 是 | 邮箱地址 |
| `type` | string | 是 | 类型：`register`（注册）或 `reset`（重置密码） |

**请求示例**

```
GET /api/auth/ask-code?email=user@example.com&type=register
```

**响应示例**

```json
{
  "code": 200,
  "message": "验证码已发送",
  "data": null
}
```

### 0.4 POST `/auth/register`

**请求体**

```json
{
  "username": "testuser",
  "password": "password123",
  "email": "user@example.com",
  "code": "123456"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "注册成功",
  "data": null
}
```

### 0.5 POST `/auth/reset-confirm`

**请求体**

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "验证码正确",
  "data": null
}
```

### 0.6 POST `/auth/reset-password`

**请求体**

```json
{
  "email": "user@example.com",
  "code": "123456",
  "password": "newpassword123"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "密码重置成功",
  "data": null
}
```

---

## 1. 工作台（Dashboard）

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/seo/dashboard/statistics` | GET | 获取统计概览、七日趋势、最近操作 |

**响应 data 结构**

```json
{
  "statistics": {
    "websiteCount": 42,
    "activeWebsiteCount": 36,
    "domainCount": 128,
    "expiringDomainCount": 5,
    "serverCount": 12,
    "onlineServerCount": 11,
    "siteSearchCount": 530,
    "todaySearchCount": 34
  },
  "trendData": {
    "website": [12, 14, 15, 13, 16, 18, 17],
    "domain": [8, 7, 9, 8, 10, 9, 11],
    "server": [5, 5, 6, 6, 7, 7, 7],
    "search": [60, 55, 70, 68, 75, 80, 77],
    "dateRange": ["03-15", "03-16", "03-17", "03-18", "03-19", "03-20", "03-21"]
  },
  "recentOperations": [
    {
      "id": 1,
      "type": "domain",
      "action": "新增域名",
      "content": "添加 example.com",
      "time": "2024-03-20 10:30:00"
    }
  ]
}
```

---

## 2. 网站关键字查询

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/seo/keyword/query?url={url}` | GET | 查询网站的标题（title）和 Meta 描述（meta description） |

### 2.1 GET `/seo/keyword/query`

**请求参数**

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `url` | string | 是 | 网站URL，支持带协议（`https://example.com`）或不带协议（`example.com`），不带协议时默认使用 `https://` |

**请求示例**

```
GET /api/seo/keyword/query?url=example.com
GET /api/seo/keyword/query?url=https://www.example.com
```

**响应 data 结构**

```json
{
  "url": "https://example.com",
  "title": "网站标题",
  "metaDescription": "网站的描述信息"
}
```

**响应字段说明**

| 字段名 | 类型 | 说明 |
| --- | --- | --- |
| `url` | string | 规范化后的完整URL（自动添加协议） |
| `title` | string | 网站标题，从 `<title>` 标签提取，未找到时返回 `"未找到标题"` |
| `metaDescription` | string | Meta描述，从 `<meta name="description">` 标签提取，未找到时返回 `"未找到描述"` |

**成功响应示例**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "url": "https://example.com",
    "title": "Example Domain",
    "metaDescription": "This domain is for use in illustrative examples in documents."
  }
}
```

**错误响应示例**

```json
{
  "code": 400,
  "message": "URL参数不能为空",
  "data": null
}
```

```json
{
  "code": 500,
  "message": "无法访问网站: 404",
  "data": {
    "url": "https://example.com",
    "title": "",
    "metaDescription": ""
  }
}
```

**注意事项**

- 接口通过 CORS 代理服务获取网站内容，可能存在访问限制
- 如果网站无法访问或返回非 200 状态码，会返回错误信息
- 标题和描述通过正则表达式从 HTML 中提取，可能无法处理复杂的 HTML 结构

---

## 3. 域名管理

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/seo/domain/parse` | POST | 自动解析域名注册商、日期、DNS等 |
| `/seo/domain/add` | POST | 新增域名记录 |
| `/seo/domain/update` | POST | 更新域名记录 |
| `/seo/domain/delete` | POST | 删除域名（参数 `id`） |
| `/seo/domain/check` | POST | 检查域名状态（参数 `id`） |
| `/seo/domain/list` | GET | 分页搜索域名 `page` `size` `keyword` `status` |

### 3.1 POST `/seo/domain/parse`
```json
Request: { "domain": "example.com" }
Response data: {
  "registrar": "GoDaddy",
  "registerDate": "2018-03-20",
  "expireDate": "2025-03-20",
  "dns": ["ns1.example.com", "ns2.example.com"],
  "status": "normal"
}
```

### 3.2 POST `/seo/domain/add|update`
```json
{
  "id": 1,              // update 时必填
  "domain": "example.com",
  "registrar": "GoDaddy",
  "registerDate": "2018-03-20",
  "expireDate": "2025-03-20",
  "dns": "ns1.example.com,ns2.example.com",
  "status": "normal",     // normal | expiring | expired
  "sourceWebsite": "https://source.com"
}
```

### 3.3 POST `/seo/domain/delete`
```json
{ "id": 1 }
```

### 3.4 POST `/seo/domain/check`
```json
Request: { "id": 1 }
Response data: { "status": "expiring", "daysLeft": 18 }
```

### 3.5 GET `/seo/domain/list`
Query: `page=1&size=10&keyword=example&status=normal`
```json
Response data: {
  "list": [ { "id": 1, "domain": "example.com", "registrar": "GoDaddy", "registerDate": "2018-03-20", "expireDate": "2025-03-20", "dns": "ns1.example.com,ns2.example.com", "status": "normal", "sourceWebsite": "https://source.com" } ],
  "total": 1,
  "page": 1,
  "size": 10
}
```

---

## 4. 服务器管理

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/seo/server/add` | POST | 添加服务器 |
| `/seo/server/update` | POST | 更新服务器 |
| `/seo/server/delete` | POST | 删除服务器（参数 `id`） |
| `/seo/server/list` | GET | 分页查询服务器 `page` `size` `keyword` |

### 4.1 POST `/seo/server/add|update`
```json
{
  "id": 1,                 // update 时必填
  "name": "香港节点",
  "ip": "192.168.1.1",
  "panelUrl": "https://panel.example.com",
  "panelPassword": "abc123456",
  "region": "香港"
}
```

### 4.2 POST `/seo/server/delete`
```json
{ "id": 1 }
```

### 4.3 GET `/seo/server/list`
Query: `page=1&size=10&keyword=香港`
```json
Response data: {
  "list": [
    { "id": 1, "name": "香港节点", "ip": "192.168.1.1", "panelUrl": "https://panel.example.com", "panelPassword": "******", "region": "香港" }
  ],
  "total": 1,
  "page": 1,
  "size": 10
}
```

---

## 5. 站内搜索查询

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/seo/site-search/query` | POST | 后端代理百度站内搜索，避免前端 CORS |

### 5.1 POST `/seo/site-search/query`

**请求体**

```json
{
  "targetSite": "example.com",
  "searchSite": "zq.zhaopin.com"
}
```

**请求参数说明**

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `targetSite` | string | 是 | 要搜索的目标网站域名 |
| `searchSite` | string | 是 | 在哪个网站内搜索（如：zq.zhaopin.com） |

**响应 data 结构**

```json
{
  "results": [
    {
      "title": "示例页面",
      "url": "https://zq.zhaopin.com/xxx",
      "snippet": "搜索结果摘要",
      "time": "2024-03-20"
    }
  ]
}
```

**响应字段说明**

| 字段名 | 类型 | 说明 |
| --- | --- | --- |
| `results` | array | 搜索结果列表 |
| `results[].title` | string | 搜索结果标题 |
| `results[].url` | string | 搜索结果URL |
| `results[].snippet` | string | 搜索结果摘要 |
| `results[].time` | string | 结果时间 |

---

## 6. 网站管理

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/seo/website/analyze` | POST | 分析网站获取关键词 |
| `/seo/website/add` | POST | 新增网站记录 |
| `/seo/website/update` | POST | 更新网站记录 |
| `/seo/website/delete` | POST | 删除网站（参数 `id`） |
| `/seo/website/list` | GET | 分页查询网站 `page` `size` `keyword` |
| `/seo/website/code/{id}` | GET | 获取网站代码（HTML 和关键词标签） |

### 6.1 POST `/seo/website/analyze`

**请求体**

```json
{
  "url": "https://example.com"
}
```

**响应 data 结构**

```json
{
  "title": "网站标题",
  "keywords": ["SEO优化", "网站建设", "搜索引擎"],
  "description": "网站描述信息"
}
```

### 6.2 POST `/seo/website/add|update`

**请求体**

```json
{
  "id": 1,                    // update 时必填
  "url": "https://example.com",
  "title": "示例网站 - 专业服务提供商",
  "keywords": "SEO优化,网站建设,搜索引擎优化",
  "status": "active"          // active | inactive
}
```

### 6.3 POST `/seo/website/delete`

```json
{ "id": 1 }
```

### 6.4 GET `/seo/website/list`

Query: `page=1&size=10&keyword=example`

**响应 data 结构**

```json
{
  "list": [
    {
      "id": 1,
      "url": "https://example.com",
      "title": "示例网站 - 专业服务提供商",
      "keywords": "SEO优化,网站建设,搜索引擎优化",
      "status": "active",
      "createTime": "2024-01-15 10:30:00"
    }
  ],
  "total": 1,
  "page": 1,
  "size": 10
}
```

### 6.5 GET `/seo/website/code/{id}`

路径参数 `id` 为网站ID。

**响应 data 结构**

```json
{
  "html": "<!DOCTYPE html>...",
  "keywords": "<meta name=\"keywords\" content=\"SEO优化,网站建设\">"
}
```

---

## 7. 外链管理

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/seo/backlink/add` | POST | 添加外链 |
| `/seo/backlink/update` | POST | 更新外链 |
| `/seo/backlink/delete` | POST | 删除外链（参数 `id`） |
| `/seo/backlink/list` | GET | 分页查询外链 `page` `size` `keyword` `status` |
| `/seo/backlink/check` | POST | 检查外链状态（参数 `id`） |

### 7.1 POST `/seo/backlink/add|update`

**请求体**

```json
{
  "id": 1,                    // update 时必填
  "url": "https://www.example.com/article1",
  "anchorText": "SEO优化服务",
  "targetUrl": "https://www.target.com",
  "domain": "example.com",
  "type": "dofollow",         // dofollow | nofollow
  "status": "active"          // active | inactive
}
```

### 7.2 POST `/seo/backlink/delete`

```json
{ "id": 1 }
```

### 7.3 GET `/seo/backlink/list`

Query: `page=1&size=10&keyword=example&status=active`

**响应 data 结构**

```json
{
  "list": [
    {
      "id": 1,
      "url": "https://www.example.com/article1",
      "anchorText": "SEO优化服务",
      "targetUrl": "https://www.target.com",
      "domain": "example.com",
      "type": "dofollow",
      "status": "active",
      "createTime": "2024-01-15 10:30:00"
    }
  ],
  "total": 1,
  "page": 1,
  "size": 10
}
```

### 7.4 POST `/seo/backlink/check`

```json
{ "id": 1 }
```

**响应 data 结构**

```json
{
  "id": 1,
  "status": "active",
  "checkTime": "2024-01-15 10:35:00"
}
```

---

## 8. GEO 管理

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/seo/geo/add` | POST | 添加 GEO 配置 |
| `/seo/geo/update` | POST | 更新 GEO 配置 |
| `/seo/geo/delete` | POST | 删除 GEO 配置（参数 `id`） |
| `/seo/geo/list` | GET | 分页查询 GEO 配置 `page` `size` `keyword` `country` |

### 8.1 POST `/seo/geo/add|update`

**请求体**

```json
{
  "id": 1,                    // update 时必填
  "country": "中国",
  "countryCode": "CN",
  "ip": "116.30.45.123",
  "location": "北京市",
  "latitude": 39.9042,
  "longitude": 116.4074,
  "timezone": "Asia/Shanghai",
  "isp": "中国电信",
  "status": "active"          // active | inactive
}
```

### 8.2 POST `/seo/geo/delete`

```json
{ "id": 1 }
```

### 8.3 GET `/seo/geo/list`

Query: `page=1&size=10&keyword=北京&country=CN`

**响应 data 结构**

```json
{
  "list": [
    {
      "id": 1,
      "country": "中国",
      "countryCode": "CN",
      "ip": "116.30.45.123",
      "location": "北京市",
      "latitude": 39.9042,
      "longitude": 116.4074,
      "timezone": "Asia/Shanghai",
      "isp": "中国电信",
      "status": "active",
      "createTime": "2024-01-15 10:30:00"
    }
  ],
  "total": 1,
  "page": 1,
  "size": 10,
  "statistics": {
    "total": 1,
    "active": 1,
    "countries": 1,
    "ips": 1
  }
}
```

---

## 9. 工具合集

当前前端所有工具（域名生成器等）均在浏览器本地计算，不依赖后台接口；如后续需要落库或统计，可在此模块补充 API。

---

## 10. 智联招聘发布

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/seo/zhaopin/publish` | POST | 发布动态，携带 Cookie |
| `/seo/zhaopin/moments` | GET | 分页获取已发布动态 |
| `/seo/zhaopin/moment/{id}` | DELETE | 删除动态 |
| `/seo/zhaopin/groups` | GET | 获取分组列表 |
| `/seo/zhaopin/groups` | POST | 创建分组 |
| `/seo/zhaopin/groups/{id}` | DELETE | 删除分组 |
| `/seo/zhaopin/groups/{groupId}/links` | GET | 分组下动态链接列表 |
| `/seo/zhaopin/groups/{groupId}/links` | POST | 手动添加动态链接 |
| `/seo/zhaopin/links/check` | POST | 检测动态链接状态 |

### 10.1 POST `/seo/zhaopin/publish`
```json
{
  "content": "动态正文",
  "images": ["https://example.com/img1.jpg"],
  "cookie": "zhaopin-cookie=xxx"
}
Response data: { "moment": { "id": 66024060, "content": "动态正文", ... }, "taskId": "task_1711000000000" }
```

### 10.2 GET `/seo/zhaopin/moments`
Query: `page=1&pageSize=10`
```json
Response data: {
  "list": [ { "id": 66024057, "content": "测试动态", "images": [], "createdTimeShow": "刚刚", "readNum": 0, "commentNum": 0, "likeNum": 0 } ],
  "total": 1,
  "page": 1,
  "pageSize": 10
}
```

### 10.3 DELETE `/seo/zhaopin/moment/{id}`
无请求体，路径参数 `id`。

### 10.4 GET `/seo/zhaopin/groups`
```json
Response data: {
  "list": [ { "id": 1, "name": "校园招聘组", "description": "用于跟进校园渠道", "createdAt": "2024-03-18 10:00:00", "linkCount": 12 } ]
}
```

### 10.5 POST `/seo/zhaopin/groups`
```json
{ "name": "深圳校招组", "description": "针对深圳校园招聘" }
```

### 10.6 DELETE `/seo/zhaopin/groups/{id}`
路径参数 `id`。

### 10.7 GET `/seo/zhaopin/groups/{groupId}/links`
```json
Response data: {
  "list": [
    {
      "id": 1,
      "groupId": 1,
      "url": "https://xiaoyuan.zhaopin.com/dynamic/66024057",
      "dynamicId": "66024057",
      "publishedAtShow": "2024-03-20 10:00:00",
      "lastCheckedAtShow": "2024-03-20 10:10:00",
      "status": "valid",
      "reason": "检测通过，链接有效",
      "isValid": true
    }
  ]
}
```

### 10.8 POST `/seo/zhaopin/groups/{groupId}/links`
```json
{
  "url": "https://xiaoyuan.zhaopin.com/dynamic/66024060",
  "dynamicId": "66024060",
  "publishedAt": "2024-03-21T10:00:00Z"
}
```

### 10.9 POST `/seo/zhaopin/links/check`
```json
{ "linkId": 1 }
Response data: {
  "id": 1,
  "status": "valid",
  "reason": "检测通过，链接有效",
  "lastCheckedAtShow": "2024-03-21 10:05:00"
}
```

---

> **注意**：
> - 工具合集暂无后端请求；若未来接入，请在本文档新增相关接口。
> - 当前前端默认启用 Mock（`src/config/mock.js`），如需对接真实后端，请按上述接口实现服务端逻辑并关闭 Mock。
