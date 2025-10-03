# DID Frontend

A modern, dark-themed frontend for the DID (Decentralized Identity) platform built with Next.js 14, TypeScript, and Web3 integration.

## 🚀 Quick Start

```bash
# Clone and navigate to frontend
cd frontend

# Run setup script (installs dependencies and extracts contract addresses)
./setup.sh

# Or manually:
npm install
npm run extract-addresses

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📦 Features

### Core Pages
- **Dashboard** - Identity overview, trust score, recent activity
- **Identity** - Profile management and verification status
- **Verification** - Multi-method verification center with ZK proofs
- **Organizations** - Organization membership and management
- **Certificates** - Digital certificate management and sharing
- **Recovery** - Account recovery with guardian system

### Key Features
- 🌙 **Dark-first Design** - Modern glassmorphism aesthetic
- 🔗 **Web3 Integration** - wagmi v2, RainbowKit, viem
- 📱 **Responsive Design** - Mobile-first approach
- ⚡ **Performance** - Next.js 14 App Router, optimized builds
- 🎨 **Design System** - shadcn/ui components with custom variants
- 🔐 **Type Safety** - Full TypeScript with strict mode

## 🛠 Tech Stack

### Core
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library

### Web3
- **wagmi v2** - React hooks for Ethereum
- **viem** - TypeScript Ethereum library
- **RainbowKit** - Wallet connection UI
- **@tanstack/react-query** - Data fetching and caching

### UI Components
- **Radix UI** - Primitive components
- **shadcn/ui** - Component library
- **Lucide React** - Icon library
- **class-variance-authority** - Component variants

### State Management
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## 🔧 Configuration

### Environment Variables (.env.local)

```env
# Web3 Configuration
NEXT_PUBLIC_ALCHEMY_API_KEY=F5gsff5z--PUD-jYszM8ErWKLSmCnmhh
NEXT_PUBLIC_ALCHEMY_POLICY_ID=5fb79c11-4062-46d2-be37-0473f2907c27
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=c3182eb9-d2dd-4fa9-86cb-a32bac8ade47

# IPFS Configuration
NEXT_PUBLIC_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=sepolia
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/F5gsff5z--PUD-jYszM8ErWKLSmCnmhh

# IPFS Gateway
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

### Contract Integration

Extract contract addresses from deployment files:

```bash
npm run extract-addresses
```

This reads from:
- `../deployments/deployment.11155111.json`
- `../broadcast/DeployAll.s.sol/11155111/`

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Extract Contract Addresses**:
   ```bash
   npm run extract-addresses
   ```

3. **Start Development**:
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── app/                    # Next.js pages
├── components/             # React components
│   ├── ui/                 # Base UI components
│   ├── web3/               # Web3 components
│   ├── features/           # Feature components
│   └── layout/             # Layout components
├── lib/                    # Utilities and config
│   ├── contracts/          # ABIs and addresses
│   ├── hooks/              # Custom hooks
│   └── utils/              # Utilities
└── styles/                 # Global styles
```

## 🎨 Design System

Built with dark-first aesthetic featuring:
- Electric cyan (#00d4ff) and cyber purple (#8b5cf6)
- Glassmorphism effects with subtle transparency
- shadcn/ui component library with custom variants
- Responsive design for all screen sizes

---

Built for the decentralized future 🚀