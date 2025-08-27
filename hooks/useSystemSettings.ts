/**
 * System Settings Hook for KCISLK ESID Info Hub
 * 系統設定 Hook - 用於獲取和管理系統設定
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

interface SystemSetting {
  id: number
  key: string
  value: any
  description?: string
  dataType: 'string' | 'number' | 'boolean' | 'json'
  updatedAt: string
}

interface UseSystemSettingsOptions {
  key?: string
  refreshInterval?: number
  enabled?: boolean
}

interface UseSystemSettingsReturn {
  settings: SystemSetting | SystemSetting[] | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateSetting: (key: string, value: any) => Promise<boolean>
}

/**
 * Hook for fetching and managing system settings
 */
export function useSystemSettings(options: UseSystemSettingsOptions = {}): UseSystemSettingsReturn {
  const { key, refreshInterval = 0, enabled = true } = options
  
  const [settings, setSettings] = useState<SystemSetting | SystemSetting[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    if (!enabled) return

    try {
      setIsLoading(true)
      setError(null)

      const url = key 
        ? `/api/settings?key=${encodeURIComponent(key)}`
        : '/api/settings'

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch settings')
      }

      setSettings(result.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error fetching system settings:', err)
    } finally {
      setIsLoading(false)
    }
  }, [key, enabled])

  const updateSetting = useCallback(async (settingKey: string, value: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: settingKey,
          value: value,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to update setting')
      }

      // 重新獲取設定以更新本地狀態
      await fetchSettings()
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error updating system setting:', err)
      return false
    }
  }, [fetchSettings])

  // 初始載入
  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // 定期刷新（如果設定了 refreshInterval）
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchSettings, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchSettings, refreshInterval])

  return {
    settings,
    isLoading,
    error,
    refetch: fetchSettings,
    updateSetting,
  }
}

/**
 * Hook for fetching a single system setting
 */
export function useSystemSetting(key: string, options: Omit<UseSystemSettingsOptions, 'key'> = {}) {
  const result = useSystemSettings({ key, ...options })
  
  return {
    ...result,
    setting: result.settings as SystemSetting | null,
    value: (result.settings as SystemSetting)?.value ?? null,
  }
}

/**
 * Hook specifically for the hero image URL setting
 */
export function useHeroImageSetting() {
  const { setting, isLoading, error, refetch, updateSetting } = useSystemSetting('teacher_hero_image_url')
  
  const updateHeroImage = useCallback(async (imageUrl: string): Promise<boolean> => {
    return await updateSetting('teacher_hero_image_url', imageUrl)
  }, [updateSetting])

  return {
    imageUrl: setting?.value || '/images/teacher-hero-bg.svg',
    isLoading,
    error,
    refetch,
    updateHeroImage,
  }
}

/**
 * Hook specifically for the parent hero image URL setting
 */
export function useParentHeroImageSetting() {
  const { setting, isLoading, error, refetch, updateSetting } = useSystemSetting('parent_hero_image_url')
  
  const updateParentHeroImage = useCallback(async (imageUrl: string): Promise<boolean> => {
    return await updateSetting('parent_hero_image_url', imageUrl)
  }, [updateSetting])

  return {
    imageUrl: setting?.value || '/images/parent-hero-bg.svg',
    isLoading,
    error,
    refetch,
    updateParentHeroImage,
  }
}

/**
 * Hook for admin hero image management (Teachers)
 */
export function useHeroImageManagement() {
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const { imageUrl, isLoading, error, refetch } = useHeroImageSetting()

  const uploadImage = useCallback(async (file: File): Promise<boolean> => {
    try {
      setUploadingImage(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('file', file)

      // 模擬上傳進度（因為 fetch 無法直接追蹤上傳進度）
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const response = await fetch('/api/admin/hero-image', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      await refetch()
      return true
    } catch (err) {
      console.error('Error uploading hero image:', err)
      return false
    } finally {
      setUploadingImage(false)
      setUploadProgress(0)
    }
  }, [refetch])

  const resetToDefault = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/hero-image', {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Reset failed')
      }

      await refetch()
      return true
    } catch (err) {
      console.error('Error resetting hero image:', err)
      return false
    }
  }, [refetch])

  return {
    currentImageUrl: imageUrl,
    isLoading,
    error,
    uploadingImage,
    uploadProgress,
    uploadImage,
    resetToDefault,
    refetch,
  }
}

/**
 * Hook for admin parent hero image management
 */
export function useParentHeroImageManagement() {
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const { imageUrl, isLoading, error, refetch } = useParentHeroImageSetting()

  const uploadImage = useCallback(async (file: File): Promise<boolean> => {
    try {
      setUploadingImage(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'parent') // Indicate this is for parent hero

      // 模擬上傳進度（因為 fetch 無法直接追蹤上傳進度）
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const response = await fetch('/api/admin/hero-image', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      await refetch()
      return true
    } catch (err) {
      console.error('Error uploading parent hero image:', err)
      return false
    } finally {
      setUploadingImage(false)
      setUploadProgress(0)
    }
  }, [refetch])

  const resetToDefault = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/hero-image', {
        method: 'DELETE',
        credentials: 'include',
        body: JSON.stringify({ type: 'parent' }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Reset failed')
      }

      await refetch()
      return true
    } catch (err) {
      console.error('Error resetting parent hero image:', err)
      return false
    }
  }, [refetch])

  return {
    currentImageUrl: imageUrl,
    isLoading,
    error,
    uploadingImage,
    uploadProgress,
    uploadImage,
    resetToDefault,
    refetch,
  }
}