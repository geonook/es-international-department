# KCISLK ESID Info Hub | KCISLK 小學國際處資訊中心
**Information Service Website for KCISLK Elementary School International Department | 康橋國際學校小學國際處資訊服務網站**

> **📊 項目狀態**: 73.7% 完成 | **🚀 API 健康度**: 28/38 端點正常運作  
> **⚡ 最後更新**: 2025-01-31 | **🎯 下一里程碑**: 通知系統完善

## 🎉 最新成果 | Latest Achievements

### ✅ 已完成的核心功能
- **🔐 認證系統**: Google OAuth 2.0 + JWT 完全實作 (100%)
- **📝 內容管理**: 公告、活動、資源管理系統 (95%)
- **👥 用戶管理**: 角色權限控制、使用者介面 (100%)
- **📁 檔案系統**: 安全檔案上傳、處理、服務 (100%)
- **🎨 UI/UX**: shadcn/ui 組件、Framer Motion 動畫 (100%)
- **⚙️ 基礎架構**: Next.js 14、TypeScript、Prisma (100%)

### 🔧 近期修復
- **Events API**: 從 20% 提升至 80% 成功率 (+300% 改善)
- **Notifications API**: 從 0% 提升至 83% 成功率 (全面修復)
- **認證問題**: 修復所有 `verifyAuth` 函式引用錯誤
- **API 整體健康度**: 從 71.1% 提升至 73.7%

### 🎯 剩餘任務 | Remaining Tasks

#### 🔴 高優先級 (影響核心功能)
- **Google OAuth 實際配置**: 需要 Google Console 憑證設定
- **通知系統 API 修復**: 5個端點需要認證函式更新
- **公告排序邏輯**: 優先級排序邏輯優化

#### 🟡 中優先級 (功能增強)  
- **Email 通知服務**: Nodemailer/SendGrid 整合
- **即時推送**: Server-Sent Events 實作
- **用戶偏好存儲**: 資料庫架構擴展

#### 🟢 低優先級 (系統優化)
- **效能優化**: API 回應時間改善
- **監控設置**: 生產環境監控配置
- **部署配置**: 最終生產環境準備

> **預計完成時間**: 5-8 小時可達 95%+ 完成度

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

KCISLK ESID Info Hub is a comprehensive Next.js application providing parents and teachers of KCISLK Elementary School International Department with access to the latest information, educational resources, event updates, and communication tools.

KCISLK 小學國際處資訊中心是一個全面的 Next.js 應用程式，為康橋國際學校小學國際處的家長和老師提供最新資訊、教育資源、活動更新和溝通工具的存取。

### 🌟 Features | 功能特色

- **Parent Portal** - Dedicated space for parent-school communication  
  **家長門戶** - 專為家長與學校溝通設計的空間
- **Google OAuth Authentication** - Secure one-click login with automatic role assignment  
  **Google OAuth 認證** - 安全的一鍵登入與自動角色分配
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

- **Framework**: Next.js 14 (App Router) | **框架**: Next.js 14 (App Router)
- **Language**: TypeScript | **語言**: TypeScript
- **Database**: PostgreSQL + Prisma ORM | **資料庫**: PostgreSQL + Prisma ORM
- **Authentication**: Google OAuth 2.0 + JWT | **認證**: Google OAuth 2.0 + JWT
- **Styling**: Tailwind CSS | **樣式**: Tailwind CSS
- **UI Components**: shadcn/ui | **UI 組件**: shadcn/ui
- **Animations**: Framer Motion | **動畫**: Framer Motion  
- **Package Manager**: pnpm | **套件管理器**: pnpm
- **Code Quality**: ESLint + TypeScript | **程式碼品質**: ESLint + TypeScript
- **Deployment**: Docker + Zeabur | **部署**: Docker + Zeabur

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
pnpm dev          # Start development server (http://localhost:3000) | 啟動開發伺服器
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
pnpm test:db      # Test database connection | 測試資料庫連接

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
   - Add redirect URI: `http://localhost:3000/api/auth/callback/google`

3. **Set up environment variables** | **設定環境變數**
   ```bash
   # Copy environment template | 複製環境範本
   cp .env.local.example .env.local
   
   # Edit with your Google OAuth credentials | 編輯填入您的 Google OAuth 憑證
   # GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   # GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

4. **Test OAuth configuration** | **測試 OAuth 配置**
   ```bash
   # Validate OAuth setup | 驗證 OAuth 設定
   npm run test:oauth-config
   
   # Start development server | 啟動開發伺服器
   npm run dev
   
   # Test OAuth flow | 測試 OAuth 流程
   # Visit: http://localhost:3000/test-oauth
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
│   └── theme-provider.tsx     # Theme configuration
├── lib/                       # Utilities
│   └── prisma.ts              # Database connection
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
- KCISLK ESID focused information display | 專注於 KCISLK 小學國際處的資訊展示
- Elementary International Department news board | 小學國際處訊息看板
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