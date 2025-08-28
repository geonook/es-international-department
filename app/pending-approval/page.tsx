'use client'

/**
 * Pending Approval Page
 * User account pending administrative approval after registration
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Clock, 
  Mail, 
  Shield, 
  User, 
  CheckCircle, 
  AlertCircle,
  LogOut 
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function PendingApprovalPage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Check user status
  useEffect(() => {
    if (!isLoading && user) {
      // If user is active and has roles, redirect to appropriate page
      if (user.isActive && user.roles.length > 0) {
        if (user.roles.includes('admin') || user.roles.includes('office_member')) {
          router.push('/admin')
        } else {
          router.push('/')
        }
      }
    } else if (!isLoading && !user) {
      // Redirect unauthenticated users to login page
      router.push('/login')
    }
  }, [user, isLoading, router])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoggingOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will be redirected to login page
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center"
            >
              <Clock className="w-8 h-8 text-orange-600" />
            </motion.div>
            
            <CardTitle className="text-2xl font-bold text-gray-900">
              Account Under Review
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* User Information */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Registered User</p>
                  <p className="font-medium">{user.displayName || `${user.firstName} ${user.lastName}`}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Your account is under review</strong>
                <br />
                An administrator will review your registration and assign appropriate permissions. This process typically takes up to 24 hours.
              </AlertDescription>
            </Alert>

            {/* Next Steps */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-indigo-600" />
                Next Steps
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>✅ Google account verification completed</span>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>⏳ Awaiting administrator review and role assignment</span>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                  <span>📧 Email notification upon approval completion</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Need Assistance?</h4>
              <p className="text-sm text-blue-700">
                If you have any questions, please contact the school office:
                <br />
                📞 Phone: 02-xxxx-xxxx
                <br />
                📧 Email: office@kcislk.ntpc.edu.tw
              </p>
            </div>

            {/* Logout Button */}
            <div className="pt-4 border-t">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full"
                disabled={isLoggingOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}