# Production Environment Safe Upgrade Plan | 生產環境安全升級計劃

> **生成時間**: 2025-09-07 20:55 UTC+8  
> **目標環境**: kcislk-infohub.zeabur.app  
> **當前版本**: v1.0.0 (穩定運行)  
> **目標版本**: v1.6.0 (完整功能)  
> **升級類型**: 零停機時間升級 (Zero-Downtime Upgrade)

## 📊 生產環境現狀分析

### ✅ 當前生產環境狀態 (v1.0.0)
```json
{
  "status": "OK",
  "version": "1.0.0",
  "health": "完全正常",
  "database": {
    "status": "healthy",
    "responseTime": "96ms",
    "data": {
      "users": 4,
      "events": 4, 
      "resources": 6
    }
  },
  "oauth": "✅ Google認證正常工作",
  "api": "✅ 所有端點正常響應"
}
```

### 🎯 升級目標 (v1.6.0)
- **新增功能**: /api/auth/providers端點
- **系統優化**: 改進的錯誤處理和性能
- **安全增強**: 最新安全修復
- **UI改進**: 優化用戶界面和體驗

## 🛡️ 風險評估與控制

### 🟢 低風險因素
- **資料庫兼容**: v1.6.0完全向後兼容
- **API穩定**: 所有現有端點保持不變
- **OAuth配置**: 無需更改現有Google設置
- **用戶數據**: 零數據遷移需求

### 🟡 中等風險因素
- **新功能**: /api/auth/providers是新增端點
- **依賴更新**: 部分npm包版本更新
- **環境變數**: 新增APP_VERSION變數

### 🔴 需要特別注意
- **部署時機**: 避開使用高峰期
- **回滾準備**: 確保可以快速回滾
- **監控加強**: 升級後密切監控

## 🚀 三階段安全升級策略

### Phase 1: 準備階段 (Pre-Deployment)

#### 步驟1.1: 確認Staging環境穩定
```bash
# 確保Staging環境已修復並運行v1.6.0
curl -s https://next14-landing.zeabur.app/api/health | jq '.version'
# 必須返回: "1.6.0"

# 測試所有關鍵功能
curl -s https://next14-landing.zeabur.app/api/auth/providers
curl -s https://next14-landing.zeabur.app/api/public/info
# 確保都正常工作
```

#### 步驟1.2: 生產環境預檢查
```bash
# 記錄當前生產狀態作為基線
curl -s https://kcislk-infohub.zeabur.app/api/health > production_baseline.json

# 確認資料庫當前狀態
echo "當前生產數據量:"
curl -s https://kcislk-infohub.zeabur.app/api/health | jq '.performance.database.counts'
```

#### 步驟1.3: 備份與回滾準備
- **代碼備份**: 確認GitHub倉庫同步
- **配置備份**: 記錄Zeabur環境變數設置
- **資料庫備份**: 執行資料庫快照 (如果可用)

### Phase 2: 部署階段 (Deployment)

#### 步驟2.1: 最佳部署時機
- **建議時間**: 週末或深夜 (使用量最低)
- **避開時間**: 週一至週五 8:00-18:00
- **準備時間**: 至少2小時的監控窗口

#### 步驟2.2: Zeabur部署操作
```bash
# 1. 登入Zeabur控制台
# 2. 選擇Production項目: kcislk-infohub  
# 3. 檢查當前部署狀態
# 4. 觸發重新部署 (將自動拉取最新main分支)
# 5. 監控部署日誌確保無錯誤
```

#### 步驟2.3: 環境變數更新
確保生產環境包含以下新變數：
```env
# 新增的版本標記
APP_VERSION=1.6.0

# 確認現有重要變數
NODE_ENV=production
NEXTAUTH_URL=https://kcislk-infohub.zeabur.app
DATABASE_URL=postgresql://... (保持不變)
GOOGLE_CLIENT_ID=... (保持不變)
GOOGLE_CLIENT_SECRET=... (保持不變)
```

### Phase 3: 驗證階段 (Post-Deployment)

#### 步驟3.1: 即時健康檢查 (部署後0-5分鐘)
```bash
# 基本連通性測試
curl -s -o /dev/null -w "HTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" https://kcislk-infohub.zeabur.app/

# 版本確認
curl -s https://kcislk-infohub.zeabur.app/api/health | jq '.version'
# 期望: "1.6.0"

# 資料庫連接測試
curl -s https://kcislk-infohub.zeabur.app/api/health | jq '.performance.database.status'
# 期望: "healthy"
```

#### 步驟3.2: 功能完整性測試 (部署後5-15分鐘)
```bash
# 測試新增的OAuth providers端點
curl -s https://kcislk-infohub.zeabur.app/api/auth/providers | jq 'keys'
# 期望: ["google"]

# 測試Google OAuth流程
curl -s -o /dev/null -w "%{http_code}" https://kcislk-infohub.zeabur.app/api/auth/google
# 期望: 302

# 測試資料完整性
curl -s https://kcislk-infohub.zeabur.app/api/public/info | jq '.success'
# 期望: true
```

#### 步驟3.3: 用戶體驗測試 (部署後15-30分鐘)
- **主頁載入**: 確認頁面正常顯示
- **OAuth登入**: 完整測試Google登入流程
- **權限系統**: 確認三層權限正常工作
- **資料顯示**: 確認events和resources正常載入

## 🔧 監控與警報設置

### 關鍵指標監控
```bash
# 自動化監控腳本
#!/bin/bash
# production-health-monitor.sh

while true; do
    VERSION=$(curl -s https://kcislk-infohub.zeabur.app/api/health | jq -r '.version')
    STATUS=$(curl -s https://kcislk-infohub.zeabur.app/api/health | jq -r '.status')
    DB_STATUS=$(curl -s https://kcislk-infohub.zeabur.app/api/health | jq -r '.performance.database.status')
    
    echo "$(date): Version=$VERSION, Status=$STATUS, DB=$DB_STATUS"
    
    if [ "$VERSION" != "1.6.0" ] || [ "$STATUS" != "OK" ] || [ "$DB_STATUS" != "healthy" ]; then
        echo "🚨 WARNING: Production health check failed!"
        # 發送警報通知
    fi
    
    sleep 60  # 每分鐘檢查一次
done
```

## 🔙 緊急回滾程序

### 回滾觸發條件
- HTTP 5xx錯誤持續超過2分鐘
- 資料庫連接失敗
- OAuth認證完全無法工作
- 用戶無法正常訪問網站

### 快速回滾步驟
```bash
# 1. 在Zeabur控制台中
#    - 找到Production部署歷史
#    - 選擇上一個穩定版本
#    - 點擊"Rollback"

# 2. 確認回滾成功
curl -s https://kcislk-infohub.zeabur.app/api/health | jq '.version'
# 應該回到: "1.0.0"

# 3. 通知相關人員回滾已完成
```

## 📅 升級時間表建議

### 第1週: 準備週
- **週一-週三**: Staging環境修復和測試
- **週四-週五**: 生產升級準備和文檔
- **週末**: 升級預演和團隊同步

### 第2週: 執行週
- **週六深夜 02:00-04:00**: 執行生產升級
- **週日**: 密集監控和驗證
- **週一**: 正常服務確認

## ✅ 升級成功標準

### 必須達成的指標
- [ ] ✅ 網站正常訪問 (HTTP 200)
- [ ] ✅ 版本顯示為v1.6.0
- [ ] ✅ 資料庫健康狀態
- [ ] ✅ OAuth完整功能
- [ ] ✅ 所有現有數據保持完整
- [ ] ✅ 新功能正常工作

### 性能標準
- [ ] ✅ 主頁響應時間 <500ms
- [ ] ✅ API響應時間 <200ms  
- [ ] ✅ 資料庫查詢時間 <100ms
- [ ] ✅ 零5xx錯誤

## 📞 升級支援團隊

### 升級期間聯絡資訊
- **技術負責人**: 準備24小時待命
- **Zeabur平台支援**: discord.gg/zeabur
- **GitHub Issues**: github.com/geonook/es-international-department/issues

### 升級後追蹤
- **第1天**: 每小時健康檢查
- **第2-7天**: 每4小時檢查
- **第2週**: 每日檢查
- **第3-4週**: 每週檢查

## 📝 升級記錄模板

```markdown
# 生產環境升級記錄 - v1.0.0 → v1.6.0

**升級日期**: ____年__月__日
**執行人員**: ________________
**開始時間**: __:__ UTC+8
**完成時間**: __:__ UTC+8

## 執行檢查清單
- [ ] Staging環境驗證通過
- [ ] 備份完成確認
- [ ] Zeabur部署執行
- [ ] 環境變數更新
- [ ] 健康檢查通過
- [ ] 功能測試完成
- [ ] 用戶驗收測試

## 遇到問題
無 / [記錄任何問題]

## 回滾情況
無需回滾 / [記錄回滾原因和過程]

## 升級總結
[記錄升級成功確認和關鍵觀察]
```

---
*安全升級計劃生成時間: 2025-09-07 20:55 UTC+8*  
*下一步: 建立自動化版本監控系統*