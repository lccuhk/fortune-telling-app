# 贡献指南

感谢您对 **Fortune Telling App** 算命平台项目的关注！我们欢迎任何形式的贡献，无论是提交 Bug 报告、提出功能建议，还是直接贡献代码。

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
  - [提交 Issue](#提交-issue)
  - [提交 Pull Request](#提交-pull-request)
- [代码规范](#代码规范)
- [代码风格指南](#代码风格指南)
- [开发环境](#开发环境)
- [测试指南](#测试指南)
- [贡献类型](#贡献类型)

## 行为准则

本项目遵循 [Contributor Covenant](.github/CODE_OF_CONDUCT.md) 行为准则。参与项目即表示您同意遵守其条款。

## 如何贡献

### 提交 Issue

如果您发现了 Bug 或有新功能建议，请通过 Issue 告诉我们：

1. **Bug 报告**：请包含以下信息
   - 问题描述（清晰简洁）
   - 复现步骤
   - 预期行为
   - 实际行为
   - 环境信息（操作系统、浏览器版本、Node.js 版本等）
   - 错误日志或截图（如适用）

2. **功能建议**：请包含以下信息
   - 功能描述
   - 为什么需要这个功能
   - 实现思路（可选）
   - 相关的参考资料（如适用）

### 提交 Pull Request

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

**PR 规范：**
- 标题清晰描述改动内容，使用中文或英文均可
- 详细说明改动的原因和内容
- 关联相关的 Issue（如 `Fixes #123`）
- 确保代码通过所有测试和代码检查
- 更新相关文档（如 README、CHANGELOG）
- 如果添加了新功能，请添加相应的测试用例

## 代码规范

项目使用以下工具进行代码规范管理：

- **Prettier** - 代码格式化
- **ESLint** - 代码检查
- **EditorConfig** - 统一编辑器配置
- **Vitest** - 单元测试

**代码规范：**
- 使用 2 空格缩进
- 变量和函数使用 camelCase
- 组件名使用 PascalCase
- CSS 类名使用 kebab-case
- 使用语义化 HTML 标签
- 使用 TypeScript 类型注解
- Vue 组件使用 `<script setup>` 语法
- 注释清晰，说明复杂逻辑

**运行代码检查：**
```bash
# 格式化代码
npm run format

# 代码检查
npm run lint

# 运行测试
npm run test:unit
```

## 代码风格指南

### Git 提交规范

我们遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**提交类型（type）：**
- `feat` - 新功能、新页面
- `fix` - Bug 修复
- `docs` - 文档更新
- `style` - 代码格式（不影响代码运行）
- `refactor` - 重构（既不是新增功能，也不是修改 bug）
- `perf` - 性能优化
- `test` - 增加测试
- `chore` - 构建过程或辅助工具的变动
- `ci` - CI/CD 配置变更
- `revert` - 回退提交

**示例：**
```
feat(tarot): add card detail modal with animations

- Implement tarot card detail popup
- Add flip animation with CSS 3D transforms
- Add card meaning interpretation
- Update responsive layout for mobile
- Add unit tests for card component

Closes #123
```

**提交规范：**
- 标题不超过 72 个字符
- 使用中文或英文均可，但要保持一致
- 标题使用祈使句（"添加" 而不是 "添加了"）
- 正文详细说明改动的原因和内容
- 关联相关 Issue（如 `Closes #123`、`Fixes #456`）

### 命名约定

#### Vue 组件
```vue
<!-- 组件名 - PascalCase，多单词 -->
<script setup>
// ✅ 好的命名
const TarotCard = defineComponent({ ... })
const FortuneForm = defineComponent({ ... })
const HistoryPanel = defineComponent({ ... })

// ❌ 不好的命名
const card = defineComponent({ ... })
const form = defineComponent({ ... })
</script>
```

#### JavaScript/TypeScript
```typescript
// 变量/函数 - camelCase
const userName = ref('John')
const fetchFortuneData = async () => { ... }
const calculateBazi = (birthDate) => { ... }

// 常量 - UPPER_SNAKE_CASE
const MAX_HISTORY_ITEMS = 50
const API_BASE_URL = import.meta.env.VITE_API_URL
const FORTUNE_TYPES = ['tarot', 'bazi', 'ziwei']

// 组合式函数 - use 开头
const useFortune = () => { ... }
const useHistory = () => { ... }
const useTheme = () => { ... }

// Props - camelCase
defineProps<{
  cardData: CardData
  isFlipped: boolean
  theme: string
}>()

// Emits - camelCase（脚本中），kebab-case（模板中）
const emit = defineEmits<{
  (e: 'card-clicked', card: Card): void
  (e: 'update:modelValue', value: string): void
}>()
```

#### CSS 类名
```css
/* BEM 命名规范 */
.tarot-card { }              /* Block */
.tarot-card__image { }       /* Element */
.tarot-card--flipped { }     /* Modifier */
.tarot-card--reversed { }    /* Modifier */

/* 状态类 */
.is-active { }
.is-loading { }
.is-disabled { }
.has-error { }
```

#### 文件命名
```
# Vue 组件 - PascalCase
TarotCard.vue
FortuneForm.vue
HistoryPanel.vue

# 组合式函数 - camelCase，use 开头
useFortune.js
useHistory.js
useTheme.js

# 工具函数 - camelCase
formatDate.js
calculateBazi.js

# 样式文件 - kebab-case
tarot-card.css
ancient-theme.css

# 图片资源 - kebab-case
tarot-back.png
bazi-chart.svg
```

### 注释规范

#### JSDoc 注释
```typescript
/**
 * 计算八字命盘
 * @param birthDate - 出生日期（YYYY-MM-DD HH:mm:ss）
 * @param gender - 性别 ('male' | 'female')
 * @returns 八字命盘数据对象
 * @example
 * const bazi = calculateBazi('1990-01-15 12:00:00', 'male')
 * console.log(bazi.yearPillar)
 */
function calculateBazi(birthDate: string, gender: string): BaziResult {
  // ...
}
```

#### Vue 组件注释
```vue
<script setup>
/**
 * 塔罗牌卡片组件
 * @props cardData - 塔罗牌数据
 * @props isFlipped - 是否翻转
 * @emits card-clicked - 点击卡片时触发
 */
const props = defineProps<{
  cardData: TarotCard
  isFlipped: boolean
}>()

const emit = defineEmits<{
  (e: 'card-clicked', card: TarotCard): void
}>()
</script>
```

#### 行内注释
```javascript
// ✅ 好的注释 - 解释为什么这样做
// 防抖 300ms，避免频繁触发 API 请求
const debouncedSearch = useDebounce(searchQuery, 300)

// ✅ 好的注释 - 解释业务逻辑
// 塔罗牌正逆位：随机生成，30% 概率逆位
const isReversed = Math.random() < 0.3

// ❌ 不好的注释 - 重复代码内容
// 定义变量
const count = ref(0)
```

### Vue 组件规范

#### 组件结构顺序
```vue
<script setup>
// 1. 导入
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

// 2. Props 和 Emits
const props = defineProps({ ... })
const emit = defineEmits({ ... })

// 3. 响应式数据
const isLoading = ref(false)
const formData = ref({ ... })

// 4. 计算属性
const totalCount = computed(() => ...)

// 5. 方法
const handleSubmit = () => { ... }

// 6. 生命周期
onMounted(() => { ... })
</script>

<template>
  <!-- 模板内容 -->
</template>

<style scoped>
/* 样式 */
</style>
```

### 导入排序规范

```typescript
// 1. 第三方库
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { defineStore } from 'pinia'
import axios from 'axios'

// 2. 本地组件
import TarotCard from '@/components/TarotCard.vue'
import FortuneForm from '@/components/FortuneForm.vue'
import HistoryPanel from '@/components/HistoryPanel.vue'

// 3. 组合式函数
import { useFortune } from '@/composables/useFortune'
import { useHistory } from '@/composables/useHistory'
import { useTheme } from '@/composables/useTheme'

// 4. 工具函数和类型
import { formatDate } from '@/utils/format'
import { validateBirthDate } from '@/utils/validation'
import type { TarotCard, BaziResult } from '@/types'

// 5. 样式
import '@/styles/ancient-theme.css'
```

### 错误处理规范

```typescript
// ✅ 使用 try-catch 处理异步操作
const fetchFortune = async () => {
  try {
    isLoading.value = true
    const response = await api.post('/fortune/tarot', formData.value)
    result.value = response.data
  } catch (error) {
    console.error('算命请求失败:', error)
    showError('获取结果失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

// ✅ 统一错误处理
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 未授权，清除登录状态
      clearUserInfo()
    }
    return Promise.reject(error)
  }
)

// ✅ 表单验证
const validateForm = () => {
  if (!formData.value.birthDate) {
    showError('请输入出生日期')
    return false
  }
  if (!formData.value.gender) {
    showError('请选择性别')
    return false
  }
  return true
}
```

### 性能优化规范

```typescript
// ✅ 使用 computed 缓存计算结果
const filteredHistory = computed(() => {
  return history.value.filter(item => item.type === currentType.value)
})

// ✅ 使用 shallowRef 减少响应式开销
const heavyData = shallowRef(largeObject)

// ✅ 使用 v-memo 优化列表渲染
<div v-memo="[item.id]" v-for="item in items" :key="item.id">
  <!-- 只有 item.id 变化时才重新渲染 -->
</div>

// ✅ 图片懒加载
<img v-lazy="imageUrl" alt="tarot card" />
```

## 开发环境

### 前端开发

1. **克隆仓库**
   ```bash
   git clone https://github.com/lccuhk/fortune-telling-app.git
   cd fortune-telling-app
   ```

2. **进入前端目录**
   ```bash
   cd application
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，填入必要的配置
   ```

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

   前端将在 `http://localhost:5173` 运行

6. **构建生产版本**
   ```bash
   npm run build
   ```

## 测试指南

### 运行测试

```bash
# 运行所有测试
npm run test:unit

# 运行特定测试
npm run test:unit -- src/composables/useFortune.test.js

# 生成覆盖率报告
npm run test:unit -- --coverage

# 监听模式
npm run test:unit -- --watch
```

### 编写测试

- 测试文件与源文件放在同一目录下，命名为 `*.test.js` 或 `*.spec.js`
- 使用 Vitest 框架
- 为新功能添加相应的单元测试
- 确保测试覆盖关键逻辑路径
- 使用 mock 避免实际调用 API

## 贡献类型

我们欢迎各种类型的贡献：

### 🐛 Bug 修复
- 修复页面布局问题
- 修复 JavaScript 交互错误
- 修复响应式设计问题
- 修复浏览器兼容性问题
- 修复 API 调用问题
- 修复算命算法逻辑错误

### ✨ 新功能
- 添加新的算命功能（八字、塔罗、星座、生肖等）
- 添加新的主题或配色方案
- 添加多语言支持
- 添加用户系统功能
- 添加分享功能
- 添加历史记录功能
- 添加数据导出功能
- 添加新的动画效果

### 📚 文档
- 改进 README 文档
- 添加使用教程
- 补充代码注释
- 翻译文档
- 添加部署指南
- 添加 API 文档

### 🎨 设计
- 改进 UI/UX 设计
- 优化配色方案
- 添加新的图标或图片
- 优化动画效果
- 改进响应式设计
- 优化移动端体验

### 🌐 内容
- 添加新的算命内容
- 优化算命算法
- 翻译页面内容
- 更新命理知识库

### 🚀 性能优化
- 优化图片加载
- 压缩 CSS/JavaScript
- 改进页面加载速度
- 优化动画性能
- 优化算命算法性能

### 🔧 配置
- 优化构建配置
- 添加 CI/CD 流程
- 改进部署流程
- 添加监控和日志

## 问题？

如果您在贡献过程中遇到任何问题，欢迎通过以下方式联系我们：

- 提交 [Issue](https://github.com/lccuhk/fortune-telling-app/issues)
- 查看 [README.md](README.md) 了解更多项目信息
- 查看 [CHANGELOG.md](CHANGELOG.md) 了解版本历史
- 查看 [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) 了解部署指南

再次感谢您的贡献！🎉
