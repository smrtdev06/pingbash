/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  images: {
    domains: ['big-ghastly-imp.ngrok-free.app'],
    unoptimized: true, // Keep existing setting for development
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'big-ghastly-imp.ngrok-free.app'
      }
    ]
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Bundle React and React-DOM together
            react: {
              name: 'react',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              priority: 20,
            },
            // Bundle common libraries
            lib: {
              name: 'lib',
              test: /[\\/]node_modules[\\/]/,
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // Headers for caching and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Removed X-Frame-Options to allow iframe embedding
          // Add Content-Security-Policy frame-ancestors directive for more control
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *;"
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
