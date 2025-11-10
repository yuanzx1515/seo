<template>
  <div class="tools-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>工具合集</span>
        </div>
      </template>

      <!-- 工具标签页 -->
      <el-tabs v-model="activeTool" class="tools-tabs">
        <!-- 工具一：域名生成器 -->
        <el-tab-pane label="域名生成器" name="domain-generator">
          <div class="tool-content">
            <el-card shadow="hover" class="tool-card">
              <template #header>
                <div class="tool-header">
                  <el-icon><Link /></el-icon>
                  <span>自动生成域名</span>
                </div>
              </template>

              <el-form :model="domainForm" label-width="120px" class="domain-form">
                <el-form-item label="基础域名" required>
                  <el-input
                    v-model="domainForm.baseDomain"
                    placeholder="例如: test.com"
                    clearable
                    style="width: 400px"
                  >
                    <template #prefix>
                      <el-icon><Link /></el-icon>
                    </template>
                  </el-input>
                  <div class="form-tip">
                    <el-text type="info" size="small">
                      输入主域名，生成的子域名将自动添加前缀
                    </el-text>
                  </div>
                </el-form-item>

                <el-form-item label="生成规则" required>
                  <el-input
                    v-model="domainForm.pattern"
                    placeholder="例如: ab, test{num}, {char}{num}"
                    clearable
                    style="width: 400px"
                  >
                    <template #prefix>
                      <el-icon><Edit /></el-icon>
                    </template>
                  </el-input>
                  <div class="form-tip">
                    <el-text type="info" size="small">
                      支持变量：{num} 数字序列, {char} 字母序列, {charNum} 字母+数字组合<br/>
                      {random} 随机字母数字, {randomNum} 随机数字, {randomChar} 随机字母
                    </el-text>
                  </div>
                </el-form-item>

                <el-form-item label="生成数量" required>
                  <el-input-number
                    v-model="domainForm.count"
                    :min="1"
                    :max="1000"
                    :step="1"
                    style="width: 200px"
                  />
                  <div class="form-tip">
                    <el-text type="info" size="small">
                      最多可生成 1000 个域名
                    </el-text>
                  </div>
                </el-form-item>

                <el-form-item label="随机长度" v-if="hasRandomPattern">
                  <el-input-number
                    v-model="domainForm.randomLength"
                    :min="1"
                    :max="20"
                    :step="1"
                    style="width: 200px"
                  />
                  <div class="form-tip">
                    <el-text type="info" size="small">
                      随机字符的长度（1-20）
                    </el-text>
                  </div>
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="generateDomains" :loading="generating">
                    <el-icon><MagicStick /></el-icon>
                    生成域名
                  </el-button>
                  <el-button @click="clearResults">
                    <el-icon><Delete /></el-icon>
                    清空结果
                  </el-button>
                  <el-button @click="copyAllDomains" :disabled="generatedDomains.length === 0">
                    <el-icon><DocumentCopy /></el-icon>
                    复制全部
                  </el-button>
                  <el-button @click="exportDomains" :disabled="generatedDomains.length === 0">
                    <el-icon><Download /></el-icon>
                    导出文件
                  </el-button>
                </el-form-item>
              </el-form>

              <!-- 生成结果 -->
              <div v-if="generatedDomains.length > 0" class="results-section">
                <div class="results-header">
                  <el-text type="success" size="large">
                    <el-icon><CircleCheck /></el-icon>
                    已生成 {{ generatedDomains.length }} 个域名
                  </el-text>
                </div>
                <div class="results-content">
                  <el-table
                    :data="generatedDomains"
                    stripe
                    border
                    max-height="400"
                    style="width: 100%"
                  >
                    <el-table-column type="index" label="序号" width="80" align="center" />
                    <el-table-column prop="domain" label="生成的域名" min-width="300">
                      <template #default="scope">
                        <el-text copyable>{{ scope.row.domain }}</el-text>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="150" align="center">
                      <template #default="scope">
                        <el-button
                          type="primary"
                          size="small"
                          text
                          @click="copyDomain(scope.row.domain)"
                        >
                          <el-icon><DocumentCopy /></el-icon>
                          复制
                        </el-button>
                        <el-button
                          type="danger"
                          size="small"
                          text
                          @click="removeDomain(scope.$index)"
                        >
                          <el-icon><Delete /></el-icon>
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>

              <!-- 示例说明 -->
              <el-collapse class="example-section">
                <el-collapse-item title="使用示例" name="examples">
                  <div class="examples-content">
                    <el-descriptions :column="1" border>
                      <el-descriptions-item label="示例 1">
                        <el-text>基础域名: test.com</el-text><br />
                        <el-text>生成规则: ab</el-text><br />
                        <el-text>生成数量: 1</el-text><br />
                        <el-text type="success">结果: ab.test.com</el-text>
                      </el-descriptions-item>
                      <el-descriptions-item label="示例 2">
                        <el-text>基础域名: example.com</el-text><br />
                        <el-text>生成规则: api{num}</el-text><br />
                        <el-text>生成数量: 5</el-text><br />
                        <el-text type="success">
                          结果: api1.example.com, api2.example.com, ..., api5.example.com
                        </el-text>
                      </el-descriptions-item>
                      <el-descriptions-item label="示例 3">
                        <el-text>基础域名: mydomain.com</el-text><br />
                        <el-text>生成规则: {char}</el-text><br />
                        <el-text>生成数量: 3</el-text><br />
                        <el-text type="success">
                          结果: a.mydomain.com, b.mydomain.com, c.mydomain.com
                        </el-text>
                      </el-descriptions-item>
                      <el-descriptions-item label="示例 4">
                        <el-text>基础域名: site.com</el-text><br />
                        <el-text>生成规则: sub{charNum}</el-text><br />
                        <el-text>生成数量: 5</el-text><br />
                        <el-text type="success">
                          结果: suba1.site.com, suba2.site.com, ..., suba5.site.com
                        </el-text>
                      </el-descriptions-item>
                      <el-descriptions-item label="示例 5（随机）">
                        <el-text>基础域名: test.com</el-text><br />
                        <el-text>生成规则: {random}</el-text><br />
                        <el-text>生成数量: 3</el-text><br />
                        <el-text type="success">
                          结果: a3k9x2.test.com, m7p4q1.test.com, z9w2e5.test.com (随机)
                        </el-text>
                      </el-descriptions-item>
                      <el-descriptions-item label="示例 6（随机数字）">
                        <el-text>基础域名: api.com</el-text><br />
                        <el-text>生成规则: server{randomNum}</el-text><br />
                        <el-text>生成数量: 3</el-text><br />
                        <el-text type="success">
                          结果: server384729.api.com, server192837.api.com, server567123.api.com (随机)
                        </el-text>
                      </el-descriptions-item>
                    </el-descriptions>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </el-card>
          </div>
        </el-tab-pane>

        <!-- 预留其他工具的位置 -->
        <el-tab-pane label="更多工具" name="more" disabled>
          <el-empty description="更多工具正在开发中..." />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTool = ref('domain-generator')
const generating = ref(false)

// 域名生成表单
const domainForm = reactive({
  baseDomain: '',
  pattern: '',
  count: 10,
  randomLength: 6
})

// 生成的域名列表
const generatedDomains = ref([])

// 检查是否包含随机模式
const hasRandomPattern = computed(() => {
  const pattern = domainForm.pattern || ''
  return pattern.includes('{random}') || pattern.includes('{randomNum}') || pattern.includes('{randomChar}')
})

// 生成域名
function generateDomains() {
  // 验证输入
  if (!domainForm.baseDomain.trim()) {
    ElMessage.warning('请输入基础域名')
    return
  }

  if (!domainForm.pattern.trim()) {
    ElMessage.warning('请输入生成规则')
    return
  }

  if (domainForm.count < 1 || domainForm.count > 1000) {
    ElMessage.warning('生成数量必须在 1-1000 之间')
    return
  }

  // 验证域名格式
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
  if (!domainRegex.test(domainForm.baseDomain.trim())) {
    ElMessage.warning('请输入正确格式的域名')
    return
  }

  generating.value = true
  const domains = []
  const pattern = domainForm.pattern.trim()
  const baseDomain = domainForm.baseDomain.trim()
  const count = domainForm.count

  try {
    for (let i = 0; i < count; i++) {
      let prefix = pattern

      // 替换 {num} - 数字序列
      if (prefix.includes('{num}')) {
        prefix = prefix.replace(/{num}/g, String(i + 1))
      }

      // 替换 {char} - 字母序列 (a-z, aa-zz, ...)
      if (prefix.includes('{char}')) {
        const charValue = numberToLetters(i + 1)
        prefix = prefix.replace(/{char}/g, charValue)
      }

      // 替换 {charNum} - 字母+数字组合
      if (prefix.includes('{charNum}')) {
        const charNumValue = numberToCharNum(i + 1)
        prefix = prefix.replace(/{charNum}/g, charNumValue)
      }

      // 替换 {random} - 随机字母数字组合
      if (prefix.includes('{random}')) {
        const randomValue = generateRandomString(domainForm.randomLength || 6, true, true)
        prefix = prefix.replace(/{random}/g, randomValue)
      }

      // 替换 {randomNum} - 随机数字
      if (prefix.includes('{randomNum}')) {
        const randomNumValue = generateRandomString(domainForm.randomLength || 6, false, true)
        prefix = prefix.replace(/{randomNum}/g, randomNumValue)
      }

      // 替换 {randomChar} - 随机字母
      if (prefix.includes('{randomChar}')) {
        const randomCharValue = generateRandomString(domainForm.randomLength || 6, true, false)
        prefix = prefix.replace(/{randomChar}/g, randomCharValue)
      }

      const fullDomain = `${prefix}.${baseDomain}`
      domains.push({
        domain: fullDomain,
        index: i + 1
      })
    }

    generatedDomains.value = domains
    ElMessage.success(`成功生成 ${domains.length} 个域名`)
  } catch (error) {
    ElMessage.error('生成域名时出错: ' + error.message)
  } finally {
    generating.value = false
  }
}

// 数字转字母序列 (1->a, 2->b, ..., 26->z, 27->aa, ...)
function numberToLetters(num) {
  let result = ''
  while (num > 0) {
    num--
    result = String.fromCharCode(97 + (num % 26)) + result
    num = Math.floor(num / 26)
  }
  return result
}

// 数字转字母+数字组合 (1->a1, 2->a2, ..., 26->a26, 27->b1, 28->b2, ...)
function numberToCharNum(num) {
  const charIndex = Math.floor((num - 1) / 26)
  const numPart = ((num - 1) % 26) + 1
  const char = String.fromCharCode(97 + charIndex)
  return char + numPart
}

// 生成随机字符串
function generateRandomString(length, includeLetters = true, includeNumbers = true) {
  let chars = ''
  if (includeLetters) {
    chars += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  }
  if (includeNumbers) {
    chars += '0123456789'
  }
  
  if (!chars) {
    return ''
  }
  
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 复制单个域名
function copyDomain(domain) {
  navigator.clipboard.writeText(domain).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// 复制所有域名
function copyAllDomains() {
  if (generatedDomains.value.length === 0) {
    ElMessage.warning('没有可复制的域名')
    return
  }

  const allDomains = generatedDomains.value.map(item => item.domain).join('\n')
  navigator.clipboard.writeText(allDomains).then(() => {
    ElMessage.success(`已复制 ${generatedDomains.value.length} 个域名到剪贴板`)
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// 删除单个域名
function removeDomain(index) {
  generatedDomains.value.splice(index, 1)
  ElMessage.success('已删除')
}

// 清空结果
function clearResults() {
  if (generatedDomains.value.length === 0) {
    return
  }

  ElMessageBox.confirm('确定要清空所有生成的域名吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    generatedDomains.value = []
    ElMessage.success('已清空')
  }).catch(() => {})
}

// 导出域名到文件
function exportDomains() {
  if (generatedDomains.value.length === 0) {
    ElMessage.warning('没有可导出的域名')
    return
  }

  const content = generatedDomains.value.map(item => item.domain).join('\n')
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `domains_${new Date().getTime()}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}
</script>

<style scoped>
.tools-container {
  min-height: calc(100vh - 64px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
}

.tools-tabs {
  margin-top: 10px;
}

.tool-content {
  padding: 20px 0;
}

.tool-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
}

.domain-form {
  max-width: 800px;
}

.form-tip {
  margin-top: 5px;
  margin-left: 0;
}

.results-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.results-header {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.results-content {
  margin-top: 15px;
}

.example-section {
  margin-top: 30px;
}

.examples-content {
  padding: 10px 0;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
  width: 100px;
}

:deep(.el-table) {
  border-radius: 4px;
}

:deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 500;
}

:deep(.el-tabs__item.is-active) {
  color: #667eea;
}

:deep(.el-tabs__active-bar) {
  background-color: #667eea;
}
</style>

