import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // allow google profile pictures and supabase images
  // FIXME: use remotePatterns instead
  images: {
    domains: [
      "lh3.googleusercontent.com",
      (process.env.NEXT_PUBLIC_SUPABASE_URL as string).replace(
        /https?:\/\//,
        ""
      ),
    ],
  },
};

export async function headers() {
  return [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
      ],
    },
    {
      source: "/sw.js",
      headers: [
        {
          key: "Content-Type",
          value: "application/javascript; charset=utf-8",
        },
        {
          key: "Cache-Control",
          value: "no-cache, no-store, must-revalidate",
        },
        {
          key: "Content-Security-Policy",
          value: "default-src 'self'; script-src 'self'",
        },
      ],
    },
  ];
}

export default nextConfig;
