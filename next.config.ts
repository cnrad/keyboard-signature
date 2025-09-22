import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  devIndicators: false,
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
