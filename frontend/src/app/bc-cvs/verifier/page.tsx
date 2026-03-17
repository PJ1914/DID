"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAccount } from "wagmi"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import {
  ShieldCheck,
  Upload,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileCheck,
  Users,
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { getVerificationStats, getVerificationHistory } from "@/lib/verificationHistory"
import { calculateIssuerReputations } from "@/lib/reputation"

export default function VerifierPage() {
  const { address, isConnected } = useAccount()
  const [stats, setStats] = useState({
    total: 0,
    verifiedToday: 0,
    valid: 0,
    invalid: 0,
    revoked: 0,
  })
  const [historyCount, setHistoryCount] = useState(0)
  const [issuerScores, setIssuerScores] = useState<ReturnType<typeof calculateIssuerReputations>>([])

  // Load stats from localStorage on mount
  useEffect(() => {
    const verificationStats = getVerificationStats()
    setStats(verificationStats)
    setHistoryCount(getVerificationHistory().length)
    setIssuerScores(calculateIssuerReputations().slice(0, 5))
  }, [])

  const features = [
    {
      title: "Verify Certificate",
      description: "Upload and verify individual certificates instantly",
      icon: ShieldCheck,
      href: "/bc-cvs/verifier/verify-certificate",
      color: "from-green-500 to-emerald-500",
      count: null,
    },
    {
      title: "Bulk Verification",
      description: "Verify multiple certificates simultaneously",
      icon: Upload,
      href: "/bc-cvs/verifier/bulk-verification",
      color: "from-blue-500 to-cyan-500",
      count: null,
    },
    {
      title: "Verification History",
      description: "View all your past verification activities",
      icon: FileCheck,
      href: "/bc-cvs/verifier/history",
      color: "from-purple-500 to-pink-500",
      count: historyCount,
    },
  ]

  const dashboardStats = [
    { label: "Total Verifications", value: stats.total.toString(), icon: ShieldCheck },
    { label: "Verified Today", value: stats.verifiedToday.toString(), icon: CheckCircle2 },
    { label: "Failed Checks", value: (stats.invalid + stats.revoked).toString(), icon: AlertCircle },
    { label: "Valid Certificates", value: stats.valid.toString(), icon: Users },
  ]

  if (!isConnected) {
    return (
      <ProtectedRoute requiredRole="verifier">
        <div className="container px-4 py-16 mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to access the Verifier Portal.
            </AlertDescription>
          </Alert>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="verifier">
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Verifier Portal
          </h1>
          <p className="text-muted-foreground">
            Verify academic certificates instantly with blockchain technology
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Connected: <code className="text-xs bg-muted px-2 py-1 rounded">{address}</code>
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {dashboardStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                >
                  <Link href={feature.href}>
                    <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          {feature.count !== null && (
                            <Badge variant="secondary">{feature.count}</Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          Open
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Verification Process Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How Certificate Verification Works</CardTitle>
            <CardDescription>Our multi-layer verification process</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h4 className="font-semibold mb-2">Upload Certificate</h4>
                <p className="text-xs text-muted-foreground">
                  Upload certificate file or enter hash
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold mb-2">Hash Verification</h4>
                <p className="text-xs text-muted-foreground">
                  SHA-256 hash checked against blockchain
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h4 className="font-semibold mb-2">Signature Check</h4>
                <p className="text-xs text-muted-foreground">RSA signature validated</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">4</span>
                </div>
                <h4 className="font-semibold mb-2">Revocation Check</h4>
                <p className="text-xs text-muted-foreground">
                  Verify not revoked or corrected
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Verifier Benefits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Instant Verification:</strong> Results in seconds, not days
            </p>
            <p>
              <strong>100% Accuracy:</strong> Blockchain ensures tamper-proof records
            </p>
            <p>
              <strong>Audit Trail:</strong> Complete verification history logged immutably
            </p>
            <p>
              <strong>Cost Effective:</strong> Significantly cheaper than manual verification
            </p>
            <p className="text-xs mt-4">
              💡 Bulk verification available for employers processing multiple candidates
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Credential Reputation Score</CardTitle>
            <CardDescription>Institution trust ranking based on verification outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            {issuerScores.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Reputation scores will appear after verification history is available.
              </p>
            ) : (
              <div className="space-y-3">
                {issuerScores.map((issuer) => (
                  <div key={issuer.issuer} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm break-all">{issuer.issuer}</p>
                      <Badge variant={issuer.score >= 80 ? "default" : "secondary"}>Score {issuer.score}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Success {issuer.successRate}% • Valid {issuer.validCount} • Risk events {issuer.invalidOrRevokedCount}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </ProtectedRoute>
  )
}
