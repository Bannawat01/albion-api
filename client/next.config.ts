import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  images: {
    domains: ['render.albiononline.com', 'lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 24, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60, // 1 hour cache at edge
    unoptimized: false,
  },
  
  //optimization options
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
    // concurrentFeatures: true // if needed for React 19; keep default if stable
  },

  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 60000, // ลดขนาดสูงสุดลง
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            minSize: 20000,
          },
          // แยก chart.js ออกมา
          charts: {
            test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
            name: 'charts',
            chunks: 'all',
            priority: 20,
            minSize: 10000,
            enforce: true,
          },
          // แยก UI libraries
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 15,
            minSize: 15000,
          },
        },
      };
    }
    return config;
  },

  async headers() {
    return [
      {
        source: '/_next/image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  }
};

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
});

export default withAnalyzer(nextConfig);