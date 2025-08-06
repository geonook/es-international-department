'use client'

/**
 * Notifications Page
 * 通知頁面
 * 
 * @description 完整的通知管理頁面，整合通知中心、設定和統計功能
 * @features 通知列表、偏好設定、統計概覽、實時更新
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Settings, 
  BarChart3, 
  ArrowLeft,
  Filter,
  CheckCheck,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import NotificationCenter from '@/components/NotificationCenter'
import NotificationSettings from '@/components/NotificationSettings'

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('center')
  const [unreadCount, setUnreadCount] = useState(0)

  // 動畫變體
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      {/* 動畫背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-teal-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      {/* 標題欄 */}
      <motion.header
        className="relative bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.05 }}>
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Bell className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  KCISLK ESID Info Hub
                </h1>
                <p className="text-xs text-gray-500">KCISLK Elementary School International Department</p>
              </div>
            </motion.div>

            <nav className="hidden md:flex items-center space-x-8">
              {[
                { name: "Home", href: "/" },
                { name: "Events", href: "/events" },
                { name: "Resources", href: "/resources" },
              ].map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <Link
                    href={item.href}
                    className="relative px-4 py-2 rounded-lg transition-all duration-300 text-gray-600 hover:text-purple-600 hover:bg-purple-50/50"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8">
        {/* 導航 */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首頁
          </Link>
        </div>

        {/* 頁面標題 */}
        <motion.div
          className="text-center mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6"
            variants={itemVariants}
          >
            通知中心 Notifications
          </motion.h2>
          <motion.p
            className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            管理您的通知偏好，查看重要訊息，掌握最新動態
          </motion.p>
        </motion.div>

        {/* 通知統計卡片 */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">未讀通知</p>
                    <p className="text-2xl font-bold text-blue-800">{unreadCount}</p>
                  </div>
                  <Bell className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">本週通知</p>
                    <p className="text-2xl font-bold text-green-800">24</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">高優先級</p>
                    <p className="text-2xl font-bold text-purple-800">3</p>
                  </div>
                  <Filter className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">已讀率</p>
                    <p className="text-2xl font-bold text-orange-800">85%</p>
                  </div>
                  <CheckCheck className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* 主要內容區域 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-white/80 backdrop-blur-lg shadow-xl border-0">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b bg-gray-50/50 px-6 py-4">
                  <TabsList className="grid w-full grid-cols-3 bg-transparent">
                    <TabsTrigger 
                      value="center" 
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      通知列表
                    </TabsTrigger>
                    <TabsTrigger 
                      value="settings"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      通知設定
                    </TabsTrigger>
                    <TabsTrigger 
                      value="stats"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      統計分析
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="center" className="m-0">
                  <div className="p-6">
                    <NotificationCenter
                      showHeader={false}
                      maxHeight="max-h-[70vh]"
                      autoRefresh={true}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="m-0">
                  <div className="p-6">
                    <NotificationSettings
                      onPreferencesChange={(preferences) => {
                        console.log('Preferences updated:', preferences)
                      }}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="m-0">
                  <div className="p-6">
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-6"
                    >
                      <motion.div variants={itemVariants}>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                          通知統計分析
                        </h3>
                        <p className="text-gray-600 mb-6">
                          了解您的通知接收和閱讀習慣，優化通知體驗
                        </p>
                      </motion.div>

                      {/* 統計圖表區域 */}
                      <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        variants={containerVariants}
                      >
                        <motion.div variants={itemVariants}>
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">通知類型分佈</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">公告通知</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div className="w-3/4 h-full bg-blue-500 rounded-full"></div>
                                    </div>
                                    <span className="text-sm font-medium">75%</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">活動通知</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div className="w-1/2 h-full bg-green-500 rounded-full"></div>
                                    </div>
                                    <span className="text-sm font-medium">50%</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">系統通知</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div className="w-1/4 h-full bg-purple-500 rounded-full"></div>
                                    </div>
                                    <span className="text-sm font-medium">25%</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">閱讀趨勢</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">平均閱讀時間</span>
                                  <span className="text-lg font-semibold">2.3 分鐘</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">最佳閱讀時段</span>
                                  <Badge>上午 9-11 點</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">週平均通知</span>
                                  <span className="text-lg font-semibold">18 則</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">回應率</span>
                                  <span className="text-lg font-semibold text-green-600">92%</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </motion.div>

                      {/* 建議和洞察 */}
                      <motion.div variants={itemVariants}>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">個人化建議</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-800">
                                  💡 您最常在上午時段閱讀通知，建議將重要通知設定在這個時間發送
                                </p>
                              </div>
                              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm text-green-800">
                                  ✅ 您的通知回應率很高，繼續保持這個良好的習慣！
                                </p>
                              </div>
                              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <p className="text-sm text-yellow-800">
                                  ⚠️ 有 3 則高優先級通知尚未處理，建議優先查看
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </motion.div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* 頁尾 */}
      <motion.footer
        className="bg-gradient-to-r from-purple-800 to-purple-900 text-white py-12 relative overflow-hidden mt-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.p 
            initial={{ y: 20, opacity: 0 }} 
            whileInView={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.2 }}
          >
            &copy; 2025 KCISLK Elementary School International Department. All rights reserved.
          </motion.p>
          <motion.p
            className="text-purple-300 text-sm mt-2"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            林口康橋國際學校 | Excellence in International Education
          </motion.p>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 25% 25%, white 2px, transparent 2px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>
      </motion.footer>
    </div>
  )
}