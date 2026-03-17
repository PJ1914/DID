import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/web3/Web3Provider";
import { AuthProvider } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { FirebaseSetupBanner } from "@/components/firebase/FirebaseSetupBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DID Platform - Decentralized Identity",
  description: "Privacy-preserving decentralized identity platform with ZK proofs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <FirebaseSetupBanner />
        <Web3Provider>
          <AuthProvider>
            <MainLayout>{children}</MainLayout>
          </AuthProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
