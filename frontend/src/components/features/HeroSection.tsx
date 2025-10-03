'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Shield, Zap, Users, Award } from 'lucide-react'

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-did-dark via-slate-900 to-did-dark" />
            <div className="absolute inset-0 grid-bg opacity-20" />

            {/* Floating Elements */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-did-electric/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse floating" />

            <div className="relative z-10 container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Hero Title */}
                    <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
                        <span className="gradient-text">Decentralized</span>
                        <br />
                        <span className="text-white">Identity</span>
                        <br />
                        <span className="text-did-electric">Platform</span>
                    </h1>

                    {/* Hero Description */}
                    <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Build trust through verifiable credentials, zero-knowledge proofs, and
                        seamless Web3 identity management.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <ConnectButton.Custom>
                            {({ account, chain, openConnectModal, mounted }) => {
                                return (
                                    <Button
                                        onClick={openConnectModal}
                                        variant="electric"
                                        size="xl"
                                        className="animate-pulse-glow"
                                    >
                                        <Zap className="w-5 h-5 mr-2" />
                                        {account ? 'Connected' : 'Connect Wallet'}
                                    </Button>
                                )
                            }}
                        </ConnectButton.Custom>

                        <Button
                            variant="outline"
                            size="xl"
                            className="glass border-white/20 hover:bg-white/10"
                        >
                            <Shield className="w-5 h-5 mr-2" />
                            Learn More
                        </Button>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Card className="glass p-6 text-center border-white/10 hover:border-did-electric/30 transition-all duration-300">
                                <Shield className="w-12 h-12 text-did-electric mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">Secure Identity</h3>
                                <p className="text-gray-400">
                                    Register and manage your decentralized identity with blockchain security
                                </p>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <Card className="glass p-6 text-center border-white/10 hover:border-did-electric/30 transition-all duration-300">
                                <Users className="w-12 h-12 text-did-electric mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">Trust Network</h3>
                                <p className="text-gray-400">
                                    Build reputation through verified credentials and community trust
                                </p>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            <Card className="glass p-6 text-center border-white/10 hover:border-did-electric/30 transition-all duration-300">
                                <Award className="w-12 h-12 text-did-electric mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">Certificates</h3>
                                <p className="text-gray-400">
                                    Issue and manage verifiable certificates as NFTs
                                </p>
                            </Card>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}