import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://cicada-ieee.in/api/:path*', // Proxy to Backend
      },
      // Add more proxy rules as needed
    ];
  },
};

export default nextConfig;
