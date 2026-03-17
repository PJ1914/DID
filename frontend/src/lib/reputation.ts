import { getVerificationHistory } from "@/lib/verificationHistory"

export interface IssuerReputation {
  issuer: string
  issuedCount: number
  validCount: number
  invalidOrRevokedCount: number
  successRate: number
  score: number
}

function normalizeIssuer(raw: string): string {
  return raw?.toLowerCase() ?? "unknown"
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

export function calculateIssuerReputations(): IssuerReputation[] {
  const history = getVerificationHistory()
  const map = new Map<string, IssuerReputation>()

  for (const row of history) {
    const issuer = normalizeIssuer(row.issuer || "unknown")
    if (!map.has(issuer)) {
      map.set(issuer, {
        issuer,
        issuedCount: 0,
        validCount: 0,
        invalidOrRevokedCount: 0,
        successRate: 0,
        score: 0,
      })
    }

    const item = map.get(issuer)!
    item.issuedCount += 1

    if (row.status === "valid") {
      item.validCount += 1
    } else {
      item.invalidOrRevokedCount += 1
    }
  }

  const reputations = Array.from(map.values()).map((item) => {
    const successRate = item.issuedCount > 0 ? (item.validCount / item.issuedCount) * 100 : 0
    const volumeBonus = Math.min(15, Math.log10(item.issuedCount + 1) * 10)
    const penalty = Math.min(50, item.invalidOrRevokedCount * 3)
    const score = Math.max(0, Math.min(100, successRate + volumeBonus - penalty))

    return {
      ...item,
      successRate: round(successRate),
      score: round(score),
    }
  })

  return reputations.sort((a, b) => b.score - a.score)
}
