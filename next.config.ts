import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for Firebase Hosting
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
  skipTrailingSlashRedirect: true
};

export default nextConfig;
