# Mock数据使用说明

## 概述

本项目支持Mock数据功能，可以在后端接口未完成时使用Mock数据进行前端开发和测试。

## 配置

Mock功能的开关配置在 `src/config/mock.js` 文件中：

```javascript
// 设置为true启用Mock，false使用真实接口
export const MOCK_ENABLED = true

// Mock请求延迟时间（毫秒）
export const MOCK_DELAY = 500
```

## Mock文件结构

每个模块都有对应的Mock文件，命名规范：`模块名+Mock.js`

- `WebsiteMock.js` - SEO网站管理模块
- `BacklinkMock.js` - SEO外链管理模块
- `DomainMock.js` - 域名管理模块
- `ServerMock.js` - 服务器管理模块
- `GeoMock.js` - GEO功能模块

## Mock文件格式

每个Mock文件包含：

1. **Mock数据**：模拟的列表数据
2. **Mock函数**：对应每个API接口的处理函数
3. **路由映射**：将API路径映射到对应的Mock函数

示例：

```javascript
// Mock数据
const mockList = [...]

// Mock函数
export function getList(params) {
  return {
    code: 200,
    message: '获取成功',
    data: { list: mockList, total: mockList.length }
  }
}

// 路由映射
export const moduleMockMap = {
  'GET /api/seo/module/list': getList
}
```

## 工作原理

1. 在 `net/index.js` 中，所有以 `/api/seo/` 开头的请求都会检查是否启用Mock
2. 如果启用Mock，会根据请求方法和URL匹配对应的Mock函数
3. 支持路径参数（如 `/api/seo/website/code/:id`）和Query参数
4. Mock函数执行后返回模拟数据，并模拟网络延迟

## 使用方式

### 启用Mock

在 `src/config/mock.js` 中设置：

```javascript
export const MOCK_ENABLED = true
```

### 禁用Mock（使用真实接口）

在 `src/config/mock.js` 中设置：

```javascript
export const MOCK_ENABLED = false
```

## 注意事项

1. Mock数据只在开发环境使用，生产环境应关闭Mock功能
2. Mock数据是内存数据，页面刷新后会重置
3. 路径参数支持通过 `:id` 格式定义，会自动匹配和提取
4. Query参数会自动解析并传递给Mock函数
5. POST请求的body数据会与路径参数合并后传递给Mock函数

## 添加新的Mock接口

1. 在对应模块的Mock文件中添加Mock函数
2. 在路由映射中添加对应的路径和方法
3. 确保Mock函数返回格式符合API文档规范

示例：

```javascript
// 添加新的Mock函数
export function newFunction(data) {
  return {
    code: 200,
    message: '操作成功',
    data: { ... }
  }
}

// 添加到路由映射
export const moduleMockMap = {
  'POST /api/seo/module/new': newFunction,
  // ... 其他映射
}
```





