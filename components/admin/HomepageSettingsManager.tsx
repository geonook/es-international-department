/**
 * Homepage Settings Manager Component for Parents' Corner
 * 首頁設定管理組件 - 管理員專用
 */

'use client'

import React, { useState, useCallback, useEffect } from 'react'
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
  Settings,
  Edit3,
  Save,
  X,
  Link,
  Type,
  FileImage,
  Home,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

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

export default function HomepageSettingsManager() {
  const [settings, setSettings] = useState<HomepageSettings>({
    mainTitle: 'Welcome to our Parents\' Corner',
    subtitle: 'Your dedicated family hub for school updates, events, and communication with your child\'s learning journey',
    quoteText: 'Parents are the cornerstone of a child\'s education; their support and collaboration with teachers create a powerful partnership that inspires and nurtures lifelong learners.',
    quoteAuthor: '',
    exploreButtonText: 'Explore Resources',
    exploreButtonLink: '/resources',
    learnMoreButtonText: 'Learn More',
    learnMoreButtonLink: '/events'
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingContent, setUploadingContent] = useState(false)
  const [heroUploadProgress, setHeroUploadProgress] = useState(0)
  const [contentUploadProgress, setContentUploadProgress] = useState(0)

  // Load current settings
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/parents-corner/homepage')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to load homepage settings:', error)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/parents-corner/homepage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast.success('Homepage settings saved successfully!')
        setIsEditing(false)
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save homepage settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (file: File, type: 'hero' | 'content') => {
    const setUploading = type === 'hero' ? setUploadingHero : setUploadingContent
    const setProgress = type === 'hero' ? setHeroUploadProgress : setContentUploadProgress
    
    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/admin/parents-corner/homepage/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (response.ok) {
        const { url } = await response.json()
        setSettings(prev => ({
          ...prev,
          [type === 'hero' ? 'heroImage' : 'contentImage']: url
        }))
        toast.success(`${type === 'hero' ? 'Hero' : 'Content'} image uploaded successfully!`)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(`Failed to upload ${type} image`)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleRemoveImage = (type: 'hero' | 'content') => {
    setSettings(prev => ({
      ...prev,
      [type === 'hero' ? 'heroImage' : 'contentImage']: undefined
    }))
    toast.success(`${type === 'hero' ? 'Hero' : 'Content'} image removed`)
  }

  return (
    <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5 text-purple-600" />
            Homepage Settings
          </CardTitle>
          <CardDescription>
            Manage Parents' Corner homepage content and appearance
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleSaveSettings}
                disabled={isSaving}
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Settings
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="images" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="images">
              <FileImage className="w-4 h-4 mr-2" />
              Images
            </TabsTrigger>
            <TabsTrigger value="content">
              <Type className="w-4 h-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="buttons">
              <Link className="w-4 h-4 mr-2" />
              Buttons
            </TabsTrigger>
          </TabsList>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            {/* Hero Background Image */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Hero Background Image</Label>
                <Badge variant="outline">Main Visual</Badge>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {settings.heroImage ? (
                  <div className="space-y-4">
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={settings.heroImage}
                        alt="Hero background"
                        fill
                        className="object-cover"
                      />
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => document.getElementById('hero-upload')?.click()}
                          disabled={uploadingHero}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Replace
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveImage('hero')}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-500 mb-4">No hero image uploaded</p>
                    {isEditing && (
                      <Button
                        size="sm"
                        onClick={() => document.getElementById('hero-upload')?.click()}
                        disabled={uploadingHero}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </Button>
                    )}
                  </div>
                )}
                <input
                  id="hero-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'hero')
                  }}
                />
                {uploadingHero && (
                  <Progress value={heroUploadProgress} className="mt-2" />
                )}
              </div>
            </div>

            {/* Content Image */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Content Image</Label>
                <Badge variant="outline">Mother & Child</Badge>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {settings.contentImage ? (
                  <div className="space-y-4">
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={settings.contentImage}
                        alt="Content image"
                        fill
                        className="object-cover"
                      />
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => document.getElementById('content-upload')?.click()}
                          disabled={uploadingContent}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Replace
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveImage('content')}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-500 mb-4">No content image uploaded</p>
                    {isEditing && (
                      <Button
                        size="sm"
                        onClick={() => document.getElementById('content-upload')?.click()}
                        disabled={uploadingContent}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </Button>
                    )}
                  </div>
                )}
                <input
                  id="content-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'content')
                  }}
                />
                {uploadingContent && (
                  <Progress value={contentUploadProgress} className="mt-2" />
                )}
              </div>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="mainTitle">Main Title</Label>
                <Input
                  id="mainTitle"
                  value={settings.mainTitle}
                  onChange={(e) => setSettings(prev => ({ ...prev, mainTitle: e.target.value }))}
                  disabled={!isEditing}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={settings.subtitle}
                  onChange={(e) => setSettings(prev => ({ ...prev, subtitle: e.target.value }))}
                  disabled={!isEditing}
                  className="mt-2"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="quoteText">Quote Text</Label>
                <Textarea
                  id="quoteText"
                  value={settings.quoteText}
                  onChange={(e) => setSettings(prev => ({ ...prev, quoteText: e.target.value }))}
                  disabled={!isEditing}
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>

          {/* Buttons Tab */}
          <TabsContent value="buttons" className="space-y-6">
            <div className="space-y-6">
              <div className="p-4 bg-purple-50 rounded-lg space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Explore Resources Button
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="exploreText">Button Text</Label>
                    <Input
                      id="exploreText"
                      value={settings.exploreButtonText}
                      onChange={(e) => setSettings(prev => ({ ...prev, exploreButtonText: e.target.value }))}
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exploreLink">Button Link</Label>
                    <Input
                      id="exploreLink"
                      value={settings.exploreButtonLink}
                      onChange={(e) => setSettings(prev => ({ ...prev, exploreButtonLink: e.target.value }))}
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-pink-50 rounded-lg space-y-4">
                <h4 className="font-semibold">Learn More Button</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="learnText">Button Text</Label>
                    <Input
                      id="learnText"
                      value={settings.learnMoreButtonText}
                      onChange={(e) => setSettings(prev => ({ ...prev, learnMoreButtonText: e.target.value }))}
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="learnLink">Button Link</Label>
                    <Input
                      id="learnLink"
                      value={settings.learnMoreButtonLink}
                      onChange={(e) => setSettings(prev => ({ ...prev, learnMoreButtonLink: e.target.value }))}
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview Link */}
        <div className="mt-6 pt-6 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open('/', '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Homepage
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}