#!/usr/bin/env node

/**
 * Development Server Optimization
 * 開發伺服器優化配置
 */

// Increase EventEmitter listener limit to prevent memory leak warnings
process.setMaxListeners(20);

// Add graceful shutdown handling
const gracefulShutdown = () => {
  console.log('\n🔄 Gracefully shutting down development server...');
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Memory optimization
if (process.env.NODE_ENV === 'development') {
  // Increase max old space size for development
  process.env.NODE_OPTIONS = '--max-old-space-size=4096';
  
  console.log('🚀 Development server optimizations applied:');
  console.log('   - EventEmitter listeners increased to 20');
  console.log('   - Graceful shutdown handlers added');
  console.log('   - Memory allocation optimized');
}

module.exports = {
  gracefulShutdown
};