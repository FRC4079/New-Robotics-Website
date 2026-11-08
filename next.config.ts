import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  compiler: {
    // Strip debug logging from production bundles, but keep errors and
    // warnings so failures in API routes still show up in the server logs.
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },
};

export default nextConfig;
