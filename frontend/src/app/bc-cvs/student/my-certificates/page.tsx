"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAccount, useReadContract, usePublicClient } from "wagmi"
import {
  Award,
  Download,
  Eye,
  Share2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Gem,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getCertificateDownloadURL } from "@/lib/firebase/storage"
import { CertificateHashRegistryABI } from "@/contracts/abis/bc-cvs"
import { getContractAddress } from "@/contracts/addresses"
import { isCertificateNFTMinted, mintCertificateNFT } from "@/lib/nftCertificates"

type Certificate = {
  hash: string
  issuer: string
  issuerAddress: string
  issuedAt: Date
  metadata: string
  isRevoked: boolean
}

export default function MyCertificatesPage() {
  const { address, isConnected, chain } = useAccount()
  const [searchQuery, setSearchQuery] = useState("")
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [nftRefreshTick, setNftRefreshTick] = useState(0)
  const publicClient = usePublicClient()

  const isSupportedChain = chain?.id === 11155111 || chain?.id === 31337 || chain?.id === 1337
  const registryAddress = (isSupportedChain && chain?.id
    ? getContractAddress(chain.id as 11155111 | 31337 | 1337, "certificateHashRegistry")
    : "0x0000000000000000000000000000000000000000") as `0x${string}`

  const isValidAddress = registryAddress && registryAddress !== "0x" && registryAddress !== "0x0000000000000000000000000000000000000000"

  // Read certificate hashes by holder
  const { data: certificateHashes, refetch, isLoading, error } = useReadContract({
    address: isValidAddress ? registryAddress : undefined,
    abi: CertificateHashRegistryABI,
    functionName: "getCertificatesByHolder",
    args: address && isValidAddress ? [address] : undefined,
    query: {
      enabled: Boolean(address && isValidAddress && isConnected && isSupportedChain),
    },
  })

  // Fetch certificate details whenever hashes change
  useEffect(() => {
    async function fetchCertificates() {
      console.log("Fetching certificates...", { certificateHashes, registryAddress, chain: chain?.id })
      
      if (!certificateHashes || !publicClient || !isValidAddress) {
        console.log("Cannot fetch: missing data", { hasHashes: !!certificateHashes, hasClient: !!publicClient, isValidAddress })
        setCertificates([])
        return
      }

      const hashes = certificateHashes as `0x${string}`[]
      if (hashes.length === 0) {
        setCertificates([])
        return
      }

      try {
        console.log(`Fetching ${hashes.length} certificates...`)
        const certDetails = await Promise.all(
          hashes.map(async (hash) => {
            const data = await publicClient.readContract({
              address: registryAddress,
              abi: CertificateHashRegistryABI,
              functionName: "getCertificate",
              args: [hash],
            }) as any

            console.log("Certificate data:", { hash, data })

            return {
              hash: data.certificateHash,
              issuer: `${data.issuer.slice(0, 6)}...${data.issuer.slice(-4)}`,
              issuerAddress: data.issuer,
              issuedAt: new Date(Number(data.issueDate) * 1000),
              metadata: data.metadata,
              isRevoked: !data.isValid,
            }
          })
        )

        console.log("Certificates fetched:", certDetails)
        setCertificates(certDetails)
      } catch (error) {
        console.error("Error fetching certificates:", error)
        setCertificates([])
      }
    }

    fetchCertificates()
  }, [certificateHashes, publicClient, registryAddress, isValidAddress])

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.metadata.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.issuer.toLowerCase().includes(searchQuery.toLowerCase())
  )

const downloadCertificate = async (certificateHash: string) => {
    try {
      // Fetch actual certificate file from Firebase Storage
      const cleanHash = certificateHash.replace('0x', '')
      const downloadURL = await getCertificateDownloadURL(cleanHash)
      
      // Open in new tab or download
      const a = document.createElement("a")
      a.href = downloadURL
      a.target = "_blank"
      a.download = `certificate-${certificateHash.substring(0, 10)}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      console.log("✅ Certificate downloaded from Firebase Storage")
    } catch (error) {
      console.error("Error downloading certificate:", error)
      alert("Certificate file not found in storage. It may not have been uploaded yet.")
    }
  }

  if (!isConnected) {
    return (
      <div className="container px-4 py-16 mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to view your certificates.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!isSupportedChain) {
    return (
      <div className="container px-4 py-16 mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please switch to Sepolia testnet (chain ID 11155111) to view your certificates.
            Current chain: {chain?.id || "Unknown"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!isValidAddress) {
    return (
      <div className="container px-4 py-16 mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Contract address not configured. Please check your .env file for NEXT_PUBLIC_CERTIFICATE_HASH_REGISTRY.
            Current address: {registryAddress}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container px-4 py-16 mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Loading certificates...
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container px-4 py-16 mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading certificates: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Note: Blockchain features require Sepolia or Localhost network
  // For now, pages are accessible regardless of network

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
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                My Certificates
              </h1>
              <p className="text-muted-foreground">
                View and manage all your issued certificates
              </p>
            </div>
            <Badge variant="default" className="text-lg px-4 py-2">
              {filteredCertificates.length} Certificate{filteredCertificates.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {/* Search Bar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <Input
                placeholder="Search certificates by name or institution..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xl"
              />
            </CardContent>
          </Card>

          {/* Certificates Grid */}
          {filteredCertificates.length > 0 ? (
            <div className="space-y-6">
              {filteredCertificates.map((cert, index) => (
                <motion.div
                  key={cert.hash}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <div className="flex">
                      {/* Left: Certificate Icon */}
                      <div className="w-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Award className="w-16 h-16 text-white" />
                      </div>

                      {/* Middle: Certificate Details */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold mb-1">{cert.metadata}</h3>
                            <p className="text-sm text-muted-foreground">
                              Issued by <strong>{cert.issuer}</strong>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              <code>{cert.issuerAddress}</code>
                            </p>
                          </div>
                          <Badge variant={cert.isRevoked ? "destructive" : "default"}>
                            {cert.isRevoked ? (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Revoked
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Valid
                              </>
                            )}
                          </Badge>
                          {isCertificateNFTMinted(cert.hash) && (
                            <Badge variant="secondary" className="ml-2">
                              <Gem className="w-3 h-3 mr-1" /> NFT Minted
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            <span>Issued: {cert.issuedAt.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span>0 verifications</span>
                          </div>
                        </div>

                        <div className="bg-muted/50 p-3 rounded-lg mb-4">
                          <p className="text-xs text-muted-foreground mb-1">Certificate Hash:</p>
                          <code className="text-xs break-all">{cert.hash}</code>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              (window.location.href = `/bc-cvs/student/share?cert=${cert.hash}`)
                            }
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadCertificate(cert.hash)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedCertificate(cert)
                              setShowDetailsModal(true)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const nft = mintCertificateNFT({
                                certificateHash: cert.hash,
                                holder: address || "",
                                issuer: cert.issuerAddress,
                                metadata: cert.metadata,
                                network: chain?.name || "sepolia",
                              })
                              alert(`NFT credential minted! Token ID: ${nft.tokenId}`)
                              setNftRefreshTick((v) => v + 1)
                            }}
                          >
                            <Gem className="w-4 h-4 mr-2" />
                            {isCertificateNFTMinted(cert.hash) ? "Minted" : "Mint NFT"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Certificates Found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? "No certificates match your search criteria."
                    : "You don't have any certificates yet."}
                </p>
                {!searchQuery && (
                  <>
                    <Alert className="max-w-md mx-auto">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Certificates issued by institutions will appear here automatically.
                      </AlertDescription>
                    </Alert>
                    <div className="mt-4 text-xs text-muted-foreground space-y-1">
                      <p>Debug Info (check browser console for more):</p>
                      <p>Chain: {chain?.id} ({chain?.name})</p>
                      <p>Registry: {registryAddress}</p>
                      <p>Address: {address}</p>
                      <p>Hashes: {certificateHashes ? JSON.stringify(certificateHashes) : "null"}</p>
                      <p>Certificates: {certificates.length}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Certificate Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Share:</strong> Generate a verification link to share with employers
              </p>
              <p>
                <strong>Download:</strong> Download certificate as JSON for offline storage
              </p>
              <p>
                <strong>View Details:</strong> See complete certificate information and signatures
              </p>
              <p className="text-xs mt-4">
                💡 All certificates are stored on-chain and verifiable via blockchain
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Certificate Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Certificate Details</DialogTitle>
            <DialogDescription>
              Complete information about this certificate
            </DialogDescription>
          </DialogHeader>

          {selectedCertificate && (
            <div className="space-y-4">
              {/* Certificate Title */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    {selectedCertificate.metadata}
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Status */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant={selectedCertificate.isRevoked ? "destructive" : "default"}>
                        {selectedCertificate.isRevoked ? "Revoked" : "Valid"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Issued Date</span>
                      <span className="text-sm font-medium">
                        {selectedCertificate.issuedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Certificate Hash */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Certificate Hash</CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
                    {selectedCertificate.hash}
                  </code>
                </CardContent>
              </Card>

              {/* Issuer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Issuer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <span className="text-sm font-medium ml-2">{selectedCertificate.issuer}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Address:</span>
                    <code className="text-xs bg-muted p-1 rounded ml-2">
                      {selectedCertificate.issuerAddress}
                    </code>
                  </div>
                </CardContent>
              </Card>

              {/* Blockchain Verification */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Blockchain Verified
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  <p>This certificate is stored on the blockchain and can be independently verified by anyone.</p>
                  <p className="mt-2">
                    Chain ID: {chain?.id} | Network: {chain?.name || "Unknown"}
                  </p>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => downloadCertificate(selectedCertificate.hash)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Certificate
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    window.location.href = `/bc-cvs/student/share?cert=${selectedCertificate.hash}`
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
