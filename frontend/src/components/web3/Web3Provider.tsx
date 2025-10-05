"use client"

import { ReactNode } from "react"
import { WagmiProvider, createConfig, http } from "wagmi"
import { sepolia, mainnet, localhost } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"

const queryClient = new QueryClient()

const config = getDefaultConfig({
  appName: "DID Platform",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [sepolia, localhost],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
    [localhost.id]: http(),
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
