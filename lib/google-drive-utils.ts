/**
 * Google Drive Utilities for File Management and Preview
 * 
 * @description Utilities for handling Google Drive files, generating thumbnails,
 *              and converting URLs for different purposes (view, download, preview)
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 * @version 1.0.0
 */

/**
 * Extract Google Drive file ID from various URL formats
 * 
 * @param url - Google Drive URL (view, edit, or direct link)
 * @returns File ID or null if not a valid Google Drive URL
 */
export function extractDriveFileId(url: string): string | null {
  // Handle different Google Drive URL formats:
  // https://drive.google.com/file/d/{fileId}/view
  // https://docs.google.com/document/d/{fileId}/edit
  // https://docs.google.com/presentation/d/{fileId}/edit
  // https://docs.google.com/spreadsheets/d/{fileId}/edit
  
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9-_]+)/,           // drive.google.com/file/d/ID
    /\/document\/d\/([a-zA-Z0-9-_]+)/,       // docs.google.com/document/d/ID
    /\/presentation\/d\/([a-zA-Z0-9-_]+)/,   // docs.google.com/presentation/d/ID  
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,   // docs.google.com/spreadsheets/d/ID
    /id=([a-zA-Z0-9-_]+)/,                   // ?id=ID format
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  return null
}

/**
 * Generate Google Drive thumbnail URL
 * 
 * @param fileId - Google Drive file ID
 * @param size - Thumbnail size (default: 400)
 * @returns Thumbnail URL
 */
export function generateDriveThumbnailUrl(fileId: string, size: number = 400): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=s${size}`
}

/**
 * Generate Google Drive direct download URL
 * 
 * @param fileId - Google Drive file ID
 * @returns Direct download URL
 */
export function generateDriveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`
}

/**
 * Generate Google Drive preview URL (opens in Drive viewer)
 * 
 * @param fileId - Google Drive file ID
 * @returns Preview URL that opens in new tab
 */
export function generateDrivePreviewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`
}

/**
 * Detect file type from Google Drive URL or file extension
 * 
 * @param url - Original Google Drive URL
 * @returns File type classification
 */
export function detectDriveFileType(url: string): 'presentation' | 'document' | 'spreadsheet' | 'pdf' | 'unknown' {
  if (url.includes('/presentation/')) {
    return 'presentation'
  } else if (url.includes('/document/')) {
    return 'document'
  } else if (url.includes('/spreadsheets/')) {
    return 'spreadsheet'
  } else if (url.includes('.pdf') || url.toLowerCase().includes('pdf')) {
    return 'pdf'
  }
  
  return 'unknown'
}

/**
 * Get appropriate file extension based on detected type
 * 
 * @param fileType - Detected file type
 * @returns File extension
 */
export function getFileExtension(fileType: string): string {
  const extensionMap: Record<string, string> = {
    'presentation': 'PPTX',
    'document': 'DOCX', 
    'spreadsheet': 'XLSX',
    'pdf': 'PDF',
    'unknown': 'FILE'
  }
  
  return extensionMap[fileType] || 'FILE'
}

/**
 * Estimate file size category for Google Drive files
 * (Since we can't get exact size without API access)
 * 
 * @param fileType - Detected file type
 * @returns Estimated size range
 */
export function estimateFileSize(fileType: string): string {
  const sizeEstimates: Record<string, string> = {
    'presentation': '2-5 MB',
    'document': '100-500 KB',
    'spreadsheet': '500 KB - 2 MB', 
    'pdf': '1-3 MB',
    'unknown': 'Unknown'
  }
  
  return sizeEstimates[fileType] || 'Unknown'
}

/**
 * Generate color scheme for file type badges
 * 
 * @param fileType - Detected file type
 * @returns Tailwind CSS color classes
 */
export function getFileTypeColors(fileType: string): { bg: string; text: string; icon: string } {
  const colorSchemes: Record<string, { bg: string; text: string; icon: string }> = {
    'presentation': {
      bg: 'bg-gradient-to-br from-orange-500 to-red-600',
      text: 'text-white',
      icon: 'text-white'
    },
    'document': {
      bg: 'bg-gradient-to-br from-blue-500 to-blue-600', 
      text: 'text-white',
      icon: 'text-white'
    },
    'spreadsheet': {
      bg: 'bg-gradient-to-br from-green-500 to-green-600',
      text: 'text-white', 
      icon: 'text-white'
    },
    'pdf': {
      bg: 'bg-gradient-to-br from-red-500 to-red-600',
      text: 'text-white',
      icon: 'text-white'
    },
    'unknown': {
      bg: 'bg-gradient-to-br from-gray-500 to-gray-600',
      text: 'text-white',
      icon: 'text-white'
    }
  }
  
  return colorSchemes[fileType] || colorSchemes.unknown
}

/**
 * Validate if URL is a Google Drive URL
 * 
 * @param url - URL to validate
 * @returns True if valid Google Drive URL
 */
export function isGoogleDriveUrl(url: string): boolean {
  return url.includes('drive.google.com') || 
         url.includes('docs.google.com') ||
         url.includes('sheets.google.com') ||
         url.includes('slides.google.com')
}

/**
 * Process Google Drive URL and extract all relevant information
 * 
 * @param originalUrl - Original Google Drive URL
 * @returns Processed drive file information
 */
export interface DriveFileInfo {
  fileId: string
  fileType: 'presentation' | 'document' | 'spreadsheet' | 'pdf' | 'unknown'
  extension: string
  thumbnailUrl: string
  downloadUrl: string
  previewUrl: string
  estimatedSize: string
  colors: { bg: string; text: string; icon: string }
  isGoogleDriveFile: boolean
}

export function processDriveUrl(originalUrl: string): DriveFileInfo | null {
  if (!isGoogleDriveUrl(originalUrl)) {
    return null
  }
  
  const fileId = extractDriveFileId(originalUrl)
  if (!fileId) {
    return null
  }
  
  const fileType = detectDriveFileType(originalUrl)
  const extension = getFileExtension(fileType)
  const estimatedSize = estimateFileSize(fileType)
  const colors = getFileTypeColors(fileType)
  
  return {
    fileId,
    fileType,
    extension,
    thumbnailUrl: generateDriveThumbnailUrl(fileId, 400),
    downloadUrl: generateDriveDownloadUrl(fileId), 
    previewUrl: generateDrivePreviewUrl(fileId),
    estimatedSize,
    colors,
    isGoogleDriveFile: true
  }
}

/**
 * Handle thumbnail loading errors with fallback
 * 
 * @param thumbnailUrl - Original thumbnail URL
 * @param fileType - File type for fallback
 * @returns Fallback thumbnail strategy
 */
export function handleThumbnailError(thumbnailUrl: string, fileType: string): string {
  // Return a data URL for a simple colored rectangle as fallback
  const colors = getFileTypeColors(fileType)
  const extension = getFileExtension(fileType)
  
  // Generate SVG fallback
  const svgFallback = `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(147,51,234);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(219,39,119);stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#grad)" rx="12"/>
      <text x="200" y="140" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" font-weight="bold">${extension}</text>
      <text x="200" y="170" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle">Google Drive File</text>
    </svg>
  `)}`
  
  return svgFallback
}

/**
 * Clean filename for cross-platform compatibility
 * 
 * @param filename - Original filename
 * @returns Cleaned filename safe for file systems
 */
export function cleanFilename(filename: string): string {
  // Remove or replace characters that are problematic in filenames
  return filename
    .replace(/[<>:"/\\|?*]/g, '_') // Replace illegal characters
    .replace(/\s+/g, ' ')          // Normalize whitespace
    .trim()                        // Remove leading/trailing spaces
    .substring(0, 200)             // Limit length to prevent issues
}

/**
 * Get appropriate file extension based on Drive file type
 * 
 * @param driveFileType - Detected Google Drive file type
 * @returns File extension with dot
 */
export function getFileExtensionWithDot(driveFileType: string): string {
  const extensionMap: Record<string, string> = {
    'presentation': '.pptx',
    'document': '.docx',
    'spreadsheet': '.xlsx', 
    'pdf': '.pdf',
    'unknown': '.file'
  }
  
  return extensionMap[driveFileType] || '.file'
}

/**
 * Download Google Drive file with custom filename using JavaScript
 * 
 * @param fileId - Google Drive file ID
 * @param customFilename - Desired filename (without extension)
 * @param fileType - File type for extension determination
 * @param onProgress - Progress callback (optional)
 * @param onError - Error callback (optional)
 * @param onSuccess - Success callback (optional)
 */
export async function downloadFileWithCustomName(
  fileId: string,
  customFilename: string,
  fileType: string = 'unknown',
  onProgress?: (progress: number) => void,
  onError?: (error: string) => void,
  onSuccess?: (filename: string) => void
): Promise<void> {
  try {
    // Clean the filename and add appropriate extension
    const cleanedName = cleanFilename(customFilename)
    const extension = getFileExtensionWithDot(fileType)
    const fullFilename = cleanedName + extension
    
    // Generate download URL
    const downloadUrl = generateDriveDownloadUrl(fileId)
    
    // Show progress if callback provided
    onProgress?.(10)
    
    // Attempt to fetch the file
    const response = await fetch(downloadUrl, {
      method: 'GET',
      mode: 'cors',
    })
    
    onProgress?.(50)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    // Get the file as blob
    const blob = await response.blob()
    onProgress?.(90)
    
    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fullFilename
    link.style.display = 'none'
    
    // Append to body, click, and remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Cleanup
    URL.revokeObjectURL(url)
    
    onProgress?.(100)
    onSuccess?.(fullFilename)
    
  } catch (error) {
    console.error('Download failed:', error)
    
    // Fallback: open original Google Drive download in new tab
    const fallbackUrl = generateDriveDownloadUrl(fileId)
    window.open(fallbackUrl, '_blank')
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown download error'
    onError?.(errorMessage)
  }
}

/**
 * Download handler with loading state management
 * This is the main function to use in React components
 * 
 * @param fileId - Google Drive file ID
 * @param customFilename - Desired filename 
 * @param fileType - File type for extension
 * @returns Promise with download status
 */
export async function handleCustomDownload(
  fileId: string,
  customFilename: string,
  fileType: string = 'unknown'
): Promise<{ success: boolean; filename?: string; error?: string }> {
  return new Promise((resolve) => {
    downloadFileWithCustomName(
      fileId,
      customFilename,
      fileType,
      undefined, // progress callback - can be added later
      (error) => {
        resolve({ success: false, error })
      },
      (filename) => {
        resolve({ success: true, filename })
      }
    )
  })
}

/**
 * Check if custom download is supported by the browser
 * 
 * @returns True if browser supports custom downloads
 */
export function isCustomDownloadSupported(): boolean {
  return typeof window !== 'undefined' && 
         typeof document !== 'undefined' &&
         'createElement' in document &&
         'URL' in window &&
         'createObjectURL' in URL
}