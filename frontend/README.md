# DID Platform FrontendThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



A modern, production-ready frontend for the Decentralized Identity (DID) platform built with Next.js 14, TypeScript, and cutting-edge Web3 technologies.## Getting Started



## 🎨 Design PhilosophyFirst, run the development server:



This frontend embodies a premium fintech/Web3 aesthetic inspired by:```bash

- **Keytome**: Clean financial institution aesthetic with smooth animationsnpm run dev

- **Axiom Protocol**: Technical blockchain feel with glassmorphism effects# or

- **Modern Web3 Patterns**: Crypto-native design language with trust indicatorsyarn dev

# or

## 🚀 Tech Stackpnpm dev

# or

### Core Frameworkbun dev

- **Next.js 14+** with App Router and Server Components```

- **TypeScript** (strict mode)

- **React 18+**Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.



### Blockchain IntegrationYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

- **wagmi** v2 for React hooks and wallet connections

- **viem** v2 for Ethereum interactionsThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

- **RainbowKit** for wallet connection UI

- **@tanstack/react-query** for caching blockchain data## Learn More



### Styling & UITo learn more about Next.js, take a look at the following resources:

- **Tailwind CSS** with custom design tokens

- **shadcn/ui** components (customized for brand)- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- **Magic UI** for premium animated components- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

- **Framer Motion** for animations

- **Radix UI** primitives for accessibilityYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!



## 📦 Quick Start## Deploy on Vercel



```bashThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

# Install dependencies

npm installCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# Set up environment variables
cp .env.local .env.local.example
# Edit .env.local with your contract addresses and API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🔧 Configuration

### Environment Variables

Update `.env.local` with your contract addresses:

```bash
# Contract Addresses (Sepolia)
NEXT_PUBLIC_IDENTITY_REGISTRY=0x...
NEXT_PUBLIC_TRUST_SCORE=0x...
# ... add all your deployed contract addresses

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# RPC URLs
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js pages
├── components/
│   ├── ui/                 # Base UI components
│   ├── web3/               # Web3 components
│   ├── features/           # Feature components
│   └── layout/             # Layout components
├── contracts/
│   ├── abis/               # Contract ABIs
│   └── addresses.ts        # Contract addresses
├── hooks/                  # Custom hooks
├── lib/                    # Utilities
└── types/                  # TypeScript types
```

## ✨ Features

### Current Features
- ✅ Web3 wallet integration (RainbowKit)
- ✅ Animated particle background
- ✅ Glassmorphism UI design
- ✅ Responsive navigation
- ✅ Dark mode optimized
- ✅ Magic UI components

### To Be Implemented
- [ ] Identity management page
- [ ] Verification center
- [ ] Organizations management
- [ ] Certificate issuance/viewing
- [ ] Account recovery system
- [ ] ZK proof interface

## 🎯 Next Steps

1. **Add Contract ABIs**: Copy ABIs from `../out/` to `src/contracts/abis/`
2. **Update Addresses**: Add deployed addresses to `.env.local`
3. **Implement Pages**: Build identity, verify, organizations, certificates pages
4. **Create Hooks**: Write contract interaction hooks
5. **Testing**: Add unit and E2E tests

## 🎨 Design System

### Colors
- **Primary**: `#00D4FF` (Electric Blue)
- **Secondary**: `#9C40FF` (Purple)
- **Background**: `#0A0B0D` (Deep Dark)

### Typography
- **Headings**: Space Grotesk
- **Body**: Inter

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run production build
npm run lint     # Run linter
```

## 📚 Documentation

For detailed documentation, see:
- [Features Documentation](../FEATURES.md)
- [Contract Analysis](../CONTRACT_ANALYSIS_GUIDE.md)
- [System Overview](../DOCUMENTATION.md)

---

**Built with ❤️ using Next.js, TypeScript, and Web3**
