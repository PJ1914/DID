"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAccount, useReadContract } from "wagmi"
import {
  History,
  Eye,
  MapPin,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Building2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getVerificationHistory } from "@/lib/verificationHistory"
import { CertificateHashRegistryABI } from "@/contracts/abis/bc-cvs"
import { getContractAddress } from "@/contracts/addresses"

interface VerificationEvent {
  id: string
  certificateHash: string
  certificateName: string
  verifier: string
  verifierName: string
  timestamp: Date
  location?: string
  status: "success" | "failed"
}

export default function VerificationHistoryPage() {
  const { address, isConnected, chain } = useAccount()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCertificate, setFilterCertificate] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [verificationHistory, setVerificationHistory] = useState<VerificationEvent[]>([])
  const [myCertificateHashes, setMyCertificateHashes] = useState<string[]>([])

  const isSupportedChain = chain?.id === 11155111 || chain?.id === 31337 || chain?.id === 1337
  const registryAddress = isSupportedChain && chain?.id
    ? getContractAddress(chain.id as 11155111 | 31337 | 1337, "certificateHashRegistry")
    : "0x"

  // Get student's certificate hashes
  const { data: certificateHashes } = useReadContract({
    address: registryAddress as `0x${string}`,
    abi: CertificateHashRegistryABI,
    functionName: "getCertificatesByHolder",
    args: address ? [address] : undefined,
  })

  // Load verification history filtered by student's certificates
  useEffect(() => {
    if (!address || !isSupportedChain) return

    const hashes = Array.isArray(certificateHashes) ? (certificateHashes as string[]) : []
    setMyCertificateHashes(hashes)

    // Get global verification history
    const globalHistory = getVerificationHistory()

    // Filter to show only verifications of THIS student's certificates
    const myVerifications = globalHistory.filter(
      (record) =>
        // Match holder address (case-insensitive)
        record.holder.toLowerCase() === address.toLowerCase() ||
        // Or match certificate hash
        hashes.some((hash) => hash.toLowerCase() === record.certificateHash.toLowerCase())
    )

    // Convert to VerificationEvent format
    const events: VerificationEvent[] = myVerifications.map((record, index) => ({
      id: record.id || index.toString(),
      certificateHash: `${record.certificateHash.slice(0, 6)}...${record.certificateHash.slice(-4)}`,
      certificateName: record.metadata || "Certificate",
      verifier: "Unknown", // Verifier address not tracked in current system
      verifierName: "Verification System",
      timestamp: new Date(record.timestamp),
      status: record.status === "valid" ? "success" : "failed",
    }))

    setVerificationHistory(events)
  }, [address, certificateHashes, isSupportedChain])

  const filteredHistory = verificationHistory.filter((event) => {
    const matchesSearch =
      event.certificateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.verifierName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCert =
      filterCertificate === "all" || event.certificateHash === filterCertificate

    const matchesStatus = filterStatus === "all" || event.status === filterStatus

    return matchesSearch && matchesCert && matchesStatus
  })

  // Calculate stats
  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  const monthlyVerifications = verificationHistory.filter(
    (e) => new Date(e.timestamp) >= thisMonth
  ).length

  const uniqueVerifiers = new Set(
    verificationHistory.map((e) => e.verifier)
  ).size

  const stats = [
    { label: "Total Verifications", value: verificationHistory.length.toString(), icon: Eye },
    {
      label: "Successful",
      value: verificationHistory.filter((e) => e.status === "success").length.toString(),
      icon: CheckCircle2,
    },
    { label: "This Month", value: monthlyVerifications.toString(), icon: TrendingUp },
    { label: "Unique Verifiers", value: uniqueVerifiers.toString(), icon: Building2 },
  ]

  if (!isConnected) {
    return (
      <div className="container px-4 py-16 mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to view verification history.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 py-8 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Verification History
          </h1>
          <p className="text-muted-foreground mb-4">
            Track who has verified your certificates and when
          </p>
          
          {verificationHistory.length === 0 && (
            <Alert className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>No Verifications Yet:</strong> Verifications of your certificates will appear here. 
                Each time someone verifies your certificates using the Verifier Portal, it gets tracked and displayed here.
              </AlertDescription>
            </Alert>
          )}

          {verificationHistory.length > 0 && (
            <Alert className="mb-8" variant="default">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Live Data:</strong> Showing {verificationHistory.length} verification{verificationHistory.length !== 1 ? "s" : ""} of your certificates. 
                These are real verifications tracked in localStorage when verifiers check your certificates.
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Card>
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
                </motion.div>
              )
            })}
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Search by certificate or verifier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Select value={filterCertificate} onValueChange={setFilterCertificate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Certificates</SelectItem>
                    <SelectItem value="0x1234...5678">Bachelor of Science - MIT</SelectItem>
                    <SelectItem value="0xabcd...ef01">
                      Master of Science - Stanford
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Successful</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Timeline</CardTitle>
              <CardDescription>Chronological list of all verifications</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredHistory.length > 0 ? (
                <div className="space-y-4">
                  {filteredHistory.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="border-l-4 border-primary/30 pl-6 pb-6 relative"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background" />

                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{event.verifierName}</h4>
                            <Badge variant={event.status === "success" ? "default" : "destructive"}>
                              {event.status === "success" ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Verified
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Failed
                                </>
                              )}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                            <Award className="w-3 h-3" />
                            <span>{event.certificateName}</span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {event.timestamp.toLocaleString()}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground mt-2">
                            Verifier: <code>{event.verifier}</code>
                          </p>
                        </div>

                        <Eye className="w-5 h-5 text-muted-foreground ml-4" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No Verification History</h3>
                  <p>
                    {searchQuery || filterCertificate !== "all" || filterStatus !== "all"
                      ? "No verifications match your filters."
                      : "Your certificates haven't been verified yet."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Understanding Verification History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Every verification is logged:</strong> When someone verifies your
                certificate, it's recorded on the blockchain
              </p>
              <p>
                <strong>Privacy:</strong> Only the verifier's wallet address is logged, not personal
                information
              </p>
              <p>
                <strong>Immutable:</strong> Verification history cannot be altered or deleted
              </p>
              <p>
                <strong>Analytics:</strong> Track which certificates are most verified and by whom
              </p>
              <p className="text-xs mt-4">
                💡 Share separate links with different employers to identify who verified your
                certificates
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
