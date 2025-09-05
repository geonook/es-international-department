# 🧪 Staging 環境變數配置指南
## Staging Environment Variables Configuration Guide

**目標**: 為 Zeabur Staging 環境配置完整的環境變數  
**適用**: Staging 測試環境  
**更新時間**: 2025-09-05  

---

## 🎯 **Staging 環境變數完整清單**

### **📋 核心必需變數 (Critical)**

```env
# ==========================================
# 環境標識
# ==========================================
NODE_ENV=staging

# ==========================================
# 域名配置 (CRITICAL - 必須與實際 Staging 域名匹配)
# ==========================================
NEXTAUTH_URL=https://kcislk-infohub-staging.zeabur.app
ALLOWED_ORIGINS=https://kcislk-infohub-staging.zeabur.app

# ==========================================
# 資料庫配置
# ==========================================
# 選項A: 獨立 Staging 資料庫 (推薦)
DATABASE_URL=postgresql://staging_user:staging_password@staging_host:port/staging_db

# 選項B: 共用開發資料庫 (僅測試用)
# DATABASE_URL=postgresql://root:C1iy0Z9n6YFSGJE3p2TMUg78KR5DLeB4@tpe1.clusters.zeabur.com:32718/zeabur

# ==========================================
# 安全密鑰 (必須與 Production/Development 不同)
# ==========================================
JWT_SECRET=staging-jwt-secret-key-min-32-characters
NEXTAUTH_SECRET=staging-nextauth-secret-key-min-32-characters

# ==========================================
# Google OAuth 配置 (可與 Production 相同)
# ==========================================
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

### **🔧 系統配置變數**

```env
# ==========================================
# Email 服務配置 (使用已修復的 disabled 設定)
# ==========================================
EMAIL_PROVIDER=disabled

# ==========================================
# 安全配置 (比 Production 稍寬鬆，便於測試)
# ==========================================
RATE_LIMIT_MAX_REQUESTS=500
RATE_LIMIT_WINDOW_MS=900000

# ==========================================
# 系統工具配置
# ==========================================
PRISMA_CLI_TELEMETRY_DISABLED=1

# ==========================================
# Staging 專用測試配置
# ==========================================
ENABLE_DEBUG_LOGS=true
ENABLE_TEST_FEATURES=true
SHOW_DEBUG_INFO=true
ENABLE_SEED_DATA=true
```

---

## 🔑 **生成安全密鑰**

### **快速生成命令**:
```bash
# 生成 JWT_SECRET (32+ 字符)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"

# 生成 NEXTAUTH_SECRET (32+ 字符)  
node -e "console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
```

### **範例生成結果**:
```env
JWT_SECRET=staging-yVVJWVI6c3VjLKY0X6vNnaTRJVxHHu1zEvYaYWvwAAI=
NEXTAUTH_SECRET=staging-WtDE420rcUJjy7S1Fz6i2+Sksp/gHDq1v7wzkGSRqsE=
```

---

## 🌐 **Google OAuth Console 設定**

### **需要添加的重定向 URI**:
在 Google Cloud Console > APIs & Services > Credentials 中添加：

```
https://kcislk-infohub-staging.zeabur.app/api/auth/callback/google
```

### **完整的重定向 URI 清單**:
```
http://localhost:3001/api/auth/callback/google                          # 開發環境
https://kcislk-infohub-staging.zeabur.app/api/auth/callback/google     # 測試環境  
https://kcislk-infohub.zeabur.app/api/auth/callback/google             # 生產環境
```

---

## 📊 **多環境變數對比**

| 變數名稱 | Development | Staging | Production |
|---------|------------|---------|------------|
| `NODE_ENV` | development | **staging** | production |
| `NEXTAUTH_URL` | localhost:3001 | **staging-domain** | prod-domain |
| `DATABASE_URL` | dev-db:32718 | **staging-db** | prod-db:32312 |
| `JWT_SECRET` | dev-secret | **staging-secret** | prod-secret |
| `RATE_LIMIT_MAX_REQUESTS` | 1000 | **500** | 100 |
| `ENABLE_DEBUG_LOGS` | true | **true** | false |
| `ENABLE_TEST_FEATURES` | false | **true** | false |

---

## 🚀 **在 Zeabur 中設定步驟**

### **Step 1: 登入 Zeabur 控制台**
1. 前往 https://zeabur.com
2. 找到您的 Staging 服務 (如 landing-app-staging)
3. 點擊進入服務設定

### **Step 2: 配置環境變數**
1. 點擊 "Environment Variables" 標籤
2. 點擊 "Add Variable" 添加每個變數
3. 複製貼上上述環境變數清單
4. **重要**: 確保域名設定正確

### **Step 3: 儲存並重新部署**
1. 點擊 "Save" 儲存所有變數
2. 等待服務自動重新部署
3. 檢查部署日誌確認無錯誤

---

## ✅ **驗證 Staging 環境**

### **基本連線測試**:
```bash
# 1. 檢查網站存取
curl -I https://kcislk-infohub-staging.zeabur.app

# 2. 檢查 API 健康狀態
curl https://kcislk-infohub-staging.zeabur.app/api/health

# 3. 檢查 OAuth providers
curl https://kcislk-infohub-staging.zeabur.app/api/auth/providers
```

### **功能測試**:
1. **網站載入**: 訪問 staging URL，確認頁面正常顯示
2. **Google OAuth**: 測試登入流程完整性
3. **API 端點**: 確認各 API 端點正常回應
4. **資料庫連接**: 確認資料讀寫功能正常

---

## 🔍 **故障排除**

### **常見問題**:

**1. OAuth 重定向錯誤**
```
錯誤: redirect_uri_mismatch
解決: 檢查 Google Console 重定向 URI 設定
確認: NEXTAUTH_URL 環境變數正確
```

**2. 環境變數驗證失敗**
```
錯誤: Environment validation failed
解決: 確認所有必需變數已設定
特別檢查: JWT_SECRET, NEXTAUTH_SECRET 長度 >= 32 字符
```

**3. 資料庫連接失敗**
```
錯誤: Database connection failed
解決: 確認 DATABASE_URL 格式正確
檢查: 資料庫伺服器是否允許 Zeabur IP 存取
```

---

## 📋 **設定完成檢查清單**

### **環境變數設定**:
- [ ] ✅ `NODE_ENV=staging`
- [ ] ✅ `NEXTAUTH_URL` 設定為正確的 staging 域名
- [ ] ✅ `ALLOWED_ORIGINS` 匹配 staging 域名
- [ ] ✅ `DATABASE_URL` 指向 staging 資料庫
- [ ] ✅ `JWT_SECRET` 使用 staging 專用密鑰 (32+ 字符)
- [ ] ✅ `NEXTAUTH_SECRET` 使用 staging 專用密鑰 (32+ 字符)
- [ ] ✅ `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` 已設定
- [ ] ✅ `EMAIL_PROVIDER=disabled`

### **Google OAuth 設定**:
- [ ] ✅ 在 Google Console 添加 staging 重定向 URI
- [ ] ✅ 等待 Google OAuth 設定傳播 (5-10 分鐘)

### **功能驗證**:
- [ ] ✅ Staging 網站可正常存取
- [ ] ✅ API 健康檢查回傳正常
- [ ] ✅ Google OAuth 登入成功
- [ ] ✅ 資料庫連接正常
- [ ] ✅ 主要功能運作正常

---

## 🎉 **完成後的使用方式**

### **日常測試流程**:
```bash
# 1. 本地開發
git checkout develop
npm run dev  # localhost:3001

# 2. 推送到 Staging 測試  
git push origin develop  # 自動部署到 staging

# 3. 在 Staging 環境驗證
# 訪問: https://kcislk-infohub-staging.zeabur.app

# 4. 通過測試後發布到 Production
git checkout main
git merge develop
git push origin main  # 部署到 production
```

---

**🎯 完成此設定後，您將擁有完全獨立且安全的 Staging 測試環境！**

*Generated by Claude Code - Staging Environment Configuration Guide | v1.0.0*