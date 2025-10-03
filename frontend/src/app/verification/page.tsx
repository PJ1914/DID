'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Shield,
    Mail,
    Phone,
    CreditCard,
    Camera,
    FileText,
    MapPin,
    DollarSign,
    Check,
    Clock,
    X,
    ChevronRight,
    Zap
} from 'lucide-react'

interface VerificationMethod {
    id: string
    name: string
    description: string
    icon: any
    status: 'completed' | 'pending' | 'available' | 'failed'
    trustPoints: number
    estimatedTime: string
    requirements: string[]
}

const verificationMethods: VerificationMethod[] = [
    {
        id: 'email',
        name: 'Email Verification',
        description: 'Verify your email address to secure your account',
        icon: Mail,
        status: 'completed',
        trustPoints: 10,
        estimatedTime: '2 minutes',
        requirements: ['Valid email address', 'Access to email inbox']
    },
    {
        id: 'phone',
        name: 'Phone Number',
        description: 'Verify your phone number via SMS',
        icon: Phone,
        status: 'completed',
        trustPoints: 15,
        estimatedTime: '3 minutes',
        requirements: ['Valid phone number', 'SMS capability']
    },
    {
        id: 'government-id',
        name: 'Government ID',
        description: 'Upload and verify your government-issued ID',
        icon: CreditCard,
        status: 'pending',
        trustPoints: 25,
        estimatedTime: '5-10 minutes',
        requirements: ['Government-issued ID', 'Clear photo/scan', 'Matching personal info']
    },
    {
        id: 'face-verification',
        name: 'Face Verification',
        description: 'Biometric verification using your camera',
        icon: Camera,
        status: 'available',
        trustPoints: 20,
        estimatedTime: '3-5 minutes',
        requirements: ['Camera access', 'Good lighting', 'Government ID completed']
    },
    {
        id: 'address',
        name: 'Address Verification',
        description: 'Verify your residential address',
        icon: MapPin,
        status: 'available',
        trustPoints: 15,
        estimatedTime: '1-3 days',
        requirements: ['Utility bill', 'Bank statement', 'Government document']
    },
    {
        id: 'income',
        name: 'Income Verification',
        description: 'Verify your income and employment status',
        icon: DollarSign,
        status: 'available',
        trustPoints: 20,
        estimatedTime: '2-5 days',
        requirements: ['Pay stubs', 'Tax documents', 'Employment letter']
    },
    {
        id: 'education',
        name: 'Education Certificate',
        description: 'Verify your educational qualifications',
        icon: FileText,
        status: 'available',
        trustPoints: 18,
        estimatedTime: '3-7 days',
        requirements: ['Diploma/Certificate', 'Transcript', 'Institution verification']
    }
]

function getStatusIcon(status: VerificationMethod['status']) {
    switch (status) {
        case 'completed':
            return <Check className="h-4 w-4 text-green-500" />
        case 'pending':
            return <Clock className="h-4 w-4 text-yellow-500" />
        case 'failed':
            return <X className="h-4 w-4 text-red-500" />
        default:
            return <ChevronRight className="h-4 w-4 text-muted-foreground" />
    }
}

function getStatusBadge(status: VerificationMethod['status']) {
    switch (status) {
        case 'completed':
            return <Badge variant="success">Completed</Badge>
        case 'pending':
            return <Badge variant="secondary">Pending</Badge>
        case 'failed':
            return <Badge variant="destructive">Failed</Badge>
        default:
            return <Badge variant="outline">Available</Badge>
    }
}

export default function VerificationPage() {
    const completedCount = verificationMethods.filter(m => m.status === 'completed').length
    const totalTrustPoints = verificationMethods
        .filter(m => m.status === 'completed')
        .reduce((sum, m) => sum + m.trustPoints, 0)

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Verification Center
                        </h1>
                        <p className="text-muted-foreground">
                            Complete verifications to increase your trust score and unlock features
                        </p>
                    </div>
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <Badge variant="electric" className="text-sm px-3 py-1">
                            <Zap className="h-3 w-3 mr-1" />
                            {totalTrustPoints} Trust Points Earned
                        </Badge>
                    </div>
                </div>

                {/* Progress Overview */}
                <Card className="glass mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Verification Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-did-electric mb-2">
                                    {completedCount}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Completed Verifications
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-did-cyber mb-2">
                                    {totalTrustPoints}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Trust Points Earned
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-500 mb-2">
                                    {Math.round((completedCount / verificationMethods.length) * 100)}%
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Profile Completion
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Verification Methods */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {verificationMethods.map((method) => {
                        const Icon = method.icon
                        const isCompleted = method.status === 'completed'
                        const isPending = method.status === 'pending'
                        const isAvailable = method.status === 'available'

                        return (
                            <Card
                                key={method.id}
                                className={`transition-all duration-200 hover:shadow-lg ${isCompleted ? 'border-green-500/20 bg-green-500/5' :
                                        isPending ? 'border-yellow-500/20 bg-yellow-500/5' :
                                            'hover:border-did-electric/20'
                                    }`}
                            >
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-500/10' :
                                                    isPending ? 'bg-yellow-500/10' :
                                                        'bg-muted/10'
                                                }`}>
                                                <Icon className={`h-5 w-5 ${isCompleted ? 'text-green-500' :
                                                        isPending ? 'text-yellow-500' :
                                                            'text-muted-foreground'
                                                    }`} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base">{method.name}</CardTitle>
                                                <p className="text-sm text-muted-foreground">
                                                    +{method.trustPoints} Trust Points
                                                </p>
                                            </div>
                                        </div>
                                        {getStatusIcon(method.status)}
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        {method.description}
                                    </p>

                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">
                                            Est. time: {method.estimatedTime}
                                        </span>
                                        {getStatusBadge(method.status)}
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="text-xs font-medium text-muted-foreground">
                                            Requirements:
                                        </h4>
                                        <ul className="text-xs space-y-1">
                                            {method.requirements.map((req, index) => (
                                                <li key={index} className="flex items-center gap-2">
                                                    <div className="h-1 w-1 bg-muted-foreground rounded-full" />
                                                    {req}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Button
                                        variant={isCompleted ? 'outline' : isAvailable ? 'electric' : 'secondary'}
                                        className="w-full"
                                        disabled={!isAvailable && !isCompleted && !isPending}
                                    >
                                        {isCompleted ? 'View Details' :
                                            isPending ? 'Check Status' :
                                                'Start Verification'}
                                    </Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* ZK Proofs Section */}
                <Card className="mt-8 glass">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-did-electric" />
                            Zero-Knowledge Proofs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8">
                            <div className="h-16 w-16 bg-did-electric/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="h-8 w-8 text-did-electric" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                Privacy-Preserving Verification
                            </h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Generate zero-knowledge proofs to verify your identity without revealing sensitive information
                            </p>
                            <Button variant="electric">
                                <Zap className="h-4 w-4 mr-2" />
                                Generate ZK Proof
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}