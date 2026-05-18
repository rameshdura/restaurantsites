/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/images/restaurants/:slug/:path*",
        destination: "/api/restaurants/:slug/images/:path*",
      },
    ];
  },
}

export default nextConfig
