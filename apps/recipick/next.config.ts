import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/google/:path*',
        destination: `${process.env.NEXT_PUBLIC_GOOGLE_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
