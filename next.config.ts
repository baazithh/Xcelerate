import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/upload",
        destination: "http://127.0.0.1:8000/api/upload",
      },
    ];
  },
};

export default nextConfig;
