/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['ipfs.io', 'gateway.pinata.cloud', 'dweb.link'],
    },
    webpack: (config) => {
        config.resolve.fallback = { fs: false, net: false, tls: false };
        config.externals.push('pino-pretty', 'lokijs', 'encoding');
        return config;
    },
};

module.exports = nextConfig;