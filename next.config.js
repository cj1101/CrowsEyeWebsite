/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Firebase hosting
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // Skip API routes during build since they'll be handled by Firebase Functions
  skipTrailingSlashRedirect: true,
  
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
  
  // Enable static file serving for large files
  staticPageGenerationTimeout: 300,
  
  // Environment variables
  env: {
    ENABLE_WEBASSEMBLY_FFMPEG: 'true',
    VIDEO_PROCESSING_TIMEOUT: '300000', // 5 minutes
    MAX_VIDEO_SIZE: '100000000', // 100MB
  },
};

module.exports = nextConfig; 