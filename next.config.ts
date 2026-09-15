import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/interactivos",
  assetPrefix: "/interactivos/",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;