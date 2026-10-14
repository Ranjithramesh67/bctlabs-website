import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Content images are effectively immutable; keep optimized variants warm.
    minimumCacheTTL: 86400,
  },
  async rewrites() {
    // Spatie MediaLibrary URLs are emitted as `/storage/<media id>/<file>`
    // (the original Laravel symlink). The migrated files live under
    // `public/uploads/`, so serve them from the original URL shape.
    return [{ source: "/storage/:path*", destination: "/uploads/:path*" }];
  },
  async headers() {
    // The legacy asset tree is served straight from /public and would
    // otherwise revalidate on every request (`max-age=0`).
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
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
