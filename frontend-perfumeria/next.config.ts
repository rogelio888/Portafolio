import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/frontend-perfumeria",
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
