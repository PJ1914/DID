'use client'

import { MagneticCard } from '@/components/ui/magnetic-card'
import { Spotlight } from '@/components/ui/spotlight'
import AnimatedBackground from '@/components/ui/animated-background'
import { ScrollGradient } from '@/components/ui/scroll-gradient'
import { Shield, Users, Award, Lock, FileCheck, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { isConnected } = useAccount()
  const router = useRouter()

  const handleGetStarted = () => {
    if (isConnected) {
      router.push('/bc-cvs/dashboard')
    }
  }

  return (
    <>
      {/* Animated 3D Background */}
      <AnimatedBackground />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center z-10">
          <ScrollGradient>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-white/60">Blockchain Certificate Verification System</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Secure Certificate
                <br />
                Verification on Blockchain
              </h1>

              <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
                Tamper-proof educational certificate storage and instant verification with cryptographic signatures and Ethereum blockchain.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <>
                      <MagneticCard>
                        <button 
                          onClick={isConnected ? handleGetStarted : openConnectModal}
                          className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#9C40FF] text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-shadow"
                        >
                          {isConnected ? 'Go to Dashboard' : 'Login'}
                        </button>
                      </MagneticCard>

                      <MagneticCard>
                        <button 
                          onClick={() => router.push('/bc-cvs/auth/register')}
                          className="px-8 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-purple-500/30 text-white font-semibold hover:bg-white/10 hover:border-purple-400/50 transition-all"
                        >
                          Sign Up
                        </button>
                      </MagneticCard>
                    </>
                  )}
                </ConnectButton.Custom>
              </div>
            </motion.div>
          </ScrollGradient>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              System Architecture
            </h2>
            <p className="text-white/60 text-lg">
              Advanced features ensuring certificate authenticity and security
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Spotlight key={index}>
                <MagneticCard>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
                    className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 h-full"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-white/60">
                      {feature.description}
                    </p>
                  </motion.div>
                </MagneticCard>
              </Spotlight>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Technical Specifications
            </h2>
            <p className="text-white/60 text-lg">
              Built on enterprise-grade blockchain infrastructure
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Spotlight key={index}>
                <MagneticCard>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
                    className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-center"
                  >
                    <div className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-white/60">
                      {stat.label}
                    </div>
                  </motion.div>
                </MagneticCard>
              </Spotlight>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

const features = [
  {
    icon: <Shield className="w-6 h-6 text-purple-400" />,
    title: 'Non-Repudiation',
    description: 'Digital signature binding ensures certificates cannot be denied by the issuer.',
  },
  {
    icon: <Users className="w-6 h-6 text-purple-400" />,
    title: 'Consensus Validation',
    description: 'Multi-validator consensus mechanism for institutional registration and verification.',
  },
  {
    icon: <Award className="w-6 h-6 text-purple-400" />,
    title: 'Hash-Based Storage',
    description: 'Certificate hashes and RSA signatures stored immutably on Ethereum blockchain.',
  },
  {
    icon: <Lock className="w-6 h-6 text-purple-400" />,
    title: 'Attack Resistance',
    description: 'Layered cybersecurity controls with Sybil attack mitigation and smart contract security.',
  },
  {
    icon: <FileCheck className="w-6 h-6 text-purple-400" />,
    title: 'Bloom Filter Optimization',
    description: 'Fast certificate lookup and scalability with probabilistic data structure.',
  },
  {
    icon: <Globe className="w-6 h-6 text-purple-400" />,
    title: 'Revocation Framework',
    description: 'Secure certificate correction and revocation with complete audit trail.',
  },
]

const stats = [
  { value: 'Ethereum', label: 'Blockchain Network' },
  { value: 'RSA-2048', label: 'Digital Signature' },
  { value: 'SHA-256', label: 'Hash Algorithm' },
  { value: 'Bloom Filter', label: 'Lookup Optimization' },
]