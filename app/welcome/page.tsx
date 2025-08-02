/**
 * Welcome Page for New OAuth Users
 * 新 OAuth 用戶歡迎頁面
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Users, BookOpen, Calendar, MessageSquare, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function WelcomePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [showFeatures, setShowFeatures] = useState(false)

  useEffect(() => {
    // 延遲顯示功能介紹
    const timer = setTimeout(() => setShowFeatures(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleGetStarted = () => {
    // 根據用戶角色重定向到適當的儀表板
    if (user?.roles.includes('admin')) {
      router.push('/admin')
    } else if (user?.roles.includes('teacher')) {
      router.push('/teachers')
    } else {
      router.push('/')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: '學習資源',
      description: '存取豐富的教育資源和學習材料'
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: '活動資訊',
      description: '掌握最新的學校活動和重要日程'
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: '即時通知',
      description: '接收學校公告和重要消息通知'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: '社群互動',
      description: '與其他家長和教師保持聯繫'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        <Card className="text-center">
          <CardHeader className="pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle className="h-8 w-8 text-green-600" />
            </motion.div>
            
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              歡迎加入 ES 國際部！
            </CardTitle>
            
            <CardDescription className="text-lg text-gray-600">
              {user?.displayName && `${user.displayName}，`}您已成功註冊並登入系統
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* 用戶資訊 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-blue-50 rounded-lg p-4"
            >
              <div className="flex items-center justify-center space-x-4">
                {user?.avatar && (
                  <img
                    src={user.avatar}
                    alt="用戶頭像"
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{user?.displayName}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                  <p className="text-sm text-blue-600 capitalize">
                    身份：{user?.roles.join(', ')}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 功能介紹 */}
            {showFeatures && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  系統功能介紹
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-white rounded-lg border"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        {feature.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-medium text-gray-900">{feature.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 行動按鈕 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="pt-4"
            >
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="w-full sm:w-auto px-8 py-3 text-lg"
              >
                開始使用
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>

            {/* 額外資訊 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="text-sm text-gray-500 border-t pt-4"
            >
              <p>
                如有任何問題，請聯繫{' '}
                <a href="mailto:support@es-international.edu" className="text-blue-600 hover:underline">
                  系統管理員
                </a>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}