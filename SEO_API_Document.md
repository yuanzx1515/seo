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
| `/seo/keyword/query?domain={domain}` | GET | 查询域名在搜索引擎中的关键字排名 |

**响应 data**

```json
{
  "list": [
    {
      "keyword": "SEO 优化",
      "website": "example.com",
      "rank": 1,
      "url": "https://example.com/page1",
      "title": "示例页面",
      "updateTime": "2024-01-20 10:30:00"
    }
  ]
}
```

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

```json
Request: {
  "targetSite": "example.com",
  "searchSite": "zq.zhaopin.com"
}
Response data: {
  "results": [
    { "title": "示例页面", "url": "https://zq.zhaopin.com/xxx", "snippet": "搜索结果摘要", "time": "2024-03-20" }
  ]
}
```

---

## 6. 工具合集

当前前端所有工具（域名生成器等）均在浏览器本地计算，不依赖后台接口；如后续需要落库或统计，可在此模块补充 API。

---

## 7. 智联招聘发布

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

### 7.1 POST `/seo/zhaopin/publish`
```json
{
  "content": "动态正文",
  "images": ["https://example.com/img1.jpg"],
  "cookie": "zhaopin-cookie=xxx"
}
Response data: { "moment": { "id": 66024060, "content": "动态正文", ... }, "taskId": "task_1711000000000" }
```

### 7.2 GET `/seo/zhaopin/moments`
Query: `page=1&pageSize=10`
```json
Response data: {
  "list": [ { "id": 66024057, "content": "测试动态", "images": [], "createdTimeShow": "刚刚", "readNum": 0, "commentNum": 0, "likeNum": 0 } ],
  "total": 1,
  "page": 1,
  "pageSize": 10
}
```

### 7.3 DELETE `/seo/zhaopin/moment/{id}`
无请求体，路径参数 `id`。

### 7.4 GET `/seo/zhaopin/groups`
```json
Response data: {
  "list": [ { "id": 1, "name": "校园招聘组", "description": "用于跟进校园渠道", "createdAt": "2024-03-18 10:00:00", "linkCount": 12 } ]
}
```

### 7.5 POST `/seo/zhaopin/groups`
```json
{ "name": "深圳校招组", "description": "针对深圳校园招聘" }
```

### 7.6 DELETE `/seo/zhaopin/groups/{id}`
路径参数 `id`。

### 7.7 GET `/seo/zhaopin/groups/{groupId}/links`
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

### 7.8 POST `/seo/zhaopin/groups/{groupId}/links`
```json
{
  "url": "https://xiaoyuan.zhaopin.com/dynamic/66024060",
  "dynamicId": "66024060",
  "publishedAt": "2024-03-21T10:00:00Z"
}
```

### 7.9 POST `/seo/zhaopin/links/check`
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
