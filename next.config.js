/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.telegram.org'
      },
      {
        protocol: 'https',
        hostname: 'placehold.co'
      }
    ],
    unoptimized: true
  }
};

export default nextConfig;
