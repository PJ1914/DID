"use client"

import { ReactNode } from "react"
import { WagmiProvider, createConfig, http } from "wagmi"
import { sepolia } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider, connectorsForWallets, darkTheme } from "@rainbow-me/rainbowkit"
import { injectedWallet, metaMaskWallet, coinbaseWallet } from "@rainbow-me/rainbowkit/wallets"
import "@rainbow-me/rainbowkit/styles.css"
import { defineChain } from "viem"

const queryClient = new QueryClient()

// Define custom localhost chain for Ganache (chain ID 1337)
const localhostGanache = defineChain({
  id: 1337,
  name: "Localhost (Ganache)",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
})

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, injectedWallet, coinbaseWallet],
    },
  ],
  {
    appName: "DID Platform",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  }
)

const config = createConfig({
  connectors,
  chains: [sepolia, localhostGanache],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
    [localhostGanache.id]: http(),
  },
  ssr: true,
})

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: "#00D4FF",
          accentColorForeground: "white",
          borderRadius: "medium",
        })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
