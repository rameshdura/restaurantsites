/* global process */
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  headers: async () => [
    {
      source: '/:restaurant*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'private, no-cache, must-revalidate',
        },
      ],
    },
  ],
};
export default nextConfig;
