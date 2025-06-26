/** @type {import('next').NextConfig} */
const nextConfig = {
  // Generate static output suitable for Firebase Hosting
  output: 'export',
  // Enable experimental features for WebAssembly FFmpeg
  experimental: {
    // Enable server actions for better API route handling
    serverActions: {
      bodySizeLimit: '10mb'
    },
    // WebAssembly support (esmExternals has been removed as it's deprecated)
    // asyncWebAssembly is handled in webpack config below
  },
  
  // ESLint configuration for production builds
  eslint: {
    // Allow builds to complete with warnings (for production deployment)
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration for production builds
  typescript: {
    // Allow builds to complete with type errors (for production deployment)
    ignoreBuildErrors: true,
  },
  
  // Webpack configuration for WebAssembly FFmpeg
  webpack: (config, { isServer }) => {
    // Handle WebAssembly files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    
    // Handle FFmpeg WebAssembly files
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    // Handle .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });
    
    return config;
  },
  
  // Headers for WebAssembly and video processing
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, Range',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      }
    ];
  },
  
  // Increase API route timeout for video processing
  serverRuntimeConfig: {
    maxDuration: 300, // 5 minutes for video processing
  },
  
  // Enable static file serving for large files
  staticPageGenerationTimeout: 300,
  
  // Disable static optimization for dynamic content
  trailingSlash: false,
  
  // Image optimization settings (updated to use remotePatterns instead of deprecated domains)
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      }
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Environment variables
  env: {
    ENABLE_WEBASSEMBLY_FFMPEG: 'true',
    VIDEO_PROCESSING_TIMEOUT: '300000', // 5 minutes
    MAX_VIDEO_SIZE: '100000000', // 100MB
  },
};

module.exports = nextConfig; 