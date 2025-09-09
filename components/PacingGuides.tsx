/**
 * Pacing Guides Component
 * 學習進度指南組件 - 展示各年級學期學習指南
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, BookOpen, Users, Calendar, Download } from 'lucide-react'
import Link from 'next/link'

interface PacingGuide {
  id: string
  grade: string
  title: string
  description: string
  term: string
  subjects: string[]
  googleSheetsUrl: string
  lastUpdated: string
  status: 'active' | 'draft' | 'archived'
}

const pacingGuides: PacingGuide[] = [
  {
    id: 'grade1-term1',
    grade: 'Grade 1',
    title: 'Grade 1 Term 1 Pacing Guide',
    description: 'Comprehensive learning guide for Grade 1 students covering all essential subjects and milestones for the first term.',
    term: 'Term 1',
    subjects: ['English', 'Math', 'Science', 'Social Studies', 'Art'],
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/example-grade1-term1',
    lastUpdated: '2025-01-15',
    status: 'active'
  },
  {
    id: 'grade2-term1',
    grade: 'Grade 2',
    title: 'Grade 2 Term 1 Pacing Guide',
    description: 'Detailed curriculum progression for Grade 2 students with learning objectives and assessment criteria.',
    term: 'Term 1',
    subjects: ['English', 'Math', 'Science', 'Social Studies', 'Art', 'PE'],
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/example-grade2-term1',
    lastUpdated: '2025-01-15',
    status: 'active'
  },
  {
    id: 'grade3-term1',
    grade: 'Grade 3',
    title: 'Grade 3 Term 1 Pacing Guide',
    description: 'Advanced learning framework for Grade 3 students with enhanced critical thinking components.',
    term: 'Term 1',
    subjects: ['English', 'Math', 'Science', 'Social Studies', 'Art', 'PE', 'Music'],
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/example-grade3-term1',
    lastUpdated: '2025-01-15',
    status: 'active'
  },
  {
    id: 'grade4-term1',
    grade: 'Grade 4',
    title: 'Grade 4 Term 1 Pacing Guide',
    description: 'Comprehensive curriculum guide focusing on independent learning and research skills development.',
    term: 'Term 1',
    subjects: ['English', 'Math', 'Science', 'Social Studies', 'Art', 'PE', 'Music', 'Technology'],
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/example-grade4-term1',
    lastUpdated: '2025-01-15',
    status: 'active'
  },
  {
    id: 'grade5-term1',
    grade: 'Grade 5',
    title: 'Grade 5 Term 1 Pacing Guide',
    description: 'Advanced curriculum with emphasis on project-based learning and collaborative problem solving.',
    term: 'Term 1',
    subjects: ['English', 'Math', 'Science', 'Social Studies', 'Art', 'PE', 'Music', 'Technology', 'Leadership'],
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/example-grade5-term1',
    lastUpdated: '2025-01-15',
    status: 'active'
  },
  {
    id: 'grade6-term1',
    grade: 'Grade 6',
    title: 'Grade 6 Term 1 Pacing Guide',
    description: 'Pre-secondary preparation curriculum with advanced academic and personal development focus.',
    term: 'Term 1',
    subjects: ['English', 'Math', 'Science', 'Social Studies', 'Art', 'PE', 'Music', 'Technology', 'Leadership', 'Career Prep'],
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/example-grade6-term1',
    lastUpdated: '2025-01-15',
    status: 'active'
  },
  {
    id: 'kcfs-guide',
    grade: 'KCFS',
    title: 'KCFS Curriculum Guide',
    description: 'Kindergarten and early childhood curriculum framework with developmental milestones and activities.',
    term: 'Full Year',
    subjects: ['Language Development', 'Math Foundations', 'Social Skills', 'Creative Arts', 'Physical Development'],
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/example-kcfs-guide',
    lastUpdated: '2025-01-15',
    status: 'active'
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

  const getGradeColor = (grade: string) => {
    const colors = {
      'Grade 1': 'bg-red-100 text-red-700',
      'Grade 2': 'bg-orange-100 text-orange-700',
      'Grade 3': 'bg-yellow-100 text-yellow-700',
      'Grade 4': 'bg-green-100 text-green-700',
      'Grade 5': 'bg-blue-100 text-blue-700',
      'Grade 6': 'bg-purple-100 text-purple-700',
      'KCFS': 'bg-pink-100 text-pink-700'
    }
    return colors[grade as keyof typeof colors] || 'bg-gray-100 text-gray-700'
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

        {/* Guides Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {pacingGuides.map((guide) => (
            <motion.div key={guide.id} variants={itemVariants}>
              <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`${getGradeColor(guide.grade)} font-semibold px-3 py-1`}>
                      {guide.grade}
                    </Badge>
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      {guide.term}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {guide.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {guide.description}
                  </p>

                  {/* Subjects Tags */}
                  <div className="flex flex-wrap gap-1">
                    {guide.subjects.slice(0, 4).map((subject) => (
                      <Badge key={subject} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                    {guide.subjects.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{guide.subjects.length - 4} more
                      </Badge>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Updated: {guide.lastUpdated}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{guide.subjects.length} subjects</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <Link href={guide.googleSheetsUrl} target="_blank" rel="noopener noreferrer">
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                        size="sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in Google Sheets
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
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