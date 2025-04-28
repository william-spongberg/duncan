import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // allow google avatar images
  images: {
    domains: ["lh3.googleusercontent.com", "onbcjywxmvmehnwqjbsh.supabase.co"],
  },
};

export default nextConfig;
