/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed standalone output for simplified Docker deployment
  // output: 'standalone',
  
  // Build optimizations
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image optimization for Docker
  images: {
    unoptimized: true,
  },
  
  // Production optimizations
  swcMinify: true,
  
  // TinyMCE static assets configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        tinymce: 'tinymce/tinymce.min.js',
      }
      
      // Externalize AWS SDK to prevent build warnings
      if (Array.isArray(config.externals)) {
        config.externals.push('aws-sdk')
      } else if (typeof config.externals === 'object') {
        config.externals['aws-sdk'] = 'aws-sdk'
      } else {
        config.externals = ['aws-sdk']
      }
    }
    
    // Also externalize for server builds to prevent bundling issues
    if (isServer) {
      if (Array.isArray(config.externals)) {
        config.externals.push('aws-sdk')
      } else if (typeof config.externals === 'object') {
        config.externals['aws-sdk'] = 'commonjs aws-sdk'
      } else {
        config.externals = [config.externals, 'aws-sdk']
      }
    }
    
    return config
  },
  
  // Static file serving
  async rewrites() {
    return [
      {
        source: '/tinymce/:path*',
        destination: '/node_modules/tinymce/:path*'
      }
    ]
  },
  
  // Experimental features (Server Actions are now enabled by default)
}

export default nextConfig
