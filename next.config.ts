import type { NextConfig } from "next";

/**
 * Two build modes:
 *  - default: standalone Node server (sandbox / self-hosted), full /api support
 *  - NEXT_PUBLIC_STATIC_EXPORT=1 (+ NEXT_PUBLIC_BASE_PATH): static export for
 *    GitHub Pages — basePath /everything-ZCode, trailing slashes, no image
 *    optimizer. The dynamic /api routes are moved aside by the CI workflow.
 */
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : "standalone",
  basePath,
  trailingSlash: isStaticExport ? true : undefined,
  images: { unoptimized: isStaticExport ? true : undefined },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
