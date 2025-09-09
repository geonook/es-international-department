/**
 * ID Squads Component
 * ID小隊展示系統 - 14個角色小隊的互動展示
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
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
  Anchor
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
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {squads.map((squad) => {
            const firstLetter = squad.name.charAt(0).toUpperCase()
            return (
              <motion.div key={squad.id} variants={itemVariants}>
                <Card className="bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center mb-4 shadow-lg">
                      <span className="text-2xl font-bold text-white">
                        {firstLetter}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {squad.name}
                    </h3>
                    <div className="w-12 h-0.5 bg-purple-600 mx-auto mb-3"></div>
                    <p className="text-xs text-gray-600">
                      Excellence • Leadership • Innovation
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

      </div>
    </section>
  )
}