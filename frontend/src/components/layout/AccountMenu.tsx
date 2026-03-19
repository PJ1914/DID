"use client"

import { useState } from "react"
import { useAccount, useDisconnect, useSwitchChain } from "wagmi"
import { sepolia } from "wagmi/chains"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User, 
  LogOut, 
  Copy, 
  CheckCircle2, 
  Wallet,
  UserCircle2,
  Shield,
  AlertTriangle,
  ArrowLeftRight,
} from "lucide-react"
import { useRoles } from "@/hooks/useRoles"

export function AccountMenu() {
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)
  const { isAdmin, isIssuer, isHolder, isVerifier, hasAnyRole } = useRoles()

  const isOnSepolia = chain?.id === sepolia.id
  const isOnWrongNetwork = isConnected && !isOnSepolia

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return ""
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getRoleLabel = () => {
    if (isAdmin) return "Administrator"
    if (isIssuer) return "Institute"
    if (isHolder) return "Student"
    if (isVerifier) return "Verifier"
    return "No Role"
  }

  const getRoleColor = () => {
    if (isAdmin) return "text-yellow-400"
    if (isIssuer) return "text-blue-400"
    if (isHolder) return "text-green-400"
    if (isVerifier) return "text-purple-400"
    return "text-gray-400"
  }

  // If not connected, show Login/Sign Up options
  if (!isConnected) {
    return (
      <div className="relative" suppressHydrationWarning>
        <div className="flex items-center gap-3">
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <>
                <button
                  onClick={openConnectModal}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors hidden md:block"
                >
                  Login
                </button>
                <button
                  onClick={() => window.location.href = '/bc-cvs/auth/register'}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#00D4FF] to-[#9C40FF] text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
                >
                  <UserCircle2 className="w-4 h-4 md:hidden" />
                  <span className="hidden md:inline">Sign Up</span>
                  <span className="md:hidden">Register</span>
                </button>
              </>
            )}
          </ConnectButton.Custom>
        </div>
      </div>
    )
  }

  // If connected, show account dropdown
  return (
    <div className="relative" suppressHydrationWarning>
      {/* Wrong network pill — visible in header */}
      {isOnWrongNetwork && (
        <button
          onClick={() => switchChain({ chainId: sepolia.id })}
          className="mr-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors"
          title="Click to switch to Sepolia"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Wrong Network
        </button>
      )}

      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/20"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#9C40FF] flex-shrink-0 shadow-lg shadow-purple-500/50">
          <UserCircle2 className="w-6 h-6 text-white" />
        </div>
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-medium text-white">
            {formatAddress(address)}
          </span>
          <span className={`text-xs font-medium ${getRoleColor()}`}>
            {getRoleLabel()}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDropdown(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-72 bg-[#0A0B0D]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-xl z-50"
            >
              {/* User Info Section */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#9C40FF]">
                    <UserCircle2 className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white mb-1">Connected Account</div>
                    <div className={`text-xs font-medium ${getRoleColor()}`}>
                      {getRoleLabel()}
                    </div>
                  </div>
                </div>
                
                {/* Address */}
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <span className="text-sm text-white/80 font-mono">{formatAddress(address)}</span>
                  <button
                    onClick={copyAddress}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                    title="Copy address"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-white/60" />
                    )}
                  </button>
                </div>

                {/* Network */}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Shield className="w-3 h-3" />
                    <span>{chain?.name ?? "Unknown Network"}</span>
                  </div>
                  {isOnWrongNetwork && (
                    <button
                      onClick={() => switchChain({ chainId: sepolia.id })}
                      className="flex items-center gap-1 text-xs text-[#00D4FF] hover:text-white transition-colors"
                    >
                      <ArrowLeftRight className="w-3 h-3" />
                      Switch to Sepolia
                    </button>
                  )}
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                {/* View Full Address */}
                <button
                  onClick={copyAddress}
                  className="w-full px-3 py-2 flex items-center gap-3 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Wallet className="w-4 h-4" />
                  <span>{copied ? "Address Copied!" : "Copy Full Address"}</span>
                </button>

                {/* Logout */}
                <button
                  onClick={() => {
                    disconnect()
                    setShowDropdown(false)
                  }}
                  className="w-full px-3 py-2 flex items-center gap-3 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>

              {/* Footer */}
              <div className="px-4 py-2 bg-white/5 border-t border-white/10">
                <div className="text-xs text-white/40 text-center">
                  BC-CVS Platform
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
