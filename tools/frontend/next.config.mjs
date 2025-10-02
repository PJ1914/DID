/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        serverActions: {
            bodySizeLimit: "2mb"
        }
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "ipfs.io"
            },
            {
                protocol: "https",
                hostname: "gateway.pinata.cloud"
            }
        ]
    }
};

export default nextConfig;
