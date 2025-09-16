import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: [],
  experimental: {
    typedRoutes: false,
  },
  // Exclude backend directory from Next.js build
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.ts$/,
      exclude: [/backend/, /extensions/, /frontend/],
    });
    return config;
  },
  // Don't include backend in type checking
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
