"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, BookOpen, Calendar, Bell, Mail, Phone, Sparkles, ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { Announcement } from "@/lib/types"
import MobileNav from "@/components/ui/mobile-nav"
import { useAuth } from "@/hooks/useAuth"

/**
 * Portal Homepage Component - KCISLK ESID Info Hub
 * 
 * @description Main entry point for KCISLK ESID Info Hub, providing role-based navigation and quick access
 * @features Modern portal design, role selection cards, responsive layout, smooth animations
 * @author Claude Code | Generated with love for KCISLK ESID Info Hub
 */
export default function PortalHomepage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [latestAnnouncements, setLatestAnnouncements] = useState<Announcement[]>([])
  
  // Authentication check
  const { user, isLoading: authLoading, redirectToLogin } = useAuth()
  
  const { scrollY } = useScroll()
  const heroRef = useRef(null)
  
  // Parallax effects
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      redirectToLogin('/')
    }
  }, [authLoading, user, redirectToLogin])

  useEffect(() => {
    if (user) {
      setIsLoaded(true)
      fetchLatestAnnouncements()
    }
  }, [user])

  // Fetch latest announcements for quick preview
  const fetchLatestAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements?status=published&limit=3&targetAudience=parents')
      const data = await response.json()
      
      if (data.success) {
        const now = new Date()
        const validAnnouncements = data.data.filter((announcement: Announcement) => 
          !announcement.expiresAt || new Date(announcement.expiresAt) > now
        )
        setLatestAnnouncements(validAnnouncements.slice(0, 2)) // Only show top 2
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
  }

  const cardVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.95 },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    },
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-lg text-gray-600">載入中...</p>
        </motion.div>
      </div>
    )
  }

  // Not authenticated - show nothing (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 30,
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
                  KCISLK ESID
                </h1>
                <p className="text-xs text-gray-500">Info Hub Portal</p>
              </div>
            </motion.div>

            {/* Mobile Navigation */}
            <MobileNav />
          </div>
        </div>
      </motion.header>

      <main>
        {/* Hero Section */}
        <section ref={heroRef} className="relative py-16 md:py-24 overflow-hidden">
          <motion.div className="container mx-auto px-4 text-center relative z-10" style={{ y: y1, opacity }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.h1
                className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 mb-4"
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
                Welcome to KCISLK ESID
              </motion.h1>
              <motion.h2
                className="text-2xl md:text-3xl font-light text-gray-700 mb-6"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Info Hub Portal
              </motion.h2>
              <motion.p
                className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Your gateway to our school community. Choose your role below to access relevant resources and information.
              </motion.p>
            </motion.div>
          </motion.div>
        </section>

        {/* Role Selection Cards */}
        <motion.section
          className="py-16 relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Choose Your Portal
              </h2>
              <p className="text-lg text-gray-600">
                Select your role to access personalized content and resources
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
              variants={containerVariants}
            >
              {/* Parents Portal */}
              <motion.div variants={cardVariants}>
                <Link href="/parents" className="block h-full">
                  <Card className="h-full bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden group hover:shadow-2xl transition-all duration-500 cursor-pointer">
                    <CardHeader className="text-center pb-4 bg-gradient-to-br from-purple-50 to-pink-50 group-hover:from-purple-100 group-hover:to-pink-100 transition-all duration-500">
                      <motion.div
                        className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500"
                      >
                        <Users className="w-8 h-8 text-white" />
                      </motion.div>
                      <CardTitle className="text-2xl text-purple-700 group-hover:text-purple-900 transition-colors">
                        Parents Portal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex-1">
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Access announcements, ESID news, monthly newsletters, and parent-specific resources.
                      </p>
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          Important Announcements
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                          ESID News & Updates
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          Monthly Newsletters
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                          Squad Information
                        </div>
                      </div>
                      <motion.div 
                        className="flex items-center justify-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all duration-300"
                        whileHover={{ x: 5 }}
                      >
                        Enter Parents Corner
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>

              {/* Teachers Portal */}
              <motion.div variants={cardVariants}>
                <Link href="/teachers" className="block h-full">
                  <Card className="h-full bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden group hover:shadow-2xl transition-all duration-500 cursor-pointer">
                    <CardHeader className="text-center pb-4 bg-gradient-to-br from-blue-50 to-cyan-50 group-hover:from-blue-100 group-hover:to-cyan-100 transition-all duration-500">
                      <motion.div
                        className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500"
                      >
                        <GraduationCap className="w-8 h-8 text-white" />
                      </motion.div>
                      <CardTitle className="text-2xl text-blue-700 group-hover:text-blue-900 transition-colors">
                        Teachers Portal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex-1">
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Teacher resources, lesson plans, administrative tools, and professional development materials.
                      </p>
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          Lesson Plans & Resources
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          Administrative Tools
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          Professional Development
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          Staff Communications
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-4">
                        <Sparkles className="w-3 h-3" />
                        Login Required
                      </div>
                      <motion.div 
                        className="flex items-center justify-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all duration-300"
                        whileHover={{ x: 5 }}
                      >
                        Access Teacher Resources
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>

              {/* Resources Hub */}
              <motion.div variants={cardVariants}>
                <Link href="/resources" className="block h-full">
                  <Card className="h-full bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden group hover:shadow-2xl transition-all duration-500 cursor-pointer">
                    <CardHeader className="text-center pb-4 bg-gradient-to-br from-green-50 to-emerald-50 group-hover:from-green-100 group-hover:to-emerald-100 transition-all duration-500">
                      <motion.div
                        className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500"
                      >
                        <BookOpen className="w-8 h-8 text-white" />
                      </motion.div>
                      <CardTitle className="text-2xl text-green-700 group-hover:text-green-900 transition-colors">
                        Resources Hub
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex-1">
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Educational resources, documents, learning materials, and helpful links for all community members.
                      </p>
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          Educational Resources
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                          Learning Materials
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          Document Library
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                          Helpful Links
                        </div>
                      </div>
                      <motion.div 
                        className="flex items-center justify-center gap-2 text-green-600 font-semibold group-hover:gap-3 transition-all duration-300"
                        whileHover={{ x: 5 }}
                      >
                        Browse Resources
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Quick Access Section */}
        <motion.section
          className="py-16 bg-white/50 backdrop-blur-sm"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Access</h2>
              <p className="text-lg text-gray-600">
                Frequently used resources and important updates
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Events Calendar */}
              <motion.div variants={itemVariants}>
                <Link href="/events">
                  <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 overflow-hidden group hover:shadow-xl transition-all duration-500 cursor-pointer">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 group-hover:from-orange-100 group-hover:to-red-100 transition-all duration-300">
                      <CardTitle className="flex items-center gap-3 text-orange-700 group-hover:text-orange-900 transition-colors">
                        <Calendar className="w-6 h-6" />
                        Upcoming Events
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-gray-600 mb-4">
                        Stay updated with school events, holidays, and important dates.
                      </p>
                      <motion.div 
                        className="flex items-center gap-2 text-orange-600 font-semibold group-hover:gap-3 transition-all duration-300"
                        whileHover={{ x: 5 }}
                      >
                        View Calendar
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>

              {/* Latest Announcements */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                    <CardTitle className="flex items-center gap-3 text-purple-700">
                      <Bell className="w-6 h-6" />
                      Latest Announcements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {latestAnnouncements.length > 0 ? (
                      <div className="space-y-3 mb-4">
                        {latestAnnouncements.map((announcement) => (
                          <div key={announcement.id} className="border-l-4 border-purple-400 pl-3">
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">
                              {announcement.title}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {announcement.summary?.slice(0, 100)}...
                            </p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {announcement.priority} priority
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 mb-4">
                        No recent announcements at this time.
                      </p>
                    )}
                    <Link href="/parents">
                      <motion.div 
                        className="flex items-center gap-2 text-purple-600 font-semibold hover:gap-3 transition-all duration-300"
                        whileHover={{ x: 5 }}
                      >
                        View All Announcements
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
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
                Contact Information
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
              <h3 className="text-xl font-bold mb-4">Quick Navigation</h3>
              <div className="space-y-2">
                {[
                  { name: "Parents Portal", href: "/parents" },
                  { name: "Teachers Portal", href: "/teachers" },
                  { name: "Resources Hub", href: "/resources" },
                  { name: "Events Calendar", href: "/events" }
                ].map((link, index) => (
                  <motion.div key={link.name} whileHover={{ x: 5 }}>
                    <Link
                      href={link.href}
                      className="block text-purple-200 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
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