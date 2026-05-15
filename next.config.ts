import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const api = "http://127.0.0.1:8000";
    return [
      { source: "/api/upload", destination: `${api}/api/upload` },
      { source: "/api/health", destination: `${api}/health` },
      { source: "/favicon.ico", destination: "/icon.svg" },
    ];
  },
};

export default nextConfig;
