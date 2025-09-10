"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ExternalLink, Mail, Phone, Search, ChevronDown, Sparkles, Users, BookOpen, Calendar, Newspaper, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { useHomepageSettings } from "@/hooks/useHomepageSettings"
import { sanitizeAnnouncementContent } from "@/lib/sanitize-html"
import MobileNav from "@/components/ui/mobile-nav"
import PacingGuides from "@/components/PacingGuides"
import IDSquads from "@/components/IDSquads"

/**
 * 首頁組件 - ES 國際部家長門戶網站
 * Home Page Component - ES International Department Parent Portal
 * 
 * @description 展示 ES 國際部的主要功能，包括歡迎訊息、國際部新聞、月刊電子報和 KCFSID 小隊資訊
 * @features 響應式設計、流暢動畫、視差滾動效果、互動式卡片
 * @author Claude Code | Generated with love for ES International Department
 */
export default function HomePage() {
  // 頁面載入狀態 | Page loading state
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Message Board 狀態 | Message Board state
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [showMessageDetail, setShowMessageDetail] = useState(false)
  
  // Newsletter 狀態 | Newsletter state  
  const [newsletters, setNewsletters] = useState([])
  const [newslettersLoading, setNewslettersLoading] = useState(true)
  
  // 消息展開狀態 | Message expansion state
  const [expandedMessages, setExpandedMessages] = useState(new Set())
  
  // 首頁設定資料 | Homepage settings data
  const { settings, loading: settingsLoading } = useHomepageSettings()
  
  // Tab 狀態管理 | Tab state management
  const [activeTab, setActiveTab] = useState("news")
  
  // 會話儲存功能 | Session storage functionality
  useEffect(() => {
    const savedTab = sessionStorage.getItem('homepage-active-tab')
    if (savedTab) {
      setActiveTab(savedTab)
    }
  }, [])
  
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    sessionStorage.setItem('homepage-active-tab', value)
  }
  
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
    fetchMessages()
    fetchNewsletters()
  }, [])

  // 載入 Message Board 數據 | Load Message Board data
  const fetchMessages = async () => {
    try {
      setMessagesLoading(true)
      const response = await fetch('/api/public/messages?limit=5')
      const data = await response.json()
      
      if (data.success) {
        setMessages(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setMessagesLoading(false)
    }
  }

  // 載入 Newsletter 數據 | Load Newsletter data
  const fetchNewsletters = async () => {
    try {
      setNewslettersLoading(true)
      const response = await fetch('/api/public/newsletters?limit=3')
      const data = await response.json()
      
      if (data.success) {
        setNewsletters(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load newsletters:', error)
    } finally {
      setNewslettersLoading(false)
    }
  }

  // KCFSID 小隊列表 | KCFSID Squad list
  const squads = ["Achievers", "Adventurers", "Discoverers", "Explorers", "Innovators", "Leaders"]

  // 取得訊息優先級顏色樣式 | Get message priority color styles
  const getPriorityStyles = (priority, type) => {
    const styles = {
      high: {
        container: "from-red-50 to-pink-50",
        border: "border-red-400",
        badge: "bg-red-100 text-red-700",
        icon: "from-red-500 to-red-700"
      },
      medium: {
        container: "from-blue-50 to-cyan-50",
        border: "border-blue-400",
        badge: "bg-blue-100 text-blue-700",
        icon: "from-blue-500 to-blue-700"
      },
      low: {
        container: "from-green-50 to-emerald-50",
        border: "border-green-400",
        badge: "bg-green-100 text-green-700",
        icon: "from-green-500 to-green-700"
      }
    }
    
    return styles[priority] || styles.medium
  }

  // 取得訊息類型顯示名稱 | Get message type display name
  const getTypeDisplayName = (type) => {
    const typeNames = {
      message_board: "訊息板",
      announcement: "公告",
      event: "活動",
      news: "新聞"
    }
    return typeNames[type] || "通知"
  }

  // 處理消息展開/收合 | Handle message expand/collapse
  const toggleMessageExpansion = (messageId, event) => {
    event.stopPropagation() // 防止觸發 Modal
    setExpandedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

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
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <motion.div className="flex items-center gap-2 sm:gap-3" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
              <motion.div
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent leading-tight truncate">
                  <span className="hidden sm:inline">ES International Department</span>
                  <span className="sm:hidden">ES Int'l Dept</span>
                </h1>
                <p className="text-xs text-gray-500 leading-tight">Excellence in Education</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {[
                { name: "Home", href: "/", active: true },
                { name: "Events", href: "/events" },
                { name: "Resources", href: "/resources", hasDropdown: true },
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
                    {item.hasDropdown && <ChevronDown className="w-3 h-3" />}
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

            {/* Mobile Navigation */}
            <MobileNav />
          </div>
        </div>
      </motion.header>

      <main>
        {/* Hero Section */}
        <section ref={heroRef} className="relative py-20 overflow-hidden">
          {/* Hero Background Image */}
          {settings.heroImage && (
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
              style={{
                backgroundImage: `url('${settings.heroImage}')`,
              }}
            />
          )}
          {/* Overlay for better text readability - only show when hero image exists */}
          {settings.heroImage && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-purple-900/30 to-pink-900/20" />
          )}
          <motion.div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10" style={{ y: y1, opacity }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isHeroInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.h2
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 mb-4 sm:mb-6 leading-tight"
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
                <span className="block">{settings.mainTitle || "Welcome to our Parents' Corner"}</span>
              </motion.h2>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 px-4"
              initial={{ y: 30, opacity: 0 }}
              animate={isHeroInView ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button 
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-6 sm:px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px] text-sm sm:text-base"
                  onClick={() => window.location.href = settings.exploreButtonLink}
                >
                  <span className="truncate">{settings.exploreButtonText || "Explore Resources"}</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-purple-300 text-purple-600 hover:bg-purple-50 px-6 sm:px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm min-h-[44px] text-sm sm:text-base"
                  onClick={() => window.location.href = settings.learnMoreButtonLink}
                >
                  <span className="truncate">{settings.learnMoreButtonText || "Learn More"}</span>
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

        {/* Parents Quote Section */}
        <motion.section
          className="py-20 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              <motion.div className="lg:w-1/2" variants={itemVariants}>
                <motion.div className="relative group" whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <Image
                    src={settings.contentImage || "/placeholder.svg?height=400&width=600"}
                    alt="Mother and child reading together"
                    width={600}
                    height={400}
                    className="relative rounded-3xl shadow-2xl"
                  />
                  <motion.div
                    className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              </motion.div>

              <motion.div className="lg:w-1/2 relative" variants={itemVariants}>
                <motion.div
                  className="absolute -top-8 -left-8 text-8xl text-purple-200 font-serif"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  "
                </motion.div>
                <blockquote className="text-3xl md:text-4xl text-gray-700 font-light leading-relaxed relative z-10">
                  {settings.quoteText || "Parents are the cornerstone of a child's education; their support and collaboration with teachers create a powerful partnership that inspires and nurtures lifelong learners."}
                </blockquote>

                <motion.div
                  className="mt-12"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                >
                  <svg className="w-40 h-24 text-purple-300" viewBox="0 0 200 100" fill="none">
                    <motion.path
                      d="M20 50 Q100 20 180 50"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ delay: 1.2, duration: 2 }}
                    />
                    <motion.polygon
                      points="175,45 185,50 175,55 180,50"
                      fill="currentColor"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 2 }}
                    />
                  </svg>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* International Department NEWS */}
        <motion.section className="py-20 relative overflow-hidden" style={{ y: y2 }}>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-purple-800/90" />
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "radial-gradient(circle at 25% 25%, white 2px, transparent 2px)",
                backgroundSize: "60px 60px",
              }}
            />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-8 sm:mb-12 lg:mb-16 leading-tight"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              International Department
              <motion.span
                className="inline-block ml-4"
                animate={{
                  textShadow: [
                    "0 0 10px rgba(255,255,255,0.5)",
                    "0 0 20px rgba(255,255,255,0.8)",
                    "0 0 10px rgba(255,255,255,0.5)",
                  ],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                NEWS
              </motion.span>
            </motion.h2>

            {/* Tab-Based Content Layout */}
            <motion.div
              className="max-w-6xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                {/* Tab Navigation */}
                <motion.div 
                  className="flex justify-center mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <TabsList className="grid w-full max-w-xs sm:max-w-md md:max-w-lg grid-cols-2 bg-white/90 backdrop-blur-lg shadow-xl border border-white/20 p-1 rounded-2xl overflow-hidden">
                    <TabsTrigger 
                      value="news" 
                      className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-800 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 min-h-[44px]"
                    >
                      <BookOpen className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden md:inline text-sm truncate">News & Announcements</span>
                      <span className="hidden sm:inline md:hidden text-xs truncate">News</span>
                      <span className="sm:hidden text-xs truncate">News</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="newsletter" 
                      className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 min-h-[44px]"
                    >
                      <Newspaper className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden md:inline text-sm truncate">Monthly Newsletter</span>
                      <span className="hidden sm:inline md:hidden text-xs truncate">Newsletter</span>
                      <span className="sm:hidden text-xs truncate">Letter</span>
                    </TabsTrigger>
                  </TabsList>
                </motion.div>

                {/* Tab Content */}
                <div className="relative">
                  {/* ID News & Announcements Tab */}
                  <TabsContent value="news" className="mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 overflow-hidden">
                        <CardHeader className="text-center pb-4 bg-gradient-to-r from-purple-50 to-pink-50">
                          <CardTitle className="text-3xl text-purple-700 flex items-center justify-center gap-3">
                            <BookOpen className="w-8 h-8" />
                            ID News & Announcements
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-2">Latest updates, announcements, and important notices from ES International Department</p>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 lg:p-8">
                          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                            {messagesLoading ? (
                              // Enhanced loading skeleton
                              Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="bg-gray-50 rounded-xl p-6 animate-pulse">
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
                                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                  </div>
                                  <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                                    <div className="flex-1">
                                      <div className="h-5 w-3/4 bg-gray-200 rounded mb-3"></div>
                                      <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                                      <div className="h-4 w-2/3 bg-gray-200 rounded mb-3"></div>
                                      <div className="flex gap-2">
                                        <div className="h-6 w-16 bg-gray-200 rounded"></div>
                                        <div className="h-6 w-20 bg-gray-200 rounded"></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : messages.length > 0 ? (
                              messages.map((message, index) => {
                                const styles = getPriorityStyles(message.priority, message.type)
                                return (
                                  <motion.div
                                    key={message.id}
                                    className={`bg-gradient-to-br ${styles.container} rounded-xl p-3 sm:p-4 border-l-4 ${styles.border} hover:shadow-lg transition-all duration-300 cursor-pointer`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => {
                                      setSelectedMessage(message)
                                      setShowMessageDetail(true)
                                    }}
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <span className={`text-sm ${styles.badge} px-3 py-1 rounded-full font-medium`}>
                                        {getTypeDisplayName(message.type)}
                                      </span>
                                      <div className="text-right text-sm text-gray-600">
                                        {new Date(message.publishedAt || message.createdAt).toLocaleDateString('zh-TW', { 
                                          month: 'short', 
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-3 sm:gap-4">
                                      <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${styles.icon} rounded-full flex items-center justify-center shadow-md flex-shrink-0`}>
                                        {message.isPinned ? (
                                          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                        ) : message.type === 'announcement' ? (
                                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                        ) : (
                                          <span className="text-white font-bold text-xs sm:text-sm">ID</span>
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 mb-1.5 text-sm sm:text-base leading-tight">{message.title}</h4>
                                        {/* Gmail 風格的漸進展開內容 */}
                                        <div className="space-y-1.5">
                                          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                            expandedMessages.has(message.id) ? 'max-h-none' : 'max-h-14'
                                          }`}>
                                            <div 
                                              className="text-gray-700 leading-relaxed text-xs sm:text-sm prose prose-sm max-w-none"
                                              dangerouslySetInnerHTML={{ 
                                                __html: sanitizeAnnouncementContent(message.content || '<p class="text-gray-500">暫無內容</p>')
                                              }}
                                            />
                                          </div>
                                          
                                          {/* 顯示更多/收合按鈕 - 只在內容超過一定長度時顯示 */}
                                          {message.content && message.content.length > 200 && (
                                            <button 
                                              onClick={(e) => toggleMessageExpansion(message.id, e)}
                                              className="text-blue-600 text-xs sm:text-sm font-medium hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors duration-200 mb-2"
                                            >
                                              {expandedMessages.has(message.id) ? '收合' : '顯示更多'}
                                              <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${
                                                expandedMessages.has(message.id) ? 'rotate-180' : ''
                                              }`} />
                                            </button>
                                          )}
                                        </div>
                                        <div className="flex flex-wrap gap-1 sm:gap-2">
                                          {message.isImportant && (
                                            <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-medium">Important</span>
                                          )}
                                          {message.isPinned && (
                                            <span className="text-xs bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full font-medium">Pinned</span>
                                          )}
                                          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                            {message.author?.displayName || 
                                             `${message.author?.firstName || ''} ${message.author?.lastName || ''}`.trim() || 
                                             'KCISLK ESID'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )
                              })
                            ) : (
                              <div className="text-center py-16 text-gray-500">
                                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium mb-2">No Messages Available</h3>
                                <p className="text-sm">Latest announcements and information will be displayed here</p>
                              </div>
                            )}
                          </div>

                          {/* 
                            REMOVED 2025-09-11: "View All Messages & Announcements" button
                            可以在未來需要時取消註解以恢復功能
                            Can uncomment in the future to restore functionality
                          */}
                          {/*
                          <motion.div 
                            className="flex justify-center"
                            whileHover={{ scale: 1.02 }} 
                            whileTap={{ scale: 0.98 }}
                          >
                            <Link href="/announcements" className="w-full max-w-md">
                              <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-3">
View All Messages & Announcements
                              </Button>
                            </Link>
                          </motion.div>
                          */}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  {/* Monthly Newsletter Tab */}
                  <TabsContent value="newsletter" className="mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 overflow-hidden">
                        <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-50 to-cyan-50">
                          <CardTitle className="text-3xl text-purple-700 flex items-center justify-center gap-3">
                            <Newspaper className="w-8 h-8" />
                            Monthly Newsletter Archive
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-2">Browse our collection of monthly newsletters with online reading capabilities</p>
                        </CardHeader>
                        <CardContent className="p-8">
                          {newslettersLoading ? (
                            <div className="animate-pulse space-y-6">
                              {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="bg-gray-50 rounded-xl p-6">
                                  <div className="flex gap-6">
                                    <div className="w-32 h-40 bg-gray-200 rounded-lg flex-shrink-0"></div>
                                    <div className="flex-1">
                                      <div className="h-6 w-2/3 bg-gray-200 rounded mb-3"></div>
                                      <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                                      <div className="h-4 w-3/4 bg-gray-200 rounded mb-4"></div>
                                      <div className="h-10 w-32 bg-gray-200 rounded"></div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : newsletters.length > 0 ? (
                            <div className="space-y-8">
                              {newsletters.map((newsletter, index) => (
                                <motion.div
                                  key={newsletter.id}
                                  className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-xl p-6 border border-blue-100 hover:shadow-lg transition-all duration-300"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  whileHover={{ scale: 1.01 }}
                                >
                                  <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Newsletter Cover */}
                                    <div className="lg:w-1/3">
                                      {newsletter.coverImage ? (
                                        <motion.div className="relative" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-xl blur-lg" />
                                          <Image
                                            src={newsletter.coverImage}
                                            alt={`${newsletter.title} Preview`}
                                            width={300}
                                            height={400}
                                            className="relative w-full rounded-xl shadow-lg"
                                          />
                                        </motion.div>
                                      ) : (
                                        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-8 text-center aspect-[3/4] flex flex-col items-center justify-center">
                                          <Newspaper className="w-16 h-16 mb-4 text-blue-400" />
                                          <p className="text-blue-600 font-medium">Newsletter Cover</p>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Newsletter Details */}
                                    <div className="lg:w-2/3 flex flex-col justify-between">
                                      <div>
                                        <div className="flex items-center gap-2 mb-3">
                                          {newsletter.issueNumber && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                                              {newsletter.issueNumber}
                                            </span>
                                          )}
                                          <span className="text-sm text-gray-500">
                                            {new Date(newsletter.publishDate || newsletter.createdAt).toLocaleDateString('zh-TW', {
                                              year: 'numeric',
                                              month: 'long'
                                            })}
                                          </span>
                                        </div>
                                        
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{newsletter.title}</h3>
                                        <p className="text-gray-700 leading-relaxed mb-4">{newsletter.content}</p>
                                        
                                        {newsletter.onlineReaderUrl && (
                                          <div className="mb-4">
                                            <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
                                              <iframe
                                                src={newsletter.onlineReaderUrl}
                                                width="100%"
                                                height="200"
                                                frameBorder="0"
                                                className="rounded-lg"
                                                title={`${newsletter.title} Preview`}
                                              />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Action Buttons */}
                                      <div className="flex flex-col sm:flex-row gap-3">
                                        {newsletter.onlineReaderUrl ? (
                                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                            <Button 
                                              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                              onClick={() => window.open(newsletter.onlineReaderUrl, '_blank')}
                                            >
                                              <ExternalLink className="w-4 h-4 mr-2" />
                                              開啟完整閱讀器
                                            </Button>
                                          </motion.div>
                                        ) : newsletter.pdfUrl ? (
                                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                            <Button 
                                              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                              onClick={() => window.open(newsletter.pdfUrl, '_blank')}
                                            >
                                              <ExternalLink className="w-4 h-4 mr-2" />
Download PDF Version
                                            </Button>
                                          </motion.div>
                                        ) : (
                                          <Button className="flex-1 bg-gray-300 text-gray-500" disabled>
                                            Coming Soon
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                              
                              <motion.div 
                                className="text-center pt-8 border-t border-blue-100"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                              >
                                <p className="text-gray-600 mb-4">Want to see more newsletters?</p>
                                <Link href="/newsletters">
                                  <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
Browse Complete Newsletter Archive
                                  </Button>
                                </Link>
                              </motion.div>
                            </div>
                          ) : (
                            <div className="text-center py-16">
                              <Newspaper className="w-16 h-16 mx-auto mb-6 text-blue-400" />
                              <h3 className="text-xl font-semibold text-gray-900 mb-3">Newsletter Archive Coming Soon</h3>
                              <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                                We're preparing monthly newsletters filled with important updates, events, and highlights from our ID community.
                              </p>
                              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white" disabled>
                                Newsletter Coming Soon
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                </div>
              </Tabs>
            </motion.div>
          </div>
        </motion.section>

        {/* Pacing Guides Section */}
        <PacingGuides />

        {/* ID Squads Section */}
        <IDSquads />

        {/* Contact CTA */}
        <motion.section
          className="py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "radial-gradient(circle at 50% 50%, white 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div variants={itemVariants}>
              <motion.h2
                className="text-4xl md:text-5xl font-bold text-white mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                Ready to Connect?
              </motion.h2>
              <motion.p
                className="text-xl text-purple-100 mb-12 max-w-2xl mx-auto leading-relaxed"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Join our vibrant community and stay updated with the latest from ES International Department.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white text-purple-700 hover:bg-purple-50 px-6 sm:px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 min-h-[48px] text-sm sm:text-base"
                  >
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Contact Us</span>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-purple-700 px-6 sm:px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 min-h-[48px] text-sm sm:text-base"
                  >
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Call Us</span>
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                className="mt-12 flex justify-center items-center gap-8 text-purple-200"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  <span>esid@kangchiao.com.tw</span>
                </div>
                <div className="hidden md:block w-px h-6 bg-purple-300" />
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  <span>(02) 8195-8852</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* Message Detail Modal */}
      <Dialog open={showMessageDetail} onOpenChange={setShowMessageDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 pr-8">
              {selectedMessage?.title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              公告詳細內容
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4 mt-4">
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className={`px-3 py-1 rounded-full font-medium ${
                  selectedMessage.priority === 'high' 
                    ? 'bg-red-100 text-red-700'
                    : selectedMessage.priority === 'medium'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {getTypeDisplayName(selectedMessage.type)}
                </span>
                
                {selectedMessage.isImportant && (
                  <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 font-medium">
                    Important
                  </span>
                )}
                
                {selectedMessage.isPinned && (
                  <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-600 font-medium">
                    Pinned
                  </span>
                )}
                
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                  {selectedMessage.author?.displayName || 
                   `${selectedMessage.author?.firstName || ''} ${selectedMessage.author?.lastName || ''}`.trim() || 
                   'KCISLK ESID'}
                </span>
                
                <span className="text-gray-500 ml-auto">
                  {(selectedMessage.publishedAt || selectedMessage.createdAt) && 
                    new Date(selectedMessage.publishedAt || selectedMessage.createdAt).toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                </span>
              </div>
              
              {/* Divider */}
              <div className="border-t border-gray-200"></div>
              
              {/* Full Content */}
              <div className="prose prose-gray max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: sanitizeAnnouncementContent(selectedMessage.content || '<p class="text-gray-500">暫無內容</p>')
                  }}
                />
              </div>
              
              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button 
                  variant="outline"
                  onClick={() => setShowMessageDetail(false)}
                >
                  關閉
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">ES International Department</h3>
                  <p className="text-xs text-gray-400">Excellence in Education</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Nurturing global citizens through innovative education and meaningful partnerships.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-purple-300">Quick Links</h4>
              <div className="space-y-2">
                {["Events", "Resources", "News", "Contact"].map((link) => (
                  <Link
                    key={link}
                    href={`/${link.toLowerCase()}`}
                    className="block text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-purple-300">Contact Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Mail className="w-4 h-4" />
                  <span>esid@kangchiao.com.tw</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone className="w-4 h-4" />
                  <span>(02) 8195-8852</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 ES International Department. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}