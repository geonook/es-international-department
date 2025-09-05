# Google Cloud Console OAuth 設定指南
# Google Cloud Console OAuth Setup Guide - Staging Fix

> **Target Issue**: 修復 staging 環境 Google OAuth "已封鎖存取權" 錯誤  
> **Staging Domain**: https://next14-landing.zeabur.app  
> **Date**: 2025-09-05

## 🚨 重要說明 Important Notice

**問題現象**: 當在 staging 環境 (https://next14-landing.zeabur.app) 嘗試 Google 登入時，出現：
```
使用 Google 帳戶登入
已封鎖存取權：這個應用程式的要求無效
```

**根本原因**: Google OAuth Console 的設定中缺少 staging 環境域名配置

## 📋 Step-by-Step Google Console 設定

### Step 1: 登入 Google Cloud Console
1. 前往: https://console.cloud.google.com/
2. 選擇您的專案 (KCISLK ESID Info Hub 相關專案)
3. 確認您有管理員權限

### Step 2: 導航到 OAuth 設定
1. 在左側選單中，點擊 "APIs & Services" (API 和服務)
2. 點擊 "Credentials" (憑證)
3. 找到您的 OAuth 2.0 Client ID
   - Client ID 應該是: `YOUR_GOOGLE_CLIENT_ID`

### Step 3: 編輯 OAuth 2.0 Client
1. 點擊您的 OAuth 2.0 Client ID 名稱進入編輯頁面
2. 您會看到目前的設定

### Step 4: 添加 Authorized Domains (授權域名)
在 "Authorized JavaScript origins" 或 "Authorized domains" 區域中：

**目前應該已有的域名:**
- `kcislk-infohub.zeabur.app` (production)
- 可能還有其他域名

**需要添加的新域名:**
```
next14-landing.zeabur.app
```

**操作步驟:**
1. 點擊 "Add domain" (添加域名)
2. 輸入: `next14-landing.zeabur.app`
3. 不要包含 `https://` 或 `http://`，只要域名

### Step 5: 添加 Authorized Redirect URIs (授權重定向 URI)
在 "Authorized redirect URIs" 區域中：

**目前應該已有的 URI:**
- `https://kcislk-infohub.zeabur.app/api/auth/callback/google` (production)
- 可能還有 localhost 開發用的 URI

**需要添加的新 URI:**
```
https://next14-landing.zeabur.app/api/auth/callback/google
```

**操作步驟:**
1. 點擊 "Add URI" (添加 URI)
2. 輸入完整的 URI: `https://next14-landing.zeabur.app/api/auth/callback/google`
3. 確保包含 `https://` 前綴
4. 確保路徑完全正確: `/api/auth/callback/google`
5. **不要有尾隨斜線** (不要以 `/` 結尾)

### Step 6: 儲存設定
1. 點擊頁面底部的 "Save" (儲存) 按鈕
2. 等待幾秒鐘讓設定生效

### Step 7: 驗證設定 (可選)
檢查您的最終設定應該包含:

**Authorized Domains:**
- ✅ `next14-landing.zeabur.app` (NEW - for staging)
- ✅ `kcislk-infohub.zeabur.app` (existing - for production)
- ✅ 其他現有域名

**Authorized Redirect URIs:**
- ✅ `https://next14-landing.zeabur.app/api/auth/callback/google` (NEW - for staging)
- ✅ `https://kcislk-infohub.zeabur.app/api/auth/callback/google` (existing - for production)
- ✅ 其他現有 redirect URIs (如 localhost 開發用)

## ⚠️ 常見錯誤和注意事項

### Authorized Domains 常見錯誤:
❌ `https://next14-landing.zeabur.app` (不要包含協議)
❌ `next14-landing.zeabur.app/` (不要包含尾隨斜線)
✅ `next14-landing.zeabur.app` (正確格式)

### Authorized Redirect URIs 常見錯誤:
❌ `next14-landing.zeabur.app/api/auth/callback/google` (缺少協議)
❌ `https://next14-landing.zeabur.app/api/auth/callback/google/` (有尾隨斜線)
❌ `https://next14-landing.zeabur.app/api/auth/google` (路徑錯誤)
✅ `https://next14-landing.zeabur.app/api/auth/callback/google` (正確格式)

## 🕒 設定生效時間

- Google OAuth 設定通常在 **5-10 分鐘內** 生效
- 如果立即測試仍然失敗，請等待幾分鐘再試
- 清除瀏覽器快取和 cookies 可能有助於快速生效

## 🧪 測試步驟

### Step 1: 確認 Zeabur 環境變數已更新
確保 staging 環境中的環境變數正確:
```env
NEXTAUTH_URL=https://next14-landing.zeabur.app
ALLOWED_ORIGINS=https://next14-landing.zeabur.app
```

### Step 2: 測試 OAuth 流程
1. 前往: https://next14-landing.zeabur.app/login
2. 點擊 "使用 Google 帳戶登入"
3. **應該不再顯示 "已封鎖存取權" 錯誤**
4. 應該正常跳轉到 Google 授權頁面

### Step 3: 完成登入測試
1. 在 Google 授權頁面授權應用程式
2. 應該正常回到 staging 環境並登入成功
3. 檢查使用者資料和權限是否正確

## 🔧 Troubleshooting 故障排除

### 如果仍然顯示 "已封鎖存取權"：
1. 檢查 Google Console 設定是否完全正確
2. 等待 10 分鐘讓 Google 設定生效
3. 清除瀏覽器快取和 cookies
4. 嘗試使用無痕模式或不同瀏覽器

### 如果出現其他 OAuth 錯誤：
1. 檢查 Zeabur 環境變數是否正確設定
2. 檢查 staging 應用程式日誌是否有錯誤
3. 確認 Google OAuth 憑證 (Client ID/Secret) 正確

### 如果回調失敗：
1. 確認 redirect URI 完全匹配
2. 檢查應用程式的 `/api/auth/callback/google` 端點是否正常工作
3. 檢查網路連接和防火牆設定

## ✅ 成功確認清單

完成以下所有項目後，staging OAuth 應該正常工作：

### Google Console 設定:
- [ ] 已添加 `next14-landing.zeabur.app` 到 authorized domains
- [ ] 已添加 `https://next14-landing.zeabur.app/api/auth/callback/google` 到 redirect URIs
- [ ] 已儲存所有設定
- [ ] 等待設定生效 (5-10 分鐘)

### Zeabur 環境變數:
- [ ] `NEXTAUTH_URL=https://next14-landing.zeabur.app`
- [ ] `ALLOWED_ORIGINS=https://next14-landing.zeabur.app`
- [ ] 其他必要環境變數已正確設定

### 測試確認:
- [ ] https://next14-landing.zeabur.app/login 頁面正常載入
- [ ] Google 登入按鈕不顯示 "已封鎖存取權" 錯誤
- [ ] 能夠完成完整的 OAuth 登入流程
- [ ] 登入後使用者資料正確顯示

---

**目標**: 修復 staging 環境 Google OAuth  
**問題**: "已封鎖存取權：這個應用程式的要求無效"  
**解決方案**: 在 Google Console 添加正確的 staging 域名配置  
**生成時間**: 2025-09-05