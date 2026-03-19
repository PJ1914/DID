"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import {
  Mail,
  Lock,
  Shield,
  Wallet,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const { login, loginWithWallet, verifyOTP, isLoading } = useAuth()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"credentials" | "otp" | "wallet">("credentials")
  const [error, setError] = useState("")
  const [loginMethod, setLoginMethod] = useState<"email" | "wallet">("email")

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await login(email, password)
      setStep("otp")
    } catch (err: any) {
      setError(err.message || "Login failed")
    }
  }

  const handleWalletLogin = async () => {
    setError("")

    try {
      await loginWithWallet()
      router.push("/bc-cvs")
    } catch (err: any) {
      setError(err.message || "Wallet authentication failed")
    }
  }

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const success = await verifyOTP(otp)
      if (success) {
        router.push("/bc-cvs")
      } else {
        setError("Invalid OTP. Please try again.")
      }
    } catch (err: any) {
      setError(err.message || "OTP verification failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 py-8 mx-auto max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome to BC-CVS</h1>
            <p className="text-muted-foreground">
              Blockchain-based Certificate Verification System
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Choose your authentication method
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === "credentials" && (
                <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as "email" | "wallet")}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="email">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </TabsTrigger>
                    <TabsTrigger value="wallet">
                      <Wallet className="w-4 h-4 mr-2" />
                      Wallet
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="email">
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="mt-2"
                        />
                      </div>

                      {error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Signing In...
                          </>
                        ) : (
                          <>
                            Continue
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        <Link href="/bc-cvs/auth/forgot-password" className="hover:underline">
                          Forgot password?
                        </Link>
                      </p>
                    </form>
                  </TabsContent>

                  <TabsContent value="wallet">
                    <div className="space-y-4">
                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                          Sign a message with your wallet to authenticate securely
                        </AlertDescription>
                      </Alert>

                      {error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <Button
                        onClick={handleWalletLogin}
                        className="w-full"
                        size="lg"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Authenticating...
                          </>
                        ) : (
                          <>
                            <Wallet className="w-5 h-5 mr-2" />
                            Sign In with Wallet
                          </>
                        )}
                      </Button>

                      <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                        <p className="font-semibold">How it works:</p>
                        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                          <li>Connect your wallet</li>
                          <li>Sign the authentication message</li>
                          <li>Access your account securely</li>
                        </ol>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}

              {step === "otp" && (
                <motion.form
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onSubmit={handleOTPVerification}
                  className="space-y-4"
                >
                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription>
                      We've sent a 6-digit code to <strong>{email}</strong>
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength={6}
                      required
                      className="mt-2 text-center text-2xl tracking-widest"
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("credentials")}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading || otp.length !== 6}>
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify
                          <CheckCircle2 className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    Didn't receive the code?{" "}
                    <button type="button" className="hover:underline font-semibold">
                      Resend
                    </button>
                  </p>
                </motion.form>
              )}

              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/bc-cvs/auth/register" className="font-semibold hover:underline">
                    Register
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Features */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Secure Authentication
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Multi-factor authentication (MFA)</p>
                <p>✓ Wallet signature verification</p>
                <p>✓ End-to-end encryption</p>
                <p>✓ Session management</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
