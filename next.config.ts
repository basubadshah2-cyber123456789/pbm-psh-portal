import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres',
    JWT_SECRET: process.env.JWT_SECRET || 'pbm-psh-portal-secret-key-2026',
  },
};

export default nextConfig;

