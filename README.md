# 🔮 命运之轮 - Fortune Telling App

一个功能完整的在线命理应用，集成传统算命、塔罗牌占卜、星座运势、周公解梦等多种命理功能。

## ✨ 功能特性

### 🎯 核心功能模块

| 功能 | 描述 | 状态 |
|------|------|------|
| 🎴 塔罗牌占卜 | 单张牌/三张牌抽牌，3D 翻转动画 | ✅ |
| 📜 八字算命 | 基于天干地支的传统命理分析 | ✅ |
| ⭐ 紫微斗数 | 十四主星命盘分析 | ✅ |
| 🐉 生肖运势 | 十二生肖年度/月度运势 | ✅ |
| ♈ 星座运势 | 十二星座每日运势 | ✅ |
| 📝 姓名学 | 五格剖象法姓名分析 | ✅ |
| 💭 周公解梦 | 梦境解读与分析 | ✅ |
| 👥 多人合盘 | 两人命理匹配度分析 | ✅ |
| 📅 黄历查询 | 每日宜忌、时辰吉凶 | ✅ |
| 🔮 传统算命 | 综合命理分析 | ✅ |

### 🎨 用户体验

- **深色/浅色主题** - 支持主题切换
- **响应式设计** - 完美适配手机、平板、桌面
- **流畅动画** - 塔罗牌 3D 翻转，requestAnimationFrame 驱动
- **数据持久化** - LocalStorage 本地存储
- **用户系统** - 登录/注册功能

### 📊 数据管理

- **历史记录** - 保存所有算命历史
- **搜索筛选** - 按类型、时间筛选
- **数据导出** - JSON/CSV 格式导出
- **错误日志** - 完整的错误追踪系统

## 📁 项目结构

```
fortune-telling-app/
├── .github/
│   └── workflows/
│       └── github-pages.yml    # GitHub Pages 自动部署
├── application/                 # 前端应用（Vue3 + Vite）
│   ├── src/
│   │   ├── components/         # 公共组件
│   │   │   ├── FortuneForm.vue
│   │   │   ├── HePanAnalysis.vue
│   │   │   ├── ShareCard.vue
│   │   │   └── ErrorLogViewer.vue
│   │   ├── pages/              # 页面组件
│   │   │   ├── Home.vue        # 首页
│   │   │   ├── LoginPage.vue   # 登录页
│   │   │   ├── TarotPage.vue   # 塔罗牌
│   │   │   ├── BaziPage.vue    # 八字
│   │   │   ├── ZiweiPage.vue   # 紫微斗数
│   │   │   ├── ShengxiaoPage.vue # 生肖
│   │   │   ├── XingzuoPage.vue  # 星座
│   │   │   ├── XingmingPage.vue # 姓名学
│   │   │   ├── JiemengPage.vue  # 周公解梦
│   │   │   ├── HePan.vue        # 合盘
│   │   │   ├── HuangliPage.vue  # 黄历
│   │   │   └── FortunePage.vue  # 传统算命
│   │   ├── router/             # 路由配置
│   │   ├── services/           # 服务层
│   │   │   ├── api.js          # API 服务
│   │   │   ├── storage.js      # 本地存储
│   │   │   └── errorHandler.js # 错误处理
│   │   ├── styles/             # 样式文件
│   │   ├── App.vue
│   │   └── main.js
│   ├── ai-trader-customization/ # AI 交易器项目（独立）
│   ├── public/                 # 静态资源
│   ├── dist/                   # 构建输出
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── DEPLOY_GUIDE.md
├── architecture.md
├── vercel.json
└── README.md
```

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
cd application
npm install
```

### 开发模式

```bash
cd application
npm run dev
```

访问地址：http://localhost:5173/fortune-telling-app/

### 生产构建

```bash
cd application
npm run build
```

构建产物在 `application/dist/` 目录

### 预览构建结果

```bash
cd application
npm run preview
```

## 🛠 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.x | 前端框架 |
| Vite | 8.x | 构建工具 |
| Vue Router | 4.x | 路由管理 |
| CSS3 | - | 样式（3D 变换、动画） |
| LocalStorage | - | 本地数据存储 |

### 部署

- **GitHub Pages** - 自动部署
- **Vercel** - 可选部署平台

## 📱 响应式支持

| 设备类型 | 断点 | 布局 |
|----------|------|------|
| 📱 手机端 | < 480px | 单列布局 |
| 📱 平板端 | 480px - 768px | 双列布局 |
| 🖥 桌面端 | > 768px | 三列/网格布局 |

## 🎴 塔罗牌动画特性

v1.2.0 版本对塔罗牌动画进行了重大优化：

### 动画实现

- **纯 JS 驱动** - 使用 `requestAnimationFrame` 逐帧控制
- **缓动函数** - `easeInOutCubic` 实现平滑加速减速
- **3D 变换** - CSS `perspective` + `rotateY` 实现立体翻转
- **GPU 加速** - `will-change` + `translateZ(0)` 优化性能

### 动画日志

开启浏览器控制台可查看详细的动画性能数据：

```
[Card 0] 🎞️ 帧 #1 | 时间: 1234.56ms | 进度: 2.5% | 旋转: 4.50° | 帧间隔: 16.67ms | 实际帧率: 60.0fps
```

## 🌐 在线访问

- **GitHub Pages**: https://lccuhk.github.io/fortune-telling-app/

## 📝 版本历史

### v1.2.0 (2026-05-18)

- ✨ 塔罗牌翻牌动画改为纯 JS 驱动的 requestAnimationFrame 实现
- ✨ 添加 easeInOutCubic 缓动函数，动画更丝滑
- ✨ 添加动画日志用于调试帧率
- ✨ 添加 AI Trader 自定义项目
- ✨ 添加 API 测试脚本
- ✨ 优化响应式布局
- 🔧 支持 tag 触发 GitHub Pages 部署

### v1.1.0 (2026-05-15)

- ✨ 优化移动端响应式样式
- ✨ 增强命理功能和数据持久化
- ✨ 增强八字算命页面功能

### v1.0.0 (2026-04-21)

- 🎉 初始版本发布
- ✨ 完整的命理功能模块
- ✨ 用户系统和数据持久化
- ✨ GitHub Pages 自动部署

## 🔧 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 运行测试
npm run test
```

## 📄 License

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**版本**: v1.2.0  
**最后更新**: 2026-05-18  
**作者**: lccuhk
