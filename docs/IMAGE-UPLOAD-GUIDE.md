# 📸 圖片上傳功能使用指南
# Image Upload Feature User Guide

> **KCISLK ESID Info Hub - 富文本編輯器圖片上傳整合功能**  
> **KCISLK ESID Info Hub - Rich Text Editor Image Upload Integration**

## 🎯 功能概述 | Feature Overview

本系統已完成富文本編輯器與圖片上傳功能的完整整合，提供直觀、高效的圖片管理體驗。

This system provides complete integration between the rich text editor and image upload functionality, offering an intuitive and efficient image management experience.

### ✨ 主要特色 | Key Features

- **🖱️ 拖拽上傳**: 直接將圖片拖拽到編輯器中
- **📋 剪貼簿支援**: 支援複製貼上圖片
- **🔄 自動壓縮**: 圖片自動壓縮最佳化
- **🖼️ 縮略圖生成**: 自動產生縮略圖預覽
- **👁️ 圖片預覽**: 點擊圖片可放大檢視
- **💾 進度顯示**: 即時上傳進度回饋
- **🔒 安全驗證**: 完整的檔案類型和大小驗證

## 📋 使用說明 | Usage Instructions

### 1. 在富文本編輯器中上傳圖片

#### 方法一：拖拽上傳
1. 將圖片檔案直接拖拽到編輯器區域
2. 系統會自動驗證並上傳圖片
3. 上傳完成後圖片會自動插入到編輯器中

#### 方法二：工具列上傳
1. 點擊編輯器工具列中的「上傳圖片」按鈕
2. 選擇要上傳的圖片檔案
3. 確認上傳並插入到編輯器中

#### 方法三：複製貼上
1. 複製圖片（Ctrl+C 或 Cmd+C）
2. 在編輯器中貼上（Ctrl+V 或 Cmd+V）
3. 圖片會自動上傳並插入

### 2. 圖片管理功能

#### 已上傳圖片列表
- 在編輯器下方會顯示本次上傳的所有圖片
- 每張圖片顯示檔案名稱和大小
- 可點擊圖片重新插入到編輯器中

#### 圖片預覽和編輯
- 在公告中點擊圖片可放大檢視
- 支援圖片下載功能
- 自動調整圖片大小以適應不同螢幕

### 3. 技術規格 | Technical Specifications

#### 支援的圖片格式
- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **GIF** (.gif)
- **WebP** (.webp)

#### 檔案限制
- **單張圖片最大**: 5MB
- **一次最多上傳**: 10張圖片
- **總檔案大小**: 依伺服器配置

#### 自動處理功能
- **圖片壓縮**: 自動壓縮至最佳品質（85%）
- **尺寸調整**: 超過 2048px 寬度的圖片會自動縮放
- **縮略圖**: 自動生成 300x300 縮略圖
- **格式最佳化**: 根據圖片類型最佳化檔案格式

## 🔧 開發者指南 | Developer Guide

### 組件使用

#### RichTextEditor 組件
```tsx
import { RichTextEditor } from '@/components/ui/rich-text-editor'

<RichTextEditor
  value={content}
  onChange={setContent}
  enableImageUpload={true}
  onImageUpload={(images) => {
    console.log('Uploaded images:', images)
  }}
  uploadEndpoint="/api/upload/images"
  maxImageSize={5 * 1024 * 1024} // 5MB
  maxImages={10}
  relatedType="announcement"
  relatedId={announcementId}
/>
```

#### AnnouncementForm 整合
```tsx
// AnnouncementForm 已完成整合
// 包含圖片上傳狀態管理和 UI 顯示
const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])

const handleImageUpload = useCallback((images: UploadedImage[]) => {
  setUploadedImages(prev => [...prev, ...images])
}, [])
```

### API 端點

#### 圖片上傳 API
```typescript
POST /api/upload/images
Content-Type: multipart/form-data

// 表單資料
{
  images: File[], // 圖片檔案陣列
  relatedType?: string, // 關聯類型
  relatedId?: number, // 關聯 ID
  generateThumbnail?: boolean, // 是否生成縮略圖
  compressImage?: boolean // 是否壓縮圖片
}

// 回應
{
  success: boolean,
  uploaded: number,
  total: number,
  images: UploadedImage[],
  errors?: UploadError[]
}
```

#### 圖片刪除 API
```typescript
DELETE /api/upload/images?fileId={fileId}

// 回應
{
  success: boolean,
  message: string
}
```

### 使用 Hook

#### useImageUpload Hook
```tsx
import { useImageUpload } from '@/hooks/useFileUpload'

const { uploadImages, uploading, progress, error } = useImageUpload({
  maxFiles: 10,
  onSuccess: (results) => {
    console.log('Upload successful:', results)
  },
  onError: (errors) => {
    console.error('Upload errors:', errors)
  }
})

// 上傳圖片
const handleUpload = async (files: File[]) => {
  try {
    const result = await uploadImages(files, {
      relatedType: 'announcement',
      relatedId: announcementId
    })
    console.log('Upload result:', result)
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
```

## 🎨 樣式自訂 | Style Customization

### CSS 類別
```css
/* 圖片樣式 */
.prose img {
  @apply max-w-full h-auto rounded-lg shadow-sm cursor-pointer;
  @apply hover:shadow-md hover:scale-[1.02] transition-all duration-200;
}

/* 燈箱樣式 */
.image-lightbox {
  @apply fixed inset-0 z-50 flex items-center justify-center;
  @apply bg-black/80 backdrop-blur-sm;
}

/* 上傳進度 */
.upload-progress {
  @apply w-full bg-blue-200 rounded-full h-2;
}
```

### 主題支援
- 支援明暗主題切換
- 自動適應系統主題
- 可自訂顏色配置

## 🔒 安全性說明 | Security Notes

### 檔案驗證
- **MIME 類型檢查**: 驗證檔案真實類型
- **Magic Bytes 檢測**: 防止檔案類型偽裝
- **檔案大小限制**: 防止大檔案上傳
- **惡意檔案檢測**: 掃描潛在的惡意內容

### 權限控制
- **使用者認證**: 需要有效的使用者 session
- **角色權限**: 根據使用者角色限制功能
- **檔案所有權**: 只有上傳者和管理員可刪除檔案

### 儲存安全
- **安全檔名**: 自動生成安全的檔案名稱
- **路徑保護**: 防止目錄遍歷攻擊
- **訪問控制**: 通過 API 控制檔案訪問

## 🚀 效能最佳化 | Performance Optimization

### 圖片處理
- **自動壓縮**: 減少檔案大小
- **漸進式 JPEG**: 改善載入體驗
- **WebP 支援**: 現代瀏覽器最佳化
- **縮略圖**: 快速預覽載入

### 網路最佳化
- **並行上傳**: 多檔案同時上傳
- **錯誤重試**: 自動重試失敗的上傳
- **進度追蹤**: 即時上傳狀態更新

## 🐛 常見問題 | Troubleshooting

### 上傳失敗
**問題**: 圖片上傳失敗  
**解決方案**:
1. 檢查檔案格式是否支援
2. 確認檔案大小是否超過限制
3. 檢查網路連接狀況
4. 確認使用者權限

### 圖片不顯示
**問題**: 上傳的圖片無法顯示  
**解決方案**:
1. 檢查圖片 URL 是否正確
2. 確認圖片檔案是否存在
3. 檢查瀏覽器控制台錯誤訊息
4. 驗證 API 回應狀態

### 效能問題
**問題**: 圖片載入慢或卡頓  
**解決方案**:
1. 檢查圖片大小和壓縮設定
2. 確認縮略圖是否正常生成
3. 考慮使用 CDN 加速
4. 最佳化圖片格式

## 📞 技術支援 | Technical Support

如有任何問題或建議，請聯繫開發團隊：

- **專案倉庫**: KCISLK ESID Info Hub GitHub
- **問題回報**: 使用 GitHub Issues
- **技術文件**: 查看 `/docs` 目錄
- **測試腳本**: 執行 `npm run test:image-integration`

---

*最後更新: 2025-01-31*  
*版本: 1.0.0*