// next.config.js - Fixed for Railway Backend
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Image optimization
  images: {
    domains: ["mafia-ai-production.up.railway.app"],
    formats: ["image/webp", "image/avif"],
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // 🔥 FIXED: Environment variables for Railway backend
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NODE_ENV === "production"
        ? "https://mafia-ai-production.up.railway.app" // ✅ NO PORT!
        : "http://localhost:3001",
    NEXT_PUBLIC_WS_URL:
      process.env.NODE_ENV === "production"
        ? "wss://mafia-ai-production.up.railway.app" // ✅ NO PORT!
        : "ws://localhost:3001",
    NEXT_PUBLIC_APP_URL:
      process.env.NODE_ENV === "production"
        ? "https://mafia-ai.vercel.app"
        : "http://localhost:3000",
  },

  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    webVitalsAttribution: ["CLS", "LCP"],
  },

  // Output configuration for static export if needed
  trailingSlash: false,

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
