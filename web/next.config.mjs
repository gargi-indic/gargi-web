/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/models",
        destination: "/indic/models",
        permanent: true,
      },
      {
        source: "/chat",
        destination: "/indic/chat",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/indic/about",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
