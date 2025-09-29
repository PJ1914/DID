/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PUBLIC_RPC_URL: string;
    readonly VITE_DEFAULT_CHAIN_ID?: string;
    readonly VITE_DEFAULT_NETWORK_NAME?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
