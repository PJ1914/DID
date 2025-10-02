"use client";

import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useMemo } from 'react';
import { WagmiConfig } from 'wagmi';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { wagmiConfig } from '@/lib/wagmi';
import { getQueryClient } from '@/lib/query-client';
import { useAutoSmartWallet } from '@/hooks/useAutoSmartWallet';

function AutoSmartWalletRegistration() {
    useAutoSmartWallet();
    return null;
}

export function Providers({ children }: { children: ReactNode }) {
    const client = useMemo(() => getQueryClient(), []);

    return (
        <WagmiConfig config={wagmiConfig}>
            <QueryClientProvider client={client}>
                <NextThemeProvider attribute="class" enableSystem>
                    <RainbowKitProvider
                        modalSize="wide"
                        theme={{
                            lightMode: lightTheme({ accentColor: '#2563eb' }),
                            darkMode: darkTheme({ accentColor: '#38bdf8' })
                        }}
                    >
                        <AutoSmartWalletRegistration />
                        {children}
                    </RainbowKitProvider>
                </NextThemeProvider>
            </QueryClientProvider>
        </WagmiConfig>
    );
}
