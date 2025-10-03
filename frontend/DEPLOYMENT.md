# Deployment Guide

## Quick Start

To get your DID Platform frontend up and running quickly:

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update the contract addresses in `.env.local` with your deployed contracts.

3. **Update Contract Addresses**
   
   Edit `contracts/addresses.ts` with your actual deployed contract addresses:
   ```typescript
   export const CONTRACT_ADDRESSES = {
     11155111: { // Sepolia Testnet
       identityRegistry: '0xYourIdentityRegistryAddress',
       trustScore: '0xYourTrustScoreAddress',
       verificationManager: '0xYourVerificationManagerAddress',
       // ... add all your contract addresses
     }
   }
   ```

4. **Add Contract ABIs**
   
   Copy your contract ABIs to `contracts/abis/`:
   - `IdentityRegistry.json`
   - `TrustScore.json`
   - `VerificationManager.json`
   - `ZKProofManager.json`
   - `OrganizationManager.json`
   - `CertificateManager.json`
   - `AAWalletManager.json`
   - And others...

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Production Deployment

### Vercel Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Set Environment Variables in Vercel**
   - Go to your Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add all variables from `.env.example`

### Netlify Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Upload the `out` folder to Netlify
   - Or connect your GitHub repository

## Contract Integration Notes

The frontend expects the following contract structure and ABIs:

### Required Contract Functions

**IdentityRegistry:**
- `registerIdentity(address owner, string metadataURI)`
- `getIdentity(bytes32 identityId)`
- `resolveIdentity(address owner)`
- `updateMetadata(bytes32 identityId, string metadataURI)`
- `setIdentityStatus(bytes32 identityId, uint8 status)`

**TrustScore:**
- `getScore(bytes32 identityId)`
- `increaseScore(bytes32 identityId, uint256 amount, string reason)`
- `decreaseScore(bytes32 identityId, uint256 amount, string reason)`

**VerificationManager:**
- `registerProvider(address provider, string name, string metadataURI)`
- `recordVerification(bytes32 identityId, bytes32 templateId, string evidenceURI, uint64 expiresAt)`
- `setVerificationStatus(bytes32 verificationId, uint8 status)`

And so on for all contracts mentioned in your FEATURES.md.

## Testing the Integration

1. **Connect Wallet**: Use MetaMask or another Web3 wallet
2. **Check Network**: Ensure you're on the correct network (Sepolia for testing)
3. **Test Functions**: Try registering an identity, checking trust scores, etc.

## Troubleshooting

### Common Issues

1. **Contract Address Not Found**
   - Verify addresses in `contracts/addresses.ts`
   - Ensure you're on the correct network

2. **ABI Import Errors**
   - Make sure ABI files are in `contracts/abis/`
   - Verify JSON format is correct

3. **Transaction Failures**
   - Check gas limits
   - Verify contract permissions
   - Ensure wallet has sufficient funds

### Development Tips

- Use the browser console to debug Web3 interactions
- Check the Network tab for API calls
- Use React Developer Tools for component debugging
- Monitor the console for any TypeScript errors

## Next Steps

Once deployed, you can:
1. Test all workflows end-to-end
2. Add additional features
3. Customize the design
4. Integrate with your backend services
5. Set up analytics and monitoring

The frontend is designed to be production-ready with proper error handling, loading states, and responsive design.