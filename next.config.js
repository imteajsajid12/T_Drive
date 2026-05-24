/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['localhost', '192.168.0.106'],
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
