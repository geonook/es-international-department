/**
 * Pacing Guides Component
 * 學習進度指南組件 - 展示各年級學期學習指南
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, BookOpen } from 'lucide-react'
import Link from 'next/link'


// Material Design 3.0 guide structure
interface MaterialGuide {
  id: string
  grade: string
  gradeNumber: string
  title: string
  googleSheetsUrl: string
  primaryColor: string
  lightColor: string
  textColor: string
}

const pacingGuides: MaterialGuide[] = [
  {
    id: 'grade1',
    grade: 'Grade 1',
    gradeNumber: '1',
    title: 'Grade 1 Pacing Guide',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1ClRRDSHxDDO8JlPKvkchIwtatLzprTZ2b5ftxtnrm_Y/edit?gid=0#gid=0',
    primaryColor: 'bg-red-500',
    lightColor: 'bg-red-50',
    textColor: 'text-red-700'
  },
  {
    id: 'grade2',
    grade: 'Grade 2',
    gradeNumber: '2',
    title: 'Grade 2 Pacing Guide',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1IgEtEnJT24dFe9AdFJvQ_WuKwEUxpPA9YQQCkUu8u-c/edit?gid=0#gid=0',
    primaryColor: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    textColor: 'text-orange-700'
  },
  {
    id: 'grade3',
    grade: 'Grade 3',
    gradeNumber: '3',
    title: 'Grade 3 Pacing Guide',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1rYRK5sBBj995TRu1jfWWGdB0izz0QCPNZZJkbHKkDzk/edit?gid=0#gid=0',
    primaryColor: 'bg-amber-500',
    lightColor: 'bg-amber-50',
    textColor: 'text-amber-700'
  },
  {
    id: 'grade4',
    grade: 'Grade 4',
    gradeNumber: '4',
    title: 'Grade 4 Pacing Guide',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1fdlfrkrGYOM6cZEEnwf63NaTCvSGYKxLpiyllSXcp2k/edit?gid=0#gid=0',
    primaryColor: 'bg-emerald-500',
    lightColor: 'bg-emerald-50',
    textColor: 'text-emerald-700'
  },
  {
    id: 'grade5',
    grade: 'Grade 5',
    gradeNumber: '5',
    title: 'Grade 5 Pacing Guide',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1tFYNN2iD5uQG5ndN-MGWljeAkkrZV1T-YInPG39CEck/edit?gid=23748344#gid=23748344',
    primaryColor: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  {
    id: 'grade6',
    grade: 'Grade 6',
    gradeNumber: '6',
    title: 'Grade 6 Pacing Guide',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1K5l6ofUA0O5icbnt_MpK2OubtqFeFZyFjUprI4WZeFA/edit?gid=0#gid=0',
    primaryColor: 'bg-violet-500',
    lightColor: 'bg-violet-50',
    textColor: 'text-violet-700'
  },
  {
    id: 'kcfs',
    grade: 'KCFS',
    gradeNumber: 'K',
    title: 'KCFS Pacing Guide',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1nXN4oUiTXWNRYqOopmgOqQXmqtM1HYnzOehGkTM_zFc/edit?gid=0#gid=0',
    primaryColor: 'bg-pink-500',
    lightColor: 'bg-pink-50',
    textColor: 'text-pink-700'
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
    <section id="pacing-guides" className="py-20 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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

        {/* Material Design 3.0 Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {pacingGuides.map((guide) => (
            <motion.div key={guide.id} variants={itemVariants}>
              <Link href={guide.googleSheetsUrl} target="_blank" rel="noopener noreferrer">
                <motion.div
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100 overflow-hidden"
                  whileHover={{ 
                    scale: 1.02,
                    y: -4,
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25
                  }}
                >
                  {/* Colored Header Bar */}
                  <div className={`h-2 ${guide.primaryColor}`} />
                  
                  {/* Card Content */}
                  <div className="p-4">
                    {/* Grade and Term Display */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${guide.lightColor} rounded-lg flex items-center justify-center`}>
                          <span className={`text-lg font-bold ${guide.textColor}`}>
                            {guide.gradeNumber}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                            {guide.grade} - Term 1
                          </h3>
                        </div>
                      </div>
                      
                      {/* External Link Icon */}
                      <motion.div
                        className={`w-8 h-8 ${guide.lightColor} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}
                      >
                        <ExternalLink className={`w-3 h-3 ${guide.textColor}`} />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}