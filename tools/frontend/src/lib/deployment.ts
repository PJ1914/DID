import rawConfig from '../../public/config/deployment.json';

export type DeploymentConfig = {
    network: {
        chainId: number;
        name: string;
    };
    deployer?: {
        address?: `0x${string}`;
    };
    core?: {
        verificationLogger?: `0x${string}`;
        trustScore?: `0x${string}`;
        identityRegistry?: `0x${string}`;
    };
    verification?: {
        manager?: `0x${string}`;
    };
    organizations?: {
        manager?: `0x${string}`;
    };
    zk?: {
        manager?: `0x${string}`;
        verifiers?: Record<string, `0x${string}` | undefined>;
    };
    meta?: {
        generatedAt?: number;
        note?: string;
    };
};

type RawDeployment = {
    network?: {
        chainId?: number;
        name?: string;
    };
    deployer?: {
        address?: string;
    };
    core?: {
        verificationLogger?: string;
        trustScore?: string;
        identityRegistry?: string;
    };
    verification?: {
        manager?: string;
    };
    organizations?: {
        manager?: string;
    };
    zk?: {
        manager?: string;
        verifiers?: Record<string, string | undefined>;
    };
    meta?: {
        generatedAt?: string | number;
        note?: string;
    };
};

const normalizeAddress = (value?: string | null): `0x${string}` | undefined => {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    return trimmed as `0x${string}`;
};

const coerceNumber = (value?: string | number | null): number | undefined => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
};

const raw = rawConfig as RawDeployment;

export const deploymentConfig: DeploymentConfig = {
    network: {
        chainId: raw.network?.chainId ?? 0,
        name: raw.network?.name ?? 'unknown'
    },
    deployer: {
        address: normalizeAddress(raw.deployer?.address)
    },
    core: {
        verificationLogger: normalizeAddress(raw.core?.verificationLogger),
        trustScore: normalizeAddress(raw.core?.trustScore),
        identityRegistry: normalizeAddress(raw.core?.identityRegistry)
    },
    verification: {
        manager: normalizeAddress(raw.verification?.manager)
    },
    organizations: {
        manager: normalizeAddress(raw.organizations?.manager)
    },
    zk: {
        manager: normalizeAddress(raw.zk?.manager),
        verifiers: Object.entries(raw.zk?.verifiers ?? {}).reduce<Record<string, `0x${string}` | undefined>>(
            (acc, [key, value]) => {
                acc[key] = normalizeAddress(value);
                return acc;
            },
            {}
        )
    },
    meta: {
        generatedAt: coerceNumber(raw.meta?.generatedAt),
        note: raw.meta?.note
    }
};

export const getVerifierAddress = (id: string): `0x${string}` | undefined => {
    return deploymentConfig.zk?.verifiers?.[id];
};

type CircuitFiles = {
    wasm: string;
    zkey: string;
    verificationKey: string;
};

export const parseCircuitFiles = (envValue?: string): Record<string, CircuitFiles> => {
    if (!envValue) return {};
    return envValue.split(';').reduce<Record<string, CircuitFiles>>((acc, entry) => {
        const [key, paths] = entry.split(':');
        if (!key || !paths) return acc;
        const [wasm, zkey, vkey] = paths.split(',');
        if (!wasm || !zkey || !vkey) return acc;
        acc[key] = {
            wasm: wasm.trim(),
            zkey: zkey.trim(),
            verificationKey: vkey.trim()
        };
        return acc;
    }, {});
};
