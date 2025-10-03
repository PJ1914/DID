'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Award,
    Download,
    Share,
    Calendar,
    Building,
    Shield,
    ExternalLink,
    Filter,
    Search,
    Plus,
    CheckCircle,
    AlertCircle,
    Clock
} from 'lucide-react'

interface Certificate {
    id: string
    title: string
    description: string
    issuer: {
        name: string
        logo?: string
        verified: boolean
    }
    issuedDate: Date
    expiryDate?: Date
    status: 'valid' | 'expired' | 'revoked' | 'pending'
    category: 'education' | 'employment' | 'skill' | 'license' | 'achievement'
    credentialHash: string
    ipfsHash?: string
    verificationUrl?: string
}

const certificates: Certificate[] = [
    {
        id: '1',
        title: 'Bachelor of Computer Science',
        description: 'Undergraduate degree in Computer Science with specialization in Artificial Intelligence',
        issuer: {
            name: 'University of Technology',
            verified: true
        },
        issuedDate: new Date('2023-06-15'),
        status: 'valid',
        category: 'education',
        credentialHash: '0xabc123...',
        ipfsHash: 'QmX4Tt...',
        verificationUrl: 'https://verify.utech.edu/cert/1'
    },
    {
        id: '2',
        title: 'Senior Software Engineer',
        description: 'Employment verification for Senior Software Engineer position',
        issuer: {
            name: 'TechCorp Solutions',
            verified: true
        },
        issuedDate: new Date('2024-01-10'),
        status: 'valid',
        category: 'employment',
        credentialHash: '0xdef456...',
        verificationUrl: 'https://verify.techcorp.com/emp/2'
    },
    {
        id: '3',
        title: 'Blockchain Developer Certification',
        description: 'Advanced certification in blockchain development and smart contracts',
        issuer: {
            name: 'Blockchain Academy',
            verified: true
        },
        issuedDate: new Date('2023-11-20'),
        expiryDate: new Date('2025-11-20'),
        status: 'valid',
        category: 'skill',
        credentialHash: '0xghi789...',
        ipfsHash: 'QmY5Uu...'
    },
    {
        id: '4',
        title: 'Driver License',
        description: 'Valid driver license for Class C vehicles',
        issuer: {
            name: 'Department of Motor Vehicles',
            verified: true
        },
        issuedDate: new Date('2022-03-15'),
        expiryDate: new Date('2026-03-15'),
        status: 'valid',
        category: 'license',
        credentialHash: '0xjkl012...'
    },
    {
        id: '5',
        title: 'Project Management Professional',
        description: 'PMP certification for project management excellence',
        issuer: {
            name: 'Project Management Institute',
            verified: false
        },
        issuedDate: new Date('2023-08-10'),
        expiryDate: new Date('2024-12-31'),
        status: 'pending',
        category: 'achievement',
        credentialHash: '0xmno345...'
    }
]

function getStatusIcon(status: Certificate['status']) {
    switch (status) {
        case 'valid':
            return <CheckCircle className="h-4 w-4 text-green-500" />
        case 'expired':
            return <AlertCircle className="h-4 w-4 text-red-500" />
        case 'revoked':
            return <AlertCircle className="h-4 w-4 text-red-500" />
        case 'pending':
            return <Clock className="h-4 w-4 text-yellow-500" />
        default:
            return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
}

function getStatusBadge(status: Certificate['status']) {
    switch (status) {
        case 'valid':
            return <Badge variant="success">Valid</Badge>
        case 'expired':
            return <Badge variant="destructive">Expired</Badge>
        case 'revoked':
            return <Badge variant="destructive">Revoked</Badge>
        case 'pending':
            return <Badge variant="secondary">Pending</Badge>
        default:
            return <Badge variant="outline">Unknown</Badge>
    }
}

function getCategoryColor(category: Certificate['category']) {
    switch (category) {
        case 'education':
            return 'text-blue-500 bg-blue-500/10'
        case 'employment':
            return 'text-green-500 bg-green-500/10'
        case 'skill':
            return 'text-purple-500 bg-purple-500/10'
        case 'license':
            return 'text-orange-500 bg-orange-500/10'
        case 'achievement':
            return 'text-yellow-500 bg-yellow-500/10'
        default:
            return 'text-gray-500 bg-gray-500/10'
    }
}

function isExpiringSoon(cert: Certificate): boolean {
    if (!cert.expiryDate) return false
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    return cert.expiryDate <= thirtyDaysFromNow && cert.expiryDate > now
}

export default function CertificatesPage() {
    const validCerts = certificates.filter(cert => cert.status === 'valid')
    const pendingCerts = certificates.filter(cert => cert.status === 'pending')
    const expiringSoon = certificates.filter(cert => isExpiringSoon(cert))

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            My Certificates
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your verified credentials and certificates
                        </p>
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                        <Button variant="outline">
                            <Search className="h-4 w-4 mr-2" />
                            Search
                        </Button>
                        <Button variant="outline">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </Button>
                        <Button variant="electric">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Certificate
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <Award className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Valid Certificates
                                    </p>
                                    <p className="text-2xl font-bold">{validCerts.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-500/10 rounded-lg">
                                    <Clock className="h-5 w-5 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Pending Review
                                    </p>
                                    <p className="text-2xl font-bold">{pendingCerts.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500/10 rounded-lg">
                                    <AlertCircle className="h-5 w-5 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Expiring Soon
                                    </p>
                                    <p className="text-2xl font-bold">{expiringSoon.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Building className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Verified Issuers
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {new Set(certificates.filter(c => c.issuer.verified).map(c => c.issuer.name)).size}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Expiring Soon Alert */}
                {expiringSoon.length > 0 && (
                    <Card className="mb-8 border-orange-500/20 bg-orange-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                                <AlertCircle className="h-5 w-5" />
                                Certificates Expiring Soon ({expiringSoon.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {expiringSoon.map((cert) => (
                                    <div
                                        key={cert.id}
                                        className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/10"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${getCategoryColor(cert.category)}`}>
                                                <Award className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">{cert.title}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Expires on {cert.expiryDate?.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Renew
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Certificates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((cert) => (
                        <Card
                            key={cert.id}
                            className={`transition-all duration-200 hover:shadow-lg ${cert.status === 'valid' ? 'hover:border-green-500/20' :
                                    cert.status === 'pending' ? 'border-yellow-500/20 bg-yellow-500/5' :
                                        'hover:border-gray-500/20'
                                }`}
                        >
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-lg ${getCategoryColor(cert.category)}`}>
                                            <Award className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-base line-clamp-2">
                                                {cert.title}
                                            </CardTitle>
                                            <div className="flex items-center gap-2 mt-1">
                                                {getStatusIcon(cert.status)}
                                                {getStatusBadge(cert.status)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {cert.description}
                                </p>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Issuer:</span>
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium">{cert.issuer.name}</span>
                                            {cert.issuer.verified && (
                                                <Shield className="h-3 w-3 text-green-500" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Issued:</span>
                                        <span className="font-medium">
                                            {cert.issuedDate.toLocaleDateString()}
                                        </span>
                                    </div>

                                    {cert.expiryDate && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Expires:</span>
                                            <span className={`font-medium ${isExpiringSoon(cert) ? 'text-orange-500' : ''
                                                }`}>
                                                {cert.expiryDate.toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Hash:</span>
                                        <span className="font-mono text-xs">
                                            {cert.credentialHash.slice(0, 10)}...
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2 border-t border-border/10">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Download className="h-3 w-3 mr-1" />
                                        Download
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Share className="h-3 w-3 mr-1" />
                                        Share
                                    </Button>
                                    {cert.verificationUrl && (
                                        <Button variant="outline" size="sm">
                                            <ExternalLink className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Request Certificate CTA */}
                <Card className="mt-8 glass">
                    <CardContent className="p-8 text-center">
                        <div className="h-16 w-16 bg-did-electric/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="h-8 w-8 text-did-electric" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            Need a Certificate?
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Request verification from organizations or upload existing certificates to your digital wallet
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button variant="outline">
                                Upload Certificate
                            </Button>
                            <Button variant="electric">
                                <Plus className="h-4 w-4 mr-2" />
                                Request Verification
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}