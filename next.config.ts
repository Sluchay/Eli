import type { NextConfig } from 'next'

/**
 * Базовые заголовки безопасности. CSP сознательно не включаем: Next.js и
 * Tailwind используют inline-стили и скрипты, и строгая политика без отдельной
 * настройки сломает вёрстку. Вернёмся к ней вместе с этапом 9.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  images: {
    // Локальные файлы из /public и /data/uploads, внешние источники не используются.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600, 1920],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
