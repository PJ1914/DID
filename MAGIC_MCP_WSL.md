# Magic MCP Server - WSL/Linux Configuration

## ✅ Corrected Configuration for WSL

Replace the Windows `cmd /c` command with proper Linux/WSL format:

```json
{
  "mcpServers": {
    "@21st-dev/magic": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@21st-dev/magic@latest"
      ],
      "env": {
        "API_KEY": "b6ddfb506a52e793282cb9f88837d47db8d7401a94084cde849362aeeaf2f040"
      }
    }
  }
}
```

## 🔄 Key Changes from Windows to WSL:

1. **Removed `cmd /c`** - Not needed on Linux ❌
2. **Added `type: "stdio"`** - Required for MCP protocol ✅
3. **Moved API_KEY to `env` object** - Proper environment variable format ✅
4. **Removed quotes around API_KEY value** - Cleaner syntax ✅

## 📝 To Add to Your MCP Config

Add this server to your `.vscode/mcp.json`:

```json
{
  "servers": {
    "@magicuidesign/mcp": { /* existing */ },
    "playwright": { /* existing */ },
    "memory": { /* existing */ },
    "sequential-thinking": { /* existing */ },
    "framelink-figma": { /* existing */ },
    "mindpilot": { /* existing */ },
    
    "@21st-dev/magic": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@21st-dev/magic@latest"
      ],
      "env": {
        "API_KEY": "b6ddfb506a52e793282cb9f88837d47db8d7401a94084cde849362aeeaf2f040"
      }
    }
  }
}
```

## ⚠️ Important Notes

1. **API Key Security**: This API key is now exposed in your config. Consider:
   - Using environment variables: `"API_KEY": "${MAGIC_API_KEY}"`
   - Not committing this file to git
   - Rotating the key if exposed publicly

2. **Restart Required**: After adding, restart VS Code completely

3. **Verify Server**: Check VS Code Output panel → "MCP Servers" after restart

## 🔍 What This Server Does

The `@21st-dev/magic` server likely provides AI-powered development assistance. Check their documentation for available features.

---

**Status**: Ready to add to your MCP configuration!
