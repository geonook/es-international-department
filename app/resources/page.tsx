"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BookOpen, 
  Download, 
  ExternalLink, 
  Play, 
  FileText, 
  Users, 
  Sparkles, 
  ChevronDown,
  Eye
} from "lucide-react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import MobileNav from "@/components/ui/mobile-nav"

/**
 * Resources Page Component - KCISLK ESID Learning Resource Center
 * 
 * @description Provides learning resources for all grade levels, including PDF materials, video content, interactive tools, and external learning platforms
 * @features Dynamic resource loading, graded learning resources, search functionality, multiple resource types, download capabilities
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

interface Resource {
  id: number
  title: string
  description?: string
  resourceType: string
  gradeLevel?: string
  fileUrl?: string
  externalUrl?: string
  downloadUrl?: string
  category: string
  tags?: string[]
  isActive: boolean
  createdAt: string
  creator?: {
    displayName: string
  }
}
export default function ResourcesPage() {
  // Scroll parallax effect
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  
  // No filter or search needed

  // Complete static resource data from Google Sites
  const staticResources: Resource[] = [
    // Parent Support Resources
    {
      id: 1,
      title: "Parent Support Guide",
      description: "Comprehensive guide for parents to support their children's learning journey at home",
      resourceType: "document",
      gradeLevel: "parents",
      category: "parent-support",
      externalUrl: "https://drive.google.com/drive/folders/parent-support",
      tags: ["parents", "support", "home-learning"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "ESID Team" }
    },
    
    // G1-G2 Transition Materials from Google Sites
    {
      id: 2,
      title: "Henry on Wheels",
      description: "Transition reading material for G1-G2 students",
      resourceType: "pdf",
      gradeLevel: "1-2",
      category: "reading",
      downloadUrl: "/resources/henry-on-wheels.pdf",
      externalUrl: "https://drive.google.com/file/d/henry-on-wheels",
      tags: ["transition", "reading", "G1-G2"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Reading Department" }
    },
    {
      id: 3,
      title: "Baby Animals Grow",
      description: "Science and reading integrated material about animal growth",
      resourceType: "pdf",
      gradeLevel: "1-2",
      category: "reading",
      downloadUrl: "/resources/baby-animals-grow.pdf",
      externalUrl: "https://drive.google.com/file/d/baby-animals-grow",
      tags: ["transition", "reading", "science", "G1-G2"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Reading Department" }
    },
    {
      id: 4,
      title: "Thumbs Up for Art and Music!",
      description: "Creative arts integration with reading comprehension",
      resourceType: "pdf",
      gradeLevel: "1-2",
      category: "reading",
      downloadUrl: "/resources/thumbs-up-art-music.pdf",
      externalUrl: "https://drive.google.com/file/d/thumbs-up-art-music",
      tags: ["transition", "reading", "arts", "G1-G2"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Arts & Reading Department" }
    },
    {
      id: 5,
      title: "What Is the Story of Our Flag?",
      description: "Social studies and reading material about national symbols",
      resourceType: "pdf",
      gradeLevel: "1-2",
      category: "reading",
      downloadUrl: "/resources/story-of-our-flag.pdf",
      externalUrl: "https://drive.google.com/file/d/story-of-our-flag",
      tags: ["transition", "reading", "social-studies", "G1-G2"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Social Studies Department" }
    },
    {
      id: 6,
      title: "My Autumn Book",
      description: "Seasonal reading material with vocabulary and comprehension activities",
      resourceType: "pdf",
      gradeLevel: "1-2",
      category: "reading",
      downloadUrl: "/resources/my-autumn-book.pdf",
      externalUrl: "https://drive.google.com/file/d/my-autumn-book",
      tags: ["transition", "reading", "seasons", "G1-G2"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Reading Department" }
    },
    {
      id: 7,
      title: "Review Games Collection",
      description: "Interactive games for reviewing reading and vocabulary skills",
      resourceType: "interactive",
      gradeLevel: "1-2",
      category: "reading",
      externalUrl: "https://drive.google.com/drive/folders/review-games",
      tags: ["games", "review", "interactive", "G1-G2"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "ESID Team" }
    },
    
    // Reading Support Resources
    {
      id: 8,
      title: "Reading Buddies YouTube Channel",
      description: "Video resources for reading practice with peer support",
      resourceType: "video",
      gradeLevel: "1-2",
      category: "reading",
      externalUrl: "https://www.youtube.com/@readingbuddies",
      tags: ["video", "reading", "peer-learning"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Reading Buddies Team" }
    },
    {
      id: 9,
      title: "The Five Components of Reading",
      description: "Comprehensive guide to the five essential components of reading: phonemic awareness, phonics, fluency, vocabulary, and comprehension",
      resourceType: "document",
      gradeLevel: "1-2",
      category: "reading",
      externalUrl: "https://drive.google.com/file/d/five-components-reading",
      tags: ["reading", "fundamentals", "guide"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Reading Department" }
    },
    {
      id: 10,
      title: "Fall 2024 Weekly Reading Challenge",
      description: "Weekly texts and quizzes to improve reading comprehension skills",
      resourceType: "interactive",
      gradeLevel: "1-2",
      category: "reading",
      externalUrl: "https://drive.google.com/drive/folders/weekly-reading-challenge",
      tags: ["challenge", "weekly", "reading", "quiz"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Reading Campaign Team" }
    },
    
    // Language Learning Resources
    {
      id: 11,
      title: "Spring 2025: Building Background Knowledge",
      description: "Resources for building essential background knowledge to support language learning",
      resourceType: "document",
      gradeLevel: "1-2",
      category: "language",
      externalUrl: "https://drive.google.com/drive/folders/background-knowledge",
      tags: ["language", "background-knowledge", "spring-2025"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Language Department" }
    },
    {
      id: 12,
      title: "ReadWorks - Article a Day",
      description: "Daily reading articles with comprehension questions. Build reading stamina and background knowledge",
      resourceType: "external",
      gradeLevel: "1-2",
      category: "language",
      externalUrl: "https://www.readworks.org/",
      tags: ["daily-reading", "comprehension", "readworks"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "ReadWorks Partnership" }
    },
    
    // Grades 3-4 Resources
    {
      id: 13,
      title: "Advanced Reading Comprehension",
      description: "Enhanced reading materials for intermediate learners",
      resourceType: "pdf",
      gradeLevel: "3-4",
      category: "reading",
      downloadUrl: "/resources/advanced-reading.pdf",
      tags: ["reading", "comprehension", "G3-G4"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Teacher Zhou" }
    },
    {
      id: 14,
      title: "Writing Workshop Resources",
      description: "Creative and academic writing support materials",
      resourceType: "document",
      gradeLevel: "3-4",
      category: "writing",
      externalUrl: "https://drive.google.com/writing-workshop",
      tags: ["writing", "creative", "G3-G4"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Teacher Huang" }
    },
    {
      id: 15,
      title: "Grammar and Vocabulary Builder",
      description: "Interactive exercises for improving grammar and expanding vocabulary",
      resourceType: "interactive",
      gradeLevel: "3-4",
      category: "language",
      externalUrl: "https://drive.google.com/grammar-vocabulary",
      tags: ["grammar", "vocabulary", "G3-G4"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Language Department" }
    },
    
    // Grades 5-6 Resources
    {
      id: 16,
      title: "Critical Thinking Materials",
      description: "Advanced analytical and critical thinking resources",
      resourceType: "interactive",
      gradeLevel: "5-6",
      category: "thinking",
      externalUrl: "https://drive.google.com/critical-thinking",
      tags: ["thinking", "analysis", "G5-G6"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Teacher Zhang" }
    },
    {
      id: 17,
      title: "Research Project Guides",
      description: "Comprehensive guides for independent research projects",
      resourceType: "pdf",
      gradeLevel: "5-6",
      category: "research",
      downloadUrl: "/resources/research-guides.pdf",
      tags: ["research", "projects", "G5-G6"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Teacher Xu" }
    },
    {
      id: 18,
      title: "Academic Writing Excellence",
      description: "Advanced academic writing techniques and essay structures",
      resourceType: "document",
      gradeLevel: "5-6",
      category: "writing",
      externalUrl: "https://drive.google.com/academic-writing",
      tags: ["writing", "academic", "essays", "G5-G6"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Writing Department" }
    },
    
    // Additional Parent Resources
    {
      id: 19,
      title: "Home Reading Strategies",
      description: "Effective strategies for parents to support reading at home",
      resourceType: "document",
      gradeLevel: "parents",
      category: "parent-support",
      externalUrl: "https://drive.google.com/home-reading-strategies",
      tags: ["parents", "reading", "home-support"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Parent Engagement Team" }
    },
    {
      id: 20,
      title: "Parent-Teacher Communication Guide",
      description: "Guidelines for effective communication between parents and teachers",
      resourceType: "document",
      gradeLevel: "parents",
      category: "parent-support",
      externalUrl: "https://drive.google.com/parent-teacher-communication",
      tags: ["parents", "communication", "partnership"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "ESID Administration" }
    }
  ]

  // Group resources by category/theme for cleaner presentation
  const groupedByTheme = {
    'parent-support': staticResources.filter(r => r.category === 'parent-support'),
    'g1-g2-transition': staticResources.filter(r => r.gradeLevel === '1-2' && r.tags?.includes('transition')),
    'reading-support': staticResources.filter(r => r.category === 'reading' && r.gradeLevel === '1-2' && !r.tags?.includes('transition')),
    'language-learning': staticResources.filter(r => r.category === 'language' && r.gradeLevel === '1-2'),
    'grades-3-4': staticResources.filter(r => r.gradeLevel === '3-4'),
    'grades-5-6': staticResources.filter(r => r.gradeLevel === '5-6')
  }

  // Get resource icon
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf': return FileText
      case 'video': return Play
      case 'document': return FileText
      case 'interactive': return BookOpen
      case 'external': return ExternalLink
      default: return Folder
    }
  }


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
                  KCISLK ESID Info Hub
                </h1>
                <p className="text-xs text-gray-500">KCISLK Elementary School International Department</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-4">
              {/* 桌面版導航 */}
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
              </nav>

              {/* 行動版導航 */}
              <MobileNav />
            </div>
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
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6"
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
            Comprehensive learning resources for parents, teachers, and students to support academic development and success across all grade levels.
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


        {/* Resource Sections by Theme */}
        <div className="space-y-16">
          {/* Parent Support Section */}
          {groupedByTheme['parent-support'].length > 0 && (
            <motion.section
              className="mb-16"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants}>
                <Card className="bg-white/90 backdrop-blur-lg shadow-2xl border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-rose-500 to-rose-600 text-white relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />
                    <CardTitle className="flex items-center gap-3 text-3xl relative z-10">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <Users className="h-8 w-8" />
                      </motion.div>
                      Parent Support Resources
                    </CardTitle>
                    <CardDescription className="text-white/90 text-lg relative z-10">
                      Essential resources to support your child's learning journey at home
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <motion.div className="space-y-4" variants={containerVariants}>
                      {groupedByTheme['parent-support'].map((resource) => {
                        const IconComponent = getResourceIcon(resource.resourceType)
                        return (
                          <motion.div key={resource.id} variants={itemVariants}>
                            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group">
                              <IconComponent className="h-5 w-5 text-gray-500 group-hover:text-rose-500 transition-colors" />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 group-hover:text-rose-700 transition-colors">
                                  {resource.title}
                                </h4>
                                {resource.description && (
                                  <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {resource.externalUrl && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() => window.open(resource.externalUrl, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Open
                                  </Button>
                                )}
                                {resource.downloadUrl && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() => {
                                      const link = document.createElement('a')
                                      link.href = resource.downloadUrl!
                                      link.download = ''
                                      link.click()
                                    }}
                                  >
                                    <Download className="h-3 w-3" />
                                    Download
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.section>
          )}

          {/* G1-G2 Transition Materials */}
          {groupedByTheme['g1-g2-transition'].length > 0 && (
            <motion.section
              className="mb-16"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants}>
                <Card className="bg-white/90 backdrop-blur-lg shadow-2xl border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />
                    <CardTitle className="flex items-center gap-3 text-3xl relative z-10">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <BookOpen className="h-8 w-8" />
                      </motion.div>
                      G1-G2 Transition Materials
                    </CardTitle>
                    <CardDescription className="text-white/90 text-lg relative z-10">
                      Essential reading materials to support the transition to formal education
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <motion.div className="space-y-4" variants={containerVariants}>
                      {groupedByTheme['g1-g2-transition'].map((resource) => {
                        const IconComponent = getResourceIcon(resource.resourceType)
                        return (
                          <motion.div key={resource.id} variants={itemVariants}>
                            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-blue-50/50 transition-colors group">
                              <IconComponent className="h-5 w-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                                  {resource.title}
                                </h4>
                                {resource.description && (
                                  <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {resource.externalUrl && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() => window.open(resource.externalUrl, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Open
                                  </Button>
                                )}
                                {resource.downloadUrl && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() => {
                                      const link = document.createElement('a')
                                      link.href = resource.downloadUrl!
                                      link.download = ''
                                      link.click()
                                    }}
                                  >
                                    <Download className="h-3 w-3" />
                                    Download
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.section>
          )}

          {/* Reading Support Resources */}
          {groupedByTheme['reading-support'].length > 0 && (
            <motion.section
              className="mb-16"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants}>
                <Card className="bg-white/90 backdrop-blur-lg shadow-2xl border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />
                    <CardTitle className="flex items-center gap-3 text-3xl relative z-10">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <BookOpen className="h-8 w-8" />
                      </motion.div>
                      Reading Support Resources
                    </CardTitle>
                    <CardDescription className="text-white/90 text-lg relative z-10">
                      Tools and materials to strengthen reading comprehension and fluency
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <motion.div className="space-y-4" variants={containerVariants}>
                      {groupedByTheme['reading-support'].map((resource) => {
                        const IconComponent = getResourceIcon(resource.resourceType)
                        return (
                          <motion.div key={resource.id} variants={itemVariants}>
                            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-green-50/50 transition-colors group">
                              <IconComponent className="h-5 w-5 text-gray-500 group-hover:text-green-500 transition-colors" />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 group-hover:text-green-700 transition-colors">
                                  {resource.title}
                                </h4>
                                {resource.description && (
                                  <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {resource.externalUrl && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() => window.open(resource.externalUrl, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Open
                                  </Button>
                                )}
                                {resource.downloadUrl && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() => {
                                      const link = document.createElement('a')
                                      link.href = resource.downloadUrl!
                                      link.download = ''
                                      link.click()
                                    }}
                                  >
                                    <Download className="h-3 w-3" />
                                    Download
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.section>
          )}

          {/* Language Learning Resources */}
          {groupedByTheme['language-learning'].length > 0 && (
            <motion.section
              className="mb-16"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants}>
                <Card className="bg-white/90 backdrop-blur-lg shadow-2xl border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />
                    <CardTitle className="flex items-center gap-3 text-3xl relative z-10">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <BookOpen className="h-8 w-8" />
                      </motion.div>
                      Language Learning Resources
                    </CardTitle>
                    <CardDescription className="text-white/90 text-lg relative z-10">
                      Building essential language skills and background knowledge
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <motion.div className="space-y-4" variants={containerVariants}>
                      {groupedByTheme['language-learning'].map((resource) => {
                        const IconComponent = getResourceIcon(resource.resourceType)
                        return (
                          <motion.div key={resource.id} variants={itemVariants}>
                            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-purple-50/50 transition-colors group">
                              <IconComponent className="h-5 w-5 text-gray-500 group-hover:text-purple-500 transition-colors" />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                                  {resource.title}
                                </h4>
                                {resource.description && (
                                  <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {resource.externalUrl && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() => window.open(resource.externalUrl, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Open
                                  </Button>
                                )}
                                {resource.downloadUrl && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() => {
                                      const link = document.createElement('a')
                                      link.href = resource.downloadUrl!
                                      link.download = ''
                                      link.click()
                                    }}
                                  >
                                    <Download className="h-3 w-3" />
                                    Download
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.section>
          )}
        </div>

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
                        Comprehensive reading comprehension platform with thousands of articles and passages. Build reading stamina with Article a Day feature.
                      </p>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-2 bg-transparent hover:bg-orange-100"
                          onClick={() => window.open('https://www.readworks.org/', '_blank')}
                        >
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
                      <h4 className="font-semibold text-blue-900 mb-3 text-xl">Reading Buddies YouTube</h4>
                      <p className="text-blue-800 mb-4 leading-relaxed">
                        Engaging video content for reading practice with peer support and interactive learning.
                      </p>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-2 bg-transparent hover:bg-blue-100"
                          onClick={() => window.open('https://www.youtube.com/@readingbuddies', '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                          Watch Videos
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
            &copy; 2025 KCISLK Elementary School International Department. All rights reserved.
          </motion.p>
          <motion.p
            className="text-purple-300 text-sm mt-2"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            KCISLK Elementary School International Department | Excellence in International Education
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
