/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para Vercel
  experimental: {
    // Configuración experimental actualizada
  },
  
  // Configuración de servidor
  serverExternalPackages: [],
  
  // Configuración de imágenes
  images: {
    domains: [],
    unoptimized: false,
  },
  
  // Configuración de compilación
  compiler: {
    // Remover console.log en producción
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Configuración de webpack
  webpack: (config, { isServer }) => {
    // Configuración específica para el cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // Configuración de headers para Vercel
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Configuración para evitar problemas de hidratación
  reactStrictMode: true,
  
  // Configuración de transpilación
  transpilePackages: [],
  
  // Configuración de tipos
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Configuración de ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
