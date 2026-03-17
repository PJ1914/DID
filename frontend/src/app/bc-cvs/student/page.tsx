"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAccount, useReadContract } from "wagmi"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { Award, Share2, History, AlertCircle, TrendingUp, Eye, Wallet, Bell, Gem } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CertificateHashRegistryABI } from "@/contracts/abis/bc-cvs"
import { getContractAddress } from "@/contracts/addresses"
import { getLocalNotifications } from "@/lib/notifications"

export default function StudentPage() {
  const { address, isConnected, chain } = useAccount()
  const [sharedLinksCount, setSharedLinksCount] = useState(0)
  const [notificationCount, setNotificationCount] = useState(0)

  const isSupportedChain = chain?.id === 11155111 || chain?.id === 31337 || chain?.id === 1337
  const registryAddress = (isSupportedChain && chain?.id
    ? getContractAddress(chain.id as 11155111 | 31337 | 1337, "certificateHashRegistry")
    : "0x0000000000000000000000000000000000000000") as `0x${string}`

  const isValidAddress = registryAddress && registryAddress !== "0x" && registryAddress !== "0x0000000000000000000000000000000000000000"

  // Fetch certificate count
  const { data: certificateHashes } = useReadContract({
    address: isValidAddress ? registryAddress : undefined,
    abi: CertificateHashRegistryABI,
    functionName: "getCertificatesByHolder",
    args: address && isValidAddress ? [address] : undefined,
    query: {
      enabled: Boolean(address && isValidAddress && isConnected && isSupportedChain),
    },
  })

  const certificateCount = (certificateHashes as any[])?.length || 0

  // Load shared links count from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`shared-links-${address}`)
      if (stored) {
        const links = JSON.parse(stored)
        setSharedLinksCount(Array.isArray(links) ? links.length : 0)
      }

      if (address) {
        const unread = getLocalNotifications(address).filter((n) => !n.read).length
        setNotificationCount(unread)
      }
    } catch (error) {
      console.error('Failed to load shared links:', error)
    }
  }, [address])

  const features = [
    {
      title: "My Certificates",
      description: "View all your certificates issued by institutions",
      icon: Award,
      href: "/bc-cvs/student/my-certificates",
      color: "from-blue-500 to-cyan-500",
      count: certificateCount,
    },
    {
      title: "Share Certificate",
      description: "Generate shareable links for employers and verifiers",
      icon: Share2,
      href: "/bc-cvs/student/share",
      color: "from-purple-500 to-pink-500",
      count: null,
    },
    {
      title: "Verification History",
      description: "Track who has verified your certificates",
      icon: History,
      href: "/bc-cvs/student/history",
      color: "from-green-500 to-emerald-500",
      count: null,
    },
    {
      title: "Identity Wallet",
      description: "Manage student-controlled credentials and privacy settings",
      icon: Wallet,
      href: "/bc-cvs/student/wallet",
      color: "from-indigo-500 to-blue-500",
      count: certificateCount,
    },
    {
      title: "Notifications",
      description: "Real-time alerts when employers verify your credentials",
      icon: Bell,
      href: "/bc-cvs/student/notifications",
      color: "from-amber-500 to-orange-500",
      count: notificationCount,
    },
    {
      title: "NFT Certificates",
      description: "Mint and manage unique NFT-backed credentials",
      icon: Gem,
      href: "/bc-cvs/student/nft-certificates",
      color: "from-violet-500 to-fuchsia-500",
      count: null,
    },
  ]

  const stats = [
    { label: "Total Certificates", value: certificateCount.toString(), icon: Award },
    { label: "Times Verified", value: "N/A", icon: Eye },
    { label: "Shared Links", value: sharedLinksCount.toString(), icon: Share2 },
    { label: "Unread Alerts", value: notificationCount.toString(), icon: Bell },
    { label: "Network", value: chain?.name || "Disconnected", icon: TrendingUp },
  ]

  if (!isConnected) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="container px-4 py-16 mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to access the Student Portal.
            </AlertDescription>
          </Alert>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Student Portal
          </h1>
          <p className="text-muted-foreground">
            View your certificates, share them with employers, and track verification history
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
          {stats.map((stat) => {
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

        {/* Recent Certificates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Certificates</CardTitle>
              <CardDescription>Your recently issued certificates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                No certificates yet. Certificates issued by institutions will appear here.
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>1. Receive:</strong> Institutions issue certificates to your wallet address
            </p>
            <p>
              <strong>2. View:</strong> Check all your certificates in "My Certificates"
            </p>
            <p>
              <strong>3. Share:</strong> Generate shareable verification links for employers
            </p>
            <p>
              <strong>4. Track:</strong> Monitor who has verified your certificates
            </p>
            <p className="text-xs mt-4">
              💡 Tip: Share your verification links instead of physical certificates
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </ProtectedRoute>
  )
}
