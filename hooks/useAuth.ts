/**
 * Authentication Hook
 * 認證狀態管理 Hook
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  displayName?: string
  roles: string[]
  avatar?: string
  phone?: string
  dateOfBirth?: string
  address?: string
  emergencyContact?: string
  preferences?: any
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  isActive: boolean
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  success: boolean
  message?: string
  error?: string
  user?: User
}

export function useAuth() {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })

  // 檢查當前認證狀態 (增強版，支援自動Token刷新)
  const checkAuth = useCallback(async (retryCount = 0) => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setAuthState({
            user: data.user,
            isLoading: false,
            isAuthenticated: true
          })
          return data.user
        }
      }

      // 如果認證失敗且是401錯誤，嘗試刷新Token (只重試一次)
      if (response.status === 401 && retryCount === 0) {
        const refreshResult = await attemptTokenRefresh()
        if (refreshResult) {
          // Token刷新成功，重新檢查認證狀態
          return await checkAuth(1)
        }
      }

      // 認證失敗或Token刷新失敗
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      })
      return null
    } catch (error) {
      console.error('Auth check error:', error)
      
      // 網路錯誤時，如果是第一次嘗試，試著刷新Token
      if (retryCount === 0) {
        const refreshResult = await attemptTokenRefresh()
        if (refreshResult) {
          return await checkAuth(1)
        }
      }
      
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      })
      return null
    }
  }, [])

  // 嘗試刷新Token的函式
  const attemptTokenRefresh = useCallback(async () => {
    try {
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      })

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        return refreshData.success
      }

      return false
    } catch (error) {
      console.error('Token refresh attempt failed:', error)
      return false
    }
  }, [])

  // 登入函式
  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      })

      const data: LoginResponse = await response.json()

      if (data.success && data.user) {
        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true
        })
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false
        }))
      }

      return data
    } catch (error) {
      console.error('Login error:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false
      }))
      return {
        success: false,
        error: '網路錯誤，請稍後再試'
      }
    }
  }

  // 登出函式
  const logout = async (): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()

      // 無論 API 回應如何，都清除本地狀態
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      })

      return data.success || true
    } catch (error) {
      console.error('Logout error:', error)
      // 即使出錯也清除本地狀態
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      })
      return true
    }
  }

  // 更新使用者資訊
  const updateProfile = async (profileData: Partial<User>): Promise<LoginResponse> => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      })

      const data: LoginResponse = await response.json()

      if (data.success && data.user) {
        setAuthState(prev => ({
          ...prev,
          user: data.user
        }))
      }

      return data
    } catch (error) {
      console.error('Profile update error:', error)
      return {
        success: false,
        error: '更新失敗，請稍後再試'
      }
    }
  }

  // 重導向到登入頁面
  const redirectToLogin = (redirectUrl?: string) => {
    const loginUrl = redirectUrl 
      ? `/login?redirect=${encodeURIComponent(redirectUrl)}`
      : '/login'
    router.push(loginUrl)
  }

  // 檢查是否有特定角色
  const hasRole = useCallback((role: string): boolean => {
    return authState.user?.roles.includes(role) || false
  }, [authState.user?.roles])

  // 檢查是否為管理員
  const isAdmin = useCallback((): boolean => {
    return hasRole('admin')
  }, [hasRole])

  // 檢查是否為辦公室成員
  const isOfficeMember = useCallback((): boolean => {
    return hasRole('office_member')
  }, [hasRole])

  // 檢查是否為教師 (向後兼容 - 現在檢查 office_member)
  const isTeacher = useCallback((): boolean => {
    return hasRole('office_member') || hasRole('teacher')
  }, [hasRole])

  // 檢查是否為檢視者
  const isViewer = useCallback((): boolean => {
    return hasRole('viewer')
  }, [hasRole])

  // 帶有自動Token刷新功能的API請求函式
  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const makeRequest = async (retryCount = 0): Promise<Response> => {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
      })

      // 如果是401錯誤且沒有重試過，嘗試刷新Token
      if (response.status === 401 && retryCount === 0) {
        const refreshResult = await attemptTokenRefresh()
        if (refreshResult) {
          // Token刷新成功，重新發送原始請求
          return await fetch(url, {
            ...options,
            credentials: 'include',
          })
        }
      }

      return response
    }

    try {
      return await makeRequest()
    } catch (error) {
      console.error('Authenticated fetch error:', error)
      throw error
    }
  }, [attemptTokenRefresh])

  // 組件掛載時檢查認證狀態
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return {
    // 狀態
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    
    // 方法
    login,
    logout,
    updateProfile,
    checkAuth,
    redirectToLogin,
    authenticatedFetch, // 增強的API請求函式，支援自動Token刷新
    
    // 權限檢查
    hasRole,
    isAdmin,
    isTeacher,
    isOfficeMember,
    isViewer,
  }
}