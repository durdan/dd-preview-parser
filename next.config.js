/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['canvas', 'sharp']
  },
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif']
  },
  webpack: (config) => {
    config.externals.push({
      canvas: 'canvas'
    });
    
    // Handle mermaid module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    
    return config;
  },
  transpilePackages: ['mermaid']
};

module.exports = nextConfig;