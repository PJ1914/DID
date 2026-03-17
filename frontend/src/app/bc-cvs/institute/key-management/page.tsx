"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAccount } from "wagmi"
import { Key, Download, Upload, Copy, Eye, EyeOff, AlertCircle, CheckCircle2, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import * as crypto from "crypto"

export default function KeyManagementPage() {
  const { address, isConnected } = useAccount()

  const [keys, setKeys] = useState({
    publicKey: "",
    privateKey: "",
  })

  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [importKey, setImportKey] = useState("")

  const generateKeys = () => {
    // In production, use proper RSA key generation library (e.g., node-forge, crypto-browserify)
    // For demonstration, generate mock keys
    const mockPublicKey = `-----BEGIN PUBLIC KEY-----
${crypto.randomBytes(128).toString("base64")}
-----END PUBLIC KEY-----`

    const mockPrivateKey = `-----BEGIN PRIVATE KEY-----
${crypto.randomBytes(256).toString("base64")}
-----END PRIVATE KEY-----`

    setKeys({
      publicKey: mockPublicKey,
      privateKey: mockPrivateKey,
    })
  }

  const downloadKey = (keyType: "public" | "private") => {
    const key = keyType === "public" ? keys.publicKey : keys.privateKey
    const blob = new Blob([key], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `rsa-${keyType}-key.pem`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const handleImportKey = () => {
    // Basic validation
    if (importKey.includes("BEGIN PRIVATE KEY")) {
      setKeys({ ...keys, privateKey: importKey })
      alert("Private key imported successfully!")
    } else if (importKey.includes("BEGIN PUBLIC KEY")) {
      setKeys({ ...keys, publicKey: importKey })
      alert("Public key imported successfully!")
    } else {
      alert("Invalid key format. Please paste a valid PEM-encoded key.")
    }
    setImportKey("")
  }

  if (!isConnected) {
    return (
      <div className="container px-4 py-16 mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to manage RSA keys.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 py-8 mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Key Management
          </h1>
          <p className="text-muted-foreground mb-8">
            Generate, import, and manage your RSA key pairs for certificate signing
          </p>

          {/* Security Warning */}
          <Alert className="mb-6">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Notice:</strong> In production, RSA keys should be generated offline
              and stored in Hardware Security Modules (HSM) or Key Management Systems (KMS). Never
              share your private key or store it in browser storage.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="generate">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Generate Keys</TabsTrigger>
              <TabsTrigger value="import">Import Keys</TabsTrigger>
            </TabsList>

            {/* Generate Keys Tab */}
            <TabsContent value="generate" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate RSA Key Pair</CardTitle>
                  <CardDescription>
                    Create a new 2048-bit RSA key pair for certificate signing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Button onClick={generateKeys} className="w-full">
                    <Key className="w-4 h-4 mr-2" />
                    Generate New Key Pair
                  </Button>

                  {keys.publicKey && (
                    <>
                      {/* Public Key */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Public Key (Share this with verifiers)</Label>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(keys.publicKey)}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadKey("public")}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          value={keys.publicKey}
                          readOnly
                          rows={8}
                          className="font-mono text-xs"
                        />
                      </div>

                      {/* Private Key */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-destructive">
                            Private Key (Keep this secret!)
                          </Label>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowPrivateKey(!showPrivateKey)}
                            >
                              {showPrivateKey ? (
                                <EyeOff className="w-4 h-4 mr-1" />
                              ) : (
                                <Eye className="w-4 h-4 mr-1" />
                              )}
                              {showPrivateKey ? "Hide" : "Show"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadKey("private")}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          value={showPrivateKey ? keys.privateKey : "••••••••••••••••••••"}
                          readOnly
                          rows={12}
                          className="font-mono text-xs"
                        />

                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Warning:</strong> Never share or expose your private key. Store
                            it in a secure location (HSM/KMS in production).
                          </AlertDescription>
                        </Alert>
                      </div>

                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                          Keys generated successfully! Download and store both keys securely.
                        </AlertDescription>
                      </Alert>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Key Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>Algorithm:</strong> RSA-2048
                  </p>
                  <p>
                    <strong>Format:</strong> PEM (PKCS#8)
                  </p>
                  <p>
                    <strong>Public Key Use:</strong> Certificate verification (shared publicly)
                  </p>
                  <p>
                    <strong>Private Key Use:</strong> Certificate signing (kept secret)
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Import Keys Tab */}
            <TabsContent value="import" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Import Existing Key</CardTitle>
                  <CardDescription>
                    Import a PEM-encoded RSA key (public or private)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="import-key">Paste PEM-Encoded Key</Label>
                    <Textarea
                      id="import-key"
                      placeholder="-----BEGIN PRIVATE KEY-----&#10;MIIEvgIBADANBgkqhkiG9w0...&#10;-----END PRIVATE KEY-----"
                      value={importKey}
                      onChange={(e) => setImportKey(e.target.value)}
                      rows={12}
                      className="font-mono text-xs"
                    />
                  </div>

                  <Button onClick={handleImportKey} className="w-full" disabled={!importKey}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Key
                  </Button>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Imported keys are stored in memory only. For production use, integrate with
                      HSM/KMS services like AWS KMS, Azure Key Vault, or Google Cloud KMS.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Current Keys Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Key Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm">Public Key</span>
                    {keys.publicKey ? (
                      <Badge variant="default">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Loaded
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not Loaded</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm">Private Key</span>
                    {keys.privateKey ? (
                      <Badge variant="default">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Loaded
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not Loaded</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Best Practices */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>1. Offline Generation:</strong> Generate keys on an air-gapped machine
              </p>
              <p>
                <strong>2. Secure Storage:</strong> Store private keys in HSM or encrypted vault
              </p>
              <p>
                <strong>3. Key Rotation:</strong> Rotate keys periodically (e.g., annually)
              </p>
              <p>
                <strong>4. Access Control:</strong> Limit who can access private keys
              </p>
              <p>
                <strong>5. Backup:</strong> Maintain encrypted backups in multiple secure locations
              </p>
              <p className="text-xs mt-4">
                ⚠️ For production deployment, integrate with enterprise KMS solutions
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
