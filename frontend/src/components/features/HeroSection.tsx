'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Particles } from '@/components/ui/particles'
import { SparklesText } from '@/components/ui/sparkles-text'
import { HyperText } from '@/components/ui/hyper-text'
import { BorderBeam } from '@/components/ui/border-beam'
import { GradientOrbs } from '@/components/ui/gradient-orbs'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { ParallaxScroll } from '@/components/ui/parallax-scroll'
import { motion } from 'framer-motion'
import { Shield, Zap, Users, Award, Sparkles, Globe } from 'lucide-react'

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-navy-950">
            {/* Modern Background Effects */}
            <Particles
                className="absolute inset-0"
                quantity={80}
                color="#8B5CF6"
                staticity={50}
                ease={50}
            />
            <GradientOrbs />

            <div className="relative z-10 container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-5xl mx-auto"
                >
                    {/* Sparkles Hero Title */}
                    <div className="mb-8 flex items-center justify-center">
                        <SparklesText
                            className="text-6xl md:text-7xl lg:text-8xl font-black"
                            colors={{ first: '#8B5CF6', second: '#EC4899' }}
                            sparklesCount={12}
                        >
                            Decentralized Identity
                        </SparklesText>
                    </div>

                    {/* Subtitle with Animated Gradient */}
                    <motion.p
                        className="text-xl md:text-2xl mb-4 max-w-3xl mx-auto leading-relaxed text-gray-300"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        Build trust through verifiable credentials, zero-knowledge proofs, and
                        seamless Web3 identity management.
                    </motion.p>

                    <motion.div
                        className="flex items-center justify-center gap-2 text-purple-400 mb-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        <Sparkles className="w-5 h-5" />
                        <span className="text-sm font-medium">Powered by Blockchain Technology</span>
                        <Sparkles className="w-5 h-5" />
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                    >
                        <ConnectButton.Custom>
                            {({ account, chain, openConnectModal, mounted }) => {
                                return (
                                    <Button
                                        onClick={openConnectModal}
                                        size="lg"
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg shadow-purple-500/50 transition-all duration-500 text-lg px-8 py-6"
                                    >
                                        <Zap className="w-5 h-5 mr-2" />
                                        <HyperText className="inline-block" duration={800}>
                                            {account ? 'Connected' : 'Connect Wallet'}
                                        </HyperText>
                                    </Button>
                                )
                            }}
                        </ConnectButton.Custom>

                        <Button
                            size="lg"
                            className="border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 backdrop-blur-sm bg-transparent font-bold text-lg px-8 py-6"
                        >
                            <Globe className="w-5 h-5 mr-2" />
                            <HyperText className="inline-block" duration={800}>
                                Explore Platform
                            </HyperText>
                        </Button>
                    </motion.div>

                    {/* Feature Cards with Border Beams */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <ScrollReveal delay={0} direction="up">
                            <ParallaxScroll speed={0.3}>
                                <Card className="relative overflow-hidden glass p-8 text-center hover:scale-105 transition-all duration-300 border-white/10">
                                    <BorderBeam size={120} duration={8} colorFrom="#06B6D4" colorTo="#8B5CF6" />
                                    <Shield className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-white mb-3">Secure Identity</h3>
                                    <p className="text-gray-300">
                                        Register and manage your decentralized identity with blockchain security
                                    </p>
                                </Card>
                            </ParallaxScroll>
                        </ScrollReveal>

                        <ScrollReveal delay={0.2} direction="up">
                            <ParallaxScroll speed={0.5}>
                                <Card className="relative overflow-hidden glass p-8 text-center hover:scale-105 transition-all duration-300 border-white/10">
                                    <BorderBeam size={120} duration={10} colorFrom="#EC4899" colorTo="#8B5CF6" delay={2} />
                                    <Users className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-white mb-3">Trust Network</h3>
                                    <p className="text-gray-300">
                                        Build reputation through verified credentials and community trust
                                    </p>
                                </Card>
                            </ParallaxScroll>
                        </ScrollReveal>

                        <ScrollReveal delay={0.4} direction="up">
                            <ParallaxScroll speed={0.7}>
                                <Card className="relative overflow-hidden glass p-8 text-center hover:scale-105 transition-all duration-300 border-white/10">
                                    <BorderBeam size={120} duration={7} colorFrom="#10B981" colorTo="#06B6D4" delay={4} />
                                    <Award className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-white mb-3">Certificates</h3>
                                    <p className="text-gray-300">
                                        Issue and manage verifiable certificates as NFTs
                                    </p>
                                </Card>
                            </ParallaxScroll>
                        </ScrollReveal>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}