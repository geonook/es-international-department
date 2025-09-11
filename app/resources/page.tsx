"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ExternalLink, 
  Sparkles, 
  ChevronDown, 
  BookOpen, 
  Users, 
  FileText, 
  Play, 
  Download,
  GraduationCap,
  Brain,
  Target,
  Lightbulb,
  Globe,
  School,
  Gamepad2,
  Mail,
  Phone
} from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import MobileNav from "@/components/ui/mobile-nav"
import { useState } from "react"

/**
 * Resources Page - Parents' Corner Resource Center
 * Professional three-category design with hover-only animations
 * Categories: 多元閱讀, 學習策略, 低年級專屬 (G1-G2)
 */

export default function ResourcesPage() {
  // Scroll parallax effect
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])
  
  // Tab state
  const [activeTab, setActiveTab] = useState("reading")

  // Animation variants for hover-only effects
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

  // Resource categories data structure
  const resourceCategories = {
    reading: {
      title: "Diverse Reading",
      description: "Foster children's interest and ability in reading through diverse resources and engaging programs",
      color: "from-green-500 to-emerald-600",
      icon: BookOpen,
      resources: [
        {
          id: 'reading-buddies',
          title: 'Reading Buddies',
          description: "Introduce 'Reading Buddies,' a fun and engaging program designed to help your child develop essential reading skills. Combining the science of reading with lots of laughter, Reading Buddies provides aspiring readers with a supportive and enjoyable environment to build a strong foundation in literacy.",
          icon: Users,
          color: 'from-green-400 to-green-600',
          link: 'https://www.youtube.com/@readingbuddies',
          linkText: 'Visit Reading Buddies Website',
          type: 'program'
        },
        {
          id: 'reading-campaign',
          title: 'Reading Campaign',
          description: "Reading is a fundamental skill that opens doors to a world of knowledge and imagination. It is a key to success in school and beyond. Setting aside dedicated time for reading beyond textbooks is crucial for their academic and personal growth. Fall 2024: Weekly Reading Challenge: Texts & Quizzes",
          icon: Target,
          color: 'from-blue-400 to-blue-600',
          link: 'https://drive.google.com/drive/folders/weekly-reading-challenge-fall-2024',
          linkText: 'Join Fall 2024 Weekly Reading Challenge',
          timeline: 'Fall 2024',
          type: 'campaign'
        },
        {
          id: 'readworks',
          title: 'ReadWorks: Article a Day',
          description: "Online resources providing daily reading articles with comprehension questions. Build reading stamina and background knowledge through systematic daily practice.",
          icon: Globe,
          color: 'from-purple-400 to-purple-600',
          link: 'https://www.readworks.org/',
          linkText: 'Access ReadWorks Platform',
          type: 'platform'
        }
      ]
    },
    strategy: {
      title: "Learning Strategies",
      description: "Science-based learning strategies to help students build solid foundations and enhance academic success",
      color: "from-purple-500 to-violet-600", 
      icon: Brain,
      resources: [
        {
          id: 'five-components',
          title: 'The Five Components of Reading',
          description: "Scientific research shows that there are five essential components of reading that children must be taught in order to learn to read. Teachers and parents can help children learn to be good readers by systematically practicing these five components.",
          icon: Brain,
          color: 'from-indigo-400 to-indigo-600',
          link: 'https://drive.google.com/file/d/five-components-reading-research',
          linkText: 'Access Five Components Research Document',
          type: 'research'
        },
        {
          id: 'background-knowledge',
          title: 'Building Background Knowledge',
          description: "Building background knowledge is crucial for ELLs to succeed in their language learning journey. It helps them improve comprehension, vocabulary, and cultural understanding, while also increasing their motivation and engagement. Spring 2025: Building Background Knowledge",
          icon: Lightbulb,
          color: 'from-cyan-400 to-cyan-600',
          link: 'https://drive.google.com/drive/folders/background-knowledge-spring-2025',
          linkText: 'Access Spring 2025 Background Knowledge Resources',
          timeline: 'Spring 2025',
          type: 'strategy'
        }
      ]
    },
    grade12: {
      title: "G1-G2 Exclusive Resources",
      description: "Specialized transition materials and learning resources designed specifically for Grade 1-2 students",
      color: "from-orange-500 to-red-600",
      icon: GraduationCap,
      resources: [
        {
          id: 'myview-review',
          title: 'myView reView',
          description: "Comprehensive review platform designed specifically for myView curriculum materials. Access interactive content and review materials to support student learning.",
          icon: School,
          color: 'from-teal-400 to-teal-600',
          link: 'https://myviewreview.com/',
          linkText: 'Visit myView reView Platform',
          type: 'platform'
        },
        {
          id: 'transition-materials',
          title: 'G1-G2 myView Transition Materials',
          description: "We provide learning materials to help students transition smoothly from G1 to G2. These resources include several PDF documents for reading and interactive review games.",
          icon: FileText,
          color: 'from-rose-400 to-rose-600',
          timeline: 'Summer 2025',
          type: 'materials',
          materials: [
            {
              name: 'Henry on Wheels',
              type: 'PDF',
              link: 'https://drive.google.com/file/d/henry-on-wheels-pdf'
            },
            {
              name: 'Baby Animals Grow',
              type: 'PDF', 
              link: 'https://drive.google.com/file/d/baby-animals-grow-pdf'
            },
            {
              name: 'Review Games',
              type: 'Canva Interactive',
              link: 'https://canva.com/design/review-games-g1-g2',
              description: 'Canva互動複習遊戲'
            }
          ]
        }
      ]
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 overflow-hidden">
      {/* Animated Background - Same as homepage */}
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

      {/* Header - Unified with homepage design */}
      <motion.header
        className="relative bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-2 sm:gap-3" 
              whileHover={{ scale: 1.05 }} 
              transition={{ duration: 0.2 }}
            >
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
                  <span className="sm:hidden">ESID</span>
                </h1>
                <p className="text-xs text-gray-500 leading-tight">Excellence in Education</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
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

            {/* Mobile Navigation */}
            <MobileNav />
          </div>
        </div>
      </motion.header>

      <main>
        {/* Hero Section - Parents' Corner Style */}
        <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
          <motion.div 
            className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
            style={{ y: y1 }}
          >
            <motion.div
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="flex items-center justify-center gap-3 mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 backdrop-blur-lg text-white px-4 py-1">
                  Parents' Corner Resources
                </Badge>
              </motion.div>

              <motion.h2
                className="text-4xl md:text-5xl lg:text-6xl font-light text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0, backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ 
                  opacity: { delay: 0.3 },
                  y: { delay: 0.3 },
                  backgroundPosition: {
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear"
                  }
                }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Learning Resource Center
              </motion.h2>

              <motion.p
                className="text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Comprehensive learning resources for parents, teachers, and students to support academic development and success across all grade levels
              </motion.p>
            </motion.div>
          </motion.div>
        </section>

        {/* Main Resource Categories Section with Tabs */}
        <motion.section
          className="py-16 md:py-20 relative"
          style={{ y: y2 }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={itemVariants}
              className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden"
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Tab Navigation */}
                <motion.div 
                  className="flex justify-center p-6 bg-gradient-to-r from-purple-50 to-indigo-50"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-white/95 backdrop-blur-lg shadow-xl border border-white/30 p-1 rounded-2xl overflow-hidden">
                    <TabsTrigger 
                      value="reading" 
                      className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-3 sm:py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 min-h-[44px] hover:bg-green-50"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm font-medium">Diverse Reading</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="strategy" 
                      className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-3 sm:py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 min-h-[44px] hover:bg-purple-50"
                    >
                      <Brain className="w-4 h-4" />
                      <span className="text-sm font-medium">Learning Strategies</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="grade12" 
                      className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-3 sm:py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 min-h-[44px] hover:bg-orange-50"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span className="text-sm font-medium">G1-G2 Exclusive</span>
                    </TabsTrigger>
                  </TabsList>
                </motion.div>

                {/* Tab Content */}
                <div className="p-6 md:p-8">
                  {Object.entries(resourceCategories).map(([key, category]) => (
                    <TabsContent key={key} value={key} className="mt-0">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                      >
                        {/* Category Header */}
                        <motion.div 
                          className="text-center mb-8"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="flex items-center justify-center gap-3 mb-4">
                            <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                              <category.icon className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{category.title}</h3>
                          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{category.description}</p>
                        </motion.div>

                        {/* Resource Cards */}
                        <div className="grid gap-6 md:gap-8">
                          {category.resources.map((resource, index) => (
                            <motion.div
                              key={resource.id}
                              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + index * 0.1 }}
                            >
                              <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                                <CardHeader className={`bg-gradient-to-r ${resource.color} text-white relative overflow-hidden`}>
                                  <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100"
                                    initial={false}
                                    transition={{ duration: 0.3 }}
                                  />
                                  <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-2">
                                      <motion.div
                                        className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"
                                        whileHover={{ rotate: 360 }}
                                        transition={{ duration: 0.6 }}
                                      >
                                        <resource.icon className="h-6 w-6" />
                                      </motion.div>
                                      <div className="flex-1">
                                        <CardTitle className="text-2xl">{resource.title}</CardTitle>
                                        {resource.timeline && (
                                          <Badge className="bg-white/20 text-white mt-2">
                                            {resource.timeline}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <CardDescription className="text-white/90 text-base leading-relaxed">
                                      {resource.description}
                                    </CardDescription>
                                  </div>
                                </CardHeader>
                                
                                <CardContent className="p-6">
                                  {/* Materials List for G1-G2 Transition */}
                                  {resource.materials && (
                                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                                      {resource.materials.map((material, idx) => (
                                        <motion.div
                                          key={idx}
                                          className="group/item"
                                          whileHover={{ x: 5 }}
                                          transition={{ duration: 0.2 }}
                                        >
                                          <motion.a
                                            href={material.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group-hover/item:shadow-md"
                                            whileHover={{ scale: 1.02 }}
                                          >
                                            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                                              {material.type === 'PDF' ? (
                                                <FileText className="w-4 h-4 text-white" />
                                              ) : (
                                                <Gamepad2 className="w-4 h-4 text-white" />
                                              )}
                                            </div>
                                            <div className="flex-1">
                                              <p className="font-medium text-gray-900">{material.name}</p>
                                              <p className="text-sm text-gray-500">{material.type}</p>
                                              {material.description && (
                                                <p className="text-xs text-gray-400 mt-1">{material.description}</p>
                                              )}
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover/item:text-gray-600" />
                                          </motion.a>
                                        </motion.div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Main Resource Link */}
                                  {resource.link && (
                                    <motion.div 
                                      whileHover={{ scale: 1.05 }} 
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <Button
                                        className={`w-full sm:w-auto bg-gradient-to-r ${resource.color} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                                        onClick={() => window.open(resource.link, '_blank')}
                                      >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        {resource.linkText}
                                      </Button>
                                    </motion.div>
                                  )}
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </motion.div>
          </div>
        </motion.section>

        {/* Call to Action Section */}
        <motion.section
          className="py-16 md:py-20 relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div variants={itemVariants}>
              <motion.h3
                className="text-3xl md:text-4xl font-bold text-white mb-6"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                Need More Resources?
              </motion.h3>
              <motion.p
                className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Contact our team for additional learning materials or if you have questions about using these resources
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    Contact Support Team
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto border-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Back to Home
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Contact CTA Section - Matching Homepage */}
        <motion.section
          className="py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
              },
            },
          }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }} 
              className="text-center max-w-3xl mx-auto"
            >
              <motion.h2
                className="text-3xl sm:text-4xl md:text-5xl font-light text-white mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Ready to Join Our Community?
              </motion.h2>

              <motion.p
                className="text-lg md:text-xl text-purple-100 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Connect with us today and discover how we can support your child&apos;s educational journey through meaningful partnerships and innovative programs.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
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

      {/* Footer - Matching Homepage Three-Column Structure */}
      <motion.footer
        className="bg-gray-900 text-white py-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
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
          </motion.div>

          <motion.div
            className="border-t border-gray-700 mt-8 pt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <p className="text-gray-400 text-sm">
              © 2025 ES International Department. All rights reserved.
            </p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  )
}