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
  
  // Experimental features (Server Actions are now enabled by default)
}

export default nextConfig
