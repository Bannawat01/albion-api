import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"], // ✅ อนุญาตให้โหลดรูปจาก Google profile
  },
};

export default nextConfig;
