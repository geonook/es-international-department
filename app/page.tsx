"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Mail, Phone, Search, ChevronDown, Sparkles, Users, BookOpen, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"

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
  }, [])

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
                  ES International Department
                </h1>
                <p className="text-xs text-gray-500">Excellence in Education</p>
              </div>
            </motion.div>

            <nav className="hidden md:flex items-center space-x-8">
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
                className="text-6xl md:text-8xl font-light text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 mb-6"
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
                Welcome to our
              </motion.h2>
              <motion.h3
                className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-800 via-purple-600 to-pink-600 mb-8"
                initial={{ y: 50, opacity: 0 }}
                animate={isHeroInView ? { y: 0, opacity: 1 } : {}}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Parents' Corner
              </motion.h3>
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

        {/* Parents Quote Section */}
        <motion.section
          className="py-20 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <motion.div className="lg:w-1/2" variants={itemVariants}>
                <motion.div className="relative group" whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <Image
                    src="/placeholder.svg?height=400&width=600"
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
                  <motion.span
                    className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                  >
                    Parents are the cornerstone
                  </motion.span>{" "}
                  of a child's education; their support and collaboration with teachers create a powerful partnership
                  that inspires and nurtures lifelong learners.
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

          <div className="container mx-auto px-4 relative z-10">
            <motion.h2
              className="text-5xl font-bold text-white text-center mb-16"
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

            <motion.div
              className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {/* ID News Message Board */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 overflow-hidden group hover:shadow-3xl transition-all duration-500">
                  <CardHeader className="text-center pb-4 bg-gradient-to-r from-purple-50 to-pink-50">
                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                      <CardTitle className="text-2xl text-purple-700 cursor-pointer flex items-center justify-center gap-2 group-hover:text-purple-900 transition-colors">
                        <BookOpen className="w-6 h-6" />
                        ID News Message Board
                      </CardTitle>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                      {/* 範例訊息 1 - 重要通知 */}
                      <motion.div
                        className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border-l-4 border-red-400"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                            重要通知
                          </span>
                          <div className="text-right text-xs text-gray-600">Jan 15, 2025</div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                            <span className="text-white font-bold text-xs">ID</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">期末評量週注意事項</h4>
                            <p className="text-sm text-gray-700 mb-2">
                              親愛的家長們，期末評量週即將到來（1/20-1/24），請協助孩子做好複習準備。各科評量範圍已上傳至班級群組。
                            </p>
                            <div className="flex gap-2">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">評量週</span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">家長配合</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* 範例訊息 2 - 活動公告 */}
                      <motion.div
                        className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-l-4 border-blue-400"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                            活動公告
                          </span>
                          <div className="text-right text-xs text-gray-600">Jan 12, 2025</div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">國際文化日活動報名開始</h4>
                            <p className="text-sm text-gray-700 mb-2">
                              2025國際文化日將於2月28日舉行，歡迎各國家長分享文化特色。報名截止日期：1/25。
                            </p>
                            <div className="flex gap-2">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">文化交流</span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">家長參與</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* 範例訊息 3 - 學習資源 */}
                      <motion.div
                        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-l-4 border-green-400"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            學習資源
                          </span>
                          <div className="text-right text-xs text-gray-600">Jan 10, 2025</div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">新版線上閱讀平台上線</h4>
                            <p className="text-sm text-gray-700 mb-2">
                              全新的Reading A-Z平台已經上線，提供更豐富的分級讀物。學生帳號密碼已發送至家長信箱。
                            </p>
                            <div className="flex gap-2">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">閱讀平台</span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">數位學習</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* 範例訊息 4 - 行政通知 */}
                      <motion.div
                        className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border-l-4 border-purple-400"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                            行政通知
                          </span>
                          <div className="text-right text-xs text-gray-600">Jan 8, 2025</div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">家長會議時間調整通知</h4>
                            <p className="text-sm text-gray-700 mb-2">
                              原定1/18的家長會議調整至1/22下午2:00舉行，地點：國際部會議室。請家長準時參加。
                            </p>
                            <div className="flex gap-2">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">會議通知</span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">時間異動</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* 範例訊息 5 - 成果分享 */}
                      <motion.div
                        className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-l-4 border-yellow-400"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                            成果分享
                          </span>
                          <div className="text-right text-xs text-gray-600">Jan 5, 2025</div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">學生英語演講比賽佳績</h4>
                            <p className="text-sm text-gray-700 mb-2">
                              恭喜本校學生在台北市英語演講比賽中獲得優異成績！六年級王小明榮獲第一名，五年級李小華獲得第三名。
                            </p>
                            <div className="flex gap-2">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">競賽成果</span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">學生表現</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                        查看更多訊息
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Monthly Newsletter */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 overflow-hidden group hover:shadow-3xl transition-all duration-500">
                  <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-50 to-cyan-50">
                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                      <CardTitle className="text-2xl text-purple-700 cursor-pointer flex items-center justify-center gap-2 group-hover:text-purple-900 transition-colors">
                        <Calendar className="w-6 h-6" />
                        Monthly Newsletter
                      </CardTitle>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <motion.p
                        className="font-semibold text-gray-900 mb-2"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        Stay informed and connected!
                      </motion.p>
                      <motion.p
                        className="text-sm text-gray-600 leading-relaxed"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        We will be uploading a monthly newsletter filled with important updates, events, and highlights
                        from our ID community.
                      </motion.p>
                    </div>
                    <motion.div className="relative mb-4" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-xl blur-lg" />
                      <Image
                        src="/placeholder.svg?height=200&width=300"
                        alt="Monthly Newsletter Preview"
                        width={300}
                        height={200}
                        className="relative w-full rounded-xl shadow-lg"
                      />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                        View Latest Newsletter
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Quick Stats */}
        <motion.section
          className="py-16 bg-white/50 backdrop-blur-sm"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: "6", label: "Grade Levels", icon: BookOpen },
                { number: "500+", label: "Students", icon: Users },
                { number: "50+", label: "Resources", icon: ExternalLink },
                { number: "12", label: "Monthly Updates", icon: Calendar },
              ].map((stat, index) => (
                <motion.div key={index} variants={itemVariants} className="text-center group">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <stat.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <motion.div
                    className="text-3xl font-bold text-gray-900 mb-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* KCFSID Squads */}
        <motion.section
          className="py-20 bg-gradient-to-br from-red-50 to-pink-50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">KCFSID Squads</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Building team spirit and character development through our unique squad system
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
              variants={containerVariants}
            >
              {squads.map((squad, index) => (
                <motion.div key={index} variants={itemVariants} className="group">
                  <motion.div
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50"
                    whileHover={{
                      scale: 1.05,
                      y: -5,
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl mx-auto mb-4 flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <span className="text-white font-bold text-lg">{squad[0]}</span>
                    </motion.div>
                    <Badge
                      variant="outline"
                      className="text-lg py-2 px-4 border-red-300 text-red-700 bg-red-50/50 hover:bg-red-100/50 transition-colors"
                    >
                      {squad}
                    </Badge>
                  </motion.div>
                </motion.div>
              ))}
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
            <p>&copy; 2025 ES International Department, KCIS. All rights reserved.</p>
            <p className="text-purple-300 text-sm mt-2">Excellence in International Education</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  )
}
