import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Web3Provider } from '@/components/web3/Web3Provider'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import { CustomCursor } from '@/components/ui/custom-cursor'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'DID Platform - Decentralized Identity',
    description: 'A comprehensive platform for managing decentralized identities, verifications, and trust scores',
    icons: {
        icon: '/favicon.ico',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Web3Provider>
                        <CustomCursor />
                        <div className="min-h-screen bg-background" style={{ cursor: 'none' }}>
                            {children}
                        </div>
                        <Toaster />
                    </Web3Provider>
                </ThemeProvider>
            </body>
        </html>
    )
}