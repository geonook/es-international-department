# 🌐 Google Cloud Console OAuth 設定檢查清單

> **錯誤解決**: `redirect_uri_mismatch` - 已封鎖存取權：這個應用程式的要求無效  
> **修復重點**: Google Console Redirect URI 設定不匹配  
> **最後更新**: 2025-01-18

## 🔍 問題診斷

### ❌ 遇到的錯誤
```
錯誤代碼 400： redirect_uri_mismatch
已封鎖存取權：這個應用程式的要求無效
```

### ✅ 應用程式設定 (已確認正確)
```
- Client ID: [您的實際 Google Client ID]
- Client Secret: [您的實際 Google Client Secret]
- Redirect URI: http://localhost:3001/api/auth/callback/google
- NextAuth URL: http://localhost:3001
```

## 📋 Google Cloud Console 設定步驟

### 🔧 **步驟 1: 訪問 Google Cloud Console**

1. **前往**: https://console.cloud.google.com/
2. **選擇專案**: 找到並選擇您的 OAuth 專案
3. **確認身份**: 使用有管理權限的 Google 帳戶

### 🔑 **步驟 2: 找到 OAuth 2.0 憑證**

1. **導航路徑**: 
   ```
   APIs & Services → Credentials
   ```

2. **找到憑證**: 
   - 尋找您的實際 Google OAuth Client ID
   - 類型應該是 "OAuth 2.0 Client IDs"

3. **點擊編輯**: 
   - 點擊憑證名稱或右側的編輯圖標 ✏️

### 🎯 **步驟 3: 配置 Authorized Redirect URIs (關鍵步驟)**

在 **"Authorized redirect URIs"** 區域：

#### ✅ **必須添加的 URI**
```
http://localhost:3001/api/auth/callback/google
```

#### ⚠️ **重要檢查點**
- [ ] 確保協議是 `http://` (不是 https://)
- [ ] 確保端口是 `3001` (不是 3000)  
- [ ] 確保路徑完全正確: `/api/auth/callback/google`
- [ ] 沒有尾隨斜線 `/`
- [ ] 沒有多餘的空格
- [ ] 大小寫完全匹配

#### 🗑️ **移除衝突的 URI (建議)**
如果存在以下 URI，建議暫時移除：
```
❌ http://localhost:3000/api/auth/callback/google  (錯誤端口)
❌ https://localhost:3001/api/auth/callback/google (錯誤協議)  
❌ http://localhost:3001/auth/callback/google      (錯誤路徑)
❌ 任何其他端口或路徑變體
```

### 💾 **步驟 4: 保存設定**

1. **點擊保存**: 找到並點擊 "Save" 或 "儲存" 按鈕
2. **等待確認**: 看到成功保存的提示信息
3. **等待生效**: Google 設定通常需要 1-2 分鐘生效

### 🧪 **步驟 5: OAuth Consent Screen 檢查**

1. **導航到**: `APIs & Services → OAuth consent screen`

2. **檢查應用程式狀態**:
   - [ ] 應用程式不是 "需要驗證" 狀態
   - [ ] 發布狀態為 "Testing" 或 "Published"

3. **測試用戶設定** (如果在 Testing 模式):
   - [ ] 添加測試用戶: `jason02n@gmail.com`
   - [ ] 確認用戶狀態為 "Active"

### 🔌 **步驟 6: API 啟用檢查**

1. **導航到**: `APIs & Services → Library`

2. **確認以下 API 已啟用**:
   - [ ] Google+ API (可能已棄用，但可能仍需要)
   - [ ] Google People API
   - [ ] Google OAuth2 API
   - [ ] Google Identity and Access Management (IAM) API

### 📱 **步驟 7: 測試設定**

完成所有設定後：

1. **等待設定生效** (1-2 分鐘)
2. **清除瀏覽器快取和 cookies**
3. **重新測試登入**:
   - 訪問: http://localhost:3001/login
   - 點擊 "使用 Google 帳戶登入"
   - 應該看到正常的 Google 授權頁面

## ✅ 成功驗證檢查清單

### 🎯 **登入流程應該是**:
1. 點擊 Google 登入 → 重定向到 Google  ✅
2. Google 授權頁面顯示 → 用戶授權  ✅  
3. 重定向回應用程式 → 成功登入  ✅

### 🔍 **如果仍有問題**:

#### 常見錯誤排除

**錯誤**: `redirect_uri_mismatch`  
**解決**: 再次檢查 URI 設定，確保完全匹配

**錯誤**: `access_blocked`  
**解決**: 檢查 OAuth consent screen 和測試用戶設定

**錯誤**: `unauthorized_client`  
**解決**: 檢查 API 啟用狀態和憑證有效性

## 🆘 緊急解決方案

如果無法立即修改 Google Console，臨時解決方案：

### 選項 1: 多端口支援
在 Google Console 中同時添加：
```
http://localhost:3000/api/auth/callback/google
http://localhost:3001/api/auth/callback/google
```

### 選項 2: 修改應用程式端口
臨時將應用程式改為 3000 端口（如果 Console 中已配置）

## 📞 支援聯絡

如果按照以上步驟仍無法解決：

1. **檢查 Google Cloud Console 幫助文檔**
2. **確認 Google 帳戶權限**
3. **考慮重新創建 OAuth 憑證**

---

## 🎉 設定完成確認

當您在 Google Cloud Console 完成上述設定後：

- [ ] ✅ Redirect URI 已正確添加
- [ ] ✅ 衝突 URI 已移除  
- [ ] ✅ 設定已保存
- [ ] ✅ 測試用戶已添加
- [ ] ✅ 相關 API 已啟用

**準備測試 OAuth 登入功能！** 🚀

---

*此檢查清單由 Claude Code 生成 | 專為解決 redirect_uri_mismatch 錯誤*