"use client"

import { motion } from "framer-motion"
import { Building2, GraduationCap, ShieldCheck, LogIn, UserPlus, LogOut } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

export default function BCCVSPage() {
  const { isAuthenticated, user, logout } = useAuth()
  const portals = [
    {
      title: "Institute Portal",
      description: "Issue certificates, manage validators, and monitor institutional activities",
      icon: Building2,
      href: "/bc-cvs/institute",
      color: "from-blue-500 to-cyan-500",
      features: [
        "Issue digital certificates",
        "Participate in validator voting",
        "Manage RSA key pairs",
        "Monitor certificate activity",
      ],
    },
    {
      title: "Student Portal",
      description: "View your certificates, share with employers, and track verification history",
      icon: GraduationCap,
      href: "/bc-cvs/student",
      color: "from-purple-500 to-pink-500",
      features: [
        "View all your certificates",
        "Share certificates securely",
        "Track verification history",
        "Download certificate proofs",
      ],
    },
    {
      title: "Verifier Portal",
      description: "Verify certificate authenticity in real-time with comprehensive audit trails",
      icon: ShieldCheck,
      href: "/bc-cvs/verifier",
      color: "from-green-500 to-emerald-500",
      features: [
        "Upload & verify certificates", "Real-time verification results",
        "Access audit trail logs",
        "Bulk certificate verification",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero Section */}
      <section className="container px-4 py-16 mx-auto">
        {/* Authentication Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-end gap-4 mb-8"
        >
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Logged in as <strong>{user?.role}</strong>
                </div>
                <Button onClick={logout} variant="outline">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link href="/bc-cvs/auth/login">
                <Button variant="outline">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
              <Link href="/bc-cvs/auth/register">
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register
                </Button>
              </Link>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-16"
        >
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Sajjan Portal
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Blockchain & Cybersecurity-Based Certificate Verification System
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            A decentralized, tamper-proof system for issuing, verifying, and managing educational
            certificates using SHA-256 hashing, RSA signatures, and blockchain technology.
          </p>
        </motion.div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {portals.map((portal, index) => {
            const Icon = portal.icon
            return (
              <motion.div
                key={portal.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={portal.href}>
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-primary/50">
                    <CardHeader>
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${portal.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl">{portal.title}</CardTitle>
                      <CardDescription className="text-base">
                        {portal.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {portal.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-primary mt-1">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-24 text-center space-y-8"
        >
          <h2 className="text-3xl font-bold">System Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                title: "SHA-256 Hashing",
                description: "Cryptographically secure certificate hashing",
              },
              {
                title: "RSA Signatures",
                description: "Digital signatures for authenticity verification",
              },
              {
                title: "Bloom Filter",
                description: "O(1) fast pre-verification with gas optimization",
              },
              {
                title: "100% Consensus",
                description: "Unanimous validator approval for institutional onboarding",
              },
            ].map((feature, index) => (
              <Card key={feature.title} className="text-center">
                <CardHeader>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  )
}
