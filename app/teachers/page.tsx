"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "lucide-react"
import Link from "next/link"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"

export default function TeachersPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const { scrollY } = useScroll()
  const heroRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: true })

  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

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
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
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

            <nav className="hidden md:flex items-center space-x-8">
              {[
                { name: "Home", href: "/teachers", active: true },
                { name: "Information", href: "#information" },
                { name: "Documents", href: "#documents" },
                { name: "Bulletin", href: "#bulletin" },
                { name: "Parents' Corner", href: "/" },
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
          </div>
        </div>
      </motion.header>

      <main>
        {/* Hero Section */}
        <section ref={heroRef} className="relative py-16 overflow-hidden">
          <motion.div className="container mx-auto px-4 text-center relative z-10" style={{ y: y1, opacity }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isHeroInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.h2
                className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-800 mb-6"
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
                ESID TEACHERS
              </motion.h2>
              <motion.p
                className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8"
                initial={{ y: 30, opacity: 0 }}
                animate={isHeroInView ? { y: 0, opacity: 1 } : {}}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Your comprehensive professional hub for resources, collaboration, and communication
              </motion.p>
            </motion.div>

            <motion.div
              className="flex justify-center gap-4 mt-8"
              initial={{ y: 30, opacity: 0 }}
              animate={isHeroInView ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                  Quick Access
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-transparent"
                >
                  Feedback
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-xl"
            variants={floatingVariants}
            animate="animate"
          />
          <motion.div
            className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-green-400/30 to-teal-400/30 rounded-full blur-xl"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 1 }}
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
                Share your thoughts, suggestions, or encouragement with the management team
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
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">How to Submit Feedback</h4>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Click the feedback form link to access Google Forms</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Submit anonymously or include your name</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Management team will review and respond appropriately</span>
                        </li>
                      </ul>
                    </div>
                    <div className="flex flex-col justify-center">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button className="w-full bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-4 text-lg">
                          <ExternalLink className="w-5 h-5 mr-2" />
                          Open Feedback Form
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
              <motion.div variants={itemVariants}>
                <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 overflow-hidden group hover:shadow-3xl transition-all duration-500 h-full">
                  <CardHeader className="text-center pb-4 bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardTitle className="text-xl text-blue-700 flex items-center justify-center gap-2">
                      <Clock className="w-6 h-6" />
                      Reminders
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4 text-center">
                      Important reminders and notices for all teaching staff
                    </p>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                        <FileText className="w-4 h-4 mr-2" />
                        View Reminders
                      </Button>
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
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                        <Calendar className="w-4 h-4 mr-2" />
                        Open Calendar
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Message Board */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 overflow-hidden group hover:shadow-3xl transition-all duration-500 h-full">
                  <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-50 to-cyan-50">
                    <CardTitle className="text-xl text-blue-700 flex items-center justify-center gap-2">
                      <MessageSquare className="w-6 h-6" />
                      Message Board
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-2 text-center font-semibold">24-25 School Year</p>
                    <p className="text-gray-500 mb-4 text-center text-sm">Staff discussions and announcements</p>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        View Messages
                      </Button>
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
              {/* Academic Affairs */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0 overflow-hidden group hover:shadow-2xl transition-all duration-500 h-full">
                  <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <BookOpen className="h-7 w-7" />
                      Academic Affairs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-6">Curriculum guidelines, assessment tools, and academic policies</p>
                    <div className="space-y-3">
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <FileText className="w-4 h-4 mr-2" />
                          Curriculum Standards
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <FileText className="w-4 h-4 mr-2" />
                          Assessment Guidelines
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <FileText className="w-4 h-4 mr-2" />
                          Academic Policies
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Foreign Affairs */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0 overflow-hidden group hover:shadow-2xl transition-all duration-500 h-full">
                  <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Globe className="h-7 w-7" />
                      Foreign Affairs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-6">
                      International partnerships, exchange programs, and external communications
                    </p>
                    <div className="space-y-3">
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <Globe className="w-4 h-4 mr-2" />
                          Partnership Programs
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <Users className="w-4 h-4 mr-2" />
                          Exchange Guidelines
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <Mail className="w-4 h-4 mr-2" />
                          Communication Templates
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Classroom Affairs */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0 overflow-hidden group hover:shadow-2xl transition-all duration-500 h-full">
                  <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <School className="h-7 w-7" />
                      Classroom Affairs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-6">Classroom management, teaching resources, and student affairs</p>
                    <div className="space-y-3">
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <School className="w-4 h-4 mr-2" />
                          Management Guidelines
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Teaching Resources
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <Users className="w-4 h-4 mr-2" />
                          Student Support
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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
                        <Button className="w-full bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-4 text-lg mb-4">
                          <Megaphone className="w-5 h-5 mr-2" />
                          View Bulletin Board
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Post Announcement
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
                    <Link href="/">
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
