export interface CertificateNFT {
  id: string
  tokenId: string
  certificateHash: string
  holder: string
  issuer: string
  metadata: string
  mintedAt: string
  network: string
}

const KEY = "bc-cvs-certificate-nfts"

function loadAll(): CertificateNFT[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveAll(items: CertificateNFT[]): void {
  localStorage.setItem(KEY, JSON.stringify(items))
}

function tokenIdFromHash(hash: string): string {
  const clean = hash.replace(/^0x/, "")
  return BigInt(`0x${clean.slice(0, 16) || "0"}`).toString()
}

export function mintCertificateNFT(input: {
  certificateHash: string
  holder: string
  issuer: string
  metadata: string
  network?: string
}): CertificateNFT {
  const items = loadAll()
  const existing = items.find((i) => i.certificateHash.toLowerCase() === input.certificateHash.toLowerCase())
  if (existing) return existing

  const nft: CertificateNFT = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tokenId: tokenIdFromHash(input.certificateHash),
    certificateHash: input.certificateHash,
    holder: input.holder,
    issuer: input.issuer,
    metadata: input.metadata,
    mintedAt: new Date().toISOString(),
    network: input.network || "sepolia",
  }

  items.unshift(nft)
  saveAll(items)
  return nft
}

export function isCertificateNFTMinted(certificateHash: string): boolean {
  return loadAll().some((i) => i.certificateHash.toLowerCase() === certificateHash.toLowerCase())
}

export function getNFTsByHolder(holder: string): CertificateNFT[] {
  return loadAll().filter((i) => i.holder.toLowerCase() === holder.toLowerCase())
}
