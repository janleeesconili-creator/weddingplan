import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // The GitHub Pages build does not use the Cloudflare-only database files.
  typescript: {
    ignoreBuildErrors: true,
  },
  ...(isGitHubPages
    ? {
        basePath: "/weddingplan",
        assetPrefix: "/weddingplan/",
      }
    : {}),
};

export default nextConfig;
