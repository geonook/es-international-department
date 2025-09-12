"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  Sparkles, 
  ChevronDown,
  Download,
  FileText,
  Coffee,
  Heart,
  Star,
  ExternalLink,
  Mail,
  Phone,
  Eye,
  FolderOpen,
  PlayCircle,
  FileSpreadsheet,
  Presentation,
  Loader2
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import MobileNav from "@/components/ui/mobile-nav"
import BackToTop from "@/components/ui/back-to-top"
import { processDriveUrl, handleThumbnailError, handleCustomDownload } from "@/lib/google-drive-utils"

/**
 * Static Events Page Component - KCISLK ESID Events
 * 
 * @description Static events page showcasing Coffee with the Principal and other important school events
 * @features Static content, document downloads, responsive design, beautiful animations
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

interface StaticEvent {
  id: number
  title: string
  description: string
  date: string
  time: string
  location: string
  type: 'featured' | 'upcoming' | 'recurring'
  category: string
  image?: string
  registrationRequired?: boolean
  documents?: {
    title: string
    url: string
    type: 'pdf' | 'doc' | 'link'
  }[]
}

interface DocumentDownload {
  id: number
  title: string
  description: string
  url: string
  type: 'pdf' | 'doc' | 'link' | 'presentation' | 'drive'
  category: string
  size?: string
  lastUpdated?: string
  thumbnailUrl?: string
  driveFileId?: string
  isGoogleDriveFile?: boolean
  previewUrl?: string
  downloadUrl?: string
  fileExtension?: string
}

export default function StaticEventsPage() {
  // Download state management
  const [downloadingFiles, setDownloadingFiles] = useState<Set<number>>(new Set())
  
  // Scroll parallax effect
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])

  // Static events data
  // TODO: FUTURE_ENHANCEMENT - This will be replaced with dynamic backend data for Featured Event management
  const featuredEvent: StaticEvent = {
    id: 1,
    title: "Coffee with the Principal",
    description: "Coffee with the Principal is a welcoming and informal event to foster open communication and collaboration between the school's leadership and our community. Parents and guardians can connect with the principal, directors, coordinators and teachers to share ideas, concerns, or feedback.",
    date: "February 28, 2025",
    time: "9:00 AM - 11:00 AM",
    location: "KCISLK School Library",
    type: "featured",
    category: "Community",
    image: "/images/coffee-principal-hero.jpg",
    registrationRequired: true,
    documents: [
      {
        title: "Coffee Morning Information Sheet",
        url: "/events/coffee-principal-info-2025.pdf",
        type: "pdf"
      },
      {
        title: "Registration Form",
        url: "/events/coffee-principal-registration.pdf", 
        type: "pdf"
      }
    ]
  }

  const upcomingEvents: StaticEvent[] = [
    {
      id: 2,
      title: "Parent-Teacher Conferences",
      description: "Individual meetings to discuss your child's academic progress and development. Schedule your appointment with your child's teacher.",
      date: "February 15, 2025",
      time: "8:00 AM - 5:00 PM",
      location: "Classroom Buildings",
      type: "upcoming",
      category: "Academic",
      registrationRequired: true
    },
    {
      id: 3,
      title: "International Cultural Day",
      description: "Celebrate diversity through food, music, and cultural activities. Students and families showcase their heritage.",
      date: "March 15, 2025",
      time: "10:00 AM - 3:00 PM",
      location: "School Gymnasium",
      type: "upcoming",
      category: "Cultural"
    },
    {
      id: 4,
      title: "Spring Sports Day",
      description: "Annual athletics competition featuring team sports and individual challenges for all grade levels.",
      date: "April 20, 2025",
      time: "8:30 AM - 4:00 PM",
      location: "School Sports Field",
      type: "upcoming",
      category: "Sports"
    }
  ]

  // Process Google Drive URLs and create enhanced document data
  // Updated titles to match actual Google Drive filenames
  const rawDocumentUrls = [
    {
      id: 1,
      title: "Coffee with Principal 活動簡報",
      description: "Coffee with Principal 活動主要簡報內容，包含活動介紹與重要資訊",
      url: "https://drive.google.com/file/d/1BGmKA8TdoXvmI52erkEpgSWre-SAvITb/view",
      category: "簡報",
      lastUpdated: "2024年11月29日"
    },
    {
      id: 2,
      title: "Coffee with Principal G1-G2 教學資料",
      description: "專為1-2年級學生設計的Coffee with Principal活動教學投影片",
      url: "https://drive.google.com/file/d/1ZsfVdLbah-fov4EMBDC1j0TKVeKxiPrb/view",
      category: "教學資料",
      lastUpdated: "2024年11月29日"
    },
    {
      id: 3,
      title: "Coffee with Principal G3-G4 教學資料",
      description: "專為3-4年級學生設計的Coffee with Principal活動教學投影片",
      url: "https://drive.google.com/file/d/11fe6GQSf0JudhdO0t7LDsG3dKKWYi4Dm/view",
      category: "教學資料",
      lastUpdated: "2024年11月29日"
    },
    {
      id: 4,
      title: "Coffee with Principal G5-G6 教學資料",
      description: "專為5-6年級學生設計的Coffee with Principal活動教學投影片",
      url: "https://drive.google.com/file/d/1SEnSdxKGC6DQG1Pe5qMYAcfVxqsR73-U/view",
      category: "教學資料",
      lastUpdated: "2024年11月29日"
    }
  ]

  // Process documents with Google Drive integration
  const documents: DocumentDownload[] = rawDocumentUrls.map(doc => {
    const driveInfo = processDriveUrl(doc.url)
    
    if (driveInfo) {
      return {
        id: doc.id,
        title: doc.title,
        description: doc.description,
        url: doc.url,
        type: 'drive',
        category: doc.category,
        size: driveInfo.estimatedSize,
        lastUpdated: doc.lastUpdated,
        thumbnailUrl: driveInfo.thumbnailUrl,
        driveFileId: driveInfo.fileId,
        isGoogleDriveFile: true,
        previewUrl: driveInfo.previewUrl,
        downloadUrl: driveInfo.downloadUrl,
        fileExtension: driveInfo.extension
      }
    }
    
    // Fallback for non-Drive files
    return {
      id: doc.id,
      title: doc.title,
      description: doc.description,
      url: doc.url,
      type: 'pdf',
      category: doc.category,
      size: 'Unknown',
      lastUpdated: doc.lastUpdated,
      isGoogleDriveFile: false
    }
  })

  // Custom download handler with state management
  const handleDocumentDownload = async (doc: DocumentDownload) => {
    if (!doc.isGoogleDriveFile || !doc.driveFileId) {
      // Fallback for non-Drive files
      window.open(doc.url, '_blank')
      return
    }

    // Set downloading state
    setDownloadingFiles(prev => new Set([...prev, doc.id]))

    try {
      const result = await handleCustomDownload(
        doc.driveFileId,
        doc.title,
        doc.type === 'drive' ? detectFileTypeFromUrl(doc.url) : doc.type
      )

      if (result.success) {
        console.log(`✅ Successfully downloaded: ${result.filename}`)
        // Could show success toast here
      } else {
        console.error(`❌ Download failed: ${result.error}`)
        // Could show error toast here
      }
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      // Remove downloading state
      setDownloadingFiles(prev => {
        const updated = new Set(prev)
        updated.delete(doc.id)
        return updated
      })
    }
  }

  // Helper function to detect file type from URL
  const detectFileTypeFromUrl = (url: string): string => {
    if (url.includes('/presentation/')) return 'presentation'
    if (url.includes('/document/')) return 'document'
    if (url.includes('/spreadsheets/')) return 'spreadsheet'
    return 'unknown'
  }

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

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      {/* Animated Background */}
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

      {/* Header */}
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
                { name: "Events", href: "/events", active: true },
                { name: "Resources", href: "/resources" },
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
        {/* Hero Section - Coffee with the Principal */}
        <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
          {/* Hero Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-purple-800/30 to-pink-900/20" />
          
          <motion.div 
            className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
            style={{ y: y1 }}
          >
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-center lg:text-left"
                >
                  <motion.div
                    className="flex items-center justify-center lg:justify-start gap-3 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <Coffee className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-4 py-1">
                      Featured Event
                    </Badge>
                  </motion.div>

                  <motion.h2
                    className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Coffee with the
                    <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Principal
                    </span>
                  </motion.h2>

                  <motion.p
                    className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {featuredEvent.description}
                  </motion.p>

                  {/* Event Details - Hidden for now, will be restored when specific event dates are confirmed */}
                  {/* TODO: FUTURE_ENHANCEMENT - Uncomment when backend provides specific event scheduling
                  <motion.div
                    className="space-y-4 mb-8"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center justify-center lg:justify-start gap-3 text-gray-700">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">{featuredEvent.date}</span>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start gap-3 text-gray-700">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">{featuredEvent.time}</span>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start gap-3 text-gray-700">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">{featuredEvent.location}</span>
                    </div>
                  </motion.div>
                  */}

                  {/* Action Buttons */}
                  <motion.div
                    className="hidden flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        size="lg"
                        className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
                      >
                        <Heart className="w-5 h-5 mr-2" />
                        Register Now
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto border-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download Info
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Image */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-3xl blur-xl transform rotate-3" />
                    <Image
                      src="/images/coffee-with-principal.png"
                      alt="Coffee with the Principal"
                      fill
                      className="object-cover relative z-10"
                      priority
                    />
                  </div>
                  {/* Floating elements */}
                  <motion.div
                    className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                    variants={floatingVariants}
                    animate="animate"
                  >
                    <Star className="w-6 h-6 text-white" />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Upcoming Events Section */}
        <motion.section
          className="hidden py-16 md:py-20 relative"
          style={{ y: y2 }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div className="text-center mb-12" variants={itemVariants}>
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
                Upcoming Events
              </motion.h3>
              <motion.p
                className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
                variants={itemVariants}
              >
                Mark your calendars for these exciting school events and activities
              </motion.p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
              variants={containerVariants}
            >
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {event.category}
                        </Badge>
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-xl leading-tight">
                        {event.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        {event.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-purple-500" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-purple-500" />
                          <span>{event.location}</span>
                        </div>
                      </div>

                      {event.registrationRequired && (
                        <Button 
                          variant="outline" 
                          className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Register
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Documents Section */}
        <motion.section
          className="py-16 md:py-20 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-100 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
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
            <motion.div className="text-center mb-12" variants={itemVariants}>
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
                Event Documents
              </motion.h3>
              <motion.p
                className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
                variants={itemVariants}
              >
                Download important forms, schedules, and information sheets for upcoming events
              </motion.p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 auto-rows-fr"
              variants={containerVariants}
            >
              {documents.map((doc, index) => {
                // Get appropriate icon for file type
                const getFileIcon = () => {
                  if (doc.isGoogleDriveFile) {
                    switch (doc.fileExtension) {
                      case 'PPTX': return <Presentation className="w-6 h-6 text-white" />
                      case 'DOCX': return <FileText className="w-6 h-6 text-white" />
                      case 'XLSX': return <FileSpreadsheet className="w-6 h-6 text-white" />
                      default: return <FolderOpen className="w-6 h-6 text-white" />
                    }
                  }
                  return <FileText className="w-6 h-6 text-white" />
                }

                // Get color scheme based on file type
                const getIconColors = () => {
                  if (doc.isGoogleDriveFile) {
                    switch (doc.fileExtension) {
                      case 'PPTX': return 'bg-gradient-to-br from-orange-500 to-red-600'
                      case 'DOCX': return 'bg-gradient-to-br from-blue-500 to-blue-600'
                      case 'XLSX': return 'bg-gradient-to-br from-green-500 to-green-600'
                      default: return 'bg-gradient-to-br from-purple-500 to-purple-600'
                    }
                  }
                  return 'bg-gradient-to-br from-red-500 to-red-600'
                }

                return (
                  <motion.div
                    key={doc.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                      <CardContent className="p-0 h-full">
                        {/* Enhanced layout with thumbnail */}
                        <div className="flex h-full">
                          {/* Thumbnail/Icon Section - 16:9 aspect ratio */}
                          <div className="flex-shrink-0 h-24 relative bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center aspect-[16/9]">
                            {doc.isGoogleDriveFile && doc.thumbnailUrl ? (
                              <div className="relative w-full h-full">
                                <img
                                  src={doc.thumbnailUrl}
                                  alt={`${doc.title} preview`}
                                  className="w-full h-full object-cover rounded-l-lg"
                                  onError={(e) => {
                                    // Fallback to icon on image error
                                    const target = e.target as HTMLImageElement
                                    const parent = target.parentElement
                                    if (parent) {
                                      parent.innerHTML = `
                                        <div class="${getIconColors()} w-16 h-16 rounded-xl flex items-center justify-center shadow-lg">
                                          <div class="text-white text-xs font-bold">${doc.fileExtension}</div>
                                        </div>
                                      `
                                    }
                                  }}
                                />
                                {/* File type badge */}
                                <div className="absolute top-2 right-2">
                                  <Badge className="bg-white/90 text-gray-700 text-xs px-2 py-1">
                                    {doc.fileExtension}
                                  </Badge>
                                </div>
                              </div>
                            ) : (
                              <div className={`w-20 h-12 ${getIconColors()} rounded-xl flex items-center justify-center shadow-lg`}>
                                {getFileIcon()}
                              </div>
                            )}
                          </div>

                          {/* Content Section */}
                          <div className="flex-1 p-6 flex flex-col justify-between">
                            <div className="flex items-start justify-between mb-4">
                              <h4 className="font-semibold text-gray-900 leading-tight text-lg">
                                {doc.title}
                              </h4>
                              {doc.isGoogleDriveFile && (
                                <Badge variant="outline" className="ml-2 text-xs border-purple-200 text-purple-600">
                                  <FolderOpen className="w-3 h-3 mr-1" />
                                  Drive
                                </Badge>
                              )}
                            </div>
                            
                            {/* Enhanced dual-button design */}
                            <div className="flex items-center gap-2 justify-end">
                              {doc.isGoogleDriveFile && doc.previewUrl && (
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button 
                                    size="sm"
                                    variant="outline"
                                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                                    onClick={() => window.open(doc.previewUrl, '_blank')}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    預覽
                                  </Button>
                                </motion.div>
                              )}
                              
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                  size="sm"
                                  className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white disabled:opacity-50"
                                  onClick={() => handleDocumentDownload(doc)}
                                  disabled={downloadingFiles.has(doc.id)}
                                >
                                  {downloadingFiles.has(doc.id) ? (
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                  ) : (
                                    <Download className="w-4 h-4 mr-1" />
                                  )}
                                  {downloadingFiles.has(doc.id) ? '下載中...' : '下載'}
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>

            <motion.div
              className="text-center mt-12"
              variants={itemVariants}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  View All Documents
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Call to Action */}
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
                Have Questions About Our Events?
              </motion.h3>
              <motion.p
                className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                We&apos;re here to help! Contact our team for more information about upcoming events and activities.
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
                    Contact Us
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
          variants={containerVariants}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto">
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