/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['cdn.sanity.io'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/art',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;