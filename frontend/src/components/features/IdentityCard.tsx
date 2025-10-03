'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    User,
    Shield,
    ExternalLink,
    Settings,
    Check,
    X
} from 'lucide-react'

interface IdentityCardProps {
    address?: string
}

export function IdentityCard({ address }: IdentityCardProps) {
    const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''

    return (
        <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Identity Overview</CardTitle>
                <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                    <div className="relative">
                        <div className="h-16 w-16 bg-gradient-to-br from-did-electric to-did-cyber rounded-full flex items-center justify-center">
                            <User className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">
                            Identity Verified
                        </h3>
                        <p className="text-sm text-muted-foreground font-mono">
                            {shortAddress}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="success" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Verified
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                Level 2
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/10 rounded-lg">
                        <div className="text-lg font-bold text-foreground">24</div>
                        <div className="text-xs text-muted-foreground">Total Actions</div>
                    </div>
                    <div className="text-center p-3 bg-muted/10 rounded-lg">
                        <div className="text-lg font-bold text-foreground">7d</div>
                        <div className="text-xs text-muted-foreground">Last Activity</div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/10">
                    <h4 className="text-sm font-medium text-foreground mb-3">
                        Verification Status
                    </h4>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Email</span>
                            <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="text-green-500">Verified</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Phone</span>
                            <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="text-green-500">Verified</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Government ID</span>
                            <div className="flex items-center gap-2">
                                <X className="h-4 w-4 text-red-500" />
                                <span className="text-red-500">Pending</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Button variant="outline" className="w-full mt-4">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Profile
                </Button>
            </CardContent>
        </Card>
    )
}