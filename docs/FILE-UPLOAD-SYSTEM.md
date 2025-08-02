# File Upload System Documentation
# 檔案上傳系統文件

> **ES International Department - Secure File Upload System**  
> **ES 國際部 - 安全檔案上傳系統**

## 🚀 Overview | 系統概述

The ES International Department file upload system provides a comprehensive, secure, and user-friendly solution for handling file uploads in the application. It supports multiple file types with robust security validation, automatic optimization, and seamless integration with the existing authentication system.

ES 國際部檔案上傳系統提供全面、安全且用戶友好的檔案上傳解決方案。支援多種檔案類型，具備強大的安全驗證、自動最佳化功能，並與現有認證系統無縫整合。

## 📋 Features | 功能特色

### ✅ Core Features | 核心功能
- **Multi-file upload** with drag-and-drop interface | 多檔案上傳與拖放介面
- **Image optimization** and compression | 圖片最佳化與壓縮
- **Thumbnail generation** for images | 圖片縮略圖產生
- **Progress tracking** and error handling | 進度追蹤與錯誤處理
- **File management** with delete/download | 檔案管理與刪除/下載功能
- **Database integration** with metadata storage | 資料庫整合與元數據儲存

### 🔒 Security Features | 安全功能
- **MIME type validation** with magic bytes detection | MIME類型驗證與魔數檢測
- **File signature verification** to prevent spoofing | 檔案簽章驗證防止偽造
- **Malicious pattern detection** | 惡意模式檢測
- **Filename sanitization** with UUID generation | 檔名安全化與UUID產生
- **Path traversal protection** | 路徑遍歷攻擊防護
- **File size limits** enforcement | 檔案大小限制強制執行
- **Whitelist-based validation** | 白名單驗證機制

### 🎨 User Experience | 使用者體驗
- **Responsive design** with Tailwind CSS | 響應式設計
- **Toast notifications** for feedback | 提示通知回饋
- **Loading states** and progress indicators | 載入狀態與進度指示器
- **Error handling** with clear messages | 錯誤處理與清晰訊息
- **Accessibility** compliant components | 無障礙相容組件

## 📁 File Structure | 檔案結構

```
📁 File Upload System
├── 📁 API Routes
│   ├── app/api/upload/route.ts              # Main upload endpoint
│   ├── app/api/upload/images/route.ts       # Image-specific upload
│   └── app/api/files/[...path]/route.ts     # File serving endpoint
├── 📁 Core Libraries
│   ├── lib/fileUpload.ts                    # Core upload utilities
│   └── lib/types/upload.ts                  # TypeScript definitions
├── 📁 React Components
│   ├── components/FileUploader.tsx          # Upload components
│   └── components/FileList.tsx              # File management UI
├── 📁 React Hooks
│   └── hooks/useFileUpload.ts               # Upload state management
├── 📁 Testing & Documentation
│   ├── app/test-upload/page.tsx             # Test/demo page
│   ├── scripts/test-upload-system.ts        # Test suite
│   └── docs/FILE-UPLOAD-SYSTEM.md           # This document
└── 📁 Upload Storage
    └── public/uploads/                      # File storage directory
        ├── images/                          # Image files
        ├── documents/                       # Document files
        └── temp/                           # Temporary files
```

## 🔧 API Endpoints | API 端點

### 📤 Upload Files | 檔案上傳

#### `POST /api/upload`
Upload multiple files with comprehensive validation.

**Request:**
```typescript
FormData: {
  files: File[]                    // Array of files to upload
  relatedType?: string            // Optional entity type (e.g., "announcement")
  relatedId?: number              // Optional entity ID
  generateThumbnail?: boolean     // Generate thumbnails for images
  compressImage?: boolean         // Enable image compression
  allowedTypes?: string           // Comma-separated: "image,document"
}
```

**Response:**
```typescript
{
  success: boolean
  uploaded: number
  total: number
  results?: UploadedFile[]
  errors?: UploadError[]
}
```

#### `POST /api/upload/images`
Image-specific upload with optimization.

**Request:**
```typescript
FormData: {
  images: File[]                  // Array of image files
  relatedType?: string
  relatedId?: number
  generateThumbnail?: boolean
  compressImage?: boolean
}
```

**Response:**
```typescript
{
  success: boolean
  uploaded: number
  total: number
  images: UploadedFile[]
  errors?: UploadError[]
}
```

### 📥 Serve Files | 檔案服務

#### `GET /api/files/[...path]`
Serve uploaded files with permission control.

**Query Parameters:**
- `download=true` - Force download
- `inline=true` - Display inline
- `fileId=123` - File ID for permission check

**Response:**
- File content with appropriate headers
- Caching headers for optimization
- CORS headers for cross-origin access

### ⚙️ Configuration | 配置

#### `GET /api/upload`
Get upload system configuration and limits.

#### `GET /api/upload/images`
Get image-specific upload configuration.

## 💻 Usage Examples | 使用範例

### React Component Usage | React 組件使用

```tsx
import { FileUploader, ImageUploader, DocumentUploader } from '@/components/FileUploader'
import { useFileUpload } from '@/hooks/useFileUpload'

// General file upload
function MyUploadComponent() {
  const handleUpload = (files: UploadedFile[]) => {
    console.log('Uploaded files:', files)
  }

  return (
    <FileUploader
      maxFiles={10}
      allowedTypes={['image', 'document']}
      onUpload={handleUpload}
    />
  )
}

// Image-only upload
function ImageUploadComponent() {
  return (
    <ImageUploader
      maxFiles={5}
      onUpload={(images) => console.log('Images:', images)}
    />
  )
}

// Using the hook directly
function CustomUploader() {
  const { upload, uploading, progress, error } = useFileUpload({
    maxFiles: 5,
    onSuccess: (results) => console.log('Success:', results)
  })

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    await upload(files)
  }

  return (
    <div>
      <input type="file" multiple onChange={handleFileChange} />
      {uploading && <div>Upload progress: {progress}%</div>}
      {error && <div>Error: {error}</div>}
    </div>
  )
}
```

### API Usage | API 使用

```typescript
// Upload files programmatically
async function uploadFiles(files: File[]) {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))
  formData.append('generateThumbnail', 'true')
  formData.append('compressImage', 'true')

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  })

  const result = await response.json()
  return result
}

// Get upload configuration
async function getUploadConfig() {
  const response = await fetch('/api/upload')
  const config = await response.json()
  return config
}
```

## 🔧 Configuration | 系統配置

### File Type Limits | 檔案類型限制

```typescript
const FILE_TYPES = {
  IMAGES: {
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    directory: 'images'
  },
  DOCUMENTS: {
    extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
    mimeTypes: ['application/pdf', 'application/msword', ...],
    maxSize: 10 * 1024 * 1024, // 10MB
    directory: 'documents'
  }
}
```

### Security Configuration | 安全配置

```typescript
// Malicious file patterns
const MALICIOUS_PATTERNS = [
  /\.exe$/i, /\.bat$/i, /\.cmd$/i, /\.scr$/i,
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi, /vbscript:/gi
]

// Image optimization settings
const COMPRESSION_QUALITY = 85
const THUMBNAIL_SIZE = { width: 300, height: 300 }
```

## 🧪 Testing | 測試

### Test Page | 測試頁面
Visit `/test-upload` to test the upload system with a comprehensive UI.

### Test Script | 測試腳本
```bash
npm run test:upload
```

This script tests:
- ✅ Upload directory creation
- ✅ Database connectivity
- ✅ File validation functions
- ✅ Security configurations
- ✅ API endpoint responses

### Manual Testing | 手動測試

1. **File Type Validation:**
   - Try uploading unsupported files (.exe, .js)
   - Should be rejected with clear error messages

2. **Size Limits:**
   - Upload files larger than limits
   - Should show appropriate error messages

3. **Security:**
   - Try uploading files with malicious content
   - Should be detected and blocked

4. **Image Processing:**
   - Upload large images
   - Should be compressed and thumbnails generated

## 🔍 Troubleshooting | 疑難排解

### Common Issues | 常見問題

#### Upload Fails with 401 Error
**Problem:** Authentication required  
**Solution:** Ensure user is logged in with valid JWT token

#### Files Not Appearing After Upload
**Problem:** Directory permissions or path issues  
**Solution:** Check upload directory permissions and file paths

#### Images Not Optimized
**Problem:** Sharp library not installed or configured  
**Solution:** Ensure `sharp` package is installed: `npm install sharp`

#### Database Errors
**Problem:** FileUpload model not accessible  
**Solution:** Run `npx prisma generate` and check database connection

### Debug Mode | 除錯模式

Enable detailed logging:
```typescript
// Set environment variable
DEBUG_UPLOAD=true

// Or add to your code
console.log('Upload debug info:', {
  fileSize: file.size,
  mimeType: file.type,
  validation: await validateFile(buffer, filename)
})
```

## 🚀 Deployment | 部署

### Production Checklist | 生產環境檢查清單

- [ ] ✅ Upload directories exist with correct permissions
- [ ] ✅ Sharp library installed for image processing
- [ ] ✅ Database migrations applied
- [ ] ✅ File size limits appropriate for server
- [ ] ✅ CORS headers configured if needed
- [ ] ✅ Rate limiting enabled for upload endpoints
- [ ] ✅ Monitoring setup for file storage usage

### Environment Variables | 環境變數

```env
# Optional: Custom upload limits
MAX_FILE_SIZE=10485760          # 10MB in bytes
MAX_FILES_PER_REQUEST=10        # Maximum files per upload
UPLOAD_DIR=/custom/upload/path  # Custom upload directory

# Optional: Image processing
IMAGE_QUALITY=85                # Compression quality (1-100)
THUMBNAIL_SIZE=300              # Thumbnail size in pixels

# Optional: Security
ENABLE_FILE_SCANNING=true       # Enable malicious file detection
ALLOWED_ORIGINS=*               # CORS allowed origins
```

## 📊 Performance | 效能

### Optimization Tips | 最佳化建議

1. **File Storage:**
   - Use CDN for serving files in production
   - Implement file cleanup for old/unused files
   - Monitor disk usage regularly

2. **Image Processing:**
   - Sharp library provides excellent performance
   - Consider background processing for large images
   - Cache thumbnails aggressively

3. **Database:**
   - Index fileUpload table appropriately
   - Regular cleanup of orphaned records
   - Consider file metadata caching

### Monitoring | 監控

```typescript
// File upload metrics to monitor
{
  totalUploads: number,
  averageFileSize: number,
  uploadSuccess: number,
  uploadFailures: number,
  diskUsage: number,
  processingTime: number
}
```

## 🔮 Future Enhancements | 未來增強功能

### Planned Features | 計劃功能
- [ ] Cloud storage integration (AWS S3, Google Cloud)
- [ ] Video file support with thumbnail generation  
- [ ] Bulk file operations (zip upload/download)
- [ ] File version control and history
- [ ] Advanced image editing capabilities
- [ ] File sharing with expiration links
- [ ] Automated file classification using AI
- [ ] Virus scanning integration

### Integration Opportunities | 整合機會
- [ ] TinyMCE editor file upload
- [ ] Announcement attachment system
- [ ] Resource library integration
- [ ] User avatar upload system
- [ ] Newsletter image management
- [ ] Event photo galleries

---

## 📞 Support | 技術支援

For technical support or questions about the file upload system:

**Documentation:** This file and inline code comments  
**Test Page:** `/test-upload` for hands-on testing  
**Test Script:** `npm run test:upload` for automated validation  

**Best Practices:**
- Always validate files on both client and server
- Implement proper error handling and user feedback
- Monitor file storage usage and implement cleanup
- Keep security patterns updated
- Test with various file types and sizes

---

*ES International Department File Upload System v1.0*  
*Built with Next.js 14, TypeScript, Prisma, and Sharp*