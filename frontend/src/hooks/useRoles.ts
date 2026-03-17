"use client"

import { useAccount, useReadContract } from "wagmi"
import { getContractAddress } from "@/contracts/addresses"
import { CertificateHashRegistryABI } from "@/contracts/abis/bc-cvs"
import {
  ADMINISTRATOR,
  VALIDATOR_INSTITUTION,
  CERTIFICATE_ISSUER,
  CERTIFICATE_HOLDER,
  VERIFIER,
  BLOOM_FILTER_MANAGER,
} from "@/contracts/roles"
import { useAuth } from "@/contexts/AuthContext"

// Re-export for consumers that import ROLES from this hook
export const ROLES = {
  ADMINISTRATOR,
  VALIDATOR_INSTITUTION,
  CERTIFICATE_ISSUER,
  CERTIFICATE_HOLDER,
  VERIFIER,
  BLOOM_FILTER_MANAGER,
} as const

export function useRoles() {
  const { address, isConnected, chain } = useAccount()
  const { user } = useAuth()

  const chainId = (chain?.id || 11155111) as 11155111 | 31337 | 1337
  const registryAddress = getContractAddress(chainId, "certificateHashRegistry")

  // Only query once the wallet is connected and we have a valid 42-char address
  const queryEnabled =
    isConnected &&
    !!address &&
    !!registryAddress &&
    registryAddress.length === 42 &&
    registryAddress !== "0x0000000000000000000000000000000000000000"

  const { data: isAdmin, isPending: adminPending } = useReadContract({
    address: registryAddress as `0x${string}`,
    abi: CertificateHashRegistryABI,
    functionName: "hasRole",
    args: [ADMINISTRATOR, address!],
    query: { enabled: queryEnabled, staleTime: 0 },
  })

  const { data: isValidator, isPending: validatorPending } = useReadContract({
    address: registryAddress as `0x${string}`,
    abi: CertificateHashRegistryABI,
    functionName: "hasRole",
    args: [VALIDATOR_INSTITUTION, address!],
    query: { enabled: queryEnabled, staleTime: 0 },
  })

  const { data: isIssuer, isPending: issuerPending } = useReadContract({
    address: registryAddress as `0x${string}`,
    abi: CertificateHashRegistryABI,
    functionName: "hasRole",
    args: [CERTIFICATE_ISSUER, address!],
    query: { enabled: queryEnabled, staleTime: 0 },
  })

  const { data: isAuthorizedIssuer, isPending: authorizedIssuerPending } = useReadContract({
    address: registryAddress as `0x${string}`,
    abi: CertificateHashRegistryABI,
    functionName: "isAuthorizedIssuer",
    args: [address!],
    query: { enabled: queryEnabled, staleTime: 0 },
  })

  const { data: isHolder, isPending: holderPending } = useReadContract({
    address: registryAddress as `0x${string}`,
    abi: CertificateHashRegistryABI,
    functionName: "hasRole",
    args: [CERTIFICATE_HOLDER, address!],
    query: { enabled: queryEnabled, staleTime: 0 },
  })

  const { data: isVerifier, isPending: verifierPending } = useReadContract({
    address: registryAddress as `0x${string}`,
    abi: CertificateHashRegistryABI,
    functionName: "hasRole",
    args: [VERIFIER, address!],
    query: { enabled: queryEnabled, staleTime: 0 },
  })

  // True while any role query is still in flight (only relevant when wallet is connected)
  const isLoadingRoles =
    queryEnabled &&
    (adminPending || validatorPending || issuerPending || authorizedIssuerPending || holderPending || verifierPending)

  // Firestore role (set during registration, used as fallback before on-chain role is granted)
  const firestoreRole = user?.role
  const firestoreIsIssuer = firestoreRole === "institute"
  const firestoreIsHolder = firestoreRole === "student"
  const firestoreIsVerifier = firestoreRole === "verifier"

  // Combine on-chain role (ground truth for operations) with Firestore role (UI fallback)
  const admin = Boolean(isAdmin)
  const validator = Boolean(isValidator)
  const issuerOnChain = Boolean(isIssuer) && Boolean(isAuthorizedIssuer)
  const issuer = issuerOnChain || firestoreIsIssuer
  const holder = Boolean(isHolder) || firestoreIsHolder
  const verifier = Boolean(isVerifier) || firestoreIsVerifier

  return {
    address,
    isConnected,
    isLoadingRoles,
    isAdmin: admin,
    isValidator: validator,
    isIssuer: issuer,
    isIssuerOnChain: issuerOnChain,
    isHolder: holder,
    isVerifier: verifier,
    isInstitute: issuer || validator,
    isStudent: holder,
    hasAnyRole: admin || validator || issuer || holder || verifier,
  }
}
