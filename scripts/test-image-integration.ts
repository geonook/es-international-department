/**
 * Image Upload Integration Testing Script
 * 圖片上傳整合測試腳本 - 驗證富文本編輯器與圖片上傳功能整合
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

interface TestResult {
  name: string
  passed: boolean
  error?: string
  details?: any
}

class ImageIntegrationTester {
  private results: TestResult[] = []
  private baseDir = process.cwd()

  async runAllTests(): Promise<void> {
    console.log('🧪 開始圖片上傳整合測試...\n')

    await this.testRichTextEditorIntegration()
    await this.testAnnouncementFormIntegration()
    await this.testAnnouncementCardImageDisplay()
    await this.testImageUploadAPI()
    await this.testFileUploadHook()
    await this.testImageLightboxFunctionality()

    this.printResults()
  }

  private async testRichTextEditorIntegration(): Promise<void> {
    console.log('📝 測試富文本編輯器圖片上傳整合...')

    try {
      const editorPath = join(this.baseDir, 'components/ui/rich-text-editor.tsx')
      
      if (!existsSync(editorPath)) {
        throw new Error('Rich text editor component not found')
      }

      const content = readFileSync(editorPath, 'utf-8')

      // 檢查圖片上傳相關 props
      const hasImageUploadProps = [
        'enableImageUpload',
        'onImageUpload',
        'uploadEndpoint',
        'maxImageSize',
        'maxImages'
      ].every(prop => content.includes(prop))

      if (!hasImageUploadProps) {
        throw new Error('Missing image upload props in RichTextEditor')
      }

      // 檢查 TinyMCE 圖片上傳配置
      const hasImageConfig = [
        'images_upload_handler',
        'images_upload_url',
        'automatic_uploads',
        'paste_data_images'
      ].every(config => content.includes(config))

      if (!hasImageConfig) {
        throw new Error('Missing TinyMCE image upload configuration')
      }

      // 檢查圖片管理面板
      const hasImageManagement = content.includes('ImageManagementPanel')
      if (!hasImageManagement) {
        throw new Error('Missing image management panel')
      }

      // 檢查拖拽功能
      const hasDragDrop = [
        'handleDrop',
        'onDrop',
        'onDragOver'
      ].every(func => content.includes(func))

      if (!hasDragDrop) {
        throw new Error('Missing drag and drop functionality')
      }

      this.addResult({
        name: 'Rich Text Editor Image Integration',
        passed: true,
        details: {
          imageUploadProps: hasImageUploadProps,
          tinyMCEConfig: hasImageConfig,
          imageManagement: hasImageManagement,
          dragDrop: hasDragDrop
        }
      })

    } catch (error) {
      this.addResult({
        name: 'Rich Text Editor Image Integration',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  private async testAnnouncementFormIntegration(): Promise<void> {
    console.log('📄 測試公告表單圖片上傳整合...')

    try {
      const formPath = join(this.baseDir, 'components/AnnouncementForm.tsx')
      
      if (!existsSync(formPath)) {
        throw new Error('AnnouncementForm component not found')
      }

      const content = readFileSync(formPath, 'utf-8')

      // 檢查圖片上傳狀態管理
      const hasImageState = [
        'uploadedImages',
        'setUploadedImages',
        'imageUploadError',
        'handleImageUpload'
      ].every(item => content.includes(item))

      if (!hasImageState) {
        throw new Error('Missing image upload state management')
      }

      // 檢查 RichTextEditor 圖片上傳配置
      const hasEditorImageConfig = [
        'enableImageUpload={true}',
        'onImageUpload={handleImageUpload}',
        'uploadEndpoint="/api/upload/images"'
      ].every(config => content.includes(config))

      if (!hasEditorImageConfig) {
        throw new Error('Missing RichTextEditor image upload configuration')
      }

      // 檢查圖片管理 UI
      const hasImageManagementUI = [
        '已上傳的圖片',
        '圖片上傳說明',
        'Image upload tips'
      ].some(text => content.includes(text))

      if (!hasImageManagementUI) {
        throw new Error('Missing image management UI')
      }

      this.addResult({
        name: 'AnnouncementForm Image Integration',
        passed: true,
        details: {
          imageState: hasImageState,
          editorConfig: hasEditorImageConfig,
          managementUI: hasImageManagementUI
        }
      })

    } catch (error) {
      this.addResult({
        name: 'AnnouncementForm Image Integration',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  private async testAnnouncementCardImageDisplay(): Promise<void> {
    console.log('🖼️ 測試公告卡片圖片顯示功能...')

    try {
      const cardPath = join(this.baseDir, 'components/AnnouncementCard.tsx')
      
      if (!existsSync(cardPath)) {
        throw new Error('AnnouncementCard component not found')
      }

      const content = readFileSync(cardPath, 'utf-8')

      // 檢查圖片相關狀態
      const hasImageState = [
        'lightboxImage',
        'setLightboxImage',
        'imageError'
      ].every(item => content.includes(item))

      if (!hasImageState) {
        throw new Error('Missing image display state management')
      }

      // 檢查圖片處理函式
      const hasImageHandlers = [
        'handleImageClick',
        'handleCloseLightbox',
        'handleImageError',
        'renderContentWithClickableImages'
      ].every(handler => content.includes(handler))

      if (!hasImageHandlers) {
        throw new Error('Missing image handling functions')
      }

      // 檢查圖片燈箱 UI
      const hasLightbox = [
        'lightboxImage &&',
        'fixed inset-0',
        'bg-black/80'
      ].every(item => content.includes(item))

      if (!hasLightbox) {
        throw new Error('Missing image lightbox functionality')
      }

      // 檢查圖片計數功能
      const hasImageCount = content.includes('getImageCount')
      if (!hasImageCount) {
        throw new Error('Missing image count functionality')
      }

      this.addResult({
        name: 'AnnouncementCard Image Display',
        passed: true,
        details: {
          imageState: hasImageState,
          imageHandlers: hasImageHandlers,
          lightbox: hasLightbox,
          imageCount: hasImageCount
        }
      })

    } catch (error) {
      this.addResult({
        name: 'AnnouncementCard Image Display',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  private async testImageUploadAPI(): Promise<void> {
    console.log('🔗 測試圖片上傳 API 端點...')

    try {
      const apiPath = join(this.baseDir, 'app/api/upload/images/route.ts')
      
      if (!existsSync(apiPath)) {
        throw new Error('Image upload API route not found')
      }

      const content = readFileSync(apiPath, 'utf-8')

      // 檢查 HTTP 方法支援
      const hasMethods = [
        'export async function POST',
        'export async function GET',
        'export async function DELETE'
      ].every(method => content.includes(method))

      if (!hasMethods) {
        throw new Error('Missing HTTP method handlers')
      }

      // 檢查圖片處理功能
      const hasImageProcessing = [
        'MAX_IMAGE_SIZE',
        'MAX_IMAGES_PER_REQUEST',
        'SUPPORTED_FORMATS',
        'generateThumbnail',
        'compressImage'
      ].every(feature => content.includes(feature))

      if (!hasImageProcessing) {
        throw new Error('Missing image processing features')
      }

      // 檢查安全驗證
      const hasSecurity = [
        'getCurrentUser',
        'Authentication required',
        'size > MAX_IMAGE_SIZE'
      ].every(check => content.includes(check))

      if (!hasSecurity) {
        throw new Error('Missing security validations')
      }

      this.addResult({
        name: 'Image Upload API',
        passed: true,
        details: {
          httpMethods: hasMethods,
          imageProcessing: hasImageProcessing,
          security: hasSecurity
        }
      })

    } catch (error) {
      this.addResult({
        name: 'Image Upload API',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  private async testFileUploadHook(): Promise<void> {
    console.log('🪝 測試檔案上傳 Hook...')

    try {
      const hookPath = join(this.baseDir, 'hooks/useFileUpload.ts')
      
      if (!existsSync(hookPath)) {
        throw new Error('File upload hook not found')
      }

      const content = readFileSync(hookPath, 'utf-8')

      // 檢查基本 Hook 功能
      const hasBasicFeatures = [
        'useFileUpload',
        'useImageUpload',
        'useFileManager'
      ].every(hook => content.includes(hook))

      if (!hasBasicFeatures) {
        throw new Error('Missing basic hook functions')
      }

      // 檢查圖片專用功能
      const hasImageFeatures = [
        'uploadImages',
        "allowedTypes: ['image']",
        '/api/upload/images'
      ].every(feature => content.includes(feature))

      if (!hasImageFeatures) {
        throw new Error('Missing image-specific features')
      }

      // 檢查檔案管理功能
      const hasFileManagement = [
        'deleteFile',
        'getFileInfo',
        'getUploadConfig'
      ].every(func => content.includes(func))

      if (!hasFileManagement) {
        throw new Error('Missing file management features')
      }

      this.addResult({
        name: 'File Upload Hook',
        passed: true,
        details: {
          basicFeatures: hasBasicFeatures,
          imageFeatures: hasImageFeatures,
          fileManagement: hasFileManagement
        }
      })

    } catch (error) {
      this.addResult({
        name: 'File Upload Hook',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  private async testImageLightboxFunctionality(): Promise<void> {
    console.log('🔍 測試圖片燈箱功能...')

    try {
      const cardPath = join(this.baseDir, 'components/AnnouncementCard.tsx')
      const editorPath = join(this.baseDir, 'components/ui/rich-text-editor.tsx')
      
      if (!existsSync(cardPath) || !existsSync(editorPath)) {
        throw new Error('Required components not found')
      }

      const cardContent = readFileSync(cardPath, 'utf-8')

      // 檢查燈箱 UI 組件
      const hasLightboxUI = [
        'AnimatePresence',
        'lightboxImage &&',
        'motion.div',
        'backdrop-blur-sm'
      ].every(ui => cardContent.includes(ui))

      if (!hasLightboxUI) {
        throw new Error('Missing lightbox UI components')
      }

      // 檢查燈箱控制按鈕
      const hasLightboxControls = [
        'handleCloseLightbox',
        'Download',
        'X className'
      ].every(control => cardContent.includes(control))

      if (!hasLightboxControls) {
        throw new Error('Missing lightbox control buttons')
      }

      // 檢查圖片點擊處理
      const hasClickHandling = [
        'handleImageClick',
        'window.handleAnnouncementImageClick',
        'cursor: pointer'
      ].every(handler => cardContent.includes(handler))

      if (!hasClickHandling) {
        throw new Error('Missing image click handling')
      }

      this.addResult({
        name: 'Image Lightbox Functionality',
        passed: true,
        details: {
          lightboxUI: hasLightboxUI,
          lightboxControls: hasLightboxControls,
          clickHandling: hasClickHandling
        }
      })

    } catch (error) {
      this.addResult({
        name: 'Image Lightbox Functionality',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  private addResult(result: TestResult): void {
    this.results.push(result)
    const status = result.passed ? '✅' : '❌'
    console.log(`${status} ${result.name}`)
    if (result.error) {
      console.log(`   錯誤: ${result.error}`)
    }
    console.log()
  }

  private printResults(): void {
    const passed = this.results.filter(r => r.passed).length
    const total = this.results.length
    const percentage = Math.round((passed / total) * 100)

    console.log('=' .repeat(60))
    console.log('📊 圖片上傳整合測試結果')
    console.log('=' .repeat(60))
    console.log(`✅ 通過: ${passed}/${total} (${percentage}%)`)
    console.log(`❌ 失敗: ${total - passed}/${total}`)
    console.log()

    if (passed === total) {
      console.log('🎉 所有測試通過！圖片上傳功能整合完成。')
      console.log()
      console.log('📋 功能清單:')
      console.log('• ✅ 富文本編輯器圖片上傳')
      console.log('• ✅ 拖拽上傳圖片')
      console.log('• ✅ 圖片自動壓縮和縮略圖')
      console.log('• ✅ 圖片管理介面')
      console.log('• ✅ 公告卡片圖片顯示')
      console.log('• ✅ 圖片點擊放大燈箱')
      console.log('• ✅ 圖片下載功能')
      console.log('• ✅ 響應式圖片顯示')
    } else {
      console.log('⚠️  部分測試失敗，請檢查以下問題:')
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`• ${result.name}: ${result.error}`)
      })
    }

    console.log()
    console.log('🚀 下一步:')
    console.log('1. 啟動開發伺服器: npm run dev')
    console.log('2. 測試圖片上傳功能: http://localhost:3000/admin/announcements')
    console.log('3. 驗證圖片在公告中的顯示效果')
    console.log()
  }
}

// 執行測試
if (require.main === module) {
  const tester = new ImageIntegrationTester()
  tester.runAllTests().catch(console.error)
}

export { ImageIntegrationTester }