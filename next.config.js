/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  trailingSlash: true,
};

module.exports = nextConfig;
