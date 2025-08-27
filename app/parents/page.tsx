"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ExternalLink,
  Mail,
  Phone,
  Search,
  Users,
  BookOpen,
  GraduationCap,
  FileText,
  Calendar,
  MessageSquare,
  Clock,
  Globe,
  School,
  Megaphone,
  LinkIcon,
  MessageCircle,
  Star,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Heart,
  Home,
  Info,
} from "lucide-react"
import Link from "next/link"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useParentHeroImageSetting } from "@/hooks/useSystemSettings"
import MobileNav from "@/components/ui/mobile-nav"

// Define types for our data
interface Reminder {
  id: number
  title: string
  content: string
  priority: 'low' | 'medium' | 'high'
  status: string
  dueDate?: string
  reminderType: string
  creator: {
    id: string
    displayName?: string
    firstName?: string
    lastName?: string
  }
  createdAt: string
}

interface MessageBoardPost {
  id: number
  title: string
  content: string
  boardType: 'teachers' | 'parents' | 'general'
  isPinned: boolean
  status: string
  viewCount: number
  author: {
    id: string
    displayName?: string
    firstName?: string
    lastName?: string
  }
  replies: any[]
  createdAt: string
}

export default function ParentsPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [reminders, setReminders] = useState<{ urgent: Reminder[], regular: Reminder[], total: number }>({ urgent: [], regular: [], total: 0 })
  const [messages, setMessages] = useState<{ pinned: MessageBoardPost[], regular: MessageBoardPost[], total: number }>({ pinned: [], regular: [], total: 0 })
  const [loadingReminders, setLoadingReminders] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [error, setError] = useState('')
  const { user, loading: authLoading } = useAuth()
  
  // 獲取動態主視覺圖片 - Use parent-specific hook
  const { imageUrl: heroImageUrl, isLoading: heroImageLoading } = useParentHeroImageSetting()
  
  const { scrollY } = useScroll()
  const heroRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: true })

  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3])

  // Fetch reminders data
  const fetchReminders = async () => {
    if (!user) return
    
    try {
      setLoadingReminders(true)
      const response = await fetch('/api/parents/reminders?limit=10')
      const result = await response.json()
      
      if (result.success) {
        setReminders(result.data)
      } else {
        setError('Failed to fetch reminders')
      }
    } catch (err) {
      console.error('Error fetching reminders:', err)
      setError('Failed to fetch reminders')
    } finally {
      setLoadingReminders(false)
    }
  }

  // Fetch message board data
  const fetchMessages = async () => {
    if (!user) return
    
    try {
      setLoadingMessages(true)
      const response = await fetch('/api/parents/messages?limit=10&boardType=parents')
      const result = await response.json()
      
      if (result.success) {
        setMessages(result.data)
      } else {
        setError('Failed to fetch messages')
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError('Failed to fetch messages')
    } finally {
      setLoadingMessages(false)
    }
  }

  useEffect(() => {
    setIsLoaded(true)
    if (user && !authLoading) {
      fetchReminders()
      fetchMessages()
    }
  }, [user, authLoading])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 overflow-hidden">
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
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-rose-400/20 to-pink-500/20 rounded-full blur-3xl"
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

      {/* Line Bot Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <Button
            className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 p-0 group"
            title="LINE Bot Assistant"
          >
            <motion.div className="relative" whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
              <MessageCircle className="w-8 h-8" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </Button>
        </motion.div>

        {/* Tooltip */}
        <motion.div
          className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
        >
          LINE Bot Assistant
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </motion.div>
      </motion.div>

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
                className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Heart className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ESID PARENTS
                </h1>
                <p className="text-xs text-gray-500">Family Hub</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-4">
              {/* 桌面版導航 */}
              <nav className="hidden md:flex items-center space-x-8">
                {[
                  { name: "Home", href: "/parents", active: true },
                  { name: "Information", href: "#information" },
                  { name: "Resources", href: "#resources" },
                  { name: "Communication", href: "#communication" },
                  { name: "Teachers' Hub", href: "/teachers" },
                ].map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <a
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
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                          layoutId="activeTab"
                        />
                      )}
                    </a>
                  </motion.div>
                ))}
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Search className="h-5 w-5 text-gray-600 cursor-pointer hover:text-purple-600 transition-colors" />
                </motion.div>
              </nav>

              {/* 行動版導航 */}
              <MobileNav />
            </div>
          </div>
        </div>
      </motion.header>

      <main>
        {/* Error Display */}
        {error && (
          <motion.div
            className="container mx-auto px-4 py-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Hero Section */}
        <section ref={heroRef} className="relative py-16 overflow-hidden">
          {/* Hero Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${heroImageUrl}')`,
              opacity: 0.8
            }}
          />
          
          {/* Additional overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-purple-900/30 to-pink-900/20" />
          
          <motion.div className="container mx-auto px-4 text-center relative z-10" style={{ y: y1, opacity }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isHeroInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.h2
                className="text-6xl md:text-8xl font-black text-white drop-shadow-2xl mb-8 tracking-tight"
                animate={{
                  textShadow: [
                    "0 0 20px rgba(147, 51, 234, 0.8)",
                    "0 0 40px rgba(236, 72, 153, 0.6)", 
                    "0 0 20px rgba(147, 51, 234, 0.8)"
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <span className="bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                  ESID PARENTS
                </span>
              </motion.h2>
              <motion.p
                className="text-2xl md:text-3xl text-white/95 max-w-4xl mx-auto leading-relaxed mb-12 drop-shadow-xl font-light tracking-wide"
                initial={{ y: 30, opacity: 0 }}
                animate={isHeroInView ? { y: 0, opacity: 1 } : {}}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Your <span className="font-semibold text-purple-200">comprehensive family hub</span> for resources, communication, and school connection
              </motion.p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-12"
              initial={{ y: 30, opacity: 0 }}
              animate={isHeroInView ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.div 
                whileHover={{ scale: 1.08, y: -3, rotate: 1 }} 
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur opacity-30"></div>
                <Button className="relative bg-white/95 hover:bg-white text-purple-700 font-bold px-10 py-4 rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 backdrop-blur-sm border-2 border-white/50 text-lg">
                  <Star className="w-5 h-5 mr-2" />
                  Quick Access
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.08, y: -3, rotate: -1 }} 
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full blur opacity-25"></div>
                <Button
                  variant="outline"
                  className="relative border-2 border-white/80 text-white hover:bg-white/25 hover:border-white px-10 py-4 rounded-full shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 bg-white/15 backdrop-blur-sm font-bold text-lg"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Feedback
                  <ExternalLink className="w-4 h-4 ml-2" />
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
            className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-rose-400/30 to-pink-500/30 rounded-full blur-xl"
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

        {/* Parent Communication Section */}
        <motion.section
          className="py-16 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">PARENT COMMUNICATION</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Stay connected with your child's education through easy communication channels
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
              <Card className="bg-white/90 backdrop-blur-lg shadow-2xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-400/50 to-pink-600/50"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />
                  <CardTitle className="flex items-center gap-3 text-3xl relative z-10">
                    <MessageSquare className="h-8 w-8" />
                    Connect with School
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <h4 className="text-xl font-semibold text-gray-900">Communication Channels</h4>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                          <Star className="w-3 h-3 mr-1" />
                          Always Available
                        </Badge>
                      </div>
                      <ul className="space-y-4 text-gray-700">
                        <motion.li 
                          className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                          <span>Direct messaging with teachers and staff</span>
                        </motion.li>
                        <motion.li 
                          className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                          <span>Real-time updates on school activities</span>
                        </motion.li>
                        <motion.li 
                          className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                          <span>Schedule parent-teacher conferences easily</span>
                        </motion.li>
                      </ul>
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="mb-4 text-center">
                        <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Secure & Private
                        </Badge>
                      </div>
                      <motion.div 
                        whileHover={{ scale: 1.02, rotate: 1 }} 
                        whileTap={{ scale: 0.98 }}
                        className="relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg blur opacity-25"></div>
                        <Button 
                          className="relative w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-4 text-lg border-2 border-white"
                          onClick={async () => {
                            const mailto = 'mailto:parents@kcislk.ntpc.edu.tw?subject=Parent Communication&body=Hello! I would like to...'
                            window.open(mailto, '_blank')
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            <span>Start Communication</span>
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </Button>
                      </motion.div>
                      <p className="text-sm text-gray-500 text-center mt-3">
                        Your child's success is our shared goal
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.section>

        {/* Information Section */}
        <motion.section id="information" className="py-20 relative overflow-hidden" style={{ y: y2 }}>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-pink-600/90" />
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
              SCHOOL INFORMATION
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
                HUB
              </motion.span>
            </motion.h2>

            <motion.div
              className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {/* School Calendar */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 overflow-hidden group hover:shadow-3xl transition-all duration-500 h-full">
                  <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="text-xl text-purple-700 flex items-center justify-center gap-2">
                      <Calendar className="w-6 h-6" />
                      School Calendar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-2 text-center font-semibold">2024 Academic Calendar</p>
                    <p className="text-gray-500 mb-4 text-center text-sm">
                      Important dates, holidays, and school events
                    </p>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                        <Calendar className="w-4 h-4 mr-2" />
                        View Calendar
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Parent Resources */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 overflow-hidden group hover:shadow-3xl transition-all duration-500 h-full">
                  <CardHeader className="text-center pb-4 bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardTitle className="text-xl text-purple-700 flex items-center justify-center gap-2">
                      <BookOpen className="w-6 h-6" />
                      Parent Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Available Resources</span>
                          <span className="text-lg font-bold text-green-600">12</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Guides, forms, and helpful information
                        </p>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                        <FileText className="w-4 h-4 mr-2" />
                        Browse Resources
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Announcements */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 overflow-hidden group hover:shadow-3xl transition-all duration-500 h-full">
                  <CardHeader className="text-center pb-4 bg-gradient-to-r from-amber-50 to-orange-50">
                    <CardTitle className="text-xl text-purple-700 flex items-center justify-center gap-2">
                      <Megaphone className="w-6 h-6" />
                      Announcements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Recent Updates</span>
                          <span className="text-lg font-bold text-amber-600">3</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Latest school news and announcements
                        </p>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                        <Megaphone className="w-4 h-4 mr-2" />
                        View Announcements
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Parent Resources Section */}
        <motion.section
          id="resources"
          className="py-20 bg-white/50 backdrop-blur-sm"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">PARENT RESOURCES</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Essential resources and information to support your child's educational journey
              </p>
            </motion.div>

            <motion.div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto" variants={containerVariants}>
              {/* Academic Support */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0 overflow-hidden group hover:shadow-2xl transition-all duration-500 h-full">
                  <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <GraduationCap className="h-7 w-7" />
                      Academic Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-6">Curriculum information, homework help, and academic resources</p>
                    <div className="space-y-3">
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <FileText className="w-4 h-4 mr-2" />
                          Curriculum Guides
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Study Resources
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <Clock className="w-4 h-4 mr-2" />
                          Homework Help
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* School Life */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0 overflow-hidden group hover:shadow-2xl transition-all duration-500 h-full">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <School className="h-7 w-7" />
                      School Life
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-6">
                      Activities, events, and everything about daily school life
                    </p>
                    <div className="space-y-3">
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <Calendar className="w-4 h-4 mr-2" />
                          School Events
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <Users className="w-4 h-4 mr-2" />
                          Extracurriculars
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <Info className="w-4 h-4 mr-2" />
                          School Policies
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Parent Community */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0 overflow-hidden group hover:shadow-2xl transition-all duration-500 h-full">
                  <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Heart className="h-7 w-7" />
                      Parent Community
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-6">Connect with other parents and join community activities</p>
                    <div className="space-y-3">
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <Users className="w-4 h-4 mr-2" />
                          Parent Groups
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Discussion Forum
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <Calendar className="w-4 h-4 mr-2" />
                          Community Events
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Teachers' Hub Link Section */}
        <motion.section
          className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect with Teachers</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Access the Teachers' Hub to understand our educational approach and resources
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
              <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0 overflow-hidden">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <LinkIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Teachers' Hub</h3>
                  <p className="text-gray-600 mb-6">
                    Explore teacher resources, educational philosophies, and professional development initiatives 
                    to better understand your child's learning environment.
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/teachers">
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Visit Teachers' Hub
                      </Button>
                    </Link>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer
        className="bg-gradient-to-r from-purple-800 to-pink-800 text-white py-12 relative overflow-hidden"
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
                <Heart className="w-5 h-5" />
                Contact Support
              </h3>
              <div className="space-y-2 text-purple-200">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>parents@kcislk.ntpc.edu.tw</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>Extension: 1234</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <h3 className="text-xl font-bold mb-4">Quick Access</h3>
              <div className="space-y-2">
                {["School Calendar", "Parent Resources", "Communication", "Community Events"].map(
                  (link, index) => (
                    <motion.a
                      key={link}
                      href="#"
                      className="block text-purple-200 hover:text-white transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      {link}
                    </motion.a>
                  ),
                )}
              </div>
            </motion.div>

            <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <h3 className="text-xl font-bold mb-4">Family Hub</h3>
              <p className="text-purple-200 italic leading-relaxed">
                "Supporting families through transparent communication, comprehensive resources, and 
                collaborative partnerships in education."
              </p>
            </motion.div>
          </div>

          <motion.div
            className="text-center pt-8 border-t border-purple-700"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p>&copy; 2025 ESID Parents Hub, KCIS. All rights reserved.</p>
            <p className="text-purple-300 text-sm mt-2">Excellence Through Family Partnership</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  )
}