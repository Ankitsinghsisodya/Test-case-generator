import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://546f2f0eae32.ngrok-free.app/api/:path*", // Proxy to Backend
      },
      // Add more proxy rules as needed
    ];
  },
};

export default nextConfig;
