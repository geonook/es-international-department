# 🚀 Zeabur Production 環境變數快速修復對照表
## Quick Fix Comparison Table

**使用方式**: 在 Zeabur 控制台中，對照此表格逐一更新環境變數

---

## 📊 **修復對照表**

| 變數名稱 | ❌ 當前錯誤值 | ✅ 正確值 | 說明 |
|---------|-------------|---------|------|
| `DATABASE_URL` | `postgres://user:password@localhost:5432/db` | `postgresql://root:p356lGH1k4Kd7zefirJ0YSV8MC29ygON@tpe1.clusters.zeabur.com:32312/zeabur` | 修復資料庫連接 |
| `JWT_SECRET` | `1234567890abcdefghijklmnopqrstuvwxyz123456` | `yVVJWVI6c3VjLKY0X6vNnaTRJVxHHu1zEvYaYWvwAAI=` | 安全密鑰 |
| `GOOGLE_CLIENT_ID` | `YOUR_GOOGLE_CLIENT_ID` | ✅ 保持不變 | OAuth 憑證正確 |
| `GOOGLE_CLIENT_SECRET` | `YOUR_GOOGLE_CLIENT_SECRET` | ✅ 保持不變 | OAuth 憑證正確 |

## 🚨 **部署失敗原因：SMTP 驗證錯誤**

**關鍵發現**: Zeabur 部署失敗是因為以下錯誤配置導致環境驗證失敗：
```
❌ Environment validation failed: SMTP configuration incomplete
```

---

## ➕ **需要新增的環境變數**

| 變數名稱 | 新增值 | 用途 |
|---------|--------|------|
| `NODE_ENV` | `production` | 環境標識 |
| `NEXTAUTH_URL` | `https://kcislk-infohub.zeabur.app` | NextAuth 回調 URL |
| `NEXTAUTH_SECRET` | `WtDE420rcUJjy7S1Fz6i2+Sksp/gHDq1v7wzkGSRqsE=` | NextAuth 安全密鑰 |
| `ALLOWED_ORIGINS` | `https://kcislk-infohub.zeabur.app` | CORS 設定 |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | 速率限制 |
| `RATE_LIMIT_WINDOW_MS` | `900000` | 速率限制時間窗口 |
| `PRISMA_CLI_TELEMETRY_DISABLED` | `1` | 禁用遙測 |

---

## 🚨 **部署失敗修復：SMTP 配置問題**

### **當前錯誤 SMTP 配置**：
```env
❌ SMTP_HOST=smtp.example.com     (假示例值，導致驗證失敗)
❌ SMTP_USER=test@example.com     (假示例值，導致驗證失敗)
❌ SMTP_PASS=testpassword         (假示例值，導致驗證失敗)
```

### **修復選項**：

#### **🎯 選項 A：禁用 SMTP 服務 (推薦 - 快速修復)**
```env
# 刪除以下錯誤的 SMTP 變數：
刪除: SMTP_HOST
刪除: SMTP_USER  
刪除: SMTP_PASS

# 可選：明確禁用郵件服務
EMAIL_PROVIDER=disabled
```

#### **⚡ 選項 B：配置真實 SMTP 服務**
```env
# 使用真實的 Gmail SMTP 配置 (需要應用程式密碼)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587  
SMTP_USER=your-real-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_PROVIDER=smtp
```

---

## 🔧 **修復步驟**

### **Step 1: 更新現有變數**
1. 在 Zeabur 控制台找到環境變數設定
2. 點擊 `DATABASE_URL` 的編輯按鈕
3. 將值更新為新的正確值
4. 對 `JWT_SECRET` 重複此步驟

### **Step 2: 新增缺失變數**
1. 點擊 "Add Variable" 或 "新增變數"
2. 依序添加上表中的 7 個新變數
3. 確保每個變數的名稱和值都完全正確

### **Step 3: 修復 SMTP 配置問題（重要！）**

**🎯 推薦做法：禁用 SMTP 服務**
1. 找到並**刪除**以下變數：
   - `SMTP_HOST` 
   - `SMTP_USER`
   - `SMTP_PASS`
2. 可選：添加 `EMAIL_PROVIDER` = `disabled` 明確禁用

**⚠️ 注意**: 這些假示例值是導致部署失敗的根本原因！

### **Step 4: 儲存並重啟**
1. 確認所有變更都已儲存（特別是刪除了 SMTP 變數）
2. 重啟 production 服務 
3. 等待部署完成（約 2-3 分鐘）
4. **檢查部署日誌**確認沒有 SMTP 驗證錯誤

---

## ✅ **修復完成驗證**

修復完成後，測試以下端點確認成功：

```bash
# 檢查 API 健康狀態
curl https://kcislk-infohub.zeabur.app/api/health

# 預期返回:
# {"status":"HEALTHY","checks":{"database":"✅"}}
```

---

## 🚨 **注意事項**

- **不要同時修改太多變數**：建議分批進行，先修復最重要的 `DATABASE_URL`
- **修復後立即測試**：每修復一批變數後就重啟並測試
- **保留備份**：在修改前截圖保存當前設定

---

**🎯 修復優先順序**：
1. `DATABASE_URL` (最重要)
2. `JWT_SECRET`, `NEXTAUTH_*` (安全相關)  
3. 其他配置變數
4. 清理錯誤的 SMTP 變數

*快速修復指南 - 專為緊急修復 Production 環境而設計*