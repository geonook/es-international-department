# Docker Deployment Guide | Docker 部署指南
*KCISLK ESID Info Hub - Docker 容器化部署完整指南*

## 📋 Overview | 概述

This guide provides comprehensive instructions for deploying the KCISLK ESID Info Hub application using Docker. The application is optimized for containerized deployment with multi-stage builds, security best practices, and production-ready configuration.

本指南提供使用 Docker 部署 KCISLK ESID Info Hub 應用程式的完整說明。應用程式針對容器化部署進行了優化，包含多階段建置、安全最佳實踐和生產就緒配置。

## 🎯 Docker Features | Docker 功能特色

✅ **Multi-stage Build** - Optimized image size and security | 多階段建置 - 優化映像檔大小和安全性  
✅ **Non-root User** - Enhanced security with non-privileged user | 非 root 使用者 - 使用非特權使用者提升安全性  
✅ **Health Check** - Built-in health monitoring | 健康檢查 - 內建健康監控  
✅ **Production Ready** - Optimized for Zeabur and cloud deployment | 生產就緒 - 針對 Zeabur 和雲端部署優化  
✅ **Database Integration** - Prisma ORM with PostgreSQL support | 資料庫整合 - 支援 PostgreSQL 的 Prisma ORM  
✅ **Environment Flexibility** - Support for development, staging, and production | 環境靈活性 - 支援開發、預備和生產環境

## 🚀 Quick Start | 快速開始

### Prerequisites | 先決條件

```bash
# Required software | 必需軟體
Docker Engine 20.10+ 
Docker Compose 2.0+
Git
```

### Quick Docker Setup | 快速 Docker 設定

```bash
# 1. Clone repository | 複製儲存庫
git clone <repository-url>
cd kcislk-esid-info-hub

# 2. Build Docker image | 建置 Docker 映像檔
docker build -t kcislk-esid-info-hub .

# 3. Run container with environment variables | 運行容器並設定環境變數
docker run -p 8080:8080 \
  -e DATABASE_URL="postgresql://user:password@host:5432/database" \
  -e NODE_ENV="production" \
  kcislk-esid-info-hub

# 4. Verify deployment | 驗證部署
curl http://localhost:8080/api/health
```

## 🐳 Dockerfile Architecture | Dockerfile 架構

### Multi-Stage Build Process | 多階段建置流程

Our Dockerfile uses a 3-stage build process for optimal performance and security:

我們的 Dockerfile 使用 3 階段建置流程以實現最佳效能和安全性：

```dockerfile
# Stage 1: Dependencies (deps)
# - Install all dependencies including dev dependencies
# - Generate Prisma client
# - Prepare for build stage

# Stage 2: Builder (builder)  
# - Copy dependencies from deps stage
# - Build Next.js application
# - Generate optimized production bundle

# Stage 3: Runner (runner)
# - Copy only production files
# - Create non-root user
# - Set up runtime environment
# - Configure health checks
```

### Image Size Optimization | 映像檔大小優化

| Stage | Base Image | Purpose | Final Size |
|-------|------------|---------|------------|
| Dependencies | node:22-slim | Install & build dependencies | ~500MB |
| Builder | node:22-slim | Build application | ~800MB |
| Runner | node:22-slim | Production runtime | ~200MB |

## 🔧 Configuration | 配置

### Environment Variables | 環境變數

#### Required Variables | 必需變數
```bash
# Database connection | 資料庫連接
DATABASE_URL="postgresql://user:password@host:5432/database"

# Application environment | 應用程式環境
NODE_ENV="production"

# Authentication secrets | 身份驗證密鑰
JWT_SECRET="your-super-secret-jwt-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"
```

#### Optional Variables | 可選變數
```bash
# Port configuration | 埠口配置
PORT=8080
HOSTNAME="0.0.0.0"

# File storage | 檔案存儲
VERCEL_BLOB_READ_WRITE_TOKEN="your-blob-token"

# Monitoring | 監控
SENTRY_DSN="your-sentry-dsn"

# Cache | 快取
REDIS_URL="redis://localhost:6379"
```

### Docker Compose Configuration | Docker Compose 配置

#### Development Environment | 開發環境
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:8080"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://dev_user:dev_password@db:5432/es_international_dev
    volumes:
      - .:/src
      - /src/node_modules
    depends_on:
      - db
    command: ["npm", "run", "dev"]

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: es_international_dev
      POSTGRES_USER: dev_user
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

volumes:
  postgres_dev_data:
```

#### Production Environment | 生產環境
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    image: kcislk-esid-info-hub:latest
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.es-international.rule=Host(`your-domain.com`)"
      - "traefik.http.services.es-international.loadbalancer.server.port=8080"

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_prod_data:
```

## 🌍 Deployment Environments | 部署環境

### Local Development | 本地開發

```bash
# Start development environment | 啟動開發環境
docker-compose -f docker-compose.dev.yml up -d

# View logs | 查看日誌
docker-compose -f docker-compose.dev.yml logs -f app

# Stop services | 停止服務
docker-compose -f docker-compose.dev.yml down
```

### Staging Environment | 預備環境

```bash
# Build for staging | 為預備環境建置
docker build -t kcislk-esid-info-hub:staging .

# Run staging container | 運行預備環境容器
docker run -d \
  --name es-international-staging \
  -p 8080:8080 \
  -e NODE_ENV=staging \
  -e DATABASE_URL="${STAGING_DATABASE_URL}" \
  kcislk-esid-info-hub:staging
```

### Production Environment | 正式環境

```bash
# Build production image | 建置正式環境映像檔
docker build -t kcislk-esid-info-hub:latest .

# Run with production configuration | 使用正式環境配置運行
docker-compose -f docker-compose.prod.yml up -d

# Verify deployment | 驗證部署
curl http://localhost:8080/api/health
```

## ☁️ Cloud Deployment | 雲端部署

### Zeabur Deployment | Zeabur 部署

Zeabur automatically detects and builds Docker applications. Ensure your `Dockerfile` is in the root directory.

Zeabur 自動檢測並建置 Docker 應用程式。確保您的 `Dockerfile` 在根目錄中。

```bash
# Zeabur will automatically:
# 1. Detect Dockerfile
# 2. Build multi-stage image
# 3. Deploy to assigned port (8080)
# 4. Set up health checks
# 5. Configure environment variables
```

#### Zeabur Environment Configuration | Zeabur 環境配置
```bash
# Set in Zeabur dashboard | 在 Zeabur 控制台設定
NODE_ENV=production
DATABASE_URL=<your-zeabur-postgresql-url>
JWT_SECRET=<your-jwt-secret>
NEXTAUTH_SECRET=<your-nextauth-secret>
NEXTAUTH_URL=<your-zeabur-app-url>
```

### AWS ECS Deployment | AWS ECS 部署

```yaml
# ecs-task-definition.json
{
  "family": "kcislk-esid-info-hub",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "es-international-app",
      "image": "your-registry/kcislk-esid-info-hub:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:database-url"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8080/api/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/kcislk-esid-info-hub",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Google Cloud Run | Google Cloud Run 部署

```bash
# Build and push to Google Container Registry | 建置並推送到 Google Container Registry
docker build -t gcr.io/PROJECT-ID/kcislk-esid-info-hub:latest .
docker push gcr.io/PROJECT-ID/kcislk-esid-info-hub:latest

# Deploy to Cloud Run | 部署到 Cloud Run
gcloud run deploy kcislk-esid-info-hub \
  --image gcr.io/PROJECT-ID/kcislk-esid-info-hub:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars NODE_ENV=production \
  --set-env-vars DATABASE_URL=postgresql://... \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

## 🔍 Monitoring & Health Checks | 監控與健康檢查

### Docker Health Check | Docker 健康檢查

The Dockerfile includes a built-in health check:

Dockerfile 包含內建的健康檢查：

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1
```

### Monitoring Commands | 監控命令

```bash
# Check container health | 檢查容器健康狀態
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# View container logs | 查看容器日誌
docker logs -f kcislk-esid-info-hub

# Check resource usage | 檢查資源使用情況
docker stats kcislk-esid-info-hub

# Execute commands in running container | 在運行中的容器執行命令
docker exec -it kcislk-esid-info-hub sh

# Health check endpoint | 健康檢查端點
curl http://localhost:8080/api/health
```

### Application Metrics | 應用程式指標

```bash
# Database connection status | 資料庫連接狀態
docker exec kcislk-esid-info-hub npm run test:db

# Next.js build information | Next.js 建置資訊
docker exec kcislk-esid-info-hub cat .next/BUILD_ID

# Prisma schema validation | Prisma 模式驗證
docker exec kcislk-esid-info-hub npx prisma validate
```

## 🛠️ Development Workflow | 開發工作流程

### Docker Development Setup | Docker 開發環境設定

```bash
# 1. Start development containers | 啟動開發容器
docker-compose -f docker-compose.dev.yml up -d

# 2. Install dependencies inside container | 在容器內安裝依賴
docker-compose -f docker-compose.dev.yml exec app npm install

# 3. Generate Prisma client | 生成 Prisma 客戶端
docker-compose -f docker-compose.dev.yml exec app npm run db:generate

# 4. Run database migrations | 執行資料庫遷移
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# 5. Start development server | 啟動開發伺服器
docker-compose -f docker-compose.dev.yml exec app npm run dev
```

### Hot Reload Development | 熱重載開發

```yaml
# docker-compose.dev.yml - Hot reload configuration
services:
  app:
    volumes:
      - .:/src
      - /src/node_modules  # Prevent overwriting node_modules
      - /src/.next         # Prevent overwriting .next build files
    environment:
      - WATCHPACK_POLLING=true  # Enable polling for file changes
```

### Database Development | 資料庫開發

```bash
# Access database directly | 直接存取資料庫
docker-compose -f docker-compose.dev.yml exec db psql -U dev_user -d es_international_dev

# Backup development database | 備份開發資料庫
docker-compose -f docker-compose.dev.yml exec db pg_dump -U dev_user es_international_dev > backup.sql

# Restore database from backup | 從備份恢復資料庫
docker-compose -f docker-compose.dev.yml exec -T db psql -U dev_user es_international_dev < backup.sql

# Open Prisma Studio | 開啟 Prisma Studio
docker-compose -f docker-compose.dev.yml exec app npm run db:studio
```

## 🚨 Troubleshooting | 故障排除

### Common Issues | 常見問題

#### 1. Container Build Failures | 容器建置失敗

```bash
# Clear Docker cache | 清除 Docker 快取
docker system prune -a

# Build with no cache | 無快取建置
docker build --no-cache -t kcislk-esid-info-hub .

# Check build logs | 檢查建置日誌
docker build -t kcislk-esid-info-hub . 2>&1 | tee build.log
```

#### 2. Database Connection Issues | 資料庫連接問題

```bash
# Test database connection | 測試資料庫連接
docker exec kcislk-esid-info-hub npm run test:db

# Check database logs | 檢查資料庫日誌
docker-compose logs db

# Verify environment variables | 驗證環境變數
docker exec kcislk-esid-info-hub env | grep DATABASE
```

#### 3. Port Conflicts | 埠口衝突

```bash
# Find processes using port 8080 | 查找使用 8080 埠口的程序
lsof -i :8080

# Kill processes on port 8080 | 終止使用 8080 埠口的程序
sudo kill -9 $(lsof -t -i:8080)

# Use different port mapping | 使用不同的埠口映射
docker run -p 3001:8080 kcislk-esid-info-hub
```

#### 4. Memory Issues | 記憶體問題

```bash
# Increase Docker memory limit | 增加 Docker 記憶體限制
# For Docker Desktop: Settings > Resources > Memory > 4GB+

# Monitor container memory usage | 監控容器記憶體使用
docker stats --no-stream kcislk-esid-info-hub

# Set container memory limit | 設定容器記憶體限制
docker run --memory="1g" kcislk-esid-info-hub
```

### Debug Mode | 除錯模式

```bash
# Run container in debug mode | 以除錯模式運行容器
docker run -it --rm \
  -p 8080:8080 \
  -e NODE_ENV=development \
  -e DEBUG=* \
  kcislk-esid-info-hub

# Access container shell for debugging | 存取容器 shell 進行除錯
docker run -it --rm --entrypoint /bin/sh kcislk-esid-info-hub

# Check Next.js build output | 檢查 Next.js 建置輸出
docker exec kcislk-esid-info-hub ls -la .next/
```

## 📊 Performance Optimization | 效能優化

### Build Performance | 建置效能

```dockerfile
# Optimize Docker build with BuildKit
# export DOCKER_BUILDKIT=1

# Use .dockerignore to exclude unnecessary files
# .dockerignore:
node_modules
.git
.next
output
logs
tmp
*.log
```

### Runtime Performance | 運行時效能

```bash
# Production optimizations | 生產環境優化
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Memory optimization | 記憶體優化
NODE_OPTIONS="--max-old-space-size=1024"

# Database connection pooling | 資料庫連接池
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20"
```

### Image Size Optimization | 映像檔大小優化

```bash
# Analyze image layers | 分析映像檔層
docker history kcislk-esid-info-hub

# Use dive tool for detailed analysis | 使用 dive 工具詳細分析
dive kcislk-esid-info-hub

# Multi-arch builds for different platforms | 多架構建置支援不同平台
docker buildx build --platform linux/amd64,linux/arm64 -t kcislk-esid-info-hub .
```

## 🔐 Security Best Practices | 安全最佳實踐

### Container Security | 容器安全

```dockerfile
# Security features in our Dockerfile:
# 1. Non-root user (nextjs:nodejs)
# 2. Minimal base image (node:22-slim)
# 3. No unnecessary packages
# 4. Read-only file system where possible
# 5. Health checks for monitoring
```

### Environment Security | 環境安全

```bash
# Use Docker secrets for sensitive data | 使用 Docker secrets 處理敏感資料
echo "your-database-password" | docker secret create db_password -

# Scan image for vulnerabilities | 掃描映像檔漏洞
docker scout quickview kcislk-esid-info-hub
docker scout cves kcislk-esid-info-hub

# Run security benchmark | 執行安全基準測試
docker run --rm -it \
  -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image kcislk-esid-info-hub
```

## 📋 Checklists | 檢查清單

### Pre-deployment Checklist | 部署前檢查清單

- [ ] ✅ Docker image builds successfully | Docker 映像檔建置成功
- [ ] ✅ Environment variables configured | 環境變數已配置
- [ ] ✅ Database connection tested | 資料庫連接已測試
- [ ] ✅ Health check endpoint working | 健康檢查端點正常運作
- [ ] ✅ Security scan passed | 安全掃描通過
- [ ] ✅ Performance benchmarks met | 效能基準達標
- [ ] ✅ Backup strategy in place | 備份策略已就緒

### Post-deployment Checklist | 部署後檢查清單

- [ ] ✅ Application accessible via browser | 應用程式可透過瀏覽器存取
- [ ] ✅ Health checks passing | 健康檢查通過
- [ ] ✅ Database migrations completed | 資料庫遷移完成
- [ ] ✅ Monitoring alerts configured | 監控警報已配置
- [ ] ✅ Log aggregation working | 日誌聚合正常運作
- [ ] ✅ SSL certificates valid | SSL 憑證有效
- [ ] ✅ CDN/Load balancer configured | CDN/負載均衡器已配置

## 🎯 Next Steps | 下一步

1. **Set up CI/CD Pipeline** | **設定 CI/CD 流水線**
   - Implement automated testing and deployment
   - Configure staging and production environments

2. **Implement Monitoring** | **實作監控**
   - Set up application performance monitoring
   - Configure log aggregation and alerting

3. **Optimize Performance** | **優化效能**
   - Implement caching strategies
   - Optimize database queries and indexing

4. **Enhance Security** | **強化安全性**
   - Regular security audits and updates
   - Implement secrets management

---

*This Docker deployment guide provides a comprehensive foundation for containerizing and deploying the KCISLK ESID Info Hub application. For additional support, refer to the troubleshooting section or contact the development team.*

*此 Docker 部署指南為 KCISLK ESID Info Hub 應用程式的容器化和部署提供了全面的基礎。如需額外支援，請參考故障排除部分或聯繫開發團隊。*