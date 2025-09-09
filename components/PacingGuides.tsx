/**
 * Pacing Guides Component
 * 學習進度指南組件 - 展示各年級學期學習指南
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, BookOpen, Download } from 'lucide-react'
import Link from 'next/link'


// Simplified guide structure for button grid
interface SimpleGuide {
  id: string
  grade: string
  gradeNumber: string
  title: string
  googleSheetsUrl: string
  gradientFrom: string
  gradientTo: string
  shadowColor: string
}

const pacingGuides: SimpleGuide[] = [
  {
    id: 'grade1',
    grade: 'Grade 1',
    gradeNumber: '1',
    title: 'Grade 1 Pacing Guide',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1ClRRDSHxDDO8JlPKvkchIwtatLzprTZ2b5ftxtnrm_Y/edit?gid=0#gid=0',
    gradientFrom: 'from-red-500',
    gradientTo: 'to-red-600',
    shadowColor: 'shadow-red-500/25'
  },
  {
    id: 'grade2',
    grade: 'Grade 2',
    gradeNumber: '2',
    title: 'Grade 2 Pacing Guide',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1IgEtEnJT24dFe9AdFJvQ_WuKwEUxpPA9YQQCkUu8u-c/edit?gid=0#gid=0',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-orange-600',
    shadowColor: 'shadow-orange-500/25'
  },
  {
    id: 'grade3',
    grade: 'Grade 3',
    gradeNumber: '3',
    title: 'Grade 3 Pacing Guide',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1rYRK5sBBj995TRu1jfWWGdB0izz0QCPNZZJkbHKkDzk/edit?gid=0#gid=0',
    gradientFrom: 'from-yellow-500',
    gradientTo: 'to-yellow-600',
    shadowColor: 'shadow-yellow-500/25'
  },
  {
    id: 'grade4',
    grade: 'Grade 4',
    gradeNumber: '4',
    title: 'Grade 4 Pacing Guide',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1fdlfrkrGYOM6cZEEnwf63NaTCvSGYKxLpiyllSXcp2k/edit?gid=0#gid=0',
    gradientFrom: 'from-green-500',
    gradientTo: 'to-green-600',
    shadowColor: 'shadow-green-500/25'
  },
  {
    id: 'grade5',
    grade: 'Grade 5',
    gradeNumber: '5',
    title: 'Grade 5 Pacing Guide',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1tFYNN2iD5uQG5ndN-MGWljeAkkrZV1T-YInPG39CEck/edit?gid=23748344#gid=23748344',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-blue-600',
    shadowColor: 'shadow-blue-500/25'
  },
  {
    id: 'grade6',
    grade: 'Grade 6',
    gradeNumber: '6',
    title: 'Grade 6 Pacing Guide',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1K5l6ofUA0O5icbnt_MpK2OubtqFeFZyFjUprI4WZeFA/edit?gid=0#gid=0',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-purple-600',
    shadowColor: 'shadow-purple-500/25'
  },
  {
    id: 'kcfs',
    grade: 'KCFS',
    gradeNumber: 'K',
    title: 'KCFS Pacing Guide',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1nXN4oUiTXWNRYqOopmgOqQXmqtM1HYnzOehGkTM_zFc/edit?gid=0#gid=0',
    gradientFrom: 'from-pink-500',
    gradientTo: 'to-pink-600',
    shadowColor: 'shadow-pink-500/25'
  }
]

export default function PacingGuides() {
  // 動畫變體
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
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }


  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Pacing Guides
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We are excited to share our SY25-26 pacing guides with you! These guides outline the weekly plans for what will be covered in both our LTs' and ITs' courses. 
            We encourage you to review them periodically, as some details may change due to unforeseen circumstances. 
            Simply select the correct grade and then the correct level E1, E2, E3 on the bottom tab.
          </p>
        </motion.div>

        {/* Minimalist Button Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {pacingGuides.map((guide) => (
            <motion.div key={guide.id} variants={itemVariants}>
              <Link href={guide.googleSheetsUrl} target="_blank" rel="noopener noreferrer">
                <motion.button
                  className={`relative w-full aspect-square bg-gradient-to-br ${guide.gradientFrom} ${guide.gradientTo} rounded-3xl shadow-lg ${guide.shadowColor} hover:shadow-2xl transition-all duration-500 group overflow-hidden`}
                  whileHover={{ 
                    scale: 1.05,
                    y: -8,
                    rotateX: -5,
                    rotateY: 5,
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                >
                  {/* Animated gradient background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    animate={{
                      backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{ backgroundSize: "200% 200%" }}
                  />
                  
                  {/* Floating particles effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                      className="absolute w-20 h-20 bg-white/10 rounded-full blur-xl -top-10 -left-10"
                      animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div
                      className="absolute w-16 h-16 bg-white/10 rounded-full blur-xl -bottom-8 -right-8"
                      animate={{
                        x: [0, -80, 0],
                        y: [0, -40, 0],
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col items-center justify-center p-6">
                    {/* Grade Number */}
                    <motion.div
                      className="text-6xl md:text-7xl font-bold text-white mb-2 drop-shadow-lg"
                      whileHover={{ 
                        scale: 1.1,
                        rotate: 5,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 15
                      }}
                    >
                      {guide.gradeNumber}
                    </motion.div>
                    
                    {/* Grade Label */}
                    <div className="text-white/90 font-medium text-sm mb-4">
                      {guide.grade === 'KCFS' ? 'KCFS' : `Grade ${guide.gradeNumber}`}
                    </div>
                    
                    {/* Pacing Guide Text */}
                    <div className="text-white/80 text-xs font-medium uppercase tracking-wider">
                      Pacing Guide
                    </div>
                    
                    {/* External Link Icon */}
                    <motion.div
                      className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                      whileHover={{ 
                        scale: 1.2,
                        rotate: 360,
                        backgroundColor: "rgba(255, 255, 255, 0.3)"
                      }}
                      transition={{
                        duration: 0.5,
                        ease: "easeInOut"
                      }}
                    >
                      <ExternalLink className="w-4 h-4 text-white" />
                    </motion.div>
                    
                    {/* Hover indicator */}
                    <motion.div
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      animate={{
                        y: [0, -5, 0],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="text-white/60 text-xs">Click to Open</div>
                    </motion.div>
                  </div>
                  
                  {/* Ripple effect on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{
                      scale: [1, 1.5],
                      opacity: [0.3, 0],
                    }}
                    transition={{
                      duration: 1,
                      ease: "easeOut",
                    }}
                    style={{
                      background: "radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)",
                    }}
                  />
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-blue-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Download className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-blue-900">
                Important Notes
              </h3>
            </div>
            <div className="space-y-3 text-blue-800">
              <p>
                • All Pacing Guides are accessible via Google Spreadsheets for easy viewing and printing
              </p>
              <p>
                • Guides may be updated during the term - please check back regularly
              </p>
              <p>
                • Each guide includes learning objectives, assessment criteria, and suggested home activities
              </p>
              <p>
                • Contact your child's teacher for specific questions about curriculum content
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}