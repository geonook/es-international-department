# 🔍 Google Cloud Console Production Setup Guide
# Google Cloud Console 生產環境設定指南

> **重要提醒**: 此指南專門用於檢查和修復生產環境的 OAuth 配置問題

## 🚨 當前問題診斷

**問題現象**: 生產環境重定向到 `https://kcislk-infohub.zeabur.app/login?error=oauth_callback_failed`

**可能原因**: Google Cloud Console 中的重定向 URI 配置不正確

## 📋 必要檢查清單

### 1. **Google Cloud Console 存取**
- [ ] 登入 [Google Cloud Console](https://console.cloud.google.com/)
- [ ] 確認您有正確專案的存取權限
- [ ] 記錄當前使用的專案 ID

### 2. **OAuth 2.0 客戶端 ID 檢查**
- [ ] 導航到 `APIs & Services` > `Credentials`
- [ ] 找到用於生產環境的 OAuth 2.0 客戶端 ID
- [ ] 確認客戶端 ID: `316204460450-mn1u6vqrrnlhmh3s14nlghnie2uhou5d.apps.googleusercontent.com`

### 3. **重定向 URI 配置檢查**
**必須包含的 URI**:
```
https://kcislk-infohub.zeabur.app/api/auth/callback/google
```

**檢查步驟**:
- [ ] 點擊 OAuth 2.0 客戶端 ID
- [ ] 檢查 "Authorized redirect URIs" 區域
- [ ] 確認包含上述完整 URI
- [ ] 檢查 URI 是否有任何拼寫錯誤或多餘的斜線

### 4. **授權來源檢查**
**必須包含的網域**:
```
https://kcislk-infohub.zeabur.app
```

**檢查步驟**:
- [ ] 檢查 "Authorized JavaScript origins" 區域  
- [ ] 確認包含生產域名
- [ ] 確保沒有多餘的路徑或參數

## 🔧 修復步驟

### 步驟 1: 編輯 OAuth 2.0 設定
1. 在 Google Cloud Console 中點擊編輯按鈕 (✏️)
2. 向下捲動到 "Authorized redirect URIs"
3. 點擊 "ADD URI" 按鈕

### 步驟 2: 加入正確的重定向 URI
```
https://kcislk-infohub.zeabur.app/api/auth/callback/google
```

**⚠️ 重要注意事項**:
- 必須是 `https://` (不是 `http://`)
- 不能有結尾斜線
- 路徑必須完全匹配 `/api/auth/callback/google`

### 步驟 3: 加入授權來源
在 "Authorized JavaScript origins" 區域加入:
```
https://kcislk-infohub.zeabur.app
```

### 步驟 4: 儲存設定
- [ ] 點擊 "SAVE" 按鈕
- [ ] 等待變更生效 (通常需要 5-10 分鐘)

## 🧪 驗證設定

### 快速測試
1. 開啟瀏覽器無痕模式
2. 訪問: `https://kcislk-infohub.zeabur.app/login`
3. 點擊 "Log in with Google" 按鈕
4. 檢查是否能正常重定向到 Google 授權頁面

### 詳細驗證
```bash
# 執行生產配置驗證
npm run validate:production-config

# 測試 OAuth 流程
npm run test:oauth-production
```

## 🔍 常見問題排除

### 問題 1: "redirect_uri_mismatch" 錯誤
**解決方案**: 檢查重定向 URI 是否完全匹配，包括協議、域名和路徑

### 問題 2: "unauthorized_client" 錯誤  
**解決方案**: 確認 OAuth 客戶端 ID 和密鑰是否正確

### 問題 3: CORS 錯誤
**解決方案**: 檢查 "Authorized JavaScript origins" 是否包含正確域名

## 📊 生產環境配置總覽

### 當前生產設定
```yaml
Domain: https://kcislk-infohub.zeabur.app
OAuth Redirect: https://kcislk-infohub.zeabur.app/api/auth/callback/google
Client ID: 316204460450-mn1u6vqrrnlhmh3s14nlghnie2uhou5d.apps.googleusercontent.com
Environment: production
```

### 預期的 Google Cloud Console 設定
```yaml
Project: [您的專案名稱]
OAuth 2.0 Client ID: 316204460450-mn1u6vqrrnlhmh3s14nlghnie2uhou5d.apps.googleusercontent.com

Authorized JavaScript origins:
- https://kcislk-infohub.zeabur.app

Authorized redirect URIs:
- https://kcislk-infohub.zeabur.app/api/auth/callback/google
```

## 🚀 後續步驟

完成 Google Cloud Console 設定後:

1. **等待變更生效** (5-10 分鐘)
2. **清除瀏覽器快取** 
3. **測試 OAuth 流程**
4. **檢查伺服器日誌** 以確認錯誤是否解決

## 📞 支援資源

### 測試工具
- 生產配置驗證: `npm run validate:production-config`
- OAuth 測試: 訪問生產環境登入頁面

### 相關文件
- [Google OAuth 2.0 文件](https://developers.google.com/identity/protocols/oauth2)
- [Next.js 認證最佳實踐](https://nextjs.org/docs/authentication)

---

**🎯 目標**: 確保生產環境的 Google OAuth 流程完全正常運作，消除 `oauth_callback_failed` 錯誤。