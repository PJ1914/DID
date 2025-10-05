'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Particles } from '@/components/ui/particles'
import { GradientOrbs } from '@/components/ui/gradient-orbs'
import { NumberTicker } from '@/components/ui/number-ticker'
import { BorderBeam } from '@/components/ui/border-beam'
import { AnimatedCircularProgressBar } from '@/components/ui/animated-circular-progress-bar'
import { GlassCard } from '@/components/ui/glass-card'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { ParallaxScroll } from '@/components/ui/parallax-scroll'
import {
    User,
    Shield,
    Award,
    Users,
    TrendingUp,
    Plus,
    ExternalLink,
    Activity,
    Zap,
    CheckCircle2
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
                <div className="flex items-center justify-center min-h-screen relative bg-navy-950">
                    <Particles
                        className="absolute inset-0"
                        quantity={50}
                        color="#8B5CF6"
                        staticity={30}
                    />
                    <GlassCard blur="lg" className="w-full max-w-md relative z-10">
                        <BorderBeam
                            size={200}
                            duration={8}
                            colorFrom="#8B5CF6"
                            colorTo="#06B6D4"
                        />
                        <CardContent className="p-8 text-center">
                            <Shield className="h-16 w-16 text-purple-400 mx-auto mb-6 animate-pulse" />
                            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Connect Your Wallet
                            </h2>
                            <p className="text-gray-300 mb-6">
                                Connect your wallet to enter the decentralized identity ecosystem
                            </p>
                            <Button
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-500 text-white font-bold shadow-lg shadow-purple-500/50"
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                Connect Wallet
                            </Button>
                        </CardContent>
                    </GlassCard>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-8 relative bg-navy-950 min-h-screen">
                {/* Background Effects */}
                <Particles
                    className="absolute inset-0 opacity-30"
                    quantity={60}
                    color="#8B5CF6"
                    staticity={40}
                />
                <GradientOrbs />

                {/* Header with Sparkles Text */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 relative z-10">
                    <div>
                        <div className="mb-4">
                            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                                Dashboard
                            </h1>
                        </div>
                        <p className="text-gray-300 text-lg">
                            Your decentralized identity at a glance
                        </p>
                    </div>
                    <div className="flex gap-3 mt-6 md:mt-0">
                        <Button
                            variant="outline"
                            className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500 transition-all backdrop-blur-sm"
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Profile
                        </Button>
                        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                            <Plus className="h-4 w-4 mr-2" />
                            Quick Action
                        </Button>
                    </div>
                </div>

                {/* Main Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                    {/* Identity Overview - Large Card */}
                    <div className="lg:col-span-8 lg:row-span-2">
                        <div className="relative">
                            <IdentityCard address={address} />
                        </div>
                    </div>

                    {/* Trust Score - Tall Card */}
                    <GlassCard blur="md" className="lg:col-span-4 lg:row-span-2 relative overflow-hidden">
                        <BorderBeam
                            size={150}
                            duration={10}
                            colorFrom="#8B5CF6"
                            colorTo="#EC4899"
                            delay={2}
                        />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-400">
                                <TrendingUp className="h-5 w-5" />
                                Trust Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center space-y-6">
                            <div className="relative">
                                <AnimatedCircularProgressBar
                                    value={75}
                                    max={100}
                                    gaugePrimaryColor="#8B5CF6"
                                    gaugeSecondaryColor="rgba(255,255,255,0.1)"
                                    className="w-40 h-40"
                                />
                            </div>
                            <div className="text-center space-y-2">
                                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none shadow-lg">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Excellent
                                </Badge>
                                <p className="text-xs text-gray-400">
                                    <span className="text-purple-400 font-bold">+5</span> points this week
                                </p>
                            </div>
                        </CardContent>
                    </GlassCard>
                </div>

                {/* Stats Cards - Asymmetric Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-10">
                    <ScrollReveal delay={0} direction="up">
                        <GlassCard blur="md" hoverable className="relative overflow-hidden">
                            <BorderBeam size={100} duration={7} colorFrom="#06B6D4" colorTo="#8B5CF6" />
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-cyan-500/20 rounded-xl backdrop-blur-sm">
                                        <User className="h-6 w-6 text-cyan-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-300 mb-1">
                                            Verifications
                                        </p>
                                        <NumberTicker
                                            value={3}
                                            className="text-3xl font-black text-cyan-400"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </GlassCard>
                    </ScrollReveal>

                    <ScrollReveal delay={0.1} direction="up">
                        <GlassCard blur="md" hoverable className="relative overflow-hidden">
                            <BorderBeam size={100} duration={8} colorFrom="#10B981" colorTo="#06B6D4" delay={1} />
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-500/20 rounded-xl backdrop-blur-sm">
                                        <Award className="h-6 w-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-300 mb-1">
                                            Certificates
                                        </p>
                                        <NumberTicker
                                            value={2}
                                            className="text-3xl font-black text-emerald-400"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </GlassCard>
                    </ScrollReveal>

                    <ScrollReveal delay={0.2} direction="up">
                        <GlassCard blur="md" hoverable className="relative overflow-hidden">
                            <BorderBeam size={100} duration={9} colorFrom="#EC4899" colorTo="#8B5CF6" delay={2} />
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-pink-500/20 rounded-xl backdrop-blur-sm">
                                        <Users className="h-6 w-6 text-pink-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-300 mb-1">
                                            Guardians
                                        </p>
                                        <NumberTicker
                                            value={3}
                                            className="text-3xl font-black text-pink-400"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </GlassCard>
                    </ScrollReveal>

                    <ScrollReveal delay={0.3} direction="up">
                        <GlassCard blur="md" hoverable className="relative overflow-hidden">
                            <BorderBeam size={100} duration={6} colorFrom="#F59E0B" colorTo="#EC4899" delay={3} />
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-500/20 rounded-xl backdrop-blur-sm">
                                        <Activity className="h-6 w-6 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-300 mb-1">
                                            Activity
                                        </p>
                                        <NumberTicker
                                            value={12}
                                            className="text-3xl font-black text-amber-400"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </GlassCard>
                    </ScrollReveal>
                </div>

                {/* Recent Activity - Full Width */}
                <ScrollReveal delay={0.4} direction="up">
                    <GlassCard blur="md" className="relative overflow-hidden">
                        <BorderBeam size={200} duration={12} colorFrom="#8B5CF6" colorTo="#06B6D4" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-400">
                                <Activity className="h-5 w-5" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ActivityFeed limit={5} />
                            <Button
                                variant="outline"
                                className="w-full mt-6 border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500 transition-all backdrop-blur-sm"
                            >
                                View All Activity
                            </Button>
                        </CardContent>
                    </GlassCard>
                </ScrollReveal>
            </div>
        </MainLayout>
    )
}