/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['http://localhost:3000', 'http://192.168.0.106:3000'],
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
