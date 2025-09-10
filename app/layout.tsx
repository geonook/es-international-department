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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover'
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' }
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KCISLK ESID Info Hub'
  }
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
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Responsive meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for common external resources */}
        <link rel="dns-prefetch" href="https://api.vercel.com" />
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {/* Prevent flash of unstyled content */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Set initial theme based on system preference
                if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                  document.documentElement.style.scrollBehavior = 'auto';
                }
              })()
            `,
          }}
        />
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  )
}
