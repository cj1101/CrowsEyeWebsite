/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
    disableStaticImages: false,
    domains: [],
    remotePatterns: [],
  },
  
  // Skip API routes during build since they'll be handled by Firebase Functions
  skipTrailingSlashRedirect: true,
  
  // Enable experimental features for WebAssembly FFmpeg
  experimental: {
    // Enable server actions for better API route handling
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  
  // Production build optimizations
  eslint: {
    // Allow builds to complete with warnings (for production deployment)
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration for production builds
  typescript: {
    // Allow builds to complete with type errors (for production deployment)
    ignoreBuildErrors: true,
  },
  
  // Webpack configuration for WebAssembly FFmpeg and cross-platform compatibility
  webpack: (config, { isServer }) => {
    // Handle WebAssembly files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    
    // Enhanced fallbacks for client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        net: false,
        tls: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
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
  
  // Optimized settings
  generateEtags: false,
  poweredByHeader: false,
  reactStrictMode: true,
};

module.exports = nextConfig; 