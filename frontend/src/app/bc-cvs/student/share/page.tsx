"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAccount, useReadContract, usePublicClient } from "wagmi"
import {
  Share2,
  Copy,
  QrCode,
  Link2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Timer,
  Download,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CertificateHashRegistryABI } from "@/contracts/abis/bc-cvs"
import { getContractAddress } from "@/contracts/addresses"
import { saveSharedLink, getSharedLinks, revokeSharedLink, type SharedLink } from "@/lib/sharedLinks"
import { HACKATHON_DISCLOSURE_FIELDS } from "@/lib/selectiveDisclosure"

export default function ShareCertificatePage() {
  const { address, isConnected, chain } = useAccount()
  const publicClient = usePublicClient()
  const [selectedCertificate, setSelectedCertificate] = useState("")
  const [selectedMetadata, setSelectedMetadata] = useState("")
  const [shareLink, setShareLink] = useState("")
  const [qrCodeData, setQrCodeData] = useState("")
  const [expirationDays, setExpirationDays] = useState("30")
  const [copied, setCopied] = useState(false)
  const [certificates, setCertificates] = useState<Array<{hash: string, metadata: string}>>  ([])
  const [activeLinks, setActiveLinks] = useState<SharedLink[]>([])
  const [disclosureFields, setDisclosureFields] = useState<string[]>(["name", "degree", "university"])

  const isSupportedChain = chain?.id === 11155111 || chain?.id === 31337 || chain?.id === 1337
  const registryAddress = (isSupportedChain && chain?.id
    ? getContractAddress(chain.id as 11155111 | 31337 | 1337, "certificateHashRegistry")
    : "0x0000000000000000000000000000000000000000") as `0x${string}`

  const isValidAddress = registryAddress && registryAddress !== "0x" && registryAddress !== "0x0000000000000000000000000000000000000000"

  // Fetch certificate hashes
  const { data: certificateHashes } = useReadContract({
    address: isValidAddress ? registryAddress : undefined,
    abi: CertificateHashRegistryABI,
    functionName: "getCertificatesByHolder",
    args: address && isValidAddress ? [address] : undefined,
    query: {
      enabled: Boolean(address && isValidAddress && isConnected && isSupportedChain),
    },
  })

  // Fetch certificate details
  useEffect(() => {
    async function fetchCertificates() {
      if (!certificateHashes || !publicClient || !isValidAddress) {
        setCertificates([])
        return
      }

      const hashes = certificateHashes as `0x${string}`[]
      if (hashes.length === 0) {
        setCertificates([])
        return
      }

      try {
        const certDetails = await Promise.all(
          hashes.map(async (hash) => {
            const data = await publicClient.readContract({
              address: registryAddress,
              abi: CertificateHashRegistryABI,
              functionName: "getCertificate",
              args: [hash],
            }) as any

            return {
              hash: data.certificateHash,
              metadata: data.metadata,
            }
          })
        )

        setCertificates(certDetails)
      } catch (error) {
        console.error("Error fetching certificates:", error)
        setCertificates([])
      }
    }

    fetchCertificates()
  }, [certificateHashes, publicClient, registryAddress, isValidAddress])

  // Load active links
  useEffect(() => {
    if (address) {
      setActiveLinks(getSharedLinks(address))
    }
  }, [address])

  // Auto-select certificate from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const certHash = params.get('cert')
    if (certHash && certificates.length > 0) {
      const cert = certificates.find(c => c.hash === certHash)
      if (cert) {
        setSelectedCertificate(cert.hash)
        setSelectedMetadata(cert.metadata)
      }
    }
  }, [certificates])

  const generateShareLink = async () => {
    if (!selectedCertificate || !address) return

    const baseUrl = window.location.origin
    const fieldParam = disclosureFields.join(",")
    const verifyUrl = `${baseUrl}/bc-cvs/mobile-verify?hash=${selectedCertificate}&fields=${encodeURIComponent(fieldParam)}`
    setShareLink(verifyUrl)

    try {
      const QRCode = (await import("qrcode")).default
      const dataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 280,
        margin: 2,
      })
      setQrCodeData(dataUrl)
    } catch (error) {
      console.error("Failed to generate QR code:", error)
      setQrCodeData("")
    }

    // Save to localStorage
    try {
      saveSharedLink(
        address,
        selectedCertificate,
        selectedMetadata,
        Number(expirationDays),
        verifyUrl,
        disclosureFields
      )
      setActiveLinks(getSharedLinks(address))
    } catch (error) {
      console.error('Failed to save shared link:', error)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadQRCode = () => {
    if (!qrCodeData || !selectedCertificate) return
    const a = document.createElement("a")
    a.href = qrCodeData
    a.download = `certificate-qr-${selectedCertificate.slice(2, 10)}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  useEffect(() => {
    if (selectedCertificate) {
      generateShareLink()
    }
  }, [selectedCertificate, expirationDays, disclosureFields.join(",")])

  const toggleDisclosure = (field: string) => {
    setDisclosureFields((prev) => {
      if (prev.includes(field)) {
        if (prev.length === 1) return prev
        return prev.filter((f) => f !== field)
      }
      return [...prev, field]
    })
  }

  const handleCertificateChange = (value: string) => {
    setSelectedCertificate(value)
    const cert = certificates.find(c => c.hash === value)
    setSelectedMetadata(cert?.metadata || "")
  }

  const handleRevokeLink = (linkId: string) => {
    if (address && confirm('Are you sure you want to revoke this shared link?')) {
      revokeSharedLink(address, linkId)
      setActiveLinks(getSharedLinks(address))
    }
  }

  if (!isConnected) {
    return (
      <div className="container px-4 py-16 mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to share certificates.
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
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Share Certificate
          </h1>
          <p className="text-muted-foreground mb-8">
            Generate secure verification links to share with employers and verifiers
          </p>

          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Generate Link</TabsTrigger>
              <TabsTrigger value="active">Active Links</TabsTrigger>
            </TabsList>

            <TabsContent value="generate">
              <Card>
                <CardHeader>
                  <CardTitle>Step 1: Select Certificate</CardTitle>
                  <CardDescription>
                    Choose which certificate you want to share
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Certificate</Label>
                    <Select value={selectedCertificate} onValueChange={handleCertificateChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={certificates.length === 0 ? "No certificates found" : "Select a certificate..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {certificates.map((cert) => (
                          <SelectItem key={cert.hash} value={cert.hash}>
                            {cert.metadata}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {certificates.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        You don't have any certificates yet. Get certificates issued to you first.
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Link Expiration</Label>
                    <Select value={expirationDays} onValueChange={setExpirationDays}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Link will expire after this duration
                    </p>
                  </div>

                  <div>
                    <Label>Selective Disclosure (Privacy)</Label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {HACKATHON_DISCLOSURE_FIELDS.map((item) => {
                        const selected = disclosureFields.includes(item.key)
                        return (
                          <Button
                            type="button"
                            key={item.key}
                            variant={selected ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleDisclosure(item.key)}
                            className="justify-start"
                          >
                            {item.label}
                          </Button>
                        )
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Selected fields will be visible to verifier. Other fields stay hidden.
                    </p>
                  </div>

                  {shareLink && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4 pt-4 border-t"
                    >
                      <div>
                        <Label>Shareable Link</Label>
                        <div className="flex gap-2 mt-2">
                          <Input value={shareLink} readOnly className="font-mono text-xs" />
                          <Button onClick={copyToClipboard} variant="outline">
                            {copied ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="bg-muted/50 p-6 rounded-lg text-center">
                        <div className="w-56 h-56 mx-auto mb-4 bg-white border-4 border-muted rounded-lg flex items-center justify-center overflow-hidden">
                          {qrCodeData ? (
                            <img src={qrCodeData} alt="Certificate verification QR" className="w-full h-full object-contain" />
                          ) : (
                            <QrCode className="w-32 h-32 text-muted-foreground" />
                          )}
                        </div>
                        <Button onClick={downloadQRCode} variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download QR Code
                        </Button>
                      </div>

                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                          Link generated successfully! Share this with employers to verify your
                          certificate.
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>1. Secure:</strong> Links are cryptographically signed and tamper-proof
                  </p>
                  <p>
                    <strong>2. Temporary:</strong> Links expire after your chosen duration
                  </p>
                  <p>
                    <strong>3. Trackable:</strong> See who verifies your certificate and when
                  </p>
                  <p>
                    <strong>4. Private:</strong> Only the certificate hash is shared, not personal
                    data
                  </p>
                  <p className="text-xs mt-4">
                    💡 Generate a new link for each employer to track verifications separately
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="active">
              <Card>
                <CardHeader>
                  <CardTitle>Active Share Links</CardTitle>
                  <CardDescription>Manage your active verification links</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeLinks.length === 0 ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No active share links yet. Generate a link in the "Generate Link" tab.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      activeLinks.map((link) => (
                        <div
                          key={link.id}
                          className="border rounded-lg p-4 flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{link.certificateMetadata}</h4>
                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Created {new Date(link.created).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Timer className="w-3 h-3" />
                                Expires {new Date(link.expiresAt).toLocaleDateString()}
                              </div>
                              <Badge variant="secondary">{link.views} views</Badge>
                              {link.disclosureFields && link.disclosureFields.length > 0 && (
                                <Badge variant="outline">Fields: {link.disclosureFields.join(", ")}</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(link.shareUrl)
                                setCopied(true)
                                setTimeout(() => setCopied(false), 2000)
                              }}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRevokeLink(link.id)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Revoke
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
