# ES International Department

## Quick Start

1. **Read CLAUDE.md first** - Contains essential rules for Claude Code
2. Follow the pre-task compliance checklist before starting any work
3. Use proper module structure under project directories
4. Commit after every completed task

## Project Overview

The ES International Department parent portal and resource center is a comprehensive Next.js application providing parents, teachers, and students with access to educational resources, event information, and communication tools.

### 🌟 Features

- **Parent Portal** - Dedicated space for parent-school communication
- **Event Management** - Coffee with Principal sessions and school events
- **Resource Center** - Grade-level educational materials and tools
- **International Department News** - Latest updates and announcements
- **Squad System** - KCFSID squad information and activities
- **Responsive Design** - Mobile-friendly interface with smooth animations

### 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Package Manager**: pnpm

## Development Guidelines

- **Always search first** before creating new files
- **Extend existing** functionality rather than duplicating  
- **Use Task agents** for operations >30 seconds
- **Single source of truth** for all functionality
- **Language-agnostic structure** - works with TypeScript/JavaScript
- **Scalable** - start simple, grow as needed
- **Flexible** - choose complexity level based on project needs

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd es-international-department

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Development Commands

```bash
# Development
pnpm dev          # Start development server (http://localhost:3000)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Git workflow (follow CLAUDE.md rules)
git add .
git commit -m "feat: description"
git push origin main
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

## Pages Overview

### 🏠 Home Page (`/`)
- Welcome message and hero section
- Parent-focused quote and imagery
- International Department news board
- Monthly newsletter section
- Quick statistics
- KCFSID squad information

### 📅 Events Page (`/events`)
- Coffee with the Principal materials
- Event presentation slides by grade level
- Downloadable resources and materials

### 📚 Resources Page (`/resources`)
- Grade-level learning resources (Grades 1-2, 3-4, 5-6)
- External learning platforms (ReadWorks, Google Drive)
- Interactive learning tools
- Downloadable materials

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