import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only enable static export for production builds
  ...(process.env.NODE_ENV === 'production' && { 
    output: "export",
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
  }),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**",
      },
    ],
    unoptimized: true,
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || "",
};

export default nextConfig;
