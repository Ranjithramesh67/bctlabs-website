import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "*.monkeycode-ai.live", "**.monkeycode-ai.live"],
  images: {
    minimumCacheTTL: 86400,
  },
  async headers() {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "avif", "svg"];
    return imageExtensions.map((ext) => ({
      source: `/:path*.${ext}`,
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=86400, stale-while-revalidate=604800",
        },
      ],
    }));
  },
  turbopack: {
    // The store lives inside another Next app's folder; pin the Turbopack root
    // so the parent project's sources are not pulled into this build.
    root: path.resolve(process.cwd()),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
