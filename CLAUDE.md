# CLAUDE.md - KCISLK ESID Info Hub
# KCISLK ESID Info Hub - Claude Code 開發指導文件

> **Documentation Version**: 1.8 | **文件版本**: 1.8  
> **Last Updated**: 2025-09-11 | **最後更新**: 2025-09-11  
> **Project**: KCISLK ESID Info Hub | **專案**: KCISLK ESID Info Hub  
> **Description**: KCISLK ESID Info Hub - Information service website for parents and teachers of KCISLK Elementary School International Department, providing the latest educational resources, event information, and communication tools.  
> **專案描述**: KCISLK ESID Info Hub - 為林口康橋國際學校的家長和老師提供最新教育資源、活動資訊和溝通工具的資訊服務網站。  
> **Features**: GitHub auto-backup, Task agents, technical debt prevention, multi-environment deployment strategy, Git branch management, real-time monitoring  
> **功能特色**: GitHub 自動備份、任務代理、技術債務預防、多環境部署策略、Git 分支管理、即時監控

This file provides essential guidance to Claude Code (claude.ai/code) when working with code in this repository.  
本文件為 Claude Code (claude.ai/code) 在此儲存庫中工作時提供重要指導原則。

## 🚨 CRITICAL RULES - READ FIRST | 重要規則 - 請先閱讀

> **⚠️ RULE ADHERENCE SYSTEM ACTIVE ⚠️** | **⚠️ 規則遵循系統已啟動 ⚠️**  
> **Claude Code must explicitly acknowledge these rules at task start**  
> **Claude Code 必須在任務開始時明確承認遵循這些規則**  
> **These rules override all other instructions and must ALWAYS be followed:**  
> **這些規則優先於所有其他指令，必須始終遵循：**

### 🔄 **RULE ACKNOWLEDGMENT REQUIRED | 規則確認要求**
> **Before starting ANY task, Claude Code must respond with:** | **開始任何任務前，Claude Code 必須回應：**  
> "✅ CRITICAL RULES ACKNOWLEDGED - I will follow all prohibitions and requirements listed in CLAUDE.md"  
> "✅ 重要規則已確認 - 我將遵循 CLAUDE.md 中列出的所有禁令和要求"

### ❌ ABSOLUTE PROHIBITIONS | 絕對禁令
- **NEVER** create new files in root directory → use proper module structure  
  **絕不** 在根目錄創建新檔案 → 使用適當的模組結構
- **NEVER** write output files directly to root directory → use designated output folders  
  **絕不** 直接在根目錄寫入輸出檔案 → 使用指定的輸出資料夾
- **NEVER** create documentation files (.md) unless explicitly requested by user  
  **絕不** 創建文檔檔案 (.md) 除非用戶明確要求
- **NEVER** use git commands with -i flag (interactive mode not supported)  
  **絕不** 使用帶有 -i 標誌的 git 命令（不支援互動模式）
- **NEVER** use `find`, `grep`, `cat`, `head`, `tail`, `ls` commands → use Read, LS, Grep, Glob tools instead  
  **絕不** 使用 `find`, `grep`, `cat`, `head`, `tail`, `ls` 命令 → 改用 Read, LS, Grep, Glob 工具
- **NEVER** create duplicate files (manager_v2.py, enhanced_xyz.py, utils_new.js) → ALWAYS extend existing files  
  **絕不** 創建重複檔案 (manager_v2.py, enhanced_xyz.py, utils_new.js) → 總是擴展現有檔案
- **NEVER** create multiple implementations of same concept → single source of truth  
  **絕不** 為同一概念創建多個實作 → 單一資訊來源
- **NEVER** copy-paste code blocks → extract into shared utilities/functions  
  **絕不** 複製貼上程式碼區塊 → 提取為共用工具/函式
- **NEVER** hardcode values that should be configurable → use config files/environment variables  
  **絕不** 硬編碼應可配置的值 → 使用配置檔案/環境變數
- **NEVER** use naming like enhanced_, improved_, new_, v2_ → extend original files instead  
  **絕不** 使用 enhanced_, improved_, new_, v2_ 等命名 → 改為擴展原始檔案

### 📝 MANDATORY REQUIREMENTS | 強制要求
- **COMMIT** after every completed task/phase - no exceptions  
  **提交** 每個完成的任務/階段後 - 無例外
- **GITHUB BACKUP** - Push to GitHub after every commit to maintain backup: `git push origin <current-branch>`  
  **GITHUB 備份** - 每次提交後推送到 GitHub 以維護備份：`git push origin <當前分支>`
- **USE TASK AGENTS** for all long-running operations (>30 seconds) - Bash commands stop when context switches  
  **使用任務代理** 處理所有長時間運行的操作（>30秒）- Bash 命令在上下文切換時會停止
- **TODOWRITE** for complex tasks (3+ steps) → parallel agents → git checkpoints → test validation  
  **TODOWRITE** 用於複雜任務（3+步驟）→ 並行代理 → git 檢查點 → 測試驗證
- **READ FILES FIRST** before editing - Edit/Write tools will fail if you didn't read the file first  
  **先讀取檔案** 再編輯 - 如果沒有先讀取檔案，Edit/Write 工具會失敗
- **DEBT PREVENTION** - Before creating new files, check for existing similar functionality to extend  
  **債務預防** - 創建新檔案前，檢查是否有現有類似功能可擴展
- **SINGLE SOURCE OF TRUTH** - One authoritative implementation per feature/concept  
  **單一資訊來源** - 每個功能/概念只有一個權威實作

### ⚡ EXECUTION PATTERNS | 執行模式
- **PARALLEL TASK AGENTS** - Launch multiple Task agents simultaneously for maximum efficiency  
  **並行任務代理** - 同時啟動多個任務代理以獲得最大效率
- **SYSTEMATIC WORKFLOW** - TodoWrite → Parallel agents → Git checkpoints → GitHub backup → Test validation  
  **系統化工作流程** - TodoWrite → 並行代理 → Git 檢查點 → GitHub 備份 → 測試驗證
- **GITHUB BACKUP WORKFLOW** - After every commit: `git push origin <current-branch>` to maintain GitHub backup  
  **GITHUB 備份工作流程** - 每次提交後：`git push origin <當前分支>` 以維護 GitHub 備份
- **BACKGROUND PROCESSING** - ONLY Task agents can run true background operations  
  **背景處理** - 只有任務代理能執行真正的背景操作

### 🔍 MANDATORY PRE-TASK COMPLIANCE CHECK | 強制任務前合規檢查
> **STOP: Before starting any task, Claude Code must explicitly verify ALL points:**  
> **停止：開始任何任務前，Claude Code 必須明確驗證所有要點：**

**Step 1: Rule Acknowledgment | 步驟 1：規則確認**
- [ ] ✅ I acknowledge all critical rules in CLAUDE.md and will follow them  
- [ ] ✅ 我確認 CLAUDE.md 中的所有重要規則並將遵循它們

**Step 2: Task Analysis | 步驟 2：任務分析**  
- [ ] Will this create files in root? → If YES, use proper module structure instead  
- [ ] 這會在根目錄創建檔案嗎？→ 如果是，改用適當的模組結構
- [ ] Will this take >30 seconds? → If YES, use Task agents not Bash  
- [ ] 這會花費超過30秒嗎？→ 如果是，使用任務代理而非 Bash
- [ ] Is this 3+ steps? → If YES, use TodoWrite breakdown first  
- [ ] 這有3個以上步驟嗎？→ 如果是，先使用 TodoWrite 分解
- [ ] Am I about to use grep/find/cat? → If YES, use proper tools instead  
- [ ] 我即將使用 grep/find/cat 嗎？→ 如果是，改用適當的工具

**Step 3: Technical Debt Prevention (MANDATORY SEARCH FIRST)**
- [ ] **SEARCH FIRST**: Use Grep pattern="<functionality>.*<keyword>" to find existing implementations
- [ ] **CHECK EXISTING**: Read any found files to understand current functionality
- [ ] Does similar functionality already exist? → If YES, extend existing code
- [ ] Am I creating a duplicate class/manager? → If YES, consolidate instead
- [ ] Will this create multiple sources of truth? → If YES, redesign approach
- [ ] Have I searched for existing implementations? → Use Grep/Glob tools first
- [ ] Can I extend existing code instead of creating new? → Prefer extension over creation
- [ ] Am I about to copy-paste code? → Extract to shared utility instead

**Step 4: Session Management**
- [ ] Is this a long/complex task? → If YES, plan context checkpoints
- [ ] Have I been working >1 hour? → If YES, consider /compact or session break

> **⚠️ DO NOT PROCEED until all checkboxes are explicitly verified**

## 🏗️ PROJECT OVERVIEW | 專案概述

### 🎯 **DEVELOPMENT STATUS | 開發狀態**
- **Setup**: ✅ Complete - Next.js 14 with TypeScript  
  **環境設定**: ✅ 完成 - Next.js 14 與 TypeScript
- **Three-Tier Permission System**: ✅ Complete - Admin, Office Member, Viewer roles  
  **三層權限系統**: ✅ 完成 - 管理員、辦公室成員、觀看者角色
- **Permission Upgrade System**: ✅ Complete - Request/review/approve workflow  
  **權限升級系統**: ✅ 完成 - 請求/審核/批准工作流程
- **Authentication**: ✅ Complete - Google OAuth 2.0 + JWT + auto viewer assignment  
  **認證系統**: ✅ 完成 - Google OAuth 2.0 + JWT + 自動 viewer 角色分配
- **OAuth Multi-Environment**: ✅ Complete - Fixed localhost redirect issues, staging/production deployed  
  **OAuth 多環境**: ✅ 完成 - 修復localhost重定向問題，staging/production已部署
- **API Routes**: ✅ Complete - 32 routes with dynamic rendering, /api/auth/providers endpoint added  
  **API 路由**: ✅ 完成 - 32個路由支持動態渲染，新增/api/auth/providers端點
- **Docker Deployment**: ✅ Complete - Dynamic PORT configuration for Zeabur cloud deployment  
  **Docker 部署**: ✅ 完成 - 動態PORT配置支持Zeabur雲端部署
- **Core Features**: ✅ Complete - Home, Events, Resources pages  
  **核心功能**: ✅ 完成 - 首頁、活動、資源頁面
- **UI Components**: ✅ Complete - shadcn/ui component library  
  **UI 組件**: ✅ 完成 - shadcn/ui 組件庫
- **Animations**: ✅ Complete - Framer Motion integration  
  **動畫效果**: ✅ 完成 - Framer Motion 整合
- **Testing Infrastructure**: ✅ Complete - OAuth config tests, browser testing, 30+ TODO items implemented  
  **測試基礎設施**: ✅ 完成 - OAuth 配置測試、瀏覽器測試、30+ TODO 項目實作
- **TypeScript Optimization**: ✅ Complete - Fixed 200+ compilation errors, zero-error state achieved  
  **TypeScript 優化**: ✅ 完成 - 修復200+ 編譯錯誤，達到零錯誤狀態
- **Performance Optimization**: ✅ Complete - Fixed 48 N+1 query issues, enterprise-grade performance  
  **效能優化**: ✅ 完成 - 修復48個N+1查詢問題，達到企業級效能標準
- **Git Branch Management & Multi-Environment**: ✅ Complete - Standardized three-environment workflow with automated Staging deployment and manual Production control  
  **Git 分支管理與多環境系統**: ✅ 完成 - 標準化三環境工作流程，自動 Staging 部署與手動 Production 控制
- **Documentation**: ✅ Complete - Comprehensive setup guides  
  **文件**: ✅ 完成 - 完整設定指南

### 📋 **PROJECT STRUCTURE | 專案結構**
```
kcislk-esid-info-hub/
├── CLAUDE.md                  # Essential rules for Claude Code | Claude Code 重要規則
├── README.md                  # Project documentation | 專案文件
├── todo.md                    # Development roadmap and status | 開發路線圖與狀態
├── app/                       # Next.js App Router | Next.js 應用路由
│   ├── layout.tsx             # Root layout | 根布局
│   ├── page.tsx               # Home page | 首頁
│   ├── api/                   # API routes (32 routes with dynamic rendering) | API 路由（32個路由支持動態渲染）
│   │   ├── auth/              # Authentication endpoints | 認證端點
│   │   │   ├── providers/     # OAuth providers configuration | OAuth 提供商配置
│   │   │   ├── google/        # Google OAuth initialization | Google OAuth 初始化
│   │   │   └── callback/      # OAuth callback handler | OAuth 回調處理
│   │   ├── admin/             # Admin API endpoints | 管理員 API 端點
│   │   │   ├── users/         # User management APIs | 用戶管理 API
│   │   │   │   └── [id]/      # Individual user operations | 個別用戶操作
│   │   │   │       └── upgrade-request/ # Permission upgrade requests | 權限升級請求
│   │   │   └── upgrade-requests/ # Permission upgrade management | 權限升級管理
│   │   └── health/            # Health check endpoint | 健康檢查端點
│   ├── login/                 # Login page with OAuth | 包含 OAuth 的登入頁面
│   ├── welcome/               # New user onboarding | 新用戶歡迎頁面
│   ├── test-oauth/            # OAuth testing interface (dev only) | OAuth 測試介面（僅開發）
│   ├── events/                # Events section | 活動區域
│   ├── resources/             # Resources section | 資源區域
│   ├── admin/                 # Admin section | 管理區域
│   └── teachers/              # Teachers section | 教師區域
├── components/                # UI components | UI 組件
│   ├── ui/                    # shadcn/ui components | shadcn/ui 組件
│   └── theme-provider.tsx     # Theme configuration | 主題配置
├── lib/                       # Utilities | 工具函式
│   ├── auth.ts                # JWT authentication | JWT 認證
│   ├── google-oauth.ts        # Google OAuth utilities | Google OAuth 工具
│   ├── prisma.ts              # Database connection | 資料庫連接
│   └── rbac.ts                # Role-based access control | 角色權限控制
├── hooks/                     # Custom React hooks | 自定義 React hooks
│   └── useAuth.ts             # Authentication hook | 認證 hook
├── prisma/                    # Database schema and migrations | 資料庫架構與遷移
│   ├── schema.prisma          # Database schema | 資料庫架構
│   └── seed.ts                # Database seeding | 資料庫種子資料
├── scripts/                   # Development and testing scripts | 開發與測試腳本
│   ├── switch-env.ts          # Enhanced environment switcher | 增強環境切換器
│   ├── environment-monitor.ts # Real-time monitoring system | 即時監控系統
│   ├── test-oauth-config.ts   # OAuth configuration testing | OAuth 配置測試
│   └── test-db-connection.ts  # Database connection testing | 資料庫連接測試
├── docs/                      # Documentation | 文件
│   ├── GIT-WORKFLOW-GUIDE.md  # Git workflow standards | Git 工作流程標準
│   ├── QUICK-START-OAUTH.md   # OAuth quick setup guide | OAuth 快速設定指南
│   ├── google-oauth-setup.md  # Detailed OAuth setup | 詳細 OAuth 設定
│   ├── OAUTH-STATUS-SUMMARY.md # Implementation status | 實作狀態總結
│   ├── ENVIRONMENT-STATUS-REPORT.md # Multi-environment status | 多環境狀態報告
│   ├── SECURITY-AUDIT-REPORT.md # Comprehensive security audit | 全面安全稽核
│   └── SECURITY-BEST-PRACTICES.md # Security guidelines & procedures | 安全指南與程序
├── .github/                   # GitHub configurations | GitHub 配置
│   └── workflows/
│       └── ci-cd.yml          # Multi-environment CI/CD pipeline | 多環境CI/CD流水線
├── public/                    # Static assets | 靜態資源
├── styles/                    # Global styles | 全域樣式
└── output/                    # Generated files (DO NOT commit) | 生成檔案（請勿提交）
```

## 🎯 RULE COMPLIANCE CHECK

Before starting ANY task, verify:
- [ ] ✅ I acknowledge all critical rules above
- [ ] Files go in proper module structure (not root)
- [ ] Use Task agents for >30 second operations
- [ ] TodoWrite for 3+ step tasks
- [ ] Commit after each completed task

## 🚀 COMMON COMMANDS | 常用命令

```bash
# Development | 開發
npm run dev          # Start development server | 啟動開發伺服器
npm run build        # Build for production | 建置生產版本
npm run start        # Start production server | 啟動生產伺服器
npm run lint         # Run ESLint | 執行 ESLint

# Testing | 測試
npm test             # Run tests | 執行測試
npm run test:oauth-config  # Test OAuth configuration | 測試 OAuth 配置
node integration-test.js  # API integration tests | API 整合測試
node frontend-test.js     # Frontend tests | 前端測試

# Environment Management | 環境管理
npm run env:switch development  # Switch to development | 切換開發環境
npm run env:switch staging      # Switch to staging | 切換預備環境
npm run env:switch production   # Switch to production | 切換正式環境
npm run env:switch status       # Check all environments | 檢查所有環境
npm run env:switch health       # Environment health check | 環境健康檢查

# Environment Monitoring | 環境監控
npm run env:monitor             # Start monitoring (30s interval) | 啟動監控（30秒間隔）
npm run env:monitor:start       # Start monitoring (30s interval) | 啟動監控（30秒間隔）
npm run env:monitor:fast        # Start monitoring (10s interval) | 啟動監控（10秒間隔）

# Zeabur Cloud Testing | Zeabur 雲端測試

# Multi-Environment Deployments | 多環境部署
# Staging Environment: https://next14-landing.zeabur.app
# Production Environment: https://kcislk-infohub.zeabur.app  
# Google OAuth system configured for both environments
# OAuth testing interface: http://localhost:3001/test-oauth (dev)

# Git workflow | Git 工作流程 (Follow three-environment standard)
git add .                           # 暫存所有變更
git commit -m "feat: description"   # 提交變更（功能：描述）
git push origin develop             # 推送到 develop 分支 (觸發 Staging 部署)
# git push origin main              # 只有準備 Production 發布時才推送到 main
```

## 🌍 MULTI-ENVIRONMENT & GIT BRANCH MANAGEMENT | 多環境與 Git 分支管理規範

### 🏗️ **THREE-ENVIRONMENT ARCHITECTURE | 三環境架構**

#### **Environment Mapping | 環境對應關係**
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
    ├── 分支: main (手動控制部署)
    ├── 地址: https://kcislk-infohub.zeabur.app
    └── 用途: 正式營運服務
```

#### **Branch Usage Rules | 分支使用規則**
- **main**: 僅存放生產就緒的穩定版本 | Only production-ready stable versions
- **develop**: 開發主線，所有功能整合與測試 | Development mainline for feature integration and testing
- **feature/***: 功能開發分支，完成後合併到 develop | Feature development branches, merged to develop when complete
- **hotfix/***: 緊急修復分支，可同時合併到 main 和 develop | Emergency fix branches, can be merged to both main and develop

### 🔄 **STANDARD DEVELOPMENT WORKFLOW | 標準開發流程**

#### **Daily Feature Development | 日常功能開發**
```bash
# 1. Create feature branch from develop | 從 develop 創建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/新功能描述

# 2. Local development and testing | 本地開發與測試
npm run dev  # Development on localhost:3001

# 3. Commit completed work | 開發完成後提交
git add .
git commit -m "feat: 新功能描述"
git push origin feature/新功能描述

# 4. Merge to develop (triggers Staging auto-deployment) | 合併到 develop (觸發 Staging 自動部署)
git checkout develop  
git merge feature/新功能描述
git push origin develop

# 5. After Staging testing passes, prepare Production release | Staging 環境測試通過後，準備發布到 Production
# ⚠️ MANUAL CONTROL: Only YOU decide when to update Production | 手動控制：只有您決定何時更新 Production
git checkout main
git merge develop
git push origin main  # Triggers Production auto-deployment | 觸發 Production 自動部署
```

#### **Production Control Mechanism | Production 控制機制**
> **🛡️ KEY PRINCIPLE | 關鍵原則**: Production 環境只有在您明確合併 develop 到 main 時才會更新  
> **Production environment only updates when YOU explicitly merge develop to main**

### 🚨 **EMERGENCY HOTFIX WORKFLOW | 緊急修復流程**

```bash
# 1. Create hotfix branch from main | 從 main 創建 hotfix 分支
git checkout main
git pull origin main
git checkout -b hotfix/緊急問題描述

# 2. Fix issue and test | 修復問題並測試
# ... fix the critical issue ...

# 3. Merge to both main and develop | 同時合併到 main 和 develop
git checkout main
git merge hotfix/緊急問題描述
git push origin main

git checkout develop  
git merge hotfix/緊急問題描述
git push origin develop

# 4. Clean up hotfix branch | 刪除 hotfix 分支
git branch -d hotfix/緊急問題描述
git push origin --delete hotfix/緊急問題描述
```

### ✅ **BEST PRACTICES | 最佳實務**

#### **Commit Message Standards | 提交訊息規範**
```bash
# Feature additions | 功能新增
git commit -m "feat: 新增 Parents' Corner 首頁管理功能"

# Bug fixes | 問題修復  
git commit -m "fix: 修復 OAuth 重定向錯誤"

# Performance improvements | 效能改進
git commit -m "perf: 優化資料庫查詢效能"

# Documentation updates | 文檔更新
git commit -m "docs: 更新部署指南"

# Code refactoring | 重構代碼
git commit -m "refactor: 重構認證中介軟體"
```

#### **Branch Naming Standards | 分支命名規範**
```bash
# Feature branches | 功能分支
feature/homepage-management
feature/user-authentication  
feature/parent-notification-system

# Hotfix branches | 修復分支
hotfix/oauth-callback-error
hotfix/database-connection-issue

# Release branches (if needed) | 發布分支 (如需要)
release/v1.7.0
```

#### **Code Review Requirements | 代碼審查要求**
- All merges to main require code review | 所有合併到 main 的變更都需要經過代碼審查
- Develop branch merges can be fast-forward | develop 分支的合併可以是 fast-forward
- Important features must be thoroughly tested in Staging | 重要功能需要在 Staging 環境充分測試後才能發布

### 🛠️ **ENVIRONMENT MANAGEMENT COMMANDS | 環境管理命令**

#### **Branch Management | 分支管理**
```bash
# View all branches | 查看所有分支
git branch -a

# Check branch differences | 查看分支差異
git log --oneline develop..main  # main 領先 develop 的提交
git log --oneline main..develop  # develop 領先 main 的提交

# Sync remote branches | 同步遠程分支
git fetch origin
git remote prune origin  # Clean up deleted remote branches | 清理已刪除的遠程分支
```

#### **Environment Verification | 環境驗證**
```bash
# Check Staging environment | 檢查 Staging 環境
curl https://next14-landing.zeabur.app/api/health

# Check Production environment | 檢查 Production 環境  
curl https://kcislk-infohub.zeabur.app/api/health

# Verify OAuth endpoints | 驗證 OAuth 端點
curl https://next14-landing.zeabur.app/api/auth/providers
curl https://kcislk-infohub.zeabur.app/api/auth/providers
```

#### **Troubleshooting | 問題排除**
```bash
# View branch history graph | 查看分支歷史圖
git log --graph --oneline --all

# Check unpushed commits | 檢查未推送的提交
git log origin/develop..HEAD

# Force sync develop branch (use carefully) | 強制同步 develop 分支 (謹慎使用)
git checkout develop
git reset --hard origin/main
git push origin develop --force-with-lease
```

### 📈 **VERSION RELEASE WORKFLOW | 版本發布流程**

#### **Pre-Release Preparation | 準備發布**
1. **Staging Environment Testing** | **Staging 環境測試**: Thoroughly test in develop branch
2. **Feature Completeness Check** | **功能完整性檢查**: Ensure all planned features are completed  
3. **Performance and Security Validation** | **效能和安全驗證**: Run complete test suite
4. **Documentation Updates** | **文檔更新**: Synchronize relevant documentation

#### **Official Release | 正式發布**
1. **Merge to main** | **合併到 main**: `git checkout main && git merge develop`
2. **Tag version** | **標籤版本**: `git tag -a v1.7.0 -m "Release version 1.7.0"`
3. **Push release** | **推送發布**: `git push origin main && git push origin v1.7.0`
4. **Monitor deployment** | **監控部署**: Ensure Production environment starts normally

#### **Post-Release Verification | 發布後驗證**
1. **Feature Testing** | **功能測試**: Verify key features work normally
2. **Performance Monitoring** | **效能監控**: Check system performance metrics
3. **Error Monitoring** | **錯誤監控**: Ensure no new errors are generated
4. **User Feedback** | **使用者回饋**: Collect and process user feedback

### 🚨 **IMPORTANT CONSIDERATIONS | 重要注意事項**

#### **Operations to Avoid | 避免的操作**
- ❌ **Direct development on main branch** | **直接在 main 分支開發**: All development should be in develop or feature branches
- ❌ **Skip Staging testing** | **跳過 Staging 測試**: Important changes must be validated in Staging environment
- ❌ **Use --force push** | **使用 --force push**: Avoid force pushing unless absolutely necessary
- ❌ **Merge untested code** | **合併未測試的代碼**: Ensure functionality is fully tested locally before merging

#### **Must Follow Rules | 必須遵循的規則**
- ✅ **Follow CLAUDE.md standards** | **遵循 CLAUDE.md 規範**: Commit immediately after each completed task
- ✅ **Push to GitHub backup** | **推送到 GitHub 備份**: Push to remote after every commit
- ✅ **Use TodoWrite tracking** | **使用 TodoWrite 追蹤**: Use todo lists for complex task management
- ✅ **Verify environment consistency** | **驗證環境一致性**: Ensure functionality is synchronized across three environments

---

## 🚨 TECHNICAL DEBT PREVENTION | 技術債務預防

### ❌ WRONG APPROACH (Creates Technical Debt) | 錯誤方法（產生技術債務）:
```bash
# Creating new file without searching first | 未先搜尋就創建新檔案
Write(file_path="new_feature.tsx", content="...")
```

### ✅ CORRECT APPROACH (Prevents Technical Debt) | 正確方法（預防技術債務）:
```bash
# 1. SEARCH FIRST | 1. 先搜尋
Grep(pattern="feature.*implementation", glob="**/*.{ts,tsx}")
# 2. READ EXISTING FILES | 2. 讀取現有檔案  
Read(file_path="existing_feature.tsx")
# 3. EXTEND EXISTING FUNCTIONALITY | 3. 擴展現有功能
Edit(file_path="existing_feature.tsx", old_string="...", new_string="...")
```

## 🧹 DEBT PREVENTION WORKFLOW

### Before Creating ANY New File:
1. **🔍 Search First** - Use Grep/Glob to find existing implementations
2. **📋 Analyze Existing** - Read and understand current patterns
3. **🤔 Decision Tree**: Can extend existing? → DO IT | Must create new? → Document why
4. **✅ Follow Patterns** - Use established project patterns
5. **📈 Validate** - Ensure no duplication or technical debt

## 🎯 NEXT.JS SPECIFIC GUIDELINES | NEXT.JS 專用指導原則

### Component Creation | 組件創建
- Use TypeScript for all components | 所有組件使用 TypeScript
- Follow existing shadcn/ui patterns | 遵循現有 shadcn/ui 模式
- Implement proper animations with Framer Motion | 使用 Framer Motion 實作適當的動畫
- Use proper Next.js App Router patterns | 使用適當的 Next.js App Router 模式

### File Organization | 檔案組織
- Pages in `app/` directory | 頁面放在 `app/` 目錄
- Components in `components/` directory | 組件放在 `components/` 目錄
- Utilities in `lib/` directory | 工具函式放在 `lib/` 目錄
- Hooks in `hooks/` directory | Hooks 放在 `hooks/` 目錄

### Styling | 樣式設計
- Use Tailwind CSS classes | 使用 Tailwind CSS 類別
- Follow existing design system | 遵循現有設計系統
- Maintain consistent gradients and animations | 維持一致的漸層和動畫效果

---

**⚠️ Prevention is better than consolidation - build clean from the start.**  
**⚠️ 預防勝於整併 - 從一開始就建立乾淨的程式碼。**  
**🎯 Focus on single source of truth and extending existing functionality.**  
**🎯 專注於單一資訊來源並擴展現有功能。**  
**📈 Each task should maintain clean architecture and prevent technical debt.**  
**📈 每個任務都應維持乾淨的架構並預防技術債務。**

---

*Template by Chang Ho Chien | HC AI 說人話channel | v1.0.0*  
*模板作者：Chang Ho Chien | HC AI 說人話頻道 | v1.0.0*