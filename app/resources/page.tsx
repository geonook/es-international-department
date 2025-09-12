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
import BackToTop from "@/components/ui/back-to-top"
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
      color: "from-purple-600 to-purple-800",
      icon: BookOpen,
      resources: [
        {
          id: 'reading-buddies',
          title: 'Reading Buddies',
          description: "Introduce 'Reading Buddies,' a fun and engaging program designed to help your child develop essential reading skills. Combining the science of reading with lots of laughter, Reading Buddies provides aspiring readers with a supportive and enjoyable environment to build a strong foundation in literacy.",
          icon: Users,
          color: 'from-purple-400 to-purple-600',
          link: 'https://www.youtube.com/@readingbuddies',
          linkText: 'Visit Reading Buddies Website',
          type: 'program'
        },
        {
          id: 'reading-campaign',
          title: 'Reading Campaign',
          description: "Reading is a fundamental skill that opens doors to a world of knowledge and imagination. It is a key to success in school and beyond. Setting aside dedicated time for reading beyond textbooks is crucial for their academic and personal growth. Fall 2024: Weekly Reading Challenge: Texts & Quizzes",
          icon: Target,
          color: 'from-purple-500 to-purple-700',
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
          color: 'from-blue-400 to-blue-600',
          link: 'https://www.readworks.org/',
          linkText: 'Access ReadWorks Platform',
          type: 'platform'
        }
      ]
    },
    strategy: {
      title: "Learning Strategies",
      description: "Science-based learning strategies to help students build solid foundations and enhance academic success",
      color: "from-blue-600 to-cyan-600", 
      icon: Brain,
      resources: [
        {
          id: 'five-components',
          title: 'The Five Components of Reading',
          description: "Scientific research shows that there are five essential components of reading that children must be taught in order to learn to read. Teachers and parents can help children learn to be good readers by systematically practicing these five components.",
          icon: Brain,
          color: 'from-blue-500 to-blue-700',
          link: 'https://drive.google.com/file/d/five-components-reading-research',
          linkText: 'Access Five Components Research Document',
          type: 'research'
        },
        {
          id: 'background-knowledge',
          title: 'Building Background Knowledge',
          description: "Building background knowledge is crucial for ELLs to succeed in their language learning journey. It helps them improve comprehension, vocabulary, and cultural understanding, while also increasing their motivation and engagement. Spring 2025: Building Background Knowledge",
          icon: Lightbulb,
          color: 'from-cyan-500 to-cyan-700',
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
      color: "from-purple-500 to-purple-700",
      icon: GraduationCap,
      resources: [
        {
          id: 'myview-review',
          title: 'myView reView',
          description: "Comprehensive review platform designed specifically for myView curriculum materials. Access interactive content and review materials to support student learning.",
          icon: School,
          color: 'from-purple-400 to-purple-600',
          link: 'https://myviewreview.com/',
          linkText: 'Visit myView reView Platform',
          type: 'platform'
        },
        {
          id: 'transition-materials',
          title: 'G1-G2 myView Transition Materials',
          description: "We provide learning materials to help students transition smoothly from G1 to G2. These resources include several PDF documents for reading and interactive review games.",
          icon: FileText,
          color: 'from-purple-500 to-purple-700',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
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
                { name: "Resources", href: "/resources", active: true },
                { name: "KCISLK", href: "https://web.kcislk.ntpc.edu.tw/en/", external: true },
              ].map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <Link
                    href={item.href}
                    {...(item.external && { target: "_blank", rel: "noopener noreferrer" })}
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
        <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden bg-gradient-to-r from-purple-50 via-pink-50 to-purple-100">
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
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-4 py-1">
                  Featured Resources
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
                Parent Resource Center
              </motion.h2>

              <motion.p
                className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Parents play a crucial role in their children's development. To support parents in their parenting journey, we provide a range of valuable resources. These resources may include informative articles and online tools designed to equip parents with the knowledge and skills to nurture their children's growth. By empowering parents with the right information and support, we aim to create a strong foundation for children to thrive and reach their full potential.
              </motion.p>
            </motion.div>
          </motion.div>
        </section>

        {/* Parent Resource Center Featured Section - Like Events Page but No Image */}
        <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
          {/* Background Gradient - Same as Events Page */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-purple-800/30 to-pink-900/20" />
          
          <motion.div 
            className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
            style={{ y: y1 }}
          >
            <div className="max-w-4xl mx-auto">
              {/* Content - Centered Single Column */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <motion.div
                  className="flex items-center justify-center gap-3 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-4 py-1">
                    Featured Resources
                  </Badge>
                </motion.div>

                <motion.h2
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Parent Resource
                  <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Center
                  </span>
                </motion.h2>

                <motion.p
                  className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Parents play a crucial role in their children's development. To support parents in their parenting journey, we provide a range of valuable resources. These resources may include informative articles and online tools designed to equip parents with the knowledge and skills to nurture their children's growth. By empowering parents with the right information and support, we aim to create a strong foundation for children to thrive and reach their full potential.
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Main Resource Categories Section with Tabs */}
        <motion.section
          className="py-16 md:py-20 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-100 relative overflow-hidden"
          style={{ y: y2 }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Subtle pattern overlay like events page */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "radial-gradient(circle at 25% 25%, rgb(147 51 234) 2px, transparent 2px)",
                backgroundSize: "60px 60px",
              }}
            />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              variants={itemVariants}
              className="bg-white/98 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Tab Navigation */}
                <motion.div 
                  className="flex justify-center p-6 bg-gradient-to-r from-white/50 to-purple-50/50"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-white/95 backdrop-blur-lg shadow-lg border border-gray-100 p-1 rounded-xl overflow-hidden">
                    <TabsTrigger 
                      value="reading" 
                      className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-3 sm:py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-800 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 min-h-[44px] hover:bg-purple-50"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm font-medium">Diverse Reading</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="strategy" 
                      className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-3 sm:py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 min-h-[44px] hover:bg-blue-50"
                    >
                      <Brain className="w-4 h-4" />
                      <span className="text-sm font-medium">Learning Strategies</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="grade12" 
                      className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-3 sm:py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 min-h-[44px] hover:bg-purple-50"
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
                          className="text-center mb-12"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="flex items-center justify-center gap-3 mb-6">
                            <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                              <category.icon className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          <motion.h3
                            className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6"
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
                            {category.title}
                          </motion.h3>
                          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">{category.description}</p>
                        </motion.div>

                        {/* Resource Cards - Horizontal Layout like Events */}
                        <div className="grid md:grid-cols-2 gap-6 auto-rows-fr">
                          {category.resources.map((resource, index) => (
                            <motion.div
                              key={resource.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 + index * 0.1 }}
                              whileHover={{ scale: 1.02 }}
                            >
                              <Card className="bg-white/98 backdrop-blur-lg border border-gray-100 shadow-lg hover:shadow-xl hover:border-purple-200 transition-all duration-300 overflow-hidden h-full rounded-xl">
                                <CardContent className="p-0 h-full">
                                  {/* Horizontal layout like events page documents */}
                                  <div className="flex h-full">
                                    {/* Icon/Type Section - Left side */}
                                    <div className="flex-shrink-0 w-24 h-32 relative bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center rounded-l-xl overflow-hidden">
                                      <div className={`w-16 h-16 bg-gradient-to-r ${resource.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                        <resource.icon className="w-8 h-8 text-white" />
                                      </div>
                                      {resource.timeline && (
                                        <div className="absolute bottom-2 left-2 right-2">
                                          <Badge className="bg-white/90 text-gray-700 text-xs px-2 py-1 w-full text-center">
                                            {resource.timeline}
                                          </Badge>
                                        </div>
                                      )}
                                    </div>

                                    {/* Content Section - Right side */}
                                    <div className="flex-1 p-4 flex flex-col justify-between bg-gradient-to-r from-white to-purple-50/30">
                                      <div>
                                        <div className="flex items-start justify-between mb-2">
                                          <h4 className="font-semibold text-gray-900 leading-tight text-lg mb-2">
                                            {resource.title}
                                          </h4>
                                          <Badge variant="outline" className="ml-2 text-xs border-purple-200 text-purple-600">
                                            {resource.type || 'Resource'}
                                          </Badge>
                                        </div>
                                        
                                        <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                                          {resource.description}
                                        </p>
                                      </div>

                                      {/* Materials List (for G1-G2 resources) */}
                                      {resource.materials && (
                                        <div className="mb-4">
                                          <div className="grid gap-2">
                                            {resource.materials.slice(0, 2).map((material, idx) => (
                                              <motion.a
                                                key={idx}
                                                href={material.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm"
                                                whileHover={{ x: 2 }}
                                              >
                                                <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded flex items-center justify-center">
                                                  {material.type === 'PDF' ? (
                                                    <FileText className="w-3 h-3 text-white" />
                                                  ) : (
                                                    <Gamepad2 className="w-3 h-3 text-white" />
                                                  )}
                                                </div>
                                                <span className="flex-1 truncate">{material.name}</span>
                                                <ExternalLink className="w-3 h-3 text-gray-400" />
                                              </motion.a>
                                            ))}
                                            {resource.materials.length > 2 && (
                                              <div className="text-xs text-gray-500 text-center py-1">
                                                +{resource.materials.length - 2} more materials
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Action buttons */}
                                      <div className="flex items-center gap-2 justify-end">
                                        {resource.link && (
                                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button 
                                              size="sm"
                                              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white"
                                              onClick={() => window.open(resource.link, '_blank')}
                                            >
                                              <ExternalLink className="w-3 h-3 mr-1" />
                                              Access
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
                        </div>
                      </motion.div>
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </motion.div>
          </div>
        </motion.section>

        {/* Call to Action Section - HIDDEN as requested */}
        <motion.section
          className="hidden py-16 md:py-20 relative overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div variants={itemVariants}>
              <motion.h3
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                Need More Resources?
              </motion.h3>
              <motion.p
                className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
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

        {/* Contact CTA Section - HIDDEN as requested */}
        <motion.section
          className="hidden py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 relative overflow-hidden"
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

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  )
}