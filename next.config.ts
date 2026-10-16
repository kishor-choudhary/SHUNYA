import type { NextConfig } from "next";

/**
 * Security headers — production also needs HTTPS at the edge.
 * `next.config.ts` sets HSTS so any host serving SHUNYA is forced to TLS.
 */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  /**
   * Dev servers are often reached through a sandbox or tunnel host rather than
   * localhost. Allow those origins so HMR and asset requests are not blocked
   * during review; production behaviour is unaffected.
   */
  allowedDevOrigins: ["localhost", "127.0.0.1", "*.e2b.app", "*.vercel.app"],
  images: {
    formats: ["image/avif", "image/webp"],
    // Modern, long-lived cache for optimised event photography.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
