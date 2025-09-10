'use client'

/**
 * Rich Text Editor Component
 * 富文本編輯器組件 - 基於 TinyMCE 的自定義編輯器
 */

import { useRef, useEffect, useState, useCallback } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { 
  Type, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Link,
  Loader2,
  AlertCircle,
  FileText,
  Image,
  Upload,
  X,
  RotateCcw,
  Maximize2
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export interface UploadedImage {
  fileId: number
  filePath: string
  thumbnailPath?: string
  originalName: string
  storedName: string
  fileSize: number
  mimeType: string
  publicUrl: string
  thumbnailUrl?: string
}

export interface RichTextEditorProps {
  value?: string
  onChange?: (content: string) => void
  onBlur?: (content: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  minHeight?: number
  maxHeight?: number
  maxLength?: number
  showWordCount?: boolean
  showCharCount?: boolean
  autoSave?: boolean
  autoSaveInterval?: number
  onAutoSave?: (content: string) => void
  className?: string
  // 圖片上傳相關
  enableImageUpload?: boolean
  onImageUpload?: (images: UploadedImage[]) => void
  uploadEndpoint?: string
  maxImageSize?: number
  maxImages?: number
  relatedType?: string
  relatedId?: number
}

interface EditorStats {
  wordCount: number
  charCount: number
  charCountWithoutSpaces: number
}

interface ImageUploadState {
  uploading: boolean
  progress: number
  error?: string
  uploadedImages: UploadedImage[]
}

export function RichTextEditor({
  value = '',
  onChange,
  onBlur,
  placeholder = '請輸入內容...',
  disabled = false,
  error,
  minHeight = 200,
  maxHeight = 600,
  maxLength = 10000,
  showWordCount = true,
  showCharCount = true,
  autoSave = false,
  autoSaveInterval = 5000,
  onAutoSave,
  className,
  // 圖片上傳相關
  enableImageUpload = true,
  onImageUpload,
  uploadEndpoint = '/api/upload/images',
  maxImageSize = 5 * 1024 * 1024, // 5MB
  maxImages = 5,
  relatedType,
  relatedId
}: RichTextEditorProps) {
  const editorRef = useRef<any>(null)
  const { theme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<EditorStats>({
    wordCount: 0,
    charCount: 0,
    charCountWithoutSpaces: 0
  })
  const [lastSavedContent, setLastSavedContent] = useState('')
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [imageUpload, setImageUpload] = useState<ImageUploadState>({
    uploading: false,
    progress: 0,
    uploadedImages: []
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 自動儲存功能
  useEffect(() => {
    if (!autoSave || !onAutoSave || !value || value === lastSavedContent) {
      return
    }

    const timer = setTimeout(() => {
      setAutoSaveStatus('saving')
      try {
        onAutoSave(value)
        setLastSavedContent(value)
        setAutoSaveStatus('saved')
        setTimeout(() => setAutoSaveStatus('idle'), 2000)
      } catch (error) {
        setAutoSaveStatus('error')
        setTimeout(() => setAutoSaveStatus('idle'), 3000)
      }
    }, autoSaveInterval)

    return () => clearTimeout(timer)
  }, [value, autoSave, onAutoSave, autoSaveInterval, lastSavedContent])

  // 圖片上傳處理函式
  const handleImageUpload = useCallback(async (files: File[]) => {
    if (!enableImageUpload) {
      console.warn('Image upload is disabled')
      return []
    }
    
    if (!files || files.length === 0) {
      console.warn('No files provided for upload')
      return []
    }

    // Validate each file
    const validFiles = files.filter(file => {
      if (!file || file.size === 0) {
        console.warn('Invalid file detected:', file)
        return false
      }
      return true
    })

    if (validFiles.length === 0) {
      console.error('No valid files to upload')
      setImageUpload(prev => ({ ...prev, error: 'No valid files selected' }))
      return []
    }

    setImageUpload(prev => ({ ...prev, uploading: true, progress: 0, error: undefined }))

    try {
      const formData = new FormData()
      validFiles.forEach(file => {
        console.log('Appending file:', file.name, 'Size:', file.size, 'Type:', file.type)
        formData.append('images', file)
      })
      
      if (relatedType) formData.append('relatedType', relatedType)
      if (relatedId) formData.append('relatedId', relatedId.toString())
      formData.append('generateThumbnail', 'true')
      formData.append('compressImage', 'true')

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      const uploadedImages = result.images || []
      setImageUpload(prev => ({
        ...prev,
        uploading: false,
        progress: 100,
        uploadedImages: [...prev.uploadedImages, ...uploadedImages]
      }))

      onImageUpload?.(uploadedImages)
      return uploadedImages
    } catch (error) {
      console.error('Image upload error:', error)
      setImageUpload(prev => ({
        ...prev,
        uploading: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }))
      return []
    }
  }, [enableImageUpload, uploadEndpoint, relatedType, relatedId, onImageUpload])

  // TinyMCE 圖片上傳處理器
  const imageUploadHandler = useCallback((blobInfo: any, progress: any) => {
    return new Promise<string>((resolve, reject) => {
      const file = blobInfo.blob()
      handleImageUpload([file]).then(uploadedImages => {
        if (uploadedImages.length > 0) {
          resolve(uploadedImages[0].publicUrl)
        } else {
          reject('Upload failed')
        }
      }).catch(reject)
    })
  }, [handleImageUpload])

  // 檔案拖放處理
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!enableImageUpload || disabled || imageUpload.uploading) return

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (files.length > 0) {
      handleImageUpload(files)
    }
  }, [enableImageUpload, disabled, imageUpload.uploading, handleImageUpload])

  // 檔案選擇處理
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleImageUpload(files)
    }
    // 清空 input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleImageUpload])

  // 編輯器配置
  const editorConfig = {
    license_key: 'gpl',
    height: minHeight,
    max_height: maxHeight,
    menubar: false,
    branding: true,
    promotion: true,
    statusbar: false,
    resize: true,
    base_url: '/tinymce',
    suffix: '.min',
    content_style: `
      body { 
        font-family: 'Inter', system-ui, -apple-system, sans-serif; 
        font-size: 14px; 
        line-height: 1.6;
        color: ${theme === 'dark' ? '#f1f5f9' : '#334155'};
        background-color: ${theme === 'dark' ? '#1e293b' : '#ffffff'};
        margin: 16px;
        padding: 0;
      }
      p { margin: 0 0 12px 0; }
      h1, h2, h3, h4, h5, h6 { margin: 0 0 16px 0; font-weight: 600; }
      ul, ol { margin: 0 0 12px 24px; }
      blockquote { 
        margin: 0 0 12px 0; 
        padding: 12px 16px; 
        border-left: 4px solid ${theme === 'dark' ? '#475569' : '#cbd5e1'};
        background-color: ${theme === 'dark' ? '#334155' : '#f8fafc'};
      }
      code { 
        background-color: ${theme === 'dark' ? '#374151' : '#f1f5f9'};
        color: ${theme === 'dark' ? '#f472b6' : '#e11d48'};
        padding: 2px 4px;
        border-radius: 4px;
        font-size: 13px;
      }
      pre { 
        background-color: ${theme === 'dark' ? '#1f2937' : '#f8fafc'};
        padding: 16px;
        border-radius: 8px;
        overflow-x: auto;
        margin: 0 0 12px 0;
      }
      a { color: ${theme === 'dark' ? '#60a5fa' : '#2563eb'}; }
      img { max-width: 100%; height: auto; }
      table { border-collapse: collapse; width: 100%; margin: 0 0 12px 0; }
      table td, table th { border: 1px solid ${theme === 'dark' ? '#475569' : '#d1d5db'}; padding: 8px; }
      table th { background-color: ${theme === 'dark' ? '#374151' : '#f9fafb'}; font-weight: 600; }
    `,
    skin: theme === 'dark' ? 'oxide-dark' : 'oxide',
    content_css: theme === 'dark' ? 'dark' : 'default',
    placeholder: placeholder,
    toolbar: enableImageUpload ? [
      'undo redo | styleselect formatselect fontselect fontsizeselect | bold italic underline strikethrough',
      'forecolor backcolor | alignleft aligncenter alignright alignjustify | outdent indent',
      'numlist bullist | link unlink | image imageupload | blockquote code | emoticons charmap | removeformat help'
    ].join(' | ') : [
      'undo redo | styleselect formatselect fontselect fontsizeselect | bold italic underline strikethrough',
      'forecolor backcolor | alignleft aligncenter alignright alignjustify | outdent indent',
      'numlist bullist | link unlink | blockquote code | emoticons charmap | removeformat help'
    ].join(' | '),
    plugins: enableImageUpload ? [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
      'textcolor', 'colorpicker'
    ] : [
      'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
      'textcolor', 'colorpicker'
    ],
    // 圖片上傳配置
    images_upload_handler: enableImageUpload ? imageUploadHandler : undefined,
    images_upload_url: enableImageUpload ? uploadEndpoint : undefined,
    images_upload_base_path: '/',
    images_reuse_filename: false,
    automatic_uploads: enableImageUpload,
    paste_data_images: enableImageUpload,
    images_file_types: 'jpg,jpeg,png,gif,webp',
    // Google Docs 相容性配置 - 增強版本
    paste_retain_style_properties: 'color,background-color,font-weight,font-style,text-decoration,font-size,font-family,text-align',
    paste_convert_word_fake_lists: true,
    paste_webkit_styles: 'color,background-color,font-weight,font-style,text-decoration,font-size,text-align',
    paste_merge_formats: true,
    paste_auto_cleanup_on_paste: false, // 關閉自動清理以保留更多格式
    paste_remove_styles_if_webkit: false,
    paste_strip_class_attributes: 'none',
    paste_block_drop: false, // 允許拖放粘貼
    paste_enable_default_filters: false, // 關閉預設過濾器
    paste_word_valid_elements: '*[*]', // 允許所有元素和屬性
    paste_preprocess: function (plugin: any, args: any) {
      // 保留 emoji 和特殊字符
      args.content = args.content.replace(/[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}\u{200d}]/gu, function(match) {
        return match; // 保留所有 emoji
      });
      // 保留特殊符號如 📌 ⚠️
      args.content = args.content.replace(/[📌⚠️🔴🟡🟢🔵🟣⭐️✅❌]/g, function(match) {
        return match;
      });
    },
    // 保留 Google Docs 的列表格式和更多樣式
    extended_valid_elements: 'div[*],p[*],span[*],strong,em,b,i,u,ol[*],ul[*],li[*],h1,h2,h3,h4,h5,h6,sub,sup,font[*]',
    valid_elements: '*[*]',
    valid_styles: {
      '*': 'color,background-color,font-size,font-family,font-weight,font-style,text-decoration,text-align,margin,margin-top,margin-bottom,margin-left,margin-right,padding,padding-top,padding-bottom,padding-left,padding-right,border,border-width,border-style,border-color,line-height'
    },
    file_picker_types: enableImageUpload ? 'image' : undefined,
    file_picker_callback: enableImageUpload ? (callback: any) => {
      fileInputRef.current?.click()
      const handleFileChange = (e: Event) => {
        const target = e.target as HTMLInputElement
        const file = target.files?.[0]
        if (file) {
          handleImageUpload([file]).then(images => {
            if (images.length > 0) {
              callback(images[0].publicUrl, { title: images[0].originalName })
            }
          })
        }
        fileInputRef.current?.removeEventListener('change', handleFileChange)
      }
      fileInputRef.current?.addEventListener('change', handleFileChange)
    } : undefined,
    formats: {
      alignleft: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-left' },
      aligncenter: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-center' },
      alignright: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-right' },
      alignjustify: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-justify' }
    },
    style_formats: [
      { title: '標題 1', format: 'h1' },
      { title: '標題 2', format: 'h2' },
      { title: '標題 3', format: 'h3' },
      { title: '段落', format: 'p' },
      { title: '引言', format: 'blockquote' },
      { title: '程式碼', format: 'code' }
    ],
    link_default_target: '_blank',
    link_assume_external_targets: true,
    max_chars: maxLength,
    setup: (editor: any) => {
      editor.on('init', () => {
        setIsLoading(false)
      })

      editor.on('change input', () => {
        const content = editor.getContent()
        const wordCount = editor.plugins.wordcount ? editor.plugins.wordcount.getCount() : 0
        const charCount = content.length
        const charCountWithoutSpaces = content.replace(/\s/g, '').length

        setStats({
          wordCount,
          charCount,
          charCountWithoutSpaces
        })

        onChange?.(content)
      })

      editor.on('blur', () => {
        const content = editor.getContent()
        onBlur?.(content)
      })

      // 添加自訂圖片上傳按鈕
      if (enableImageUpload) {
        editor.ui.registry.addButton('imageupload', {
          icon: 'image',
          text: '上傳圖片',
          tooltip: '上傳圖片',
          onAction: () => {
            fileInputRef.current?.click()
          }
        })
      }
    }
  }

  // 內容更新處理
  const handleEditorChange = useCallback((content: string) => {
    onChange?.(content)
  }, [onChange])

  // 工具欄快捷按鈕
  const QuickToolbar = () => (
    <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => editorRef.current?.execCommand('Bold')}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="粗體 (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editorRef.current?.execCommand('Italic')}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="斜體 (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editorRef.current?.execCommand('Underline')}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="底線 (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </button>
      </div>
      
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
      
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => editorRef.current?.execCommand('JustifyLeft')}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="靠左對齊"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editorRef.current?.execCommand('JustifyCenter')}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="置中對齊"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editorRef.current?.execCommand('JustifyRight')}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="靠右對齊"
        >
          <AlignRight className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => editorRef.current?.execCommand('InsertUnorderedList')}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="項目符號"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editorRef.current?.execCommand('InsertOrderedList')}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="編號清單"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  // 圖片管理面板
  const ImageManagementPanel = () => {
    if (!enableImageUpload || imageUpload.uploadedImages.length === 0) {
      return null
    }

    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Image className="w-4 h-4" />
          已上傳的圖片 ({imageUpload.uploadedImages.length})
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {imageUpload.uploadedImages.map((image, index) => (
            <div
              key={image.fileId}
              className="relative group bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700"
            >
              <img
                src={image.thumbnailUrl || image.publicUrl}
                alt={image.originalName}
                className="w-full h-16 object-cover rounded"
              />
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 truncate">
                {image.originalName}
              </div>
              <div className="text-xs text-gray-500">
                {(image.fileSize / 1024).toFixed(1)} KB
              </div>
              <button
                type="button"
                onClick={() => {
                  const editor = editorRef.current
                  if (editor) {
                    editor.insertContent(`<img src="${image.publicUrl}" alt="${image.originalName}" style="max-width: 100%; height: auto;" />`)
                  }
                }}
                className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-xs font-medium"
              >
                插入編輯器
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("relative", className)}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => e.preventDefault()}
    >
      {/* 隱藏的檔案輸入 */}
      {enableImageUpload && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      )}
      <Card className={cn(
        "overflow-hidden transition-all duration-200",
        error && "border-red-500 dark:border-red-400",
        disabled && "opacity-60 pointer-events-none"
      )}>
        <CardContent className="p-0">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">載入編輯器...</span>
            </div>
          )}
          
          <div className={cn("transition-opacity duration-200", isLoading && "opacity-0")}>
            <Editor
              ref={editorRef}
              tinymceScriptSrc='/tinymce/tinymce.min.js'
              value={value}
              onEditorChange={handleEditorChange}
              init={editorConfig}
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* 統計資訊和狀態列 */}
      <div className="flex items-center justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-4">
          {showWordCount && (
            <div className="flex items-center gap-1">
              <Type className="w-3 h-3" />
              <span>{stats.wordCount} 字</span>
            </div>
          )}
          
          {showCharCount && (
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>{stats.charCount}/{maxLength} 字元</span>
              {stats.charCount > maxLength * 0.9 && (
                <Badge variant="outline" className="ml-1 text-xs">
                  {stats.charCount > maxLength ? '超出限制' : '接近限制'}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* 自動儲存狀態 */}
        {autoSave && (
          <div className="flex items-center gap-2">
            {autoSaveStatus === 'saving' && (
              <div className="flex items-center gap-1 text-blue-600">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-xs">儲存中...</span>
              </div>
            )}
            {autoSaveStatus === 'saved' && (
              <Badge variant="outline" className="text-xs text-green-600">
                已自動儲存
              </Badge>
            )}
            {autoSaveStatus === 'error' && (
              <Badge variant="outline" className="text-xs text-red-600">
                儲存失敗
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* 圖片上傳進度 */}
      {enableImageUpload && imageUpload.uploading && (
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">上傳圖片中...</span>
            <span className="text-sm text-blue-600 dark:text-blue-400">{imageUpload.progress}%</span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${imageUpload.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 圖片上傳錯誤 */}
      {enableImageUpload && imageUpload.error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            圖片上傳失敗: {imageUpload.error}
            <Button
              variant="outline"
              size="sm"
              className="ml-2 h-6 text-xs"
              onClick={() => setImageUpload(prev => ({ ...prev, error: undefined }))}
            >
              <X className="w-3 h-3 mr-1" />
              關閉
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* 錯誤訊息 */}
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 圖片管理面板 */}
      <ImageManagementPanel />
    </motion.div>
  )
}

export default RichTextEditor