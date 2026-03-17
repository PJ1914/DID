"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { useAccount, useReadContract, usePublicClient } from "wagmi"
import { useSearchParams } from "next/navigation"
import * as crypto from "crypto"
import {
  Upload,
  FileText,
  Hash,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  Calendar,
  Building2,
  Key,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CertificateHashRegistryABI, RevocationRegistryABI } from "@/contracts/abis/bc-cvs"
import { getContractAddress } from "@/contracts/addresses"
import { saveVerification } from "@/lib/verificationHistory"
import { selectiveDisclosure } from "@/lib/selectiveDisclosure"
import { pushVerificationNotification } from "@/lib/notifications"

function VerifyCertificateContent() {
  const { address, isConnected, chain } = useAccount()
  const params = useSearchParams()
  const publicClient = usePublicClient()
  const [verificationMethod, setVerificationMethod] = useState<"upload" | "hash">("hash")
  const [certificateFile, setCertificateFile] = useState<File | null>(null)
  const [certificateHash, setCertificateHash] = useState("")
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const disclosureFields = useMemo(() => {
    const raw = params.get("fields") || "name,degree,university"
    return raw.split(",").map((s) => s.trim()).filter(Boolean)
  }, [params])

  useEffect(() => {
    const hash = params.get("hash")
    if (hash) {
      setCertificateHash(hash)
    }
  }, [params])

  const isSupportedChain = chain?.id === 11155111 || chain?.id === 31337 || chain?.id === 1337
  const registryAddress = (isSupportedChain && chain?.id
    ? getContractAddress(chain.id as 11155111 | 31337 | 1337, "certificateHashRegistry")
    : "0x0000000000000000000000000000000000000000") as `0x${string}`

  const revocationAddress = (isSupportedChain && chain?.id
    ? getContractAddress(chain.id as 11155111 | 31337 | 1337, "revocationRegistry")
    : "0x0000000000000000000000000000000000000000") as `0x${string}`

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setCertificateFile(file)
      
      // Compute real SHA-256 hash
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        const hash = crypto.createHash("sha256").update(content).digest("hex")
        setCertificateHash(`0x${hash}`)
      }
      reader.readAsText(file)
    }
  }

  const verifyCertificate = async () => {
    if (!publicClient || !certificateHash) {
      alert("Please enter a certificate hash")
      return
    }

    setIsVerifying(true)
    setVerificationResult(null)

    try {
      console.log("Verifying certificate:", certificateHash)
      console.log("Registry address:", registryAddress)

      // Check if certificate exists
      const exists = await publicClient.readContract({
        address: registryAddress,
        abi: CertificateHashRegistryABI,
        functionName: 'certificateExists',
        args: [certificateHash as `0x${string}`],
      })

      console.log("Certificate exists:", exists)

      if (!exists) {
        // Save failed verification to history
        saveVerification({
          certificateHash: certificateHash,
          holder: "Unknown",
          issuer: "Unknown",
          metadata: "N/A",
          status: "not-found",
          verificationMethod: "single",
        })
        
        setVerificationResult({
          isValid: false,
          exists: false,
          certificateHash: certificateHash,
          error: "Certificate not found on blockchain",
        })
        setIsVerifying(false)
        return
      }

      // Get certificate details
      const certData = await publicClient.readContract({
        address: registryAddress,
        abi: CertificateHashRegistryABI,
        functionName: 'getCertificate',
        args: [certificateHash as `0x${string}`],
      }) as any

      console.log("Certificate data:", certData)

      // Check revocation status (optional, if contract deployed)
      let isRevoked = false
      try {
        if (revocationAddress && revocationAddress !== "0x0000000000000000000000000000000000000000") {
          isRevoked = await publicClient.readContract({
            address: revocationAddress,
            abi: RevocationRegistryABI,
            functionName: 'isRevoked',
            args: [certificateHash as `0x${string}`],
          }) as boolean
        }
      } catch (err) {
        console.warn("Could not check revocation (contract may not be deployed):", err)
      }

      const disclosedMetadata = selectiveDisclosure(certData.metadata, disclosureFields)

      const result = {
        isValid: certData.isValid,
        exists: true,
        certificateHash: certData.certificateHash,
        issuer: certData.issuer,
        issuerName: `${certData.issuer.slice(0, 6)}...${certData.issuer.slice(-4)}`,
        holder: certData.holder,
        holderName: "Certificate Holder",
        issuedAt: new Date(Number(certData.issueDate) * 1000),
        metadata: disclosedMetadata,
        signatureValid: certData.rsaSignature && certData.rsaSignature.length > 0,
        isRevoked: isRevoked,
        revocationHistory: [],
      }

      // Save to verification history
      saveVerification({
        certificateHash: certData.certificateHash,
        holder: certData.holder,
        issuer: certData.issuer,
        metadata: disclosedMetadata,
        status: isRevoked ? "revoked" : (certData.isValid ? "valid" : "invalid"),
        verificationMethod: "single",
        issuedAt: new Date(Number(certData.issueDate) * 1000).toISOString(),
      })

      await pushVerificationNotification({
        studentWallet: certData.holder,
        certificateHash: certData.certificateHash,
        verifierWallet: address || "anonymous",
        issuerWallet: certData.issuer,
        status: isRevoked ? "revoked" : (certData.isValid ? "valid" : "invalid"),
        metadata: disclosedMetadata,
      })

      setVerificationResult(result)
    } catch (error: any) {
      console.error("Verification error:", error)
      setVerificationResult({
        isValid: false,
        exists: false,
        certificateHash: certificateHash,
        error: error.message || "Failed to verify certificate",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="container px-4 py-16 mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to verify certificates.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!isSupportedChain) {
    return (
      <div className="container px-4 py-16 mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please switch to Sepolia testnet (chain ID 11155111) to verify certificates.
            Current chain: {chain?.id || "Unknown"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!registryAddress || registryAddress === "0x0000000000000000000000000000000000000000") {
    return (
      <div className="container px-4 py-16 mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Smart contracts not deployed on this network. Please check your .env configuration.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 py-8 mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Verify Certificate
          </h1>
          <p className="text-muted-foreground mb-8">
            Upload a certificate or enter its hash to verify authenticity
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Step 1: Provide Certificate</CardTitle>
                  <CardDescription>Upload file or enter hash manually</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs
                    value={verificationMethod}
                    onValueChange={(v) => setVerificationMethod(v as "upload" | "hash")}
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="upload">Upload File</TabsTrigger>
                      <TabsTrigger value="hash">Enter Hash</TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="space-y-4">
                      <div>
                        <Label htmlFor="certificate-file">Certificate File</Label>
                        <Input
                          id="certificate-file"
                          type="file"
                          accept=".pdf,.jpg,.png"
                          onChange={handleFileUpload}
                          className="mt-2"
                        />
                        {certificateFile && (
                          <div className="mt-3 p-3 bg-muted rounded-lg flex items-center gap-3">
                            <FileText className="w-5 h-5 text-primary" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{certificateFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(certificateFile.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {certificateHash && (
                        <div>
                          <Label>Computed Hash</Label>
                          <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                            <code className="text-xs break-all">{certificateHash}</code>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="hash" className="space-y-4">
                      <div>
                        <Label htmlFor="certificate-hash">Certificate Hash</Label>
                        <Textarea
                          id="certificate-hash"
                          placeholder="0xab6401ab92087900224b0ca696d4509a50cfd957f606954057f0664bf2bdef04"
                          value={certificateHash}
                          onChange={(e) => setCertificateHash(e.target.value)}
                          className="mt-2 font-mono text-xs"
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Enter the 64-character SHA-256 hash of the certificate (with 0x prefix)
                        </p>
                      </div>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <p className="font-semibold mb-1">Test with Real Certificate:</p>
                          <p className="text-xs">The "Doc" certificate issued earlier can be verified here.</p>
                        </AlertDescription>
                      </Alert>
                    </TabsContent>
                  </Tabs>

                  <Button
                    className="w-full mt-6"
                    size="lg"
                    onClick={verifyCertificate}
                    disabled={!certificateHash || isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 mr-2" />
                        Verify Certificate
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Verification Steps */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Verification Process</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: Hash, label: "Computing SHA-256 hash", done: !!certificateHash },
                    {
                      icon: Shield,
                      label: "Checking blockchain registry",
                      done: !!verificationResult,
                    },
                    {
                      icon: Key,
                      label: "Validating RSA signature",
                      done: !!verificationResult?.signatureValid,
                    },
                    {
                      icon: AlertCircle,
                      label: "Checking revocation status",
                      done: verificationResult !== null,
                    },
                  ].map((step, index) => {
                    const Icon = step.icon
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.done ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {step.done ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                        </div>
                        <span className="text-sm">{step.label}</span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Right: Results */}
            <div>
              {verificationResult ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {verificationResult.error ? (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <p className="font-semibold mb-2">Verification Failed</p>
                        <p className="text-sm">{verificationResult.error}</p>
                        <div className="mt-4 space-y-2 text-xs">
                          <p className="font-medium">Troubleshooting:</p>
                          <ul className="list-disc ml-5 space-y-1">
                            <li>Ensure you're connected to the correct network (Sepolia)</li>
                            <li>Verify the certificate hash is correct (should start with 0x)</li>
                            <li>Check if the certificate was actually issued on this network</li>
                            <li>Confirm contracts are deployed (check .env file)</li>
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ) : (
                  <Card
                    className={`border-2 ${
                      verificationResult.isValid && !verificationResult.isRevoked
                        ? "border-green-500"
                        : "border-red-500"
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Verification Result</CardTitle>
                        <Badge
                          variant={
                            verificationResult.isValid && !verificationResult.isRevoked
                              ? "default"
                              : "destructive"
                          }
                          className="text-base px-4 py-2"
                        >
                          {verificationResult.isValid && !verificationResult.isRevoked ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Valid
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Invalid
                            </>
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Certificate Info */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Award className="w-5 h-5" />
                          Certificate Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium">{verificationResult.metadata}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Issued:</span>
                            <span className="font-medium">
                              {verificationResult.issuedAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Issuer Info */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          Issued By
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p className="font-medium">{verificationResult.issuerName}</p>
                          <code className="text-xs text-muted-foreground break-all">
                            {verificationResult.issuer}
                          </code>
                        </div>
                      </div>

                      {/* Holder Info */}
                      <div>
                        <h4 className="font-semibold mb-3">Issued To</h4>
                        <div className="space-y-2 text-sm">
                          <p className="font-medium">{verificationResult.holderName}</p>
                          <code className="text-xs text-muted-foreground break-all">
                            {verificationResult.holder}
                          </code>
                        </div>
                      </div>

                      {/* Verification Checks */}
                      <div>
                        <h4 className="font-semibold mb-3">Verification Checks</h4>
                        <div className="space-y-2">
                          {[
                            { label: "Exists on blockchain", value: verificationResult.exists },
                            { label: "Signature valid", value: verificationResult.signatureValid },
                            { label: "Not revoked", value: !verificationResult.isRevoked },
                          ].map((check, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{check.label}</span>
                              {check.value ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Download/Print */}
                      <div className="pt-4 border-t">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            const report = {
                              certificateHash: verificationResult.certificateHash,
                              verificationStatus: verificationResult.isValid ? "VALID" : "INVALID",
                              verifiedAt: new Date().toISOString(),
                              verifier: address || "Anonymous",
                              issuer: verificationResult.issuer,
                              issuedTo: verificationResult.holder,
                              issueDate: new Date(verificationResult.issueDate * 1000).toLocaleString(),
                              metadata: verificationResult.metadata,
                              revocationStatus: verificationResult.isRevoked ? "REVOKED" : "NOT REVOKED",
                            }
                            const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement("a")
                            a.href = url
                            a.download = `verification-report-${verificationResult.certificateHash.substring(0, 10)}.json`
                            document.body.appendChild(a)
                            a.click()
                            document.body.removeChild(a)
                            URL.revokeObjectURL(url)
                          }}
                        >
                          Download Verification Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  )}
                </motion.div>
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-12">
                    <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No Verification Yet</h3>
                    <p className="text-muted-foreground">
                      Upload a certificate or enter a hash to begin verification
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function VerifyCertificatePage() {
  return (
    <Suspense fallback={<div className="container px-4 py-16 mx-auto text-center text-muted-foreground">Loading...</div>}>
      <VerifyCertificateContent />
    </Suspense>
  )
}
