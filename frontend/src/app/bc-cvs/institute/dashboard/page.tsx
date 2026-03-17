"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useAccount, useReadContract } from "wagmi"
import {
  Award,
  XCircle,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CertificateHashRegistryABI, RevocationRegistryABI } from "@/contracts/abis/bc-cvs"
import { getContractAddress } from "@/contracts/addresses"
import { getRecentActivities, getActivityStats, formatActivityTime } from "@/lib/activityTracker"

export default function DashboardPage() {
  const { address, isConnected, chain } = useAccount()
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [activityStats, setActivityStats] = useState({ total: 0, today: 0, thisWeek: 0 })

  const isSupportedChain = chain?.id === 11155111 || chain?.id === 31337 || chain?.id === 1337
  
  const registryAddress = isSupportedChain && chain?.id
    ? getContractAddress(chain.id as 11155111 | 31337 | 1337, "certificateHashRegistry")
    : "0x0000000000000000000000000000000000000000"

  const revocationAddress = isSupportedChain && chain?.id
    ? getContractAddress(chain.id as 11155111 | 31337 | 1337, "revocationRegistry")
    : "0x0000000000000000000000000000000000000000"

  // Load activity from localStorage
  useEffect(() => {
    if (!address) return

    const activities = getRecentActivities(address, 10)
    setRecentActivity(activities)

    const stats = getActivityStats(address)
    setActivityStats(stats)
  }, [address])

  // Read total certificates
  const { data: totalCerts } = useReadContract({
    address: registryAddress,
    abi: CertificateHashRegistryABI,
    functionName: "getTotalCertificates",
  })

  // Read revocation statistics
  const { data: revocationStats } = useReadContract({
    address: revocationAddress,
    abi: RevocationRegistryABI,
    functionName: "getStatistics",
  })

  // Read certificates by issuer (if authorized)
  const { data: myCertificates } = useReadContract({
    address: registryAddress,
    abi: CertificateHashRegistryABI,
    functionName: "getCertificatesByIssuer",
    args: address ? [address] : undefined,
  })

  if (!isConnected) {
    return (
      <div className="container px-4 py-16 mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to view the dashboard.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Note: Blockchain features require Sepolia or Localhost network
  // For now, pages are accessible regardless of network

  const stats = [
    {
      label: "Total Certificates Issued",
      value: totalCerts ? Number(totalCerts) : 0,
      icon: Award,
      trend: "+0 this month",
      color: "text-blue-500",
    },
    {
      label: "My Issued Certificates",
      value: Array.isArray(myCertificates) ? myCertificates.length : 0,
      icon: CheckCircle2,
      trend: "Active",
      color: "text-green-500",
    },
    {
      label: "Total Revocations",
      value: Array.isArray(revocationStats) && revocationStats.length > 0 ? Number(revocationStats[0]) : 0,
      icon: XCircle,
      trend: `${Array.isArray(revocationStats) && revocationStats.length > 1 ? Number(revocationStats[1]) : 0} corrected`,
      color: "text-red-500",
    },
    {
      label: "Recent Activity",
      value: activityStats.thisWeek.toString(),
      icon: Activity,
      trend: "Last 7 days",
      color: "text-purple-500",
    },
  ]

  // Map activity records for display
  const displayActivity = recentActivity.map((activity) => ({
    type: activity.type,
    title: activity.title,
    description: activity.description,
    holder: activity.holder,
    timestamp: formatActivityTime(activity.timestamp),
    icon: activity.type === "issued" ? Award : activity.type === "revoked" ? XCircle : CheckCircle2,
    iconColor: activity.type === "issued" ? "text-green-500" : activity.type === "revoked" ? "text-red-500" : "text-blue-500",
  }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Activity Dashboard
          </h1>
          <p className="text-muted-foreground mb-8">
            Monitor your certificates, revocations, and verification activity
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </CardTitle>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest institutional actions</CardDescription>
              </CardHeader>
              <CardContent>
                {displayActivity.length === 0 && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>No Activity Yet:</strong> When you issue or revoke certificates, they will appear here. 
                      Activity is tracked locally in this browser.
                    </AlertDescription>
                  </Alert>
                )}

                {displayActivity.length > 0 && (
                  <Alert className="mb-4" variant="default">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Live Data:</strong> Showing {activityStats.total} recent action{activityStats.total !== 1 ? "s" : ""} 
                      ({activityStats.today} today, {activityStats.thisWeek} this week).
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-4">
                  {displayActivity.length > 0 ? (
                    displayActivity.map((activity, index) => {
                      const Icon = activity.icon
                      return (
                        <div
                          key={index}
                          className="flex items-start gap-4 pb-4 border-b last:border-0"
                        >
                          <div
                            className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0`}
                          >
                            <Icon className={`w-5 h-5 ${activity.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-xs bg-muted px-2 py-0.5 rounded">
                                {activity.holder}
                              </code>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {activity.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No recent activity
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="space-y-6">
              {/* Certificate Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Certificate Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active</span>
                    <Badge variant="default">{Array.isArray(myCertificates) ? myCertificates.length : 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Revoked</span>
                    <Badge variant="destructive">
                      {Array.isArray(revocationStats) && revocationStats.length > 0 ? Number(revocationStats[0]) : 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Corrected</span>
                    <Badge variant="secondary">
                      {Array.isArray(revocationStats) && revocationStats.length > 1 ? Number(revocationStats[1]) : 0}
                    </Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mt-4">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: "95%" }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">95% healthy</p>
                </CardContent>
              </Card>

              {/* Verification Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Verification Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Today</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">This Week</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">This Month</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm">Total</span>
                    <Badge>0</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Blockchain</span>
                    <Badge variant="default">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bloom Filter</span>
                    <Badge variant="default">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Gas Price</span>
                    <Badge variant="secondary">Low</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Chart Placeholder */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Certificate Issuance Trend</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Chart visualization coming soon</p>
                  <p className="text-sm">Integrate with Chart.js or Recharts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
