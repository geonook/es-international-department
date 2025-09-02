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
} from "lucide-react"
import Link from "next/link"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useHeroImageSetting } from "@/hooks/useSystemSettings"
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
  sourceGroup?: string // 主任Vickie, 副主任Matthew, Academic Team, Curriculum Team, Instructional Team
  isImportant: boolean
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

export default function TeachersPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [reminders, setReminders] = useState<{ urgent: Reminder[], regular: Reminder[], total: number }>({ urgent: [], regular: [], total: 0 })
  const [messages, setMessages] = useState<{ 
    important: MessageBoardPost[], 
    pinned: MessageBoardPost[], 
    regular: MessageBoardPost[], 
    byGroup: Record<string, MessageBoardPost[]>,
    total: number,
    totalImportant: number 
  }>({ important: [], pinned: [], regular: [], byGroup: {}, total: 0, totalImportant: 0 })
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  // 組別顏色配置
  const groupColors: Record<string, { bg: string, text: string, label: string }> = {
    'Vickie': { bg: 'bg-purple-100', text: 'text-purple-700', label: '👩‍💼 Vickie' },
    '副主任Matthew': { bg: 'bg-indigo-100', text: 'text-indigo-700', label: '👨‍💼 副主任 Matthew' },
    'Academic Team': { bg: 'bg-blue-100', text: 'text-blue-700', label: '📚 Academic Team' },
    'Curriculum Team': { bg: 'bg-green-100', text: 'text-green-700', label: '📖 Curriculum Team' },
    'Instructional Team': { bg: 'bg-orange-100', text: 'text-orange-700', label: '🎯 Instructional Team' },
    'general': { bg: 'bg-gray-100', text: 'text-gray-700', label: '📢 General' }
  }
  const [loadingReminders, setLoadingReminders] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [error, setError] = useState('')
  const [successAnimationReminders, setSuccessAnimationReminders] = useState(false)
  const [successAnimationMessages, setSuccessAnimationMessages] = useState(false)
  const { user, loading: authLoading } = useAuth()
  
  // Get dynamic hero background image
  const { imageUrl: heroImageUrl, isLoading: heroImageLoading } = useHeroImageSetting()
  
  // Essential Documents Google Docs Links
  const essentialDocuments = {
    academic: {
      title: "Academic Affairs",
      description: "Curriculum guidelines, assessment tools, and academic policies",
      googleDocUrl: "https://docs.google.com/document/d/[ACADEMIC_AFFAIRS_DOC_ID]",
      icon: BookOpen,
      color: "from-indigo-500 to-indigo-600"
    },
    foreign: {
      title: "Foreign Affairs",
      description: "International partnerships, exchange programs, and external communications",
      googleDocUrl: "https://docs.google.com/document/d/[FOREIGN_AFFAIRS_DOC_ID]",
      icon: Globe,
      color: "from-teal-500 to-teal-600"
    },
    classroom: {
      title: "Classroom Affairs",
      description: "Classroom management, teaching resources, and student affairs",
      googleDocUrl: "https://docs.google.com/document/d/[CLASSROOM_AFFAIRS_DOC_ID]",
      icon: School,
      color: "from-emerald-500 to-emerald-600"
    }
  }
  
  const { scrollY } = useScroll()
  const heroRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: true })

  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3])

  // Fetch reminders data with enhanced error handling and retry
  const fetchReminders = async (retryCount = 0) => {
    if (!user) {
      setLoadingReminders(false)
      return
    }
    
    try {
      setLoadingReminders(true)
      setError('')
      
      // Add timeout to prevent infinite loading
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch('/api/teachers/reminders?limit=10', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setReminders(result.data)
        // Trigger success animation
        setSuccessAnimationReminders(true)
        setTimeout(() => setSuccessAnimationReminders(false), 2000)
      } else {
        throw new Error(result.message || 'Failed to fetch reminders')
      }
    } catch (err) {
      console.error('Error fetching reminders:', err)
      
      // Retry logic for network errors (but not for auth errors)
      if (retryCount < 2 && !err.message.includes('401') && !err.message.includes('Unauthorized')) {
        setTimeout(() => fetchReminders(retryCount + 1), 2000 * (retryCount + 1))
        return
      }
      
      setError(err.name === 'AbortError' ? 'Request timed out. Please try again.' : 'Failed to fetch reminders')
    } finally {
      setLoadingReminders(false)
    }
  }

  // Fetch message board data with enhanced error handling and retry
  const fetchMessages = async (retryCount = 0) => {
    if (!user) {
      setLoadingMessages(false)
      return
    }
    
    try {
      setLoadingMessages(true)
      setError('')
      
      // Add timeout to prevent infinite loading
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch('/api/teachers/messages?limit=10&boardType=teachers', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setMessages(result.data)
        // Trigger success animation
        setSuccessAnimationMessages(true)
        setTimeout(() => setSuccessAnimationMessages(false), 2000)
      } else {
        throw new Error(result.message || 'Failed to fetch messages')
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
      
      // Retry logic for network errors (but not for auth errors)
      if (retryCount < 2 && !err.message.includes('401') && !err.message.includes('Unauthorized')) {
        setTimeout(() => fetchMessages(retryCount + 1), 2000 * (retryCount + 1))
        return
      }
      
      setError(err.name === 'AbortError' ? 'Request timed out. Please try again.' : 'Failed to fetch messages')
    } finally {
      setLoadingMessages(false)
    }
  }

  // Enhanced useEffect with better auth handling
  useEffect(() => {
    setIsLoaded(true)
    
    // Only fetch data when user is authenticated and auth loading is complete
    if (user && !authLoading) {
      fetchReminders()
      fetchMessages()
    } else if (!user && !authLoading) {
      // Reset loading states when user is not authenticated
      setLoadingReminders(false)
      setLoadingMessages(false)
      setError('')
    }
  }, [user, authLoading])

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"
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
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-teal-400/20 rounded-full blur-3xl"
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
                className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <GraduationCap className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  ESID TEACHERS
                </h1>
                <p className="text-xs text-gray-500">Professional Hub</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-4">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                {[
                  { name: "Home", href: "/teachers", active: true },
                  { name: "Information", href: "#information" },
                  { name: "Documents", href: "#documents" },
                  { name: "Bulletin", href: "#bulletin" },
                  { name: "Parents' Corner", href: "/parents" },
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
                          ? "text-blue-600 bg-blue-100/50"
                          : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
                      }`}
                    >
                      {item.name}
                      {item.active && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full"
                          layoutId="activeTab"
                        />
                      )}
                    </a>
                  </motion.div>
                ))}
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Search className="h-5 w-5 text-gray-600 cursor-pointer hover:text-blue-600 transition-colors" />
                </motion.div>
              </nav>

              {/* Mobile Navigation */}
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
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-blue-900/30 to-indigo-900/20" />
          
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
                    "0 0 20px rgba(59, 130, 246, 0.8)",
                    "0 0 40px rgba(147, 51, 234, 0.6)", 
                    "0 0 20px rgba(59, 130, 246, 0.8)"
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  ESID TEACHERS
                </span>
              </motion.h2>
              <motion.p
                className="text-2xl md:text-3xl text-white/95 max-w-4xl mx-auto leading-relaxed mb-12 drop-shadow-xl font-light tracking-wide"
                initial={{ y: 30, opacity: 0 }}
                animate={isHeroInView ? { y: 0, opacity: 1 } : {}}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Your <span className="font-semibold text-blue-200">comprehensive professional hub</span> for resources, collaboration, and communication
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
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-30"></div>
                <Button className="relative bg-white/95 hover:bg-white text-blue-700 font-bold px-10 py-4 rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 backdrop-blur-sm border-2 border-white/50 text-lg">
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
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur opacity-25"></div>
                <Button
                  variant="outline"
                  className="relative border-2 border-white/80 text-white hover:bg-white/25 hover:border-white px-10 py-4 rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 bg-white/15 backdrop-blur-sm font-bold text-lg"
                  onClick={() => window.open('https://forms.gle/7xWeZvdDHfAq9fbZ8', '_blank')}
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  ESID Feedback
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-xl"
            variants={floatingVariants}
            animate="animate"
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-green-400/30 to-teal-400/30 rounded-full blur-xl"
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

        {/* ESID Feedback Section */}
        <motion.section
          className="py-16 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">ESID FEEDBACK</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Share your concerns, questions, or compliments through our new feedback form. Include your name if you'd like follow-up or submit anonymously—your input helps us grow and improve!
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
              <Card className="bg-white/90 backdrop-blur-lg shadow-2xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-orange-400/50 to-red-500/50"
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
                    Feedback & Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <h4 className="text-xl font-semibold text-gray-900">How to Submit Feedback</h4>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                          <Star className="w-3 h-3 mr-1" />
                          Easy Process
                        </Badge>
                      </div>
                      <ul className="space-y-4 text-gray-700">
                        <motion.li 
                          className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>Click the feedback form link to access Google Forms</span>
                        </motion.li>
                        <motion.li 
                          className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>Submit anonymously or include your name</span>
                        </motion.li>
                        <motion.li 
                          className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>Management team will review and respond appropriately</span>
                        </motion.li>
                      </ul>
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="mb-4 text-center">
                        <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Quick & Secure
                        </Badge>
                      </div>
                      <motion.div 
                        whileHover={{ scale: 1.02, rotate: 1 }} 
                        whileTap={{ scale: 0.98 }}
                        className="relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg blur opacity-25"></div>
                        <Button 
                          className="relative w-full bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-4 text-lg border-2 border-white"
                          onClick={() => {
                            // Open ESID Feedback Google Form
                            window.open('https://forms.gle/7xWeZvdDHfAq9fbZ8', '_blank')
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            <span>Open ESID Feedback Form</span>
                            <ExternalLink className="w-4 h-4 ml-1" />
                          </div>
                        </Button>
                      </motion.div>
                      <p className="text-sm text-gray-500 text-center mt-3">
                        Your feedback helps us improve and grow together
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
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-blue-800/90" />
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
              INFORMATION
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
              {/* Reminders */}
              <motion.div 
                variants={itemVariants}
                animate={successAnimationReminders ? {
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0],
                  boxShadow: [
                    "0 10px 25px rgba(34, 197, 94, 0.15)",
                    "0 20px 40px rgba(34, 197, 94, 0.3)",
                    "0 10px 25px rgba(34, 197, 94, 0.15)"
                  ]
                } : {}}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 overflow-hidden group hover:shadow-3xl transition-all duration-500 h-full relative">
                  {/* Success celebration overlay */}
                  {successAnimationReminders && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 pointer-events-none z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5 }}
                    />
                  )}
                  <CardHeader className="text-center pb-4 bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardTitle className="text-xl text-blue-700 flex items-center justify-center gap-2">
                      <Clock className="w-6 h-6" />
                      Reminders
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      {loadingReminders ? (
                        <motion.div 
                          className="space-y-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-24 bg-green-100" />
                            <Skeleton className="h-6 w-8 bg-green-200 rounded-full" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-16 bg-green-50" />
                            <Skeleton className="h-3 w-12 bg-green-50" />
                          </div>
                          <motion.div 
                            className="flex items-center justify-center py-2"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-600 border-t-transparent"></div>
                            <span className="text-xs text-green-600 ml-2 font-medium">Loading reminders...</span>
                          </motion.div>
                        </motion.div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Active Reminders</span>
                            <span className="text-lg font-bold text-green-600">{reminders.total}</span>
                          </div>
                          {reminders.urgent.length > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-red-600">🚨 Urgent</span>
                              <span className="text-sm font-semibold text-red-600">{reminders.urgent.length}</span>
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            {reminders.total > 0 ? 'Click to view all reminders' : 'No active reminders'}
                          </p>
                        </div>
                      )}
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link href="/teachers/reminders">
                        <Button 
                          className="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>
                              View Reminders {reminders.total > 0 ? `(${reminders.total})` : ''}
                            </span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </Button>
                      </Link>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ID Calendar */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 overflow-hidden group hover:shadow-3xl transition-all duration-500 h-full">
                  <CardHeader className="text-center pb-4 bg-gradient-to-r from-purple-50 to-violet-50">
                    <CardTitle className="text-xl text-blue-700 flex items-center justify-center gap-2">
                      <Calendar className="w-6 h-6" />
                      ID Calendar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-2 text-center font-semibold">2024 Fall Semester Calendar</p>
                    <p className="text-gray-500 mb-4 text-center text-sm">
                      View important dates and add to your personal calendar
                    </p>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link href="/teachers/calendar">
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                          <Calendar className="w-4 h-4 mr-2" />
                          Open Calendar
                          <ArrowRight className="w-3 h-3 ml-auto group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Message Board */}
              <motion.div 
                variants={itemVariants}
                animate={successAnimationMessages ? {
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0],
                  boxShadow: [
                    "0 10px 25px rgba(59, 130, 246, 0.15)",
                    "0 20px 40px rgba(59, 130, 246, 0.3)",
                    "0 10px 25px rgba(59, 130, 246, 0.15)"
                  ]
                } : {}}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 overflow-hidden group hover:shadow-3xl transition-all duration-500 h-full relative">
                  {/* Success celebration overlay */}
                  {successAnimationMessages && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 pointer-events-none z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5 }}
                    />
                  )}
                  <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-50 to-cyan-50">
                    <CardTitle className="text-xl text-blue-700 flex items-center justify-center gap-2">
                      <MessageSquare className="w-6 h-6" />
                      25-26 School Year Message Board
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      {loadingMessages ? (
                        <motion.div 
                          className="space-y-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-20 bg-blue-100" />
                            <Skeleton className="h-6 w-8 bg-blue-200 rounded-full" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-14 bg-blue-50" />
                            <Skeleton className="h-3 w-16 bg-blue-50" />
                          </div>
                          <motion.div 
                            className="flex items-center justify-center py-2"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                            <span className="text-xs text-blue-600 ml-2 font-medium">Loading messages...</span>
                          </motion.div>
                        </motion.div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Active Posts</span>
                            <span className="text-lg font-bold text-blue-600">{messages.total}</span>
                          </div>
                          {messages.totalImportant > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-red-600">🚨 Important</span>
                              <span className="text-sm font-semibold text-red-600">{messages.totalImportant}</span>
                            </div>
                          )}
                          {messages.pinned.length > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-amber-600">📌 Pinned</span>
                              <span className="text-sm font-semibold text-amber-600">{messages.pinned.length}</span>
                            </div>
                          )}
                          {Object.keys(messages.byGroup).length > 0 && (
                            <div className="text-xs mt-3">
                              <div className="space-y-2">
                                {Object.entries(messages.byGroup).map(([group, posts]) => {
                                  const colors = groupColors[group] || groupColors['general']
                                  const isExpanded = expandedGroups[group] || false
                                  
                                  return (
                                    <div key={group} className="border rounded-lg overflow-hidden">
                                      <button
                                        onClick={() => setExpandedGroups(prev => ({ ...prev, [group]: !isExpanded }))}
                                        className={`w-full px-3 py-2 ${colors.bg} ${colors.text} flex items-center justify-between hover:opacity-80 transition-opacity`}
                                      >
                                        <span className="font-medium text-sm">{colors.label}</span>
                                        <div className="flex items-center gap-2">
                                          <span className="bg-white/80 px-2 py-1 rounded-full text-xs font-semibold">
                                            {posts.length}
                                          </span>
                                          <span className="text-lg">
                                            {isExpanded ? '▼' : '▶'}
                                          </span>
                                        </div>
                                      </button>
                                      {isExpanded && (
                                        <div className="bg-white border-t">
                                          {posts.slice(0, 3).map((post, index) => (
                                            <div key={post.id} className="px-3 py-2 border-b last:border-b-0">
                                              <div className="flex items-start gap-2">
                                                {post.isImportant && (
                                                  <span className="text-red-500 text-xs">🚨</span>
                                                )}
                                                {post.isPinned && (
                                                  <span className="text-amber-500 text-xs">📌</span>
                                                )}
                                                <div className="flex-1">
                                                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                                    {post.title}
                                                  </p>
                                                  <p className="text-xs text-gray-500 mt-1">
                                                    {post.author?.displayName || 'Anonymous'} • {new Date(post.createdAt).toLocaleDateString()}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                          {posts.length > 3 && (
                                            <div className="px-3 py-2 text-center">
                                              <span className="text-xs text-gray-500">
                                                +{posts.length - 3} more messages...
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            {messages.total > 0 ? 'Staff discussions and announcements from various teams' : 'No active posts'}
                          </p>
                        </div>
                      )}
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link href="/teachers/messages">
                        <Button 
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            <span>
                              View Messages {messages.total > 0 ? `(${messages.total})` : ''}
                            </span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </Button>
                      </Link>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Essential Documents Section */}
        <motion.section
          id="documents"
          className="py-20 bg-white/50 backdrop-blur-sm"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">ESSENTIAL DOCUMENTS AND SITES</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Access important documents and resources organized by department
              </p>
            </motion.div>

            <motion.div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto" variants={containerVariants}>
              {Object.entries(essentialDocuments).map(([key, doc]) => {
                const IconComponent = doc.icon;
                return (
                  <motion.div key={key} variants={itemVariants}>
                    <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0 overflow-hidden group hover:shadow-2xl transition-all duration-500 h-full">
                      <CardHeader className={`bg-gradient-to-r ${doc.color} text-white`}>
                        <CardTitle className="flex items-center gap-3 text-2xl">
                          <IconComponent className="h-7 w-7" />
                          {doc.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <p className="text-gray-600 mb-6">{doc.description}</p>
                        <motion.div whileHover={{ scale: 1.02 }}>
                          <Button 
                            onClick={() => window.open(doc.googleDocUrl, '_blank')}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Open Google Doc
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}

            </motion.div>
          </div>
        </motion.section>

        {/* Teachers' Bulletin Section */}
        <motion.section
          id="bulletin"
          className="py-20 bg-gradient-to-br from-amber-50 to-orange-50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">TEACHERS' BULLETIN</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Share announcements, activities, and resources with your colleagues
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
              <Card className="bg-white/90 backdrop-blur-lg shadow-2xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-amber-400/50 to-orange-500/50"
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
                    <Megaphone className="h-8 w-8" />
                    Teachers' Announcements
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">What You Can Share</h4>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Upcoming activities and events</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Professional development opportunities</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Resource sharing and recommendations</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Social gatherings and team building</span>
                        </li>
                      </ul>
                    </div>
                    <div className="flex flex-col justify-center">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          className="w-full bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-4 text-lg mb-4"
                          onClick={() => {
                            // Scroll to message board section or show message board content
                            document.getElementById('information')?.scrollIntoView({ behavior: 'smooth' })
                          }}
                        >
                          <Megaphone className="w-5 h-5 mr-2" />
                          View Message Board
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                          onClick={() => {
                            const mailto = 'mailto:admin@kcislk.ntpc.edu.tw?subject=Teacher Announcement Request&body=Please describe your announcement or activity that you would like to share with other teachers...'
                            window.open(mailto, '_blank')
                          }}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Request Announcement
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.section>

        {/* Parents' Corner Link Section */}
        <motion.section
          className="py-16 bg-gradient-to-br from-purple-50 to-pink-50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect with Parents</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Access the Parents' Corner to stay informed about parent communications and resources
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
              <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0 overflow-hidden">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <LinkIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Parents' Corner</h3>
                  <p className="text-gray-600 mb-6">
                    View parent resources, newsletters, and communication materials to better understand the parent
                    perspective and enhance home-school collaboration.
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/parents">
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Visit Parents' Corner
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
        className="bg-gradient-to-r from-blue-800 to-blue-900 text-white py-12 relative overflow-hidden"
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
                <GraduationCap className="w-5 h-5" />
                Contact Support
              </h3>
              <div className="space-y-2 text-blue-200">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>teachers@kcislk.ntpc.edu.tw</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>Extension: 5678</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <h3 className="text-xl font-bold mb-4">Quick Access</h3>
              <div className="space-y-2">
                {["Information Hub", "Essential Documents", "Teachers' Bulletin", "Feedback Form"].map(
                  (link, index) => (
                    <motion.a
                      key={link}
                      href="#"
                      className="block text-blue-200 hover:text-white transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      {link}
                    </motion.a>
                  ),
                )}
              </div>
            </motion.div>

            <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <h3 className="text-xl font-bold mb-4">Professional Hub</h3>
              <p className="text-blue-200 italic leading-relaxed">
                "Empowering educators through seamless collaboration, comprehensive resources, and continuous
                professional growth."
              </p>
            </motion.div>
          </div>

          <motion.div
            className="text-center pt-8 border-t border-blue-700"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p>&copy; 2025 ESID Teachers Hub, KCIS. All rights reserved.</p>
            <p className="text-blue-300 text-sm mt-2">Professional Excellence Through Collaboration</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  )
}
