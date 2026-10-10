/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  pageExtensions: ["page.tsx", "page.ts"],

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    INTERNAL_API_URL: process.env.INTERNAL_API_URL,
  },
};

export default nextConfig;
