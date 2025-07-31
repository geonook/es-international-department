# Zeabur Deployment Guide & Development Workflow
*ES International Department - Zeabur 部署指南與開發協作流程*

## 📋 目錄 | Table of Contents
1. [Zeabur 平台概述](#zeabur-平台概述)
2. [多環境架構設計](#多環境架構設計)
3. [初始設定指南](#初始設定指南)
4. [開發協作流程](#開發協作流程)
5. [部署流程指南](#部署流程指南)
6. [環境管理策略](#環境管理策略)
7. [故障排除指南](#故障排除指南)
8. [最佳實踐建議](#最佳實踐建議)

---

## 🌐 Zeabur 平台概述 | Zeabur Platform Overview

### 什麼是 Zeabur？
Zeabur 是一個現代化的雲端部署平台，專為開發者設計，提供：
- **一鍵部署**: 直接從 GitHub 儲存庫部署
- **自動擴展**: 根據流量自動調整資源
- **多環境支援**: 支援開發、測試、生產環境
- **資料庫託管**: 提供 PostgreSQL、MySQL、Redis 等託管服務
- **全球 CDN**: 自動優化靜態資源分發

### 為什麼選擇 Zeabur？
✅ **簡化部署**: 無需 DevOps 知識，專注業務開發  
✅ **成本效益**: 按需付費，開發環境可免費使用  
✅ **高可用性**: 99.9% 正常運行時間保證  
✅ **開發友好**: 優秀的開發者體驗與工具整合  

---

## 🏗️ 多環境架構設計 | Multi-Environment Architecture

### 環境劃分策略
```
┌─────────────────────────────────────────────────────────────────┐
│                    ES International Department                  │
│                        Zeabur 多環境架構                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Staging     │    │   Production    │
│    開發環境      │    │    預備環境      │    │    正式環境      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│                 │    │                 │    │                 │
│ 🎯 目的:         │    │ 🎯 目的:         │    │ 🎯 目的:         │
│  本地開發測試    │    │  功能驗證測試    │    │  正式營運服務    │
│                 │    │                 │    │                 │
│ 📊 資料:         │    │ 📊 資料:         │    │ 📊 資料:         │
│  測試範例資料    │    │  模擬真實資料    │    │  正式營運資料    │
│                 │    │                 │    │                 │
│ 🚀 部署:         │    │ 🚀 部署:         │    │ 🚀 部署:         │
│  自動部署        │    │  自動部署        │    │  手動確認部署    │
│  (dev branch)   │    │ (staging branch)│    │  (main branch)  │
│                 │    │                 │    │                 │
│ 👥 存取:         │    │ 👥 存取:         │    │ 👥 存取:         │
│  開發團隊        │    │  測試團隊        │    │  所有使用者      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 資料庫環境隔離
```sql
-- Development Database
es_international_dev
├── 開發測試資料
├── 範例使用者帳戶
├── 模擬公告與活動
└── 實驗性功能測試

-- Staging Database  
es_international_staging
├── 接近真實的測試資料
├── 完整功能驗證
├── 效能壓力測試
└── 整合測試環境

-- Production Database
es_international_prod
├── 正式營運資料
├── 真實使用者資料
├── 完整備份機制
└── 高可用性配置
```

---

## ⚙️ 初始設定指南 | Initial Setup Guide

### 步驟 1: Zeabur 帳戶設定
1. **註冊 Zeabur 帳戶**
   - 前往 [https://dash.zeabur.com](https://dash.zeabur.com)
   - 使用 GitHub 帳戶登入

2. **連接 GitHub 儲存庫**
   - 授權 Zeabur 存取您的 GitHub 儲存庫
   - 選擇 `es-international-department` 專案

### 步驟 2: 建立多環境資料庫
```bash
# 在 Zeabur 控制台建立三個 PostgreSQL 資料庫實例

# 1. Development Database
名稱: es-international-dev
版本: PostgreSQL 15
規格: Starter (免費額度)
區域: ap-east (亞太地區)

# 2. Staging Database  
名稱: es-international-staging
版本: PostgreSQL 15
規格: Pro (付費，較大資源)
區域: ap-east (亞太地區)

# 3. Production Database
名稱: es-international-prod
版本: PostgreSQL 15
規格: Team (高可用性)
區域: ap-east (亞太地區)
```

### 步驟 3: 環境變數配置
```bash
# 從 Zeabur 控制台取得資料庫連接字串
# Database → Connection → Connection String

# Development Environment
DATABASE_URL="postgresql://dev_user:dev_pass@dev-db.zeabur.com:5432/es_international_dev"

# Staging Environment
DATABASE_URL="postgresql://stage_user:stage_pass@stage-db.zeabur.com:5432/es_international_staging"

# Production Environment  
DATABASE_URL="postgresql://prod_user:prod_pass@prod-db.zeabur.com:5432/es_international_prod"
```

### 步驟 4: 本地開發環境設定
```bash
# 1. 安裝相依套件
npm install

# 2. 複製環境變數範本
cp .env.example .env.development

# 3. 編輯 .env.development，填入 Zeabur 開發資料庫連接字串
DATABASE_URL="your-zeabur-dev-database-url"
JWT_SECRET="your-jwt-secret-32-chars-minimum"
NEXTAUTH_SECRET="your-nextauth-secret-32-chars-minimum"
NEXTAUTH_URL="http://localhost:3000"

# 4. 驗證環境配置
npm run env:check
npm run test:db

# 5. 初始化資料庫
npm run db:migrate:deploy
npm run db:seed

# 6. 啟動開發伺服器
npm run dev
```

---

## 🤝 開發協作流程 | Development Workflow

### Git 分支策略
```
main (production)
├── staging (pre-production)
│   ├── feature/user-authentication
│   ├── feature/announcement-system
│   └── feature/resource-management
└── dev (development)
    ├── bugfix/login-issue
    ├── hotfix/security-patch
    └── enhancement/ui-improvements
```

### 分支對應環境
| 分支 | 環境 | 自動部署 | 資料庫 |
|------|------|----------|--------|
| `dev` | Development | ✅ 是 | Zeabur Dev DB |
| `staging` | Staging | ✅ 是 | Zeabur Staging DB |
| `main` | Production | ❌ 手動 | Zeabur Prod DB |

### 開發工作流程
```mermaid
graph TD
    A[本地開發] --> B[測試通過]
    B --> C[提交到 dev 分支]
    C --> D[自動部署到 Development]
    D --> E[開發環境驗證]
    E --> F[合併到 staging 分支]
    F --> G[自動部署到 Staging]
    G --> H[功能測試驗證]
    H --> I[合併到 main 分支]
    I --> J[手動部署到 Production]
    J --> K[正式環境上線]
```

### 日常開發流程
```bash
# 1. 建立功能分支
git checkout dev
git pull origin dev
git checkout -b feature/new-announcement-system

# 2. 進行開發工作
# ... 開發與測試 ...

# 3. 提交變更
git add .
git commit -m "feat: add announcement system with CRUD operations

- Add announcement management UI
- Implement announcement API endpoints  
- Add role-based permission control
- Include unit tests for announcement service

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 4. 推送到遠端儲存庫
git push origin feature/new-announcement-system

# 5. 建立 Pull Request
# 透過 GitHub 介面建立 PR 到 dev 分支

# 6. 程式碼審查與合併
# 團隊成員審查後合併到 dev 分支
# Zeabur 自動部署到開發環境

# 7. 開發環境驗證
# 在 https://dev.es-international.zeabur.app 驗證功能

# 8. 提升到 Staging 環境
git checkout staging
git pull origin staging
git merge dev
git push origin staging
# Zeabur 自動部署到預備環境

# 9. Staging 環境驗證
# 在 https://staging.es-international.zeabur.app 進行完整測試

# 10. 部署到正式環境
git checkout main
git pull origin main
git merge staging
git push origin main
# 手動觸發 Zeabur 部署到正式環境
```

---

## 🚀 部署流程指南 | Deployment Process Guide

### 自動部署配置
```yaml
# .zeabur/config.yaml
name: es-international-department

environments:
  development:
    branch: dev
    auto_deploy: true
    database: es-international-dev
    domain: dev.es-international.zeabur.app
    
  staging:
    branch: staging
    auto_deploy: true
    database: es-international-staging
    domain: staging.es-international.zeabur.app
    
  production:
    branch: main
    auto_deploy: false
    database: es-international-prod
    domain: es-international.zeabur.app
```

### 部署前檢查清單
**Development 環境:**
- [ ] ✅ 程式碼通過本地測試
- [ ] ✅ 環境變數設定正確
- [ ] ✅ 資料庫遷移腳本就緒

**Staging 環境:**
- [ ] ✅ Development 環境驗證通過
- [ ] ✅ 功能測試完成
- [ ] ✅ 效能測試通過
- [ ] ✅ 資料庫備份完成

**Production 環境:**
- [ ] ✅ Staging 環境驗證通過
- [ ] ✅ 安全性檢查完成
- [ ] ✅ 備份機制確認
- [ ] ✅ 監控告警設定
- [ ] ✅ 回滾計畫準備

### 部署指令
```bash
# Development 自動部署
git push origin dev
# Zeabur 自動觸發部署

# Staging 自動部署  
git push origin staging
# Zeabur 自動觸發部署

# Production 手動部署
# 1. 在 Zeabur 控制台手動觸發部署
# 2. 或使用 CLI 工具
zeabur deploy --env production --branch main

# 緊急回滾
zeabur rollback --env production --version previous
```

### 部署後驗證
```bash
# 1. 健康檢查
curl https://api.es-international.zeabur.app/health

# 2. 資料庫連接測試
npm run test:db

# 3. 功能驗證測試
npm run test:integration

# 4. 效能監控檢查
# 透過 Zeabur 控制台監控面板檢查
```

---

## 🔧 環境管理策略 | Environment Management Strategy

### 環境變數管理
```bash
# 開發環境配置 (.env.development)
NODE_ENV=development
DATABASE_URL=postgresql://dev_user:pass@dev-db.zeabur.com:5432/es_international_dev
NEXTAUTH_URL=http://localhost:3000
DEBUG=true

# 預備環境配置 (.env.staging)
NODE_ENV=staging  
DATABASE_URL=postgresql://stage_user:pass@stage-db.zeabur.com:5432/es_international_staging
NEXTAUTH_URL=https://staging.es-international.zeabur.app
DEBUG=false

# 正式環境配置 (.env.production)
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:pass@prod-db.zeabur.com:5432/es_international_prod
NEXTAUTH_URL=https://es-international.zeabur.app
DEBUG=false
SENTRY_DSN=https://your-sentry-dsn
```

### 資料庫遷移策略
```bash
# 開發環境 - 開發與測試階段
npm run db:migrate:dev        # 互動式遷移
npm run db:migrate:reset      # 重置資料庫
npm run db:seed               # 填入範例資料

# 預備環境 - 測試驗證階段  
npm run deploy:staging        # 部署遷移（無種子資料）
npm run db:migrate:deploy     # 僅執行遷移

# 正式環境 - 生產部署階段
npm run deploy:production     # 生產遷移部署
# 不包含範例資料，僅執行必要的資料庫結構變更
```

### 資料同步策略
```bash
# 從正式環境同步資料到預備環境（隱私資料遮蔽）
npm run backup:production
npm run restore:staging --anonymize

# 備份正式環境資料
npm run backup:production --full

# 定期清理開發環境資料
npm run cleanup:development --keep-schema
```

---

## 🛠️ 故障排除指南 | Troubleshooting Guide

### 常見問題與解決方案

#### 1. 資料庫連接失敗
```bash
❌ Error: P1001: Can't reach database server

🔍 可能原因:
- DATABASE_URL 格式錯誤
- Zeabur 資料庫服務異常
- 網路連線問題

✅ 解決方案:
# 1. 檢查資料庫 URL 格式
npm run env:validate

# 2. 測試資料庫連接
npm run test:db

# 3. 檢查 Zeabur 服務狀態
curl -I https://status.zeabur.com

# 4. 重新獲取連接字串
# 前往 Zeabur 控制台 → Database → Connection String
```

#### 2. 部署失敗
```bash
❌ Error: Build failed with exit code 1

🔍 檢查步驟:
# 1. 檢查建置日誌
zeabur logs --env development --service web

# 2. 驗證環境變數
npm run env:check

# 3. 本地重現問題
npm run build

# 4. 檢查 Prisma 客戶端生成
npm run db:generate
```

#### 3. 遷移失敗
```bash
❌ Error: Migration failed

🔍 解決步驟:
# 1. 檢查遷移狀態
npx prisma migrate status

# 2. 解決遷移衝突
npx prisma migrate resolve --rolled-back 20231201000000_migration_name

# 3. 強制重新同步（僅開發環境）
npx prisma db push --force-reset
```

#### 4. 環境變數遺失
```bash
❌ Error: Environment variable not found

✅ 解決步驟:
# 1. 檢查 Zeabur 控制台環境變數設定
# 2. 確認變數名稱拼寫正確
# 3. 重新部署服務
zeabur redeploy --env production
```

### 監控與除錯工具
```bash
# 即時日誌監控
zeabur logs --follow --env production

# 效能監控
npm run monitor:performance

# 資料庫查詢分析
npm run db:studio

# 錯誤追蹤
# 透過 Sentry 或 Zeabur 內建監控查看錯誤報告
```

---

## 📋 最佳實踐建議 | Best Practices

### 🔒 安全性最佳實踐
1. **環境變數安全**
   - 絕不在程式碼中硬編碼機密資訊
   - 使用強密碼和隨機產生的密鑰
   - 定期輪換敏感憑證

2. **資料庫安全**
   - 啟用 SSL/TLS 連接加密
   - 實施最小權限原則
   - 定期備份與災難恢復測試

3. **應用程式安全**
   - 實施 HTTPS 強制跳轉
   - 配置安全標頭 (CSP, HSTS 等)
   - 定期更新相依套件

### ⚡ 效能最佳實踐
1. **資料庫效能**
   ```sql
   -- 建立適當索引
   CREATE INDEX idx_announcements_published 
   ON announcements(status, published_at DESC);
   
   -- 定期分析查詢效能
   EXPLAIN ANALYZE SELECT * FROM announcements 
   WHERE status = 'published';
   ```

2. **應用程式效能**
   ```typescript
   // 使用 React Query 快取
   const { data } = useQuery(['announcements'], fetchAnnouncements, {
     staleTime: 5 * 60 * 1000, // 5分鐘
   })
   
   // 實施分頁載入
   const { data, fetchNextPage } = useInfiniteQuery(
     ['resources', gradeLevel],
     ({ pageParam = 0 }) => fetchResources(gradeLevel, pageParam)
   )
   ```

3. **Zeabur 平台最佳化**
   - 啟用 CDN 加速靜態資源
   - 配置適當的快取標頭
   - 使用壓縮減少傳輸大小

### 📊 監控與維護
1. **主動監控**
   ```bash
   # 設定健康檢查端點
   # /api/health
   export async function GET() {
     const dbHealth = await prisma.$queryRaw`SELECT 1`
     return Response.json({ 
       status: 'healthy',
       database: 'connected',
       timestamp: new Date().toISOString()
     })
   }
   ```

2. **效能監控**
   - 追蹤關鍵指標：回應時間、錯誤率、資料庫查詢時間
   - 設定告警閾值：超過 2 秒回應時間、錯誤率 > 1%
   - 定期檢查資源使用率

3. **備份策略**
   - 每日自動備份資料庫
   - 每週完整系統備份
   - 每月災難恢復演練

### 🤝 團隊協作最佳實踐
1. **程式碼品質**
   ```bash
   # 提交前檢查
   npm run lint
   npm run typecheck
   npm run test
   
   # 提交訊息規範
   feat: add user authentication system
   fix: resolve login redirect issue
   docs: update deployment guide
   ```

2. **程式碼審查**
   - 所有變更都需要經過 Pull Request
   - 至少一位團隊成員審查
   - 自動化測試必須通過

3. **文檔維護**
   - 保持 README.md 更新
   - 記錄重要的架構決策
   - 維護 API 文檔

---

## 🎯 總結 | Summary

這份 Zeabur 部署指南提供了完整的多環境部署策略，確保 ES International Department 系統能夠：

✅ **安全可靠地**在雲端環境運行  
✅ **高效地**支援開發團隊協作  
✅ **彈性地**應對不同環境需求  
✅ **自動化地**處理部署與維護工作  

遵循這些指南與最佳實踐，您的團隊將能夠充分利用 Zeabur 平台的優勢，打造一個現代化、可擴展的教育管理系統。

---

**📞 需要協助？**
- 📧 技術支援：[your-team@example.com](mailto:your-team@example.com)
- 📚 Zeabur 文檔：[https://docs.zeabur.com](https://docs.zeabur.com)
- 🐛 問題回報：[GitHub Issues](https://github.com/your-org/es-international-department/issues)

**🎉 祝您使用 Zeabur 部署愉快！**