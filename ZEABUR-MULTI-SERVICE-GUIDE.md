# 🔧 Zeabur 多服務設定指南
## Zeabur Multi-Service Setup Guide

**適用情況**: 需要同時維護開發/測試/生產環境  
**目標**: 建立完全隔離的測試和生產環境  
**預估時間**: 30-45分鐘  

---

## 🎯 **設定目標**

建立以下服務架構：
```
📦 Zeabur Project: KCISLK ESID Info Hub
├── 🌟 landing-app-v2 (Production)
│   ├── 分支: main
│   ├── 域名: https://kcislk-infohub.zeabur.app
│   └── 用途: 正式營運環境
│
└── 🧪 landing-app-v2-staging (Staging)
    ├── 分支: develop
    ├── 域名: https://kcislk-infohub-staging.zeabur.app
    └── 用途: 測試和驗收環境
```

---

## 📋 **前置準備檢查清單**

### **必須完成的準備工作**:
- [x] ✅ GitHub 儲存庫已有 `develop` 分支
- [ ] 🔲 現有生產服務正常運作
- [ ] 🔲 已備份當前環境變數設定
- [ ] 🔲 準備測試域名或子域名
- [ ] 🔲 Google OAuth Console 存取權限

---

## 🚀 **Step 1: 創建 Staging 服務**

### **1.1 登入 Zeabur 控制台**
1. 前往 https://zeabur.com
2. 登入您的帳戶
3. 選擇現有的專案 (包含 landing-app-v2 的專案)

### **1.2 創建新服務**
1. **點擊 "Create Service" 或 "+"**
2. **選擇 "Git Repository"**
3. **選擇相同的 GitHub 儲存庫**:
   ```
   Repository: geonook/es-international-department
   ```
4. **重要設定**:
   - **Service Name**: `landing-app-v2-staging`
   - **Branch**: `develop` (不是 main!)
   - **Framework**: Next.js (自動偵測)

### **1.3 初始部署設定**
```yaml
# 部署配置確認
Service Name: landing-app-v2-staging
Source: GitHub Repository  
Branch: develop
Framework: Next.js
Build Command: npm run build
Start Command: npm run start
Port: 3000 (預設)
```

---

## 🌐 **Step 2: 域名配置**

### **選項 A: 使用 Zeabur 子域名 (推薦)**
1. 在服務設定中，找到 "Domain" 設定
2. 設定自訂子域名:
   ```
   kcislk-infohub-staging.zeabur.app
   ```
3. 等待 DNS 傳播 (通常 2-5 分鐘)

### **選項 B: 使用自訂域名**
1. 準備測試用子域名: `staging.yourdomain.com`
2. 在 DNS 供應商添加 CNAME 記錄:
   ```
   staging.yourdomain.com → your-service.zeabur.app
   ```
3. 在 Zeabur 添加自訂域名
4. 等待 SSL 憑證生成

### **域名驗證**
```bash
# 檢查域名是否可存取
curl -I https://kcislk-infohub-staging.zeabur.app

# 預期回應: HTTP/2 200 或重定向
```

---

## 🔐 **Step 3: Staging 環境變數配置**

### **3.1 複製現有生產環境變數**
1. 前往生產服務 (landing-app-v2)
2. 進入 "Environment Variables" 設定
3. **複製所有環境變數** (稍後修改)

### **3.2 修改 Staging 專用配置**

**在新的 staging 服務中設定以下環境變數**:

```env
# ==========================================
# 基礎環境配置
# ==========================================
NODE_ENV=staging

# ==========================================
# 域名配置 (CRITICAL)
# ==========================================
NEXTAUTH_URL=https://kcislk-infohub-staging.zeabur.app
ALLOWED_ORIGINS=https://kcislk-infohub-staging.zeabur.app

# ==========================================
# 資料庫配置
# ==========================================
# 選項 A: 共用生產資料庫 (小心使用)
DATABASE_URL=postgresql://root:p356lGH1k4Kd7zefirJ0YSV8MC29ygON@tpe1.clusters.zeabur.com:32312/zeabur

# 選項 B: 獨立測試資料庫 (推薦，需另外設定)
# DATABASE_URL=postgresql://[test-user]:[test-pass]@[test-host]:[port]/[test-db]

# ==========================================
# 認證配置
# ==========================================
# 為 staging 使用不同的密鑰
JWT_SECRET=staging-jwt-secret-key-different-from-production
NEXTAUTH_SECRET=staging-nextauth-secret-different-from-production

# Google OAuth (可使用相同憑證)
GOOGLE_CLIENT_ID=[您的實際 Google Client ID]
GOOGLE_CLIENT_SECRET=[您的實際 Google Client Secret]

# ==========================================
# 測試環境專用設定
# ==========================================
ENABLE_TEST_FEATURES=true
SHOW_DEBUG_INFO=true
ENABLE_SEED_DATA=true

# ==========================================
# 安全配置 (較生產環境寬鬆)
# ==========================================
RATE_LIMIT_MAX_REQUESTS=500
RATE_LIMIT_WINDOW_MS=900000

# ==========================================
# 工具配置
# ==========================================
PRISMA_CLI_TELEMETRY_DISABLED=1
```

### **3.3 環境變數設定步驟**
1. 在 Zeabur staging 服務中點擊 "Environment Variables"
2. 逐一添加上述環境變數
3. **重要**: 確保 `NEXTAUTH_URL` 使用正確的 staging 域名
4. 保存設定

---

## 🔗 **Step 4: Google OAuth Console 更新**

### **4.1 添加 Staging 重定向 URI**
1. **前往 Google Cloud Console**:
   - https://console.developers.google.com/
2. **選擇您的專案**
3. **導航到 APIs & Services > Credentials**
4. **找到並編輯您的 OAuth 2.0 Client ID**

### **4.2 更新 Authorized Redirect URIs**
**添加新的 staging URI**:
```
現有 URI (保持不變):
https://kcislk-infohub.zeabur.app/api/auth/callback/google

新增 URI:
https://kcislk-infohub-staging.zeabur.app/api/auth/callback/google
http://localhost:3001/api/auth/callback/google  (開發用)
```

**完整的重定向 URI 清單**:
```
http://localhost:3001/api/auth/callback/google                          # 開發
https://kcislk-infohub-staging.zeabur.app/api/auth/callback/google     # 測試
https://kcislk-infohub.zeabur.app/api/auth/callback/google             # 生產
```

### **4.3 儲存並等待傳播**
- 點擊 "Save" 儲存設定
- Google OAuth 更新可能需要 5-10 分鐘才會生效

---

## ✅ **Step 5: 部署和驗證**

### **5.1 觸發初始部署**
1. **推送變更到 develop 分支**:
   ```bash
   git checkout develop
   git push origin develop
   ```
2. **監控 Zeabur 部署狀態**
   - 前往 staging 服務的 "Deployments" 頁籤
   - 確認部署成功完成

### **5.2 基本功能驗證**
```bash
# 1. 檢查網站可存取性
curl -I https://kcislk-infohub-staging.zeabur.app

# 2. 檢查 API 健康狀態
curl https://kcislk-infohub-staging.zeabur.app/api/health

# 3. 檢查 OAuth providers
curl https://kcislk-infohub-staging.zeabur.app/api/auth/providers
```

### **5.3 完整功能測試**
1. **訪問 Staging 網站**:
   ```
   https://kcislk-infohub-staging.zeabur.app
   ```

2. **測試 Google OAuth 登入**:
   - 點擊 "使用 Google 登入"
   - 確認重定向到正確的 staging 域名
   - 驗證登入流程完成

3. **測試主要功能**:
   - 導航功能
   - 用戶管理
   - 內容管理
   - API 呼叫

---

## 🔄 **Step 6: 自動化部署流程設定**

### **6.1 分支部署策略確認**
```
服務配置確認:
├── Production Service (landing-app-v2)
│   ├── Branch: main
│   └── Auto-deploy: ✅ ON
│
└── Staging Service (landing-app-v2-staging)  
    ├── Branch: develop
    └── Auto-deploy: ✅ ON
```

### **6.2 部署流程測試**
1. **測試 Staging 自動部署**:
   ```bash
   # 創建測試變更
   git checkout develop
   echo "# Test deployment" >> TEST.md
   git add TEST.md
   git commit -m "test: staging auto-deployment"
   git push origin develop
   ```

2. **監控部署**:
   - 檢查 Zeabur staging 服務是否觸發新部署
   - 確認部署完成後變更生效

3. **測試 Production 部署**:
   ```bash
   # 創建 PR: develop → main (在 GitHub)
   # 合併後檢查 production 服務是否自動部署
   ```

---

## 📊 **Step 7: 服務狀態監控設定**

### **7.1 設定服務監控**
**對於每個服務設定**:
1. **健康檢查端點**: `/api/health`
2. **監控頻率**: 每 5 分鐘
3. **告警設定**: 連續失敗 3 次觸發

### **7.2 日誌監控**
**在 Zeabur 控制台**:
1. 進入每個服務的 "Logs" 區段
2. 設定日誌保留時間
3. 監控關鍵錯誤訊息

### **7.3 效能監控**
**監控指標**:
- 回應時間
- 錯誤率  
- 記憶體使用量
- CPU 使用率

---

## 🛠️ **故障排除指南**

### **常見問題與解決方案**:

**1. Staging 服務部署失敗**
```bash
# 檢查構建日誌
# 在 Zeabur 控制台查看詳細錯誤訊息

# 常見原因:
- 環境變數設定錯誤
- 資料庫連接問題
- 依賴套件問題
```

**2. OAuth 重定向錯誤**
```bash
# 錯誤: redirect_uri_mismatch
# 解決方案:
1. 檢查 Google Console 重定向 URI 設定
2. 確認 NEXTAUTH_URL 環境變數正確
3. 等待 Google OAuth 更新傳播 (5-10分鐘)
```

**3. 域名無法存取**
```bash
# 檢查域名配置
dig kcislk-infohub-staging.zeabur.app

# 檢查 SSL 憑證
curl -I https://kcislk-infohub-staging.zeabur.app
```

**4. 資料庫連接問題**
```bash
# 檢查 DATABASE_URL 格式
# 確認資料庫伺服器允許 Zeabur IP 存取
```

---

## 📋 **完成檢查清單**

### **服務建立驗證**:
- [ ] ✅ Staging 服務成功創建
- [ ] ✅ 綁定到 develop 分支
- [ ] ✅ 環境變數正確配置
- [ ] ✅ 域名可正常存取
- [ ] ✅ SSL 憑證生效

### **功能驗證**:
- [ ] ✅ 網站首頁正常載入
- [ ] ✅ API 端點回應正常
- [ ] ✅ Google OAuth 登入成功
- [ ] ✅ 資料庫連接正常
- [ ] ✅ 主要功能運作正常

### **自動化驗證**:
- [ ] ✅ Develop 分支推送觸發 staging 部署
- [ ] ✅ Main 分支推送觸發 production 部署
- [ ] ✅ 部署日誌正常記錄
- [ ] ✅ 監控告警設定完成

---

## 🎉 **設定完成後的使用方式**

### **日常開發流程**:
```bash
# 1. 本地開發
npm run dev  # localhost:3001

# 2. 推送到測試
git push origin develop  # 自動部署到 staging

# 3. 測試驗證
# 前往 https://kcislk-infohub-staging.zeabur.app 測試

# 4. 發布到生產
# 創建 PR: develop → main
# 合併後自動部署到 production
```

### **多環境對比測試**:
```bash
# 同時運行多個環境進行對比
npm run dev                # localhost:3001 (開發)
npm run dev:staging        # localhost:3002 (本地測試staging配置)
npm run dev:production     # localhost:3003 (本地測試production配置)

# 網頁環境
# https://kcislk-infohub-staging.zeabur.app     (測試環境)
# https://kcislk-infohub.zeabur.app            (生產環境)
```

---

## 📞 **技術支援**

### **如遇到問題**:
1. **參考相關文檔**:
   - `DEPLOYMENT-WORKFLOW.md` - 部署流程
   - `ENVIRONMENT-TROUBLESHOOTING.md` - 故障排除
   - `ZEABUR-CONFIG-OPTIMIZATION.md` - 配置最佳化

2. **檢查項目**:
   - Zeabur 部署日誌
   - GitHub webhook 狀態
   - Google OAuth Console 設定
   - 環境變數配置

3. **常用除錯命令**:
   ```bash
   # 測試 API 端點
   curl https://your-staging-domain.zeabur.app/api/health
   
   # 檢查 OAuth providers
   curl https://your-staging-domain.zeabur.app/api/auth/providers
   
   # 檢查環境配置
   npm run env:check
   ```

---

**🎯 完成這個設定後，您將擁有完全隔離且自動化的開發、測試、生產環境！**

這個架構讓您可以：
- ✅ 安全地在本地開發 (localhost:3001)
- ✅ 自動部署到測試環境進行驗證
- ✅ 經過完整測試後發布到生產環境
- ✅ 避免生產環境受到開發變更影響

---

*Generated by Claude Code - Zeabur Multi-Service Setup Guide | v1.0.0*