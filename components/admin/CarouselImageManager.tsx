/**
 * Carousel Image Manager Component
 * 輪播圖片管理組件 - 管理員專用
 */

'use client'

import React, { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  RefreshCw, 
  Trash2, 
  Edit3,
  Save,
  X,
  ImageIcon,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Eye,
  Plus,
  FileImage,
  CheckCircle,
  AlertCircle,
  Loader2,
  MoveUp,
  MoveDown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useCarouselImages, type CarouselImageData } from '@/hooks/useCarouselImages'

interface CarouselImageManagerProps {
  className?: string
}

interface EditingImage extends Partial<CarouselImageData> {
  isNew?: boolean
}

export default function CarouselImageManager({ className = '' }: CarouselImageManagerProps) {
  const { images, loading, error, refetch, addImage, updateImage, deleteImage, reorderImages } = useCarouselImages()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [editingImage, setEditingImage] = useState<EditingImage | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file upload
  const handleFileUpload = async (file: File, imageData?: Partial<CarouselImageData>) => {
    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'carousel')
      
      if (imageData?.title) formData.append('title', imageData.title)
      if (imageData?.description) formData.append('description', imageData.description)
      if (imageData?.altText) formData.append('altText', imageData.altText)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const uploadResponse = await fetch('/api/admin/parents-corner/carousel/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (uploadResponse.ok) {
        const { url } = await uploadResponse.json()
        
        // Create the carousel image record
        await addImage({
          title: imageData?.title || '',
          description: imageData?.description || '',
          imageUrl: url,
          altText: imageData?.altText || 'Family learning moment',
          order: images.length + 1
        })

        toast.success('Carousel image uploaded successfully!')
        setShowAddDialog(false)
        setEditingImage(null)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload carousel image')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // Handle image update
  const handleUpdateImage = async (id: number, updates: Partial<CarouselImageData>) => {
    try {
      await updateImage(id, updates)
      toast.success('Image updated successfully!')
      setEditingImage(null)
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update image')
    }
  }

  // Handle image deletion
  const handleDeleteImage = async (id: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      await deleteImage(id)
      toast.success('Image deleted successfully!')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete image')
    }
  }

  // Handle reordering
  const handleMoveImage = async (id: number, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex(img => img.id === id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= images.length) return

    // Create updates for affected images
    const updates = [
      { id: images[currentIndex].id, order: images[newIndex].order },
      { id: images[newIndex].id, order: images[currentIndex].order }
    ]

    try {
      await reorderImages(updates)
      toast.success('Images reordered successfully!')
    } catch (error) {
      console.error('Reorder error:', error)
      toast.error('Failed to reorder images')
    }
  }

  // Loading state
  if (loading) {
    return (
      <Card className={`bg-white/90 backdrop-blur-lg shadow-lg border-0 ${className}`}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            <p className="text-sm text-gray-500">Loading carousel images...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className={`bg-white/90 backdrop-blur-lg shadow-lg border-0 ${className}`}>
        <CardContent className="py-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              Failed to load carousel images: {error}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={refetch} 
            className="mt-4 bg-purple-600 hover:bg-purple-700"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-white/90 backdrop-blur-lg shadow-lg border-0 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="w-5 h-5 text-purple-600" />
            Carousel Images
          </CardTitle>
          <CardDescription>
            Manage homepage carousel images - drag to reorder, edit details, or add new images
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={refetch}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Carousel Image</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-title">Title (Optional)</Label>
                  <Input
                    id="new-title"
                    value={editingImage?.title || ''}
                    onChange={(e) => setEditingImage(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter image title"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="new-description">Description (Optional)</Label>
                  <Textarea
                    id="new-description"
                    value={editingImage?.description || ''}
                    onChange={(e) => setEditingImage(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter image description"
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="new-alt">Alt Text</Label>
                  <Input
                    id="new-alt"
                    value={editingImage?.altText || 'Family learning moment'}
                    onChange={(e) => setEditingImage(prev => ({ ...prev, altText: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-500 mb-4">Select an image to upload</p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    size="sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, editingImage || {})
                    }}
                  />
                  {uploading && (
                    <Progress value={uploadProgress} className="mt-4" />
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No carousel images</h3>
            <p className="text-gray-500 mb-6">Add your first carousel image to get started</p>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Image
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="border rounded-lg p-4 bg-white shadow-sm"
                >
                  <div className="flex gap-4">
                    {/* Image Preview */}
                    <div className="relative w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={image.imageUrl}
                        alt={image.altText}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Image Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 truncate">
                            {image.title || 'Untitled Image'}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {image.description || 'No description'}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline" className="text-xs">
                              Order: {image.order}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {new Date(image.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 ml-4">
                          {/* Move Up/Down */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMoveImage(image.id, 'up')}
                            disabled={index === 0}
                            className="h-8 w-8 p-0"
                          >
                            <MoveUp className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMoveImage(image.id, 'down')}
                            disabled={index === images.length - 1}
                            className="h-8 w-8 p-0"
                          >
                            <MoveDown className="w-4 h-4" />
                          </Button>

                          {/* Edit */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => setEditingImage(image)}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Edit Image Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="edit-title">Title</Label>
                                  <Input
                                    id="edit-title"
                                    value={editingImage?.title || ''}
                                    onChange={(e) => setEditingImage(prev => ({ ...prev, title: e.target.value }))}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-description">Description</Label>
                                  <Textarea
                                    id="edit-description"
                                    value={editingImage?.description || ''}
                                    onChange={(e) => setEditingImage(prev => ({ ...prev, description: e.target.value }))}
                                    className="mt-1"
                                    rows={3}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-alt">Alt Text</Label>
                                  <Input
                                    id="edit-alt"
                                    value={editingImage?.altText || ''}
                                    onChange={(e) => setEditingImage(prev => ({ ...prev, altText: e.target.value }))}
                                    className="mt-1"
                                  />
                                </div>
                                <div className="flex gap-2 pt-4">
                                  <Button
                                    onClick={() => {
                                      if (editingImage && editingImage.id) {
                                        const { id, ...updates } = editingImage
                                        handleUpdateImage(id, updates)
                                      }
                                    }}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                                    size="sm"
                                  >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* Delete */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteImage(image.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Preview Link */}
        <div className="mt-6 pt-6 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open('/', '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Carousel on Homepage
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}