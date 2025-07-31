/**
 * Simple Environment Loading Test
 */

import { config } from 'dotenv'
import { join } from 'path'

console.log('🔍 Testing Environment Variable Loading...\n')

// Load .env file
const result = config({ path: join(process.cwd(), '.env') })

console.log('📁 Dotenv result:', result.error ? 'ERROR' : 'SUCCESS')
if (result.error) {
  console.log('   Error:', result.error.message)
}

console.log('\n📋 Environment Variables Check:')
const testVars = [
  'NODE_ENV',
  'DATABASE_URL', 
  'JWT_SECRET',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
]

testVars.forEach(varName => {
  const value = process.env[varName]
  const status = value ? '✅ FOUND' : '❌ MISSING'
  const preview = value ? `(${value.substring(0, 20)}...)` : ''
  console.log(`  ${status} ${varName} ${preview}`)
})

console.log('\n🔍 Current working directory:', process.cwd())
console.log('📄 Looking for .env at:', join(process.cwd(), '.env'))

// Check if .env file exists
import { existsSync } from 'fs'
const envExists = existsSync(join(process.cwd(), '.env'))
console.log('📁 .env file exists:', envExists ? '✅ YES' : '❌ NO')