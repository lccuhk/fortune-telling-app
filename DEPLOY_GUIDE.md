# 🚀 算命应用部署指南

## 方案一：Vercel 部署（推荐）

### 1. 准备工作

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login
```

### 2. 前端部署

```bash
cd application

# 安装依赖
npm install

# 构建生产版本
npm run build

# 部署到 Vercel
vercel --prod
```

### 3. 后端部署

由于 Vercel 对 Python 支持有限，建议使用以下方案：

#### 方案 A：Railway/Render（推荐）

**Railway 部署步骤：**

1. 访问 [Railway](https://railway.app/) 注册账号
2. 点击 "New Project" → "Deploy from GitHub repo"
3. 选择你的代码仓库
4. 添加环境变量：
   ```
   USE_MOCK_AI=false
   SILICONFLOW_API_KEY=你的_api_key
   ```
5. 部署完成，获取后端 URL

**Render 部署步骤：**

1. 访问 [Render](https://render.com/) 注册账号
2. 点击 "New" → "Web Service"
3. 选择 GitHub 仓库
4. 配置：
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. 添加环境变量
6. 部署完成

#### 方案 B：国内服务器（阿里云/腾讯云）

```bash
# 1. 购买云服务器（推荐 Ubuntu 20.04+）

# 2. 连接服务器
ssh root@你的服务器IP

# 3. 安装依赖
apt update
apt install python3 python3-pip nginx -y

# 4. 上传代码到服务器
# 使用 scp 或 git clone

# 5. 安装 Python 依赖
cd /path/to/source_code
pip3 install -r requirements.txt

# 6. 创建 systemd 服务
cat > /etc/systemd/system/fortune-api.service << 'EOF'
[Unit]
Description=Fortune Telling API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/path/to/source_code
Environment=USE_MOCK_AI=false
Environment=SILICONFLOW_API_KEY=你的_api_key
ExecStart=/usr/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 7. 启动服务
systemctl enable fortune-api
systemctl start fortune-api

# 8. 配置 Nginx 反向代理
cat > /etc/nginx/sites-available/fortune << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        root /path/to/application/dist;
        try_files $uri $uri/ /index.html;
    }
}
EOF

ln -s /etc/nginx/sites-available/fortune /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 9. 配置 SSL（可选，推荐）
apt install certbot python3-certbot-nginx -y
certbot --nginx -d your-domain.com
```

---

## 方案二：Docker 部署

### 1. 创建 Dockerfile

```dockerfile
# 后端 Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY source_code/requirements.txt .
RUN pip install -r requirements.txt

COPY source_code/ .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. 构建并运行

```bash
# 构建镜像
docker build -t fortune-api .

# 运行容器
docker run -d \
  -p 8000:8000 \
  -e USE_MOCK_AI=false \
  -e SILICONFLOW_API_KEY=你的_api_key \
  --name fortune-api \
  fortune-api
```

---

## 方案三：前后端分离部署

### 前端部署到 Vercel

```bash
cd application

# 修改 API 地址为生产环境
# 编辑 src/App.vue，将 localhost:8000 改为你的后端地址

# 部署
vercel --prod
```

### 后端部署到 Railway/Render

按照上面的 Railway/Render 步骤部署后端。

---

## 🔧 环境变量配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `USE_MOCK_AI` | 是否使用 Mock 模式 | `false` |
| `SILICONFLOW_API_KEY` | SiliconFlow API Key | `sk-xxx...` |
| `AI_MODEL` | AI 模型选择 | `Qwen/Qwen2.5-7B-Instruct` |
| `DB_TYPE` | 数据库类型 | `file` / `sqlite` / `mysql` |

---

## 📱 配置域名和 HTTPS

### 1. 购买域名
推荐：阿里云、腾讯云、Namecheap

### 2. 配置 DNS
将域名解析到你的服务器 IP

### 3. 配置 SSL
使用 Let's Encrypt 免费证书：

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d your-domain.com
```

---

## 🚀 快速启动脚本

```bash
#!/bin/bash
# deploy.sh

echo "🚀 开始部署算命应用..."

# 1. 构建前端
echo "📦 构建前端..."
cd application
npm install
npm run build
cd ..

# 2. 部署后端（假设使用 Railway）
echo "🚀 部署后端到 Railway..."
railway login
railway init
railway up

# 3. 部署前端到 Vercel
echo "🌐 部署前端到 Vercel..."
cd application
vercel --prod

echo "✅ 部署完成！"
```

---

## 📊 监控和维护

### 查看日志

```bash
# 如果使用 systemd
journalctl -u fortune-api -f

# 如果使用 Docker
docker logs -f fortune-api
```

### 自动重启

```bash
# 安装 PM2
npm i -g pm2

# 使用 PM2 管理 Python 进程
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name fortune-api

# 保存配置
pm2 save
pm2 startup
```

---

## 💡 生产环境建议

1. **数据库**：使用 PostgreSQL 或 MySQL 替代文件数据库
2. **缓存**：添加 Redis 缓存热点数据
3. **CDN**：使用 Cloudflare 加速静态资源
4. **监控**：添加 Sentry 错误监控
5. **备份**：定期备份数据库

---

## 🆘 常见问题

### Q: 前端无法连接后端？
A: 检查 CORS 配置，确保后端允许前端域名访问

### Q: API 调用超时？
A: 增加超时时间，或优化 AI 模型调用

### Q: 如何更新部署？
A: 重新构建并推送代码，Vercel/Railway 会自动重新部署

---

祝你部署顺利！🎉
