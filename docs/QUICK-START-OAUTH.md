# 🚀 Google OAuth 快速設定指南
# Google OAuth Quick Setup Guide

> **⚡ 5分鐘完成 Google OAuth 設定並開始測試**  
> **⚡ Complete Google OAuth setup and start testing in 5 minutes**

## 📝 設定檢查清單 | Setup Checklist

### ✅ 已完成 | Completed
- [x] ✅ OAuth 系統實作完成
- [x] ✅ 資料庫 schema 已更新
- [x] ✅ 測試工具和文件已準備
- [x] ✅ 開發環境配置就緒

### 🔄 需要完成 | To Complete
- [ ] 🎯 Google Developer Console 設定
- [ ] 🔑 環境變數配置
- [ ] 🧪 OAuth 流程測試

---

## 🎯 第一步：Google Console 設定
## Step 1: Google Console Setup

### 1.1 前往 Google Cloud Console
```
🔗 https://console.developers.google.com/
```

### 1.2 創建專案（如需要）
```
專案名稱：KCISLK ESID Info Hub OAuth
```

### 1.3 啟用 API
```
前往：API 和服務 > 程式庫
搜尋並啟用：Google+ API
```

### 1.4 創建 OAuth 憑證
```
前往：API 和服務 > 憑證
點擊：+ 建立憑證 > OAuth 客戶端 ID
應用程式類型：Web 應用程式
```

### 1.5 設定重定向 URI
```
開發環境：
http://localhost:3000/api/auth/callback/google

生產環境：
https://kcislk-esid.zeabur.app/api/auth/callback/google
```

---

## 🔑 第二步：環境變數配置
## Step 2: Environment Configuration

### 2.1 複製環境配置範本
```bash
cp .env.local.example .env.local
```

### 2.2 填入 Google OAuth 憑證
```bash
# 編輯 .env.local 檔案
GOOGLE_CLIENT_ID="你的-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="你的-google-client-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 2.3 確認資料庫連接
```bash
DATABASE_URL="你的-zeabur-database-url"
JWT_SECRET="你的-jwt-secret-key"
```

---

## 🧪 第三步：測試驗證
## Step 3: Testing & Validation

### 3.1 運行配置測試
```bash
npm run test:oauth-config
```
**預期結果：** 應顯示所有測試通過 ✅

### 3.2 啟動開發伺服器
```bash
npm run dev
```

### 3.3 測試 OAuth 流程
```
🌐 前往：http://localhost:3000/test-oauth
點擊「測試 Google OAuth 登入」按鈕
完成 Google 認證流程
```

### 3.4 驗證功能
- [ ] 新用戶成功註冊
- [ ] 自動角色分配
- [ ] 歡迎頁面顯示
- [ ] JWT token 生成
- [ ] 用戶資料正確儲存

---

## 🎉 成功指標 | Success Indicators

### ✅ 配置測試通過
```bash
$ npm run test:oauth-config
🎉 All tests passed! (100%)
✅ Google OAuth system is ready for testing!
```

### ✅ OAuth 流程成功
1. **Google 認證**：成功重定向到 Google
2. **用戶授權**：用戶同意授權後返回
3. **自動註冊**：新用戶自動創建帳戶
4. **角色分配**：根據 email 域名分配角色
5. **歡迎頁面**：重定向到 `/welcome` 頁面

### ✅ 登入頁面整合
```
🌐 前往：http://localhost:3000/login
看到「使用 Google 登入」按鈕
點擊後成功完成 OAuth 流程
```

---

## 🐛 常見問題排除 | Troubleshooting

### ❌ 錯誤：redirect_uri_mismatch
**原因：** 重定向 URI 不匹配  
**解決：** 檢查 Google Console 中的 URI 設定
```
確保完全匹配：http://localhost:3000/api/auth/callback/google
```

### ❌ 錯誤：invalid_client
**原因：** OAuth 憑證錯誤  
**解決：** 檢查 `.env.local` 中的憑證
```bash
# 確認憑證格式正確
GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"
```

### ❌ 配置測試失敗
**解決步驟：**
1. 檢查環境變數是否正確設定
2. 確認資料庫連接正常
3. 重新啟動開發伺服器

---

## 📊 角色分配規則 | Role Assignment Rules

系統會根據用戶 email 域名自動分配角色：

```javascript
教育機構域名 → teacher 角色：
- @school.edu
- @university.edu

常見 email 域名 → parent 角色：
- @gmail.com
- @yahoo.com  
- @hotmail.com
- @outlook.com

其他域名 → parent 角色（預設）
```

---

## 🚀 下一步 | Next Steps

### 完成基本設定後：
1. **測試不同角色**：使用不同域名的 email 測試
2. **測試帳戶連結**：現有用戶連結 Google 帳戶
3. **準備生產部署**：設定 Zeabur 環境變數

### 生產環境部署：
1. 在 Zeabur 控制台設定環境變數
2. 更新 Google Console 生產 URI
3. 執行完整端到端測試

---

## 📞 支援 | Support

### 📋 檢查清單
- [ ] Google Console 專案已創建
- [ ] OAuth 憑證已生成
- [ ] 重定向 URI 已設定
- [ ] 環境變數已配置
- [ ] 配置測試通過
- [ ] OAuth 流程測試成功

### 🔧 測試命令
```bash
# 配置驗證
npm run test:oauth-config

# 啟動開發
npm run dev

# 測試頁面
http://localhost:3000/test-oauth

# 登入頁面
http://localhost:3000/login
```

### 📚 相關文件
- `docs/google-oauth-setup.md` - 詳細設定說明
- `.env.local.example` - 環境變數範本
- `scripts/test-oauth-config.ts` - 配置測試腳本

---

**🎯 目標：在 5-10 分鐘內完成 Google OAuth 設定並開始測試！**