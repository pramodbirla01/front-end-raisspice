const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      '147.93.108.70',
      'localhost'
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '147.93.108.70',
        port: '8080',
        pathname: '/v1/storage/buckets/**',
      },
    ],
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
