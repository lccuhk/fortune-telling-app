# 贡献指南

感谢您对 **Fortune Telling App** 算命平台项目的关注！我们欢迎任何形式的贡献，无论是提交 Bug 报告、提出功能建议，还是直接贡献代码。

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
  - [提交 Issue](#提交-issue)
  - [提交 Pull Request](#提交-pull-request)
- [代码规范](#代码规范)
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
