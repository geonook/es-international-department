"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Lightbulb
} from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import MobileNav from "@/components/ui/mobile-nav"

/**
 * Resources Page - Parents' Corner Resource Center
 * Unified design with homepage and events page
 * Maintains Google Sites content structure with enhanced visual design
 */

export default function ResourcesPage() {
  // Scroll parallax effect
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])

  // Animation variants
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

  // Resources data structure following Google Sites
  const resourceSections = [
    {
      id: 'parent-resources',
      title: 'Parent Resources',
      description: 'Parents play a crucial role in their children\'s development. Offers informative articles and online tools.',
      icon: Users,
      color: 'from-rose-500 to-rose-600',
      link: 'https://drive.google.com/drive/folders/parent-support',
      linkText: 'Access Parent Resources'
    },
    {
      id: 'g1-g2-transition',
      title: 'G1-G2 myView Transition Materials',
      description: 'Learning materials for smooth student transition from Grade 1 to Grade 2. Summer 2025 collection.',
      icon: GraduationCap,
      color: 'from-blue-500 to-blue-600',
      materials: [
        "Henry on Wheels",
        "Baby Animals Grow",
        "Thumbs Up for Art and Music!",
        "What Is the Story of Our Flag?",
        "My Autumn Book",
        "Review Games"
      ]
    },
    {
      id: 'reading-buddies',
      title: 'Reading Buddies',
      description: 'Combines the science of reading with lots of laughter. YouTube channel with engaging video content.',
      icon: Play,
      color: 'from-green-500 to-green-600',
      link: 'https://www.youtube.com/@readingbuddies',
      linkText: 'Visit Reading Buddies YouTube Channel'
    },
    {
      id: 'five-components',
      title: 'The Five Components of Reading',
      description: 'Link to scientific research document. Emphasizes systematic practice of reading components: phonemic awareness, phonics, fluency, vocabulary, and comprehension.',
      icon: Brain,
      color: 'from-purple-500 to-purple-600',
      link: 'https://drive.google.com/file/d/five-components-reading',
      linkText: 'Access Five Components Research Document'
    },
    {
      id: 'reading-campaign',
      title: 'Reading Campaign',
      description: 'Fall 2024: Weekly Reading Challenge. Focuses on reading beyond textbooks with weekly texts and comprehension activities.',
      icon: Target,
      color: 'from-orange-500 to-orange-600',
      link: 'https://drive.google.com/drive/folders/weekly-reading-challenge',
      linkText: 'Join Fall 2024 Weekly Reading Challenge'
    },
    {
      id: 'background-knowledge',
      title: 'Building Background Knowledge',
      description: 'Spring 2025 resources. Emphasizes importance for English Language Learners with comprehensive materials.',
      icon: Lightbulb,
      color: 'from-cyan-500 to-cyan-600',
      mainLink: 'https://drive.google.com/drive/folders/background-knowledge',
      mainLinkText: 'Access Spring 2025 Background Knowledge Resources',
      additionalLink: {
        title: 'ReadWorks - Article a Day',
        url: 'https://www.readworks.org/',
        description: 'Daily reading articles with comprehension questions. Build reading stamina and background knowledge.'
      }
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 overflow-hidden">
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
            <motion.div className="flex items-center gap-2 sm:gap-3" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
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
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
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
                <Badge className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-4 py-1">
                  Learning Resources
                </Badge>
              </motion.div>

              <motion.h2
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Learning Resource Center
                </span>
              </motion.h2>

              <motion.p
                className="text-lg md:text-xl text-gray-700 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Comprehensive learning resources for parents, teachers, and students to support academic development and success across all grade levels.
              </motion.p>
            </motion.div>
          </motion.div>
        </section>

        {/* Resource Sections */}
        <motion.section
          className="py-16 md:py-20 relative"
          style={{ y: y2 }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {resourceSections.map((section, index) => {
                const IconComponent = section.icon
                
                return (
                  <motion.div
                    key={section.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      <CardHeader className={`bg-gradient-to-r ${section.color} text-white relative overflow-hidden`}>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        />
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-2">
                            <motion.div
                              className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.6 }}
                            >
                              <IconComponent className="h-6 w-6" />
                            </motion.div>
                            <CardTitle className="text-2xl">{section.title}</CardTitle>
                          </div>
                          <CardDescription className="text-white/90 text-base">
                            {section.description}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-6">
                        {/* G1-G2 Materials List */}
                        {section.materials && (
                          <div className="grid sm:grid-cols-2 gap-3 mb-6">
                            {section.materials.map((material, idx) => (
                              <motion.div
                                key={idx}
                                whileHover={{ x: 5 }}
                                transition={{ duration: 0.2 }}
                              >
                                <a
                                  href={`https://drive.google.com/file/d/${material.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-purple-700 hover:text-purple-800 transition-colors"
                                >
                                  <FileText className="w-4 h-4" />
                                  <span className="hover:underline">{material}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        {/* Main Link */}
                        {section.link && (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white"
                              onClick={() => window.open(section.link, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              {section.linkText}
                            </Button>
                          </motion.div>
                        )}

                        {/* Background Knowledge Section with Additional Link */}
                        {section.mainLink && (
                          <div className="space-y-4">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white"
                                onClick={() => window.open(section.mainLink, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                {section.mainLinkText}
                              </Button>
                            </motion.div>
                            
                            {section.additionalLink && (
                              <div className="border-t pt-4">
                                <h4 className="font-semibold text-gray-800 mb-2">Recommended Platform:</h4>
                                <p className="text-gray-600 text-sm mb-3">{section.additionalLink.description}</p>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button
                                    variant="outline"
                                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                                    onClick={() => window.open(section.additionalLink.url, '_blank')}
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    {section.additionalLink.title}
                                  </Button>
                                </motion.div>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.section>

        {/* Call to Action Section */}
        <motion.section
          className="py-16 md:py-20 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div variants={itemVariants}>
              <motion.h3
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                Need More Resources?
              </motion.h3>
              <motion.p
                className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Contact our team for additional learning materials or if you have questions about using these resources.
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
                    Contact Support
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
      </main>

      {/* Footer - Same as homepage */}
      <motion.footer
        className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.p 
            initial={{ y: 20, opacity: 0 }} 
            whileInView={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.2 }}
            className="text-lg mb-2"
          >
            &copy; 2025 ES International Department. All rights reserved.
          </motion.p>
          <motion.p
            className="text-gray-400 text-sm"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Kang Chiao International School | Excellence in Education
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