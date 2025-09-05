# OAuth 重定向問題修復指南
# OAuth Redirect Issue Fix Guide

> **緊急問題**: OAuth 登入後重定向到 `localhost:8080` 而非正確的 staging 域名  
> **Urgent Issue**: OAuth login redirects to `localhost:8080` instead of correct staging domain  
> **錯誤**: `ERR_CONNECTION_REFUSED` 無法連線  
> **Error**: `ERR_CONNECTION_REFUSED` connection refused  
> **日期**: 2025-09-05

## 🚨 **問題分析** | **Problem Analysis**

### 根本原因 | Root Cause
在 `lib/google-oauth.ts` 中發現問題：

```typescript
// 問題代碼 | Problematic Code
get redirectUri() {
  const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001'  // ← 問題在這裡
  return `${nextAuthUrl}/api/auth/callback/google`
},
```

**問題說明**：
1. **環境變數載入失敗**: `process.env.NEXTAUTH_URL` 在 Docker 容器中沒有正確載入
2. **回退值錯誤**: 使用了 `localhost:3001` 作為回退值
3. **容器端口不匹配**: Docker 實際運行在 port `8080`，但回調 URL 錯誤

## 🛠️ **立即修復方案** | **Immediate Fix Solutions**

### 方案 A: Zeabur 環境變數修復 (推薦) | Option A: Zeabur Environment Variable Fix (Recommended)

#### 步驟 1: 檢查 Zeabur 控制台
1. 登入 Zeabur 控制台
2. 前往您的 staging 項目設定
3. 檢查環境變數部分

#### 步驟 2: 驗證/修正 NEXTAUTH_URL
確保設定為：
```env
NEXTAUTH_URL=https://next14-landing.zeabur.app
```

**⚠️ 常見錯誤**：
- ❌ `NEXTAUTH_URL=localhost:8080`
- ❌ `NEXTAUTH_URL=http://localhost:3001`  
- ❌ `NEXTAUTH_URL=https://kcislk-infohub.zeabur.app` (這是生產環境)
- ✅ `NEXTAUTH_URL=https://next14-landing.zeabur.app` (正確的 staging)

#### 步驟 3: 重新部署
環境變數更新後，Zeabur 會自動重新部署。

### 方案 B: 代碼級修復 (備用方案) | Option B: Code-Level Fix (Backup)

如果環境變數修復不起作用，修改 `lib/google-oauth.ts`：

```typescript
// 修復後的代碼 | Fixed Code
get redirectUri() {
  // 更強健的環境檢測 | More robust environment detection
  let nextAuthUrl = process.env.NEXTAUTH_URL
  
  // 如果沒有設定，根據環境推斷 | If not set, infer from environment
  if (!nextAuthUrl) {
    if (process.env.NODE_ENV === 'production') {
      // 生產環境域名檢測 | Production environment domain detection
      if (process.env.VERCEL_URL) {
        nextAuthUrl = `https://${process.env.VERCEL_URL}`
      } else {
        // Zeabur staging 或其他部署平台 | Zeabur staging or other platforms
        nextAuthUrl = 'https://next14-landing.zeabur.app'
      }
    } else {
      // 開發環境 | Development environment
      nextAuthUrl = 'http://localhost:3001'
    }
  }
  
  return `${nextAuthUrl}/api/auth/callback/google`
},
```

## 🧪 **測試驗證** | **Testing & Verification**

### 1. 環境變數驗證
在 staging 環境中測試：
```bash
# 檢查 OAuth providers 端點 | Check OAuth providers endpoint
curl https://next14-landing.zeabur.app/api/auth/providers

# 預期回應應包含正確的回調 URL | Expected response should contain correct callback URL
{
  "google": {
    "callbackUrl": "https://next14-landing.zeabur.app/api/auth/callback/google"
  }
}
```

### 2. Google OAuth Console 驗證
確認 Google Cloud Console 中有以下授權的重定向 URI：
```
✅ https://next14-landing.zeabur.app/api/auth/callback/google
```

### 3. 完整登入流程測試
1. 前往：https://next14-landing.zeabur.app/login
2. 點擊「使用 Google 登入」
3. 完成 Google 認證
4. 確認重定向到正確的域名（不是 localhost）

## 🔍 **問題排除** | **Troubleshooting**

### 問題 1: 仍然重定向到 localhost
**原因**: 瀏覽器緩存或 cookies
**解決**: 
1. 清除瀏覽器緩存和 cookies
2. 使用無痕模式測試
3. 等待 5-10 分鐘讓更改生效

### 問題 2: redirect_uri_mismatch 錯誤
**原因**: Google OAuth Console 設定不匹配
**解決**: 
1. 檢查 Google Console 授權重定向 URI
2. 確保完全匹配：`https://next14-landing.zeabur.app/api/auth/callback/google`

### 問題 3: 環境變數不生效
**原因**: 
- 環境變數名稱拼寫錯誤
- Zeabur 重新部署未觸發
- 代碼緩存問題

**解決**:
1. 檢查變數名稱拼寫
2. 手動觸發重新部署
3. 檢查代碼中的環境變數讀取邏輯

## 📋 **檢查清單** | **Checklist**

### 修復前檢查 | Pre-Fix Checklist
- [ ] 確認當前 staging URL: `https://next14-landing.zeabur.app`
- [ ] 檢查 Google OAuth Console 設定
- [ ] 驗證問題重現（重定向到 localhost:8080）

### 修復執行 | Fix Execution
- [ ] 在 Zeabur 控制台設定 `NEXTAUTH_URL=https://next14-landing.zeabur.app`
- [ ] 等待自動重新部署完成
- [ ] 或者應用代碼級修復

### 修復後驗證 | Post-Fix Verification
- [ ] OAuth providers API 回傳正確的回調 URL
- [ ] Google 登入成功重定向到正確域名
- [ ] 無 `ERR_CONNECTION_REFUSED` 錯誤
- [ ] 可以正常訪問 admin 頁面

## 🚀 **預期結果** | **Expected Results**

修復成功後：
1. ✅ OAuth 登入重定向到 `https://next14-landing.zeabur.app/admin`
2. ✅ 無連線錯誤
3. ✅ 可以正常訪問 admin 功能
4. ✅ 三個環境 (dev, staging, prod) 都正常運作

## 📞 **後續行動** | **Follow-up Actions**

1. **文檔更新**: 更新環境設定文檔以防止此問題再次發生
2. **監控設置**: 設定健康檢查以早期發現類似問題
3. **代碼改進**: 考慮更強健的環境變數載入機制

---

**狀態**: 待修復 | **Status**: Pending Fix  
**優先級**: 高 | **Priority**: High  
**預計修復時間**: 10-15 分鐘 | **Estimated Fix Time**: 10-15 minutes  
**生成時間**: 2025-09-05 | **Generated**: 2025-09-05