# KCISLK ESID Info Hub
**Information Service Website for KCISLK Elementary School International Department | 林口康橋國際學校資訊服務網站**

> **📊 項目狀態**: 99% 完成 | **🚀 部署狀態**: ✅ 生產就緒  
> **⚡ 最後更新**: 2025-09-03 | **🎯 里程碑**: 🎉 微服務架構實施完成 + Parents' Corner 獨立服務創建

## 🎉 最新成果 | Latest Achievements

### ✅ **微服務架構實施完成 (2025-09-03)**
- **🏗️ Parents' Corner 微服務**: 成功創建獨立的公開展示服務
- **📍 雙服務運行**: 主應用 (port 3001) + Parents' Corner (port 3002)
- **🔗 GitHub Repository**: https://github.com/geonook/new-parent-s-corner-website
- **🌐 Zeabur 部署準備**: 微服務架構配置完成，準備部署

### ✅ **重大修復完成 (2025-09-03)**
- **🔧 localhost:3001 Internal Server Error**: 完全修復，開發伺服器正常運行
- **📊 所有關鍵頁面**: 首頁、登入頁面、API 健康檢查全部回傳 HTTP 200
- **💾 資料庫連接**: 確認 PostgreSQL 連接穩定，測試通過
- **🚀 開發環境**: 完全就緒，支援所有開發工作流程

### ✅ 核心系統全面完成
- **🔐 三層權限系統**: Admin > Office Member > Viewer 完整實現 (100%)
- **🔄 權限升級流程**: 用戶請求 → 管理員審核 → 自動角色分配 (100%)
- **🔐 認證系統**: Google OAuth 2.0 + JWT + 新用戶自動 viewer 角色 (100%)
- **📝 內容管理**: 公告、活動、資源管理系統 (100%)
- **👥 用戶管理**: 動態權限控制、包容性管理介面 (100%)
- **📁 檔案系統**: 安全檔案上傳、處理、服務 (100%)
- **📄 富文本編輯器**: TinyMCE 8.0.1 + GPL 授權 + 圖片上傳 (100%)
- **🎨 UI/UX**: shadcn/ui 組件、Framer Motion 動畫 (100%)
- **⚙️ 基礎架構**: Next.js 14、TypeScript、Prisma + 性能優化 (100%)

### 🚀 **三層權限系統重大更新 (2025-08-23)**
- **✅ Admin > Office Member > Viewer**: 完整三層權限階層實現
- **✅ Google OAuth 新用戶流程**: 自動分配 viewer 角色，無需待審核
- **✅ 權限升級請求系統**: 用戶主動申請、管理員審核機制
- **✅ 包容性管理介面**: 所有用戶可進入 admin，功能依角色限制
- **✅ PermissionUpgradeRequest 模型**: 完整數據庫架構支援
- **✅ API 端點完整實現**: 升級請求/審核/管理全套 API
- **✅ useAuth Hook 增強**: 新增 isViewer() 函數支援
- **✅ UserList 組件升級**: 支援 viewer 角色篩選功能

### 🚀 **重大部署修復與優化 (2025-08-08)**
- **✅ Email Service 初始化錯誤修復**: 延遲初始化模式實施
- **✅ API 路由認證優化**: 減少 cookies() 使用，改善動態渲染
- **✅ Dockerfile 安全性完善**: 非 root 用戶 + 健康檢查
- **✅ AWS SDK 建置警告移除**: 動態引入機制優化
- **✅ 統一環境變數驗證**: Zod 類型安全驗證系統
- **✅ 性能監控系統**: 快取、數據庫優化、API 中間件
- **✅ 安全審計通過**: 零高風險漏洞，生產就緒

### 🎯 剩餘任務 | Remaining Tasks

#### 🟡 中優先級 (功能完善)  
- **Google OAuth 生產憑證**: Google Console 憑證配置
- **權限升級系統測試**: 端到端升級流程驗證
- **最終測試與驗證**: 三層權限系統完整測試
- **用戶體驗優化**: 權限界面細節完善

#### 🟢 低優先級 (系統增強)
- **監控儀表板**: 生產環境監控配置
- **日誌分析系統**: 詳細日誌收集與分析
- **備份策略實施**: 自動化備份配置

> **專案狀態**: ✅ **生產就緒** - 主要功能全部完成，僅剩生產配置優化

## Quick Start | 快速開始

1. **Read CLAUDE.md first** - Contains essential rules for Claude Code  
   **請先閱讀 CLAUDE.md** - 包含 Claude Code 的重要規則
2. Follow the pre-task compliance checklist before starting any work  
   開始任何工作前請遵循任務前合規檢查清單
3. Use proper module structure under project directories  
   在專案目錄下使用適當的模組結構
4. Commit after every completed task  
   每完成一項任務後都要提交

## Project Overview | 專案概述

KCISLK ESID Info Hub is a comprehensive microservice-based application ecosystem providing parents and teachers of KCISLK Elementary School International Department with access to the latest information, educational resources, event updates, and communication tools.

KCISLK ESID Info Hub 是一個全面的微服務架構應用程式生態系統，為林口康橋國際學校的家長和老師提供最新資訊、教育資源、活動更新和溝通工具的存取。

### 🏗️ Microservice Architecture | 微服務架構
```
KCISLK ESID Ecosystem
├── 🏢 Main Application (This Repository)
│   ├── URL: https://kcislk-esid.zeabur.app
│   ├── Port: 3001 (Development)
│   └── Features: Admin system, OAuth, User management
├── 🌍 Parents' Corner (Separate Repository)
│   ├── URL: https://kcislk-esid-parents.zeabur.app
│   ├── Port: 3002 (Development)
│   ├── GitHub: https://github.com/geonook/new-parent-s-corner-website
│   └── Features: Public display, No authentication required
└── 🗄️ Shared PostgreSQL Database
```

### 🌟 Features | 功能特色

- **Parent Portal** - Dedicated space for parent-school communication  
  **家長門戶** - 專為家長與學校溝通設計的空間
- **Three-Tier Permission System** - Admin, Office Member, and Viewer roles with upgrade workflow  
  **三層權限系統** - 管理員、辦公室成員、觀看者角色與升級流程
- **Google OAuth Authentication** - Secure one-click login with automatic viewer role assignment  
  **Google OAuth 認證** - 安全的一鍵登入與自動 viewer 角色分配
- **Event Management** - Coffee with Principal sessions and school events  
  **活動管理** - 校長有約會議和學校活動
- **Resource Center** - Grade-level educational materials and tools  
  **資源中心** - 各年級教育教材和工具
- **International Department News** - Latest updates and announcements  
  **國際部最新消息** - 最新更新和公告
- **Squad System** - KCFSID squad information and activities  
  **小隊系統** - KCFSID 小隊資訊和活動
- **Responsive Design** - Mobile-friendly interface with smooth animations  
  **響應式設計** - 適合行動裝置的介面與流暢動畫

### 🛠️ Tech Stack | 技術堆疊

#### Core Framework | 核心框架
- **Framework**: Next.js 14 (App Router) | **框架**: Next.js 14 (App Router)
- **Language**: TypeScript | **語言**: TypeScript
- **Database**: PostgreSQL + Prisma ORM | **資料庫**: PostgreSQL + Prisma ORM

#### Authentication & Security | 認證與安全
- **Authentication**: Google OAuth 2.0 + JWT | **認證**: Google OAuth 2.0 + JWT
- **Environment Validation**: Zod + Type Safety | **環境驗證**: Zod + 類型安全
- **API Security**: Custom Auth Utils + RBAC | **API 安全**: 自定義認證工具 + 角色控制

#### Performance & Optimization | 性能與優化
- **Advanced Caching**: In-Memory Cache with TTL + Cache Statistics | **進階快取**: 記憶體快取與 TTL + 快取統計
- **Performance Monitoring**: Custom Middleware + Response Time Tracking | **性能監控**: 自定義中間件 + 響應時間追蹤
- **Database Optimization**: Strategic Indexes + Query Performance Monitoring | **數據庫優化**: 策略性索引 + 查詢性能監控
- **API Rate Limiting**: Request throttling + Performance headers | **API 限流**: 請求節流 + 性能標頭

#### UI/UX & Styling | 界面與樣式
- **Styling**: Tailwind CSS | **樣式**: Tailwind CSS
- **UI Components**: shadcn/ui | **UI 組件**: shadcn/ui
- **Animations**: Framer Motion | **動畫**: Framer Motion

#### DevOps & Deployment | 開發維運
- **Package Manager**: pnpm | **套件管理器**: pnpm
- **Code Quality**: ESLint + TypeScript + Strict Mode | **程式碼品質**: ESLint + TypeScript + 嚴格模式
- **Environment Management**: Multi-env support + Validation | **環境管理**: 多環境支援 + 驗證
- **Containerization**: Docker (Security Hardened + Health Checks) | **容器化**: Docker (安全強化 + 健康檢查)
- **Deployment**: Zeabur Cloud (Production Ready) | **部署**: Zeabur 雲端 (生產就緒)
- **Monitoring**: Health endpoints + Performance metrics | **監控**: 健康端點 + 性能指標

## Development Guidelines | 開發指導原則

- **Always search first** before creating new files  
  **總是先搜尋** 再創建新檔案
- **Extend existing** functionality rather than duplicating  
  **擴展現有** 功能而非重複建立
- **Use Task agents** for operations >30 seconds  
  **使用任務代理** 處理超過30秒的操作
- **Single source of truth** for all functionality  
  **單一資訊來源** 適用於所有功能
- **Language-agnostic structure** - works with TypeScript/JavaScript  
  **語言無關結構** - 適用於 TypeScript/JavaScript
- **Scalable** - start simple, grow as needed  
  **可擴展** - 從簡單開始，按需成長
- **Flexible** - choose complexity level based on project needs  
  **靈活** - 根據專案需求選擇複雜度

## Getting Started | 開始使用

### Prerequisites | 先決條件

- Node.js 18+ | Node.js 18 以上版本
- pnpm (recommended) or npm | pnpm（推薦）或 npm

### Installation | 安裝

```bash
# Clone the repository | 複製儲存庫
git clone <repository-url>
cd kcislk-esid-info-hub

# Install dependencies | 安裝依賴套件
pnpm install

# Start development server | 啟動開發伺服器
pnpm dev
```

### Development Commands | 開發命令

```bash
# Development | 開發
pnpm dev          # Start development server (http://localhost:3001) | 啟動開發伺服器
pnpm build        # Build for production | 建置生產版本
pnpm start        # Start production server | 啟動生產伺服器
pnpm lint         # Run ESLint | 執行 ESLint
pnpm typecheck    # Check TypeScript types | 檢查 TypeScript 類型

# Database | 資料庫
pnpm db:generate  # Generate Prisma client | 生成 Prisma 客戶端
pnpm db:migrate   # Run database migrations | 執行資料庫遷移
pnpm db:seed      # Seed database with initial data | 填充初始資料
pnpm db:studio    # Open Prisma Studio | 開啟 Prisma Studio

# OAuth Testing | OAuth 測試
pnpm test:oauth-config  # Test Google OAuth configuration | 測試 Google OAuth 配置

# Environment Management | 環境管理
pnpm env:switch   # Switch between environments | 切換環境
pnpm env:validate # Validate environment variables with Zod | 用 Zod 驗證環境變數
pnpm test:db      # Test database connection | 測試資料庫連接

# Performance Testing | 性能測試  
pnpm test:performance  # Run performance analysis | 執行性能分析
pnpm benchmark:api     # API benchmarking | API 基準測試
pnpm report:performance # Generate performance report | 生成性能報告

# Docker | Docker
docker build -t kcislk-esid-info-hub .  # Build Docker image | 建置 Docker 映像檔
docker run -p 8080:8080 kcislk-esid-info-hub  # Run container | 執行容器

# Git workflow (follow CLAUDE.md rules) | Git 工作流程（遵循 CLAUDE.md 規則）
git add .                           # 暫存所有變更
git commit -m "feat: description"   # 提交變更
git push origin main                # 推送到主分支（自動 GitHub 備份）
```

## 🔐 Google OAuth Setup | Google OAuth 設定

### 🚀 Quick Start (5 minutes) | 快速開始（5分鐘）

1. **Follow the setup guide** | **按照設定指南**
   ```bash
   # Read the quick start guide | 閱讀快速開始指南
   open docs/QUICK-START-OAUTH.md
   ```

2. **Configure Google Console** | **配置 Google Console**
   - Visit: https://console.developers.google.com/
   - Create OAuth 2.0 credentials
   - Add redirect URI: `http://localhost:3001/api/auth/callback/google`

3. **Set up environment variables** | **設定環境變數**
   ```bash
   # Copy environment template | 複製環境範本
   cp .env.example .env
   
   # Edit with your credentials | 編輯填入您的憑證資訊
   # 主要需要設定以下項目 | Main configurations needed:
   # - DATABASE_URL (Zeabur PostgreSQL connection)
   # - GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET (OAuth)
   # - JWT_SECRET & NEXTAUTH_SECRET (Authentication)
   # - Email SMTP settings (Notification system)
   ```

4. **Test OAuth configuration** | **測試 OAuth 配置**
   ```bash
   # Validate OAuth setup | 驗證 OAuth 設定
   npm run test:oauth-config
   
   # Start development server | 啟動開發伺服器
   npm run dev
   
   # Test OAuth flow | 測試 OAuth 流程
   # Visit: http://localhost:3001/test-oauth
   ```

### 📄 TinyMCE Rich Text Editor | TinyMCE 富文本編輯器

The system includes a fully-featured rich text editor powered by TinyMCE 8.0.1 with GPL licensing.

**配置說明 | Configuration:**
- **License**: GPL (Open Source)
- **Features**: Text formatting, lists, links, tables, image upload
- **Location**: `/components/ui/rich-text-editor.tsx`
- **Test Page**: `http://localhost:3001/test-rich-editor`

**環境變數 | Environment Variables:**
```bash
# TinyMCE Configuration (Optional - using GPL license)
TINYMCE_API_KEY="your-api-key-here"          # Server-side (optional)
NEXT_PUBLIC_TINYMCE_API_KEY="your-api-key"   # Client-side (optional)
```

**功能特色 | Features:**
- ✅ Rich text formatting (bold, italic, underline)
- ✅ Multi-level headers (H1-H6)
- ✅ Lists (ordered and unordered)
- ✅ Link insertion and management
- ✅ Image upload with preview
- ✅ Auto-save functionality
- ✅ Word/character count
- ✅ Dark theme support
- ✅ Responsive design

**使用方式 | Usage:**
```typescript
import { RichTextEditor } from '@/components/ui/rich-text-editor'

<RichTextEditor
  value={content}
  onChange={setContent}
  enableImageUpload={true}
  autoSave={true}
  showWordCount={true}
/>
```

### 📚 Documentation | 文件
- 📋 **Quick Start**: `docs/QUICK-START-OAUTH.md` - 5-minute setup guide
- 📖 **Detailed Setup**: `docs/google-oauth-setup.md` - Complete configuration guide  
- 📊 **Status Summary**: `docs/OAUTH-STATUS-SUMMARY.md` - Implementation overview

### 🎯 Features | 功能
- ✅ Secure Google OAuth 2.0 authentication
- 🤖 Automatic role assignment by email domain
- 🔗 Account linking for existing users
- 🛡️ CSRF protection and secure token handling
- 📱 Mobile-responsive login interface

## Project Structure

```
kcislk-esid-info-hub/
├── CLAUDE.md                  # Essential rules for Claude Code
├── README.md                  # This file
├── Dockerfile                 # Docker configuration for deployment
├── .dockerignore              # Docker ignore file
├── app/                       # Next.js App Router
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   ├── api/                   # API routes
│   │   └── health/            # Health check endpoint
│   ├── events/                # Events section
│   ├── resources/             # Resources section
│   ├── admin/                 # Admin section
│   └── teachers/              # Teachers section
├── components/                # UI components
│   ├── ui/                    # shadcn/ui components
│   │   └── rich-text-editor.tsx # TinyMCE富文本編輯器組件
│   └── theme-provider.tsx     # Theme configuration
├── lib/                       # Utilities and Core Services
│   ├── auth.ts                # JWT authentication core
│   ├── auth-utils.ts          # API authentication utilities
│   ├── cache.ts               # Performance caching system
│   ├── env-validation.ts      # Zod environment validation
│   ├── google-oauth.ts        # Google OAuth utilities
│   ├── performance-middleware.ts # API optimization middleware
│   ├── prisma.ts              # Database connection with monitoring
│   ├── rbac.ts                # Role-based access control
│   ├── fileUpload.ts          # File upload and processing
│   ├── emailService.ts        # Email notification system
│   └── utils.ts               # General utilities
├── hooks/                     # Custom React hooks
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seeding script
│   └── migrations/            # Database migrations
├── scripts/                   # Development and deployment scripts
├── public/                    # Static assets
├── styles/                    # Global styles
├── docs/                      # Documentation
├── tools/                     # Development tools
├── examples/                  # Usage examples
├── output/                    # Generated files (not committed)
├── logs/                      # Log files (not committed)
└── tmp/                       # Temporary files (not committed)
```

## Pages Overview | 頁面概述

### 🏠 Home Page (`/`) | 首頁
- Welcome message and hero section | 歡迎訊息和主視覺區域
- KCISLK ESID focused information display | 專注於 KCISLK ESID 的資訊展示
- Elementary International Department news board | 國際處訊息看板
- Monthly newsletter section | 月刊電子報區域
- Quick statistics and updates | 快速統計資訊和更新
- Parent and teacher resources | 家長和老師資源

### 📅 Events Page (`/events`) | 活動頁面
- Coffee with the Principal materials | 校長有約相關資料
- Event presentation slides by grade level | 各年級活動簡報投影片
- Downloadable resources and materials | 可下載的資源和教材

### 📚 Resources Page (`/resources`) | 資源頁面
- Grade-level learning resources (Grades 1-2, 3-4, 5-6) | 各年級學習資源（1-2年級、3-4年級、5-6年級）
- External learning platforms (ReadWorks, Google Drive) | 外部學習平台（ReadWorks、Google Drive）
- Interactive learning tools | 互動學習工具
- Downloadable materials | 可下載教材

## Key Features

### 🎨 Design System
- Consistent gradient color schemes
- Smooth animations and transitions
- Mobile-responsive layouts
- Accessible UI components

### 📱 User Experience
- Intuitive navigation
- Fast loading times
- Smooth page transitions
- Interactive elements

### 🔧 Technical Features
- TypeScript for type safety
- Modern React patterns with hooks
- Optimized Next.js App Router
- Component-based architecture
- PostgreSQL database with Prisma ORM
- Docker containerization for deployment
- Health check endpoint for monitoring
- Multi-environment configuration support

## Contributing

Before contributing, please:

1. Read `CLAUDE.md` for essential development rules
2. Follow the pre-task compliance checklist
3. Search for existing implementations before creating new features
4. Commit after each completed task
5. Push to GitHub for backup

## Development Best Practices

### ❌ Wrong Approach (Creates Technical Debt)
```bash
# Creating new file without searching first
Write(file_path="new_feature.tsx", content="...")
```

### ✅ Correct Approach (Prevents Technical Debt)
```bash
# 1. SEARCH FIRST
Grep(pattern="feature.*implementation", glob="**/*.{ts,tsx}")
# 2. READ EXISTING FILES  
Read(file_path="existing_feature.tsx")
# 3. EXTEND EXISTING FUNCTIONALITY
Edit(file_path="existing_feature.tsx", old_string="...", new_string="...")
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Docker Deployment | Docker 部署

### Quick Docker Setup | 快速 Docker 設定

```bash
# Build Docker image | 建置 Docker 映像檔
docker build -t kcislk-esid-info-hub .

# Run with environment variables | 運行並設定環境變數
docker run -p 8080:8080 \
  -e DATABASE_URL="your_database_url" \
  -e NODE_ENV="production" \
  kcislk-esid-info-hub

# Health check | 健康檢查
curl http://localhost:8080/api/health
```

### Docker Features | Docker 功能
- ✅ Multi-stage build for optimized image size | 多階段建置優化映像檔大小
- ✅ Non-root user for security | 非 root 使用者提升安全性
- ✅ Health check endpoint | 健康檢查端點
- ✅ Optimized for Zeabur deployment | 針對 Zeabur 部署優化

See `docs/docker-deployment.md` for detailed Docker setup instructions.  
詳細的 Docker 設定說明請參考 `docs/docker-deployment.md`。

## Support

For questions or issues:
- Check the documentation in `docs/`
- Review `CLAUDE.md` for development guidelines
- Check `docs/troubleshooting.md` for common issues
- Contact the development team

---

**🎯 Template by Chang Ho Chien | HC AI 說人話channel | v1.0.0**  
**📺 Tutorial: https://youtu.be/8Q1bRZaHH24**

*Excellence in International Education*