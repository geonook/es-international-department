/**
 * Homepage Settings Hook
 * 首頁設定資料管理 Hook
 */

import { useState, useEffect } from 'react'

interface HomepageSettings {
  heroImage?: string
  contentImage?: string
  mainTitle: string
  subtitle: string
  quoteText: string
  quoteAuthor: string
  exploreButtonText: string
  exploreButtonLink: string
  learnMoreButtonText: string
  learnMoreButtonLink: string
}

export function useHomepageSettings() {
  const [settings, setSettings] = useState<HomepageSettings>({
    mainTitle: 'Welcome to our Parents\' Corner',
    subtitle: 'Your dedicated family hub for school updates, events, and communication with your child\'s learning journey',
    quoteText: 'Parents are the cornerstone of a child\'s education; their support and collaboration with teachers create a powerful partnership that inspires and nurtures lifelong learners.',
    quoteAuthor: '',
    exploreButtonText: 'Explore Events',
    exploreButtonLink: '/events',
    learnMoreButtonText: 'More Resources',
    learnMoreButtonLink: '/resources'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/parents-corner/homepage')
      
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      } else {
        // 如果 API 失敗，使用預設值（已在 state 中設定）
        console.log('Using default homepage settings')
      }
    } catch (err) {
      console.error('Error loading homepage settings:', err)
      setError('Failed to load homepage settings')
    } finally {
      setLoading(false)
    }
  }

  return {
    settings,
    loading,
    error,
    refetch: loadSettings
  }
}