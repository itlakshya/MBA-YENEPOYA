import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/online-mba-course-yenepoyauniversity',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
