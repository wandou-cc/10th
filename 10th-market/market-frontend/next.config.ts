import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 性能优化配置
  experimental: {
    optimizeCss: true, // CSS优化
    optimizePackageImports: ['@heroicons/react', 'framer-motion'], // 包导入优化
  },
  
  // 图片优化
  images: {
    formats: ['image/avif', 'image/webp'], // 使用现代图片格式
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048], // 响应式图片尺寸
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // 图标尺寸
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30天缓存
    domains: ['coinhyper.com'], // 允许的图片域名
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 压缩配置
  compress: true,
  
  // 输出配置
  output: 'standalone', // 为生产环境优化
  
  // 编译配置
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // 生产环境移除console
  },

  // API路由重写 - 处理跨域
  async rewrites() {
    return [
      {
        source: '/api/coins',
        destination: process.env.NODE_ENV === 'production' 
          ? '/api/coins' // 生产环境使用相对路径
          : 'http://localhost:3000/api/coins' // 开发环境代理到后端
      },
    ];
  },

  // 头部配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // 安全头部
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          // CORS 头部
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          // API 路由的 CORS 配置
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With'
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400'
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          // 静态资源长期缓存
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
        ],
      },
      {
        source: '/(.*\\.(?:js|css))',
        headers: [
          // JS和CSS文件缓存
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
        ],
      },
      {
        source: '/(.*\\.(?:jpg|jpeg|png|webp|avif|ico|svg))',
        headers: [
          // 图片缓存
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=31536000'
          },
        ],
      },
      {
        source: '/(.*\\.(?:mp4|webm))',
        headers: [
          // 视频缓存
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400'
          },
        ],
      },
    ];
  },

  // 重定向配置
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // webpack配置优化
  webpack: (config, { dev, isServer }) => {
    // 生产环境优化
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }

    // 减少包大小
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.',
    };

    return config;
  },

  // 环境变量
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
  },

  // 性能budgets
  ...(process.env.ANALYZE === 'true' && {
    env: {
      ANALYZE: 'true',
    },
  }),
};

export default nextConfig;
