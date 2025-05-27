import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Temporarily disable static export to allow API routes for Stripe integration
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    esmExternals: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  // Disable server-side features for static export
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
