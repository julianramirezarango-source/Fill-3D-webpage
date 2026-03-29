import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",          // Static HTML export for Hostinger
  basePath: "/wiki/calculadora", // Calculator at fill-3d.com/wiki/calculadora/
  trailingSlash: true,       // Generates index.html per route
  images: {
    unoptimized: true,       // Required for static export
  },
};

export default nextConfig;
