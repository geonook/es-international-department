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
  
  // Skip automatic static generation for API routes that may use database
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  
  // TinyMCE static assets configuration and build optimizations
  webpack: (config, { isServer, dev, buildId, nextRuntime, webpack }) => {
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
      // Externalize problematic packages during build
      const externals = ['aws-sdk', '@prisma/client']
      
      if (Array.isArray(config.externals)) {
        config.externals.push(...externals)
      } else if (typeof config.externals === 'object') {
        externals.forEach(pkg => {
          config.externals[pkg] = `commonjs ${pkg}`
        })
      } else {
        config.externals = [config.externals, ...externals]
      }
    }
    
    // Build-time environment detection
    if (config.plugins && webpack?.DefinePlugin) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.NEXT_PHASE': JSON.stringify(process.env.NEXT_PHASE || 'phase-production-build'),
          'process.env.BUILD_TIME': JSON.stringify(Date.now().toString()),
        })
      )
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
