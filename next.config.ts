import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration for Firebase hosting with Cloud Functions
  images: {
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://crows-eye-website.uc.r.appspot.com'
  },
  // Cross-platform compatibility settings
  trailingSlash: true,
  reactStrictMode: true,
  
  // Enhanced webpack configuration for cross-platform compatibility
  webpack: (config, { isServer, dev }) => {
    // Ensure proper module resolution across platforms
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    };
    
    // Exclude non-web directories
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      exclude: [
        /node_modules/,
        /desktop_app/,
        /crow_eye_api/,
        /\.git/,
        /functions/,
        /scripts/,
      ]
    });

    // Handle potential module resolution issues
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, 'src'),
      };
    }
    
    return config;
  },
  
  // External packages for server components
  serverExternalPackages: ['firebase-admin'],
  
  // Experimental features for better performance and compatibility
  experimental: {
    esmExternals: true,
  },
  
  // Enhanced headers for better cross-platform support
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  
  // Optimized settings for better error handling
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Output configuration for Firebase hosting
  output: 'export',
  distDir: 'out',
  
  // Static optimization
  generateEtags: false,
  poweredByHeader: false,
};

export default nextConfig;
