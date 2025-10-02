import { env } from './env';

type UploadResult = {
    uri: string;
    previewUrl?: string;
};

const LOCAL_STORAGE_PREFIX = 'did-ipfs:';

const persistToLocalStorage = async (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${key}`, value);
    } catch (error) {
        console.warn('Unable to persist IPFS mock payload locally', error);
    }
};

export const uploadFileToIPFS = async (file: File): Promise<UploadResult> => {
    const reader = new FileReader();
    const buffer = await new Promise<string>((resolve, reject) => {
        reader.onerror = () => reject(reader.error);
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
    });

    const cid = crypto.randomUUID();
    await persistToLocalStorage(cid, buffer);

    const gateway = env.NEXT_PUBLIC_IPFS_GATEWAY?.replace(/\/$/, '') ?? '';
    const previewUrl = gateway ? `${gateway}/${cid}` : undefined;

    return {
        uri: `ipfs://${cid}`,
        previewUrl
    };
};

export const uploadJsonToIPFS = async <T extends Record<string, unknown>>(payload: T) => {
    const cid = crypto.randomUUID();
    await persistToLocalStorage(cid, JSON.stringify(payload));
    const gateway = env.NEXT_PUBLIC_IPFS_GATEWAY?.replace(/\/$/, '') ?? '';
    const previewUrl = gateway ? `${gateway}/${cid}` : undefined;
    return {
        uri: `ipfs://${cid}`,
        previewUrl
    };
};

export const resolveIpfsUri = (uri?: string | null) => {
    if (!uri) return undefined;
    if (!uri.startsWith('ipfs://')) return uri;
    const cid = uri.replace('ipfs://', '');
    const gateway = env.NEXT_PUBLIC_IPFS_GATEWAY?.replace(/\/$/, '') ?? '';
    return gateway ? `${gateway}/${cid}` : `ipfs://${cid}`;
};
