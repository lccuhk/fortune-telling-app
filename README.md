# 🔮 算命应用 - Fortune Telling App

一个功能完整的算命应用，包含传统算命、塔罗牌占卜、用户系统、数据可视化等功能。

## ✨ 功能特性

### 🎯 核心功能
- **传统算命** - 根据出生日期和问题类型提供运势预测
- **塔罗牌占卜** - 随机抽取塔罗牌，获得命运指引
- **星座生肖** - 自动计算并显示星座和生肖信息
- **历史记录** - 保存和查询算命历史
- **收藏功能** - 收藏喜欢的算命结果

### 🎨 用户体验
- **深色/浅色主题** - 支持主题切换
- **响应式设计** - 完美适配手机、平板、桌面
- **分享功能** - 支持多种分享方式
- **数据导出** - 导出为 JSON 和 CSV 格式
- **每日运势推送** - 浏览器通知提醒

### 📊 数据管理
- **可视化图表** - 使用 Chart.js 展示数据统计
- **搜索筛选** - 历史记录搜索和分类筛选
- **用户系统** - 注册、登录、个人数据管理

## 📁 项目结构

```
fortune-telling-app/
├── application/              # 前端应用（Vue3 + Vite）
│   ├── src/
│   │   ├── components/       # 组件
│   │   │   └── FortuneForm.vue
│   │   ├── App.vue
│   │   └── main.js
│   ├── package.json
│   └── vite.config.js
├── source_code/              # 后端应用（FastAPI）
│   ├── main.py
│   ├── database.py
│   ├── advanced_fortune.py
│   └── requirements.txt
└── architecture.md
```

## 🚀 快速开始

### 前置要求
- Node.js 16+
- Python 3.8+
- pip

### 后端启动
```bash
cd source_code
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 前端启动
```bash
cd application
npm install
npm run dev
```

### 访问地址
- **前端应用**: http://localhost:5173
- **后端API**: http://localhost:8000

## 🛠 技术栈

### 前端
- Vue 3
- Vite
- Chart.js
- CSS3

### 后端
- FastAPI
- Python 3.8+
- 支持 MySQL 和文件数据库

## 📊 API 接口

### 算命接口
- `POST /api/fortune` - 获取算命结果

### 历史记录
- `GET /api/history` - 获取历史记录
- `POST /api/history/delete` - 删除历史记录

## 🎮 使用说明

1. **注册/登录** - 创建账户或登录现有账户
2. **选择模式** - 选择传统算命或塔罗牌占卜
3. **填写信息** - 输入姓名、出生日期、问题类型
4. **获取结果** - 点击开始，查看算命结果
5. **保存/分享** - 收藏、分享或导出结果

## 📝 数据存储

应用支持多种数据存储方式：
- **文件数据库** - 默认使用JSON文件存储
- **MySQL数据库** - 配置.env后使用MySQL
- **LocalStorage** - 前端数据备份

## 🔧 配置说明

数据库配置见 `source_code/.env.example`

## 📱 响应式支持

✅ 手机端 (< 480px)  
✅ 平板端 (480px - 768px)  
✅ 桌面端 (> 768px)

## 🎉 特色功能

- **三级降级机制** - 确保服务稳定性
- **完整的测试套件** - 单元测试、集成测试
- **详细的日志记录** - 便于排查问题
- **优雅的错误处理** - 用户友好的错误提示

## 🏆 项目亮点

1. **完整的用户系统** - 注册、登录、个人数据
2. **丰富的视觉效果** - 渐变色、动画效果
3. **专业的图表展示** - 饼图、柱状图、折线图
4. **完善的测试体系** - 功能完整测试覆盖

---

**版本**: 1.0.0  
**最后更新**: 2026-04-21
