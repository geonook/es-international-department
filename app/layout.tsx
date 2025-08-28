import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

// Google Fonts configuration - Inter font
const inter = Inter({ 
  subsets: ["latin"],
  display: "swap", // Optimize font loading to prevent layout shifts
  preload: true // Ensure proper preloading
})

// Website metadata configuration
export const metadata: Metadata = {
  title: "KCISLK ESID Info Hub",
  description:
    "KCISLK Elementary School International Department Information Hub - Providing parents and teachers with the latest educational resources, event updates, and communication tools.",
  generator: 'v0.dev',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/placeholder-logo.png',
  },
}

/**
 * Root Layout Component - Main layout for Next.js application
 * 
 * @description Defines the basic HTML structure and global styles for the application
 * @param children React children components
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
