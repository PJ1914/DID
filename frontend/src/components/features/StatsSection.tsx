'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
    Users,
    Shield,
    Award,
    Building,
    TrendingUp,
    Activity,
    CheckCircle,
    Clock,
    AlertCircle
} from 'lucide-react'

export function StatsSection() {
    const stats = [
        {
            title: 'Total Identities',
            value: '12,456',
            change: '+12.5%',
            trend: 'up',
            icon: Users,
        },
        {
            title: 'Verifications',
            value: '8,742',
            change: '+8.2%',
            trend: 'up',
            icon: Shield,
        },
        {
            title: 'Certificates',
            value: '3,241',
            change: '+15.3%',
            trend: 'up',
            icon: Award,
        },
        {
            title: 'Organizations',
            value: '456',
            change: '+4.1%',
            trend: 'up',
            icon: Building,
        },
    ]

    const recentActivity = [
        {
            id: 1,
            type: 'verification',
            title: 'Identity Verified',
            description: 'Aadhaar verification completed for user 0x1234...5678',
            timestamp: '2 minutes ago',
            status: 'success',
        },
        {
            id: 2,
            type: 'certificate',
            title: 'Certificate Issued',
            description: 'Educational certificate issued by MIT',
            timestamp: '5 minutes ago',
            status: 'success',
        },
        {
            id: 3,
            type: 'identity',
            title: 'New Identity Registered',
            description: 'Identity created for wallet 0x9876...4321',
            timestamp: '10 minutes ago',
            status: 'pending',
        },
        {
            id: 4,
            type: 'organization',
            title: 'Organization Approved',
            description: 'Stanford University organization approved',
            timestamp: '15 minutes ago',
            status: 'success',
        },
    ]

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />
            case 'error':
                return <AlertCircle className="h-4 w-4 text-red-500" />
            default:
                return <Activity className="h-4 w-4 text-blue-500" />
        }
    }

    return (
        <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat) => {
                        const Icon = stat.icon
                        return (
                            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                {stat.title}
                                            </p>
                                            <p className="text-2xl font-bold text-foreground">
                                                {stat.value}
                                            </p>
                                            <div className="flex items-center mt-1">
                                                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                                                <span className="text-xs text-green-500 font-medium">
                                                    {stat.change}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-primary/10 rounded-lg">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Trust Score Distribution */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Trust Score Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Excellent (80-100)</span>
                                    <span className="text-sm text-muted-foreground">2,456 users</span>
                                </div>
                                <Progress value={75} className="h-2" />

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Good (60-79)</span>
                                    <span className="text-sm text-muted-foreground">4,123 users</span>
                                </div>
                                <Progress value={60} className="h-2" />

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Fair (40-59)</span>
                                    <span className="text-sm text-muted-foreground">3,421 users</span>
                                </div>
                                <Progress value={45} className="h-2" />

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Poor (0-39)</span>
                                    <span className="text-sm text-muted-foreground">1,234 users</span>
                                </div>
                                <Progress value={25} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start space-x-3">
                                        <div className="mt-1">
                                            {getStatusIcon(activity.status)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground">
                                                {activity.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {activity.description}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {activity.timestamp}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full mt-4">
                                View All Activity
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}