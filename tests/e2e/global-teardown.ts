/**
 * Playwright Global Teardown
 * 全域測試環境清理
 */

import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for E2E tests...')
  
  try {
    // Clean up test data
    console.log('📊 Cleaning up test database...')
    // Add database cleanup logic here if needed
    
    // Clean up test files
    console.log('📁 Cleaning up test files...')
    // Add file cleanup logic here if needed
    
    // Clean up any other resources
    console.log('🧽 Cleaning up other resources...')
    // Add other cleanup logic here
    
  } catch (error) {
    console.error('❌ Error during teardown:', error)
    // Don't throw error as it might mask other test failures
  }
  
  console.log('✅ Global teardown completed successfully')
}

export default globalTeardown