"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Shield, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useRoles } from "@/hooks/useRoles"

export default function DashboardPage() {
  const router = useRouter()
  const { 
    address,
    isConnected,
    isLoadingRoles,
    isAdmin, 
    isIssuer, 
    isValidator, 
    isHolder, 
    isVerifier,
    hasAnyRole 
  } = useRoles()

  useEffect(() => {
    // Wait until connected and role queries have finished before routing
    if (!isConnected || isLoadingRoles) return

    if (isAdmin) {
      router.push("/bc-cvs/institute/dashboard")
    } else if (isIssuer || isValidator) {
      router.push("/bc-cvs/institute")
    } else if (isHolder) {
      router.push("/bc-cvs/student")
    } else if (isVerifier) {
      router.push("/bc-cvs/verifier")
    }
    // If no role after queries complete, stay to show "No Role Assigned"
  }, [isConnected, isLoadingRoles, isAdmin, isIssuer, isValidator, isHolder, isVerifier, router])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0B0D] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h1>
          <p className="text-white/60 mb-6">
            Please connect your wallet to access the BC-CVS dashboard
          </p>
          <div className="text-sm text-white/40">
            Click the "Connect Wallet" button in the top right corner
          </div>
        </motion.div>
      </div>
    )
  }

  // Show spinner while role queries are in flight — prevents false "No Role Assigned"
  if (isLoadingRoles) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0B0D] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading your profile...</p>
        </motion.div>
      </div>
    )
  }

  if (!hasAnyRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0B0D] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">No Role Assigned</h1>
          <p className="text-white/60 mb-6">
            Your wallet address does not have any role assigned in the BC-CVS system.
          </p>
          <div className="text-sm text-white/60 space-y-3 text-left bg-white/5 rounded-lg p-4">
            <div>
              <strong className="text-white">For Students:</strong> You will receive holder role when an institution issues you a certificate
            </div>
            <div>
              <strong className="text-white">For Institutions:</strong> Contact the system administrator to be granted issuer role
            </div>
            <div>
              <strong className="text-white">For Verifiers:</strong> Contact the system administrator to be granted verifier role
            </div>
          </div>
          <div className="mt-6 text-xs text-white/40">
            Connected Address: <code className="text-purple-400 break-all">{address || "Not connected"}</code>
          </div>
        </motion.div>
      </div>
    )
  }

  // Redirect is in progress (useEffect above is pushing the route)
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0B0D] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
        <p className="text-white/60">Redirecting to your dashboard...</p>
      </motion.div>
    </div>
  )
}
