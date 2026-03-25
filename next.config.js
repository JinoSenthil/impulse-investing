/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
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

      // ✅ Your API image server
      // ✅ Your API image server (Domain)
      {
        protocol: 'https',
        hostname: 'api.impulseinvesting.com',
        pathname: '/images/**',
      },
      // ✅ Your API image server (IP - for backward compatibility)
      {
        protocol: 'http',
        hostname: '103.146.234.88',
        port: '3016',
        pathname: '/images/**',
      },
    ],
  },
}

module.exports = nextConfig
