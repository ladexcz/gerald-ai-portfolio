import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Lets a second build or dev server (checks, screenshots) use its own folder,
  // so it never overwrites the .next a running `npm run dev` is serving from.
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
