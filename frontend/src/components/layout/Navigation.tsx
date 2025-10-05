"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { cn } from "@/lib/utils"
import { Shield, Home, Users, Award, FileCheck, Settings, Key } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Identity", href: "/identity", icon: Shield },
  { name: "Verify", href: "/verify", icon: FileCheck },
  { name: "Organizations", href: "/organizations", icon: Users },
  { name: "Certificates", href: "/certificates", icon: Award },
  { name: "Recovery", href: "/recovery", icon: Key },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#9C40FF]">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#9C40FF] bg-clip-text text-transparent">
              DID Platform
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Connect Wallet Button */}
          <ConnectButton />
        </div>
      </div>
    </nav>
  )
}
