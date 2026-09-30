import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ...keep your existing options
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

export default nextConfig;