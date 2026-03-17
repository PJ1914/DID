"use client"

import { useMemo } from "react"
import { useAccount, useReadContract } from "wagmi"
import { Wallet, ShieldCheck, Share2, Bell, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CertificateHashRegistryABI } from "@/contracts/abis/bc-cvs"
import { getContractAddress } from "@/contracts/addresses"
import { getSharedLinks } from "@/lib/sharedLinks"

export default function StudentWalletPage() {
  const { address, isConnected, chain } = useAccount()

  const isSupportedChain = chain?.id === 11155111 || chain?.id === 31337 || chain?.id === 1337
  const registryAddress = (isSupportedChain && chain?.id
    ? getContractAddress(chain.id as 11155111 | 31337 | 1337, "certificateHashRegistry")
    : "0x0000000000000000000000000000000000000000") as `0x${string}`

  const { data: hashes } = useReadContract({
    address: registryAddress,
    abi: CertificateHashRegistryABI,
    functionName: "getCertificatesByHolder",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && isConnected && isSupportedChain) },
  })

  const certCount = (hashes as string[] | undefined)?.length ?? 0
  const linkCount = useMemo(() => (address ? getSharedLinks(address).length : 0), [address])

  if (!isConnected || !address) {
    return (
      <div className="container px-4 py-16 mx-auto">
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">Connect wallet to open your Self-Sovereign Identity wallet.</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 py-8 mx-auto max-w-5xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wallet className="w-5 h-5" /> Sajjan Student Identity Wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground break-all">Wallet Address: {address}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Credentials</p><p className="text-2xl font-bold">{certCount}</p></CardContent></Card>
              <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Active Share Links</p><p className="text-2xl font-bold">{linkCount}</p></CardContent></Card>
              <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Privacy Mode</p><p className="text-2xl font-bold">On</p></CardContent></Card>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Share2 className="w-4 h-4" />Selective Sharing</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Control what fields are visible to employers using selective disclosure links.</p>
              <Link href="/bc-cvs/student/share"><Button className="w-full">Open Share Controls</Button></Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-4 h-4" />Real-Time Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Get alerts when your credential is verified.</p>
              <Link href="/bc-cvs/student/notifications"><Button variant="outline" className="w-full">Open Notifications</Button></Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" />Hackathon Edge</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            This wallet gives students direct ownership of credentials and transparent verification visibility.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
