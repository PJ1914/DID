"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi"
import { FileText, Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CertificateHashRegistryABI } from "@/contracts/abis/bc-cvs"
import { getContractAddress } from "@/contracts/addresses"
import { saveActivity } from "@/lib/activityTracker"
import { uploadCertificatePDF, uploadCertificateImage } from "@/lib/firebase/storage"
import { useRoles } from "@/hooks/useRoles"
import { analyzeCertificateFile, type FraudCheckResult } from "@/lib/aiFraudDetection"
import * as crypto from "crypto"

export default function IssueCertificatePage() {
  const { address, isConnected, chain } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  const { isIssuer, isIssuerOnChain, isLoadingRoles } = useRoles()

  const isSupportedChain = chain?.id === 11155111 || chain?.id === 31337 || chain?.id === 1337
  const publicClient = usePublicClient()

  // Check if contracts are deployed
  const registryAddress = isSupportedChain && chain?.id
    ? getContractAddress(chain.id as 11155111 | 31337 | 1337, "certificateHashRegistry")
    : "0x"
  const contractsDeployed = registryAddress && registryAddress !== "0x" && registryAddress !== "0x0000000000000000000000000000000000000000"

  const [formData, setFormData] = useState({
    holderAddress: "",
    metadata: "",
    certificateFile: null as File | null,
    rsaPrivateKey: "",
    rsaPublicKey: "",
  })

  const [generatedHash, setGeneratedHash] = useState<string>("")
  const [generatedSignature, setGeneratedSignature] = useState<string>("")
  const [step, setStep] = useState(1) // 1: Upload, 2: Generate Hash/Sign, 3: Submit
  const [isUploadingToFirebase, setIsUploadingToFirebase] = useState(false)
  const [firebaseUploadSuccess, setFirebaseUploadSuccess] = useState(false)
  const [fraudResult, setFraudResult] = useState<FraudCheckResult | null>(null)
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false)
  const [allowSuspiciousIssue, setAllowSuspiciousIssue] = useState(false)


  // Save activity when certificate is issued
  useEffect(() => {
    if (isSuccess && address && formData.holderAddress && formData.metadata) {
      saveActivity(
        address,
        "issued",
        formData.holderAddress,
        formData.metadata || "Certificate issued",
        generatedHash
      )
      
      // Reset form after successful issuance
      setTimeout(() => {
        setFormData({
          holderAddress: "",
          metadata: "",
          certificateFile: null,
          rsaPrivateKey: "",
          rsaPublicKey: "",
        })
        setGeneratedHash("")
        setGeneratedSignature("")
        setStep(1)
      }, 3000) // Reset after 3 seconds to show success message
    }
  }, [isSuccess, address, formData, generatedHash])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, certificateFile: file })
      setAllowSuspiciousIssue(false)

      setIsAnalyzingFile(true)
      analyzeCertificateFile(file)
        .then((result) => {
          setFraudResult(result)
          if (result.hash) {
            setGeneratedHash(result.hash)
          }
        })
        .catch((err) => {
          console.error("AI fraud check failed:", err)
          setFraudResult(null)
        })
        .finally(() => {
          setIsAnalyzingFile(false)
        })

      // Auto-generate hash from file
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        const hash = crypto.createHash("sha256").update(content).digest("hex")
        setGeneratedHash(`0x${hash}`)
      }
      reader.readAsText(file)
    }
  }

  const generateRSAKeys = () => {
    // In production, this should use proper RSA key generation
    // For now, generate mock keys for demonstration
    const mockPublicKey = `0x${crypto.randomBytes(128).toString("hex")}`
    const mockPrivateKey = `0x${crypto.randomBytes(128).toString("hex")}`
    setFormData({
      ...formData,
      rsaPublicKey: mockPublicKey,
      rsaPrivateKey: mockPrivateKey,
    })
  }

  const generateSignature = () => {
    if (!generatedHash || !formData.rsaPrivateKey) {
      alert("Please upload certificate and generate keys first")
      return
    }
    // In production, use actual RSA signing
    // For now, generate mock signature
    const mockSignature = `0x${crypto.randomBytes(256).toString("hex")}`
    setGeneratedSignature(mockSignature)
    // Removed auto-advance to step 3 - user needs to click Next button
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!address || !chain?.id) {
      alert("Please connect your wallet")
      return
    }

    // Note: Blockchain transactions require Sepolia or Localhost network
    // Temporarily disabled for Firebase-based development
    // if (chain.id !== 11155111 && chain.id !== 31337) {
    //   alert("Please switch to Sepolia Testnet or Localhost")
    //   return
    // }

    if (!generatedHash || !generatedSignature || !formData.holderAddress) {
      alert("Please complete all steps")
      return
    }

    if (fraudResult?.status === "suspicious" && !allowSuspiciousIssue) {
      alert("AI scan marked this certificate as suspicious. Review indicators and confirm override before issuing.")
      return
    }

    // Check if contracts are deployed
    if (!contractsDeployed) {
      alert("⚠️ Smart Contracts Not Deployed!\n\nThe BC-CVS contracts haven't been deployed to your local blockchain yet.\n\nFor now, this is a UI demo. To enable blockchain functionality:\n1. Deploy contracts using: forge script script/deploy/DeployEduCertCoreContracts.s.sol --broadcast\n2. Update contract addresses in frontend/.env")
      return
    }

    // Upload certificate file to Firebase Storage first
    if (formData.certificateFile) {
      try {
        setIsUploadingToFirebase(true)
        const certificateHash = generatedHash.replace('0x', '')
        
        if (formData.certificateFile.type === 'application/pdf') {
          await uploadCertificatePDF(formData.certificateFile, certificateHash)
        } else {
          await uploadCertificateImage(formData.certificateFile, certificateHash)
        }
        
        setFirebaseUploadSuccess(true)
        console.log("✅ Certificate uploaded to Firebase Storage")
      } catch (uploadError) {
        console.error("Error uploading to Firebase:", uploadError)
        alert("Failed to upload certificate file to storage. Please try again.")
        setIsUploadingToFirebase(false)
        return
      } finally {
        setIsUploadingToFirebase(false)
      }
    }

    try {
      writeContract({
        address: registryAddress,
        abi: CertificateHashRegistryABI,
        functionName: "issueCertificate",
        args: [
          generatedHash as `0x${string}`,
          generatedSignature as `0x${string}`,
          formData.holderAddress as `0x${string}`,
          formData.metadata,
        ],
      })
    } catch (err) {
      console.error("Error issuing certificate:", err)
    }
  }

  if (!isConnected) {
    return (
      <div className="container px-4 py-16 mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to issue certificates.
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
            Please switch to Sepolia testnet (chain ID 11155111) to issue certificates.
            Current chain: {chain?.id || "Unknown"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!contractsDeployed) {
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

  if (isLoadingRoles) {
    return (
      <div className="container px-4 py-16 mx-auto text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Checking authorization...</p>
      </div>
    )
  }

  if (!isIssuer) {
    return (
      <div className="container px-4 py-16 mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">⛔ Unauthorized Access</p>
            <p className="mb-2">Your account does not have the Certificate Issuer role.</p>
            <p className="text-sm">Connected account: {address}</p>
            <p className="text-sm mt-2">Register as an Educational Institution or contact the administrator.</p>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!isIssuerOnChain) {
    return (
      <div className="container px-4 py-16 mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">⛔ On-chain issuer authorization missing</p>
            <p className="mb-2">Your account is recognized in app data, but this wallet cannot issue certificates on the deployed Sepolia contract.</p>
            <p className="text-sm">Connected account: {address}</p>
            <p className="text-sm mt-2">Ask the contract administrator to grant both the Certificate Issuer role and issuer authorization on-chain.</p>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Note: Blockchain features require Sepolia or Localhost network
  // For now, pages are accessible regardless of network

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 py-8 mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Issue Certificate
          </h1>
          <p className="text-muted-foreground mb-8">
            Create and issue a new certificate with SHA-256 hashing and RSA signatures
          </p>

          {/* Contract Deployment Warning */}
          {isConnected && !contractsDeployed && (
            <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-200">
                <strong>Smart Contracts Not Deployed</strong>
                <br />
                The BC-CVS contracts haven't been deployed to chain ID {chain?.id} yet. 
                This is a UI demo. To enable blockchain functionality, deploy contracts using Foundry.
              </AlertDescription>
            </Alert>
          )}

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[
              { num: 1, label: "Upload Certificate" },
              { num: 2, label: "Generate Signature" },
              { num: 3, label: "Submit to Blockchain" },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step >= s.num
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > s.num ? <CheckCircle2 className="w-6 h-6" /> : s.num}
                  </div>
                  <span className="text-sm mt-2 text-muted-foreground">{s.label}</span>
                </div>
                {idx < 2 && (
                  <div className={`h-1 flex-1 ${step > s.num ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Certificate Details</CardTitle>
                <CardDescription>
                  Fill in the required information to issue a certificate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Upload Certificate */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="certificate-file">Certificate File (PDF/JSON)</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="certificate-file"
                        type="file"
                        accept=".pdf,.json,.txt"
                        onChange={handleFileUpload}
                        className="flex-1"
                      />
                      {formData.certificateFile && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>

                  {generatedHash && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        <strong>SHA-256 Hash Generated:</strong>
                        <code className="block text-xs mt-1 bg-muted p-2 rounded overflow-x-auto">
                          {generatedHash}
                        </code>
                      </AlertDescription>
                    </Alert>
                  )}

                  {(isAnalyzingFile || fraudResult) && (
                    <Alert className={fraudResult?.status === "suspicious" ? "border-yellow-500/60 bg-yellow-500/10" : ""}>
                      {isAnalyzingFile ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
                      <AlertDescription>
                        {isAnalyzingFile ? (
                          <span>AI Fake Detection: analyzing uploaded file...</span>
                        ) : (
                          <div>
                            <p className="font-semibold mb-1">
                              AI Fake Detection: {fraudResult?.status === "authentic" ? "Authentic" : "Suspicious"}
                              {fraudResult ? ` (confidence ${fraudResult.confidence}%)` : ""}
                            </p>
                            {fraudResult?.reasons?.length ? (
                              <ul className="text-xs list-disc ml-4 space-y-1">
                                {fraudResult.reasons.slice(0, 4).map((reason, idx) => (
                                  <li key={idx}>{reason}</li>
                                ))}
                              </ul>
                            ) : null}
                            {fraudResult?.status === "suspicious" && (
                              <label className="mt-2 flex items-center gap-2 text-xs">
                                <input
                                  type="checkbox"
                                  checked={allowSuspiciousIssue}
                                  onChange={(e) => setAllowSuspiciousIssue(e.target.checked)}
                                />
                                I reviewed this warning and still want to issue.
                              </label>
                            )}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="holder">Certificate Holder Address</Label>
                    <Input
                      id="holder"
                      placeholder="0x..."
                      value={formData.holderAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, holderAddress: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metadata">Certificate Metadata</Label>
                    <Textarea
                      id="metadata"
                      placeholder="Bachelor of Science in Computer Science - Class of 2024"
                      value={formData.metadata}
                      onChange={(e) =>
                        setFormData({ ...formData, metadata: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  {/* Step 1 Navigation */}
                  {step === 1 && (
                    <div className="flex justify-end pt-4">
                      <Button
                        type="button"
                        onClick={() => {
                          if (!formData.certificateFile) {
                            alert("Please upload a certificate file")
                            return
                          }
                          if (!formData.holderAddress) {
                            alert("Please enter holder address")
                            return
                          }
                          if (!generatedHash) {
                            alert("Hash generation failed. Please re-upload the file.")
                            return
                          }
                          setStep(2)
                        }}
                      >
                        Next: Generate Signature
                      </Button>
                    </div>
                  )}
                </div>

                {/* Step 2: Generate Keys & Signature */}
                {step >= 2 && (
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      RSA Key Generation & Signing
                    </h3>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateRSAKeys}
                      disabled={!formData.certificateFile}
                    >
                      {formData.rsaPublicKey ? "Regenerate" : "Generate"} RSA Key Pair
                    </Button>

                    {formData.rsaPublicKey && (
                      <div className="space-y-2">
                        <Alert>
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Public Key Generated (256 bytes)</strong>
                          </AlertDescription>
                        </Alert>

                        <Button
                          type="button"
                          onClick={generateSignature}
                          disabled={!formData.rsaPrivateKey}
                        >
                          Generate RSA Signature
                        </Button>
                      </div>
                    )}

                    {generatedSignature && (
                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                          <strong>RSA Signature Generated (512 bytes)</strong>
                          <code className="block text-xs mt-1 bg-muted p-2 rounded overflow-x-auto">
                            {generatedSignature.substring(0, 66)}...
                          </code>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Step 2 Navigation */}
                    {step === 2 && (
                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(1)}
                        >
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            if (!generatedSignature) {
                              alert("Please generate RSA signature first")
                              return
                            }
                            setStep(3)
                          }}
                        >
                          Next: Submit to Blockchain
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Submit */}
                {step >= 3 && (
                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(2)}
                      >
                        Back
                      </Button>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isPending || isConfirming}
                    >
                      {isPending || isConfirming ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isPending ? "Preparing..." : "Confirming..."}
                        </>
                      ) : (
                        "Issue Certificate to Blockchain"
                      )}
                    </Button>
                  </div>
                )}

                {/* Transaction Status */}
                {hash && (
                  <Alert>
                    <AlertDescription>
                      Transaction Hash: <code className="text-xs">{hash}</code>
                    </AlertDescription>
                  </Alert>
                )}

                {isSuccess && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      ✅ Certificate issued successfully! It is now stored on-chain and verifiable.
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Error: {error.message}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </form>

          {/* Info Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>1. <strong>Upload:</strong> Upload the certificate file (PDF/JSON/TXT)</p>
              <p>2. <strong>Hash:</strong> System generates SHA-256 hash automatically</p>
              <p>3. <strong>Sign:</strong> Generate RSA key pair and sign the hash</p>
              <p>4. <strong>Submit:</strong> Certificate is stored on blockchain with Bloom filter optimization</p>
              <p className="text-xs mt-4">
                ⚠️ Note: In production, RSA keys should be generated offline and stored securely in HSM/KMS
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
