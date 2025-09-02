"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, ArrowRight } from "lucide-react"
import Link from "next/link"

// This page redirects to the new unified communications page

export default function TeacherMessagesPage() {
  const router = useRouter()

  // Auto-redirect to the new unified communications page
  useEffect(() => {
    // Redirect after a short delay to show the notice
    const timer = setTimeout(() => {
      router.replace('/teachers/communications')
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [router])

  // Show redirect notice

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Moved</h1>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Messages → Communications Hub</h2>
          <p className="text-gray-600 mb-6">
            The Messages page has been consolidated into our new unified Communications Hub. 
            You'll be automatically redirected in a few seconds.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/teachers/communications">
              <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-all duration-200">
                Go to Communications Hub
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
            <Link href="/teachers">
              <div className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-all duration-200">
                Back to Teachers Home
              </div>
            </Link>
          </div>
          <div className="mt-6 text-xs text-gray-500">
            <p>✨ New features include:</p>
            <ul className="mt-2 space-y-1">
              <li>• Unified communications (messages, announcements, reminders)</li>
              <li>• Enhanced search and filtering</li>
              <li>• Rich text editing and better organization</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}