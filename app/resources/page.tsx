"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  BookOpen, 
  Download, 
  ExternalLink, 
  Play, 
  FileText, 
  Users, 
  Search, 
  Sparkles, 
  ChevronDown,
  Filter,
  AlertCircle,
  Folder,
  Eye
} from "lucide-react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"

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
  
  // State management
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  
  // Load resource data
  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Build query parameters
      const params = new URLSearchParams()
      params.set('status', 'published')
      params.set('limit', '100')
      
      const response = await fetch(`/api/resources?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setResources(data.data || [])
      } else {
        // If API doesn't exist, use static data
        setResources(staticResources)
      }
    } catch (error) {
      console.error('Fetch resources error:', error)
      // Use static data when loading fails
      setResources(staticResources)
    } finally {
      setIsLoading(false)
    }
  }

  // Static resource data as fallback
  const staticResources: Resource[] = [
    {
      id: 1,
      title: "myView Transition Materials",
      description: "Comprehensive transition learning materials in PDF format",
      resourceType: "pdf",
      gradeLevel: "1-2",
      category: "reading",
      downloadUrl: "/resources/myview-transition.pdf",
      tags: ["transition", "reading"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Teacher Chen" }
    },
    {
      id: 2,
      title: "Reading Buddies Program",
      description: "Interactive reading partnership program with video resources",
      resourceType: "video",
      gradeLevel: "1-2",
      category: "reading",
      externalUrl: "https://example.com/reading-buddies",
      tags: ["reading", "partnership"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Teacher Wang" }
    },
    {
      id: 3,
      title: "The Five Components of Reading",
      description: "Core reading skills explanation with Google Drive resources",
      resourceType: "document",
      gradeLevel: "1-2",
      category: "reading",
      externalUrl: "https://drive.google.com/example",
      tags: ["reading", "skills"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Teacher Lin" }
    },
    {
      id: 4,
      title: "Weekly Reading Challenge",
      description: "Weekly texts and quizzes for reading comprehension",
      resourceType: "interactive",
      gradeLevel: "1-2",
      category: "reading",
      externalUrl: "https://example.com/reading-challenge",
      tags: ["reading", "quiz"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Teacher Wu" }
    },
    {
      id: 5,
      title: "Building Background Knowledge",
      description: "Language learning resources and daily reading content via ReadWorks",
      resourceType: "external",
      gradeLevel: "1-2",
      category: "language",
      externalUrl: "https://readworks.org",
      tags: ["language", "background"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Teacher Liu" }
    },
    {
      id: 6,
      title: "Advanced Reading Comprehension",
      description: "Enhanced reading materials for intermediate learners",
      resourceType: "pdf",
      gradeLevel: "3-4",
      category: "reading",
      downloadUrl: "/resources/advanced-reading.pdf",
      tags: ["reading", "comprehension"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Teacher Zhou" }
    },
    {
      id: 7,
      title: "Writing Workshop Resources",
      description: "Creative and academic writing support materials",
      resourceType: "document",
      gradeLevel: "3-4",
      category: "writing",
      externalUrl: "https://drive.google.com/writing-workshop",
      tags: ["writing", "creative"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Teacher Huang" }
    },
    {
      id: 8,
      title: "Critical Thinking Materials",
      description: "Advanced analytical and critical thinking resources",
      resourceType: "interactive",
      gradeLevel: "5-6",
      category: "thinking",
      externalUrl: "https://example.com/critical-thinking",
      tags: ["thinking", "analysis"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Teacher Zhang" }
    },
    {
      id: 9,
      title: "Research Project Guides",
      description: "Comprehensive guides for independent research projects",
      resourceType: "pdf",
      gradeLevel: "5-6",
      category: "research",
      downloadUrl: "/resources/research-guides.pdf",
      tags: ["research", "projects"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      creator: { displayName: "Teacher Xu" }
    }
  ]

  // Filter resources
  const filteredResources = resources.filter(resource => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        resource.title.toLowerCase().includes(query) ||
        (resource.description && resource.description.toLowerCase().includes(query)) ||
        (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(query)))
      
      if (!matchesSearch) return false
    }
    
    // Grade level filter
    if (selectedGrade !== 'all' && resource.gradeLevel !== selectedGrade) {
      return false
    }
    
    // Category filter
    if (selectedCategory !== 'all' && resource.category !== selectedCategory) {
      return false
    }
    
    // Resource type filter
    if (selectedType !== 'all' && resource.resourceType !== selectedType) {
      return false
    }
    
    return true
  })

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

  // Get resource type display name
  const getResourceTypeName = (type: string) => {
    switch (type) {
      case 'pdf': return 'PDF Document'
      case 'video': return 'Video'
      case 'document': return 'Document'
      case 'interactive': return 'Interactive'
      case 'external': return 'External Link'
      default: return type
    }
  }

  // Group resources by grade level
  const groupedByGrade = filteredResources.reduce((acc, resource) => {
    const grade = resource.gradeLevel || 'other'
    if (!acc[grade]) acc[grade] = []
    acc[grade].push(resource)
    return acc
  }, {} as Record<string, Resource[]>)

  const gradeColors: Record<string, string> = {
    '1-2': 'from-blue-500 to-blue-600',
    '3-4': 'from-green-500 to-green-600',
    '5-6': 'from-purple-500 to-purple-600',
    'other': 'from-gray-500 to-gray-600'
  }

  const gradeNames: Record<string, string> = {
    '1-2': 'Grades 1-2',
    '3-4': 'Grades 3-4', 
    '5-6': 'Grades 5-6',
    'other': 'Other Grades'
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

        {/* Search and Filter */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/80 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search resource titles, descriptions, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Filter Options */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Grade Level Filter */}
                  <div className="flex-1">
                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Grade Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grade Levels</SelectItem>
                        <SelectItem value="1-2">Grades 1-2</SelectItem>
                        <SelectItem value="3-4">Grades 3-4</SelectItem>
                        <SelectItem value="5-6">Grades 5-6</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Category Filter */}
                  <div className="flex-1">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="writing">Writing</SelectItem>
                        <SelectItem value="language">Language</SelectItem>
                        <SelectItem value="thinking">Critical Thinking</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Resource Type Filter */}
                  <div className="flex-1">
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Resource Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="interactive">Interactive</SelectItem>
                        <SelectItem value="external">External Link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

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

        {/* Loading State */}
        {isLoading && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Resource Categories by Grade */}
        {!isLoading && Object.keys(groupedByGrade).length > 0 ? (
          Object.entries(groupedByGrade).map(([grade, gradeResources]) => (
            <motion.section
              key={grade}
              className="mb-16"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants}>
                <Card className="bg-white/90 backdrop-blur-lg shadow-2xl border-0 overflow-hidden">
                  <CardHeader className={`bg-gradient-to-r ${gradeColors[grade] || gradeColors.other} text-white relative overflow-hidden`}>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
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
                        animate={{
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <BookOpen className="h-8 w-8" />
                      </motion.div>
                      {gradeNames[grade] || grade} Resources
                    </CardTitle>
                    <CardDescription className="text-white/90 text-lg relative z-10">
                      Specialized learning materials for {gradeNames[grade] || grade} students
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <motion.div
                      className="grid gap-8"
                      variants={containerVariants}
                      initial="hidden"
                      whileInView="visible"
                    >
                      {gradeResources.map((resource) => {
                        const IconComponent = getResourceIcon(resource.resourceType)
                        
                        return (
                          <motion.div key={resource.id} variants={itemVariants}>
                            <Card className="border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 group hover:shadow-xl">
                              <CardContent className="p-8">
                                <div className="flex items-start gap-6">
                                  <motion.div
                                    className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl group-hover:from-purple-100 group-hover:to-purple-200 transition-all duration-300"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                  >
                                    <IconComponent className="h-8 w-8 text-gray-600 group-hover:text-purple-600 transition-colors" />
                                  </motion.div>
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between mb-3">
                                      <h4 className="text-xl font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                                        {resource.title}
                                      </h4>
                                      <motion.div whileHover={{ scale: 1.05 }}>
                                        <Badge variant="outline" className="ml-3 text-sm py-1 px-3">
                                          {getResourceTypeName(resource.resourceType)}
                                        </Badge>
                                      </motion.div>
                                    </div>
                                    {resource.description && (
                                      <p className="text-gray-600 mb-4 text-lg leading-relaxed">{resource.description}</p>
                                    )}
                                    
                                    {/* Tags */}
                                    {resource.tags && resource.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mb-4">
                                        {resource.tags.map((tag) => (
                                          <Badge key={tag} variant="secondary" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                    
                                    <div className="flex gap-3">
                                      {resource.externalUrl && (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-2 bg-transparent hover:bg-purple-50"
                                            onClick={() => window.open(resource.externalUrl, '_blank')}
                                          >
                                            <ExternalLink className="h-4 w-4" />
                                            Open Resource
                                          </Button>
                                        </motion.div>
                                      )}
                                      {resource.fileUrl && (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-2 bg-transparent hover:bg-blue-50"
                                            onClick={() => window.open(resource.fileUrl, '_blank')}
                                          >
                                            <Eye className="h-4 w-4" />
                                            View
                                          </Button>
                                        </motion.div>
                                      )}
                                      {resource.downloadUrl && (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-2 bg-transparent hover:bg-green-50"
                                            onClick={() => {
                                              const link = document.createElement('a')
                                              link.href = resource.downloadUrl!
                                              link.download = ''
                                              link.click()
                                            }}
                                          >
                                            <Download className="h-4 w-4" />
                                            Download
                                          </Button>
                                        </motion.div>
                                      )}
                                    </div>
                                    
                                    {/* Creator Information */}
                                    {resource.creator && (
                                      <div className="flex items-center gap-2 mt-4 pt-4 border-t text-xs text-gray-500">
                                        <Users className="w-3 h-3" />
                                        <span>Provider: {resource.creator.displayName}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.section>
          ))
        ) : (
          // Display when no resources are available
          !isLoading && (
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="text-center py-12"
            >
              <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchQuery || selectedGrade !== 'all' || selectedCategory !== 'all' || selectedType !== 'all'
                  ? 'No resources found matching criteria' 
                  : 'No resources available'}
              </h3>
              <p className="text-gray-600">
                {searchQuery || selectedGrade !== 'all' || selectedCategory !== 'all' || selectedType !== 'all'
                  ? 'Please try adjusting your search criteria' 
                  : 'Please stay tuned for more learning resources'}
              </p>
            </motion.div>
          )
        )}

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
                        Comprehensive reading comprehension platform with thousands of articles and passages.
                      </p>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="sm" variant="outline" className="gap-2 bg-transparent hover:bg-orange-100">
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
                      <h4 className="font-semibold text-blue-900 mb-3 text-xl">Google Drive Resources</h4>
                      <p className="text-blue-800 mb-4 leading-relaxed">
                        Centralized access to all our digital learning materials and resources.
                      </p>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="sm" variant="outline" className="gap-2 bg-transparent hover:bg-blue-100">
                          <ExternalLink className="h-4 w-4" />
                          Access Drive
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
