/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'in.pinterest.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },

      // ✅ Your API image server (Domain)
      {
        protocol: 'https',
        hostname: 'api.impulseinvesting.com',
        pathname: '/**',
      },
      // ✅ Your API image server (IP - for backward compatibility)
      {
        protocol: 'http',
        hostname: '103.146.234.88',
        port: '3016',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
}

module.exports = nextConfig
