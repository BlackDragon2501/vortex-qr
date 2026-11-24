import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pages: export estatico (CF_PAGES lo inyecta Cloudflare); Vercel mantiene standalone.
  // Vercel mantiene standalone; cualquier otro hosting (Pages, Workers, etc) exporta estatico.
  output: process.env.VERCEL ? "standalone" : "export",
  // GitHub Pages: https://blackdragon2501.github.io/vortex-qr/ (activo solo en el build de Actions con GITHUB_PAGES=1)
  basePath: process.env.GITHUB_PAGES ? "/vortex-qr" : undefined,
  /* config options here */
  turbopack: {
    root: process.cwd(),
  },
  outputFileTracingRoot: process.cwd(),
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
