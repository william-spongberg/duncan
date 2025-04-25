import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // allow google avatar images
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
};

export default nextConfig;
