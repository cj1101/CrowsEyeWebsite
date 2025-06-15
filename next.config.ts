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
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://crowseye.tech/api'
  },
  // Improved webpack configuration
  webpack: (config, { isServer }) => {
    // Ensure proper module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Exclude desktop_app and crow_eye_api directories
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      exclude: [
        /node_modules/,
        /desktop_app/,
        /crow_eye_api/,
        /\.git/
      ]
    });
    
    return config;
  },
  // Add experimental features for better error handling
  experimental: {
    esmExternals: true,
  },
  // Ensure proper handling of client-side errors
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  }
};

export default nextConfig;
