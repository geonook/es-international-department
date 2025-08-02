/**
 * Rich Text Editor Hook
 * 富文本編輯器自定義 Hook
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { sanitizeHtml, extractTextFromHtml, getHtmlStats, validateHtmlContent } from '@/lib/html-sanitizer'

export interface UseRichTextEditorOptions {
  initialValue?: string
  maxLength?: number
  maxWordCount?: number
  autoSave?: boolean
  autoSaveInterval?: number
  onAutoSave?: (content: string) => void
  onChange?: (content: string) => void
  sanitizeOnChange?: boolean
}

export interface RichTextEditorState {
  content: string
  textContent: string
  stats: {
    wordCount: number
    charCount: number
    charCountWithoutSpaces: number
    htmlLength: number
  }
  validation: {
    isValid: boolean
    errors: string[]
  }
  isDirty: boolean
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error'
  lastSaved: string
}

export function useRichTextEditor(options: UseRichTextEditorOptions = {}) {
  const {
    initialValue = '',
    maxLength = 50000,
    maxWordCount = 10000,
    autoSave = false,
    autoSaveInterval = 5000,
    onAutoSave,
    onChange,
    sanitizeOnChange = true
  } = options

  const [state, setState] = useState<RichTextEditorState>(() => {
    const content = sanitizeOnChange ? sanitizeHtml(initialValue) : initialValue
    const textContent = extractTextFromHtml(content)
    const stats = getHtmlStats(content)
    const validation = validateHtmlContent(content, { maxLength, maxWordCount })

    return {
      content,
      textContent,
      stats,
      validation,
      isDirty: false,
      autoSaveStatus: 'idle',
      lastSaved: content
    }
  })

  const autoSaveTimerRef = useRef<NodeJS.Timeout>()

  // 更新內容
  const updateContent = useCallback((newContent: string) => {
    const content = sanitizeOnChange ? sanitizeHtml(newContent) : newContent
    const textContent = extractTextFromHtml(content)
    const stats = getHtmlStats(content)
    const validation = validateHtmlContent(content, { maxLength, maxWordCount })

    setState(prev => ({
      ...prev,
      content,
      textContent,
      stats,
      validation,
      isDirty: content !== prev.lastSaved
    }))

    onChange?.(content)
  }, [maxLength, maxWordCount, onChange, sanitizeOnChange])

  // 自動儲存功能
  useEffect(() => {
    if (!autoSave || !onAutoSave || !state.isDirty || state.content === state.lastSaved) {
      return
    }

    // 清除之前的計時器
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // 設定新的計時器
    autoSaveTimerRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, autoSaveStatus: 'saving' }))
      
      try {
        onAutoSave(state.content)
        setState(prev => ({
          ...prev,
          autoSaveStatus: 'saved',
          lastSaved: prev.content,
          isDirty: false
        }))

        // 2秒後重置狀態
        setTimeout(() => {
          setState(prev => ({ ...prev, autoSaveStatus: 'idle' }))
        }, 2000)
      } catch (error) {
        setState(prev => ({ ...prev, autoSaveStatus: 'error' }))
        
        // 3秒後重置狀態
        setTimeout(() => {
          setState(prev => ({ ...prev, autoSaveStatus: 'idle' }))
        }, 3000)
      }
    }, autoSaveInterval)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [autoSave, onAutoSave, state.content, state.isDirty, state.lastSaved, autoSaveInterval])

  // 手動儲存
  const save = useCallback(async () => {
    if (!onAutoSave || !state.isDirty) {
      return
    }

    setState(prev => ({ ...prev, autoSaveStatus: 'saving' }))

    try {
      await onAutoSave(state.content)
      setState(prev => ({
        ...prev,
        autoSaveStatus: 'saved',
        lastSaved: prev.content,
        isDirty: false
      }))

      setTimeout(() => {
        setState(prev => ({ ...prev, autoSaveStatus: 'idle' }))
      }, 2000)
    } catch (error) {
      setState(prev => ({ ...prev, autoSaveStatus: 'error' }))
      
      setTimeout(() => {
        setState(prev => ({ ...prev, autoSaveStatus: 'idle' }))
      }, 3000)
    }
  }, [onAutoSave, state.content, state.isDirty])

  // 重置狀態
  const reset = useCallback((newContent: string = '') => {
    const content = sanitizeOnChange ? sanitizeHtml(newContent) : newContent
    const textContent = extractTextFromHtml(content)
    const stats = getHtmlStats(content)
    const validation = validateHtmlContent(content, { maxLength, maxWordCount })

    setState({
      content,
      textContent,
      stats,
      validation,
      isDirty: false,
      autoSaveStatus: 'idle',
      lastSaved: content
    })
  }, [maxLength, maxWordCount, sanitizeOnChange])

  // 生成摘要
  const generateSummary = useCallback((maxSummaryLength: number = 200) => {
    const textContent = extractTextFromHtml(state.content)
    
    if (textContent.length <= maxSummaryLength) {
      return textContent
    }

    const truncated = textContent.substring(0, maxSummaryLength)
    const lastPeriod = truncated.lastIndexOf('。')
    const lastExclamation = truncated.lastIndexOf('！')
    const lastQuestion = truncated.lastIndexOf('？')
    
    const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion)
    
    if (lastSentenceEnd > maxSummaryLength * 0.7) {
      return truncated.substring(0, lastSentenceEnd + 1)
    }

    const lastSpace = truncated.lastIndexOf(' ')
    if (lastSpace > maxSummaryLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...'
    }

    return truncated + '...'
  }, [state.content])

  // 清理時移除計時器
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [])

  return {
    // 狀態
    content: state.content,
    textContent: state.textContent,
    stats: state.stats,
    validation: state.validation,
    isDirty: state.isDirty,
    autoSaveStatus: state.autoSaveStatus,
    
    // 方法
    updateContent,
    save,
    reset,
    generateSummary,
    
    // 工具方法
    sanitize: (html: string) => sanitizeHtml(html),
    extractText: (html: string) => extractTextFromHtml(html),
    getStats: (html: string) => getHtmlStats(html)
  }
}