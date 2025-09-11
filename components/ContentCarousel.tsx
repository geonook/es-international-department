/**
 * Content Carousel Component for Homepage
 * 首頁內容輪播組件
 */

'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'

interface CarouselImageData {
  id: number
  title?: string
  description?: string
  imageUrl: string
  altText: string
  order: number
  createdAt: string
}

interface ContentCarouselProps {
  className?: string
  autoPlay?: boolean
  autoPlayDelay?: number
  showDots?: boolean
  showArrows?: boolean
  aspectRatio?: 'wide' | 'square' | 'tall' | 'compact'
}

export default function ContentCarousel({
  className = '',
  autoPlay = true,
  autoPlayDelay = 5000,
  showDots = true,
  showArrows = true,
  aspectRatio = 'wide'
}: ContentCarouselProps) {
  const [images, setImages] = useState<CarouselImageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [api, setApi] = useState<CarouselApi>
  const [isHovered, setIsHovered] = useState(false)


  // 載入輪播圖片
  useEffect(() => {
    async function loadCarouselImages() {
      try {
        setLoading(true)
        // Add cache-busting to ensure fresh data
        const timestamp = Date.now()
        const response = await fetch(`/api/parents-corner/carousel?_t=${timestamp}`)
        
        if (!response.ok) {
          throw new Error('Failed to load carousel images')
        }

        const data = await response.json()
        if (data.success && data.data) {
          setImages(data.data)
        } else {
          setImages([])
        }
      } catch (error) {
        console.error('❌ Error loading carousel images:', error)
        setError(error instanceof Error ? error.message : 'Failed to load images')
      } finally {
        setLoading(false)
      }
    }

    loadCarouselImages()
  }, [])

  // 監聽 carousel API 變化並同步當前索引
  useEffect(() => {
    if (!api) return

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap())
    }

    onSelect() // 初始化當前位置
    api.on('select', onSelect)

    return () => {
      api.off('select', onSelect)
    }
  }, [api])

  // 自動播放功能 (在鼠標懸停時暫停)
  useEffect(() => {
    if (!autoPlay || !api || images.length <= 1 || isHovered) return

    const interval = setInterval(() => {
      // 檢查是否到達最後一張，如果是則回到第一張
      if (api.selectedScrollSnap() === images.length - 1) {
        api.scrollTo(0)
      } else {
        api.scrollNext()
      }
    }, autoPlayDelay)

    return () => clearInterval(interval)
  }, [autoPlay, api, autoPlayDelay, images.length, isHovered])

  // 獲取寬高比樣式
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square'
      case 'tall': return 'aspect-[3/4]'
      case 'compact': return 'aspect-[4/3]'
      case 'wide':
      default: return 'aspect-[16/9]'
    }
  }

  // Loading 狀態
  if (loading) {
    return (
      <div className={`w-full ${getAspectRatioClass()} bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-sm text-gray-500">Loading carousel images...</p>
          <p className="text-xs text-gray-400">Please wait while we fetch the latest content</p>
        </div>
      </div>
    )
  }

  // Error 狀態
  if (error) {
    return (
      <div className={`w-full ${getAspectRatioClass()} ${className}`}>
        <Alert className="h-full flex items-center justify-center">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            Failed to load carousel images: {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // 沒有圖片時的預設狀態
  if (images.length === 0) {
    return (
      <div className={`w-full ${getAspectRatioClass()} bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border flex items-center justify-center ${className}`}>
        <div className="text-center p-6">
          <div className="relative w-full max-w-xs mx-auto mb-4">
            <Image
              src="/uploads/homepage/content-1757551161020.jpeg"
              alt="Default family learning moment"
              width={300}
              height={200}
              className="w-full h-auto rounded-lg shadow-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
          </div>
          <p className="text-sm text-gray-600 font-medium">No carousel images available</p>
          <p className="text-xs text-gray-400 mt-1">Images can be added through the admin panel</p>
        </div>
      </div>
    )
  }

  // 單張圖片時直接顯示
  if (images.length === 1) {
    const image = images[0]
    return (
      <div className={`w-full ${getAspectRatioClass()} relative overflow-hidden rounded-lg border ${className}`}>
        <Image
          src={image.imageUrl}
          alt={image.altText}
          fill
          className="object-cover"
          priority
        />
        {image.title && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
            <h3 className="text-white text-lg font-semibold mb-1">{image.title}</h3>
            {image.description && (
              <p className="text-white/90 text-sm line-clamp-2">{image.description}</p>
            )}
          </div>
        )}
      </div>
    )
  }

  // 多張圖片時使用輪播
  return (
    <div 
      className={`w-full ${getAspectRatioClass()} relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Carousel className="w-full h-full" setApi={setApi}>
        <CarouselContent className="h-full">
          {images.map((image, index) => (
            <CarouselItem key={image.id} className="h-full">
              <div className={`relative w-full overflow-hidden rounded-lg ${getAspectRatioClass()}`}>
                <Image
                  src={image.imageUrl}
                  alt={image.altText}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  priority={index === 0}
                />
                
                {/* 圖片信息覆蓋層 */}
                {(image.title || image.description) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {image.title && (
                        <h3 className="text-white text-lg font-semibold mb-2">
                          {image.title}
                        </h3>
                      )}
                      {image.description && (
                        <p className="text-white/90 text-sm line-clamp-2 leading-relaxed">
                          {image.description}
                        </p>
                      )}
                    </motion.div>
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* 控制箭頭 */}
        {showArrows && images.length > 1 && (
          <>
            <CarouselPrevious className="left-4 bg-white/90 hover:bg-white border-0 shadow-lg" />
            <CarouselNext className="right-4 bg-white/90 hover:bg-white border-0 shadow-lg" />
          </>
        )}
      </Carousel>

      {/* 指示點 */}
      {showDots && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}