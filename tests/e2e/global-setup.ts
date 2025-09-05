/**
 * Playwright Global Setup
 * 全域測試環境設置
 */

import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for E2E tests...')
  
  // Setup test database
  console.log('📊 Setting up test database...')
  // Add database setup logic here if needed
  
  // Setup test users and authentication
  console.log('👤 Setting up test users...')
  
  // Create a browser instance for setup operations
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    // Check if the application is running
    const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3001'
    console.log(`🔍 Checking if app is running at ${baseURL}`)
    
    await page.goto(baseURL)
    await page.waitForLoadState('networkidle')
    
    console.log('✅ Application is ready for testing')
    
    // You can add more setup operations here, such as:
    // - Creating test data
    // - Setting up authentication tokens
    // - Configuring test environment
    
  } catch (error) {
    console.error('❌ Failed to setup test environment:', error)
    throw error
  } finally {
    await context.close()
    await browser.close()
  }
  
  console.log('✅ Global setup completed successfully')
}

export default globalSetup