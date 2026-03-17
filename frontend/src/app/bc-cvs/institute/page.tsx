"use client"

import { motion } from "framer-motion"
import { useAccount, useReadContract } from "wagmi"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { 
  Key, 
  FileText, 
  Vote, 
  Activity, 
  TrendingUp, 
  Users, 
  Award,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CertificateHashRegistryABI, ValidatorConsensusABI } from "@/contracts/abis/bc-cvs"
import { getContractAddress } from "@/contracts/addresses"
import { useState, useEffect } from "react"
import { getVerificationStats } from "@/lib/verificationHistory"

export default function InstitutePage() {
  const { address, isConnected, chain } = useAccount()
  const [totalVerifications, setTotalVerifications] = useState(0)

  useEffect(() => {
    setTotalVerifications(getVerificationStats().total)
  }, [])

  const isSupportedChain = chain?.id === 11155111 || chain?.id === 31337 || chain?.id === 1337
  const registryAddress = (isSupportedChain && chain?.id
    ? getContractAddress(chain.id as 11155111 | 31337 | 1337, "certificateHashRegistry")
    : "0x0000000000000000000000000000000000000000") as `0x${string}`

  const consensusAddress = (isSupportedChain && chain?.id
    ? getContractAddress(chain.id as 11155111 | 31337 | 1337, "validatorConsensus")
    : "0x0000000000000000000000000000000000000000") as `0x${string}`

  const isValidAddress = registryAddress && registryAddress !== "0x" && registryAddress !== "0x0000000000000000000000000000000000000000"

  // Fetch certificates issued by this address
  const { data: myCertificates } = useReadContract({
    address: isValidAddress ? registryAddress : undefined,
    abi: CertificateHashRegistryABI,
    functionName: "getCertificatesByIssuer",
    args: address && isValidAddress ? [address] : undefined,
    query: {
      enabled: Boolean(address && isValidAddress && isConnected && isSupportedChain),
    },
  })

  // Fetch total validators
  const { data: validatorCount } = useReadContract({
    address: consensusAddress && consensusAddress !== "0x0000000000000000000000000000000000000000" ? consensusAddress : undefined,
    abi: ValidatorConsensusABI,
    functionName: "getValidatorCount",
    query: {
      enabled: Boolean(isConnected && isSupportedChain && consensusAddress !== "0x0000000000000000000000000000000000000000"),
    },
  })

  // Fetch pending proposals
  const { data: proposalCount } = useReadContract({
    address: consensusAddress && consensusAddress !== "0x0000000000000000000000000000000000000000" ? consensusAddress : undefined,
    abi: ValidatorConsensusABI,
    functionName: "getProposalCount",
    query: {
      enabled: Boolean(isConnected && isSupportedChain && consensusAddress !== "0x0000000000000000000000000000000000000000"),
    },
  })

  const certificatesIssued = Array.isArray(myCertificates) ? myCertificates.length : 0
  const validators = validatorCount ? Number(validatorCount) : 0
  const proposals = proposalCount ? Number(proposalCount) : 0
  
  // totalVerifications is loaded in useEffect to avoid SSR localStorage errors

  const features = [
    {
      title: "Issue Certificate",
      description: "Create and issue new certificates with SHA-256 hashing and RSA signatures",
      icon: FileText,
      href: "/bc-cvs/institute/issue-certificate",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Validator Voting",
      description: "Vote on institutional onboarding proposals and manage governance",
      icon: Vote,
      href: "/bc-cvs/institute/validator-voting",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Key Management",
      description: "Generate, store, and manage your RSA key pairs securely",
      icon: Key,
      href: "/bc-cvs/institute/key-management",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Activity Dashboard",
      description: "Monitor issued certificates, revocations, and verification activity",
      icon: Activity,
      href: "/bc-cvs/institute/dashboard",
      color: "from-orange-500 to-red-500",
    },
  ]

  const stats = [
    { label: "Certificates Issued", value: certificatesIssued.toString(), icon: Award, trend: isConnected ? "Your certificates" : "Connect wallet" },
    { label: "Active Validators", value: validators.toString(), icon: Users, trend: isSupportedChain ? "Network validators" : "Switch to Sepolia" },
    { label: "Pending Proposals", value: proposals.toString(), icon: Vote, trend: isSupportedChain ? "Governance proposals" : "N/A" },
    { label: "Total Verifications", value: totalVerifications.toString(), icon: TrendingUp, trend: "All verifiers combined" },
  ]

  if (!isConnected) {
    return (
      <ProtectedRoute requiredRole="institute">
        <div className="container px-4 py-16 mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to access the Institute Portal.
            </AlertDescription>
          </Alert>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="institute">
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 py-8 mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Institute Portal
          </h1>
          <p className="text-muted-foreground">
            Manage certificates, participate in governance, and monitor institutional activities
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
          {stats.map((stat, index) => {
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
                  <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          Open {feature.title}
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest institutional actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No recent activity. Start by issuing a certificate or voting on a proposal.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
    </ProtectedRoute>
  )
}
