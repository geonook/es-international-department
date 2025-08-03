/**
 * Admin Resources Management Page - ES International Department
 * 管理員資源管理頁面 - ES 國際部
 */

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'
import ResourceManager from '@/components/admin/ResourceManager'

export default function AdminResourcesPage() {
  const { user, isLoading, isAuthenticated, isAdmin, redirectToLogin } = useAuth()

  // Check authentication and permissions
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin())) {
      redirectToLogin('/admin/resources')
    }
  }, [isLoading, isAuthenticated, isAdmin, redirectToLogin])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">載入中...</p>
        </motion.div>
      </div>
    )
  }

  // Unauthorized access
  if (!isAuthenticated || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">驗證權限中，正在重導向...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
              <CardTitle className="text-2xl font-bold">
                資源管理系統
              </CardTitle>
              <p className="text-purple-100 mt-2">
                管理教育資源、檔案上傳和分類系統
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <ResourceManager />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}