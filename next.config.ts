import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD ? "standalone" : undefined,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "streamed.pk",
      },
    ],
  },
  // Security headers. The enforced entries are safe for any client; the CSP is
  // `Content-Security-Policy-Report-Only` on purpose: it only reports violations
  // and never blocks, so hydration and the third-party player iframes keep
  // working. Tighten into a real `Content-Security-Policy` once reports look
  // clean. To roll back, delete this `headers()` method (or just the CSP entry).
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://streamed.pk",
              "font-src 'self' data:",
              "connect-src 'self' https://streamed.pk",
              "frame-src https:",
              "frame-ancestors 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
