import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
   images: {
    domains: ["lh3.googleusercontent.com"], // ✅ อนุญาตให้โหลดรูปจาก Google profile
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
        minSize: 15000, // Reduced for more aggressive splitting
        maxSize: 50000, // Smaller chunks for better caching
        cacheGroups: {
          // Framework chunk
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            name: 'framework',
            chunks: 'all',
            priority: 40,
            enforce: true,
          },
          // Vendor libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            minSize: 10000,
          },
          // Chart libraries
          charts: {
            test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2|recharts)[\\/]/,
            name: 'charts',
            chunks: 'all',
            priority: 20,
            minSize: 5000,
            enforce: true,
          },
          // UI libraries
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|class-variance-authority|clsx|tailwind-merge)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 15,
            minSize: 8000,
          },
          // State management
          state: {
            test: /[\\/]node_modules[\\/](zustand|@tanstack)[\\/]/,
            name: 'state',
            chunks: 'all',
            priority: 25,
            minSize: 3000,
          },
          // HTTP client
          http: {
            test: /[\\/]node_modules[\\/](axios)[\\/]/,
            name: 'http',
            chunks: 'all',
            priority: 30,
            minSize: 2000,
          },
        },
      };

      // Enable webpack optimizations
      config.optimization.moduleIds = 'deterministic';
      config.optimization.chunkIds = 'deterministic';
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