"use client"

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
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import MobileNav from "@/components/ui/mobile-nav"

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
  type: 'pdf' | 'doc' | 'link'
  category: string
  size?: string
  lastUpdated?: string
}

export default function StaticEventsPage() {
  // Scroll parallax effect
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])

  // Static events data
  const featuredEvent: StaticEvent = {
    id: 1,
    title: "Coffee with the Principal",
    description: "Join us for an informal coffee morning with our Principal. This is a wonderful opportunity to discuss your children's education, share feedback, and learn about upcoming initiatives. Parents are encouraged to bring questions and suggestions in a relaxed, friendly environment.",
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

  const documents: DocumentDownload[] = [
    {
      id: 1,
      title: "Coffee with Principal - February 2025",
      description: "Information sheet and agenda for the upcoming coffee morning",
      url: "/events/coffee-principal-feb-2025.pdf",
      type: "pdf",
      category: "Meeting",
      size: "245 KB",
      lastUpdated: "January 15, 2025"
    },
    {
      id: 2,
      title: "Cultural Day Registration Form",
      description: "Registration and participation form for International Cultural Day",
      url: "/events/cultural-day-registration.pdf",
      type: "pdf", 
      category: "Event",
      size: "189 KB",
      lastUpdated: "January 10, 2025"
    },
    {
      id: 3,
      title: "Sports Day Schedule & Rules",
      description: "Complete schedule and competition rules for Spring Sports Day",
      url: "/events/sports-day-guide.pdf",
      type: "pdf",
      category: "Event", 
      size: "512 KB",
      lastUpdated: "January 8, 2025"
    },
    {
      id: 4,
      title: "Parent Volunteer Opportunities",
      description: "Information about how parents can get involved in school activities",
      url: "/events/volunteer-opportunities.pdf",
      type: "pdf",
      category: "General",
      size: "156 KB",
      lastUpdated: "January 5, 2025"
    }
  ]

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
                { name: "Resources", href: "/resources", hasDropdown: true },
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

                  {/* Event Details */}
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

                  {/* Action Buttons */}
                  <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
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
                      src="/images/parent-child-reading.jpg"
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
          className="py-16 md:py-20 relative"
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
          </motion.div>
        </motion.section>

        {/* Documents Section */}
        <motion.section
          className="py-16 md:py-20 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-700 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
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

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div className="text-center mb-12" variants={itemVariants}>
              <motion.h3
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
                animate={{
                  textShadow: [
                    "0 0 10px rgba(255,255,255,0.5)",
                    "0 0 20px rgba(255,255,255,0.8)",
                    "0 0 10px rgba(255,255,255,0.5)",
                  ],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                Event Documents
              </motion.h3>
              <motion.p
                className="text-lg md:text-xl text-purple-100 max-w-3xl mx-auto"
                variants={itemVariants}
              >
                Download important forms, schedules, and information sheets for upcoming events
              </motion.p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-2 gap-6"
              variants={containerVariants}
            >
              {documents.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-2 leading-tight">
                            {doc.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-3">
                            {doc.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{doc.size}</span>
                              <span>•</span>
                              <span>Updated {doc.lastUpdated}</span>
                            </div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button 
                                size="sm"
                                className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white"
                                onClick={() => window.open(doc.url, '_blank')}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="text-center mt-12"
              variants={itemVariants}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-purple-700 px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
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
                We're here to help! Contact our team for more information about upcoming events and activities.
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
      </main>

      {/* Footer */}
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
      </motion.footer>
    </div>
  )
}