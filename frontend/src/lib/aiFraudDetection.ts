import crypto from "crypto"

export type FraudCheckStatus = "authentic" | "suspicious"

export interface FraudCheckResult {
  status: FraudCheckStatus
  confidence: number
  score: number
  reasons: string[]
  hash: string
}

const KNOWN_SUSPICIOUS_PATTERNS = [
  "photoshop",
  "edited",
  "sample",
  "fake",
  "dummy",
  "test certificate",
]

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value))
}

function computeFileEntropyPreview(bytes: Uint8Array): number {
  const freq = new Map<number, number>()
  for (const b of bytes) {
    freq.set(b, (freq.get(b) ?? 0) + 1)
  }

  const len = bytes.length || 1
  let entropy = 0
  for (const count of freq.values()) {
    const p = count / len
    entropy -= p * Math.log2(p)
  }
  return entropy
}

export async function analyzeCertificateFile(file: File): Promise<FraudCheckResult> {
  const reasons: string[] = []
  let riskScore = 0

  const lowerName = file.name.toLowerCase()
  if (!/(\.pdf|\.png|\.jpg|\.jpeg|\.json|\.txt)$/.test(lowerName)) {
    riskScore += 35
    reasons.push("Unexpected file extension for academic certificate")
  }

  if (file.size < 1024) {
    riskScore += 25
    reasons.push("File is unusually small")
  }

  if (file.size > 15 * 1024 * 1024) {
    riskScore += 15
    reasons.push("File is unusually large")
  }

  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const hash = `0x${crypto.createHash("sha256").update(Buffer.from(buffer)).digest("hex")}`

  const entropy = computeFileEntropyPreview(bytes.slice(0, Math.min(bytes.length, 4096)))
  if (entropy < 2.5) {
    riskScore += 10
    reasons.push("Very low entropy content detected")
  }

  if (entropy > 7.9) {
    riskScore += 8
    reasons.push("High entropy content suggests heavy binary manipulation")
  }

  const textSnippet = new TextDecoder("utf-8", { fatal: false })
    .decode(bytes.slice(0, Math.min(bytes.length, 12000)))
    .toLowerCase()

  for (const pattern of KNOWN_SUSPICIOUS_PATTERNS) {
    if (lowerName.includes(pattern) || textSnippet.includes(pattern)) {
      riskScore += 12
      reasons.push(`Suspicious marker found: ${pattern}`)
    }
  }

  if (!lowerName.includes("certificate") && !textSnippet.includes("certificate")) {
    riskScore += 8
    reasons.push("No certificate keyword detected in file name/content")
  }

  const status: FraudCheckStatus = riskScore >= 45 ? "suspicious" : "authentic"
  const confidence = status === "authentic" ? 80 + (45 - clamp(riskScore, 0, 45)) / 3 : 70 + (clamp(riskScore, 45, 100) - 45) / 2

  return {
    status,
    confidence: clamp(Math.round(confidence)),
    score: clamp(Math.round(riskScore)),
    reasons: reasons.length ? reasons : ["No tampering indicators found in heuristic scan"],
    hash,
  }
}
