import type { NextConfig } from 'next'
import withBundleAnalyzer from '@next/bundle-analyzer'

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'render.albiononline.com' },
    ],
  },
  turbopack: {},
  async rewrites() {
    return process.env.LOCAL_API_PROXY_TARGET
      ? [{ source: '/api/:path*', destination: `${process.env.LOCAL_API_PROXY_TARGET}/api/:path*` }]
      : []
  },
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
})(nextConfig)
