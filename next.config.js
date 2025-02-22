const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['147.93.108.70'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '147.93.108.70',
        port: '8080',
        pathname: '/**', // Make it less restrictive
      },
    ],
    minimumCacheTTL: 60,
    // Add this to handle large images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        path: false,
      };
    }
    
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src')
    };

    return config;
  },
};

module.exports = nextConfig;
