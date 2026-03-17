import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: undefined,
  webpack(config) {
    // Stub optional packages that MetaMask SDK and WalletConnect/pino
    // try to resolve but are not needed in a browser Next.js build.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };
    return config;
  },
};

export default nextConfig;
