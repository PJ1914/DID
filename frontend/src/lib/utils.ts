import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatAddress(address: string, chars = 4): string {
    if (!address) return ''
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function formatEther(value: string | number, decimals = 4): string {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return num.toFixed(decimals)
}

export function copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text)
}

export function formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
        case 'active':
            return 'text-green-400 bg-green-500/20 border-green-500/30'
        case 'pending':
            return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
        case 'revoked':
        case 'rejected':
            return 'text-red-400 bg-red-500/20 border-red-500/30'
        default:
            return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
}

export function calculateTrustScoreColor(score: number): string {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
}

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args)
            inThrottle = true
            setTimeout(() => (inThrottle = false), limit)
        }
    }
}

export function generateRandomId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function isValidEthereumAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function parseContractError(error: any): string {
    if (error?.reason) return error.reason
    if (error?.message) {
        if (error.message.includes('user rejected')) {
            return 'Transaction was rejected by user'
        }
        if (error.message.includes('insufficient funds')) {
            return 'Insufficient funds for transaction'
        }
        if (error.message.includes('execution reverted')) {
            return 'Transaction failed: Contract execution reverted'
        }
        return error.message
    }
    return 'An unknown error occurred'
}