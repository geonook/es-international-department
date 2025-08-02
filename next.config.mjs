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
