/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.contentstack.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "eu-images.contentstack.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "azure-na-images.contentstack.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "au-images.contentstack.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "azure-eu-images.contentstack.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "gcp-na-images.contentstack.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "gcp-eu-images.contentstack.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets.contentstack.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
