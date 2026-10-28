/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  experimental: {
    agentUpgrade: "security",
  },

  pageExtensions: ["page.tsx", "page.ts"],
};

export default nextConfig;
