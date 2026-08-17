import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'ec2-3-86-31-157.compute-1.amazonaws.com',
    
    'localhost',
    '127.0.0.1',
  ],
};

export default nextConfig;