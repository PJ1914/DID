"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useAccount, usePublicClient } from "wagmi"
import { AlertCircle, CheckCircle2, Loader2, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CertificateHashRegistryABI, RevocationRegistryABI } from "@/contracts/abis/bc-cvs"
import { getContractAddress } from "@/contracts/addresses"
import { selectiveDisclosure } from "@/lib/selectiveDisclosure"

export default function MobileVerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background p-4 flex items-center justify-center"><div className="text-muted-foreground">Loading...</div></div>}>
      <MobileVerifyContent />
    </Suspense>
  )
}

function MobileVerifyContent() {
  const params = useSearchParams()
  const { chain } = useAccount()
  const publicClient = usePublicClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<any>(null)

  const hash = params.get("hash") || ""
  const fields = (params.get("fields") || "name,degree,university").split(",")

  const isSupportedChain = chain?.id === 11155111 || chain?.id === 31337 || chain?.id === 1337
  const registryAddress = (isSupportedChain && chain?.id
    ? getContractAddress(chain.id as 11155111 | 31337 | 1337, "certificateHashRegistry")
    : "0x0000000000000000000000000000000000000000") as `0x${string}`
  const revocationAddress = (isSupportedChain && chain?.id
    ? getContractAddress(chain.id as 11155111 | 31337 | 1337, "revocationRegistry")
    : "0x0000000000000000000000000000000000000000") as `0x${string}`

  const canVerify = useMemo(
    () => Boolean(publicClient && hash && registryAddress !== "0x0000000000000000000000000000000000000000"),
    [publicClient, hash, registryAddress]
  )

  useEffect(() => {
    const run = async () => {
      if (!canVerify || !publicClient) return
      setLoading(true)
      setError("")

      try {
        const exists = await publicClient.readContract({
          address: registryAddress,
          abi: CertificateHashRegistryABI,
          functionName: "certificateExists",
          args: [hash as `0x${string}`],
        })

        if (!exists) {
          setError("Certificate not found on-chain")
          setLoading(false)
          return
        }

        const cert = await publicClient.readContract({
          address: registryAddress,
          abi: CertificateHashRegistryABI,
          functionName: "getCertificate",
          args: [hash as `0x${string}`],
        }) as any

        let revoked = false
        try {
          revoked = await publicClient.readContract({
            address: revocationAddress,
            abi: RevocationRegistryABI,
            functionName: "isRevoked",
            args: [hash as `0x${string}`],
          }) as boolean
        } catch {
          revoked = false
        }

        setResult({
          exists: true,
          isValid: cert.isValid,
          isRevoked: revoked,
          issuer: cert.issuer,
          holder: cert.holder,
          issueDate: new Date(Number(cert.issueDate) * 1000),
          metadata: selectiveDisclosure(cert.metadata, fields),
        })
      } catch (e: any) {
        setError(e?.message || "Verification failed")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [canVerify, publicClient, hash, registryAddress, revocationAddress, fields])

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Instant Mobile Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs break-all text-muted-foreground">{hash || "No hash provided"}</p>
            <p className="text-xs">Disclosed fields: {fields.join(", ")}</p>
          </CardContent>
        </Card>

        {loading && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Verifying certificate on blockchain...</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Card className={result.isValid && !result.isRevoked ? "border-green-500" : "border-red-500"}>
            <CardContent className="pt-6 space-y-3">
              <Badge variant={result.isValid && !result.isRevoked ? "default" : "destructive"}>
                {result.isValid && !result.isRevoked ? (
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Authentic</span>
                ) : (
                  <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Suspicious/Revoked</span>
                )}
              </Badge>
              <p className="text-sm"><strong>Issuer:</strong> {result.issuer}</p>
              <p className="text-sm"><strong>Issued:</strong> {result.issueDate.toLocaleDateString()}</p>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto">{result.metadata}</pre>
            </CardContent>
          </Card>
        )}

        <Button className="w-full" onClick={() => window.location.reload()} variant="outline">
          Re-verify
        </Button>
      </div>
    </div>
  )
}
