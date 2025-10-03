'use client'

import { Badge } from '@/components/ui/badge'
import {
    Activity,
    Shield,
    Award,
    Users,
    Check,
    X,
    Clock
} from 'lucide-react'

interface ActivityItem {
    id: string
    type: 'verification' | 'certificate' | 'guardian' | 'trust_score' | 'login'
    title: string
    description: string
    timestamp: Date
    status: 'success' | 'pending' | 'failed'
}

interface ActivityFeedProps {
    limit?: number
}

// Mock data for demonstration
const mockActivities: ActivityItem[] = [
    {
        id: '1',
        type: 'verification',
        title: 'Email Verification Completed',
        description: 'Successfully verified email address',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'success'
    },
    {
        id: '2',
        type: 'trust_score',
        title: 'Trust Score Updated',
        description: 'Your trust score increased by 5 points',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        status: 'success'
    },
    {
        id: '3',
        type: 'guardian',
        title: 'Guardian Added',
        description: 'New guardian 0x1234...5678 was added to your account',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        status: 'success'
    },
    {
        id: '4',
        type: 'certificate',
        title: 'Certificate Verification',
        description: 'Education certificate verification is pending',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: 'pending'
    },
    {
        id: '5',
        type: 'verification',
        title: 'Phone Verification Failed',
        description: 'Phone number verification attempt failed',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: 'failed'
    }
]

function getActivityIcon(type: ActivityItem['type']) {
    switch (type) {
        case 'verification':
            return Shield
        case 'certificate':
            return Award
        case 'guardian':
            return Users
        case 'trust_score':
            return Activity
        case 'login':
            return Check
        default:
            return Activity
    }
}

function getStatusIcon(status: ActivityItem['status']) {
    switch (status) {
        case 'success':
            return Check
        case 'pending':
            return Clock
        case 'failed':
            return X
        default:
            return Clock
    }
}

function getStatusColor(status: ActivityItem['status']) {
    switch (status) {
        case 'success':
            return 'text-green-500'
        case 'pending':
            return 'text-yellow-500'
        case 'failed':
            return 'text-red-500'
        default:
            return 'text-gray-500'
    }
}

function formatTimeAgo(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
        return `${diffDays}d ago`
    } else if (diffHours > 0) {
        return `${diffHours}h ago`
    } else {
        return 'Just now'
    }
}

export function ActivityFeed({ limit = 10 }: ActivityFeedProps) {
    const activities = mockActivities.slice(0, limit)

    if (activities.length === 0) {
        return (
            <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent activity</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {activities.map((activity) => {
                const Icon = getActivityIcon(activity.type)
                const StatusIcon = getStatusIcon(activity.status)

                return (
                    <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/5 transition-colors"
                    >
                        <div className="p-2 bg-muted/10 rounded-lg">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium text-foreground truncate">
                                    {activity.title}
                                </h4>
                                <StatusIcon className={`h-4 w-4 ${getStatusColor(activity.status)}`} />
                            </div>

                            <p className="text-xs text-muted-foreground mb-2">
                                {activity.description}
                            </p>

                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={
                                        activity.status === 'success' ? 'success' :
                                            activity.status === 'pending' ? 'secondary' : 'destructive'
                                    }
                                    className="text-xs"
                                >
                                    {activity.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {formatTimeAgo(activity.timestamp)}
                                </span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}