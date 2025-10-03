'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    User,
    Shield,
    Award,
    Users,
    TrendingUp,
    Plus,
    ExternalLink,
    Activity
} from 'lucide-react'
import { useAccount } from 'wagmi'
import { TrustScoreRing } from '@/components/features/TrustScoreRing'
import { IdentityCard } from '@/components/features/IdentityCard'
import { ActivityFeed } from '@/components/features/ActivityFeed'

export default function DashboardPage() {
    const { address, isConnected } = useAccount()

    if (!isConnected) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <Card className="w-full max-w-md">
                        <CardContent className="p-6 text-center">
                            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
                            <p className="text-muted-foreground mb-4">
                                Please connect your wallet to access the dashboard
                            </p>
                            <Button variant="electric" className="w-full">
                                Connect Wallet
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Welcome back! Here's your identity overview.
                        </p>
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                        <Button variant="outline">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Profile
                        </Button>
                        <Button variant="electric">
                            <Plus className="h-4 w-4 mr-2" />
                            Quick Action
                        </Button>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Identity Overview */}
                    <div className="lg:col-span-2">
                        <IdentityCard address={address} />
                    </div>

                    {/* Trust Score */}
                    <Card className="glass">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-did-electric" />
                                Trust Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center mb-4">
                                <TrustScoreRing score={75} size={120} />
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-foreground mb-1">75</p>
                                <Badge variant="success" className="mb-2">Good</Badge>
                                <p className="text-xs text-muted-foreground">
                                    +5 points this week
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <User className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Verifications
                                    </p>
                                    <p className="text-2xl font-bold">3</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <Award className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Certificates
                                    </p>
                                    <p className="text-2xl font-bold">2</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                    <Users className="h-5 w-5 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Guardians
                                    </p>
                                    <p className="text-2xl font-bold">3</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500/10 rounded-lg">
                                    <Activity className="h-5 w-5 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Activity
                                    </p>
                                    <p className="text-2xl font-bold">12</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ActivityFeed limit={5} />
                        <Button variant="outline" className="w-full mt-4">
                            View All Activity
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}