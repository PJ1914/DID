"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAccount, usePublicClient } from "wagmi"
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CertificateHashRegistryABI, RevocationRegistryABI } from "@/contracts/abis/bc-cvs"
import { getContractAddress } from "@/contracts/addresses"
import { saveVerification } from "@/lib/verificationHistory"
import { pushVerificationNotification } from "@/lib/notifications"

interface BulkVerificationResult {
  hash: string
  holderName: string
  issuer: string
  status: "valid" | "invalid" | "revoked" | "not-found"
  metadata: string
}

export default function BulkVerificationPage() {
  const { address, isConnected, chain } = useAccount()
  const publicClient = usePublicClient()
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<BulkVerificationResult[]>([])

  const isSupportedChain = chain?.id === 11155111 || chain?.id === 31337 || chain?.id === 1337
  const registryAddress = (isSupportedChain && chain?.id
    ? getContractAddress(chain.id as 11155111 | 31337 | 1337, "certificateHashRegistry")
    : "0x0000000000000000000000000000000000000000") as `0x${string}`

  const revocationAddress = (isSupportedChain && chain?.id
    ? getContractAddress(chain.id as 11155111 | 31337 | 1337, "revocationRegistry")
    : "0x0000000000000000000000000000000000000000") as `0x${string}`

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0])
      setResults([])
      setProgress(0)
    }
  }

  const processBulkVerification = async () => {
    if (!csvFile || !publicClient) return

    setIsProcessing(true)
    setProgress(0)
    setResults([])

    try {
      // Read CSV file
      const text = await csvFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      // Parse CSV (expecting format: hash or hash,holderName)
      const hashes: Array<{hash: string, holderName?: string}> = []
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line || i === 0 && line.toLowerCase().includes('hash')) continue // Skip header
        
        const parts = line.split(',')
        const hash = parts[0].trim()
        const holderName = parts[1]?.trim()
        
        if (hash && (hash.startsWith('0x') || hash.length === 64 || hash.length === 66)) {
          hashes.push({ 
            hash: hash.startsWith('0x') ? hash : `0x${hash}`, 
            holderName 
          })
        }
      }

      if (hashes.length === 0) {
        alert('No valid hashes found in CSV file. Expected format: hash or hash,holderName')
        setIsProcessing(false)
        return
      }

      // Verify each certificate
      for (let i = 0; i < hashes.length; i++) {
        const { hash, holderName } = hashes[i]
        
        try {
          // Check if certificate exists
          const exists = await publicClient.readContract({
            address: registryAddress,
            abi: CertificateHashRegistryABI,
            functionName: 'certificateExists',
            args: [hash as `0x${string}`],
          })

          if (!exists) {
            const result: BulkVerificationResult = {
              hash,
              holderName: holderName || 'Unknown',
              issuer: 'Unknown',
              status: 'not-found',
              metadata: 'N/A',
            }
            setResults(prev => [...prev, result])
            
            // Save to history
            saveVerification({
              certificateHash: hash,
              holder: holderName || 'Unknown',
              issuer: 'Unknown',
              metadata: 'N/A',
              status: 'not-found',
              verificationMethod: 'bulk',
            })
            
            setProgress(((i + 1) / hashes.length) * 100)
            continue
          }

          // Get certificate details
          const certData = await publicClient.readContract({
            address: registryAddress,
            abi: CertificateHashRegistryABI,
            functionName: 'getCertificate',
            args: [hash as `0x${string}`],
          }) as any

          // Check revocation
          let isRevoked = false
          try {
            if (revocationAddress && revocationAddress !== "0x0000000000000000000000000000000000000000") {
              isRevoked = await publicClient.readContract({
                address: revocationAddress,
                abi: RevocationRegistryABI,
                functionName: 'isRevoked',
                args: [hash as `0x${string}`],
              }) as boolean
            }
          } catch (err) {
            console.warn('Could not check revocation:', err)
          }

          const status: "valid" | "invalid" | "revoked" | "not-found" = 
            isRevoked ? 'revoked' : (certData.isValid ? 'valid' : 'invalid')

          const result: BulkVerificationResult = {
            hash,
            holderName: holderName || certData.holder,
            issuer: certData.issuer,
            status,
            metadata: certData.metadata,
          }
          
          setResults(prev => [...prev, result])
          
          // Save to history
          saveVerification({
            certificateHash: hash,
            holder: certData.holder,
            issuer: certData.issuer,
            metadata: certData.metadata,
            status,
            verificationMethod: 'bulk',
            issuedAt: new Date(Number(certData.issueDate) * 1000).toISOString(),
          })

          await pushVerificationNotification({
            studentWallet: certData.holder,
            certificateHash: hash,
            verifierWallet: address || "anonymous",
            issuerWallet: certData.issuer,
            status,
            metadata: certData.metadata,
          })

        } catch (error) {
          console.error(`Error verifying ${hash}:`, error)
          const result: BulkVerificationResult = {
            hash,
            holderName: holderName || 'Unknown',
            issuer: 'Error',
            status: 'invalid',
            metadata: 'Verification failed',
          }
          setResults(prev => [...prev, result])
        }
        
        setProgress(((i + 1) / hashes.length) * 100)
      }

    } catch (error) {
      console.error('Bulk verification error:', error)
      alert('Failed to process CSV file: ' + (error as Error).message)
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadResults = () => {
    const csv = [
      ["Hash", "Holder", "Issuer", "Status", "Metadata"].join(","),
      ...results.map((r) =>
        [r.hash, r.holderName, r.issuer, r.status, r.metadata].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `verification-results-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

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
      case "not-found":
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            Not Found
          </Badge>
        )
      default:
        return null
    }
  }

  const stats = results.length > 0 && {
    total: results.length,
    valid: results.filter((r) => r.status === "valid").length,
    invalid: results.filter((r) => r.status === "invalid").length,
    revoked: results.filter((r) => r.status === "revoked").length,
    notFound: results.filter((r) => r.status === "not-found").length,
  }

  if (!isConnected) {
    return (
      <div className="container px-4 py-16 mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to access bulk verification.
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
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Bulk Verification
          </h1>
          <p className="text-muted-foreground mb-8">
            Verify multiple certificates simultaneously using CSV upload
          </p>

          {/* Upload Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Step 1: Upload CSV File</CardTitle>
              <CardDescription>
                Upload a CSV file with certificate hashes (format: hash, holder_name)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
                {csvFile && (
                  <div className="mt-3 p-3 bg-muted rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{csvFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(csvFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    {!isProcessing && (
                      <Button onClick={() => setCsvFile(null)} variant="ghost" size="sm">
                        Remove
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={processBulkVerification}
                disabled={!csvFile || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Start Bulk Verification
                  </>
                )}
              </Button>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
            >
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold text-green-500">{stats.valid}</p>
                  <p className="text-xs text-muted-foreground">Valid</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold text-red-500">{stats.invalid}</p>
                  <p className="text-xs text-muted-foreground">Invalid</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold text-orange-500">{stats.revoked}</p>
                  <p className="text-xs text-muted-foreground">Revoked</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold text-gray-500">{stats.notFound}</p>
                  <p className="text-xs text-muted-foreground">Not Found</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Results Table */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Verification Results</CardTitle>
                    <CardDescription>Review all verification outcomes</CardDescription>
                  </div>
                  <Button onClick={downloadResults} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hash</TableHead>
                        <TableHead>Holder</TableHead>
                        <TableHead>Issuer</TableHead>
                        <TableHead>Metadata</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <code className="text-xs">{result.hash}</code>
                          </TableCell>
                          <TableCell>{result.holderName}</TableCell>
                          <TableCell>{result.issuer}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {result.metadata}
                          </TableCell>
                          <TableCell>{getStatusBadge(result.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CSV Format Guide */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">CSV Format Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-semibold mb-2">Required Format:</p>
                <div className="bg-muted p-3 rounded-lg font-mono text-xs">
                  hash,holder_name
                  <br />
                  0x1234567890...,John Doe
                  <br />
                  0xabcdefabcd...,Jane Smith
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• First row must be column headers</p>
                <p>• Hash must be a valid 64-character hex string</p>
                <p>• Holder name is optional but recommended</p>
                <p>• Maximum 1000 certificates per batch</p>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Download our sample CSV template to get started quickly
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
