#!/bin/bash

echo "🚀 Setting up DID Frontend..."

# Make sure we're in the frontend directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Extract contract addresses
echo "🔍 Extracting contract addresses..."
npm run extract-addresses

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp .env.local.template .env.local 2>/dev/null || echo "⚠️  Please create .env.local with your environment variables"
else
    echo "✅ Environment file exists"
fi

echo ""
echo "🎉 Setup complete! You can now run:"
echo "   npm run dev     - Start development server"
echo "   npm run build   - Build for production"
echo "   npm run lint    - Run linting"
echo ""
echo "📝 Make sure to:"
echo "   1. Update .env.local with your actual environment variables"
echo "   2. Deploy your smart contracts to generate address files"
echo "   3. Run 'npm run extract-addresses' after contract deployment"
echo ""