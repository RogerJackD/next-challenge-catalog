import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/catalog/images/**',
      },
    ],
    // Permitir IPs locales en desarrollo
    dangerouslyAllowSVG: true,
    unoptimized: process.env.NODE_ENV === 'development', // Solo en desarrollo
  },
  // Configuración adicional para desarrollo local
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      allowedRevalidateHeaderKeys: [],
    },
  }),
};

export default nextConfig;