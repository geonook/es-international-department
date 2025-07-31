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

  // 檢查當前認證狀態
  const checkAuth = useCallback(async () => {
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

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      })
      return null
    } catch (error) {
      console.error('Auth check error:', error)
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      })
      return null
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
  const hasRole = (role: string): boolean => {
    return authState.user?.roles.includes(role) || false
  }

  // 檢查是否為管理員
  const isAdmin = (): boolean => {
    return hasRole('admin')
  }

  // 檢查是否為教師
  const isTeacher = (): boolean => {
    return hasRole('teacher')
  }

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
    
    // 權限檢查
    hasRole,
    isAdmin,
    isTeacher,
  }
}