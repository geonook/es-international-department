# 三環境版本對齊指南 v1.6.0
# Three-Environment Version Alignment Guide v1.6.0

> **Target Version**: v1.6.0-stable  
> **目標版本**: v1.6.0-stable  
> **Date**: 2025-09-05  
> **Status**: Ready for deployment  
> **狀態**: 準備部署

## 🎯 **版本對齊目標** | **Version Alignment Goals**

將所有三個環境統一到 `v1.6.0-stable`，包含最新的重要修復和優化。

### 📊 **版本對比** | **Version Comparison**

| Environment | Current | Target | Status |
|-------------|---------|---------|--------|
| **Development** | v1.6.0 | v1.6.0-stable | ✅ Ready |
| **Staging** | v1.5.0-stable | v1.6.0-stable | ⬆️ Need Update |
| **Production** | v1.5.0-stable | v1.6.0-stable | ⬆️ Need Update |

## 🚀 **v1.6.0-stable 新增功能** | **v1.6.0-stable New Features**

### 🔧 **修復項目** | **Bug Fixes**
1. **OAuth 重定向修復** - 解決登入後重定向到 localhost 的問題
2. **環境變數載入優化** - 改善 Docker 容器中的環境變數檢測
3. **域名映射標準化** - 統一所有環境的域名參考

### 📚 **文檔更新** | **Documentation Updates**
1. **環境配置指南** - 完整的 staging 優化建議
2. **OAuth 故障排除** - 詳細的 OAuth 問題修復指南
3. **域名映射文檔** - 權威的環境域名參考

### ⚙️ **技術改進** | **Technical Improvements**
1. **強化環境檢測** - 更穩健的生產/staging 環境判斷
2. **錯誤處理優化** - 更好的 OAuth 錯誤回饋
3. **配置驗證增強** - 防止配置錯誤的保護措施

## 📋 **部署計劃** | **Deployment Plan**

### 階段 1: 創建穩定版本標籤 ✅
- [x] 更新 package.json 版本到 1.6.0
- [x] 更新環境映射文檔版本
- [ ] 創建 Git 標籤 `v1.6.0-stable`

### 階段 2: Staging 環境部署
- [ ] 觸發 Zeabur staging 重新部署
- [ ] 驗證 OAuth 修復生效
- [ ] 測試所有核心功能

### 階段 3: Production 環境部署 (可選)
- [ ] 在 staging 驗證成功後部署
- [ ] 監控生產環境健康狀況
- [ ] 確認所有功能正常運作

## 🛠️ **部署步驟** | **Deployment Steps**

### 開發人員執行 | Developer Actions

1. **創建版本標籤**:
   ```bash
   git tag -a v1.6.0-stable -m "Stable release v1.6.0 with OAuth fixes and environment optimizations"
   git push origin v1.6.0-stable
   ```

2. **驗證標籤創建**:
   ```bash
   git tag --list | grep v1.6.0
   ```

### 部署人員執行 | Deployment Actions

#### Staging 環境部署:
1. **在 Zeabur 控制台**:
   - 前往 staging 項目
   - 觸發手動重新部署或等待自動部署
   - 監控部署日誌

2. **驗證部署**:
   ```bash
   curl https://next14-landing.zeabur.app/api/health
   ```

3. **測試 OAuth 修復**:
   - 前往: https://next14-landing.zeabur.app/login
   - 測試 Google 登入流程
   - 確認重定向到正確域名

#### Production 環境部署 (在 staging 驗證後):
1. **在 Zeabur 控制台**:
   - 前往 production 項目
   - 觸發部署到 v1.6.0-stable

2. **生產環境驗證**:
   ```bash
   curl https://kcislk-infohub.zeabur.app/api/health
   ```

## ✅ **驗證清單** | **Verification Checklist**

### Staging 環境驗證 | Staging Verification
- [ ] 健康檢查端點回應正常
- [ ] Google OAuth 登入成功
- [ ] 重定向到正確的 staging 域名 (不是 localhost)
- [ ] Admin 頁面載入正常
- [ ] 所有核心功能運作

### Production 環境驗證 | Production Verification
- [ ] 健康檢查端點回應正常
- [ ] Google OAuth 登入成功
- [ ] 重定向到正確的 production 域名
- [ ] Admin 頁面載入正常
- [ ] 所有核心功能運作
- [ ] 與 staging 功能一致

## 🚨 **回滾計劃** | **Rollback Plan**

如果部署遇到問題：

### Staging 回滾:
```bash
# 回滾到之前的穩定版本
git checkout v1.5.0-stable
# 觸發重新部署
```

### Production 回滾:
```bash
# 同上，但更謹慎地執行
# 確保數據完整性
```

## 📊 **部署時程** | **Deployment Timeline**

| 階段 | 預計時間 | 責任人 | 狀態 |
|------|---------|--------|------|
| 版本標籤創建 | 5 分鐘 | 開發人員 | ⏳ 進行中 |
| Staging 部署 | 10-15 分鐘 | 部署人員 | ⏳ 等待中 |
| Staging 驗證 | 15 分鐘 | QA 團隊 | ⏳ 等待中 |
| Production 部署 | 10-15 分鐘 | 部署人員 | ⏳ 等待中 |
| Production 驗證 | 15 分鐘 | QA 團隊 | ⏳ 等待中 |

**總預計時間**: 60-75 分鐘

## 🔍 **已知問題與解決方案** | **Known Issues & Solutions**

### 問題 1: OAuth 重定向錯誤
**解決方案**: v1.6.0 已修復，包含環境檢測邏輯

### 問題 2: 環境變數載入失敗
**解決方案**: 增強的環境變數檢測和回退機制

### 問題 3: 域名配置不一致
**解決方案**: 統一的域名映射文檔和配置

## 📞 **聯絡資訊** | **Contact Information**

- **技術問題**: 開發團隊
- **部署問題**: DevOps 團隊  
- **業務問題**: 產品團隊

## 📝 **部署後確認事項** | **Post-Deployment Confirmation**

- [ ] 所有環境版本一致 (v1.6.0-stable)
- [ ] OAuth 登入在所有環境正常運作
- [ ] 域名重定向正確
- [ ] 核心功能驗證通過
- [ ] 效能監控正常
- [ ] 錯誤日誌無異常

---

**建議執行時間**: 平日上午 10:00-12:00  
**Recommended Execution Time**: Weekday 10:00-12:00  
**風險等級**: 低 | **Risk Level**: Low  
**預計停機時間**: 無 | **Expected Downtime**: None  

**版本負責人**: 開發團隊 | **Version Owner**: Development Team  
**最後更新**: 2025-09-05 | **Last Updated**: 2025-09-05