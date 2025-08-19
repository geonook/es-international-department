'use client'

/**
 * User Form Component
 * 
 * @description User creation and editing form with role assignment and validation
 * @features Form validation, role selection, password management, profile fields
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  User,
  Mail,
  Phone,
  Save,
  X,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  Crown,
  Building2,
} from 'lucide-react'
import { UserData } from '@/components/admin/UserCard'
import { cn } from '@/lib/utils'

interface UserFormData {
  email: string
  password?: string
  firstName: string
  lastName: string
  displayName?: string
  phone?: string
  roles: number[]
  isActive: boolean
}

interface FormValidationErrors {
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  phone?: string
  roles?: string
  general?: string
}

interface UserFormProps {
  user?: UserData
  onSubmit: (data: UserFormData) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  error?: string
  mode?: 'create' | 'edit'
  className?: string
}

const AVAILABLE_ROLES = [
  { id: 1, name: 'admin', displayName: 'Administrator', icon: Crown, color: 'text-red-600' },
  { id: 2, name: 'office_member', displayName: 'Office Member', icon: Building2, color: 'text-blue-600' },
]

export default function UserForm({
  user,
  onSubmit,
  onCancel,
  loading = false,
  error,
  mode = 'create',
  className
}: UserFormProps) {
  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    displayName: '',
    phone: '',
    roles: [],
    isActive: true
  })

  // Validation errors
  const [errors, setErrors] = useState<FormValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Initialize form data
  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        email: user.email,
        password: '', // Don't pre-fill password for security
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        displayName: user.displayName || '',
        phone: user.phone || '',
        roles: user.roles.map(role => role.id),
        isActive: user.isActive
      })
    }
  }, [user, mode])

  // Form field updates
  const updateField = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Handle role selection
  const handleRoleToggle = (roleId: number, checked: boolean) => {
    if (checked) {
      updateField('roles', [...formData.roles, roleId])
    } else {
      updateField('roles', formData.roles.filter(id => id !== roleId))
    }
  }

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormValidationErrors = {}

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation (only for new users or if password is provided)
    if (mode === 'create' && !formData.password) {
      newErrors.password = 'Password is required for new users'
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long'
    }

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    // Phone validation (optional but format check if provided)
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    // Role validation
    if (formData.roles.length === 0) {
      newErrors.roles = 'Please assign at least one role'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      // Generate display name if not provided
      const submitData = {
        ...formData,
        displayName: formData.displayName || `${formData.firstName} ${formData.lastName}`.trim()
      }
      
      await onSubmit(submitData)
    } catch (error) {
      // Error handling is handled by parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      displayName: '',
      phone: '',
      roles: [],
      isActive: true
    })
    setErrors({})
  }

  return (
    <div className={cn("max-w-2xl", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2 text-indigo-600" />
            {mode === 'edit' ? 'Edit User' : 'Add New User'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              {/* Email */}
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="user@kcislk.ntpc.edu.tw"
                    className={cn("pl-10", errors.email ? 'border-red-300' : '')}
                    disabled={mode === 'edit'} // Don't allow email changes in edit mode
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">
                  Password {mode === 'edit' ? '(leave blank to keep current)' : '*'}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder={mode === 'edit' ? 'Enter new password' : 'Enter password'}
                    className={errors.password ? 'border-red-300' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    placeholder="John"
                    className={errors.firstName ? 'border-red-300' : ''}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    placeholder="Doe"
                    className={errors.lastName ? 'border-red-300' : ''}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              {/* Display name */}
              <div>
                <Label htmlFor="displayName">Display Name (optional)</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => updateField('displayName', e.target.value)}
                  placeholder="John Doe"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If not provided, will use "First Name Last Name"
                </p>
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">Phone Number (optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+886 912 345 678"
                    className={cn("pl-10", errors.phone ? 'border-red-300' : '')}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Role Assignment */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-indigo-600" />
                Role Assignment *
              </h3>
              
              <div className="space-y-3">
                {AVAILABLE_ROLES.map((role) => {
                  const Icon = role.icon
                  return (
                    <div key={role.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={formData.roles.includes(role.id)}
                        onCheckedChange={(checked) => handleRoleToggle(role.id, checked as boolean)}
                      />
                      <div className="flex items-center space-x-2 flex-1">
                        <Icon className={cn("w-5 h-5", role.color)} />
                        <div>
                          <Label htmlFor={`role-${role.id}`} className="font-medium cursor-pointer">
                            {role.displayName}
                          </Label>
                          <p className="text-sm text-gray-500">
                            {role.name === 'admin' ? 'Full system access and user management' : 
                             role.name === 'office_member' ? 'Office management access including admin portal' : 
                             'Basic user access'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {errors.roles && <p className="text-red-500 text-sm mt-1">{errors.roles}</p>}
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Account Status</h3>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => updateField('isActive', checked)}
                />
                <Label htmlFor="isActive">Account is active</Label>
              </div>
              <p className="text-sm text-gray-500">
                Inactive accounts cannot log in to the system
              </p>
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading || isSubmitting}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              
              {mode === 'create' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={loading || isSubmitting}
                >
                  Reset
                </Button>
              )}

              <Button
                type="submit"
                disabled={loading || isSubmitting}
                className="bg-gradient-to-r from-indigo-600 to-purple-700"
              >
                {(loading || isSubmitting) ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {mode === 'edit' ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}