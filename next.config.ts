// Merge into your next.config.ts / next.config.js
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Server Actions default to a 1 MB body limit; raise it so uploads (up to 5 × <1 MB) work
    serverActions: { bodySizeLimit: '6mb' },
  },
  images: {
    // Allow next/image to load from your Supabase project
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
  },
};

export default nextConfig;