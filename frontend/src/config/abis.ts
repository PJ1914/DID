export const IDENTITY_REGISTRY_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"}
    ],
    "name": "getIdentity",
    "outputs": [
      {
        "components": [
          {"internalType": "bool", "name": "exists", "type": "bool"},
          {"internalType": "string", "name": "did", "type": "string"},
          {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
          {"internalType": "bool", "name": "isActive", "type": "bool"}
        ],
        "internalType": "struct IdentityRegistry.Identity",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "did", "type": "string"}
    ],
    "name": "registerIdentity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "string", "name": "key", "type": "string"},
      {"internalType": "string", "name": "value", "type": "string"}
    ],
    "name": "setMetadata",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "string", "name": "key", "type": "string"}
    ],
    "name": "getMetadata",
    "outputs": [
      {"internalType": "string", "name": "", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const VERIFICATION_MANAGER_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "uint8", "name": "verificationType", "type": "uint8"}
    ],
    "name": "isVerified",
    "outputs": [
      {"internalType": "bool", "name": "", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "uint8", "name": "verificationType", "type": "uint8"},
      {"internalType": "string", "name": "proofData", "type": "string"}
    ],
    "name": "submitVerification",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"}
    ],
    "name": "getVerificationStatus",
    "outputs": [
      {
        "components": [
          {"internalType": "bool", "name": "email", "type": "bool"},
          {"internalType": "bool", "name": "phone", "type": "bool"},
          {"internalType": "bool", "name": "identity", "type": "bool"},
          {"internalType": "bool", "name": "income", "type": "bool"},
          {"internalType": "bool", "name": "address", "type": "bool"}
        ],
        "internalType": "struct VerificationStatus",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const TRUST_SCORE_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"}
    ],
    "name": "getTrustScore",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "uint256", "name": "points", "type": "uint256"}
    ],
    "name": "increaseTrustScore",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const ORGANIZATION_MANAGER_ABI = [
  {
    "inputs": [],
    "name": "getAllOrganizations",
    "outputs": [
      {"internalType": "uint256[]", "name": "", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "orgId", "type": "uint256"}
    ],
    "name": "getOrganization",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "string", "name": "orgType", "type": "string"},
          {"internalType": "address", "name": "admin", "type": "address"},
          {"internalType": "bool", "name": "verified", "type": "bool"},
          {"internalType": "uint256", "name": "memberCount", "type": "uint256"},
          {"internalType": "uint256", "name": "createdAt", "type": "uint256"}
        ],
        "internalType": "struct Organization",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "orgType", "type": "string"}
    ],
    "name": "createOrganization",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "orgId", "type": "uint256"}
    ],
    "name": "joinOrganization",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const CERTIFICATE_MANAGER_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"}
    ],
    "name": "getUserCertificates",
    "outputs": [
      {"internalType": "uint256[]", "name": "", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "certId", "type": "uint256"}
    ],
    "name": "getCertificate",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "title", "type": "string"},
          {"internalType": "address", "name": "issuer", "type": "address"},
          {"internalType": "address", "name": "recipient", "type": "address"},
          {"internalType": "uint256", "name": "issueDate", "type": "uint256"},
          {"internalType": "bool", "name": "verified", "type": "bool"},
          {"internalType": "string", "name": "metadataURI", "type": "string"}
        ],
        "internalType": "struct Certificate",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "recipient", "type": "address"},
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "metadataURI", "type": "string"}
    ],
    "name": "issueCertificate",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// Verification types enum
export enum VerificationType {
  EMAIL = 0,
  PHONE = 1,
  IDENTITY = 2,
  INCOME = 3,
  ADDRESS = 4,
}
