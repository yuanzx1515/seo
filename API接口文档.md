# SEO管理系统 API 接口文档

## 基础信息

- **Base URL**: `/api`
- **认证方式**: Bearer Token (JWT)
- **请求格式**: JSON
- **响应格式**: JSON

## 通用响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

### 状态码说明

- `200`: 操作成功
- `400`: 请求参数错误
- `401`: 未授权或Token过期
- `403`: 无权限访问
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 1. SEO网站管理接口

### 1.1 分析网站获取关键词

**接口地址**: `POST /api/seo/website/analyze`

**请求参数**:
```json
{
  "url": "https://example.com"
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "分析成功",
  "data": {
    "title": "网站标题",
    "keywords": ["关键词1", "关键词2", "关键词3"],
    "description": "网站描述"
  }
}
```

### 1.2 添加网站

**接口地址**: `POST /api/seo/website/add`

**请求参数**:
```json
{
  "url": "https://example.com",
  "title": "网站标题",
  "keywords": "关键词1,关键词2,关键词3",
  "status": "active"
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "id": 1,
    "url": "https://example.com",
    "title": "网站标题",
    "keywords": "关键词1,关键词2,关键词3",
    "status": "active",
    "createTime": "2024-01-01 12:00:00"
  }
}
```

### 1.3 更新网站

**接口地址**: `POST /api/seo/website/update`

**请求参数**:
```json
{
  "id": 1,
  "url": "https://example.com",
  "title": "网站标题",
  "keywords": "关键词1,关键词2,关键词3",
  "status": "active"
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "url": "https://example.com",
    "title": "网站标题",
    "keywords": "关键词1,关键词2,关键词3",
    "status": "active",
    "updateTime": "2024-01-01 12:00:00"
  }
}
```

### 1.4 删除网站

**接口地址**: `POST /api/seo/website/delete`

**请求参数**:
```json
{
  "id": 1
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

### 1.5 获取网站列表

**接口地址**: `GET /api/seo/website/list`

**请求参数** (Query参数):
- `page`: 页码，默认1
- `size`: 每页数量，默认10
- `keyword`: 搜索关键词（可选）

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "url": "https://example.com",
        "title": "网站标题",
        "keywords": "关键词1,关键词2,关键词3",
        "status": "active",
        "createTime": "2024-01-01 12:00:00"
      }
    ],
    "total": 100,
    "page": 1,
    "size": 10
  }
}
```

### 1.6 获取网站代码

**接口地址**: `GET /api/seo/website/code/{id}`

**路径参数**:
- `id`: 网站ID

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "html": "<html>...</html>",
    "keywords": "<meta name=\"keywords\" content=\"关键词1,关键词2\">"
  }
}
```

---

## 2. SEO外链管理接口

### 2.1 添加外链

**接口地址**: `POST /api/seo/backlink/add`

**请求参数**:
```json
{
  "url": "https://example.com/page",
  "anchorText": "锚文本",
  "targetUrl": "https://target.com",
  "domain": "example.com",
  "type": "dofollow",
  "status": "active"
}
```

**字段说明**:
- `type`: 外链类型，`dofollow` 或 `nofollow`
- `status`: 状态，`active` 或 `inactive`

### 2.2 更新外链

**接口地址**: `POST /api/seo/backlink/update`

**请求参数**:
```json
{
  "id": 1,
  "url": "https://example.com/page",
  "anchorText": "锚文本",
  "targetUrl": "https://target.com",
  "domain": "example.com",
  "type": "dofollow",
  "status": "active"
}
```

### 2.3 删除外链

**接口地址**: `POST /api/seo/backlink/delete`

**请求参数**:
```json
{
  "id": 1
}
```

### 2.4 获取外链列表

**接口地址**: `GET /api/seo/backlink/list`

**请求参数** (Query参数):
- `page`: 页码，默认1
- `size`: 每页数量，默认10
- `keyword`: 搜索关键词（可选）
- `status`: 状态筛选（可选），`active` 或 `inactive`

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "url": "https://example.com/page",
        "anchorText": "锚文本",
        "targetUrl": "https://target.com",
        "domain": "example.com",
        "type": "dofollow",
        "status": "active",
        "createTime": "2024-01-01 12:00:00"
      }
    ],
    "total": 100,
    "page": 1,
    "size": 10
  }
}
```

### 2.5 检查外链

**接口地址**: `POST /api/seo/backlink/check`

**请求参数**:
```json
{
  "id": 1
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "检查完成",
  "data": {
    "id": 1,
    "status": "active",
    "checkTime": "2024-01-01 12:00:00"
  }
}
```

---

## 3. 域名管理接口

### 3.1 添加域名

**接口地址**: `POST /api/seo/domain/add`

**请求参数**:
```json
{
  "domain": "example.com",
  "registrar": "注册商名称",
  "registerDate": "2020-01-01",
  "expireDate": "2025-01-01",
  "dns": "ns1.example.com,ns2.example.com",
  "status": "normal"
}
```

**字段说明**:
- `status`: 状态，`normal`(正常)、`expired`(过期)、`expiring`(即将过期)

### 3.2 更新域名

**接口地址**: `POST /api/seo/domain/update`

**请求参数**:
```json
{
  "id": 1,
  "domain": "example.com",
  "registrar": "注册商名称",
  "registerDate": "2020-01-01",
  "expireDate": "2025-01-01",
  "dns": "ns1.example.com,ns2.example.com",
  "status": "normal"
}
```

### 3.3 删除域名

**接口地址**: `POST /api/seo/domain/delete`

**请求参数**:
```json
{
  "id": 1
}
```

### 3.4 获取域名列表

**接口地址**: `GET /api/seo/domain/list`

**请求参数** (Query参数):
- `page`: 页码，默认1
- `size`: 每页数量，默认10
- `keyword`: 搜索关键词（可选）
- `status`: 状态筛选（可选），`normal`、`expired`、`expiring`

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "domain": "example.com",
        "registrar": "注册商名称",
        "registerDate": "2020-01-01",
        "expireDate": "2025-01-01",
        "daysLeft": 365,
        "dns": "ns1.example.com,ns2.example.com",
        "status": "normal",
        "createTime": "2024-01-01 12:00:00"
      }
    ],
    "total": 100,
    "page": 1,
    "size": 10
  }
}
```

### 3.5 检查域名

**接口地址**: `POST /api/seo/domain/check`

**请求参数**:
```json
{
  "id": 1
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "检查完成",
  "data": {
    "id": 1,
    "status": "normal",
    "daysLeft": 365,
    "checkTime": "2024-01-01 12:00:00"
  }
}
```

---

## 4. 服务器管理接口

### 4.1 添加服务器

**接口地址**: `POST /api/seo/server/add`

**请求参数**:
```json
{
  "name": "服务器名称",
  "ip": "192.168.1.1",
  "port": 22,
  "username": "root",
  "password": "password",
  "type": "linux",
  "remark": "备注信息"
}
```

**字段说明**:
- `type`: 服务器类型，`linux`、`windows`、`macos`
- `port`: 端口号，默认22

### 4.2 更新服务器

**接口地址**: `POST /api/seo/server/update`

**请求参数**:
```json
{
  "id": 1,
  "name": "服务器名称",
  "ip": "192.168.1.1",
  "port": 22,
  "username": "root",
  "password": "password",
  "type": "linux",
  "remark": "备注信息"
}
```

### 4.3 删除服务器

**接口地址**: `POST /api/seo/server/delete`

**请求参数**:
```json
{
  "id": 1
}
```

### 4.4 获取服务器列表

**接口地址**: `GET /api/seo/server/list`

**请求参数** (Query参数):
- `page`: 页码，默认1
- `size`: 每页数量，默认10
- `keyword`: 搜索关键词（可选）
- `status`: 状态筛选（可选），`online` 或 `offline`

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "服务器名称",
        "ip": "192.168.1.1",
        "port": 22,
        "username": "root",
        "type": "linux",
        "status": "online",
        "cpu": 45.5,
        "memory": 60.2,
        "disk": 35.8,
        "lastCheckTime": "2024-01-01 12:00:00",
        "createTime": "2024-01-01 12:00:00"
      }
    ],
    "total": 100,
    "page": 1,
    "size": 10
  }
}
```

### 4.5 检查服务器状态

**接口地址**: `POST /api/seo/server/check`

**请求参数**:
```json
{
  "id": 1
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "检查完成",
  "data": {
    "id": 1,
    "status": "online",
    "cpu": 45.5,
    "memory": 60.2,
    "disk": 35.8,
    "checkTime": "2024-01-01 12:00:00"
  }
}
```

### 4.6 连接服务器

**接口地址**: `POST /api/seo/server/connect`

**请求参数**:
```json
{
  "id": 1
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "连接成功",
  "data": {
    "id": 1,
    "connectTime": "2024-01-01 12:00:00"
  }
}
```

---

## 5. GEO功能接口

### 5.1 添加GEO配置

**接口地址**: `POST /api/seo/geo/add`

**请求参数**:
```json
{
  "country": "中国",
  "countryCode": "CN",
  "ip": "192.168.1.1",
  "location": "北京市",
  "latitude": 39.9042,
  "longitude": 116.4074,
  "timezone": "Asia/Shanghai",
  "isp": "中国电信",
  "status": "active"
}
```

**字段说明**:
- `countryCode`: 国家代码，2位大写字母（ISO 3166-1 alpha-2）
- `latitude`: 纬度，范围 -90 到 90
- `longitude`: 经度，范围 -180 到 180

### 5.2 更新GEO配置

**接口地址**: `POST /api/seo/geo/update`

**请求参数**:
```json
{
  "id": 1,
  "country": "中国",
  "countryCode": "CN",
  "ip": "192.168.1.1",
  "location": "北京市",
  "latitude": 39.9042,
  "longitude": 116.4074,
  "timezone": "Asia/Shanghai",
  "isp": "中国电信",
  "status": "active"
}
```

### 5.3 删除GEO配置

**接口地址**: `POST /api/seo/geo/delete`

**请求参数**:
```json
{
  "id": 1
}
```

### 5.4 获取GEO列表

**接口地址**: `GET /api/seo/geo/list`

**请求参数** (Query参数):
- `page`: 页码，默认1
- `size`: 每页数量，默认10
- `keyword`: 搜索关键词（可选）
- `country`: 国家代码筛选（可选）

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "country": "中国",
        "countryCode": "CN",
        "ip": "192.168.1.1",
        "location": "北京市",
        "latitude": 39.9042,
        "longitude": 116.4074,
        "timezone": "Asia/Shanghai",
        "isp": "中国电信",
        "status": "active",
        "createTime": "2024-01-01 12:00:00"
      }
    ],
    "total": 100,
    "page": 1,
    "size": 10,
    "statistics": {
      "total": 100,
      "active": 85,
      "countries": 15,
      "ips": 100
    }
  }
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 操作成功 |
| 400 | 请求参数错误 |
| 401 | 未授权或Token过期 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 注意事项

1. 所有需要认证的接口都需要在请求头中携带 `Authorization: Bearer {token}`
2. 日期格式统一使用 `YYYY-MM-DD` 或 `YYYY-MM-DD HH:mm:ss`
3. 分页参数 `page` 从1开始，`size` 默认为10
4. 所有列表接口都支持分页查询
5. 删除操作建议增加二次确认机制
6. 敏感信息（如服务器密码）建议加密存储

