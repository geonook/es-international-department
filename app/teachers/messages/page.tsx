"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// This page immediately redirects to the Teachers' Message Board (communications page)

export default function TeacherMessagesPage() {
  const router = useRouter()

  // Immediate redirect to the Teachers' Message Board
  useEffect(() => {
    router.replace('/teachers/communications')
  }, [router])

  // Return minimal loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Teachers' Message Board...</p>
      </div>
    </div>
  )
}