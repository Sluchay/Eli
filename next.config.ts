import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Локальные файлы из /public и /data/uploads, внешние источники не используются.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600, 1920],
  },
  poweredByHeader: false,
  reactStrictMode: true,
}

export default nextConfig
