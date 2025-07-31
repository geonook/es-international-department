# Developer Guide | 開發者指南
*ES International Department - 開發者完整指南*

## 📋 Overview | 概述

This comprehensive developer guide provides everything you need to know to contribute effectively to the ES International Department project. Whether you're a new team member or an experienced developer, this guide will help you understand the codebase, development workflow, and best practices.

本開發者完整指南提供了為 ES 國際部專案有效貢獻所需的一切資訊。無論您是新團隊成員還是經驗豐富的開發者，本指南都將幫助您了解程式碼庫、開發工作流程和最佳實踐。

## 🚀 Quick Start | 快速開始

### Prerequisites | 先決條件

```bash
# Required Software | 必需軟體
Node.js 18+                    # JavaScript runtime
pnpm 8+                        # Package manager (recommended)
Git 2.30+                      # Version control
Docker 20.10+                  # Containerization (optional)
VS Code + Extensions           # Recommended IDE
```

### Development Environment Setup | 開發環境設定

```bash
# 1. Clone repository | 複製儲存庫
git clone <repository-url>
cd es-international-department

# 2. Install dependencies | 安裝依賴套件
pnpm install

# 3. Copy environment template | 複製環境變數範本
cp .env.example .env.local

# 4. Configure environment variables | 配置環境變數
# Edit .env.local with your database connection and secrets
DATABASE_URL="postgresql://user:password@localhost:5432/es_international_dev"
JWT_SECRET="your-jwt-secret-32-chars-minimum"
NEXTAUTH_SECRET="your-nextauth-secret-32-chars-minimum"
NEXTAUTH_URL="http://localhost:3000"

# 5. Setup database | 設定資料庫
pnpm db:generate              # Generate Prisma client
pnpm db:migrate               # Run database migrations
pnpm db:seed                  # Seed database with sample data

# 6. Start development server | 啟動開發伺服器
pnpm dev                      # http://localhost:3000

# 7. Verify setup | 驗證設定
curl http://localhost:3000/api/health
```

## 🏗️ Project Architecture | 專案架構

### Technology Stack | 技術堆疊

```yaml
Frontend Framework:     Next.js 14 (App Router)
Language:              TypeScript
Database:              PostgreSQL + Prisma ORM
Styling:               Tailwind CSS
UI Components:         shadcn/ui
Animations:            Framer Motion
Package Manager:       pnpm
Code Quality:          ESLint + TypeScript
Deployment:            Docker + Zeabur
Monitoring:            Health Check API
```

### Directory Structure | 目錄結構

```
es-international-department/
├── 📁 app/                    # Next.js App Router
│   ├── 📄 layout.tsx          # Root layout
│   ├── 📄 page.tsx            # Home page
│   ├── 📁 api/                # API routes
│   │   └── 📁 health/         # Health check endpoint
│   ├── 📁 events/             # Events pages
│   ├── 📁 resources/          # Resources pages
│   ├── 📁 admin/              # Admin pages
│   └── 📁 teachers/           # Teacher pages
├── 📁 components/             # React components
│   ├── 📁 ui/                 # shadcn/ui components
│   └── 📄 theme-provider.tsx  # Theme configuration
├── 📁 lib/                    # Utility functions
│   └── 📄 prisma.ts           # Database connection
├── 📁 hooks/                  # Custom React hooks
├── 📁 prisma/                 # Database schema and migrations
│   ├── 📄 schema.prisma       # Database schema
│   └── 📁 migrations/         # Database migrations
├── 📁 public/                 # Static assets
├── 📁 styles/                 # Global styles
├── 📁 docs/                   # Documentation
├── 📁 scripts/                # Build and deployment scripts
└── 📁 output/                 # Generated files (git ignored)
```

### Code Organization Principles | 程式碼組織原則

#### 1. Feature-Based Organization | 基於功能的組織
```typescript
// ✅ Good: Group by feature
app/
├── events/
│   ├── page.tsx              # Events listing page
│   ├── [id]/
│   │   └── page.tsx          # Event detail page
│   └── components/
│       ├── EventCard.tsx     # Event-specific components
│       └── EventFilter.tsx
```

#### 2. Component Hierarchy | 組件層次結構
```typescript
// ✅ Component organization
components/
├── ui/                       # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   └── input.tsx
├── layout/                   # Layout components
│   ├── Header.tsx
│   ├── Navigation.tsx
│   └── Footer.tsx
├── features/                 # Feature-specific components
│   ├── announcements/
│   ├── resources/
│   └── events/
└── shared/                   # Shared utility components
    ├── LoadingSpinner.tsx
    └── ErrorBoundary.tsx
```

#### 3. API Route Organization | API 路由組織
```typescript
// ✅ RESTful API structure
app/api/
├── health/                   # System health
│   └── route.ts
├── announcements/            # Announcements CRUD
│   ├── route.ts              # GET, POST
│   └── [id]/
│       └── route.ts          # GET, PUT, DELETE
├── resources/                # Resources CRUD
│   ├── route.ts
│   └── [id]/
│       └── route.ts
└── auth/                     # Authentication
    ├── login/
    └── logout/
```

## 🛠️ Development Workflow | 開發工作流程

### Git Workflow | Git 工作流程

#### Branch Strategy | 分支策略
```bash
main                          # Production branch (protected)
├── staging                   # Staging branch (auto-deploy)
│   ├── feature/user-auth     # Feature branches
│   ├── feature/announcements
│   └── bugfix/login-issue    # Bug fix branches
└── dev                       # Development branch (auto-deploy)
    ├── hotfix/security-patch # Hotfix branches
    └── enhancement/ui-improve
```

#### Daily Development Workflow | 日常開發工作流程
```bash
# 1. Start new feature | 開始新功能
git checkout dev
git pull origin dev
git checkout -b feature/announcement-system

# 2. Make changes and commit | 進行變更並提交
# ... development work ...
git add .
git commit -m "feat: add announcement CRUD operations

- Implement announcement management UI
- Add API endpoints for CRUD operations
- Include role-based permission control
- Add unit tests for announcement service

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 3. Push and create PR | 推送並建立 PR
git push origin feature/announcement-system
# Create Pull Request via GitHub UI

# 4. After review and merge | 審查並合併後
git checkout dev
git pull origin dev
git branch -d feature/announcement-system
```

### Code Standards | 程式碼標準

#### TypeScript Configuration | TypeScript 配置
```json
// tsconfig.json - Key configurations
{
  "compilerOptions": {
    "strict": true,                    // Enable all strict type checks
    "noUnusedLocals": true,           // Report unused local variables
    "noUnusedParameters": true,       // Report unused parameters
    "noImplicitReturns": true,        // Report missing return statements
    "noImplicitAny": false,           // Allow implicit any (for flexibility)
    "exactOptionalPropertyTypes": true // Strict optional property types
  }
}
```

#### ESLint Rules | ESLint 規則
```javascript
// .eslintrc.js - Key rules
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended'
  ],
  rules: {
    // Enforce consistent code style
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',              # Allow console in development
    
    // TypeScript specific
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn'  # Allow any with warning
  }
}
```

#### Naming Conventions | 命名規範
```typescript
// ✅ Component naming (PascalCase)
const AnnouncementCard = () => { ... }
const ResourceManager = () => { ... }

// ✅ Function naming (camelCase)
const fetchAnnouncements = async () => { ... }
const validateUserPermissions = () => { ... }

// ✅ Constants (SCREAMING_SNAKE_CASE)
const API_BASE_URL = 'https://api.example.com'
const MAX_FILE_SIZE = 10485760

// ✅ File naming
// Components: PascalCase.tsx
AnnouncementCard.tsx
ResourceManager.tsx

// Utilities: camelCase.ts
fetchAnnouncements.ts
validatePermissions.ts

// Pages: kebab-case or nested folders
app/coffee-with-principal/page.tsx
app/events/[id]/page.tsx
```

### Testing Strategy | 測試策略

#### Testing Philosophy | 測試理念
```typescript
// 1. Unit Tests - Test individual functions/components
// 2. Integration Tests - Test component interactions
// 3. E2E Tests - Test complete user workflows (planned)

// Example unit test structure
// __tests__/
// ├── components/
// │   ├── AnnouncementCard.test.tsx
// │   └── ResourceManager.test.tsx
// ├── lib/
// │   ├── prisma.test.ts
// │   └── validators.test.ts
// └── api/
//     ├── health.test.ts
//     └── announcements.test.ts
```

#### Testing Commands | 測試命令
```bash
# Run all tests | 執行所有測試
pnpm test

# Run tests in watch mode | 以監視模式執行測試
pnpm test:watch

# Run tests with coverage | 執行測試並產生覆蓋率報告
pnpm test:coverage

# Type checking | 型別檢查
pnpm typecheck

# Linting | 程式碼檢查
pnpm lint

# Fix linting issues | 修復程式碼檢查問題
pnpm lint:fix
```

## 🗄️ Database Development | 資料庫開發

### Prisma Workflow | Prisma 工作流程

#### Schema Development | 模式開發
```prisma
// prisma/schema.prisma - Example model
model Announcement {
  id            Int      @id @default(autoincrement())
  title         String
  content       String
  authorId      String
  targetAudience String  // 'teachers' | 'parents' | 'all'
  priority      String   @default("medium") // 'low' | 'medium' | 'high'
  status        String   @default("draft")  // 'draft' | 'published' | 'archived'
  publishedAt   DateTime?
  expiresAt     DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  author        User     @relation(fields: [authorId], references: [id])
  
  @@map("announcements")
}
```

#### Migration Workflow | 遷移工作流程
```bash
# 1. Modify schema | 修改模式
# Edit prisma/schema.prisma

# 2. Create migration | 建立遷移
pnpm db:migrate:dev --name add_announcement_model

# 3. Generate Prisma client | 生成 Prisma 客戶端
pnpm db:generate

# 4. Apply to other environments | 應用到其他環境
# Development (with seed data)
pnpm db:migrate:dev

# Staging/Production (no seed data)
pnpr db:migrate:deploy
```

#### Database Utilities | 資料庫工具
```bash
# Open Prisma Studio | 開啟 Prisma Studio
pnpm db:studio                # http://localhost:5555

# Reset database (development only) | 重置資料庫（僅開發環境）
pnpm db:migrate:reset

# Seed database | 填充資料庫
pnpm db:seed

# Validate schema | 驗證模式
pnpm db:validate

# Test database connection | 測試資料庫連接
pnpm test:db
```

### Database Best Practices | 資料庫最佳實踐

#### Query Optimization | 查詢優化
```typescript
// ✅ Good: Use select to limit fields
const announcements = await prisma.announcement.findMany({
  select: {
    id: true,
    title: true,
    summary: true,
    publishedAt: true,
    author: {
      select: {
        displayName: true
      }
    }
  },
  where: { status: 'published' },
  orderBy: { publishedAt: 'desc' },
  take: 10
})

// ✅ Good: Use include for related data
const announcementWithAuthor = await prisma.announcement.findUnique({
  where: { id },
  include: {
    author: {
      select: {
        displayName: true,
        email: true
      }
    }
  }
})

// ❌ Avoid: N+1 queries
// Don't do separate queries in loops
const announcements = await prisma.announcement.findMany()
for (const announcement of announcements) {
  const author = await prisma.user.findUnique({
    where: { id: announcement.authorId }
  })
}
```

#### Transaction Handling | 事務處理
```typescript
// ✅ Good: Use transactions for multiple operations
const createAnnouncementWithNotification = await prisma.$transaction(async (tx) => {
  // Create announcement
  const announcement = await tx.announcement.create({
    data: {
      title,
      content,
      authorId,
      targetAudience,
      status: 'published',
      publishedAt: new Date()
    }
  })
  
  // Create notifications for target audience
  const users = await tx.user.findMany({
    where: { role: targetAudience }
  })
  
  const notifications = users.map(user => ({
    recipientId: user.id,
    title: `New announcement: ${title}`,
    message: content.substring(0, 200),
    type: 'announcement',
    relatedId: announcement.id,
    relatedType: 'announcement'
  }))
  
  await tx.notification.createMany({
    data: notifications
  })
  
  return announcement
})
```

## 🎨 UI/UX Development | UI/UX 開發

### Design System | 設計系統

#### shadcn/ui Integration | shadcn/ui 整合
```typescript
// ✅ Using shadcn/ui components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const AnnouncementForm = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Announcement</CardTitle>
        <CardDescription>Share important information with the community</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Enter announcement title" />
          </div>
          <Button type="submit">Publish Announcement</Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

#### Tailwind CSS Conventions | Tailwind CSS 規範
```typescript
// ✅ Consistent spacing and colors
const AnnouncementCard = ({ announcement }) => {
  return (
    <div className={cn(
      // Base styles
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      // Spacing
      "p-6 space-y-4",
      // Hover effects
      "hover:shadow-md transition-shadow duration-200",
      // Conditional styles
      announcement.priority === 'high' && "border-red-200 bg-red-50"
    )}>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold leading-none tracking-tight">
          {announcement.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {announcement.summary}
        </p>
      </div>
    </div>
  )
}
```

#### Animation Guidelines | 動畫指導原則
```typescript
// ✅ Using Framer Motion for consistent animations
import { motion } from "framer-motion"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

const AnnouncementList = ({ announcements }) => {
  return (
    <div className="space-y-4">
      {announcements.map((announcement, index) => (
        <motion.div
          key={announcement.id}
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: index * 0.1 }}
        >
          <AnnouncementCard announcement={announcement} />
        </motion.div>
      ))}
    </div>
  )
}
```

### Responsive Design | 響應式設計

#### Breakpoint Strategy | 斷點策略
```typescript
// Tailwind CSS breakpoints
// sm: 640px   - Small devices (landscape phones)
// md: 768px   - Medium devices (tablets)
// lg: 1024px  - Large devices (laptops)
// xl: 1280px  - Extra large devices (desktops)
// 2xl: 1536px - Extra extra large devices

const ResponsiveLayout = () => {
  return (
    <div className={cn(
      // Mobile first approach
      "flex flex-col space-y-4 p-4",
      // Tablet and above
      "md:flex-row md:space-y-0 md:space-x-6 md:p-6",
      // Desktop
      "lg:max-w-6xl lg:mx-auto lg:p-8"
    )}>
      <main className="flex-1">
        {/* Main content */}
      </main>
      <aside className="w-full md:w-80">
        {/* Sidebar content */}
      </aside>
    </div>
  )
}
```

## 🚀 Performance Optimization | 效能優化

### Next.js Optimization | Next.js 優化

#### Image Optimization | 圖片優化
```typescript
import Image from 'next/image'

// ✅ Optimized image loading
const EventCard = ({ event }) => {
  return (
    <div className="relative">
      <Image
        src={event.imageUrl}
        alt={event.title}
        width={400}
        height={300}
        className="rounded-lg object-cover"
        priority={event.featured} // Load featured images first
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,..." // Small base64 placeholder
      />
    </div>
  )
}
```

#### Code Splitting | 程式碼分割
```typescript
// ✅ Dynamic imports for heavy components
import dynamic from 'next/dynamic'

// Lazy load heavy components
const DataVisualization = dynamic(
  () => import('@/components/DataVisualization'),
  { 
    loading: () => <div>Loading chart...</div>,
    ssr: false // Disable server-side rendering if needed
  }
)

// Lazy load admin components
const AdminDashboard = dynamic(
  () => import('@/components/admin/Dashboard'),
  { ssr: false }
)
```

#### Caching Strategy | 快取策略
```typescript
// ✅ API route caching
export async function GET() {
  const announcements = await prisma.announcement.findMany({
    where: { status: 'published' },
    select: {
      id: true,
      title: true,
      summary: true,
      publishedAt: true
    },
    orderBy: { publishedAt: 'desc' },
    take: 10
  })
  
  return NextResponse.json(announcements, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  })
}
```

### Database Performance | 資料庫效能

#### Index Strategy | 索引策略
```sql
-- Key indexes for performance
CREATE INDEX idx_announcements_status_published ON announcements(status, published_at DESC);
CREATE INDEX idx_resources_grade_category ON resources(grade_level_id, category_id);
CREATE INDEX idx_notifications_recipient_read ON notifications(recipient_id, is_read);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
```

## 🔧 Development Tools | 開發工具

### VS Code Configuration | VS Code 配置

#### Recommended Extensions | 推薦擴充功能
```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",      // Tailwind CSS IntelliSense
    "prisma.prisma",                   // Prisma syntax highlighting
    "ms-vscode.vscode-typescript-next", // Enhanced TypeScript support
    "esbenp.prettier-vscode",          // Code formatting
    "ms-vscode.vscode-eslint",         // ESLint integration
    "bradlc.vscode-tailwindcss",       // Tailwind CSS support
    "formulahendry.auto-rename-tag",   // Auto rename paired HTML tags
    "christian-kohler.path-intellisense", // Path autocomplete
    "ms-vscode.vscode-json"            // JSON support
  ]
}
```

#### Workspace Settings | 工作區設定
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "'([^']*)'"]
  ]
}
```

### Debug Configuration | 除錯配置

#### VS Code Debugger | VS Code 除錯器
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}",
      "env": {
        "NODE_OPTIONS": "--inspect"
      },
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

## 🐛 Troubleshooting | 故障排除

### Common Issues | 常見問題

#### Development Server Issues | 開發伺服器問題
```bash
# Issue: Port 3000 already in use
❌ Error: Port 3000 is already in use

# Solution: Find and kill process or use different port
lsof -ti:3000 | xargs kill -9
# or
pnpm dev -- --port 3001
```

#### Database Connection Issues | 資料庫連接問題
```bash
# Issue: Can't reach database server
❌ Error: P1001: Can't reach database server

# Solutions:
# 1. Check DATABASE_URL format
echo $DATABASE_URL

# 2. Test database connection
pnpm test:db

# 3. Reset Prisma client
pnpm db:generate

# 4. Check if database service is running
# For local PostgreSQL:
brew services list | grep postgresql
brew services start postgresql
```

#### Build Issues | 建置問題
```bash
# Issue: TypeScript errors during build
❌ Error: Type errors found

# Solutions:
# 1. Run type checking
pnpm typecheck

# 2. Fix type errors or temporarily skip (not recommended)
# Add to next.config.js:
typescript: {
  ignoreBuildErrors: true,
}

# 3. Clean and rebuild
rm -rf .next
pnpm build
```

#### ESLint/Prettier Conflicts | ESLint/Prettier 衝突
```bash
# Issue: ESLint and Prettier conflicts
❌ Error: Conflicting rules between ESLint and Prettier

# Solution: Install eslint-config-prettier
pnpm add -D eslint-config-prettier

# Add to .eslintrc.js:
extends: [
  'next/core-web-vitals',
  '@typescript-eslint/recommended',
  'prettier' // Must be last
]
```

## 📋 Development Checklists | 開發檢查清單

### Pre-Development Checklist | 開發前檢查清單

- [ ] ✅ Read `CLAUDE.md` for project rules and guidelines
- [ ] ✅ Environment variables configured in `.env.local`
- [ ] ✅ Database connection tested (`pnpm test:db`)
- [ ] ✅ Development server running (`pnpm dev`)
- [ ] ✅ VS Code extensions installed and configured
- [ ] ✅ Git branch created from latest `dev` branch

### Pre-Commit Checklist | 提交前檢查清單

- [ ] ✅ Code passes TypeScript type checking (`pnpm typecheck`)
- [ ] ✅ Code passes ESLint checks (`pnpm lint`)
- [ ] ✅ Tests are passing (`pnpm test`)
- [ ] ✅ Database migrations are up to date
- [ ] ✅ No console.log statements in production code
- [ ] ✅ Commit message follows conventional format

### Pre-PR Checklist | PR前檢查清單

- [ ] ✅ Feature is fully implemented and tested
- [ ] ✅ UI is responsive and accessible
- [ ] ✅ Documentation updated if needed
- [ ] ✅ No merge conflicts with target branch
- [ ] ✅ PR description explains changes clearly
- [ ] ✅ Screenshots provided for UI changes

## 🎯 Next Steps | 下一步

### For New Developers | 新開發者

1. **Complete the setup** - Follow the quick start guide
2. **Read the codebase** - Start with `app/page.tsx` and explore
3. **Pick a small task** - Start with bug fixes or minor enhancements
4. **Ask questions** - Don't hesitate to reach out to the team

### For Experienced Developers | 經驗豐富的開發者

1. **Review architecture** - Understand the overall system design
2. **Identify improvements** - Look for optimization opportunities
3. **Mentor newcomers** - Help onboard new team members
4. **Contribute to docs** - Keep documentation up to date

---

*This developer guide is a living document. Please contribute improvements and keep it updated as the project evolves.*

*此開發者指南是一份持續更新的文件。請協助改進並隨著專案發展保持更新。*