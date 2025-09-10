/**
 * HTML Sanitization Utilities
 * HTML 清理工具 - 確保用戶輸入的 HTML 內容安全
 */

import DOMPurify from 'dompurify'

// 安全的 HTML 標籤和屬性配置 - 增強支援 Google Docs 格式
const SAFE_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'sub', 'sup',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img',
    'div', 'span', 'font',
    'table', 'thead', 'tbody', 'tr', 'th', 'td'
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel',
    'src', 'alt', 'width', 'height', 'style',
    'class', 'color', 'face', 'size',
    'data-*'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  // 允許更多樣式屬性用於 Google Docs 格式
  ALLOWED_CSS_PROPERTIES: [
    'color', 'background-color', 'font-size', 'font-family', 'font-weight', 
    'font-style', 'text-decoration', 'text-align', 'margin', 'padding',
    'border', 'line-height', 'list-style-type'
  ]
}

/**
 * 清理 HTML 內容，移除潛在的惡意代碼
 * @param html - 原始 HTML 字符串
 * @param config - 可選的自定義配置
 * @returns 清理後的安全 HTML
 */
export function sanitizeHtml(html: string, config?: Partial<typeof SAFE_CONFIG>): string {
  if (typeof window === 'undefined') {
    // 服務器端渲染時返回原始內容
    // 在生產環境中，您可能需要使用 isomorphic-dompurify
    return html
  }

  const finalConfig = { ...SAFE_CONFIG, ...config }
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: finalConfig.ALLOWED_TAGS,
    ALLOWED_ATTR: finalConfig.ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: finalConfig.ALLOWED_URI_REGEXP,
    ADD_TAGS: finalConfig.ADD_TAGS,
    ADD_ATTR: finalConfig.ADD_ATTR,
    FORBID_TAGS: finalConfig.FORBID_TAGS,
    FORBID_ATTR: finalConfig.FORBID_ATTR,
    ALLOW_DATA_ATTR: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false
  })
}

/**
 * 專為公告內容設計的清理函式
 * 保留常用格式但移除危險元素 - 支援 Google Docs 豐富格式
 */
export function sanitizeAnnouncementContent(html: string): string {
  return sanitizeHtml(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'sub', 'sup',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'code',
      'a', 'img',
      'div', 'span', 'font'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel',
      'src', 'alt', 'width', 'height', 
      'style', 'class', 'color', 'face', 'size'
    ]
  })
}

/**
 * 清理並格式化 HTML 用於預覽
 * 移除複雜樣式但保留基本格式
 */
export function sanitizeForPreview(html: string): string {
  return sanitizeHtml(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u',
      'ul', 'ol', 'li',
      'span'
    ],
    ALLOWED_ATTR: ['class']
  })
}

/**
 * 檢查 HTML 內容是否包含潛在危險
 * @param html - 要檢查的 HTML 字符串
 * @returns 是否包含危險內容
 */
export function containsDangerousContent(html: string): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const cleaned = DOMPurify.sanitize(html)
  return cleaned !== html
}

/**
 * 提取純文字內容（移除所有 HTML 標籤）
 * @param html - HTML 字符串
 * @returns 純文字內容
 */
export function extractTextContent(html: string): string {
  if (typeof window === 'undefined') {
    // 服務器端簡單的標籤移除
    return html.replace(/<[^>]*>/g, '').trim()
  }

  return DOMPurify.sanitize(html, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  }).trim()
}

/**
 * 計算 HTML 內容的純文字長度
 * @param html - HTML 字符串
 * @returns 純文字長度
 */
export function getTextLength(html: string): number {
  return extractTextContent(html).length
}