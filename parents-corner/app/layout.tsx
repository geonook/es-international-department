import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  preload: true
})

export const metadata: Metadata = {
  title: "KCISLK Parents' Corner",
  description: "KCISLK Elementary School International Department Parents' Corner - Access announcements, ESID news, newsletters, and parent resources.",
  icons: {
    icon: '/favicon.ico',
  },
}

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