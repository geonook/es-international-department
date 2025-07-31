"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Download, ExternalLink, Play, FileText, Users, Search, Sparkles, ChevronDown } from "lucide-react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"

/**
 * 資源頁面組件 - ES 國際部學習資源中心
 * Resources Page Component - ES International Department Learning Resource Center
 * 
 * @description 提供各年級學習資源，包括 PDF 教材、影片內容、互動工具和外部學習平台
 * @features 分級學習資源、多種資源類型、下載功能、外部平台整合
 * @author Claude Code | Generated for ES International Department
 */
export default function ResourcesPage() {
  // 滾動視差效果 | Scroll parallax effect
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])

  const g1g2Resources = [
    {
      title: "myView Transition Materials",
      description: "Comprehensive transition learning materials in PDF format",
      type: "PDF",
      icon: FileText,
      link: "#",
    },
    {
      title: "Reading Buddies Program",
      description: "Interactive reading partnership program with video resources",
      type: "Video/Website",
      icon: Play,
      link: "#",
    },
    {
      title: "The Five Components of Reading",
      description: "Core reading skills explanation with Google Drive resources",
      type: "Google Drive",
      icon: ExternalLink,
      link: "#",
    },
    {
      title: "Weekly Reading Challenge",
      description: "Weekly texts and quizzes for reading comprehension",
      type: "Interactive",
      icon: BookOpen,
      link: "#",
    },
    {
      title: "Building Background Knowledge",
      description: "Language learning resources and daily reading content via ReadWorks",
      type: "External Platform",
      icon: ExternalLink,
      link: "#",
    },
  ]

  const resourceCategories = [
    {
      grade: "Grades 1-2",
      color: "from-blue-500 to-blue-600",
      resources: g1g2Resources,
    },
    {
      grade: "Grades 3-4",
      color: "from-green-500 to-green-600",
      resources: [
        {
          title: "Advanced Reading Comprehension",
          description: "Enhanced reading materials for intermediate learners",
          type: "PDF",
          icon: FileText,
          link: "#",
        },
        {
          title: "Writing Workshop Resources",
          description: "Creative and academic writing support materials",
          type: "Google Drive",
          icon: ExternalLink,
          link: "#",
        },
      ],
    },
    {
      grade: "Grades 5-6",
      color: "from-purple-500 to-purple-600",
      resources: [
        {
          title: "Critical Thinking Materials",
          description: "Advanced analytical and critical thinking resources",
          type: "Interactive",
          icon: BookOpen,
          link: "#",
        },
        {
          title: "Research Project Guides",
          description: "Comprehensive guides for independent research projects",
          type: "PDF",
          icon: FileText,
          link: "#",
        },
      ],
    },
  ]

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -180, -360],
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
            <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.05 }}>
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
                { name: "Home", href: "/" },
                { name: "Events", href: "/events" },
                { name: "Resources", href: "/resources", active: true, hasDropdown: true },
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
              <motion.div whileHover={{ scale: 1.1 }}>
                <Search className="h-5 w-5 text-gray-600 cursor-pointer hover:text-purple-600 transition-colors" />
              </motion.div>
            </nav>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          className="text-center mb-16"
          style={{ y: y1 }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-6xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6"
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
            Learning Resources
          </motion.h2>
          <motion.p
            className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Supporting parents, teachers, and students with comprehensive learning resources designed to enhance student
            development and academic success across all grade levels.
          </motion.p>
        </motion.div>

        {/* Mission Statement */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Card className="bg-white/90 backdrop-blur-lg shadow-2xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-400/50 to-purple-500/50"
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
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Users className="h-8 w-8" />
                </motion.div>
                Our Resource Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <motion.p
                className="text-gray-700 text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Our resource center is dedicated to providing comprehensive support for parents, teachers, and students.
                We offer carefully curated learning materials that align with our curriculum standards and support
                student development across all academic areas. From foundational reading skills to advanced critical
                thinking resources, our materials are designed to meet diverse learning needs and promote academic
                excellence.
              </motion.p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Resource Categories by Grade */}
        {resourceCategories.map((category, categoryIndex) => (
          <motion.section
            key={categoryIndex}
            className="mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants}>
              <Card className="bg-white/90 backdrop-blur-lg shadow-2xl border-0 overflow-hidden">
                <CardHeader className={`bg-gradient-to-r ${category.color} text-white relative overflow-hidden`}>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />
                  <CardTitle className="flex items-center gap-3 text-3xl relative z-10">
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <BookOpen className="h-8 w-8" />
                    </motion.div>
                    {category.grade} Resources
                  </CardTitle>
                  <CardDescription className="text-white/90 text-lg relative z-10">
                    Specialized learning materials for {category.grade.toLowerCase()} students
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <motion.div
                    className="grid gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                  >
                    {category.resources.map((resource, resourceIndex) => (
                      <motion.div key={resourceIndex} variants={itemVariants}>
                        <Card className="border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 group hover:shadow-xl">
                          <CardContent className="p-8">
                            <div className="flex items-start gap-6">
                              <motion.div
                                className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl group-hover:from-purple-100 group-hover:to-purple-200 transition-all duration-300"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                              >
                                <resource.icon className="h-8 w-8 text-gray-600 group-hover:text-purple-600 transition-colors" />
                              </motion.div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                  <h4 className="text-xl font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                                    {resource.title}
                                  </h4>
                                  <motion.div whileHover={{ scale: 1.05 }}>
                                    <Badge variant="outline" className="ml-3 text-sm py-1 px-3">
                                      {resource.type}
                                    </Badge>
                                  </motion.div>
                                </div>
                                <p className="text-gray-600 mb-6 text-lg leading-relaxed">{resource.description}</p>
                                <div className="flex gap-3">
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="gap-2 bg-transparent hover:bg-purple-50"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                      Access Resource
                                    </Button>
                                  </motion.div>
                                  {resource.type === "PDF" && (
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-2 bg-transparent hover:bg-green-50"
                                      >
                                        <Download className="h-4 w-4" />
                                        Download
                                      </Button>
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.section>
        ))}

        {/* Featured Resources */}
        <motion.section
          className="mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-white/90 backdrop-blur-lg shadow-2xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-orange-400/50 to-red-500/50"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                />
                <CardTitle className="text-3xl relative z-10">Featured Learning Platforms</CardTitle>
                <CardDescription className="text-orange-100 text-lg relative z-10">
                  External platforms and tools that enhance our curriculum
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <motion.div
                  className="grid md:grid-cols-2 gap-8"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                >
                  <motion.div variants={itemVariants}>
                    <motion.div
                      className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border-l-4 border-orange-400 group hover:shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.02, y: -5 }}
                    >
                      <h4 className="font-semibold text-orange-900 mb-3 text-xl">ReadWorks</h4>
                      <p className="text-orange-800 mb-4 leading-relaxed">
                        Comprehensive reading comprehension platform with thousands of articles and passages.
                      </p>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="sm" variant="outline" className="gap-2 bg-transparent hover:bg-orange-100">
                          <ExternalLink className="h-4 w-4" />
                          Visit ReadWorks
                        </Button>
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <motion.div
                      className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-l-4 border-blue-400 group hover:shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.02, y: -5 }}
                    >
                      <h4 className="font-semibold text-blue-900 mb-3 text-xl">Google Drive Resources</h4>
                      <p className="text-blue-800 mb-4 leading-relaxed">
                        Centralized access to all our digital learning materials and resources.
                      </p>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="sm" variant="outline" className="gap-2 bg-transparent hover:bg-blue-100">
                          <ExternalLink className="h-4 w-4" />
                          Access Drive
                        </Button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>

        {/* Resource Categories Overview */}
        <motion.section
          className="mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-white/90 backdrop-blur-lg shadow-2xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <CardTitle className="text-3xl">Resource Categories</CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  Quick overview of available resource types
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <motion.div
                  className="grid grid-cols-2 md:grid-cols-4 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                >
                  {[
                    { icon: FileText, title: "PDF Materials", desc: "Downloadable guides" },
                    { icon: Play, title: "Video Content", desc: "Educational videos" },
                    { icon: ExternalLink, title: "External Links", desc: "Online platforms" },
                    { icon: BookOpen, title: "Interactive Tools", desc: "Engaging activities" },
                  ].map((item, index) => (
                    <motion.div key={index} variants={itemVariants} className="text-center group">
                      <motion.div
                        className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl group-hover:from-purple-50 group-hover:to-purple-100 transition-all duration-300 hover:shadow-lg"
                        whileHover={{ scale: 1.05, y: -5 }}
                      >
                        <motion.div
                          className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center group-hover:from-purple-600 group-hover:to-purple-800 transition-all duration-300"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <item.icon className="h-8 w-8 text-white" />
                        </motion.div>
                        <h5 className="font-medium text-gray-900 mb-2 text-lg group-hover:text-purple-700 transition-colors">
                          {item.title}
                        </h5>
                        <p className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors">
                          {item.desc}
                        </p>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer
        className="bg-gradient-to-r from-purple-800 to-purple-900 text-white py-12 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.p initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            &copy; 2025 ES International Department, KCIS. All rights reserved.
          </motion.p>
          <motion.p
            className="text-purple-300 text-sm mt-2"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Excellence in International Education
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
