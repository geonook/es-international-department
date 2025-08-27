/**
 * Hero Image Manager Component for KCISLK ESID Info Hub
 * 主視覺圖片管理組件 - 管理員專用
 */

'use client'

import React, { useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  RefreshCw, 
  Eye, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  ImageIcon,
  Settings
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useHeroImageManagement } from '@/hooks/useSystemSettings'

interface HeroImageManagerProps {
  className?: string
  showPreview?: boolean
}

export default function HeroImageManager({ className, showPreview = true }: HeroImageManagerProps) {
  const [showUploader, setShowUploader] = useState(false)
  const [lastUploadResult, setLastUploadResult] = useState<string | null>(null)

  const {
    currentImageUrl,
    isLoading,
    error,
    uploadingImage,
    uploadProgress,
    uploadImage,
    resetToDefault,
    refetch
  } = useHeroImageManagement()

  const handleImageUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return

    const file = files[0]
    
    try {
      const success = await uploadImage(file)
      if (success) {
        setLastUploadResult('上傳成功！主視覺圖片已更新。')
        setShowUploader(false)
        // 重新載入圖片
        await refetch()
      } else {
        setLastUploadResult('上傳失敗，請重試。')
      }
    } catch (error) {
      console.error('Image upload error:', error)
      setLastUploadResult('上傳失敗：' + (error instanceof Error ? error.message : '未知錯誤'))
    }
  }, [uploadImage, refetch])


  const handleResetToDefault = useCallback(async () => {
    if (confirm('確定要恢復預設背景圖片嗎？當前的自訂圖片將會被移除。')) {
      const success = await resetToDefault()
      if (success) {
        setLastUploadResult('已成功恢復預設背景圖片。')
      } else {
        setLastUploadResult('恢復預設背景失敗，請重試。')
      }
    }
  }, [resetToDefault])

  const handlePreview = useCallback(() => {
    // 在新分頁中開啟 teachers 頁面預覽
    window.open('/teachers', '_blank')
  }, [])

  const isDefaultImage = currentImageUrl === '/images/teacher-hero-bg.svg'

  return (
    <Card className={`bg-white/90 backdrop-blur-lg shadow-lg border-0 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-indigo-600" />
          Teachers 頁面主視覺圖片管理
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 載入狀態 */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm text-gray-600">載入中...</span>
            </div>
          </div>
        )}

        {/* 錯誤顯示 */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 上傳結果顯示 */}
        {lastUploadResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert variant={lastUploadResult.includes('失敗') ? 'destructive' : 'default'}>
              {lastUploadResult.includes('失敗') ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>{lastUploadResult}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* 當前圖片預覽 */}
        {showPreview && currentImageUrl && !isLoading && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">當前主視覺圖片</h4>
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={currentImageUrl}
                alt="當前主視覺圖片"
                fill
                className="object-cover"
                unoptimized={currentImageUrl.endsWith('.svg')}
              />
              {isDefaultImage && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">預設背景圖片</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Settings className="w-3 h-3" />
              <span>圖片路徑: {currentImageUrl}</span>
            </div>
          </div>
        )}

        {/* 上傳進度 */}
        {uploadingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">上傳中...</span>
              <span className="text-gray-500">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </motion.div>
        )}

        {/* 圖片上傳器 */}
        <AnimatePresence>
          {showUploader && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <h4 className="text-sm font-medium text-gray-700">上傳新的主視覺圖片</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    if (files.length > 0) {
                      handleImageUpload(files)
                    }
                  }}
                  disabled={uploadingImage}
                  className="hidden"
                  id="hero-image-input"
                />
                <label 
                  htmlFor="hero-image-input" 
                  className={`cursor-pointer ${uploadingImage ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    點擊選擇圖片檔案
                  </p>
                  <p className="text-sm text-gray-500">
                    支援 JPG, PNG, WebP 格式，最大 5MB
                  </p>
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploader(false)}
                  disabled={uploadingImage}
                >
                  取消
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 操作按鈕 */}
        {!isLoading && (
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setShowUploader(!showUploader)}
              disabled={uploadingImage}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              {showUploader ? '隱藏上傳器' : '上傳新圖片'}
            </Button>

            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={uploadingImage}
            >
              <Eye className="w-4 h-4 mr-2" />
              預覽頁面
            </Button>

            {!isDefaultImage && (
              <Button
                variant="outline"
                onClick={handleResetToDefault}
                disabled={uploadingImage}
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                恢復預設
              </Button>
            )}

            <Button
              variant="outline"
              onClick={refetch}
              disabled={uploadingImage}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重新載入
            </Button>
          </div>
        )}

        {/* 使用說明 */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h5 className="text-sm font-medium text-blue-900 mb-2">使用說明</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• 建議圖片尺寸：1920x800px 或相同比例</li>
            <li>• 支援格式：JPG, PNG, WebP</li>
            <li>• 檔案大小限制：5MB</li>
            <li>• 圖片會自動壓縮和優化</li>
            <li>• 更改後立即生效於 Teachers 頁面</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}