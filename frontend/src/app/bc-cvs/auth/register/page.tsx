"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import {
  Mail,
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Building2,
  GraduationCap,
  Search,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const { register, verifyOTP, isLoading } = useAuth()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<string>("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"details" | "otp">("details")
  const [error, setError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)

  const validatePassword = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++
    setPasswordStrength(strength)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (passwordStrength < 3) {
      setError("Password is too weak. Use a stronger password.")
      return
    }

    if (!role) {
      setError("Please select a role")
      return
    }

    try {
      await register(email, password, role)
      setStep("otp")
    } catch (err: any) {
      setError(err.message || "Registration failed")
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

  const handleResendOTP = async () => {
    setError("")
    try {
      // Re-register to generate new OTP
      await register(email, password, role)
      setOtp("") // Clear the input
      alert("New OTP sent! Check browser console for the code.")
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP")
    }
  }

  const roleOptions = [
    {
      value: "institute",
      label: "Educational Institution",
      description: "Issue and manage certificates",
      icon: Building2,
    },
    {
      value: "student",
      label: "Student/Certificate Holder",
      description: "View and share your certificates",
      icon: GraduationCap,
    },
    {
      value: "verifier",
      label: "Employer/Verifier",
      description: "Verify certificate authenticity",
      icon: Search,
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80 pb-24">
      <div className="container px-4 py-8 mx-auto max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground">
              Join the Sajjan platform
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Register</CardTitle>
              <CardDescription>
                {step === "details"
                  ? "Fill in your details to get started"
                  : "Verify your email address"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === "details" && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select your role..." />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((option) => {
                          const Icon = option.icon
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                <div>
                                  <p className="font-medium">{option.label}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {option.description}
                                  </p>
                                </div>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

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
                      onChange={(e) => {
                        setPassword(e.target.value)
                        validatePassword(e.target.value)
                      }}
                      required
                      className="mt-2"
                    />
                    {password && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded ${
                                i < passwordStrength
                                  ? passwordStrength <= 2
                                    ? "bg-red-500"
                                    : passwordStrength <= 3
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                  : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Password strength:{" "}
                          {passwordStrength <= 2
                            ? "Weak"
                            : passwordStrength <= 3
                            ? "Medium"
                            : "Strong"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      By registering, you agree to connect your wallet for secure authentication
                    </AlertDescription>
                  </Alert>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
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
                      We've sent a 6-digit verification code to <strong>{email}</strong>
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
                      onClick={() => setStep("details")}
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
                          Verify & Create Account
                          <CheckCircle2 className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    Didn't receive the code?{" "}
                    <button 
                      type="button" 
                      onClick={handleResendOTP}
                      className="hover:underline font-semibold text-primary"
                    >
                      Resend
                    </button>
                  </p>
                </motion.form>
              )}

              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/bc-cvs/auth/login" className="font-semibold hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Password Requirements */}
          {step === "details" && (
            <Card className="mt-6">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3 text-sm">Password Requirements</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>✓ At least 8 characters long</p>
                  <p>✓ Mix of uppercase and lowercase letters</p>
                  <p>✓ At least one number</p>
                  <p>✓ At least one special character</p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}
