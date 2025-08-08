"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Mail, Phone, Search, ChevronDown, Sparkles, Users, BookOpen, Calendar, Bell, AlertTriangle, Info, CheckCircle, ArrowRight, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { Announcement } from "@/lib/types"

/**
 * 首頁組件 - KCISLK ESID Info Hub
 * Home Page Component - KCISLK ESID Info Hub
 * 
 * @description 展示 KCISLK ESID 的主要功能，為林口康橋的家長和老師提供最新資訊、活動更新和溝通工具
 * @features 響應式設計、流暢動畫、視差滾動效果、互動式卡片
 * @author Claude Code | Generated with love for KCISLK ESID Info Hub
 */
export default function HomePage() {
  // 頁面載入狀態 | Page loading state
  const [isLoaded, setIsLoaded] = useState(false)
  
  // 公告相關狀態 | Announcement related states
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [announcementsLoading, setAnnouncementsLoading] = useState(true)
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<Set<number>>(new Set())
  
  // 滾動效果相關 hooks | Scroll effect related hooks
  const { scrollY } = useScroll()
  const heroRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: true })

  // 視差滾動變換 | Parallax scroll transforms
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3])

  useEffect(() => {
    setIsLoaded(true)
    fetchPublicAnnouncements()
  }, [])

  // 獲取公開公告 | Fetch public announcements
  const fetchPublicAnnouncements = async () => {
    try {
      setAnnouncementsLoading(true)
      const response = await fetch('/api/announcements?status=published&limit=5&targetAudience=parents')
      const data = await response.json()
      
      if (data.success) {
        // 篩選未過期的公告 | Filter non-expired announcements
        const now = new Date()
        const validAnnouncements = data.data.filter((announcement: Announcement) => 
          !announcement.expiresAt || new Date(announcement.expiresAt) > now
        )
        setAnnouncements(validAnnouncements)
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error)
    } finally {
      setAnnouncementsLoading(false)
    }
  }

  // 處理公告展開/收合 | Handle announcement expand/collapse
  const handleToggleAnnouncement = (announcementId: number) => {
    setExpandedAnnouncements(prev => {
      const newSet = new Set(prev)
      if (newSet.has(announcementId)) {
        newSet.delete(announcementId)
      } else {
        newSet.add(announcementId)
      }
      return newSet
    })
  }

  // 取得優先級圖示 | Get priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4" />
      case 'medium':
        return <Info className="w-4 h-4" />
      case 'low':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  // Format date
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return null
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // KCFSID 小隊列表 | KCFSID Squad list
  const squads = ["Achievers", "Adventurers", "Discoverers", "Explorers", "Innovators", "Leaders"]

  // 容器動畫變體 - 漸進式顯示子元素 | Container animation variants - staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,    // 子元素間隔顯示時間
        delayChildren: 0.3,      // 子元素延遲顯示時間
      },
    },
  }

  // 項目動畫變體 - 從下往上淡入 | Item animation variants - fade up
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
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
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"
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

      {/* Header */}
      <motion.header
        className="relative bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  Parents' Corner
                </h1>
                <p className="text-xs text-gray-500">KCISLK ESID</p>
              </div>
            </motion.div>

            <nav className="hidden md:flex items-center space-x-8">
              {[
                { name: "Home", href: "/", active: true },
                { name: "Events", href: "/events" },
                { name: "Resources", href: "/resources" },
                { name: "Notifications", href: "/notifications" },
              ].map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <Link
                    href={item.href}
                    className={`relative px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-1 ${
                      item.active
                        ? "text-purple-600 bg-purple-100/50"
                        : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50"
                    }`}
                  >
                    {item.name}
                    {item.active && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full"
                        layoutId="activeTab"
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Search className="h-5 w-5 text-gray-600 cursor-pointer hover:text-purple-600 transition-colors" />
              </motion.div>
            </nav>
          </div>
        </div>
      </motion.header>

      <main>
        {/* Hero Section */}
        <section ref={heroRef} className="relative py-20 overflow-hidden">
          <motion.div className="container mx-auto px-4 text-center relative z-10" style={{ y: y1, opacity }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isHeroInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.h2
                className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 mb-4"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Parents' Corner
              </motion.h2>
              <motion.h3
                className="text-3xl md:text-4xl font-light text-gray-700 mb-6"
                initial={{ y: 30, opacity: 0 }}
                animate={isHeroInView ? { y: 0, opacity: 1 } : {}}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                KCISLK ESID
              </motion.h3>
              <motion.p
                className="text-xl md:text-2xl text-gray-600 mb-8"
                initial={{ y: 30, opacity: 0 }}
                animate={isHeroInView ? { y: 0, opacity: 1 } : {}}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Welcome to our Parents' Corner
              </motion.p>
            </motion.div>

            <motion.div
              className="flex justify-center gap-4 mt-8"
              initial={{ y: 30, opacity: 0 }}
              animate={isHeroInView ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                  Explore Resources
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  className="border-purple-300 text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-transparent"
                >
                  Learn More
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-xl"
            variants={floatingVariants}
            animate="animate"
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-xl"
            variants={floatingVariants}
            animate="animate"
            transition={{
              delay: 1,
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </section>


        {/* Important Announcements Section */}
        <motion.section
          className="py-20 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Bell className="w-6 h-6 text-white" />
                </motion.div>
                Important Announcements
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Stay updated with the latest news and important information from our school community
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              className="max-w-4xl mx-auto"
            >
              {announcementsLoading ? (
                // 載入動畫 | Loading animation
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 animate-pulse"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="h-6 bg-gray-200 rounded-lg mb-3 w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded-lg mb-2 w-full"></div>
                          <div className="h-4 bg-gray-200 rounded-lg mb-4 w-2/3"></div>
                          <div className="flex gap-2">
                            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                            <div className="h-6 bg-gray-200 rounded-full w-12"></div>
                          </div>
                        </div>
                        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : announcements.length > 0 ? (
                // 公告列表 | Announcements list
                <div className="space-y-4">
                  {announcements.map((announcement) => {
                    const isExpanded = expandedAnnouncements.has(announcement.id)
                    const priorityColors = {
                      high: 'from-red-50 to-pink-50 border-red-200',
                      medium: 'from-blue-50 to-cyan-50 border-blue-200',
                      low: 'from-green-50 to-emerald-50 border-green-200'
                    }
                    
                    return (
                      <motion.div
                        key={announcement.id}
                        variants={itemVariants}
                        className={`bg-gradient-to-br ${priorityColors[announcement.priority]} backdrop-blur-sm rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl`}
                        whileHover={{ scale: 1.01, y: -2 }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* 標題和優先級 */}
                            <div className="flex items-start gap-3 mb-3">
                              <motion.div
                                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md flex-shrink-0 ${
                                  announcement.priority === 'high' 
                                    ? 'bg-gradient-to-br from-red-500 to-red-700' 
                                    : announcement.priority === 'medium'
                                    ? 'bg-gradient-to-br from-blue-500 to-blue-700'
                                    : 'bg-gradient-to-br from-green-500 to-green-700'
                                }`}
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <span className="text-white">
                                  {getPriorityIcon(announcement.priority)}
                                </span>
                              </motion.div>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                  {announcement.title}
                                </h3>
                                {announcement.summary && (
                                  <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                                    {announcement.summary}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* 標籤區域 */}
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <Badge 
                                variant={announcement.priority === 'high' ? 'destructive' : 'default'}
                                className="flex items-center gap-1"
                              >
                                {getPriorityIcon(announcement.priority)}
                                {announcement.priority === 'high' ? 'High Priority' : 
                                 announcement.priority === 'medium' ? 'Medium' : 'Low Priority'}
                              </Badge>
                              
                              {announcement.publishedAt && (
                                <Badge variant="outline" className="text-xs">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {formatDate(announcement.publishedAt)}
                                </Badge>
                              )}

                              {announcement.expiresAt && (
                                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Valid until {formatDate(announcement.expiresAt)}
                                </Badge>
                              )}
                            </div>

                            {/* 展開的完整內容 */}
                            <motion.div
                              initial={false}
                              animate={{ 
                                height: isExpanded ? 'auto' : 0,
                                opacity: isExpanded ? 1 : 0
                              }}
                              transition={{ duration: 0.3 }}
                              style={{ overflow: 'hidden' }}
                            >
                              {isExpanded && (
                                <div className="pt-4 border-t border-gray-200/50">
                                  <div className="prose prose-sm max-w-none text-gray-700">
                                    <div 
                                      className="whitespace-pre-wrap"
                                      dangerouslySetInnerHTML={{ 
                                        __html: announcement.content.replace(/\n/g, '<br />') 
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          </div>

                          {/* 展開/收合按鈕 */}
                          <motion.button
                            onClick={() => handleToggleAnnouncement(announcement.id)}
                            className="flex-shrink-0 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 border border-white/50"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ChevronDown className="w-5 h-5 text-gray-600" />
                            </motion.div>
                          </motion.button>
                        </div>
                      </motion.div>
                    )
                  })}

                  {/* 查看更多公告按鈕 */}
                  <motion.div 
                    variants={itemVariants}
                    className="text-center pt-6"
                  >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link href="/announcements">
                        <Button className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                          View All Announcements
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </motion.div>
                  </motion.div>
                </div>
              ) : (
                // 沒有公告時的顯示 | No announcements display
                <motion.div
                  variants={itemVariants}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No important announcements at this time
                  </h3>
                  <p className="text-gray-600">
                    We will post announcements here when we have important information to share
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.section>



      </main>

      {/* Footer */}
      <motion.footer
        className="bg-gradient-to-r from-purple-800 to-purple-900 text-white py-12 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 25% 25%, white 2px, transparent 2px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Contact Us
              </h3>
              <div className="space-y-2 text-purple-200">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>director@kcislk.ntpc.edu.tw</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>Extension: 1234</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <div className="space-y-2">
                {["Home", "Events", "Resources", "Contact"].map((link, index) => (
                  <motion.a
                    key={link}
                    href="#"
                    className="block text-purple-200 hover:text-white transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    {link}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <h3 className="text-xl font-bold mb-4">Our Mission</h3>
              <p className="text-purple-200 italic leading-relaxed">
                "Empowering global citizens through innovative education and cultural understanding."
              </p>
            </motion.div>
          </div>

          <motion.div
            className="text-center pt-8 border-t border-purple-700"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p>&copy; 2025 KCISLK Elementary School International Department. All rights reserved.</p>
            <p className="text-purple-300 text-sm mt-2">Kang Chiao International School | Excellence in International Education</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  )
}
