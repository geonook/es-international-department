/**
 * ID Squads Component
 * ID小隊展示系統 - 14個角色小隊的互動展示
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Award, 
  Star, 
  Target, 
  Compass, 
  Lightbulb,
  Rocket,
  Shield,
  Eye,
  Map,
  Search,
  Zap,
  Crown,
  Anchor,
  X
} from 'lucide-react'

interface Squad {
  id: string
  name: string
  description: string
  values: string[]
  color: string
  bgColor: string
  icon: React.ComponentType<{ className?: string }>
  motto: string
  characteristics: string[]
}

const squads: Squad[] = [
  {
    id: 'achievers',
    name: 'Achievers',
    description: 'Dedicated to excellence and reaching new heights through perseverance and hard work.',
    values: ['Excellence', 'Perseverance', 'Goal-setting', 'Success'],
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    icon: Target,
    motto: 'Excellence is not a destination, it\'s a way of traveling.',
    characteristics: ['Goal-oriented', 'Determined', 'High standards', 'Results-focused']
  },
  {
    id: 'adventurers',
    name: 'Adventurers',
    description: 'Brave explorers who embrace challenges and seek new experiences with courage.',
    values: ['Courage', 'Exploration', 'Risk-taking', 'Discovery'],
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    icon: Compass,
    motto: 'Adventure awaits those who dare to explore.',
    characteristics: ['Brave', 'Curious', 'Bold', 'Enthusiastic']
  },
  {
    id: 'discoverers',
    name: 'Discoverers',
    description: 'Curious minds who uncover hidden truths and make groundbreaking findings.',
    values: ['Curiosity', 'Investigation', 'Knowledge', 'Wonder'],
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
    icon: Search,
    motto: 'Every question leads to a new discovery.',
    characteristics: ['Inquisitive', 'Observant', 'Analytical', 'Wonder-filled']
  },
  {
    id: 'explorers',
    name: 'Explorers',
    description: 'Pioneering spirits who venture into uncharted territories and break new ground.',
    values: ['Innovation', 'Pioneering', 'Adventure', 'Leadership'],
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    icon: Map,
    motto: 'The world is our classroom, exploration is our method.',
    characteristics: ['Pioneering', 'Adventurous', 'Independent', 'Resourceful']
  },
  {
    id: 'guardians',
    name: 'Guardians',
    description: 'Protectors of values and community who stand strong for what\'s right.',
    values: ['Protection', 'Integrity', 'Loyalty', 'Service'],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: Shield,
    motto: 'Standing strong to protect what matters most.',
    characteristics: ['Protective', 'Loyal', 'Reliable', 'Principled']
  },
  {
    id: 'innovators',
    name: 'Innovators',
    description: 'Creative thinkers who transform ideas into reality and shape the future.',
    values: ['Creativity', 'Innovation', 'Progress', 'Change'],
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-200',
    icon: Lightbulb,
    motto: 'Innovation distinguishes between a leader and a follower.',
    characteristics: ['Creative', 'Forward-thinking', 'Problem-solving', 'Original']
  },
  {
    id: 'inventors',
    name: 'Inventors',
    description: 'Masterful creators who design solutions and bring imagination to life.',
    values: ['Creation', 'Problem-solving', 'Imagination', 'Ingenuity'],
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    icon: Zap,
    motto: 'Imagination is the beginning of creation.',
    characteristics: ['Inventive', 'Practical', 'Solution-focused', 'Hands-on']
  },
  {
    id: 'navigators',
    name: 'Navigators',
    description: 'Skilled guides who chart courses and lead others toward success.',
    values: ['Direction', 'Guidance', 'Leadership', 'Wisdom'],
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 border-pink-200',
    icon: Compass,
    motto: 'True navigation requires both map and compass.',
    characteristics: ['Directional', 'Guiding', 'Strategic', 'Wise']
  },
  {
    id: 'pathfinders',
    name: 'Pathfinders',
    description: 'Trail blazers who create new routes and open possibilities for others.',
    values: ['Pioneering', 'Initiative', 'Independence', 'Courage'],
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 border-teal-200',
    icon: Map,
    motto: 'Every path begins with a single step forward.',
    characteristics: ['Trail-blazing', 'Initiative-taking', 'Independent', 'Courageous']
  },
  {
    id: 'pioneers',
    name: 'Pioneers',
    description: 'First movers who establish foundations and pave the way for future generations.',
    values: ['Foundation', 'Legacy', 'Progress', 'Vision'],
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 border-cyan-200',
    icon: Rocket,
    motto: 'Pioneers plant trees whose shade they\'ll never enjoy.',
    characteristics: ['Foundation-building', 'Visionary', 'Legacy-minded', 'Progressive']
  },
  {
    id: 'seekers',
    name: 'Seekers',
    description: 'Persistent searchers who pursue truth, knowledge, and understanding.',
    values: ['Truth', 'Knowledge', 'Persistence', 'Understanding'],
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200',
    icon: Eye,
    motto: 'Seek and you shall find; knock and it shall be opened.',
    characteristics: ['Truth-seeking', 'Persistent', 'Deep-thinking', 'Questioning']
  },
  {
    id: 'trailblazers',
    name: 'Trailblazers',
    description: 'Bold leaders who create new paths and inspire others to follow their dreams.',
    values: ['Leadership', 'Innovation', 'Inspiration', 'Boldness'],
    color: 'text-lime-600',
    bgColor: 'bg-lime-50 border-lime-200',
    icon: Star,
    motto: 'Blaze trails that others dare to follow.',
    characteristics: ['Trail-creating', 'Inspiring', 'Bold', 'Leadership-oriented']
  },
  {
    id: 'visionaries',
    name: 'Visionaries',
    description: 'Future-focused dreamers who see possibilities and inspire transformational change.',
    values: ['Vision', 'Future-thinking', 'Inspiration', 'Change'],
    color: 'text-violet-600',
    bgColor: 'bg-violet-50 border-violet-200',
    icon: Eye,
    motto: 'Vision without action is merely a dream; action without vision is wasted effort.',
    characteristics: ['Future-focused', 'Inspiring', 'Transformational', 'Dream-driven']
  },
  {
    id: 'voyagers',
    name: 'Voyagers',
    description: 'Adventurous travelers who embrace journeys of discovery and personal growth.',
    values: ['Journey', 'Growth', 'Discovery', 'Adventure'],
    color: 'text-sky-600',
    bgColor: 'bg-sky-50 border-sky-200',
    icon: Anchor,
    motto: 'The journey of discovery begins with a single voyage.',
    characteristics: ['Journey-focused', 'Growth-minded', 'Adventurous', 'Discovery-driven']
  }
]

export default function IDSquads() {
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(null)

  // 動畫變體
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.9 },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300
      }
    },
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Our ID Squads
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-6">
            The ID Squads are at the heart of our ID community spirit! This dynamic house system encourages 
            teamwork, friendship, and healthy competition while developing leadership skills and fostering collaboration.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-500" />
              <span>Build friendships</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-purple-500" />
              <span>Develop leadership</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span>Promote collaboration</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-500" />
              <span>Create healthy competition</span>
            </div>
          </div>
        </motion.div>

        {/* Squads Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {squads.map((squad) => {
            const IconComponent = squad.icon
            return (
              <motion.div 
                key={squad.id} 
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card 
                  className={`h-full ${squad.bgColor} border-2 cursor-pointer hover:shadow-lg transition-all duration-300 group`}
                  onClick={() => setSelectedSquad(squad)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <div className={`w-16 h-16 mx-auto rounded-full bg-white shadow-md flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className={`w-8 h-8 ${squad.color}`} />
                      </div>
                      <h3 className={`text-lg font-bold ${squad.color} group-hover:scale-105 transition-transform duration-300`}>
                        {squad.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {squad.description}
                    </p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {squad.values.slice(0, 2).map((value) => (
                        <Badge 
                          key={value} 
                          variant="secondary" 
                          className="text-xs bg-white/70"
                        >
                          {value}
                        </Badge>
                      ))}
                      {squad.values.length > 2 && (
                        <Badge variant="secondary" className="text-xs bg-white/70">
                          +{squad.values.length - 2}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Squad Detail Modal */}
        <AnimatePresence>
          {selectedSquad && (
            <motion.div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSquad(null)}
            >
              <motion.div
                className={`bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${selectedSquad.bgColor} border-2`}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center`}>
                      <selectedSquad.icon className={`w-8 h-8 ${selectedSquad.color}`} />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${selectedSquad.color}`}>
                        {selectedSquad.name}
                      </h3>
                      <p className="text-gray-600 text-sm">ID Squad</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedSquad(null)}
                    className="hover:bg-white/70"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700">{selectedSquad.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Squad Motto</h4>
                    <p className={`italic text-lg ${selectedSquad.color} font-medium`}>
                      "{selectedSquad.motto}"
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Core Values</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSquad.values.map((value) => (
                        <Badge 
                          key={value} 
                          className={`${selectedSquad.color} bg-white/80`}
                        >
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Key Characteristics</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedSquad.characteristics.map((characteristic) => (
                        <div 
                          key={characteristic}
                          className="flex items-center gap-2 bg-white/60 rounded-lg p-2"
                        >
                          <Star className={`w-4 h-4 ${selectedSquad.color}`} />
                          <span className="text-sm text-gray-700">{characteristic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}