"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAccount } from "wagmi"
import {
  History,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  Eye,
  Award,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getVerificationHistory, clearVerificationHistory, type VerificationRecord } from "@/lib/verificationHistory"

export default function VerifierHistoryPage() {
  const { address, isConnected } = useAccount()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterMethod, setFilterMethod] = useState("all")
  const [history, setHistory] = useState<VerificationRecord[]>([])

  // Load history from localStorage on mount
  useEffect(() => {
    setHistory(getVerificationHistory())
  }, [])

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all verification history?')) {
      clearVerificationHistory()
      setHistory([])
    }
  }

  const filteredHistory = history.filter((record) => {
    const matchesSearch =
      record.holder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.metadata.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === "all" || record.status === filterStatus
    const matchesMethod = filterMethod === "all" || record.verificationMethod === filterMethod

    return matchesSearch && matchesStatus && matchesMethod
  })

  const stats = [
    {
      label: "Total Verifications",
      value: history.length.toString(),
      icon: Eye,
      color: "text-blue-500",
    },
    {
      label: "Valid",
      value: history.filter((r) => r.status === "valid").length.toString(),
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      label: "Invalid/Revoked",
      value: history.filter((r) => r.status === "invalid" || r.status === "revoked" || r.status === "not-found").length.toString(),
      icon: XCircle,
      color: "text-red-500",
    },
    {
      label: "Bulk Verifications",
      value: history.filter((r) => r.verificationMethod === "bulk").length.toString(),
      icon: History,
      color: "text-purple-500",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Valid
          </Badge>
        )
      case "invalid":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Invalid
          </Badge>
        )
      case "revoked":
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Revoked
          </Badge>
        )
      default:
        return null
    }
  }

  const downloadHistory = () => {
    const csv = [
      ["Timestamp", "Holder", "Issuer", "Certificate", "Status", "Method"].join(","),
      ...filteredHistory.map((r) =>
        [
          r.timestamp,
          r.holder,
          r.issuer,
          r.metadata,
          r.status,
          r.verificationMethod,
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `verification-history-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Verification History
              </h1>
              <p className="text-muted-foreground">
                View all your certificate verification activities
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={downloadHistory} variant="outline" disabled={history.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={handleClearHistory} variant="destructive" disabled={history.length === 0}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear History
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </CardTitle>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
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
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Search by holder, issuer, or certificate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="valid">Valid Only</SelectItem>
                    <SelectItem value="invalid">Invalid Only</SelectItem>
                    <SelectItem value="revoked">Revoked Only</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterMethod} onValueChange={setFilterMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="single">Single Verification</SelectItem>
                    <SelectItem value="bulk">Bulk Verification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* History List */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Timeline</CardTitle>
              <CardDescription>Chronological list of all verifications</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredHistory.length > 0 ? (
                <div className="space-y-4">
                  {filteredHistory.map((record, index) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="font-semibold">{record.holder}</h4>
                            {getStatusBadge(record.status)}
                            <Badge variant="outline" className="text-xs">
                              {record.verificationMethod}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-2">
                              <Award className="w-3 h-3" />
                              <span>{record.metadata}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(record.timestamp).toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                              Issuer: <span className="font-medium">{record.issuer}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Hash: <code>{record.certificateHash}</code>
                            </p>
                          </div>
                        </div>

                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No History Found</h3>
                  <p>
                    {searchQuery || filterStatus !== "all" || filterMethod !== "all"
                      ? "No verifications match your filters."
                      : "You haven't verified any certificates yet."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">About Verification History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Immutable Records:</strong> All verifications are stored on-chain and cannot
                be altered
              </p>
              <p>
                <strong>Compliance:</strong> Export verification history for audit and compliance
                purposes
              </p>
              <p>
                <strong>Analytics:</strong> Track verification patterns and identify trends
              </p>
              <p>
                <strong>Privacy:</strong> Only you can access your verification history
              </p>
              <p className="text-xs mt-4">
                💡 Use filters to analyze specific types of verifications or time periods
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
