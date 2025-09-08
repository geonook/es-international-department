# 🚀 Git 工作流程指南
## Git Workflow Guide for KCISLK ESID Info Hub

> **版本**: 1.0  
> **更新日期**: 2025-09-08  
> **適用範圍**: 多環境部署與分支管理策略  

---

## 🏗️ **分支架構**

### **環境對應關係**
```
📦 三環境架構
├── 🖥️ Development (本地開發)
│   ├── 分支: develop (主要開發分支)
│   ├── 地址: http://localhost:3001
│   └── 用途: 日常開發與功能測試
│
├── 🧪 Staging (測試環境)  
│   ├── 分支: develop (自動部署)
│   ├── 地址: https://next14-landing.zeabur.app
│   └── 用途: 整合測試與預發布驗證
│
└── 🌟 Production (生產環境)
    ├── 分支: main (自動部署)
    ├── 地址: https://kcislk-infohub.zeabur.app
    └── 用途: 正式營運服務
```

### **分支使用規則**
- **main**: 僅存放生產就緒的穩定版本
- **develop**: 開發主線，所有功能整合與測試
- **feature/***: 功能開發分支，完成後合併到 develop
- **hotfix/***: 緊急修復分支，可同時合併到 main 和 develop

---

## 🔄 **標準開發流程**

### **日常功能開發**
```bash
# 1. 從 develop 創建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/新功能描述

# 2. 本地開發與測試
npm run dev  # 在 localhost:3001 開發

# 3. 開發完成後提交
git add .
git commit -m "feat: 新功能描述"
git push origin feature/新功能描述

# 4. 合併到 develop (觸發 Staging 自動部署)
git checkout develop  
git merge feature/新功能描述
git push origin develop

# 5. Staging 環境測試通過後，準備發布到 Production
git checkout main
git merge develop
git push origin main  # 觸發 Production 自動部署
```

### **緊急修復流程**
```bash
# 1. 從 main 創建 hotfix 分支
git checkout main
git pull origin main
git checkout -b hotfix/緊急問題描述

# 2. 修復問題並測試
# 3. 同時合併到 main 和 develop
git checkout main
git merge hotfix/緊急問題描述
git push origin main

git checkout develop  
git merge hotfix/緊急問題描述
git push origin develop

# 4. 刪除 hotfix 分支
git branch -d hotfix/緊急問題描述
git push origin --delete hotfix/緊急問題描述
```

---

## ✅ **最佳實務**

### **提交訊息規範**
```bash
# 功能新增
git commit -m "feat: 新增 Parents' Corner 首頁管理功能"

# 問題修復  
git commit -m "fix: 修復 OAuth 重定向錯誤"

# 效能改進
git commit -m "perf: 優化資料庫查詢效能"

# 文檔更新
git commit -m "docs: 更新部署指南"

# 重構代碼
git commit -m "refactor: 重構認證中介軟體"
```

### **分支命名規範**
```bash
# 功能分支
feature/homepage-management
feature/user-authentication  
feature/parent-notification-system

# 修復分支
hotfix/oauth-callback-error
hotfix/database-connection-issue

# 發布分支 (如需要)
release/v1.6.2
```

### **代碼審查要求**
- 所有合併到 main 的變更都需要經過代碼審查
- develop 分支的合併可以是 fast-forward
- 重要功能需要在 Staging 環境充分測試後才能發布

---

## 🛠️ **常用命令**

### **分支管理**
```bash
# 查看所有分支
git branch -a

# 查看分支差異
git log --oneline develop..main  # main 領先 develop 的提交
git log --oneline main..develop  # develop 領先 main 的提交

# 同步遠程分支
git fetch origin
git remote prune origin  # 清理已刪除的遠程分支
```

### **環境驗證**
```bash
# 檢查 Staging 環境
curl https://next14-landing.zeabur.app/api/health

# 檢查 Production 環境  
curl https://kcislk-infohub.zeabur.app/api/health

# 驗證 OAuth 端點
curl https://next14-landing.zeabur.app/api/auth/providers
```

### **問題排除**
```bash
# 查看分支歷史圖
git log --graph --oneline --all

# 檢查未推送的提交
git log origin/develop..HEAD

# 強制同步 develop 分支 (謹慎使用)
git checkout develop
git reset --hard origin/main
git push origin develop --force-with-lease
```

---

## 🚨 **重要注意事項**

### **避免的操作**
- ❌ **直接在 main 分支開發**: 所有開發都應在 develop 或 feature 分支
- ❌ **跳過 Staging 測試**: 重要變更必須經過 Staging 環境驗證
- ❌ **使用 --force push**: 除非絕對必要，避免強制推送
- ❌ **合併未測試的代碼**: 確保功能在本地完全測試後才合併

### **必須遵循的規則**
- ✅ **遵循 CLAUDE.md 規範**: 每個任務完成後立即提交
- ✅ **推送到 GitHub 備份**: 每次提交後都要推送到遠程
- ✅ **使用 TodoWrite 追蹤**: 複雜任務使用 todo 清單管理
- ✅ **驗證環境一致性**: 確保三個環境功能同步

---

## 📈 **版本發布流程**

### **準備發布**
1. **Staging 環境測試**: 在 develop 分支充分測試
2. **功能完整性檢查**: 確保所有計劃功能都已完成  
3. **效能和安全驗證**: 運行完整的測試套件
4. **文檔更新**: 同步更新相關文檔

### **正式發布**
1. **合併到 main**: `git checkout main && git merge develop`
2. **標籤版本**: `git tag -a v1.6.2 -m "Release version 1.6.2"`
3. **推送發布**: `git push origin main && git push origin v1.6.2`
4. **監控部署**: 確認 Production 環境正常啟動

### **發布後驗證**
1. **功能測試**: 驗證關鍵功能正常運作
2. **效能監控**: 檢查系統效能指標
3. **錯誤監控**: 確保沒有新的錯誤產生
4. **使用者回饋**: 收集和處理使用者回饋

---

## 🔗 **相關資源**

- 📋 **部署指南**: `docs/DEPLOYMENT-WORKFLOW.md`
- 🔒 **安全最佳實務**: `docs/SECURITY-BEST-PRACTICES.md`  
- 🧪 **測試指南**: `docs/TESTING-GUIDE.md`
- 🏗️ **架構文檔**: `docs/SYSTEM-ARCHITECTURE-COMPLETE-v3.md`

---

**🎯 遵循這個工作流程將確保代碼質量、環境穩定性和團隊協作效率！**

---

*更新日期: 2025-09-08 | Generated by Claude Code*