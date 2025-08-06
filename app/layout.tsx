import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

// Google 字型配置 - Inter 字體 | Google Fonts configuration - Inter font
const inter = Inter({ subsets: ["latin"] })

// 網站中繼資料配置 | Website metadata configuration
export const metadata: Metadata = {
  title: "KCISLK ESID Info Hub",
  description:
    "KCISLK Elementary School International Department Information Hub - Providing parents and teachers with the latest educational resources, event updates, and communication tools.",
    generator: 'v0.dev'
}

/**
 * 根佈局組件 - Next.js 應用程式的主要佈局
 * Root Layout Component - Main layout for Next.js application
 * 
 * @description 定義應用程式的基本 HTML 結構和全域樣式
 * @param children 子組件內容
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
