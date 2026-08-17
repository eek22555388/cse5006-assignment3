import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'ec2-54-89-210-135.compute-1.amazonaws.com',
    
    'localhost',
    '127.0.0.1',
  ],
};

export default nextConfig;