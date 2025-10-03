'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Building,
    Users,
    Award,
    Plus,
    Search,
    Filter,
    Star,
    MapPin,
    Globe,
    Mail,
    Phone,
    ChevronRight,
    Shield,
    Clock
} from 'lucide-react'

interface Organization {
    id: string
    name: string
    type: 'educational' | 'employer' | 'government' | 'healthcare' | 'financial'
    description: string
    website: string
    location: string
    verified: boolean
    trustScore: number
    memberCount: number
    certificatesIssued: number
    logo?: string
    joinedDate?: Date
    status: 'member' | 'pending' | 'invited' | 'available'
}

const organizations: Organization[] = [
    {
        id: '1',
        name: 'University of Technology',
        type: 'educational',
        description: 'Leading technology university with focus on innovation and research',
        website: 'https://utech.edu',
        location: 'San Francisco, CA',
        verified: true,
        trustScore: 95,
        memberCount: 45000,
        certificatesIssued: 12500,
        joinedDate: new Date('2023-09-15'),
        status: 'member'
    },
    {
        id: '2',
        name: 'TechCorp Solutions',
        type: 'employer',
        description: 'Global technology company specializing in enterprise solutions',
        website: 'https://techcorp.com',
        location: 'New York, NY',
        verified: true,
        trustScore: 88,
        memberCount: 15000,
        certificatesIssued: 8500,
        joinedDate: new Date('2024-01-10'),
        status: 'member'
    },
    {
        id: '3',
        name: 'Digital Health Institute',
        type: 'healthcare',
        description: 'Research institute focused on digital health solutions',
        website: 'https://digitalhealth.org',
        location: 'Boston, MA',
        verified: true,
        trustScore: 92,
        memberCount: 5000,
        certificatesIssued: 2100,
        status: 'pending'
    },
    {
        id: '4',
        name: 'Department of Digital Identity',
        type: 'government',
        description: 'Government agency overseeing digital identity standards',
        website: 'https://gov.digital-id',
        location: 'Washington, DC',
        verified: true,
        trustScore: 98,
        memberCount: 1200,
        certificatesIssued: 5600,
        status: 'invited'
    },
    {
        id: '5',
        name: 'SecureBank',
        type: 'financial',
        description: 'Digital-first bank providing secure financial services',
        website: 'https://securebank.com',
        location: 'London, UK',
        verified: true,
        trustScore: 89,
        memberCount: 2500000,
        certificatesIssued: 150000,
        status: 'available'
    }
]

function getOrgTypeIcon(type: Organization['type']) {
    switch (type) {
        case 'educational':
            return Award
        case 'employer':
            return Building
        case 'government':
            return Shield
        case 'healthcare':
            return Plus
        case 'financial':
            return Globe
        default:
            return Building
    }
}

function getOrgTypeColor(type: Organization['type']) {
    switch (type) {
        case 'educational':
            return 'text-blue-500 bg-blue-500/10'
        case 'employer':
            return 'text-green-500 bg-green-500/10'
        case 'government':
            return 'text-purple-500 bg-purple-500/10'
        case 'healthcare':
            return 'text-red-500 bg-red-500/10'
        case 'financial':
            return 'text-yellow-500 bg-yellow-500/10'
        default:
            return 'text-gray-500 bg-gray-500/10'
    }
}

function getStatusBadge(status: Organization['status']) {
    switch (status) {
        case 'member':
            return <Badge variant="success">Member</Badge>
        case 'pending':
            return <Badge variant="secondary">Pending</Badge>
        case 'invited':
            return <Badge variant="electric">Invited</Badge>
        default:
            return <Badge variant="outline">Available</Badge>
    }
}

export default function OrganizationsPage() {
    const memberOrgs = organizations.filter(org => org.status === 'member')
    const pendingOrgs = organizations.filter(org => org.status === 'pending')
    const invitedOrgs = organizations.filter(org => org.status === 'invited')

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Organizations
                        </h1>
                        <p className="text-muted-foreground">
                            Connect with verified organizations to expand your digital identity
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
                            Join Organization
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <Building className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Member Organizations
                                    </p>
                                    <p className="text-2xl font-bold">{memberOrgs.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Award className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Certificates
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {memberOrgs.reduce((sum, org) => sum + (org.certificatesIssued || 0), 0)}
                                    </p>
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
                                        Pending
                                    </p>
                                    <p className="text-2xl font-bold">{pendingOrgs.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                    <Star className="h-5 w-5 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Avg Trust Score
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {Math.round(memberOrgs.reduce((sum, org) => sum + org.trustScore, 0) / memberOrgs.length || 0)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Invitations */}
                {invitedOrgs.length > 0 && (
                    <Card className="mb-8 border-did-electric/20 bg-did-electric/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-did-electric" />
                                Pending Invitations ({invitedOrgs.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {invitedOrgs.map((org) => {
                                    const Icon = getOrgTypeIcon(org.type)
                                    return (
                                        <div
                                            key={org.id}
                                            className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/10"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${getOrgTypeColor(org.type)}`}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{org.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{org.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm">
                                                    Decline
                                                </Button>
                                                <Button variant="electric" size="sm">
                                                    Accept
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Organizations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {organizations.map((org) => {
                        const Icon = getOrgTypeIcon(org.type)
                        const isMember = org.status === 'member'

                        return (
                            <Card
                                key={org.id}
                                className={`transition-all duration-200 hover:shadow-lg ${isMember ? 'border-green-500/20 bg-green-500/5' : 'hover:border-did-electric/20'
                                    }`}
                            >
                                <CardHeader className="pb-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-lg ${getOrgTypeColor(org.type)}`}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <CardTitle className="text-base">{org.name}</CardTitle>
                                                    {org.verified && (
                                                        <Shield className="h-4 w-4 text-green-500" />
                                                    )}
                                                </div>
                                                {getStatusBadge(org.status)}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {org.description}
                                    </p>

                                    <div className="space-y-2 text-xs">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-3 w-3" />
                                            {org.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Users className="h-3 w-3" />
                                            {org.memberCount.toLocaleString()} members
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Award className="h-3 w-3" />
                                            {org.certificatesIssued.toLocaleString()} certificates issued
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-border/10">
                                        <div className="flex items-center gap-2">
                                            <Star className="h-4 w-4 text-yellow-500" />
                                            <span className="text-sm font-medium">{org.trustScore}</span>
                                            <span className="text-xs text-muted-foreground">Trust Score</span>
                                        </div>
                                        {org.joinedDate && (
                                            <span className="text-xs text-muted-foreground">
                                                Joined {org.joinedDate.toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>

                                    <Button
                                        variant={isMember ? 'outline' : 'electric'}
                                        className="w-full"
                                    >
                                        {isMember ? (
                                            <>
                                                View Details
                                                <ChevronRight className="h-4 w-4 ml-2" />
                                            </>
                                        ) : org.status === 'pending' ? (
                                            'Application Pending'
                                        ) : org.status === 'invited' ? (
                                            'Accept Invitation'
                                        ) : (
                                            'Request to Join'
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Create Organization CTA */}
                <Card className="mt-8 glass">
                    <CardContent className="p-8 text-center">
                        <div className="h-16 w-16 bg-did-electric/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building className="h-8 w-8 text-did-electric" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            Represent Your Organization
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Register your organization to issue verified certificates and credentials to your members
                        </p>
                        <Button variant="electric" size="lg">
                            <Plus className="h-5 w-5 mr-2" />
                            Register Organization
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}