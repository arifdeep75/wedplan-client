import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Keep the browser on this origin and proxy API calls to the deployed
  // server. This keeps the auth cookie first-party, so sessions work without
  // third-party cookie exceptions.
  async rewrites() {
    const apiUrl = process.env.API_PROXY_URL;

    if (!apiUrl) return [];

    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
