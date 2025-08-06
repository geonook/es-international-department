# Google OAuth 設定指南
# Google OAuth Setup Guide

## 📋 設定步驟 | Setup Steps

### 1. Google Cloud Console 設定

1. **前往 Google Cloud Console**
   - 訪問：https://console.developers.google.com/
   - 登入您的 Google 帳戶

2. **創建或選擇專案**
   ```
   - 點擊專案選擇器
   - 選擇現有專案或點擊「新增專案」
   - 專案名稱：KCISLK ESID Info Hub
   ```

3. **啟用 Google+ API**
   ```
   - 前往「API 和服務」> 「程式庫」
   - 搜尋「Google+ API」
   - 點擊「啟用」
   ```

### 2. OAuth 2.0 憑證設定

1. **創建 OAuth 2.0 客戶端 ID**
   ```
   - 前往「API 和服務」> 「憑證」
   - 點擊「+ 建立憑證」> 「OAuth 客戶端 ID」
   ```

2. **配置 OAuth 同意畫面**
   ```
   應用程式名稱：KCISLK ESID Info Hub
   使用者支援電子郵件：esid@kcislk.ntpc.edu.tw
   開發人員聯絡資訊：esid@kcislk.ntpc.edu.tw
   ```

3. **設定應用程式類型**
   ```
   應用程式類型：Web 應用程式
   名稱：KCISLK ESID OAuth
   ```

### 3. 重定向 URI 設定

**開發環境**
```
http://localhost:3000/api/auth/callback/google
```

**生產環境**
```
https://your-domain.com/api/auth/callback/google
https://kcislk-esid.zeabur.app/api/auth/callback/google
```

### 4. 環境變數配置

複製並重命名 `.env.example` 為 `.env.local`：

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# 確保設定正確的 URL
NEXTAUTH_URL="http://localhost:3000"  # 開發環境
# NEXTAUTH_URL="https://kcislk-esid.zeabur.app"  # 生產環境
```

## 🧪 測試流程 | Testing Workflow

### 1. 啟動開發伺服器
```bash
npm run dev
```

### 2. 測試 OAuth 流程
1. 前往：http://localhost:3000/login
2. 點擊「使用 Google 登入」按鈕
3. 完成 Google 認證流程
4. 驗證重定向和用戶創建

### 3. 檢查功能
- [ ] 新用戶自動註冊
- [ ] 角色自動分配
- [ ] 歡迎頁面顯示
- [ ] JWT token 生成
- [ ] 現有用戶帳戶連結

## 🔒 安全考量 | Security Considerations

### 1. 域名驗證
- 確保重定向 URI 完全匹配
- 生產環境使用 HTTPS

### 2. 環境變數安全
- 絕對不要提交 `.env` 檔案到版本控制
- 在 Zeabur 控制台設定環境變數

### 3. OAuth 範圍限制
```javascript
// 目前範圍設定
scopes: [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
]
```

## 🚨 常見問題 | Troubleshooting

### 錯誤：redirect_uri_mismatch
```
解決方案：檢查 Google Console 中的重定向 URI 設定
確保與應用程式 URL 完全匹配
```

### 錯誤：invalid_client
```
解決方案：檢查 GOOGLE_CLIENT_ID 和 GOOGLE_CLIENT_SECRET
確保環境變數正確設定
```

### 錯誤：access_denied
```
解決方案：用戶拒絕授權或 OAuth 同意畫面配置問題
檢查同意畫面設定
```

## 📊 角色分配邏輯 | Role Assignment Logic

系統會根據 email 域名自動分配角色：

```javascript
const roleMapping = {
  'school.edu': 'teacher',      // 教育機構 → 教師
  'university.edu': 'teacher',  // 大學 → 教師
  'gmail.com': 'parent',        // Gmail → 家長
  'yahoo.com': 'parent',        // Yahoo → 家長
  'hotmail.com': 'parent',      // Hotmail → 家長
  'outlook.com': 'parent'       // Outlook → 家長
}
// 預設角色：parent
```

## 🔄 部署檢查清單 | Deployment Checklist

### Zeabur 生產環境
- [ ] 設定 Google OAuth 憑證
- [ ] 配置正確的重定向 URI
- [ ] 設定環境變數在 Zeabur 控制台
- [ ] 執行資料庫遷移
- [ ] 測試完整 OAuth 流程

### 環境變數檢查
```bash
# 開發環境
GOOGLE_CLIENT_ID=your-dev-client-id
GOOGLE_CLIENT_SECRET=your-dev-client-secret
NEXTAUTH_URL=http://localhost:3000

# 生產環境
GOOGLE_CLIENT_ID=your-prod-client-id
GOOGLE_CLIENT_SECRET=your-prod-client-secret
NEXTAUTH_URL=https://kcislk-esid.zeabur.app
```

---

**完成設定後，請執行完整的 OAuth 測試流程以確保功能正常運作。**