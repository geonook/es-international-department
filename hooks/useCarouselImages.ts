/**
 * Custom hook for managing carousel images
 * 輪播圖片管理 Hook
 */

import { useState, useEffect, useCallback } from 'react'

export interface CarouselImageData {
  id: number
  title?: string
  description?: string
  imageUrl: string
  altText: string
  order: number
  createdAt: string
}

export interface UseCarouselImagesReturn {
  images: CarouselImageData[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  addImage: (image: Omit<CarouselImageData, 'id' | 'createdAt'>) => Promise<void>
  updateImage: (id: number, updates: Partial<CarouselImageData>) => Promise<void>
  deleteImage: (id: number) => Promise<void>
  reorderImages: (updates: { id: number; order: number }[]) => Promise<void>
}

export function useCarouselImages(): UseCarouselImagesReturn {
  const [images, setImages] = useState<CarouselImageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 載入輪播圖片
  const fetchImages = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/parents-corner/carousel')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success && Array.isArray(data.data)) {
        setImages(data.data)
        console.log(`📸 Loaded ${data.data.length} carousel images`)
      } else {
        throw new Error(data.error || 'Invalid response format')
      }
    } catch (error) {
      console.error('❌ Error loading carousel images:', error)
      setError(error instanceof Error ? error.message : 'Failed to load images')
      setImages([])
    } finally {
      setLoading(false)
    }
  }, [])

  // 添加新圖片
  const addImage = useCallback(async (imageData: Omit<CarouselImageData, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/admin/parents-corner/carousel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(imageData),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success && data.data) {
        setImages(prev => [...prev, data.data].sort((a, b) => a.order - b.order))
        console.log('✅ Added carousel image:', data.data.id)
      } else {
        throw new Error(data.error || 'Failed to add image')
      }
    } catch (error) {
      console.error('❌ Error adding carousel image:', error)
      throw error
    }
  }, [])

  // 更新圖片
  const updateImage = useCallback(async (id: number, updates: Partial<CarouselImageData>) => {
    try {
      const response = await fetch(`/api/admin/parents-corner/carousel/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success && data.data) {
        setImages(prev => 
          prev.map(img => img.id === id ? data.data : img)
              .sort((a, b) => a.order - b.order)
        )
        console.log('✅ Updated carousel image:', id)
      } else {
        throw new Error(data.error || 'Failed to update image')
      }
    } catch (error) {
      console.error('❌ Error updating carousel image:', error)
      throw error
    }
  }, [])

  // 刪除圖片
  const deleteImage = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/admin/parents-corner/carousel/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setImages(prev => prev.filter(img => img.id !== id))
        console.log('✅ Deleted carousel image:', id)
      } else {
        throw new Error(data.error || 'Failed to delete image')
      }
    } catch (error) {
      console.error('❌ Error deleting carousel image:', error)
      throw error
    }
  }, [])

  // 重新排序圖片
  const reorderImages = useCallback(async (updates: { id: number; order: number }[]) => {
    try {
      const response = await fetch('/api/admin/parents-corner/carousel', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // 重新載入以獲取最新順序
        await fetchImages()
        console.log('✅ Reordered carousel images')
      } else {
        throw new Error(data.error || 'Failed to reorder images')
      }
    } catch (error) {
      console.error('❌ Error reordering carousel images:', error)
      throw error
    }
  }, [fetchImages])

  // 初始載入
  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  return {
    images,
    loading,
    error,
    refetch: fetchImages,
    addImage,
    updateImage,
    deleteImage,
    reorderImages,
  }
}