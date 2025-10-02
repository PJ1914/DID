"use client";

import Safe, { EthersAdapter, SafeAccountConfig, SafeFactory } from '@safe-global/protocol-kit';
import { ethers } from 'ethers';

const STORAGE_NAMESPACE = 'did-smart-wallet';
const SALT_NAMESPACE = 'did-smart-wallet:v1';

type SmartWalletRecord = {
    owner: `0x${string}`;
    safeAddress: `0x${string}`;
    createdAt: number;
};

type StoredSmartWallets = Record<string, SmartWalletRecord>;

const readStorage = (): StoredSmartWallets => {
    if (typeof window === 'undefined') return {};
    try {
        const raw = window.localStorage.getItem(STORAGE_NAMESPACE);
        if (!raw) return {};
        return JSON.parse(raw) as StoredSmartWallets;
    } catch (error) {
        console.warn('Unable to read smart wallet cache', error);
        return {};
    }
};

const writeStorage = (record: SmartWalletRecord) => {
    if (typeof window === 'undefined') return;
    try {
        const state = readStorage();
        state[record.owner.toLowerCase()] = record;
        window.localStorage.setItem(STORAGE_NAMESPACE, JSON.stringify(state));
    } catch (error) {
        console.warn('Unable to persist smart wallet cache', error);
    }
};

const getCachedSmartWallet = (owner: `0x${string}`): `0x${string}` | null => {
    if (typeof window === 'undefined') return null;
    const state = readStorage();
    return state[owner.toLowerCase()]?.safeAddress ?? null;
};

const getEthereum = () => {
    if (typeof window === 'undefined') return undefined;
    return (window as typeof window & { ethereum?: unknown }).ethereum as any;
};

const createProvider = () => {
    const ethereum = getEthereum();
    if (!ethereum) throw new Error('No injected wallet provider available');
    return new ethers.providers.Web3Provider(ethereum);
};

const deriveSaltNonce = (owner: `0x${string}`) => {
    const hash = ethers.utils.keccak256(
        ethers.utils.solidityPack(['string', 'address'], [SALT_NAMESPACE, owner])
    );
    return ethers.BigNumber.from(hash).toString();
};

const buildSafeConfig = (owner: `0x${string}`): SafeAccountConfig => ({
    owners: [owner],
    threshold: 1
});

const createPredictionContext = async () => {
    const provider = createProvider();
    const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: provider });
    const safeFactory = await SafeFactory.create({ ethAdapter: ethAdapter as unknown as any });
    return { provider, safeFactory };
};

const createDeploymentContext = async () => {
    const provider = createProvider();
    const signer = provider.getSigner();
    const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer });
    const safeFactory = await SafeFactory.create({ ethAdapter: ethAdapter as unknown as any });
    return { provider, signer, safeFactory };
};

const cacheSmartWallet = (owner: `0x${string}`, safeAddress: `0x${string}`) => {
    writeStorage({ owner, safeAddress, createdAt: Date.now() });
};

export const resolveSmartWalletAddress = async (owner: `0x${string}`) => {
    const cached = getCachedSmartWallet(owner);
    if (cached) return cached;

    const { provider, safeFactory } = await createPredictionContext();
    const saltNonce = deriveSaltNonce(owner);
    const config = buildSafeConfig(owner);
    const predicted = (await safeFactory.predictSafeAddress(config, saltNonce)) as `0x${string}`;
    const code = await provider.getCode(predicted);
    if (code && code !== '0x') {
        cacheSmartWallet(owner, predicted);
        return predicted;
    }
    return null;
};

export const ensureSmartWallet = async (owner: `0x${string}`) => {
    const cached = getCachedSmartWallet(owner);
    if (cached) return cached;

    const { provider, safeFactory } = await createDeploymentContext();
    const saltNonce = deriveSaltNonce(owner);
    const config = buildSafeConfig(owner);
    const predicted = (await safeFactory.predictSafeAddress(config, saltNonce)) as `0x${string}`;
    const code = await provider.getCode(predicted);
    if (code && code !== '0x') {
        cacheSmartWallet(owner, predicted);
        return predicted;
    }

    const safeSdk = await safeFactory.deploySafe({ safeAccountConfig: config, saltNonce });
    const safeAddress = (await safeSdk.getAddress()) as `0x${string}`;
    cacheSmartWallet(owner, safeAddress);
    return safeAddress;
};

export const loadSmartWallet = async (safeAddress: `0x${string}`) => {
    const provider = createProvider();
    const signer = provider.getSigner();
    const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer });
    return await Safe.create({ ethAdapter: ethAdapter as unknown as any, safeAddress });
};

export const getStoredSmartWallet = (owner: `0x${string}`): `0x${string}` | null =>
    getCachedSmartWallet(owner);
