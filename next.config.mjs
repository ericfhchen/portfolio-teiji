/** @type {import('next').NextConfig} */
const nextConfig = {
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