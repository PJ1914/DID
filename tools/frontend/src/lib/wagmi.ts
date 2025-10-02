import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
    coinbaseWallet,
    injectedWallet,
    metaMaskWallet,
    safeWallet,
    walletConnectWallet
} from '@rainbow-me/rainbowkit/wallets';
import { cookieStorage, createConfig, createStorage, http } from 'wagmi';
import { sepolia, mainnet, polygon, polygonMumbai } from 'wagmi/chains';
import { env } from './env';

const chainId = Number(env.NEXT_PUBLIC_CHAIN_ID || 1);

const targetChain = [mainnet, sepolia, polygon, polygonMumbai].find(
    (chain) => chain.id === chainId
) ?? sepolia;

const projectId = env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo-did-platform';

export const wagmiConfig = getDefaultConfig({
    appName: 'DID Platform',
    projectId,
    chains: [targetChain],
    storage: createStorage({
        storage: cookieStorage
    }),
    transports: {
        [targetChain.id]: http(env.NEXT_PUBLIC_RPC_URL)
    },
    wallets: [
        {
            groupName: 'Smart wallets',
            wallets: [safeWallet]
        },
        {
            groupName: 'Recommended',
            wallets: [metaMaskWallet, walletConnectWallet, coinbaseWallet, injectedWallet]
        }
    ]
});
