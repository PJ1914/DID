'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Shield,
    Users,
    Key,
    Smartphone,
    Mail,
    UserPlus,
    UserMinus,
    AlertTriangle,
    CheckCircle,
    Clock,
    Plus,
    Settings,
    Eye,
    EyeOff
} from 'lucide-react'

interface Guardian {
    id: string
    address: string
    name?: string
    email?: string
    phone?: string
    status: 'active' | 'pending' | 'removed'
    addedDate: Date
    lastActivity?: Date
    trustScore: number
}

interface RecoveryMethod {
    id: string
    type: 'social' | 'email' | 'phone' | 'hardware' | 'seed'
    name: string
    description: string
    icon: any
    enabled: boolean
    lastUsed?: Date
    strength: 'high' | 'medium' | 'low'
}

const guardians: Guardian[] = [
    {
        id: '1',
        address: '0x1234...5678',
        name: 'John Smith',
        email: 'john@example.com',
        status: 'active',
        addedDate: new Date('2023-08-15'),
        lastActivity: new Date('2024-01-15'),
        trustScore: 95
    },
    {
        id: '2',
        address: '0x5678...9012',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        status: 'active',
        addedDate: new Date('2023-09-20'),
        lastActivity: new Date('2024-01-10'),
        trustScore: 88
    },
    {
        id: '3',
        address: '0x9012...3456',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        status: 'pending',
        addedDate: new Date('2024-01-20'),
        trustScore: 0
    }
]

const recoveryMethods: RecoveryMethod[] = [
    {
        id: '1',
        type: 'social',
        name: 'Social Recovery',
        description: 'Recover using trusted guardians (2 of 3 required)',
        icon: Users,
        enabled: true,
        lastUsed: new Date('2023-12-01'),
        strength: 'high'
    },
    {
        id: '2',
        type: 'email',
        name: 'Email Recovery',
        description: 'Recover using verified email address',
        icon: Mail,
        enabled: true,
        strength: 'medium'
    },
    {
        id: '3',
        type: 'phone',
        name: 'SMS Recovery',
        description: 'Recover using verified phone number',
        icon: Smartphone,
        enabled: true,
        strength: 'medium'
    },
    {
        id: '4',
        type: 'hardware',
        name: 'Hardware Key',
        description: 'Recover using hardware security key',
        icon: Key,
        enabled: false,
        strength: 'high'
    },
    {
        id: '5',
        type: 'seed',
        name: 'Seed Phrase',
        description: 'Recover using 12-word seed phrase',
        icon: Shield,
        enabled: false,
        strength: 'high'
    }
]

function getStatusBadge(status: Guardian['status']) {
    switch (status) {
        case 'active':
            return <Badge variant="success">Active</Badge>
        case 'pending':
            return <Badge variant="secondary">Pending</Badge>
        case 'removed':
            return <Badge variant="destructive">Removed</Badge>
        default:
            return <Badge variant="outline">Unknown</Badge>
    }
}

function getStrengthColor(strength: RecoveryMethod['strength']) {
    switch (strength) {
        case 'high':
            return 'text-green-500'
        case 'medium':
            return 'text-yellow-500'
        case 'low':
            return 'text-red-500'
        default:
            return 'text-gray-500'
    }
}

export default function RecoveryPage() {
    const activeGuardians = guardians.filter(g => g.status === 'active')
    const pendingGuardians = guardians.filter(g => g.status === 'pending')
    const enabledMethods = recoveryMethods.filter(m => m.enabled)

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Account Recovery
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your account recovery options and trusted guardians
                        </p>
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                        <Button variant="outline">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </Button>
                        <Button variant="electric">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Guardian
                        </Button>
                    </div>
                </div>

                {/* Security Overview */}
                <Card className="glass mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Security Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-500 mb-2">
                                    {activeGuardians.length}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Active Guardians
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-did-electric mb-2">
                                    {enabledMethods.length}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Recovery Methods
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-yellow-500 mb-2">
                                    {Math.round(activeGuardians.reduce((sum, g) => sum + g.trustScore, 0) / activeGuardians.length || 0)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Avg Guardian Trust
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Guardians Management */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Trusted Guardians
                                    </span>
                                    <Button variant="outline" size="sm">
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Add Guardian
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {guardians.map((guardian) => (
                                        <div
                                            key={guardian.id}
                                            className="flex items-center justify-between p-4 border border-border/10 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-gradient-to-br from-did-electric to-did-cyber rounded-full flex items-center justify-center">
                                                    <Users className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">
                                                        {guardian.name || `Guardian ${guardian.id}`}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground font-mono">
                                                        {guardian.address}
                                                    </p>
                                                    {guardian.email && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {guardian.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(guardian.status)}
                                                <Button variant="ghost" size="sm">
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {pendingGuardians.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-border/10">
                                        <h4 className="text-sm font-medium text-muted-foreground mb-3">
                                            Pending Invitations
                                        </h4>
                                        <div className="space-y-2">
                                            {pendingGuardians.map((guardian) => (
                                                <div
                                                    key={guardian.id}
                                                    className="flex items-center justify-between p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg"
                                                >
                                                    <div>
                                                        <p className="font-medium text-sm">
                                                            {guardian.name || guardian.address}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Invited {guardian.addedDate.toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        <UserMinus className="h-3 w-3 mr-1" />
                                                        Cancel
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Emergency Contacts */}
                        <Card className="border-red-500/20 bg-red-500/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                                    <AlertTriangle className="h-5 w-5" />
                                    Emergency Recovery
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                                    If you lose access to your account, you can initiate emergency recovery.
                                    This requires {Math.ceil(activeGuardians.length * 0.6)} out of {activeGuardians.length} guardians to approve.
                                </p>
                                <Button variant="destructive" className="w-full">
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Start Emergency Recovery
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recovery Methods */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="h-5 w-5" />
                                    Recovery Methods
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recoveryMethods.map((method) => {
                                        const Icon = method.icon
                                        return (
                                            <div
                                                key={method.id}
                                                className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${method.enabled
                                                        ? 'border-green-500/20 bg-green-500/5'
                                                        : 'border-border/10 bg-muted/5'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${method.enabled ? 'bg-green-500/10' : 'bg-muted/10'
                                                        }`}>
                                                        <Icon className={`h-5 w-5 ${method.enabled ? 'text-green-500' : 'text-muted-foreground'
                                                            }`} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">{method.name}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {method.description}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-xs font-medium ${getStrengthColor(method.strength)}`}>
                                                                {method.strength.toUpperCase()} SECURITY
                                                            </span>
                                                            {method.lastUsed && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    • Last used {method.lastUsed.toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {method.enabled ? (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                    <Button
                                                        variant={method.enabled ? "outline" : "electric"}
                                                        size="sm"
                                                    >
                                                        {method.enabled ? "Configure" : "Enable"}
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Backup Codes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Key className="h-5 w-5" />
                                        Backup Codes
                                    </span>
                                    <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Codes
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Backup codes can be used to recover your account if other methods fail.
                                    Store them securely offline.
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Generated:</span>
                                        <span className="font-medium">Dec 15, 2023</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Codes remaining:</span>
                                        <span className="font-medium">8/10</span>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full mt-4">
                                    Generate New Codes
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}