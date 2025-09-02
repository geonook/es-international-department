/**
 * Unified FormField Component
 * 統一表單欄位組件 - 標準化所有表單輸入
 * 
 * Features:
 * - Consistent styling across all forms
 * - Built-in validation display
 * - Accessibility support
 * - Professional educational design
 */

'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { designSystem } from '@/lib/design-system'
import { Label } from './label'
import { Input } from './input'
import { Textarea } from './textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Checkbox } from './checkbox'
import { Badge } from './badge'
import { AlertCircle, HelpCircle, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// 📋 Field Types
export type FieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'date'
  | 'datetime-local'
  | 'url'

// 📋 Select Option Interface
export interface SelectOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'outline'
  }
}

// 📋 FormField Props Interface
export interface FormFieldProps {
  // Field Configuration
  name: string
  type?: FieldType
  label?: string
  placeholder?: string
  description?: string
  helpText?: string
  
  // Validation
  required?: boolean
  error?: string
  validation?: {
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    pattern?: RegExp
  }
  
  // Values and Options
  value?: any
  defaultValue?: any
  options?: SelectOption[] // For select fields
  
  // Event Handlers
  onChange?: (value: any) => void
  onBlur?: (event: React.FocusEvent) => void
  onFocus?: (event: React.FocusEvent) => void
  
  // Styling and Display
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact' | 'inline'
  fullWidth?: boolean
  disabled?: boolean
  readOnly?: boolean
  
  // Layout
  className?: string
  labelClassName?: string
  inputClassName?: string
  
  // Special Features
  showPasswordToggle?: boolean
  rows?: number // For textarea
  step?: number // For number input
  
  // Accessibility
  'aria-label'?: string
  'aria-describedby'?: string
  id?: string
}

// 🎨 Component Styles
const fieldStyles = {
  container: (variant: string, fullWidth: boolean) => cn(
    'space-y-2',
    variant === 'inline' && 'flex items-center space-y-0 space-x-4',
    variant === 'compact' && 'space-y-1',
    fullWidth && 'w-full'
  ),
  
  label: (required: boolean, size: string) => cn(
    'block font-medium text-gray-900',
    size === 'sm' && 'text-sm',
    size === 'md' && 'text-base', 
    size === 'lg' && 'text-lg',
    required && 'after:content-["*"] after:text-red-500 after:ml-1'
  ),
  
  description: (size: string) => cn(
    'text-gray-600',
    size === 'sm' && 'text-xs',
    size === 'md' && 'text-sm',
    size === 'lg' && 'text-base'
  ),
  
  inputContainer: 'relative',
  
  input: (error: boolean, size: string) => cn(
    'block w-full rounded-lg border bg-white px-3 py-2',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    'read-only:bg-gray-50 read-only:cursor-default',
    
    // Size variants
    size === 'sm' && designSystem.componentSizes.input.sm,
    size === 'md' && designSystem.componentSizes.input.md,
    size === 'lg' && designSystem.componentSizes.input.lg,
    
    // Error state
    error 
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500' 
      : 'border-gray-300 text-gray-900 placeholder-gray-400',
    
    // Hover state
    !error && 'hover:border-gray-400'
  ),
  
  error: (size: string) => cn(
    'text-red-600 flex items-center gap-2',
    size === 'sm' && 'text-xs',
    size === 'md' && 'text-sm', 
    size === 'lg' && 'text-base'
  ),
  
  helpText: (size: string) => cn(
    'text-gray-500 flex items-center gap-2',
    size === 'sm' && 'text-xs',
    size === 'md' && 'text-sm',
    size === 'lg' && 'text-base'
  ),
  
  passwordToggle: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer',
  
  checkboxContainer: 'flex items-center space-x-3',
  checkboxLabel: (size: string) => cn(
    'text-gray-900 cursor-pointer select-none',
    size === 'sm' && 'text-sm',
    size === 'md' && 'text-base',
    size === 'lg' && 'text-lg'
  )
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(({
  name,
  type = 'text',
  label,
  placeholder,
  description,
  helpText,
  required = false,
  error,
  validation,
  value,
  defaultValue,
  options = [],
  onChange,
  onBlur,
  onFocus,
  size = 'md',
  variant = 'default',
  fullWidth = true,
  disabled = false,
  readOnly = false,
  className,
  labelClassName,
  inputClassName,
  showPasswordToggle = false,
  rows = 3,
  step,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)
  
  // Generate unique ID if not provided
  const fieldId = id || `field-${name}`
  const errorId = `${fieldId}-error`
  const helpId = `${fieldId}-help`
  const descriptionId = `${fieldId}-description`
  
  // Handle value changes
  const handleChange = (newValue: any) => {
    if (onChange) {
      onChange(newValue)
    }
  }
  
  // Handle focus events
  const handleFocus = (event: React.FocusEvent) => {
    setIsFocused(true)
    if (onFocus) onFocus(event)
  }
  
  const handleBlur = (event: React.FocusEvent) => {
    setIsFocused(false)
    if (onBlur) onBlur(event)
  }
  
  // Build aria-describedby
  const ariaDescribedByIds = [
    ariaDescribedBy,
    description && descriptionId,
    helpText && helpId,
    error && errorId
  ].filter(Boolean).join(' ') || undefined
  
  // Render input based on type
  const renderInput = () => {
    const commonProps = {
      id: fieldId,
      name,
      value,
      defaultValue,
      disabled,
      readOnly,
      required,
      placeholder,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        handleChange(e.target.value),
      onFocus: handleFocus,
      onBlur: handleBlur,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedByIds,
      'aria-invalid': !!error,
      className: cn(
        fieldStyles.input(!!error, size),
        inputClassName
      ),
      ref: type === 'textarea' ? undefined : ref
    }
    
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            rows={rows}
            className={cn(
              fieldStyles.input(!!error, size),
              'resize-vertical',
              inputClassName
            )}
          />
        )
      
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={handleChange}
            disabled={disabled}
            required={required}
          >
            <SelectTrigger 
              className={cn(
                fieldStyles.input(!!error, size),
                inputClassName
              )}
              aria-describedby={ariaDescribedByIds}
              aria-invalid={!!error}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  disabled={option.disabled}
                >
                  <div className="flex items-center gap-2">
                    <span>{option.label}</span>
                    {option.badge && (
                      <Badge 
                        variant={option.badge.variant || 'secondary'}
                        className="text-xs"
                      >
                        {option.badge.text}
                      </Badge>
                    )}
                  </div>
                  {option.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {option.description}
                    </div>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'checkbox':
        return (
          <div className={fieldStyles.checkboxContainer}>
            <Checkbox
              id={fieldId}
              name={name}
              checked={value}
              onCheckedChange={handleChange}
              disabled={disabled}
              required={required}
              aria-describedby={ariaDescribedByIds}
              aria-invalid={!!error}
            />
            {label && (
              <Label
                htmlFor={fieldId}
                className={cn(
                  fieldStyles.checkboxLabel(size),
                  labelClassName
                )}
              >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            )}
          </div>
        )
      
      case 'password':
        return (
          <div className={fieldStyles.inputContainer}>
            <Input
              {...commonProps}
              type={showPassword ? 'text' : 'password'}
            />
            {showPasswordToggle && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={fieldStyles.passwordToggle}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        )
      
      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            step={step}
            min={validation?.min}
            max={validation?.max}
          />
        )
      
      default:
        return (
          <Input
            {...commonProps}
            type={type}
            minLength={validation?.minLength}
            maxLength={validation?.maxLength}
            pattern={validation?.pattern?.source}
          />
        )
    }
  }
  
  return (
    <div className={cn(fieldStyles.container(variant, fullWidth), className)}>
      {/* Label */}
      {label && type !== 'checkbox' && (
        <Label
          htmlFor={fieldId}
          className={cn(
            fieldStyles.label(required, size),
            labelClassName
          )}
        >
          {label}
        </Label>
      )}
      
      {/* Description */}
      {description && (
        <p
          id={descriptionId}
          className={fieldStyles.description(size)}
        >
          {description}
        </p>
      )}
      
      {/* Input */}
      {renderInput()}
      
      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            id={errorId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={fieldStyles.error(size)}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Help Text */}
      {helpText && !error && (
        <p
          id={helpId}
          className={fieldStyles.helpText(size)}
        >
          <HelpCircle className="w-4 h-4 flex-shrink-0" />
          <span>{helpText}</span>
        </p>
      )}
    </div>
  )
})

FormField.displayName = 'FormField'

// 🎯 Preset Variants for Common Use Cases
export const FormFieldPresets = {
  // Email field with validation
  email: (props: Partial<FormFieldProps>) => ({
    type: 'email' as const,
    placeholder: 'Enter email address',
    validation: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    ...props
  }),
  
  // Password field with toggle
  password: (props: Partial<FormFieldProps>) => ({
    type: 'password' as const,
    placeholder: 'Enter password',
    showPasswordToggle: true,
    validation: {
      minLength: 8
    },
    ...props
  }),
  
  // Required text field
  requiredText: (props: Partial<FormFieldProps>) => ({
    type: 'text' as const,
    required: true,
    ...props
  }),
  
  // Large textarea
  longText: (props: Partial<FormFieldProps>) => ({
    type: 'textarea' as const,
    rows: 6,
    ...props
  }),
  
  // Compact inline checkbox
  inlineCheckbox: (props: Partial<FormFieldProps>) => ({
    type: 'checkbox' as const,
    variant: 'inline' as const,
    size: 'sm' as const,
    ...props
  })
}

export default FormField