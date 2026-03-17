"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { Gem, ShieldCheck, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getNFTsByHolder, type CertificateNFT } from "@/lib/nftCertificates"

export default function NFTCertificatesPage() {
  const { address, isConnected } = useAccount()
  const [nfts, setNfts] = useState<CertificateNFT[]>([])

  useEffect(() => {
    if (!address) return
    setNfts(getNFTsByHolder(address))
  }, [address])

  if (!isConnected || !address) {
    return (
      <div className="container px-4 py-16 mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please connect wallet to view NFT certificates.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 py-8 mx-auto max-w-5xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Gem className="w-5 h-5" /> NFT Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Unique NFT-backed credential records for your certificates.</p>
          </CardContent>
        </Card>

        {nfts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              No NFT certificates yet. Open My Certificates and mint NFT for a credential.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nfts.map((nft) => (
              <Card key={nft.id}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="truncate">{nft.metadata}</span>
                    <Badge><ShieldCheck className="w-3 h-3 mr-1" /> NFT</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p><strong>Token ID:</strong> {nft.tokenId}</p>
                  <p className="break-all"><strong>Hash:</strong> {nft.certificateHash}</p>
                  <p><strong>Minted:</strong> {new Date(nft.mintedAt).toLocaleString()}</p>
                  <p><strong>Network:</strong> {nft.network}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
