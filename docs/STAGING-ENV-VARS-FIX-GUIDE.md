# Staging 環境變數修正指南
# Staging Environment Variables Fix Guide

> **Date**: 2025-09-05  
> **Issue**: Google OAuth "存取權被封鎖" 錯誤  
> **Solution**: 修正 staging 環境變數中的域名和資料庫設定

## 🚨 問題診斷

### 當前問題：
1. ❌ **NEXTAUTH_URL**: `https://staging.your-domain.com` (錯誤的佔位符域名)
2. ❌ **ALLOWED_ORIGINS**: `https://staging.your-domain.com` (錯誤的佔位符域名)  
3. ❌ **DATABASE_URL**: `postgres://user:password@zeabur-db.com:5432/db?schema=es_staging` (錯誤的佔位符連線)

### 實際需要：
- ✅ **Staging 域名**: `https://next14-landing.zeabur.app`
- ✅ **實際資料庫**: 使用正確的 Zeabur PostgreSQL 連線

## 🛠️ 修正後的完整環境變數

### 在 Zeabur Dashboard 中設定以下變數：

```env
# === 核心環境設定 ===
NODE_ENV=staging

# === 認證配置 ===
JWT_SECRET=Tr4q2KulnbpxWMsUneujJe/G6M+6lF1N2On6DtAUfDI=
NEXTAUTH_SECRET=QIXalhOBH2bn4i22VC4Pc2e8wg/6mkBh0tRuKsO7hiE=

# === 域名配置（關鍵修正）===
NEXTAUTH_URL=https://next14-landing.zeabur.app
ALLOWED_ORIGINS=https://next14-landing.zeabur.app

# === Google OAuth 配置 ===
GOOGLE_CLIENT_ID=YOUR_ACTUAL_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_ACTUAL_GOOGLE_CLIENT_SECRET

# === 資料庫配置（關鍵修正）===
DATABASE_URL=postgresql://root:C1iy0Z9n6YFSGJE3p2TMUg78KR5DLeB4@tpe1.clusters.zeabur.com:32718/zeabur

# === 郵件服務配置 ===
EMAIL_PROVIDER=disabled

# === 速率限制配置（建議添加）===
RATE_LIMIT_MAX_REQUESTS=500
RATE_LIMIT_WINDOW_MS=900000

# === 開發工具配置（建議添加）===
PRISMA_CLI_TELEMETRY_DISABLED=1
SKIP_ENV_VALIDATION=0
```

## ⚠️ 需要移除的變數

以下變數是 Zeabur 內部使用的，可以安全移除：

```env
# 移除這些變數：
POSTGRESQL_HOST=service-688ad426aee732f24e5f0616
POSTGRESQL_PROUSE_HOST=service-688adc2eaee732f24e5f10d0
LANDING_APP_V2_HOST=service-688ae4c9c92986c6a1f9ae84
POSTGRESQL_NOCE_HOST=service-688adc2eaee732f24e5f10ea
PARENTS_CORNER_HOST=service-68b855cbfac0a26fd56c4596
```

## 🎯 逐步執行指南

### Step 1: 登入 Zeabur Dashboard
1. 前往 [Zeabur Dashboard](https://dash.zeabur.com)
2. 選擇您的 staging 服務項目

### Step 2: 更新環境變數
1. 找到 "Environment Variables" 或"環境變數" 區域
2. **修正以下三個關鍵變數：**

   **NEXTAUTH_URL:**
   ```
   從: https://staging.your-domain.com  
   改為: https://next14-landing.zeabur.app
   ```

   **ALLOWED_ORIGINS:**
   ```
   從: https://staging.your-domain.com
   改為: https://next14-landing.zeabur.app  
   ```

   **DATABASE_URL:**
   ```
   從: postgres://user:password@zeabur-db.com:5432/db?schema=es_staging
   改為: postgresql://root:C1iy0Z9n6YFSGJE3p2TMUg78KR5DLeB4@tpe1.clusters.zeabur.com:32718/zeabur
   ```

### Step 3: 移除不需要的變數
移除所有以 `_HOST` 結尾的變數

### Step 4: 添加建議的新變數
```env
RATE_LIMIT_MAX_REQUESTS=500
RATE_LIMIT_WINDOW_MS=900000
PRISMA_CLI_TELEMETRY_DISABLED=1
SKIP_ENV_VALIDATION=0
```

### Step 5: 儲存並等待部署
- 點擊"Save" 或"儲存"
- Zeabur 會自動觸發重新部署
- 等待 2-3 分鐘讓部署完成

## 🧪 測試修正結果

### 1. 健康檢查
```bash
curl https://next14-landing.zeabur.app/api/health
```

### 2. 測試 OAuth 登入
1. 前往 https://next14-landing.zeabur.app/login
2. 點擊 "使用 Google 帳戶登入" 
3. **應該不再顯示 "存取權被封鎖" 錯誤**
4. 應該正常跳轉到 Google 授權頁面

### 3. 完整功能測試
- [ ] 首頁載入正常
- [ ] 登入功能正常
- [ ] 使用者資料正確顯示
- [ ] 資料庫操作正常

## 🔧 故障排除

### 如果仍然顯示 "存取權被封鎖"：

1. **檢查 Google Console 設定**：
   - 前往 [Google Cloud Console](https://console.cloud.google.com/)
   - 確認已添加 `next14-landing.zeabur.app` 到 authorized domains
   - 確認已添加 `https://next14-landing.zeabur.app/api/auth/callback/google` 到 redirect URIs

2. **等待設定生效**：
   - Google OAuth 設定可能需要 5-10 分鐘生效
   - 清除瀏覽器快取和 cookies

3. **檢查部署狀態**：
   - 在 Zeabur Dashboard 查看部署日誌
   - 確認沒有環境變數驗證錯誤

### 如果資料庫連線失敗：

1. **檢查 DATABASE_URL**：
   ```
   postgresql://root:C1iy0Z9n6YFSGJE3p2TMUg78KR5DLeB4@tpe1.clusters.zeabur.com:32718/zeabur
   ```
   - 確認用戶名、密碼、主機、埠號、資料庫名稱都正確

2. **檢查資料庫狀態**：
   - 在 Zeabur Dashboard 查看 PostgreSQL 服務是否運行正常

## ✅ 成功指標

修正完成後，您應該看到：

- ✅ **OAuth 登入**: 不再有 "存取權被封鎖" 錯誤
- ✅ **資料庫**: 應用能正常連接並操作資料
- ✅ **健康檢查**: `/api/health` 端點返回正常狀態  
- ✅ **功能**: 所有頁面和功能正常運作

## 📝 變更記錄

| 變數名稱 | 原始值 | 修正值 | 狀態 |
|---------|-------|-------|------|
| NEXTAUTH_URL | `https://staging.your-domain.com` | `https://next14-landing.zeabur.app` | 🔧 必須修改 |
| ALLOWED_ORIGINS | `https://staging.your-domain.com` | `https://next14-landing.zeabur.app` | 🔧 必須修改 |  
| DATABASE_URL | 佔位符連線字串 | 實際 PostgreSQL 連線 | 🔧 必須修改 |
| NODE_ENV | `staging` | `staging` | ✅ 保持不變 |
| EMAIL_PROVIDER | `disabled` | `disabled` | ✅ 保持不變 |
| JWT_SECRET | 現有值 | 現有值 | ✅ 保持不變 |
| NEXTAUTH_SECRET | 現有值 | 現有值 | ✅ 保持不變 |

---
**修正完成後，staging 環境應該完全正常運作，OAuth 登入問題將被解決！**

Generated: 2025-09-05  
Target: https://next14-landing.zeabur.app