/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['147.93.108.70'], // Add your image domain here
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '147.93.108.70',
        port: '8080',
        pathname: '/v1/storage/buckets/**',
      },
    ],
  },
};

module.exports = nextConfig;
