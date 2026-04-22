# Vercel 部署指南

## 🚀 快速部署步骤

### 1. 安装 Vercel CLI

```bash
# 使用 npm 安装
npm i -g vercel

# 或使用 pnpm
pnpm i -g vercel
```

### 2. 登录 Vercel

```bash
vercel login
```

会打开浏览器让你登录 Vercel 账号（可以用 GitHub/Google 账号）。

### 3. 进入项目目录

```bash
cd /Users/bytedance/TRAE\ CN/fortune-telling-app/application
```

### 4. 部署项目

```bash
vercel
```

按照提示操作：
- **Set up and deploy?** → 输入 `Y`
- **Which scope?** → 选择你的账号
- **Link to existing project?** → 输入 `N`（创建新项目）
- **What's your project name?** → 输入 `fortune-telling-app`
- **In which directory is your code located?** → 直接回车（当前目录）

### 5. 等待部署完成

Vercel 会自动：
1. 安装依赖
2. 运行 `npm run build`
3. 部署到全球 CDN

部署成功后会显示：
```
🔍  Inspect: https://vercel.com/yourname/fortune-telling-app/xxxxx
✅  Production: https://fortune-telling-app-xxxxx.vercel.app
```

---

## 📁 已创建的配置文件

### vercel.json
Vercel 部署配置文件，包含：
- 构建配置（使用 Vite 构建）
- 路由规则（支持 Vue Router）
- 缓存策略（静态资源缓存）

### .vercelignore
排除不需要部署的文件：
- node_modules
- .vscode
- .git

---

## 🔧 后续更新部署

### 方式 1：命令行更新

```bash
# 进入项目目录
cd /Users/bytedance/TRAE\ CN/fortune-telling-app/application

# 部署到生产环境
vercel --prod
```

### 方式 2：Git 集成（推荐）

1. 将代码推送到 GitHub
2. 在 Vercel 控制台连接 GitHub 仓库
3. 每次 push 代码会自动重新部署

---

## 🌐 自定义域名

### 在 Vercel 控制台设置：

1. 打开 https://vercel.com/dashboard
2. 选择你的项目
3. 点击 **Settings** → **Domains**
4. 输入你的域名（如 `fortune-telling.duckdns.org`）
5. 按照提示添加 DNS 记录

---

## ⚠️ 重要说明

### 后端 API 配置

Vercel 只部署前端，后端 API 需要另外部署。

修改前端 API 地址配置：

```javascript
// src/config.js 或直接在组件中
const API_BASE_URL = 'https://your-backend-api.com';
// 或暂时使用 mock 数据
const API_BASE_URL = '';
```

### 环境变量

如果需要环境变量，在项目根目录创建：

```bash
# .env.local
VITE_API_URL=https://your-api.com
```

然后在代码中使用：
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## 📊 Vercel 优势

| 特性 | 说明 |
|------|------|
| ✅ 免费 | 个人项目完全免费 |
| ✅ 自动 HTTPS | 自动配置 SSL 证书 |
| ✅ 全球 CDN | 全球加速访问 |
| ✅ 自动部署 | Git 集成，自动更新 |
| ✅ 预览环境 | 每次提交生成预览链接 |

---

## 🆘 常见问题

### 问题 1：构建失败
```bash
# 本地测试构建
npm run build

# 检查 dist 目录是否正常生成
ls -la dist/
```

### 问题 2：路由 404
Vercel 已配置 `vercel.json` 支持 Vue Router，所有路由会指向 index.html。

### 问题 3：API 请求失败
Vercel 只托管前端，后端需要单独部署或使用 Vercel Serverless Functions。

---

## 📞 支持

- Vercel 文档：https://vercel.com/docs
- Vercel 控制台：https://vercel.com/dashboard
