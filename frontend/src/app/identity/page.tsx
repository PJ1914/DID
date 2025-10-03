'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    User,
    Shield,
    Mail,
    Phone,
    CreditCard,
    Camera,
    Edit,
    Check,
    X,
    Clock,
    AlertCircle,
    Plus
} from 'lucide-react'
import { useAccount } from 'wagmi'

export default function IdentityPage() {
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
                                Please connect your wallet to manage your identity
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

    const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''
    const completionPercentage = 75

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Identity Management
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your digital identity and verification status
                        </p>
                    </div>
                    <Button variant="electric">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Verification
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Identity Card */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Overview */}
                        <Card className="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Profile Overview
                                    </span>
                                    <Button variant="ghost" size="sm">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-6 mb-6">
                                    <div className="relative">
                                        <div className="h-24 w-24 bg-gradient-to-br from-did-electric to-did-cyber rounded-full flex items-center justify-center">
                                            <User className="h-12 w-12 text-white" />
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-foreground mb-1">
                                            Anonymous User
                                        </h3>
                                        <p className="text-sm text-muted-foreground font-mono mb-3">
                                            {shortAddress}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="success">
                                                <Shield className="h-3 w-3 mr-1" />
                                                Level 2 Verified
                                            </Badge>
                                            <Badge variant="outline">
                                                Member since 2024
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Completion */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Profile Completion</span>
                                        <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
                                    </div>
                                    <Progress value={completionPercentage} className="h-2" />
                                    <p className="text-xs text-muted-foreground">
                                        Complete your profile to increase your trust score
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Verification Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Verification Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Email Verification */}
                                    <div className="flex items-center justify-between p-4 border border-border/10 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                                <Mail className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">Email Address</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    user@example.com
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-500" />
                                            <Badge variant="success">Verified</Badge>
                                        </div>
                                    </div>

                                    {/* Phone Verification */}
                                    <div className="flex items-center justify-between p-4 border border-border/10 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-500/10 rounded-lg">
                                                <Phone className="h-5 w-5 text-green-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">Phone Number</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    +1 (555) 123-4567
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-500" />
                                            <Badge variant="success">Verified</Badge>
                                        </div>
                                    </div>

                                    {/* Government ID */}
                                    <div className="flex items-center justify-between p-4 border border-border/10 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-yellow-500/10 rounded-lg">
                                                <CreditCard className="h-5 w-5 text-yellow-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">Government ID</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Driver's License
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-yellow-500" />
                                            <Badge variant="secondary">Pending</Badge>
                                        </div>
                                    </div>

                                    {/* Face Verification */}
                                    <div className="flex items-center justify-between p-4 border border-border/10 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-500/10 rounded-lg">
                                                <Camera className="h-5 w-5 text-red-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">Face Verification</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Biometric verification
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <X className="h-4 w-4 text-red-500" />
                                            <Badge variant="destructive">Not Started</Badge>
                                        </div>
                                    </div>
                                </div>

                                <Button variant="electric" className="w-full mt-6">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add New Verification
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Trust Score */}
                        <Card className="glass">
                            <CardHeader>
                                <CardTitle className="text-center">Trust Score</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="relative inline-flex items-center justify-center mb-4">
                                    <div className="h-32 w-32 border-8 border-muted/20 rounded-full relative">
                                        <div
                                            className="absolute inset-0 border-8 border-transparent rounded-full"
                                            style={{
                                                borderTopColor: '#22c55e',
                                                borderRightColor: '#22c55e',
                                                borderBottomColor: '#22c55e',
                                                borderLeftColor: 'transparent',
                                                transform: 'rotate(270deg)'
                                            }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-green-500">75</span>
                                        </div>
                                    </div>
                                </div>
                                <Badge variant="success" className="mb-2">Good</Badge>
                                <p className="text-xs text-muted-foreground">
                                    +5 points this week
                                </p>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Verifications</span>
                                        <span className="font-medium">3/5</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Certificates</span>
                                        <span className="font-medium">2</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Guardians</span>
                                        <span className="font-medium">3</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Last Activity</span>
                                        <span className="font-medium">2h ago</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security Alert */}
                        <Card className="border-yellow-500/20 bg-yellow-500/5">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-1">
                                            Security Recommendation
                                        </h4>
                                        <p className="text-xs text-yellow-600 dark:text-yellow-500 mb-3">
                                            Complete your government ID verification to improve security
                                        </p>
                                        <Button size="sm" variant="outline" className="w-full">
                                            Verify Now
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}