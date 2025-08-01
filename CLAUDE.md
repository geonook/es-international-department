# CLAUDE.md - ES International Department
# ES 國際部 - Claude Code 開發指導文件

> **Documentation Version**: 1.0 | **文件版本**: 1.0  
> **Last Updated**: 2025-01-31 | **最後更新**: 2025-01-31  
> **Project**: ES International Department | **專案**: ES 國際部  
> **Description**: ES International Department parent portal and resource center - A comprehensive Next.js application providing parents, teachers, and students with access to educational resources, event information, and communication tools.  
> **專案描述**: ES 國際部家長門戶網站和資源中心 - 一個為家長、教師和學生提供教育資源、活動資訊和溝通工具的綜合性 Next.js 應用程式。  
> **Features**: GitHub auto-backup, Task agents, technical debt prevention  
> **功能特色**: GitHub 自動備份、任務代理、技術債務預防

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
- **GITHUB BACKUP** - Push to GitHub after every commit to maintain backup: `git push origin main`  
  **GITHUB 備份** - 每次提交後推送到 GitHub 以維護備份：`git push origin main`
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
- **GITHUB BACKUP WORKFLOW** - After every commit: `git push origin main` to maintain GitHub backup  
  **GITHUB 備份工作流程** - 每次提交後：`git push origin main` 以維護 GitHub 備份
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
- **Core Features**: ✅ Complete - Home, Events, Resources pages  
  **核心功能**: ✅ 完成 - 首頁、活動、資源頁面
- **UI Components**: ✅ Complete - shadcn/ui component library  
  **UI 組件**: ✅ 完成 - shadcn/ui 組件庫
- **Animations**: ✅ Complete - Framer Motion integration  
  **動畫效果**: ✅ 完成 - Framer Motion 整合
- **Testing**: ⏳ Pending  
  **測試**: ⏳ 待完成
- **Documentation**: ✅ Complete  
  **文件**: ✅ 完成

### 📋 **PROJECT STRUCTURE | 專案結構**
```
es-international-department/
├── CLAUDE.md                  # Essential rules for Claude Code | Claude Code 重要規則
├── README.md                  # Project documentation | 專案文件  
├── app/                       # Next.js App Router | Next.js 應用路由
│   ├── layout.tsx             # Root layout | 根布局
│   ├── page.tsx               # Home page | 首頁
│   ├── events/                # Events section | 活動區域
│   ├── resources/             # Resources section | 資源區域
│   ├── admin/                 # Admin section | 管理區域
│   └── teachers/              # Teachers section | 教師區域
├── components/                # UI components | UI 組件
│   ├── ui/                    # shadcn/ui components | shadcn/ui 組件
│   └── theme-provider.tsx     # Theme configuration | 主題配置
├── lib/                       # Utilities | 工具函式
├── hooks/                     # Custom React hooks | 自定義 React hooks
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
node integration-test.js  # API integration tests | API 整合測試
node frontend-test.js     # Frontend tests | 前端測試

# Zeabur Cloud Testing | Zeabur 雲端測試
# Current deployment: https://landing-app-v2.zeabur.app
# Test results: 42.31% overall pass rate (11/26 tests)
# API: 25% pass rate | Frontend: 70% pass rate

# Git workflow | Git 工作流程
git add .                           # 暫存所有變更
git commit -m "feat: description"   # 提交變更（功能：描述）
git push origin main                # 推送到主分支
```

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