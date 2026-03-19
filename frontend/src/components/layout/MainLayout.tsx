"use client"

import { ReactNode } from "react"
import BottomNavigation from "./BottomNavigation"
import { AccountMenu } from "./AccountMenu"
import { Shield } from "lucide-react"
import { motion } from "framer-motion"

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen relative">
      {/* Clean Top Bar with Connect Wallet */}
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0A0B0D]/80 border-b border-white/10" suppressHydrationWarning>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between" suppressHydrationWarning>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Shield className="w-5 h-5 text-purple-400" />
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              BC-CVS
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <AccountMenu />
          </motion.div>
        </div>
      </div>

      {/* Main Content with top padding */}
      <main className="relative pt-14">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
