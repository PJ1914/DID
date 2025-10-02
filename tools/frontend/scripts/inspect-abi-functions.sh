#!/bin/bash

# ABI Function Inspector
# Shows all available functions in each contract ABI

set -e

echo "🔍 Contract ABI Function Inspector"
echo "===================================="
echo ""

ABI_DIR="$(dirname "$0")/../src/lib/abis"

for file in "$ABI_DIR"/*.ts; do
    if [[ "$(basename "$file")" != "index.ts" ]]; then
        filename=$(basename "$file" .ts)
        echo "📄 $filename"
        echo "   Functions:"
        grep '"name":' "$file" | grep -v '"type":' | sed 's/.*"name": "\([^"]*\)".*/   - \1/' | sort -u
        echo ""
    fi
done

echo "✅ Use these exact function names in your hooks!"
echo ""
echo "Example usage in hooks:"
echo "  useReadContract({ functionName: 'getIdentity', ... })"
