import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimizaciones de rendimiento
  experimental: {
    optimizePackageImports: ['@/components', '@/styles'],
  },
  
  // Compresión
  compress: true,
  
  // Optimización de imágenes
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Configuración de Sass
  sassOptions: {
    includePaths: ['./src/styles'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Headers de rendimiento
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ],
      },
    ];
  },
};

export default nextConfig;
