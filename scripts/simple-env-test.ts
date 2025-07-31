/**
 * Simple Environment Test
 */

import { config } from 'dotenv'
import { join } from 'path'

// Load .env file
config({ path: join(process.cwd(), '.env') })

console.log('🔍 Direct Environment Variable Check:')
console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 30) + '...')
console.log('JWT_SECRET:', process.env.JWT_SECRET?.substring(0, 10) + '...')
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET?.substring(0, 10) + '...')
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)

// Now test our validation
console.log('\n🧪 Testing Zod Validation:')
import { z } from 'zod'

const testSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url()
})

try {
  const result = testSchema.parse(process.env)
  console.log('✅ Zod validation passed!')
} catch (error) {
  console.log('❌ Zod validation failed:')
  if (error instanceof z.ZodError) {
    error.errors.forEach(err => {
      console.log(`  - ${err.path.join('.')}: ${err.message}`)
    })
  }
}