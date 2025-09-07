# Staging Environment Repair Guide | Staging環境修復指南

> **生成時間**: 2025-09-07 20:50 UTC+8  
> **目標環境**: next14-landing.zeabur.app  
> **當前狀態**: DEGRADED (v1.0.0, 資料庫連接失敗, OAuth 404)  
> **目標狀態**: 完全正常 (v1.6.0, 所有功能運作)  

## 🚨 當前問題診斷

基於詳細檢查，Staging環境存在以下問題：

### 1️⃣ 版本問題
- **當前版本**: v1.0.0 (落後)
- **目標版本**: v1.6.0 (最新)
- **影響**: 缺少關鍵功能和修復

### 2️⃣ 資料庫連接問題
```json
{
  "database": {
    "status": "unhealthy",
    "connectionTime": "N/A",
    "error": "無法連接到資料庫"
  }
}
```

### 3️⃣ OAuth端點缺失
- **問題**: `/api/auth/providers` 返回404錯誤
- **原因**: v1.0.0版本沒有此端點
- **影響**: 無法進行OAuth認證

### 4️⃣ 環境變數配置混淆
- **問題**: 健康檢查顯示environment="production"
- **應該是**: environment="staging" 
- **影響**: 可能使用錯誤的配置文件

## 🔧 修復方案

### Phase 1: Zeabur平台重新部署 (優先級: P0)

#### 步驟1: 準備最新代碼
```bash
# 確保本地代碼是最新的v1.6.0
git status
git log --oneline -5 # 確認包含最新提交

# 確認package.json版本
grep "version" package.json # 應該顯示"1.6.0"
```

#### 步驟2: Zeabur平台操作
1. **登入Zeabur控制台**: https://zeabur.com/
2. **找到Staging項目**: next14-landing
3. **觸發重新部署**:
   - 方法A: 點擊"Redeploy"按鈕
   - 方法B: Push新的提交觸發自動部署
   - 方法C: 重新連接GitHub倉庫

#### 步驟3: 環境變數檢查
確保Zeabur平台上的環境變數正確設置：
```bash
# 必要的環境變數
NODE_ENV=staging  # ⚠️ 確保不是production
APP_VERSION=1.6.0
DATABASE_URL=postgresql://...  # 確保URL正確
NEXTAUTH_URL=https://next14-landing.zeabur.app
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Phase 2: 功能驗證 (優先級: P1)

#### 驗證1: 基本服務健康
```bash
# 主頁測試
curl -s -o /dev/null -w "%{http_code}" https://next14-landing.zeabur.app/
# 期望: 200

# 健康檢查
curl -s https://next14-landing.zeabur.app/api/health | jq '.version'
# 期望: "1.6.0"
```

#### 驗證2: OAuth端點測試
```bash
# OAuth providers端點
curl -s https://next14-landing.zeabur.app/api/auth/providers
# 期望: 返回Google配置JSON，不是404

# OAuth初始化測試
curl -s -o /dev/null -w "%{http_code}" https://next14-landing.zeabur.app/api/auth/google
# 期望: 302重定向到Google
```

#### 驗證3: 資料庫連接測試
```bash
# 健康檢查中的資料庫狀態
curl -s https://next14-landing.zeabur.app/api/health | jq '.performance.database.status'
# 期望: "healthy"

# 公共API測試
curl -s https://next14-landing.zeabur.app/api/public/info | jq '.success'
# 期望: true
```

## 🎯 成功指標

修復完成後，所有指標都應達到以下標準：

### ✅ 系統健康指標
- **HTTP狀態**: 200 OK
- **版本**: v1.6.0
- **環境**: staging (非production)
- **響應時間**: <200ms

### ✅ 資料庫指標
- **連接狀態**: healthy
- **連接時間**: <500ms
- **數據完整性**: 能夠查詢基本數據

### ✅ OAuth指標
- **providers端點**: 返回JSON配置
- **Google登入**: 正常重定向
- **回調處理**: 正常處理授權

## 🚀 自動化部署腳本 (可選)

如果需要程式化部署，可以使用以下腳本：

```bash
#!/bin/bash
# staging-deploy.sh - Staging環境部署腳本

echo "🚀 Starting Staging Environment Deployment..."

# 1. 確認版本
echo "📋 Current version: $(grep '"version"' package.json | cut -d'"' -f4)"

# 2. 建置應用
echo "🔨 Building application..."
npm run build:staging

# 3. 驗證建置
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# 4. 部署後驗證
echo "🔍 Verifying deployment..."
sleep 30  # 等待部署完成

# 健康檢查
HEALTH=$(curl -s https://next14-landing.zeabur.app/api/health)
VERSION=$(echo $HEALTH | jq -r '.version')

if [ "$VERSION" == "1.6.0" ]; then
    echo "✅ Staging environment successfully updated to v1.6.0"
else
    echo "❌ Deployment verification failed. Current version: $VERSION"
fi
```

## ⚠️ 風險控制與回滾計劃

### 預防措施
1. **備份檢查**: 確保可以回滾到v1.0.0
2. **分階段驗證**: 逐步檢查每個功能
3. **監控設置**: 部署後持續監控

### 回滾程序
如果修復失敗，可以執行以下回滾：
```bash
# 在Zeabur控制台中：
# 1. 選擇"Rollback to previous version"
# 2. 或者重新部署上一個穩定的提交
```

## 📞 支援資源

### Zeabur平台支援
- **文檔**: https://docs.zeabur.com/
- **狀態頁面**: https://status.zeabur.com/
- **社群支援**: https://discord.gg/zeabur

### 項目相關資源
- **GitHub倉庫**: https://github.com/geonook/es-international-department
- **本地測試**: `npm run dev:staging`
- **配置文件**: `.env.staging`

## 📋 檢查清單

部署完成後，請確認以下項目：

- [ ] ✅ 主頁正常載入 (200 OK)
- [ ] ✅ 健康檢查返回v1.6.0
- [ ] ✅ 環境顯示為"staging"
- [ ] ✅ 資料庫連接健康
- [ ] ✅ OAuth providers端點正常
- [ ] ✅ 公共API返回數據
- [ ] ✅ Google OAuth登入流程完整

完成所有檢查後，Staging環境應該完全對齊到v1.6.0版本。

---
*修復指南生成時間: 2025-09-07 20:50 UTC+8*  
*下一步: Production環境安全升級計劃*