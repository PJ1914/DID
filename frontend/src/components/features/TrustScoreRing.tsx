'use client'

interface TrustScoreRingProps {
    score: number
    size?: number
    strokeWidth?: number
}

export function TrustScoreRing({
    score,
    size = 120,
    strokeWidth = 8
}: TrustScoreRingProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (score / 100) * circumference

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#22c55e' // green
        if (score >= 60) return '#eab308' // yellow
        if (score >= 40) return '#f97316' // orange
        return '#ef4444' // red
    }

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-muted-foreground/20"
                />

                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={getScoreColor(score)}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    style={{
                        filter: `drop-shadow(0 0 6px ${getScoreColor(score)}40)`
                    }}
                />
            </svg>

            {/* Score text */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span
                    className="text-2xl font-bold"
                    style={{ color: getScoreColor(score) }}
                >
                    {score}
                </span>
            </div>
        </div>
    )
}