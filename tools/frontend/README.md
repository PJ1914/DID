# DID Control Center Frontend

This Vite + React app surfaces a minimal control plane for the DID protocol:

- Fetch the latest deployment addresses from `public/config/deployment.json`
- Connect a wallet on the configured network
- Lookup identities and view trust scores
- Inspect ZK verifier addresses

## Development

```bash
cd tools/frontend
npm install
npm run dev
```

The app assumes `VITE_PUBLIC_RPC_URL` is set in `.env` (see `env.example`).

## Production Build

```bash
npm run build
npm run preview
```

Deploy the contents of `dist/` to any static host. Update `public/config/deployment.json` when new contracts are deployed.
