# KCISLK Parents' Corner
# KCISLK 家長專區

An independent portal for parents of KCISLK Elementary School International Department.  
林口康橋國際學校小學國際部家長專區獨立入口網站。

## 🌟 Features | 功能特色

- **Announcements** | 公告系統 - Important school announcements and updates
- **ESID News** | ESID 新聞 - Latest news from the International Department  
- **Newsletters** | 電子報 - Monthly newsletters and communications
- **Squad Information** | 班級資訊 - Class-specific information and updates
- **Event Calendar** | 活動行事曆 - School events and important dates
- **Resources** | 資源中心 - Educational resources and documents
- **Contact Information** | 聯絡資訊 - Easy access to school contacts

## 🚀 Deployment | 部署

### Local Development | 本地開發

```bash
# Install dependencies | 安裝依賴
npm install

# Run development server | 執行開發伺服器
npm run dev

# Open browser | 開啟瀏覽器
# http://localhost:3002
```

### Zeabur Deployment | Zeabur 部署

This project is designed to be deployed as an independent service on Zeabur.

#### Step 1: Connect GitHub Repository | 連接 GitHub 儲存庫
1. Push the `parents-corner` folder to a new GitHub repository
2. In Zeabur, create a new service
3. Connect to your GitHub repository

#### Step 2: Configure Service | 設定服務
1. Service Name: `parents-corner`
2. Build Command: `npm run build`
3. Start Command: `npm run start`
4. Port: `3002`

#### Step 3: Environment Variables | 環境變數
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://parents-corner.zeabur.app
NEXT_PUBLIC_CONTACT_EMAIL=director@kcislk.ntpc.edu.tw
```

#### Step 4: Deploy | 部署
1. Click Deploy
2. Wait for build to complete
3. Access at: `https://parents-corner.zeabur.app`

### Production Build | 生產建置

```bash
# Build for production | 建置生產版本
npm run build

# Start production server | 啟動生產伺服器
npm run start
```

## 🏗️ Project Structure | 專案結構

```
parents-corner/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (Parents' Corner)
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/               # UI components
├── lib/                   # Utility functions
├── public/               # Static assets
├── package.json          # Dependencies
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🔧 Configuration | 配置

### Port Configuration | 埠號配置
Default port is `3002` to avoid conflicts with main application.  
預設埠號為 `3002` 以避免與主應用程式衝突。

### Custom Domain | 自訂網域
To use a custom domain like `parents.kcislk.ntpc.edu.tw`:
1. Add domain in Zeabur dashboard
2. Configure DNS CNAME record
3. Update `NEXT_PUBLIC_APP_URL` environment variable

## 🎨 Customization | 自訂

### Theme Colors | 主題顏色
The Parents' Corner uses a purple/pink color scheme. To modify:
- Edit color values in `app/globals.css`
- Update gradient colors in `app/page.tsx`

### Content | 內容
All content is currently static/mock data. To make it dynamic:
1. Set up a backend API or CMS
2. Replace mock data with API calls
3. Add authentication if needed

## 📱 Mobile Support | 行動裝置支援

Fully responsive design with:
- Mobile navigation menu
- Touch-friendly interfaces
- Optimized for all screen sizes

## 🔒 Security | 安全性

This is a public portal without authentication. If you need to add protected sections:
1. Implement authentication system
2. Add route protection
3. Configure user roles

## 📄 License | 授權

© 2025 KCISLK Elementary School International Department. All rights reserved.

---

**Developed for KCISLK ESID**  
**為 KCISLK ESID 開發**