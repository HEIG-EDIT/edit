import type { NextConfig } from "next";

//change to false for local dev
const isProd = true;

const backendTarget = isProd
  ? "http://backend-container:4000" // nom du conteneur sur le réseau Docker
  : "http://localhost:4000";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }];
    return config;
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
