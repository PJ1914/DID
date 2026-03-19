"use client"

import { ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Shield, Loader2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useRoles } from "@/hooks/useRoles"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: "admin" | "issuer" | "validator" | "holder" | "verifier" | "institute" | "student"
  fallbackPath?: string
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallbackPath = "/bc-cvs/dashboard" 
}: ProtectedRouteProps) {
  const router = useRouter()
  const { 
    isConnected, 
    isAdmin, 
    isIssuer, 
    isValidator, 
    isHolder, 
    isVerifier,
    isInstitute,
    isStudent,
    hasAnyRole 
  } = useRoles()

  const hasRequiredRole = () => {
    if (!requiredRole) return true // No specific role required
    
    switch (requiredRole) {
      case "admin":
        return isAdmin
      case "issuer":
        return isIssuer
      case "validator":
        return isValidator
      case "holder":
        return isHolder
      case "verifier":
        return isVerifier
      case "institute":
        return isInstitute
      case "student":
        return isStudent
      default:
        return false
    }
  }

  useEffect(() => {
    if (!isConnected) {
      // Will show connect wallet message
      return
    }

    if (!hasAnyRole) {
      // Will show no role message
      return
    }

    if (requiredRole && !hasRequiredRole()) {
      // Redirect to fallback if user doesn't have required role
      router.push(fallbackPath)
    }
  }, [isConnected, hasAnyRole, requiredRole])

  // Not connected
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
          <h1 className="text-2xl font-bold text-white mb-2">Wallet Connection Required</h1>
          <p className="text-white/60 mb-6">
            Please connect your wallet to access this page
          </p>
          <div className="text-sm text-white/40">
            Click the "Connect Wallet" button in the top right corner
          </div>
        </motion.div>
      </div>
    )
  }

  // No role assigned
  if (!hasAnyRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0B0D] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">No Role Assigned</h1>
          <p className="text-white/60 mb-6">
            Your wallet does not have the required permissions to access BC-CVS
          </p>
          <div className="text-sm text-white/60 space-y-2 text-left bg-white/5 rounded-lg p-4">
            <div>• <strong>Students:</strong> Receive holder role when issued a certificate</div>
            <div>• <strong>Institutions:</strong> Contact admin for issuer role</div>
            <div>• <strong>Verifiers:</strong> Contact admin for verifier role</div>
          </div>
        </motion.div>
      </div>
    )
  }

  // User has role but not the required one for this page
  if (requiredRole && !hasRequiredRole()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0B0D] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-white/60 mb-6">
            You don't have permission to access this page
          </p>
          <p className="text-sm text-white/40 mb-6">
            Required role: <span className="text-purple-400 font-semibold">{requiredRole}</span>
          </p>
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <p className="text-xs text-white/40 mt-4">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    )
  }

  // User has required role, render children
  return <>{children}</>
}
