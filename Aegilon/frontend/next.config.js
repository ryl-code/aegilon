/** @type {import('next').NextConfig} */
const BACKEND_ORIGIN = process.env.BACKEND_PROXY_TARGET || "http://backend:8080";

const nextConfig = {
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

module.exports = nextConfig;
