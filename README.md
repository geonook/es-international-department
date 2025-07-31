# ES International Department | ES 國際部
**Parent Portal & Resource Center | 家長門戶網站與資源中心**

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

The ES International Department parent portal and resource center is a comprehensive Next.js application providing parents, teachers, and students with access to educational resources, event information, and communication tools.

ES 國際部家長門戶網站和資源中心是一個全面的 Next.js 應用程式，為家長、教師和學生提供教育資源、活動資訊和溝通工具的存取。

### 🌟 Features | 功能特色

- **Parent Portal** - Dedicated space for parent-school communication  
  **家長門戶** - 專為家長與學校溝通設計的空間
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
- **Styling**: Tailwind CSS | **樣式**: Tailwind CSS
- **UI Components**: shadcn/ui | **UI 組件**: shadcn/ui
- **Animations**: Framer Motion | **動畫**: Framer Motion  
- **Package Manager**: pnpm | **套件管理器**: pnpm

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
cd es-international-department

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

# Git workflow (follow CLAUDE.md rules) | Git 工作流程（遵循 CLAUDE.md 規則）
git add .                           # 暫存所有變更
git commit -m "feat: description"   # 提交變更
git push origin main                # 推送到主分支
```

## Project Structure

```
es-international-department/
├── CLAUDE.md                  # Essential rules for Claude Code
├── README.md                  # This file
├── app/                       # Next.js App Router
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   ├── events/                # Events section
│   ├── resources/             # Resources section
│   ├── admin/                 # Admin section
│   └── teachers/              # Teachers section
├── components/                # UI components
│   ├── ui/                    # shadcn/ui components
│   └── theme-provider.tsx     # Theme configuration
├── lib/                       # Utilities
├── hooks/                     # Custom React hooks
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
- Parent-focused quote and imagery | 以家長為焦點的標語和圖像
- International Department news board | 國際部訊息看板
- Monthly newsletter section | 月刊電子報區域
- Quick statistics | 快速統計資訊
- KCFSID squad information | KCFSID 小隊資訊

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

## Support

For questions or issues:
- Check the documentation in `docs/`
- Review `CLAUDE.md` for development guidelines
- Contact the development team

---

**🎯 Template by Chang Ho Chien | HC AI 說人話channel | v1.0.0**  
**📺 Tutorial: https://youtu.be/8Q1bRZaHH24**

*Excellence in International Education*