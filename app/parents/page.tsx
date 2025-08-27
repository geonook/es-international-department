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
  UserCheck,
  Bell,
  Home,
  Sparkles,
  HeartHandshake,
  Shield,
  Target,
  TrendingUp,
  BookOpenCheck,
  Users2,
  PartyPopper,
} from "lucide-react"
import Link from "next/link"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useParentHeroImageSetting } from "@/hooks/useSystemSettings"
import MobileNav from "@/components/ui/mobile-nav"

// Define types for our data
interface Notification {
  id: number
  title: string
  content: string
  priority: 'low' | 'medium' | 'high'
  status: string
  dueDate?: string
  notificationType: string
  creator: {
    id: string
    displayName?: string
    firstName?: string
    lastName?: string
  }
  createdAt: string
}

interface ParentEvent {
  id: number
  title: string
  content: string
  eventType: 'meeting' | 'activity' | 'workshop' | 'general'
  isPinned: boolean
  status: string
  eventDate: string
  location?: string
  organizer: {
    id: string
    displayName?: string
    firstName?: string
    lastName?: string
  }
  attendees: any[]
  createdAt: string
}

export default function ParentsPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [notifications, setNotifications] = useState<{ urgent: Notification[], regular: Notification[], total: number }>({ urgent: [], regular: [], total: 0 })
  const [events, setEvents] = useState<{ upcoming: ParentEvent[], featured: ParentEvent[], total: number }>({ upcoming: [], featured: [], total: 0 })
  const [loadingNotifications, setLoadingNotifications] = useState(true)
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [error, setError] = useState('')
  const { user, loading: authLoading } = useAuth()
  
  // 獲取父母專用的動態主視覺圖片
  const { imageUrl: heroImageUrl, isLoading: heroImageLoading } = useParentHeroImageSetting()
  
  const { scrollY } = useScroll()
  const heroRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: true })

  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3])

  // Fetch notifications data
  const fetchNotifications = async () => {
    if (!user) return
    
    try {
      setLoadingNotifications(true)
      const response = await fetch('/api/parents/notifications?limit=10')
      const result = await response.json()
      
      if (result.success) {
        setNotifications(result.data)
      } else {
        setError('Failed to fetch notifications')
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError('Failed to fetch notifications')
    } finally {
      setLoadingNotifications(false)
    }
  }

  // Fetch events data
  const fetchEvents = async () => {
    if (!user) return
    
    try {
      setLoadingEvents(true)
      const response = await fetch('/api/parents/events?limit=10')
      const result = await response.json()
      
      if (result.success) {
        setEvents(result.data)
      } else {
        setError('Failed to fetch events')
      }
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Failed to fetch events')
    } finally {
      setLoadingEvents(false)
    }
  }

  useEffect(() => {
    setIsLoaded(true)
    if (user && !authLoading) {
      fetchNotifications()
      fetchEvents()
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
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 overflow-hidden">
      {/* Enhanced Animated Background Elements */}
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
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-rose-400/20 to-violet-400/20 rounded-full blur-3xl"
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
        
        {/* Additional floating hearts */}
        <motion.div
          className="absolute top-1/4 left-1/4 opacity-10"
          animate={{
            y: [0, -30, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <Heart className="w-12 h-12 text-pink-500" />
        </motion.div>
        <motion.div
          className="absolute top-3/4 right-1/3 opacity-10"
          animate={{
            y: [0, 25, 0],
            rotate: [0, -360],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
        >
          <HeartHandshake className="w-16 h-16 text-purple-500" />
        </motion.div>
      </div>

      {/* Enhanced LINE Bot Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, duration: 0.5, ease: "easeOut" }}
      >
        <motion.div className="relative">
          {/* Pulsing ring effect */}
          <motion.div
            className="absolute inset-0 w-16 h-16 border-4 border-green-400 rounded-full"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="relative"
          >
            <Button
              className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-2xl hover:shadow-green-500/30 hover:shadow-3xl transition-all duration-300 p-0 group border-2 border-white/20"
              title="Family Support Chat"
            >
              <motion.div className="relative" whileHover={{ rotate: 360 }} transition={{ duration: 0.8 }}>
                <MessageCircle className="w-8 h-8" />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full border border-white"
                  animate={{
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
                {/* Heart icon overlay */}
                <motion.div
                  className="absolute -bottom-2 -left-2 text-pink-200"
                  animate={{
                    scale: [0.8, 1.1, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                >
                  <Heart className="w-4 h-4" />
                </motion.div>
              </motion.div>
            </Button>
          </motion.div>
        </motion.div>

        {/* Enhanced Tooltip */}
        <motion.div
          className="absolute bottom-full right-0 mb-3 px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-sm rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap border border-gray-700"
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          whileHover={{ opacity: 1, y: 0, scale: 1 }}
        >
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" />
            <span className="font-medium">Family Support Chat</span>
          </div>
          <div className="text-xs text-gray-300 mt-1">Always here for you</div>
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
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
                className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-800 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Heart className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-800 bg-clip-text text-transparent">
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
                  { name: "Notifications", href: "#notifications" },
                  { name: "Events", href: "#events" },
                  { name: "Resources", href: "#resources" },
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
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-800 rounded-full"
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
                    "0 0 30px rgba(147, 51, 234, 0.9)",
                    "0 0 60px rgba(219, 39, 119, 0.7)", 
                    "0 0 30px rgba(147, 51, 234, 0.9)"
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <motion.span 
                  className="bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent inline-flex items-center gap-4"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    <Heart className="w-16 h-16 md:w-20 md:h-20 text-pink-300" />
                  </motion.div>
                  ESID PARENTS
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, -10, 10, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: 1.5,
                    }}
                  >
                    <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-purple-200" />
                  </motion.div>
                </motion.span>
              </motion.h2>
              <motion.p
                className="text-2xl md:text-3xl text-white/95 max-w-4xl mx-auto leading-relaxed mb-12 drop-shadow-xl font-light tracking-wide"
                initial={{ y: 30, opacity: 0 }}
                animate={isHeroInView ? { y: 0, opacity: 1 } : {}}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Your <motion.span 
                  className="font-bold text-transparent bg-gradient-to-r from-purple-200 via-pink-200 to-rose-200 bg-clip-text"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >dedicated family hub</motion.span> for school updates, events, and meaningful communication supporting your child's <motion.span 
                  className="font-semibold text-yellow-200"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >extraordinary learning journey</motion.span>
                <motion.span
                  className="inline-block ml-2"
                  animate={{
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                >
                  ✨
                </motion.span>
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
                <Button className="relative bg-white/95 hover:bg-white text-purple-700 font-bold px-12 py-5 rounded-full shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 backdrop-blur-sm border-2 border-white/50 text-lg group overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="relative flex items-center">
                    <PartyPopper className="w-5 h-5 mr-3" />
                    <span>Parent Portal</span>
                    <motion.div
                      className="ml-3"
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </div>
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
                  className="relative border-2 border-white/80 text-white hover:bg-white/25 hover:border-white px-12 py-5 rounded-full shadow-2xl hover:shadow-pink-500/30 transition-all duration-300 bg-white/15 backdrop-blur-sm font-bold text-lg group overflow-hidden"
                  onClick={() => {
                    const mailto = 'mailto:parents@kcislk.ntpc.edu.tw?subject=Parent Support Request&body=Dear Parent Support Team,%0D%0A%0D%0APlease describe how we can help you today...'
                    window.open(mailto, '_blank')
                  }}
                >
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-full"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="relative flex items-center">
                    <HeartHandshake className="w-5 h-5 mr-3" />
                    <span>Family Support</span>
                    <motion.div
                      className="ml-3"
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    >
                      <Heart className="w-4 h-4" />
                    </motion.div>
                  </div>
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
            className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-rose-400/30 to-violet-400/30 rounded-full blur-xl"
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
            <motion.div variants={itemVariants} className="text-center mb-16">
              <motion.div
                className="inline-flex items-center gap-3 mb-6"
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <Heart className="w-8 h-8 text-pink-500" />
                <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  PARENT COMMUNICATION
                </h2>
                <HeartHandshake className="w-8 h-8 text-purple-500" />
              </motion.div>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Stay connected with your child's <span className="font-semibold text-purple-600">educational journey</span> through 
                <span className="font-medium text-pink-600"> meaningful partnerships</span> and 
                <span className="font-semibold text-purple-600">supportive community connections</span>
              </p>
              <motion.div 
                className="mt-4 flex justify-center"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full border border-purple-100">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">Secure • Confidential • Always Available</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="max-w-5xl mx-auto">
              <Card className="bg-white/95 backdrop-blur-lg shadow-3xl border-2 border-white/50 overflow-hidden group hover:shadow-4xl transition-all duration-500">
                <CardHeader className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white relative overflow-hidden py-8">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-400/50 via-pink-400/50 to-purple-500/50"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />
                  {/* Floating hearts in header */}
                  <motion.div
                    className="absolute top-4 right-8 opacity-20"
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 15, -15, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    <Heart className="w-6 h-6" />
                  </motion.div>
                  <motion.div
                    className="absolute bottom-4 left-8 opacity-15"
                    animate={{
                      y: [0, 10, 0],
                      rotate: [0, -20, 20, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: 2,
                    }}
                  >
                    <HeartHandshake className="w-8 h-8" />
                  </motion.div>
                  <CardTitle className="flex items-center justify-center gap-4 text-4xl relative z-10 font-bold">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    >
                      <MessageCircle className="h-10 w-10" />
                    </motion.div>
                    <span>Connect & Communicate</span>
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    >
                      <Sparkles className="h-8 w-8" />
                    </motion.div>
                  </CardTitle>
                  <motion.p 
                    className="text-center text-purple-100 mt-2 text-lg relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Building stronger connections between home and school
                  </motion.p>
                </CardHeader>
                <CardContent className="p-10">
                  <div className="grid md:grid-cols-2 gap-10">
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <motion.div
                          animate={{
                            scale: [1, 1.05, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                        >
                          <h4 className="text-2xl font-bold text-gray-900">Communication Channels</h4>
                        </motion.div>
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                            delay: 0.5,
                          }}
                        >
                          <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200 px-3 py-1">
                            <Heart className="w-3 h-3 mr-1" />
                            <span className="font-semibold">Always Open</span>
                          </Badge>
                        </motion.div>
                      </div>
                      <ul className="space-y-5 text-gray-700">
                        <motion.li 
                          className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-100 shadow-sm hover:shadow-md transition-all duration-300"
                          whileHover={{ scale: 1.03, x: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "easeInOut",
                              delay: 0.2,
                            }}
                          >
                            <CheckCircle className="w-6 h-6 text-purple-500 mt-0.5 flex-shrink-0" />
                          </motion.div>
                          <div>
                            <span className="font-semibold">Direct messaging with your child's teachers</span>
                            <p className="text-sm text-gray-600 mt-1">Real-time communication for immediate concerns and celebrations</p>
                          </div>
                        </motion.li>
                        <motion.li 
                          className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-100 shadow-sm hover:shadow-md transition-all duration-300"
                          whileHover={{ scale: 1.03, x: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "easeInOut",
                              delay: 0.6,
                            }}
                          >
                            <CheckCircle className="w-6 h-6 text-pink-500 mt-0.5 flex-shrink-0" />
                          </motion.div>
                          <div>
                            <span className="font-semibold">Parent-teacher conference scheduling</span>
                            <p className="text-sm text-gray-600 mt-1">Flexible booking system for in-depth learning discussions</p>
                          </div>
                        </motion.li>
                        <motion.li 
                          className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-100 shadow-sm hover:shadow-md transition-all duration-300"
                          whileHover={{ scale: 1.03, x: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "easeInOut",
                              delay: 1,
                            }}
                          >
                            <CheckCircle className="w-6 h-6 text-purple-500 mt-0.5 flex-shrink-0" />
                          </motion.div>
                          <div>
                            <span className="font-semibold">School announcements and updates</span>
                            <p className="text-sm text-gray-600 mt-1">Stay informed about important events and school news</p>
                          </div>
                        </motion.li>
                        <motion.li 
                          className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-100 shadow-sm hover:shadow-md transition-all duration-300"
                          whileHover={{ scale: 1.03, x: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            animate={{
                              rotate: [0, 360],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "linear",
                            }}
                          >
                            <Sparkles className="w-6 h-6 text-emerald-500 mt-0.5 flex-shrink-0" />
                          </motion.div>
                          <div>
                            <span className="font-semibold text-emerald-700">Emergency communication system</span>
                            <p className="text-sm text-emerald-600 mt-1">Immediate alerts for urgent school or safety matters</p>
                          </div>
                        </motion.li>
                      </ul>
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="mb-6 text-center">
                        <motion.div
                          animate={{
                            scale: [1, 1.05, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                        >
                          <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-800 px-4 py-2 text-sm font-semibold">
                            <Shield className="w-4 h-4 mr-2" />
                            24/7 Family Support
                          </Badge>
                        </motion.div>
                        <p className="text-xs text-gray-500 mt-2">Response within 2 hours during school days</p>
                      </div>
                      
                      <div className="space-y-4">
                        <motion.div 
                          whileHover={{ scale: 1.05, rotate: 1 }} 
                          whileTap={{ scale: 0.95 }}
                          className="relative group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-40 transition-opacity"></div>
                          <Button 
                            className="relative w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 py-5 text-lg border-2 border-white/20 font-bold overflow-hidden group"
                            onClick={async () => {
                              const mailto = 'mailto:parents@kcislk.ntpc.edu.tw?subject=Parent Communication - Immediate Response Needed&body=Dear ESID Parent Support Team,%0D%0A%0D%0A🏫 Child Name: [Please enter]%0D%0A👥 Class: [Please enter]%0D%0A%0D%0A📝 Message:%0D%0A[Please describe your question, concern, or feedback]%0D%0A%0D%0AThank you for your prompt attention to this matter.%0D%0A%0D%0ABest regards,%0D%0A[Your name]'
                              window.open(mailto, '_blank')
                            }}
                          >
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                              initial={{ x: "-100%" }}
                              whileHover={{ x: "100%" }}
                              transition={{ duration: 0.6 }}
                            />
                            <div className="relative flex items-center justify-center gap-3">
                              <motion.div
                                animate={{
                                  scale: [1, 1.2, 1],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Number.POSITIVE_INFINITY,
                                  ease: "easeInOut",
                                }}
                              >
                                <HeartHandshake className="w-6 h-6" />
                              </motion.div>
                              <span>Connect Now</span>
                              <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{
                                  duration: 1,
                                  repeat: Number.POSITIVE_INFINITY,
                                  ease: "easeInOut",
                                }}
                              >
                                <ArrowRight className="w-5 h-5" />
                              </motion.div>
                            </div>
                          </Button>
                        </motion.div>
                        
                        <motion.div 
                          whileHover={{ scale: 1.03 }} 
                          whileTap={{ scale: 0.97 }}
                          className="relative"
                        >
                          <Button 
                            variant="outline" 
                            className="w-full border-2 border-purple-200 text-purple-700 hover:bg-purple-50 bg-white/80 py-4 text-base font-semibold transition-all duration-300 hover:border-purple-300"
                            onClick={() => {
                              // Scroll to resources section
                              document.getElementById('resources')?.scrollIntoView({ behavior: 'smooth' })
                            }}
                          >
                            <BookOpenCheck className="w-5 h-5 mr-2" />
                            Communication Guidelines
                          </Button>
                        </motion.div>
                      </div>
                      
                      <motion.div 
                        className="mt-6 text-center"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{
                          duration: 3,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      >
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                          <Heart className="w-4 h-4 text-pink-500" />
                          <span className="font-medium">Building stronger connections between home and school</span>
                          <Heart className="w-4 h-4 text-purple-500" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Every conversation strengthens our partnership</p>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.section>

        {/* Information Section */}
        <motion.section id="notifications" className="py-20 relative overflow-hidden" style={{ y: y2 }}>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-pink-800/90" />
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
              className="text-5xl md:text-6xl font-bold text-white text-center mb-16"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-4 flex-wrap justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 15, -15, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <Heart className="w-12 h-12 md:w-16 md:h-16 text-pink-300" />
                </motion.div>
                <span>PARENT</span>
                <motion.span
                  className="inline-block"
                  animate={{
                    textShadow: [
                      "0 0 20px rgba(255,255,255,0.6)",
                      "0 0 40px rgba(255,255,255,0.9)",
                      "0 0 20px rgba(255,255,255,0.6)",
                    ],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  PORTAL
                </motion.span>
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, -20, 20, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                >
                  <Users2 className="w-10 h-10 md:w-14 md:h-14 text-purple-200" />
                </motion.div>
              </div>
              <motion.p 
                className="text-lg md:text-xl text-purple-100 mt-4 font-light max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Your personalized dashboard for school life insights and updates
              </motion.p>
            </motion.h2>

            <motion.div
              className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {/* Enhanced Parent Notifications */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-2 border-purple-100/50 overflow-hidden group hover:shadow-4xl hover:border-purple-200 transition-all duration-500 h-full">
                  <CardHeader className="text-center pb-6 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 relative overflow-hidden">
                    {/* Animated background pattern */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-100/30 to-pink-100/30"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    />
                    <CardTitle className="text-2xl font-bold text-purple-700 flex items-center justify-center gap-3 relative z-10">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 15, -15, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      >
                        <Bell className="w-7 h-7" />
                      </motion.div>
                      <span>Parent Updates</span>
                      <motion.div
                        animate={{
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      >
                        <Sparkles className="w-5 h-5 text-pink-500" />
                      </motion.div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      {loadingNotifications ? (
                        <motion.div 
                          className="space-y-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-24 bg-purple-100" />
                            <Skeleton className="h-6 w-8 bg-purple-200 rounded-full" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-16 bg-purple-50" />
                            <Skeleton className="h-3 w-12 bg-purple-50" />
                          </div>
                          <motion.div 
                            className="flex items-center justify-center py-2"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent"></div>
                            <span className="text-xs text-purple-600 ml-2 font-medium">Loading notifications...</span>
                          </motion.div>
                        </motion.div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                            <span className="text-base font-semibold text-gray-800">📬 New Updates</span>
                            <motion.span 
                              className="text-2xl font-bold text-purple-600 px-3 py-1 bg-white rounded-full shadow-sm"
                              animate={{
                                scale: notifications.total > 0 ? [1, 1.1, 1] : 1,
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: notifications.total > 0 ? Number.POSITIVE_INFINITY : 0,
                                ease: "easeInOut",
                              }}
                            >
                              {notifications.total}
                            </motion.span>
                          </div>
                          
                          {notifications.urgent.length > 0 && (
                            <motion.div 
                              className="flex items-center justify-between p-2 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-l-4 border-red-400"
                              animate={{
                                scale: [1, 1.02, 1],
                              }}
                              transition={{
                                duration: 1,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "easeInOut",
                              }}
                            >
                              <span className="text-sm font-semibold text-red-700 flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4" />
                                Urgent Items
                              </span>
                              <span className="text-lg font-bold text-red-600 bg-white px-2 py-1 rounded-full">{notifications.urgent.length}</span>
                            </motion.div>
                          )}
                          
                          <div className="bg-gradient-to-r from-gray-50 to-purple-50/30 p-3 rounded-lg border border-gray-100">
                            <p className="text-sm text-gray-700 font-medium">
                              {notifications.total > 0 ? (
                                <>
                                  <span className="text-green-600 font-semibold">📋 Latest:</span> Important updates about school events, activities, and announcements awaiting your attention
                                </>
                              ) : (
                                <>
                                  <span className="text-gray-500">✅ All Caught Up!</span> No new notifications at this time
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -2 }} 
                      whileTap={{ scale: 0.95 }}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-35 transition-opacity"></div>
                      <Button 
                        className="relative w-full bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 hover:from-purple-700 hover:via-purple-800 hover:to-purple-900 text-white shadow-xl hover:shadow-2xl transition-all duration-300 py-4 text-base font-semibold border-2 border-white/20 overflow-hidden group"
                        disabled={loadingNotifications}
                      >
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6 }}
                        />
                        <div className="relative flex items-center justify-center gap-3">
                          <motion.div
                            animate={loadingNotifications ? {
                              rotate: [0, 360],
                            } : {
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: loadingNotifications ? 1 : 2,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: loadingNotifications ? "linear" : "easeInOut",
                            }}
                          >
                            <Bell className="w-5 h-5" />
                          </motion.div>
                          <span>
                            {loadingNotifications ? 'Loading Updates...' : (
                              notifications.total > 0 
                                ? `View Updates (${notifications.total})` 
                                : 'Check Updates'
                            )}
                          </span>
                          {notifications.total > 0 && !loadingNotifications && (
                            <motion.div
                              animate={{ x: [0, 3, 0] }}
                              transition={{
                                duration: 1,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "easeInOut",
                              }}
                            >
                              <ArrowRight className="w-4 h-4" />
                            </motion.div>
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Enhanced School Calendar */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-2 border-rose-100/50 overflow-hidden group hover:shadow-4xl hover:border-rose-200 transition-all duration-500 h-full">
                  <CardHeader className="text-center pb-6 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-50 relative overflow-hidden">
                    {/* Animated calendar pattern */}
                    <motion.div
                      className="absolute top-2 right-4 opacity-10"
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 20,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    >
                      <Calendar className="w-8 h-8 text-rose-400" />
                    </motion.div>
                    <CardTitle className="text-2xl font-bold text-purple-700 flex items-center justify-center gap-3 relative z-10">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      >
                        <Calendar className="w-7 h-7 text-rose-600" />
                      </motion.div>
                      <span>School Calendar</span>
                      <motion.div
                        animate={{
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1.8,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                          delay: 0.5,
                        }}
                      >
                        <Target className="w-5 h-5 text-pink-500" />
                      </motion.div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4 mb-6">
                      <div className="text-center p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100">
                        <p className="text-lg font-bold text-gray-800 mb-1">🎆 2025 Academic Year</p>
                        <p className="text-sm text-gray-600">All the important dates at your fingertips</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-100">
                          <div className="font-semibold text-blue-700 flex items-center gap-1">
                            <span>🎓</span> Term Dates
                          </div>
                          <div className="text-blue-600 text-xs mt-1">Start & end dates</div>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100">
                          <div className="font-semibold text-green-700 flex items-center gap-1">
                            <span>🎉</span> Events
                          </div>
                          <div className="text-green-600 text-xs mt-1">School activities</div>
                        </div>
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-3 rounded-lg border border-orange-100">
                          <div className="font-semibold text-orange-700 flex items-center gap-1">
                            <span>🏦</span> Holidays
                          </div>
                          <div className="text-orange-600 text-xs mt-1">No school days</div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-100">
                          <div className="font-semibold text-purple-700 flex items-center gap-1">
                            <span>📅</span> Meetings
                          </div>
                          <div className="text-purple-600 text-xs mt-1">Parent conferences</div>
                        </div>
                      </div>
                    </div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -2 }} 
                      whileTap={{ scale: 0.95 }}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-pink-500 rounded-lg blur opacity-25 group-hover:opacity-35 transition-opacity"></div>
                      <Button className="relative w-full bg-gradient-to-r from-rose-600 via-pink-700 to-rose-800 hover:from-rose-700 hover:via-pink-800 hover:to-rose-900 text-white shadow-xl hover:shadow-2xl transition-all duration-300 py-4 text-base font-semibold border-2 border-white/20 overflow-hidden">
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6 }}
                        />
                        <div className="relative flex items-center justify-center gap-3">
                          <motion.div
                            animate={{
                              rotate: [0, 15, -15, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "easeInOut",
                            }}
                          >
                            <Calendar className="w-5 h-5" />
                          </motion.div>
                          <span>Explore Calendar</span>
                          <motion.div
                            animate={{ x: [0, 3, 0] }}
                            transition={{
                              duration: 1.5,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "easeInOut",
                            }}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </motion.div>
                        </div>
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Parent Events */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 overflow-hidden group hover:shadow-3xl transition-all duration-500 h-full">
                  <CardHeader className="text-center pb-4 bg-gradient-to-r from-violet-50 to-purple-50">
                    <CardTitle className="text-xl text-purple-700 flex items-center justify-center gap-2">
                      <Users className="w-6 h-6" />
                      Parent Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      {loadingEvents ? (
                        <motion.div 
                          className="space-y-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-20 bg-violet-100" />
                            <Skeleton className="h-6 w-8 bg-violet-200 rounded-full" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-14 bg-violet-50" />
                            <Skeleton className="h-3 w-16 bg-violet-50" />
                          </div>
                          <motion.div 
                            className="flex items-center justify-center py-2"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-600 border-t-transparent"></div>
                            <span className="text-xs text-violet-600 ml-2 font-medium">Loading events...</span>
                          </motion.div>
                        </motion.div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Upcoming Events</span>
                            <span className="text-lg font-bold text-violet-600">{events.total}</span>
                          </div>
                          {events.featured.length > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-amber-600">⭐ Featured</span>
                              <span className="text-sm font-semibold text-amber-600">{events.featured.length}</span>
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            {events.total > 0 ? 'Workshops, meetings, and activities' : 'No upcoming events'}
                          </p>
                        </div>
                      )}
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        disabled={loadingEvents}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        {loadingEvents ? 'Loading...' : `View Events ${events.total > 0 ? `(${events.total})` : ''}`}
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
              <h2 className="text-4xl font-bold text-gray-900 mb-4">PARENT RESOURCES & GUIDELINES</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Essential resources and guidelines to support your child's educational journey
              </p>
            </motion.div>

            <motion.div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto" variants={containerVariants}>
              {/* Academic Support */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0 overflow-hidden group hover:shadow-2xl transition-all duration-500 h-full">
                  <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <BookOpen className="h-7 w-7" />
                      Academic Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-6">Resources to help support your child's learning at home</p>
                    <div className="space-y-3">
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <FileText className="w-4 h-4 mr-2" />
                          Homework Guidelines
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Reading Resources
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <GraduationCap className="w-4 h-4 mr-2" />
                          Learning Support
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* School Life */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0 overflow-hidden group hover:shadow-2xl transition-all duration-500 h-full">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <School className="h-7 w-7" />
                      School Life
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-6">
                      Information about daily school life and expectations
                    </p>
                    <div className="space-y-3">
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <Clock className="w-4 h-4 mr-2" />
                          Daily Schedule
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <Users className="w-4 h-4 mr-2" />
                          School Policies
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <Home className="w-4 h-4 mr-2" />
                          Parent Handbook
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Communication */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0 overflow-hidden group hover:shadow-2xl transition-all duration-500 h-full">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <MessageCircle className="h-7 w-7" />
                      Communication
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-6">Stay connected with teachers and school community</p>
                    <div className="space-y-3">
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <Mail className="w-4 h-4 mr-2" />
                          Contact Directory
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <Calendar className="w-4 h-4 mr-2" />
                          Conference Booking
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Parent Portal
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Parent Community Section */}
        <motion.section
          id="events"
          className="py-20 bg-gradient-to-br from-pink-50 to-purple-50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">PARENT COMMUNITY</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Connect with other families and participate in school community activities
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
              <Card className="bg-white/90 backdrop-blur-lg shadow-2xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-600 text-white relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-400/50 to-purple-500/50"
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
                    <Users className="h-8 w-8" />
                    Community Activities
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">Ways to Get Involved</h4>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Parent volunteer opportunities</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>School event planning committees</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Parent-teacher association meetings</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Family social gatherings and workshops</span>
                        </li>
                      </ul>
                    </div>
                    <div className="flex flex-col justify-center">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          className="w-full bg-gradient-to-r from-pink-600 to-purple-800 hover:from-pink-700 hover:to-purple-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-4 text-lg mb-4"
                          onClick={() => {
                            // Scroll to events section or show events content
                            document.getElementById('notifications')?.scrollIntoView({ behavior: 'smooth' })
                          }}
                        >
                          <Users className="w-5 h-5 mr-2" />
                          View Upcoming Events
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className="w-full border-pink-300 text-pink-700 hover:bg-pink-50 bg-transparent"
                          onClick={() => {
                            const mailto = 'mailto:parents@kcislk.ntpc.edu.tw?subject=Parent Volunteer Interest&body=I am interested in getting involved with the parent community. Please provide more information about volunteer opportunities...'
                            window.open(mailto, '_blank')
                          }}
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Join Community
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.section>

        {/* Teachers' Hub Link Section */}
        <motion.section
          className="py-16 bg-gradient-to-br from-blue-50 to-cyan-50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect with Teachers</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Visit the Teachers' Hub to learn more about our educators and their professional resources
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
              <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0 overflow-hidden">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Teachers' Hub</h3>
                  <p className="text-gray-600 mb-6">
                    Learn about our dedicated educators, their professional development, and how they work 
                    together to provide the best educational experience for your child.
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/teachers">
                      <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
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
        className="bg-gradient-to-r from-purple-800 to-pink-900 text-white py-12 relative overflow-hidden"
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
                Parent Support
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
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <div className="space-y-2">
                {["Parent Portal", "School Calendar", "Resources", "Communication"].map(
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
                "Supporting families through partnership, communication, and shared commitment to every child's success."
              </p>
            </motion.div>
          </div>

          <motion.div
            className="text-center pt-8 border-t border-purple-700"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p>&copy; 2025 ESID Parents' Corner, KCIS. All rights reserved.</p>
            <p className="text-purple-300 text-sm mt-2">Strengthening the Home-School Partnership</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  )
}