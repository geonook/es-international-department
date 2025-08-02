/**
 * HTML Content Sanitizer
 * HTML 內容清理工具 - 確保富文本內容的安全性
 */

export interface SanitizeOptions {
  allowedTags?: string[]
  allowedAttributes?: Record<string, string[]>
  maxLength?: number
  removeEmptyTags?: boolean
  preserveWhitespace?: boolean
}

const DEFAULT_ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'code', 'pre',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'span',
  'hr'
]

const DEFAULT_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  'a': ['href', 'title', 'target', 'rel'],
  'img': ['src', 'alt', 'title', 'width', 'height'],
  'table': ['class'],
  'th': ['colspan', 'rowspan'],
  'td': ['colspan', 'rowspan'],
  'blockquote': ['cite'],
  'code': ['class'],
  'pre': ['class'],
  'div': ['class'],
  'span': ['class'],
  'p': ['class'],
  'h1': ['class'],
  'h2': ['class'],
  'h3': ['class'],
  'h4': ['class'],
  'h5': ['class'],
  'h6': ['class'],
  'ul': ['class'],
  'ol': ['class'],
  'li': ['class']
}

/**
 * 簡單的 HTML 清理器
 * 移除不安全的標籤和屬性
 */
export function sanitizeHtml(
  html: string,
  options: SanitizeOptions = {}
): string {
  const {
    allowedTags = DEFAULT_ALLOWED_TAGS,
    allowedAttributes = DEFAULT_ALLOWED_ATTRIBUTES,
    maxLength = 50000,
    removeEmptyTags = true,
    preserveWhitespace = false
  } = options

  if (!html || typeof html !== 'string') {
    return ''
  }

  // 限制長度
  if (html.length > maxLength) {
    html = html.substring(0, maxLength)
  }

  // 移除危險的標籤和屬性
  let sanitized = html
    // 移除 script 標籤
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // 移除 style 標籤
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // 移除事件處理屬性
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    // 移除 javascript: 協議
    .replace(/javascript:/gi, '')
    // 移除 vbscript: 協議
    .replace(/vbscript:/gi, '')
    // 移除 data: 協議（除了圖片）
    .replace(/data:(?!image\/)/gi, '')

  // 移除不允許的標籤
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g
  sanitized = sanitized.replace(tagRegex, (match, tagName) => {
    if (!allowedTags.includes(tagName.toLowerCase())) {
      return ''
    }
    return match
  })

  // 移除不允許的屬性
  const attrRegex = /<([a-zA-Z][a-zA-Z0-9]*)\s+([^>]+)>/g
  sanitized = sanitized.replace(attrRegex, (match, tagName, attributes) => {
    const tag = tagName.toLowerCase()
    const allowedAttrs = allowedAttributes[tag] || []
    
    if (allowedAttrs.length === 0) {
      return `<${tag}>`
    }

    // 解析屬性
    const attrPairs = attributes.match(/(\w+)\s*=\s*["']([^"']*)["']/g) || []
    const cleanedAttrs = attrPairs
      .map((attr: string) => {
        const [, name, value] = attr.match(/(\w+)\s*=\s*["']([^"']*)["']/) || []
        if (allowedAttrs.includes(name.toLowerCase())) {
          // 清理屬性值
          const cleanValue = value
            .replace(/javascript:/gi, '')
            .replace(/vbscript:/gi, '')
            .replace(/on\w+/gi, '')
          return `${name}="${cleanValue}"`
        }
        return null
      })
      .filter(Boolean)
      .join(' ')

    return cleanedAttrs ? `<${tag} ${cleanedAttrs}>` : `<${tag}>`
  })

  // 移除空標籤
  if (removeEmptyTags) {
    sanitized = sanitized.replace(/<(\w+)(\s+[^>]*)?>[\s\n\r]*<\/\1>/g, '')
  }

  // 處理空白字符
  if (!preserveWhitespace) {
    sanitized = sanitized
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim()
  }

  return sanitized
}

/**
 * 從 HTML 中提取純文本內容
 */
export function extractTextFromHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 計算 HTML 內容的統計資訊
 */
export function getHtmlStats(html: string): {
  wordCount: number
  charCount: number
  charCountWithoutSpaces: number
  htmlLength: number
} {
  const textContent = extractTextFromHtml(html)
  const words = textContent.split(/\s+/).filter(word => word.length > 0)

  return {
    wordCount: words.length,
    charCount: textContent.length,
    charCountWithoutSpaces: textContent.replace(/\s/g, '').length,
    htmlLength: html.length
  }
}

/**
 * 驗證 HTML 內容
 */
export function validateHtmlContent(html: string, options: {
  maxLength?: number
  maxWordCount?: number
  required?: boolean
}): { isValid: boolean; errors: string[] } {
  const { maxLength = 50000, maxWordCount = 10000, required = false } = options
  const errors: string[] = []

  if (required && (!html || html.trim().length === 0)) {
    errors.push('內容為必填項目')
    return { isValid: false, errors }
  }

  if (html && html.length > maxLength) {
    errors.push(`內容長度不能超過 ${maxLength} 個字元`)
  }

  const stats = getHtmlStats(html)
  if (stats.wordCount > maxWordCount) {
    errors.push(`內容字數不能超過 ${maxWordCount} 字`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 生成內容摘要
 */
export function generateSummary(html: string, maxLength: number = 200): string {
  const textContent = extractTextFromHtml(html)
  
  if (textContent.length <= maxLength) {
    return textContent
  }

  // 尋找最接近長度限制的句號位置
  const truncated = textContent.substring(0, maxLength)
  const lastPeriod = truncated.lastIndexOf('。')
  const lastExclamation = truncated.lastIndexOf('！')
  const lastQuestion = truncated.lastIndexOf('？')
  
  const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion)
  
  if (lastSentenceEnd > maxLength * 0.7) {
    return truncated.substring(0, lastSentenceEnd + 1)
  }

  // 如果沒有找到合適的句子結尾，按空格截斷
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...'
  }

  return truncated + '...'
}