const DEFAULT_ALLOWED_FIELDS = ["name", "degree", "university"]

export function parseMetadata(metadata: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(metadata)
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>
    }
    return null
  } catch {
    return null
  }
}

export function selectiveDisclosure(
  metadata: string,
  fields: string[] = DEFAULT_ALLOWED_FIELDS
): string {
  const parsed = parseMetadata(metadata)
  if (!parsed) {
    return metadata
  }

  const allowed = new Set(fields.map((f) => f.trim().toLowerCase()).filter(Boolean))
  const disclosed: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(parsed)) {
    if (allowed.has(key.toLowerCase())) {
      disclosed[key] = value
    }
  }

  const hiddenCount = Object.keys(parsed).length - Object.keys(disclosed).length
  return JSON.stringify(
    {
      disclosed,
      hiddenFieldCount: Math.max(0, hiddenCount),
      privacyMode: true,
    },
    null,
    2
  )
}

export const HACKATHON_DISCLOSURE_FIELDS = [
  { key: "name", label: "Student Name" },
  { key: "degree", label: "Degree" },
  { key: "university", label: "University" },
  { key: "cgpa", label: "CGPA" },
  { key: "dob", label: "Date of Birth" },
  { key: "idNumber", label: "ID Number" },
]
