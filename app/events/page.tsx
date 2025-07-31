"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Calendar, Users, ExternalLink, Search, Sparkles, ChevronDown } from "lucide-react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"

/**
 * 活動頁面組件 - ES 國際部活動資訊
 * Events Page Component - ES International Department Events
 * 
 * @description 展示學校活動資訊，包括校長有約會議資料和各年級活動簡報
 * @features 校長有約分級資料、活動簡報下載、響應式設計、動畫效果
 * @author Claude Code | Generated for ES International Department
 */
export default function EventsPage() {
  // 滾動視差效果 | Scroll parallax effect
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])

  // 校長有約分級簡報資料 | Coffee with Principal grade-level presentation materials
  const coffeeWithPrincipalSlides = [
    { grades: "Grades 1-2", link: "#", description: "Early elementary presentation materials" },
    { grades: "Grades 3-4", link: "#", description: "Middle elementary presentation materials" },
    { grades: "Grades 5-6", link: "#", description: "Upper elementary presentation materials" },
  ]

  // 其他活動簡報資料 | Other event presentation materials
  const otherEventSlides = [
    { date: "11/29", title: "Grade 1 Presentation", link: "#" },
    { date: "11/29", title: "Grade 2 Presentation", link: "#" },
    { date: "11/29", title: "Grade 3 Presentation", link: "#" },
    { date: "11/29", title: "Grade 4 Presentation", link: "#" },
    { date: "11/29", title: "Grade 5 Presentation", link: "#" },
    { date: "11/29", title: "Grade 6 Presentation", link: "#" },
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
            className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6"
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
            Events
          </motion.h2>
          <motion.p
            className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Stay connected with our school community through various events and activities designed to enhance
            communication between families and school leadership.
          </motion.p>
        </motion.div>

        {/* Coffee with the Principal */}
        <motion.section
          className="mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants}>
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
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Users className="h-8 w-8" />
                  </motion.div>
                  Coffee with the Principal
                </CardTitle>
                <CardDescription className="text-amber-100 text-lg relative z-10">
                  Connect with school leadership and stay informed about our educational initiatives
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                    Our "Coffee with the Principal" sessions provide an excellent platform for parents and community
                    members to engage directly with school leadership. These informal yet informative gatherings offer
                    insights into our educational programs, upcoming initiatives, and opportunities for feedback.
                  </p>
                  <motion.div
                    className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-6 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-amber-800 font-medium text-lg">
                      Join us for meaningful conversations about your child's educational journey and our school's
                      vision for the future.
                    </p>
                  </motion.div>
                </motion.div>

                <h4 className="text-2xl font-semibold text-gray-900 mb-6">Presentation Materials by Grade Level</h4>
                <motion.div
                  className="grid md:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                >
                  {coffeeWithPrincipalSlides.map((slide, index) => (
                    <motion.div key={index} variants={itemVariants}>
                      <Card className="border-2 border-amber-200 hover:border-amber-400 transition-all duration-300 group overflow-hidden">
                        <CardHeader className="pb-3 bg-gradient-to-br from-amber-50 to-orange-50">
                          <CardTitle className="text-lg text-amber-700 group-hover:text-amber-900 transition-colors">
                            {slide.grades}
                          </CardTitle>
                          <CardDescription className="text-sm">{slide.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="flex gap-2">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 w-full bg-transparent hover:bg-amber-50"
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 w-full bg-transparent hover:bg-amber-50"
                              >
                                <ExternalLink className="h-4 w-4" />
                                View
                              </Button>
                            </motion.div>
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

        {/* Other Event Slides */}
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
                  className="absolute inset-0 bg-gradient-to-r from-purple-400/50 to-pink-500/50"
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
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Calendar className="h-8 w-8" />
                  </motion.div>
                  Other Event Presentations
                </CardTitle>
                <CardDescription className="text-purple-100 text-lg relative z-10">
                  Additional event materials organized by date and grade level
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h4 className="text-2xl font-semibold text-gray-900 mb-3">November 29th Event Materials</h4>
                  <p className="text-gray-600 text-lg">
                    Access presentation slides from our recent grade-level events and activities.
                  </p>
                </motion.div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                >
                  {otherEventSlides.map((slide, index) => (
                    <motion.div key={index} variants={itemVariants}>
                      <Card className="border border-purple-200 hover:border-purple-400 transition-all duration-300 group hover:shadow-xl">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <motion.span
                              className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full"
                              whileHover={{ scale: 1.05 }}
                            >
                              {slide.date}
                            </motion.span>
                          </div>
                          <h5 className="font-medium text-gray-900 mb-4 text-lg group-hover:text-purple-700 transition-colors">
                            {slide.title}
                          </h5>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full gap-2 bg-transparent hover:bg-purple-50"
                            >
                              <Download className="h-4 w-4" />
                              Download Slides
                            </Button>
                          </motion.div>
                        </CardContent>
                      </Card>
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
