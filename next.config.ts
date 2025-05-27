import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Disable server-side features for static export
  experimental: {
    esmExternals: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  // Explicitly disable middleware for static export
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  // Add base path for GitHub Pages if needed
  basePath: process.env.NODE_ENV === 'production' ? '/CrowsEyeWebsite' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/CrowsEyeWebsite/' : ''
};

export default nextConfig;
