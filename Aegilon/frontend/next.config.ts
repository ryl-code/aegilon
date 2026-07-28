import type { NextConfig } from "next";

// Backend the dev server proxies to. Kept server-side only (this file runs on
// the Node process, never shipped to the browser) so no NEXT_PUBLIC_ var leaks it.
const BACKEND_ORIGIN = process.env.BACKEND_PROXY_TARGET || "http://backend:8080";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/backend-proxy/:path*",
        destination: `${BACKEND_ORIGIN}/:path*`,
      },
    ];
  },
};

export default nextConfig;
