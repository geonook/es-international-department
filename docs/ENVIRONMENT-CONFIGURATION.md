# 環境變數配置指南 | Environment Configuration Guide

> **📋 完整的環境變數設定說明** | **Complete Environment Variables Configuration Guide**  
> **建立日期**: 2025-08-08 | **Created**: 2025-08-08  
> **版本**: 1.0 | **Version**: 1.0

## 🎯 概述 | Overview

KCISLK ESID Info Hub 使用環境變數來管理不同環境（開發、測試、生產）的配置，確保敏感資訊的安全性和部署的靈活性。

KCISLK ESID Info Hub uses environment variables to manage configurations across different environments (development, testing, production), ensuring security of sensitive information and deployment flexibility.

## 📁 檔案結構 | File Structure

```
kcislk-esid-info-hub/
├── .env                    # 開發環境配置 (不提交到版本控制)
├── .env.example            # 環境變數範本 (提交到版本控制)
├── .env.development        # 開發環境專用配置
├── .env.staging           # 預備環境配置
├── .env.production        # 生產環境配置
└── lib/env-validation.ts  # Zod 環境變數驗證
```

## 🔧 核心配置項目 | Core Configuration Items

### 1. 資料庫配置 | Database Configuration

```bash
# Zeabur PostgreSQL 資料庫連接字串
DATABASE_URL="postgresql://username:password@host:port/database"
```

**取得方式 | How to obtain**:
1. 登入 Zeabur 控制台
2. 選擇您的專案和 PostgreSQL 服務
3. 複製連接字串

### 2. 身份驗證配置 | Authentication Configuration

```bash
# JWT 密鑰 (建議32位以上隨機字串)
JWT_SECRET="your-super-secret-jwt-key-here"

# NextAuth 會話密鑰
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth 憑證
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

**JWT_SECRET 生成方式 | JWT_SECRET Generation**:
```bash
# 使用 Node.js 生成 | Generate using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 使用 OpenSSL 生成 | Generate using OpenSSL
openssl rand -base64 32
```

### 3. Google OAuth 設定 | Google OAuth Setup

**步驟 | Steps**:
1. 前往 [Google Cloud Console](https://console.developers.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 Google+ API 和 Gmail API
4. 建立 OAuth 2.0 憑證
5. 新增授權重定向 URI:
   - 開發環境: `http://localhost:3000/api/auth/callback/google`
   - 生產環境: `https://your-domain.com/api/auth/callback/google`

### 4. 郵件服務配置 | Email Service Configuration

```bash
# SMTP 供應商選擇 | SMTP Provider Choice
EMAIL_PROVIDER="smtp"  # smtp, gmail, sendgrid, aws-ses

# Gmail SMTP 設定 | Gmail SMTP Settings
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"  # 使用應用程式密碼，非帳號密碼

# 寄件人資訊 | Sender Information
EMAIL_FROM="noreply@kcislk.ntpc.edu.tw"
EMAIL_FROM_NAME="KCISLK ESID Info Hub"
```

**Gmail 應用程式密碼設定 | Gmail App Password Setup**:
1. 啟用 Gmail 帳戶的兩步驟驗證
2. 前往 Google 帳戶設定 > 安全性 > 應用程式密碼
3. 生成專用的應用程式密碼

### 5. 安全性配置 | Security Configuration

```bash
# CORS 允許的來源 (以逗號分隔)
ALLOWED_ORIGINS="http://localhost:3000,https://your-domain.com"

# API 速率限制
RATE_LIMIT_MAX_REQUESTS="100"
RATE_LIMIT_WINDOW_MS="900000"  # 15 分鐘
```

## 🌍 多環境管理 | Multi-Environment Management

### 開發環境 | Development Environment
```bash
NODE_ENV="development"
DATABASE_URL="postgresql://dev-connection-string"
NEXTAUTH_URL="http://localhost:3000"
DEBUG="prisma:*"  # 啟用詳細日誌
```

### 生產環境 | Production Environment
```bash
NODE_ENV="production"
DATABASE_URL="postgresql://prod-connection-string"
NEXTAUTH_URL="https://your-domain.com"
SKIP_ENV_VALIDATION="1"  # 建置時跳過驗證
```

## 🔒 安全最佳實踐 | Security Best Practices

### ✅ 應該做的 | Do's
- 使用強隨機字串作為密鑰
- 不同環境使用不同的密鑰
- 定期輪替敏感密鑰
- 使用 `.env.example` 作為範本，不包含真實憑證

### ❌ 不應該做的 | Don'ts  
- **絕對不要**將 `.env` 檔案提交到版本控制
- **絕對不要**在程式碼中硬編碼敏感資訊
- **絕對不要**在日誌中記錄敏感資訊
- **絕對不要**共享包含真實憑證的 `.env` 檔案

## 🧪 環境驗證 | Environment Validation

專案使用 Zod 進行環境變數驗證 (`lib/env-validation.ts`):

```bash
# 驗證當前環境變數
pnpm env:validate

# 測試環境變數載入
pnpm env:check
```

### 常見錯誤和解決方案 | Common Errors and Solutions

**錯誤**: `❌ Environment validation failed: SMTP configuration incomplete`
```bash
# 解決方案：檢查郵件服務配置
EMAIL_PROVIDER="smtp"
EMAIL_HOST="smtp.gmail.com" 
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

**錯誤**: `DATABASE_URL is required`  
```bash
# 解決方案：確保資料庫連接字串正確
DATABASE_URL="postgresql://username:password@host:port/database"
```

## 🚀 部署配置 | Deployment Configuration

### Zeabur 部署 | Zeabur Deployment

1. 在 Zeabur 控制台設定環境變數
2. 不需要上傳 `.env` 檔案
3. 環境變數會自動注入到容器中

```bash
# Zeabur 特定配置
ZEABUR_REGION="ap-east"
SKIP_ENV_VALIDATION="1"  # 建置階段跳過驗證
```

## 📊 環境變數清單 | Environment Variables Checklist

### 🔴 必需配置 | Required
- [ ] `DATABASE_URL` - 資料庫連接
- [ ] `JWT_SECRET` - API 認證密鑰  
- [ ] `NEXTAUTH_SECRET` - 會話管理密鑰
- [ ] `NEXTAUTH_URL` - 應用程式 URL

### 🟡 重要配置 | Important
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth 客戶端 ID
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth 客戶端密鑰
- [ ] `EMAIL_HOST` - SMTP 主機
- [ ] `EMAIL_USER` - SMTP 使用者
- [ ] `EMAIL_PASS` - SMTP 密碼

### 🟢 可選配置 | Optional
- [ ] `REDIS_URL` - 快取服務
- [ ] `SENTRY_DSN` - 錯誤追蹤
- [ ] `GOOGLE_ANALYTICS_ID` - 分析服務

## 🛠️ 開發工具 | Development Tools

```bash
# 切換環境
pnpm env:switch

# 驗證環境變數
pnpm env:validate

# 測試資料庫連接
pnpm test:db

# 測試 OAuth 配置
pnpm test:oauth-config
```

## 📞 支援和疑難排解 | Support and Troubleshooting

**常見問題**:
1. **OAuth 登入失敗** → 檢查 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET`
2. **郵件發送失敗** → 檢查 SMTP 配置和應用程式密碼
3. **資料庫連接錯誤** → 確認 `DATABASE_URL` 格式和憑證

**獲取幫助**:
- 查看 `docs/troubleshooting.md`
- 執行環境診斷: `pnpm env:check`
- 檢查應用程式日誌

---

**📝 注意事項 | Important Notes**:
- 此文件提供設定指導，請勿包含真實憑證
- 定期檢查和更新環境配置
- 遵循安全最佳實踐保護敏感資訊

**🎯 下一步 | Next Steps**:
1. 複製 `.env.example` 為 `.env`
2. 按照此指南設定必要的環境變數
3. 使用 `pnpm env:validate` 驗證配置
4. 開始開發或部署應用程式

---

*Environment Configuration Guide v1.0 | KCISLK ESID Info Hub*  
*Created: 2025-08-08 | Status: Complete*