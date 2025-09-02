/**
 * Temporary Placeholder Component
 * TODO: Remove when unified communications system is fully refactored to separated architecture
 */

import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

// Temporary type exports for backward compatibility
export type CommunicationType = 'announcement' | 'message' | 'reminder' | 'newsletter'

export interface Communication {
  id?: number
  title: string
  content: string
  summary?: string
  type: CommunicationType
  targetAudience: 'teachers' | 'parents' | 'all'
  boardType: 'teachers' | 'parents' | 'general'
  priority: 'low' | 'medium' | 'high'
  status: 'draft' | 'published' | 'archived'
}

interface CommunicationFormProps {
  communication?: Communication
  onSubmit?: (data: Communication) => void
  onCancel?: () => void
  loading?: boolean
  error?: string
}

/**
 * Placeholder component to prevent runtime errors
 * This component should be removed when the unified communications system
 * is fully refactored to use the separated Teachers' Corner and Parents' Corner architecture
 */
export default function CommunicationForm({ onCancel }: CommunicationFormProps) {
  return (
    <div className="p-6">
      <Alert className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This unified communications feature is deprecated. 
          Please use the separate Teachers' Corner and Parents' Corner systems instead.
        </AlertDescription>
      </Alert>
      
      <div className="flex justify-end">
        <button 
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  )
}